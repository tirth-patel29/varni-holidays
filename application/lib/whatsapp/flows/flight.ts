/**
 * VARNI HOLIDAYS - WhatsApp Flight Enquiry & Booking Flow
 * Handles trip type, origin/destination routing, travel dates, passenger counts,
 * cabin class, meal/assistance preferences, and CRM lead creation.
 */

import { WhatsAppSessionData, BotProcessingResult } from '../types';
import { crmRepo } from '../../crm/store';
import { validatePhoneNumber } from '../../validation/phone';
import { processSyncQueueAction } from '../../../app/actions/google-sheets';

function generateReference(prefix: 'FLT'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

export async function handleFlightFlow(
  session: WhatsAppSessionData,
  userText: string,
  interactiveId?: string
): Promise<BotProcessingResult> {
  const input = (interactiveId || userText).trim();
  const lower = input.toLowerCase();

  if (lower === 'cancel' || lower === 'menu' || lower === 'main menu') {
    session.flow = 'IDLE';
    session.step = 'START';
    session.data = {};
    return {
      reply: {
        toPhone: session.phone,
        text: '❌ Flight enquiry cancelled.\n\nType *MENU* to see all services.',
      },
      actionTaken: 'CANCELLED_TO_MENU',
      sessionState: session,
    };
  }

  switch (session.step) {
    case 'START': {
      session.step = 'SELECT_TRIP_TYPE';
      return {
        reply: {
          toPhone: session.phone,
          text: `✈️ *Flight Booking & Air Ticketing*\n\nPlease choose your trip type:\n\n1️⃣ *One-Way*\n2️⃣ *Round-Trip*\n3️⃣ *Multi-City*\n\nReply with 1, 2, or 3:`,
          buttons: [
            { id: 'flt_oneway', title: 'One-Way' },
            { id: 'flt_round', title: 'Round-Trip' },
            { id: 'flt_multi', title: 'Multi-City' },
          ],
        },
        actionTaken: 'ASK_TRIP_TYPE',
        sessionState: session,
      };
    }

    case 'SELECT_TRIP_TYPE': {
      session.step = 'SELECT_ROUTE';
      if (input === 'flt_round' || input === '2' || lower.includes('round')) {
        session.data.tripType = 'ROUND_TRIP';
        session.data.tripTypeLabel = 'Round-Trip';
      } else if (input === 'flt_multi' || input === '3' || lower.includes('multi')) {
        session.data.tripType = 'MULTI_CITY';
        session.data.tripTypeLabel = 'Multi-City';
      } else {
        session.data.tripType = 'ONE_WAY';
        session.data.tripTypeLabel = 'One-Way';
      }

      return {
        reply: {
          toPhone: session.phone,
          text: `✈️ *Flight Booking (${session.data.tripTypeLabel})*\n\nPlease enter your *Departure City/Airport* and *Destination City/Airport*:\n\n_Example: Ahmedabad (AMD) to London (LHR)_ or _BOM to DXB_:`,
        },
        actionTaken: 'TRIP_TYPE_CHOSEN',
        sessionState: session,
      };
    }

    case 'SELECT_ROUTE': {
      session.data.route = input;
      session.step = 'SELECT_DATES';
      const isRound = session.data.tripType === 'ROUND_TRIP';
      return {
        reply: {
          toPhone: session.phone,
          text: `Route: *${input}*\n\n📅 When do you want to travel?${isRound ? '\n_Please enter Departure Date and Return Date (e.g. 10 Dec to 25 Dec 2026)_' : '\n_Please enter Departure Date (e.g. 15 Dec 2026)_'}`,
        },
        actionTaken: 'ROUTE_RECORDED',
        sessionState: session,
      };
    }

    case 'SELECT_DATES': {
      session.data.travelDates = input;
      session.step = 'SELECT_PAX';
      return {
        reply: {
          toPhone: session.phone,
          text: `Travel Dates: *${input}*\n\n👥 How many passengers are traveling?\n\n(e.g., *2 Adults, 1 Child* or just type the total number):`,
          buttons: [
            { id: 'pax_1', title: '1 Passenger' },
            { id: 'pax_2', title: '2 Passengers' },
            { id: 'pax_family', title: '3+ (Family)' },
          ],
        },
        actionTaken: 'DATES_RECORDED',
        sessionState: session,
      };
    }

    case 'SELECT_PAX': {
      let adults = 1;
      let children = 0;
      let infants = 0;

      const numbers = input.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        adults = parseInt(numbers[0], 10);
        if (numbers.length > 1) children = parseInt(numbers[1], 10);
        if (numbers.length > 2) infants = parseInt(numbers[2], 10);
      } else if (input === 'pax_2') {
        adults = 2;
      } else if (input === 'pax_family') {
        adults = 3;
      }

      session.data.adultsCount = adults;
      session.data.childrenCount = children;
      session.data.infantsCount = infants;

      session.step = 'SELECT_CABIN';
      return {
        reply: {
          toPhone: session.phone,
          text: `Passengers: *${adults} Adult(s)${children > 0 ? `, ${children} Child` : ''}*\n\n💺 Which *Cabin Class* do you prefer?\n\n1️⃣ *Economy*\n2️⃣ *Premium Economy*\n3️⃣ *Business Class*\n4️⃣ *First Class*\n\nReply with 1 to 4:`,
          buttons: [
            { id: 'cabin_economy', title: 'Economy' },
            { id: 'cabin_business', title: 'Business Class' },
          ],
        },
        actionTaken: 'PAX_RECORDED_ASK_CABIN',
        sessionState: session,
      };
    }

    case 'SELECT_CABIN': {
      let cabin: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST' = 'ECONOMY';
      if (input === 'cabin_business' || input === '3' || lower.includes('business')) cabin = 'BUSINESS';
      else if (input === '2' || lower.includes('premium')) cabin = 'PREMIUM_ECONOMY';
      else if (input === '4' || lower.includes('first')) cabin = 'FIRST';
      else cabin = 'ECONOMY';

      session.data.cabinClass = cabin;
      session.step = 'ASK_NAME';
      return {
        reply: {
          toPhone: session.phone,
          text: `Cabin Class: *${cabin}*\n\n👤 Please provide the *Primary Passenger Full Name* (as in passport/ID):`,
        },
        actionTaken: 'CABIN_RECORDED_ASK_NAME',
        sessionState: session,
      };
    }

    case 'ASK_NAME': {
      session.data.customerName = input;
      session.customerName = input;
      session.step = 'ASK_EMAIL';
      return {
        reply: {
          toPhone: session.phone,
          text: `Thank you, *${input}*!\n\n📧 What is your *Email Address* for flight ticket options & PNR quotes? (or type *SKIP*):`,
        },
        actionTaken: 'NAME_RECORDED_ASK_EMAIL',
        sessionState: session,
      };
    }

    case 'ASK_EMAIL': {
      const email = lower === 'skip' ? null : input.includes('@') ? input.trim() : null;
      session.data.customerEmail = email;
      if (email) session.customerEmail = email;

      return await finalizeFlightEnquiry(session);
    }

    default: {
      session.step = 'SELECT_TRIP_TYPE';
      return {
        reply: {
          toPhone: session.phone,
          text: '✈️ Choose flight trip type:\n1️⃣ One-Way\n2️⃣ Round-Trip\n3️⃣ Multi-City',
        },
        actionTaken: 'RESET_FLIGHT_TYPE',
        sessionState: session,
      };
    }
  }
}

async function finalizeFlightEnquiry(session: WhatsAppSessionData): Promise<BotProcessingResult> {
  const phoneValidation = validatePhoneNumber('+91', session.phone);
  const normalizedPhone = phoneValidation.normalized || session.phone;
  const customerName = session.data.customerName || 'Valued Traveler';
  const customerEmail = session.data.customerEmail || null;
  const tripType = session.data.tripType || 'ROUND_TRIP';
  const route = session.data.route || 'Ahmedabad to International';
  const travelDates = session.data.travelDates || 'Flexible';
  const adults = session.data.adultsCount || 1;
  const children = session.data.childrenCount || 0;
  const cabinClass = session.data.cabinClass || 'ECONOMY';

  const refId = generateReference('FLT');
  const origin = route.includes(' to ') ? route.split(' to ')[0].trim() : route;
  const destination = route.includes(' to ') ? route.split(' to ')[1].trim() : 'Destination';

  try {
    let cust = crmRepo.findCustomerByPhoneOrEmail(normalizedPhone, customerEmail);
    if (!cust) {
      cust = crmRepo.saveCustomer({
        id: `cust-wa-${Date.now()}`,
        fullName: customerName,
        email: customerEmail,
        phoneCountryCode: '+91',
        phoneNumber: session.phone.slice(-10),
        normalizedPhone,
        normalizedEmail: customerEmail?.toLowerCase() || null,
        duplicateWarning: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const newLead = crmRepo.saveLead({
      id: `lead-wa-flt-${Date.now()}`,
      referenceId: refId,
      serviceType: 'FLIGHT',
      stage: 'REQUESTS',
      priorityLevel: 'MEDIUM',
      source: 'WHATSAPP_BOT',
      customerId: cust.id,
      assignedUserId: 'usr-priya-sharma-flights',
      flightDetail: {
        tripType,
        adultsCount: adults,
        childrenCount: children,
        infantsCount: 0,
        cabinClass,
        originAirport: origin,
        destinationAirport: destination,
        departureDate: travelDates,
        segments: [
          {
            segmentOrder: 1,
            originAirport: origin,
            destinationAirport: destination,
            departureDate: travelDates,
          },
        ],
      },
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    crmRepo.addActivity({
      leadId: newLead.id,
      userId: 'usr-priya-sharma-flights',
      userName: 'WhatsApp Bot Engine',
      type: 'NOTE',
      title: 'WhatsApp Flight Enquiry Logged',
      description: `Flight enquiry for ${customerName}: ${route} (${tripType}, ${cabinClass}, ${adults} pax).`,
    });

    processSyncQueueAction().catch((err) => console.warn('Outbox sync error:', err));

    session.flow = 'IDLE';
    session.step = 'START';
    session.data = {};

    const confirmationText =
`✈️ *FLIGHT ENQUIRY CONFIRMED!*

Dear *${customerName}*, your flight request has been forwarded to our dedicated air ticketing desk.

🔖 *Reference ID:* \`${refId}\`
🛫 *Route:* ${route}
🔄 *Trip Type:* ${tripType.replace('_', ' ')}
📅 *Dates:* ${travelDates}
👥 *Passengers:* ${adults} Adult(s)${children > 0 ? `, ${children} Child` : ''}
💺 *Cabin:* ${cabinClass}
📑 *Stage:* *AIRLINE FARE COMPARISON IN PROGRESS*

Our air ticketing specialist (*Priya Sharma*) is checking lowest GDS corporate fares, baggage allowances, and convenient layovers. You will receive customized flight options shortly.

To check status anytime, text: *STATUS ${refId}*
To return to menu, text: *MENU*`;

    return {
      reply: {
        toPhone: session.phone,
        text: confirmationText,
      },
      actionTaken: 'FLIGHT_ENQUIRY_CREATED',
      leadReferenceId: refId,
      sessionState: session,
    };
  } catch (err: any) {
    console.error('Finalize flight enquiry error:', err);
    return {
      reply: {
        toPhone: session.phone,
        text: `Flight request received for *${route}*! Our flights team will call you back.\n\nType *MENU* to view main options.`,
      },
      actionTaken: 'FLIGHT_ENQUIRY_ERROR_FALLBACK',
      sessionState: session,
    };
  }
}
