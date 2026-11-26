/**
 * VARNI HOLIDAYS - WhatsApp Proactive Notification Service
 * Dispatches automated WhatsApp alerts to travelers for key milestones:
 * - New Booking & Enquiry confirmations
 * - Booking status transitions (CONFIRMED, IN_PROGRESS, COMPLETED)
 * - Advance & Full Payment receipts
 * - Quotation issuance with interactive link
 * - Voucher / PNR dispatch
 */

import { sendCustomerWhatsApp } from '../integrations/whatsapp-service';
import { BookingRecord, PaymentRecord, QuotationRecord } from '../crm/types';
import { COMPANY_CONTACT } from '../config/contact';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://varniholidays.com';

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  deliveryStatus: string;
  clickToChatUrl?: string;
}

export async function notifyBookingCreated(
  booking: BookingRecord,
  customerPhone: string,
  customerName: string
): Promise<NotificationResult> {
  const messageText =
`🎉 *BOOKING REQUEST RECEIVED — VARNI HOLIDAYS*

Dear *${customerName}*, your holiday booking request has been initiated.

🎫 *Booking Reference:* \`${booking.bookingReference}\`
📍 *Service Category:* ${booking.serviceType}
📅 *Travel Dates:* ${booking.travelStartDate} to ${booking.travelEndDate}
💰 *Total Amount:* ₹${booking.totalAmountInr.toLocaleString('en-IN')}
📑 *Current Status:* *PENDING ADVANCE DEPOSIT*
👨‍💼 *Assigned Desk:* ${booking.managedByName}

To confirm your reservation, our accounts team will verify your 50% advance deposit.
For assistance, message us back here or call *${COMPANY_CONTACT.phone.display}*.`;

  return await sendCustomerWhatsApp({
    phoneNumber: customerPhone,
    recipientName: customerName,
    category: 'WELCOME',
    messageText,
  });
}

export async function notifyBookingStatusUpdated(
  booking: BookingRecord,
  customerPhone: string,
  customerName: string,
  newStatus: BookingRecord['status'],
  notes?: string
): Promise<NotificationResult> {
  let headline = '📊 *BOOKING STATUS UPDATE*';
  let body = '';

  switch (newStatus) {
    case 'CONFIRMED':
      headline = '✅ *BOOKING CONFIRMED — VARNI HOLIDAYS*';
      body =
`Great news, *${customerName}*! Your booking \`${booking.bookingReference}\` is now *CONFIRMED*.
All your accommodations, transport vehicles, and itinerary arrangements are locked in.

💰 *Total Amount:* ₹${booking.totalAmountInr.toLocaleString('en-IN')}
💳 *Paid:* ₹${booking.paidAmountInr.toLocaleString('en-IN')}
⚠️ *Balance Remaining:* ₹${booking.balanceAmountInr.toLocaleString('en-IN')}`;
      break;

    case 'IN_PROGRESS':
      headline = '✈️ *BON VOYAGE — TRIP HAS BEGUN!*';
      body =
`Dear *${customerName}*, your journey with Varni Holidays is officially underway!
Our 24x7 local on-ground emergency travel support is active. Have a pleasant and joyful journey!`;
      break;

    case 'COMPLETED':
      headline = '🌟 *TOUR COMPLETED — WELCOME BACK!*';
      body =
`Welcome back, *${customerName}*! We hope you enjoyed your holiday with Varni Holidays.
Thank you for choosing us for your travels. We look forward to planning your next adventure!`;
      break;

    case 'CANCELLED':
      headline = '⚠️ *BOOKING CANCELLATION NOTICE*';
      body =
`Dear *${customerName}*, your booking \`${booking.bookingReference}\` has been marked as *CANCELLED*.
${notes ? `Reason: ${notes}\n` : ''}If this was in error, please contact our Anand office immediately.`;
      break;

    default:
      body = `Your booking status is currently: *${newStatus}*.`;
  }

  const messageText =
`${headline}

🎫 *Reference:* \`${booking.bookingReference}\`
📍 *Service:* ${booking.serviceType}
${body}

${notes && newStatus !== 'CANCELLED' ? `📝 *Update Note:* ${notes}\n` : ''}📞 *Helpdesk:* ${COMPANY_CONTACT.phone.display}`;

  return await sendCustomerWhatsApp({
    phoneNumber: customerPhone,
    recipientName: customerName,
    category: 'HOTEL_CONFIRMED',
    messageText,
  });
}

export async function notifyPaymentReceived(
  payment: PaymentRecord,
  booking: BookingRecord,
  customerPhone: string,
  customerName: string
): Promise<NotificationResult> {
  const messageText =
`💳 *PAYMENT RECEIPT — VARNI HOLIDAYS*

Dear *${customerName}*, we have successfully received and verified your payment.

🎫 *Booking Reference:* \`${booking.bookingReference}\`
💵 *Amount Paid:* *₹${payment.amountInr.toLocaleString('en-IN')}*
🏷️ *Payment Method:* ${payment.paymentMethod}
🔖 *Transaction Ref:* \`${payment.bankTransactionRef || payment.upiRef || 'OFFICE-CASH'}\`
📅 *Date:* ${new Date(payment.createdAt).toLocaleDateString('en-IN')}

📊 *Account Summary:*
• Total Tour Amount: ₹${booking.totalAmountInr.toLocaleString('en-IN')}
• Total Paid: ₹${booking.paidAmountInr.toLocaleString('en-IN')}
• Balance Due: ₹${booking.balanceAmountInr.toLocaleString('en-IN')}

Official GST invoice has been updated on your file.
Thank you for trusting Varni Holidays!`;

  return await sendCustomerWhatsApp({
    phoneNumber: customerPhone,
    recipientName: customerName,
    category: 'HOTEL_CONFIRMED',
    messageText,
  });
}

export async function notifyQuotationGenerated(
  quotation: QuotationRecord,
  customerPhone: string,
  customerName: string
): Promise<NotificationResult> {
  const quoteUrl = `${APP_URL}/quotation/${quotation.id}`;

  const messageText =
`📋 *YOUR CUSTOM TOUR QUOTATION IS READY!*

Dear *${customerName}*, your customized travel proposal has been prepared by *Varni Holidays*.

🔖 *Quotation Ref:* \`${quotation.quotationNumber}\`
🏷️ *Proposal Title:* ${quotation.title}
💰 *Total Amount:* *₹${quotation.totalAmountInr.toLocaleString('en-IN')}*
⏳ *Valid Until:* ${quotation.validUntil}

🌐 *View Full Proposal & Itinerary Online:*
👉 ${quoteUrl}

You can approve the quotation directly on the link above, or message us here with your questions!`;

  return await sendCustomerWhatsApp({
    phoneNumber: customerPhone,
    recipientName: customerName,
    category: 'QUOTATION_PREPARED',
    messageText,
  });
}

