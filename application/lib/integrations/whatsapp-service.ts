/**
 * VARNI HOLIDAYS - Meta WhatsApp Cloud API Service & Fallback Click-to-Chat Adapter
 * Adheres strictly to audit rules:
 * - Real Cloud API calls track delivery states (RECORD_CREATED -> SEND_INITIATED -> PROVIDER_ACCEPTED -> DELIVERED)
 * - Click-to-chat interactions are strictly logged as 'CLICK_TO_CHAT_TRIGGERED', never falsely 'DELIVERED'.
 */

import { UpdateCategory } from '../crm/types';

export interface WhatsAppSendOptions {
  phoneNumber: string; // E.164 formatted or raw digits
  countryCode?: string;
  recipientName: string;
  category: UpdateCategory;
  messageText: string;
  templateName?: string;
  templateParams?: string[];
}

export interface WhatsAppDispatchResult {
  success: boolean;
  messageId: string;
  deliveryStatus: 'PROVIDER_ACCEPTED' | 'CLICK_TO_CHAT_TRIGGERED' | 'FAILED';
  recipientPhone: string;
  clickToChatUrl?: string;
  dispatchedAt: string;
  error?: string;
}

/**
 * Normalizes phone number into international digits without leading '+' or special chars
 */
export function normalizeWhatsAppNumber(phone: string, countryCode: string = '+91'): string {
  const cleanDigits = phone.replace(/\D/g, '');
  const cleanCode = countryCode.replace(/\D/g, '');

  if (cleanDigits.startsWith(cleanCode)) {
    return cleanDigits;
  }
  return `${cleanCode}${cleanDigits}`;
}

/**
 * Generates an official WhatsApp Click-to-Chat URL
 */
export function buildClickToChatUrl(phone: string, countryCode: string = '+91', text: string): string {
  const normalizedPhone = normalizeWhatsAppNumber(phone, countryCode);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}

/**
 * Dispatches via Meta WhatsApp Cloud API if configured; otherwise generates a Click-to-Chat trigger
 */
export async function sendCustomerWhatsApp(options: WhatsAppSendOptions): Promise<WhatsAppDispatchResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const now = new Date().toISOString();
  const normalizedRecipient = normalizeWhatsAppNumber(options.phoneNumber, options.countryCode);

  // If Meta WhatsApp Cloud API is configured
  if (token && phoneNumberId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedRecipient,
          type: 'text',
          text: {
            preview_url: false,
            body: options.messageText,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[WhatsApp Cloud API Error]', response.status, errText);
        return {
          success: false,
          messageId: `wa_err_${Date.now()}`,
          deliveryStatus: 'FAILED',
          recipientPhone: normalizedRecipient,
          dispatchedAt: now,
          error: `Meta Cloud API error: ${response.statusText} (${errText})`,
        };
      }

      const resData = await response.json();
      const messageId = resData.messages?.[0]?.id || `wa_msg_${Date.now()}`;

      return {
        success: true,
        messageId,
        deliveryStatus: 'PROVIDER_ACCEPTED',
        recipientPhone: normalizedRecipient,
        dispatchedAt: now,
      };
    } catch (err: any) {
      console.error('[WhatsApp Cloud API Exception]', err);
      return {
        success: false,
        messageId: `wa_exc_${Date.now()}`,
        deliveryStatus: 'FAILED',
        recipientPhone: normalizedRecipient,
        dispatchedAt: now,
        error: err.message,
      };
    }
  }

  // Cloud API not configured -> Fallback to Click-to-Chat adapter
  // STRICT COMPLIANCE: Must record delivery status as CLICK_TO_CHAT_TRIGGERED
  const clickToChatUrl = buildClickToChatUrl(options.phoneNumber, options.countryCode, options.messageText);
  const clickId = `wa_c2c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  console.log(`[WhatsApp Click-to-Chat Generated] Recipient: ${normalizedRecipient} | URL: ${clickToChatUrl}`);

  return {
    success: true,
    messageId: clickId,
    deliveryStatus: 'CLICK_TO_CHAT_TRIGGERED',
    recipientPhone: normalizedRecipient,
    clickToChatUrl,
    dispatchedAt: now,
  };
}

