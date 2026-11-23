import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { validatePhoneNumber } from '@/lib/validation/phone';
import { createOrUpdateInboxConversationForLead } from '@/lib/crm/unified-crm-service';

export const dynamic = 'force-dynamic';

/**
 * Meta Webhook Verification (GET)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'varni_meta_webhook_secret_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Meta Webhook]: Verified subscription challenge successfully.');
    return new Response(challenge, { status: 200 });
  }

  console.warn('[Meta Webhook]: Verification failed. Token mismatch.');
  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * Meta Webhook Inbound Events & Messages (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const appSecret = process.env.META_APP_SECRET;

    // 1. Signature Verification (HMAC-SHA256)
    if (appSecret) {
      const signature = req.headers.get('x-hub-signature-256');
      if (!signature) {
        return NextResponse.json({ error: 'Missing x-hub-signature-256' }, { status: 401 });
      }

      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex')}`;

      if (signature !== expectedSignature) {
        console.error('[Meta Webhook]: Invalid signature.');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Meta sends entries
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0]?.value;

    if (!change) {
      return NextResponse.json({ status: 'ignored_empty_payload' });
    }

    // 2. Handle Message Delivery Statuses (Sent, Delivered, Read)
    if (change.statuses?.length > 0) {
      const statusObj = change.statuses[0];
      const wamid = statusObj.id;
      const statusStr = statusObj.status?.toUpperCase(); // "SENT", "DELIVERED", "READ", "FAILED"

      if (wamid) {
        await prisma.inboxMessage.updateMany({
          where: { providerMessageId: wamid },
          data: {
            status: statusStr === 'DELIVERED' ? 'DELIVERED' : statusStr === 'READ' ? 'READ' : statusStr === 'FAILED' ? 'FAILED' : 'SENT',
          },
        });
      }

      return NextResponse.json({ status: 'status_processed' });
    }

    // 3. Handle Inbound Customer Messages
    if (change.messages?.length > 0) {
      const message = change.messages[0];
      const metaMessageId = message.id; // e.g. wamid.HBg...

      // Idempotency: prevent duplicate processing
      const existing = await prisma.inboxMessage.findUnique({
        where: { providerMessageId: metaMessageId },
      });
      if (existing) {
        return NextResponse.json({ status: 'already_processed', messageId: metaMessageId });
      }

      const senderPhone = message.from; // e.g. "919898012345"
      const contactProfile = change.contacts?.[0]?.profile?.name || 'WhatsApp Customer';

      let textContent = '';
      if (message.type === 'text') {
        textContent = message.text?.body || '';
      } else if (message.type === 'interactive') {
        textContent = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || 'Interactive response';
      } else if (message.type === 'button') {
        textContent = message.button?.text || 'Button click';
      } else {
        textContent = `[${message.type || 'Media'} received]`;
      }

      // Format & Normalize Phone
      const phoneValidation = validatePhoneNumber('+91', senderPhone);
      const normalizedPhone = phoneValidation.isValid && phoneValidation.normalized
        ? phoneValidation.normalized
        : senderPhone.replace(/\D/g, '');

      // Identify or Create Customer
      let customer = await prisma.customer.findFirst({
        where: {
          isDeleted: false,
          normalizedPhone: { contains: normalizedPhone.slice(-10) },
        },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            fullName: contactProfile,
            phoneCountryCode: '+91',
            phoneNumber: senderPhone.slice(-10),
            normalizedPhone,
            marketingConsent: true,
            preferredChannel: 'WHATSAPP',
          },
        });
      }

      // Find or Create Inbox Conversation
      let conversation = await prisma.inboxConversation.findFirst({
        where: {
          channel: 'WHATSAPP',
          senderIdentity: senderPhone,
        },
      });

      if (!conversation) {
        // Create an associated Lead
        const referenceId = `FLT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const lead = await prisma.lead.create({
          data: {
            referenceId,
            serviceType: 'GENERAL',
            stage: 'NEW',
            priorityLevel: 'MEDIUM',
            source: 'WHATSAPP',
            customerId: customer.id,
            title: `WhatsApp Enquiry - ${contactProfile}`,
            description: textContent,
          },
        });

        conversation = await prisma.inboxConversation.create({
          data: {
            channel: 'WHATSAPP',
            externalThreadId: metaMessageId,
            senderIdentity: senderPhone,
            senderName: contactProfile,
            subject: `WhatsApp Enquiry - ${contactProfile}`,
            status: 'NEW',
            priority: 'MEDIUM',
            customerId: customer.id,
            leadId: lead.id,
            unreadCount: 1,
            lastMessageAt: new Date(),
            lastMessageSnippet: textContent,
          },
        });
      } else {
        conversation = await prisma.inboxConversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(),
            lastMessageSnippet: textContent,
            unreadCount: { increment: 1 },
            status: conversation.status === 'RESOLVED' ? 'NEW' : conversation.status,
          },
        });
      }

      // Insert Inbound Inbox Message
      await prisma.inboxMessage.create({
        data: {
          conversationId: conversation.id,
          direction: 'INBOUND',
          senderType: 'CUSTOMER',
          senderId: senderPhone,
          senderName: contactProfile,
          messageType: message.type || 'text',
          content: textContent,
          providerMessageId: metaMessageId,
          status: 'DELIVERED',
        },
      });

      // Also record in WhatsAppWebhookEvent for audit log & idempotency
      try {
        await prisma.whatsAppWebhookEvent.create({
          data: {
            metaEventId: metaMessageId,
            eventType: 'message',
            fromPhone: senderPhone,
            payload: message,
            processed: true,
            processedAt: new Date(),
          },
        });
      } catch {}

      return NextResponse.json({ status: 'success', conversationId: conversation.id });
    }

    return NextResponse.json({ status: 'event_received' });
  } catch (err: any) {
    console.error('[Meta Webhook Processing Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal processing error' }, { status: 500 });
  }
}
