/**
 * VARNI HOLIDAYS - WhatsApp Visa Assistance Enquiry Flow
 * Handles destination country, visa category, applicant count,
 * travel timeframe, and CRM lead creation.
 */

import { WhatsAppSessionData, BotProcessingResult } from '../types';
import { crmRepo } from '../../crm/store';
import { validatePhoneNumber } from '../../validation/phone';
import { processSyncQueueAction } from '../../../app/actions/google-sheets';

function generateReference(prefix: 'VIS'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

export async function handleVisaFlow(
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
        text: '❌ Visa enquiry cancelled.\n\nType *MENU* to see all services.',
      },
      actionTaken: 'CANCELLED_TO_MENU',
      sessionState: session,
    };
  }

  switch (session.step) {
    case 'START': {
      session.step = 'SELECT_COUNTRY';
      return {
        reply: {
          toPhone: session.phone,
          text: `🛂 *Visa Assistance Desk*\n\nWhich country do you need a visa for?\n\n1️⃣ *Schengen / Europe*\n2️⃣ *United Kingdom (UK)*\n3️⃣ *United States (USA)*\n4️⃣ *Dubai / UAE*\n5️⃣ *Singapore*\n\nOr type any other country name:`,
          buttons: [
            { id: 'visa_schengen', title: 'Schengen' },
            { id: 'visa_uk', title: 'UK' },
            { id: 'visa_usa', title: 'USA' },
          ],
        },
        actionTaken: 'ASK_VISA_COUNTRY',
        sessionState: session,
      };
    }

    case 'SELECT_COUNTRY': {
      session.step = 'SELECT_TYPE';
      let country = input;
      if (input === 'visa_schengen' || input === '1' || lower.includes('schengen') || lower.includes('europe')) {
        country = 'Schengen / Europe';
      } else if (input === 'visa_uk' || input === '2' || lower.includes('uk') || lower.includes('london')) {
        country = 'United Kingdom (UK)';
      } else if (input === 'visa_usa' || input === '3' || lower.includes('usa') || lower.includes('america')) {
        country = 'United States of America (USA)';
      } else if (input === 'visa_dubai' || input === '4' || lower.includes('dubai') || lower.includes('uae')) {
        country = 'Dubai / UAE';
      } else if (input === 'visa_singapore' || input === '5' || lower.includes('singapore')) {
        country = 'Singapore';
      }

      session.data.country = country;
      return {
        reply: {
          toPhone: session.phone,
          text: `Country: *${country}*\n\n🛂 What *Visa Type* do you need?\n\n1️⃣ *Tourist Visa*\n2️⃣ *Business / Conference Visa*\n3️⃣ *Transit Visa*\n4️⃣ *Student / Dependent Visa*\n\nReply with 1 to 4:`,
          buttons: [
            { id: 'visa_tourist', title: 'Tourist Visa' },
            { id: 'visa_business', title: 'Business Visa' },
          ],
        },
        actionTaken: 'COUNTRY_CHOSEN',
        sessionState: session,
      };
    }

    case 'SELECT_TYPE': {
      let visaType = 'TOURIST';
      if (input === 'visa_business' || input === '2' || lower.includes('business')) visaType = 'BUSINESS';
      else if (input === '3' || lower.includes('transit')) visaType = 'TRANSIT';
      else if (input === '4' || lower.includes('student')) visaType = 'STUDENT';
      else visaType = 'TOURIST';

      session.data.visaType = visaType;
      session.step = 'SELECT_APPLICANTS';
      return {
        reply: {
          toPhone: session.phone,
          text: `Visa Category: *${visaType}*\n\n👥 How many *Applicants* require visa assistance? (e.g. *1*, *2*, *4*):`,
        },
        actionTaken: 'VISA_TYPE_CHOSEN',
        sessionState: session,
      };
    }

    case 'SELECT_APPLICANTS': {
      let count = 1;
      const numMatch = input.match(/\d+/);
      if (numMatch) count = parseInt(numMatch[0], 10);
      session.data.applicantCount = count;

      session.step = 'ASK_NAME';
      return {
        reply: {
          toPhone: session.phone,
          text: `Applicants: *${count} person(s)*\n\n👤 Please provide the *Primary Applicant Full Name*:`,
        },
        actionTaken: 'APPLICANTS_RECORDED_ASK_NAME',
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
          text: `Thank you, *${input}*!\n\n📧 What is your *Email Address* to receive the required document checklist and embassy forms? (or type *SKIP*):`,
        },
        actionTaken: 'NAME_RECORDED_ASK_EMAIL',
        sessionState: session,
      };
    }

    case 'ASK_EMAIL': {
      const email = lower === 'skip' ? null : input.includes('@') ? input.trim() : null;
      session.data.customerEmail = email;
      if (email) session.customerEmail = email;

      return await finalizeVisaEnquiry(session);
    }

    default: {
      session.step = 'SELECT_COUNTRY';
      return {
        reply: {
          toPhone: session.phone,
          text: '🛂 Please enter the country you need a Visa for (e.g. *UK*, *USA*, *Schengen*, *Dubai*, *Singapore*):',
        },
        actionTaken: 'RESET_VISA_COUNTRY',
        sessionState: session,
      };
    }
  }
}

async function finalizeVisaEnquiry(session: WhatsAppSessionData): Promise<BotProcessingResult> {
  const phoneValidation = validatePhoneNumber('+91', session.phone);
  const normalizedPhone = phoneValidation.normalized || session.phone;
  const customerName = session.data.customerName || 'Valued Traveler';
  const customerEmail = session.data.customerEmail || null;
  const country = session.data.country || 'International';
  const visaType = session.data.visaType || 'TOURIST';
  const applicantCount = session.data.applicantCount || 1;

  const refId = generateReference('VIS');

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
      id: `lead-wa-vis-${Date.now()}`,
      referenceId: refId,
      serviceType: 'VISA',
      stage: 'REQUESTS',
      priorityLevel: 'MEDIUM',
      source: 'WHATSAPP_BOT',
      customerId: cust.id,
      assignedUserId: 'usr-ananya-joshi-visa',
      visaDetail: {
        destinationCountry: country,
        visaCategory: (visaType as any) || 'TOURIST',
        applicantNationality: 'Indian',
        residenceCountry: 'India',
        applicantCount,
      },
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    crmRepo.addActivity({
      leadId: newLead.id,
      userId: 'usr-ananya-joshi-visa',
      userName: 'WhatsApp Bot Engine',
      type: 'NOTE',
      title: 'WhatsApp Visa Assistance Logged',
      description: `Visa assistance request for ${customerName}: ${country} (${visaType}, ${applicantCount} applicants).`,
    });

    processSyncQueueAction().catch((err) => console.warn('Outbox sync error:', err));

    session.flow = 'IDLE';
    session.step = 'START';
    session.data = {};

    const confirmationText =
`🛂 *VISA ENQUIRY RECEIVED!*

Dear *${customerName}*, your visa assistance file has been opened with *Varni Holidays*.

🔖 *Reference ID:* \`${refId}\`
🌍 *Destination Country:* ${country}
📑 *Category:* ${visaType}
👥 *Applicants:* ${applicantCount} Person(s)
📋 *Assigned Specialist:* Ananya Joshi (Visa Desk)

📁 *Next Steps:*
1. Our visa executive will contact you to review your passport validity & appointment slots.
2. We will provide a step-by-step document checklist (Financials, ITR, Employment Letter, Travel Itinerary).
3. We assist with VFS/Embassy appointment booking & form verification.

_Note: Varni Holidays provides professional visa documentation and appointment facilitation; issuance decisions rest solely with the respective Embassy/Consulate._

To check status anytime, text: *STATUS ${refId}*
To return to menu, text: *MENU*`;

    return {
      reply: {
        toPhone: session.phone,
        text: confirmationText,
      },
      actionTaken: 'VISA_ENQUIRY_CREATED',
      leadReferenceId: refId,
      sessionState: session,
    };
  } catch (err: any) {
    console.error('Finalize visa enquiry error:', err);
    return {
      reply: {
        toPhone: session.phone,
        text: `Visa request noted for *${country}*! Our visa expert will call you back.\n\nType *MENU* to view main options.`,
      },
      actionTaken: 'VISA_ERROR_FALLBACK',
      sessionState: session,
    };
  }
}
