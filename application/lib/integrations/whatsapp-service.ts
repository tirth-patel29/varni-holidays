/**
 * VARNI HOLIDAYS - Meta WhatsApp Cloud API Service & Fallback Click-to-Chat Adapter
 * Adheres strictly to audit rules:
 * - Real Cloud API calls track delivery states (RECORD_CREATED -> SEND_INITIATED -> PROVIDER_ACCEPTED -> DELIVERED)
 * - Click-to-chat interactions are strictly logged as 'CLICK_TO_CHAT_TRIGGERED', never falsely 'DELIVERED'.
 */

import { UpdateCategory } from '../crm/types';
import { COMPANY_CONTACT } from '../config/contact';
import { BotQuickButton, BotListSection } from '../whatsapp/types';

export interface WhatsAppSendOptions {
  phoneNumber: string; // E.164 formatted or raw digits
  countryCode?: string;
  recipientName: string;
  category: UpdateCategory;
  messageText: string;
  templateName?: string;
  templateParams?: string[];
  buttons?: BotQuickButton[];
  list?: {
    buttonText: string;
    title?: string;
    sections: BotListSection[];
  };
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
 * Generates the official Varni Holidays company WhatsApp Click-to-Chat URL
 */
export function getCompanyWhatsAppUrl(message?: string): string {
  return COMPANY_CONTACT.whatsapp.buildUrl(message);
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
  const token = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const now = new Date().toISOString();
  const normalizedRecipient = normalizeWhatsAppNumber(options.phoneNumber, options.countryCode);

  // If Meta WhatsApp Cloud API is configured
  if (token && phoneNumberId) {
    try {
      let payload: Record<string, any>;

      if (options.list && options.list.sections && options.list.sections.length > 0) {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedRecipient,
          type: 'interactive',
          interactive: {
            type: 'list',
            ...(options.list.title ? { header: { type: 'text', text: options.list.title.slice(0, 60) } } : {}),
            body: {
              text: options.messageText.slice(0, 1024),
            },
            footer: {
              text: 'Varni Holidays • Anand',
            },
            action: {
              button: (options.list.buttonText || 'Choose Option').slice(0, 20),
              sections: options.list.sections.map((sec) => ({
                title: sec.title.slice(0, 24),
                rows: sec.rows.slice(0, 10).map((r) => ({
                  id: r.id.slice(0, 200),
                  title: r.title.slice(0, 24),
                  ...(r.description ? { description: r.description.slice(0, 72) } : {}),
                })),
              })),
            },
          },
        };
      } else if (options.buttons && options.buttons.length > 0) {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedRecipient,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: options.messageText.slice(0, 1024),
            },
            footer: {
              text: 'Varni Holidays • Anand',
            },
            action: {
              buttons: options.buttons.slice(0, 3).map((b) => ({
                type: 'reply',
                reply: {
                  id: b.id.slice(0, 256),
                  title: b.title.slice(0, 20),
                },
              })),
            },
          },
        };
      } else {
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedRecipient,
          type: 'text',
          text: {
            preview_url: false,
            body: options.messageText,
          },
        };
      }

      let response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // If interactive dispatch fails, immediately fallback to clean text message
      if (!response.ok && payload.type === 'interactive') {
        const interactiveErr = await response.text();
        console.warn('[WhatsApp Cloud API] Interactive send rejected, falling back to text:', interactiveErr);
        response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
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
      }

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

