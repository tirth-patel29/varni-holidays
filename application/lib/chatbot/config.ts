/**
 * VARNI HOLIDAYS - Canonical Chatbot Configuration
 * 
 * Predefined, rule-based chatbot settings and content.
 * Single source of truth for all bot greeting messages and initial options.
 */

import { COMPANY_CONTACT } from '@/lib/config/contact';
import { ChatbotOption } from './types';

export const CHATBOT_CONFIG = {
  brandName: 'Varni Holidays',
  tagline: 'Verified Travel Desk • Anand',
  logoUrl: '/logo.webp',
  onlineStatusText: 'Online • Anand Desk',
  typingDelayMs: 450, // Humanized response delay

  // Exact required welcome message
  welcomeMessage: `Hello! Welcome to Varni Holidays.\n\nHow can we help you plan your next journey?`,

  // Five exact required main options
  initialOptions: [
    { label: '✈️ Flight Bookings', value: 'flight', action: 'step' },
    { label: '🌴 Holiday Packages', value: 'package', action: 'step' },
    { label: '🏨 Hotel Bookings', value: 'hotel', action: 'step' },
    { label: '🛂 Visa Assistance', value: 'visa', action: 'step' },
    { label: '🧳 Other Travel Enquiries', value: 'other', action: 'step' },
  ] as ChatbotOption[],

  // Exact required confirmation message
  submissionConfirmation: `Thank you for contacting Varni Holidays!\n\nYour enquiry has been successfully submitted. Our team will get in touch with you shortly.`,

  // Contact details linked directly to canonical company config
  contact: {
    phoneDisplay: COMPANY_CONTACT.phone.display,
    phoneHref: COMPANY_CONTACT.phone.tel,
    whatsappDisplay: COMPANY_CONTACT.whatsapp.display,
    whatsappUrl: COMPANY_CONTACT.whatsapp.url,
    buildWhatsappUrl: (refId?: string) =>
      COMPANY_CONTACT.whatsapp.buildUrl(
        refId
          ? `Hello Varni Holidays, I have submitted an enquiry on your website with Reference ID: ${refId}.`
          : `Hello Varni Holidays, I want to inquire about travel packages.`
      ),
    email: COMPANY_CONTACT.email.primary,
    emailHref: COMPANY_CONTACT.email.mailto,
    websiteUrl: 'https://varni-holidays.vercel.app',
    officeAddress: COMPANY_CONTACT.address.full,
    businessHours: COMPANY_CONTACT.hours.display,
  },

  // Launcher floating prompt toast
  launcherGreeting: 'Plan your journey with us! 👋',
  launcherBadgeText: 'Online',
} as const;

export type ChatbotConfig = typeof CHATBOT_CONFIG;
