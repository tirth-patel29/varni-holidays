/**
 * VARNI HOLIDAYS - WhatsApp FAQs, Office Information & Human Handover
 */

import { WhatsAppSessionData, BotProcessingResult } from '../types';
import { COMPANY_CONTACT } from '../../config/contact';
import { crmRepo } from '../../crm/store';

export async function handleFaqFlow(
  session: WhatsAppSessionData,
  userText: string
): Promise<BotProcessingResult> {
  const input = userText.trim().toLowerCase();

  // If requesting human callback
  if (
    input.includes('call') ||
    input.includes('agent') ||
    input.includes('human') ||
    input.includes('speak') ||
    input.includes('talk') ||
    input === '5'
  ) {
    try {
      let cust = crmRepo.findCustomerByPhoneOrEmail(session.phone);
      if (!cust) {
        cust = crmRepo.saveCustomer({
          id: `cust-wa-${Date.now()}`,
          fullName: session.customerName || 'WhatsApp Caller',
          email: null,
          phoneCountryCode: '+91',
          phoneNumber: session.phone.slice(-10),
          normalizedPhone: session.phone,
          normalizedEmail: null,
          duplicateWarning: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Add high-priority callback note
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const refId = `REQ-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newLead = crmRepo.saveLead({
        id: `lead-wa-cb-${Date.now()}`,
        referenceId: refId,
        serviceType: 'GENERAL',
        stage: 'PRIORITY',
        priorityLevel: 'URGENT',
        source: 'WHATSAPP_BOT_CALLBACK',
        customerId: cust.id,
        assignedUserId: 'usr-neel-patel-superadmin',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      crmRepo.addActivity({
        leadId: newLead.id,
        userId: 'usr-neel-patel-superadmin',
        userName: 'WhatsApp Bot Engine',
        type: 'NOTE',
        title: 'Urgent Callback Requested via WhatsApp',
        description: `Customer with phone +${session.phone} requested an immediate telephone consultation via WhatsApp Bot.`,
      });

      session.flow = 'IDLE';
      session.step = 'START';
      session.data = {};

      return {
        reply: {
          toPhone: session.phone,
          text:
`📞 *CALLBACK REQUEST LOGGED!*

Dear Traveler, our Senior Travel Consultant (*Neel Patel*) and Anand headquarters desk have been notified of your callback request.

🔖 *Urgent Ticket:* \`${refId}\`
📱 *Your Number:* +${session.phone}
⏰ *Response Time:* Within 30 minutes during business hours.

You can also reach our desk directly:
📞 Phone: *+91 63570 50505*
📍 Office: 317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Anand, Gujarat.

Type *MENU* to view other options.`,
        },
        actionTaken: 'CALLBACK_REQUESTED',
        leadReferenceId: refId,
        sessionState: session,
      };
    } catch (e) {
      console.warn('Callback error:', e);
    }
  }

  // If asking about office, bank details, or address
  if (input.includes('address') || input.includes('office') || input.includes('location')) {
    return {
      reply: {
        toPhone: session.phone,
        text:
`📍 *VARNI HOLIDAYS — HEADQUARTERS*

🏢 *Address:*
317, 3rd Floor, Narayan Empire,
Anand - Vidyanagar Road,
Vivekanand Wadi / Sardarganj,
Anand, Gujarat 388120
(Near Panchal Hall)

🕒 *Office Hours:*
• Monday – Saturday: 9:30 AM – 8:00 PM IST
• Sunday: Closed (Prior Appointment Only)

📞 Phone: *+91 63570 50505*
📧 Email: *varniinternational7@gmail.com*
🌐 Website: https://varniholidays.com

Type *MENU* to return to main services.`,
      },
      actionTaken: 'OFFICE_INFO_SENT',
      sessionState: session,
    };
  }

  if (input.includes('bank') || input.includes('payment') || input.includes('remittance') || input.includes('upi')) {
    return {
      reply: {
        toPhone: session.phone,
        text:
`💳 *OFFICIAL REMITTANCE & BANK DETAILS*

Company: *VARNI HOLIDAYS*
Bank: *HDFC Bank Ltd*
Branch: *Anand Main Branch, Gujarat*
Account Type: *Current Account*
Account Number: *50200084729104*
IFSC Code: *HDFC0000123*
GSTIN: *24AAACV1234P1Z5*

📲 *UPI / QR Payment:*
Available upon request. Please share your transaction UTR screenshot after payment so our accounts desk can generate your official receipt.

Type *MENU* to see all services.`,
      },
      actionTaken: 'BANK_INFO_SENT',
      sessionState: session,
    };
  }

  // General Help
  return {
    reply: {
      toPhone: session.phone,
      text:
`🌟 *VARNI HOLIDAYS ASSISTANCE DESK*

We are happy to assist you with:
• Custom Domestic & International Tour Packages
• Air Ticket Bookings (Domestic & International)
• Tourist & Business Visas for 50+ Countries
• Hotel Reservations & Luxury Houseboat Stays
• Travel Insurance & Corporate Travel

📞 Direct Desk: *+91 63570 50505*
📍 Anand Office: 317 Narayan Empire, Anand - Vidyanagar Rd.

Type *MENU* for the main options or *CALL* to speak to a specialist.`,
    },
    actionTaken: 'GENERAL_HELP_SENT',
    sessionState: session,
  };
}
