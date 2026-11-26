import { NextRequest, NextResponse } from 'next/server';
import { processIncomingWhatsAppMessage } from '@/lib/whatsapp/bot-engine';
import { BotIncomingMessage } from '@/lib/whatsapp/types';
import { sendCustomerWhatsApp } from '@/lib/integrations/whatsapp-service';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'varni_webhook_verification_token_2026';

/**
 * Meta WhatsApp Cloud API Webhook Verification (GET)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verification successful');
    return new Response(challenge, { status: 200 });
  }

  console.warn('[WhatsApp Webhook] Verification failed: token mismatch');
  return new Response('Forbidden', { status: 403 });
}

/**
 * Meta WhatsApp Cloud API Inbound Message Handler (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[WhatsApp Webhook Inbound Body]:', JSON.stringify(body));

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'IGNORED' }, { status: 200 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const val = change.value;
        if (!val || !val.messages) continue;

        const contact = val.contacts?.[0];
        const senderName = contact?.profile?.name;

        for (const rawMsg of val.messages) {
          const fromPhone = rawMsg.from;
          const messageId = rawMsg.id || `msg_${Date.now()}`;
          const timestamp = Number(rawMsg.timestamp) * 1000 || Date.now();

          let text: string | undefined = undefined;
          let interactiveType: 'button_reply' | 'list_reply' | undefined = undefined;
          let buttonId: string | undefined = undefined;
          let buttonTitle: string | undefined = undefined;
          let listId: string | undefined = undefined;
          let listTitle: string | undefined = undefined;

          if (rawMsg.type === 'text') {
            text = rawMsg.text?.body;
          } else if (rawMsg.type === 'interactive') {
            interactiveType = rawMsg.interactive?.type;
            if (interactiveType === 'button_reply') {
              buttonId = rawMsg.interactive?.button_reply?.id;
              buttonTitle = rawMsg.interactive?.button_reply?.title;
              text = buttonTitle;
            } else if (interactiveType === 'list_reply') {
              listId = rawMsg.interactive?.list_reply?.id;
              listTitle = rawMsg.interactive?.list_reply?.title;
              text = listTitle;
            }
          }

          const incomingMsg: BotIncomingMessage = {
            fromPhone,
            senderName,
            messageId,
            text,
            interactiveType,
            buttonId,
            buttonTitle,
            listId,
            listTitle,
            timestamp,
          };

          // Process message through conversational bot engine
          console.log('[WhatsApp Webhook] Processing msg from:', fromPhone, 'Text:', text, 'RawType:', rawMsg.type);
          const result = await processIncomingWhatsAppMessage(incomingMsg);
          console.log('[WhatsApp Webhook] Bot reply generated:', result.reply?.text?.slice(0, 80));

          // Dispatch reply back via WhatsApp Cloud API
          if (result.reply && result.reply.text) {
            const dispatchRes = await sendCustomerWhatsApp({
              phoneNumber: fromPhone,
              recipientName: senderName || 'Valued Traveler',
              category: 'WELCOME',
              messageText: result.reply.text,
              buttons: result.reply.buttons,
              list: result.reply.list,
            }).catch((err) => console.error('[WhatsApp Webhook] Dispatch error:', err));
            console.log('[WhatsApp Webhook] Dispatch result:', dispatchRes);
          }
        }
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (err: any) {
    console.error('[WhatsApp Webhook] Error handling incoming payload:', err);
    return NextResponse.json({ status: 'ERROR', error: err.message }, { status: 500 });
  }
}

