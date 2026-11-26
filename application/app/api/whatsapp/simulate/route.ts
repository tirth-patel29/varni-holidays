import { NextRequest, NextResponse } from 'next/server';
import { processIncomingWhatsAppMessage } from '@/lib/whatsapp/bot-engine';
import { BotIncomingMessage } from '@/lib/whatsapp/types';
import { waSessionStore } from '@/lib/whatsapp/session-store';

/**
 * WhatsApp Simulator API
 * Allows testing full conversational booking and notification flows
 * directly from the employee workspace or developer scripts without Meta API keys.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = (body.phone || '919876543210').replace(/\D/g, '');
    const senderName = body.senderName || 'Valued Traveler';
    const text = body.text || '';
    const actionId = body.actionId;

    if (body.resetSession) {
      const reset = waSessionStore.resetSession(phone, false);
      return NextResponse.json({
        success: true,
        message: 'Session reset',
        session: reset,
      });
    }

    const incomingMsg: BotIncomingMessage = {
      fromPhone: phone,
      senderName,
      messageId: `sim_${Date.now()}`,
      text: text,
      buttonId: actionId,
      timestamp: Date.now(),
    };

    const result = await processIncomingWhatsAppMessage(incomingMsg);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      actionTaken: result.actionTaken,
      leadReferenceId: result.leadReferenceId,
      bookingReferenceId: result.bookingReferenceId,
      sessionState: result.sessionState,
    });
  } catch (err: any) {
    console.error('[WhatsApp Simulate Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Simulation failed' },
      { status: 500 }
    );
  }
}

