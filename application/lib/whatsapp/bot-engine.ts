/**
 * VARNI HOLIDAYS - WhatsApp Conversational Bot Engine
 * Central dispatcher that receives incoming messages, manages user session state,
 * routes intents across domain flows, and returns responses.
 */

import {
  BotIncomingMessage,
  BotOutgoingMessage,
  BotProcessingResult,
  WhatsAppSessionData,
} from './types';
import { waSessionStore } from './session-store';
import { handlePackageFlow } from './flows/package';
import { handleFlightFlow } from './flows/flight';
import { handleVisaFlow } from './flows/visa';
import { handleStatusFlow } from './flows/status';
import { handleFaqFlow } from './flows/faq';

export async function processIncomingWhatsAppMessage(
  msg: BotIncomingMessage
): Promise<BotProcessingResult> {
  const cleanPhone = msg.fromPhone.replace(/\D/g, '');
  const session = waSessionStore.getSession(cleanPhone);

  if (msg.senderName && !session.customerName) {
    session.customerName = msg.senderName;
  }

  const rawText = msg.text || msg.buttonTitle || msg.listTitle || '';
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const actionId = msg.buttonId || msg.listId;

  // 1. Check for Global Reset Commands
  if (
    lower === 'menu' ||
    lower === 'main menu' ||
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower === 'start' ||
    lower === 'restart' ||
    actionId === 'btn_menu'
  ) {
    session.flow = 'IDLE';
    session.step = 'START';
    session.data = {};
    return getMainGreeting(session);
  }

  // 2. If already in an active multi-step flow, route directly
  if (session.flow === 'PACKAGE_BOOKING') {
    return await handlePackageFlow(session, text, actionId);
  }
  if (session.flow === 'FLIGHT_BOOKING') {
    return await handleFlightFlow(session, text, actionId);
  }
  if (session.flow === 'VISA_ENQUIRY') {
    return await handleVisaFlow(session, text, actionId);
  }
  if (session.flow === 'TRACK_STATUS') {
    return await handleStatusFlow(session, text);
  }
  if (session.flow === 'FAQ_HELP') {
    return await handleFaqFlow(session, text);
  }

  // 3. In IDLE state: Classify user intent or numbered selection

  // Priority A: Human Agent / Urgent Callback / Office Information
  if (
    actionId === 'menu_agent' ||
    lower === '5' ||
    lower.includes('call') ||
    lower.includes('callback') ||
    lower.includes('agent') ||
    lower.includes('human') ||
    lower.includes('speak') ||
    lower.includes('talk') ||
    lower.includes('office') ||
    lower.includes('address') ||
    lower.includes('location') ||
    lower.includes('bank') ||
    lower.includes('remittance')
  ) {
    session.flow = 'FAQ_HELP';
    session.step = 'START';
    return await handleFaqFlow(session, text);
  }

  // Priority B: Live Status Tracking (Reference codes or tracking keywords)
  if (
    actionId === 'menu_status' ||
    lower === '4' ||
    lower.includes('status') ||
    lower.includes('track') ||
    /^(?:PKG|FLT|VIS|HOL|INS)-\d{8}-\d{4}$/i.test(text) ||
    /^VH-BKG-\d{6}-\d{4}$/i.test(text) ||
    /^VH-QUO-\d{6}-\d{4}$/i.test(text)
  ) {
    session.flow = 'TRACK_STATUS';
    session.step = 'START';
    return await handleStatusFlow(session, text);
  }

  // Priority C: Flight Booking & Enquiries
  if (
    actionId === 'menu_flight' ||
    lower === '2' ||
    lower.includes('flight') ||
    lower.includes('ticket') ||
    lower.includes('airline') ||
    lower.includes('airfare')
  ) {
    session.flow = 'FLIGHT_BOOKING';
    session.step = 'START';
    return await handleFlightFlow(session, text, actionId);
  }

  // Priority D: Visa Assistance
  if (
    actionId === 'menu_visa' ||
    lower === '3' ||
    lower.includes('visa') ||
    lower.includes('schengen') ||
    lower.includes('passport')
  ) {
    session.flow = 'VISA_ENQUIRY';
    session.step = 'START';
    return await handleVisaFlow(session, text, actionId);
  }

  // Priority E: Tour Packages & Holiday Bookings
  if (
    actionId === 'menu_package' ||
    lower === '1' ||
    lower.includes('package') ||
    lower.includes('tour') ||
    lower.includes('kerala') ||
    lower.includes('holiday') ||
    lower.includes('vacation') ||
    lower.includes('trip') ||
    lower.includes('hotel')
  ) {
    session.flow = 'PACKAGE_BOOKING';
    session.step = 'START';
    return await handlePackageFlow(session, text, actionId);
  }

  // 4. Fallback: Show Main Greeting
  return getMainGreeting(session);
}

function getMainGreeting(session: WhatsAppSessionData): BotProcessingResult {
  const customerGreeting = session.customerName ? ` *${session.customerName}*` : '';
  const greetingText =
`🌴 *NAMASTE & WELCOME TO VARNI HOLIDAYS!*
_Your Gateway to Joyful Holidays_ ✈️
📍 *Anand, Gujarat*

Hello${customerGreeting}! Please tap the button below to browse all our travel desks and services:`;

  const reply: BotOutgoingMessage = {
    toPhone: session.phone,
    text: greetingText,
    list: {
      buttonText: 'Browse Services 🧭',
      title: 'Varni Holidays Desk',
      sections: [
        {
          title: '🏖️ Holiday Packages',
          rows: [
            {
              id: 'menu_package',
              title: 'Kerala Tour Packages',
              description: '6N/7D Grand & 5N/6D Classic Tours',
            },
            {
              id: 'pkg_rajasthan',
              title: 'Rajasthan Royal Tour',
              description: '5N/6D Forts, Palaces & Desert Stays',
            },
            {
              id: 'pkg_kashmir',
              title: 'Kashmir Paradise Tour',
              description: 'Srinagar, Gulmarg & Pahalgam Escapes',
            },
          ],
        },
        {
          title: '🚆 Transit & Assist',
          rows: [
            {
              id: 'menu_flight',
              title: 'Flight Booking Desk',
              description: 'Domestic & International lowest fares',
            },
            {
              id: 'menu_visa',
              title: 'Visa Assistance Desk',
              description: 'Tourist, Business & NRI Visas',
            },
            {
              id: 'menu_status',
              title: 'Track Status / PNR',
              description: 'Check your booking or quote status',
            },
            {
              id: 'menu_agent',
              title: 'Talk to Travel Expert',
              description: 'Call or visit Anand office directly',
            },
          ],
        },
      ],
    },
  };

  return {
    reply,
    actionTaken: 'MAIN_MENU_DISPLAYED',
    sessionState: session,
  };
}
