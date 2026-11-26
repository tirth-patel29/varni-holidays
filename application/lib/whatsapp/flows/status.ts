/**
 * VARNI HOLIDAYS - WhatsApp Status Tracking Flow
 * Allows travelers to look up the live status of their Leads,
 * Quotations, or Bookings using their reference code or phone number.
 */

import { WhatsAppSessionData, BotProcessingResult } from '../types';
import { crmRepo } from '../../crm/store';

export async function handleStatusFlow(
  session: WhatsAppSessionData,
  userText: string
): Promise<BotProcessingResult> {
  const input = userText.trim();
  const lower = input.toLowerCase();

  if (lower === 'cancel' || lower === 'menu') {
    session.flow = 'IDLE';
    session.step = 'START';
    session.data = {};
    return {
      reply: {
        toPhone: session.phone,
        text: 'Returning to main menu. Type *MENU* to see all services.',
      },
      actionTaken: 'CANCELLED_TO_MENU',
      sessionState: session,
    };
  }

  // Look for any reference pattern in text: e.g. PKG-..., FLT-..., VIS-..., VH-BKG-..., VH-QUO-...
  const refMatch = input.match(/(?:PKG|FLT|VIS|HOL|INS)-\d{8}-\d{4}|VH-BKG-\d{6}-\d{4}|VH-QUO-\d{6}-\d{4}/i);
  const searchRef = refMatch ? refMatch[0].toUpperCase() : input.trim().toUpperCase();

  // 1. Try finding by Booking Reference
  const bookings = crmRepo.getBookings();
  const matchedBooking = bookings.find(
    (b) => b.bookingReference.toUpperCase() === searchRef || b.id.toUpperCase() === searchRef
  );

  if (matchedBooking) {
    session.flow = 'IDLE';
    session.step = 'START';

    const statusBadge =
      matchedBooking.status === 'CONFIRMED'
        ? '✅ *CONFIRMED*'
        : matchedBooking.status === 'PENDING'
        ? '⏳ *PENDING (Awaiting Advance)*'
        : matchedBooking.status === 'IN_PROGRESS'
        ? '✈️ *IN PROGRESS (Trip Active)*'
        : matchedBooking.status === 'COMPLETED'
        ? '🎉 *COMPLETED*'
        : '❌ *CANCELLED*';

    const balanceText =
      matchedBooking.balanceAmountInr > 0
        ? `\n💳 *Paid:* ₹${matchedBooking.paidAmountInr.toLocaleString('en-IN')}\n⚠️ *Balance Due:* ₹${matchedBooking.balanceAmountInr.toLocaleString('en-IN')}`
        : `\n💳 *Payment Status:* Full Payment Cleared ✅`;

    const bookingCard =
`🔍 *BOOKING STATUS DETAILS*

🎫 *Booking Ref:* \`${matchedBooking.bookingReference}\`
👤 *Customer:* ${matchedBooking.customerName}
📍 *Service:* ${matchedBooking.serviceType}
📊 *Status:* ${statusBadge}
📅 *Travel Dates:* ${matchedBooking.travelStartDate} to ${matchedBooking.travelEndDate}
💰 *Total Amount:* ₹${matchedBooking.totalAmountInr.toLocaleString('en-IN')}${balanceText}
👨‍💼 *Managed By:* ${matchedBooking.managedByName}

📞 *Questions?* Call your agent at *+91 63570 50505*.
Type *MENU* to see other options.`;

    return {
      reply: {
        toPhone: session.phone,
        text: bookingCard,
      },
      actionTaken: 'BOOKING_STATUS_FOUND',
      sessionState: session,
    };
  }

  // 2. Try finding by Lead Reference ID
  const matchedLead = crmRepo.getLeadById(searchRef);
  if (matchedLead) {
    session.flow = 'IDLE';
    session.step = 'START';

    let stageDisplay = '📝 *NEW REQUEST RECEIVED*';
    if (matchedLead.stage === 'GENERAL') stageDisplay = '📞 *IN TOUCH WITH AGENT*';
    else if (matchedLead.stage === 'PRIORITY') stageDisplay = '🔥 *PRIORITY PROPOSAL IN PROGRESS*';
    else if (matchedLead.stage === 'CONVERTED') stageDisplay = '🎉 *CONVERTED TO CONFIRMED BOOKING*';
    else if (matchedLead.stage === 'CLOSED') stageDisplay = '📁 *CLOSED*';

    let detailSummary = '';
    if (matchedLead.packageDetail) {
      detailSummary = `\n🌴 *Package:* ${matchedLead.packageDetail.packageName}\n🏨 *Hotel Tier:* ${matchedLead.packageDetail.hotelTier || 'Selected'}\n👥 *Travelers:* ${matchedLead.packageDetail.adultsCount} Adults`;
      if (matchedLead.packageDetail.quotedTotalPriceInr) {
        detailSummary += `\n💰 *Quoted Total:* ₹${matchedLead.packageDetail.quotedTotalPriceInr.toLocaleString('en-IN')}`;
      }
    } else if (matchedLead.flightDetail) {
      detailSummary = `\n✈️ *Trip:* ${matchedLead.flightDetail.tripType}\n👥 *Passengers:* ${matchedLead.flightDetail.adultsCount} Adults\n💺 *Cabin:* ${matchedLead.flightDetail.cabinClass}`;
    } else if (matchedLead.visaDetail) {
      detailSummary = `\n🌍 *Country:* ${matchedLead.visaDetail.destinationCountry}\n🛂 *Type:* ${matchedLead.visaDetail.visaCategory}`;
    }

    const leadCard =
`🔍 *ENQUIRY STATUS DETAILS*

🔖 *Reference:* \`${matchedLead.referenceId}\`
📍 *Service Type:* ${matchedLead.serviceType}
📊 *Current Stage:* ${stageDisplay}${detailSummary}
📅 *Submitted On:* ${new Date(matchedLead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

An executive from Varni Holidays has been assigned to your file.
Type *MENU* to return to the main menu.`;

    return {
      reply: {
        toPhone: session.phone,
        text: leadCard,
      },
      actionTaken: 'LEAD_STATUS_FOUND',
      sessionState: session,
    };
  }

  // 3. Fallback: Search by customer's phone number
  const customer = crmRepo.findCustomerByPhoneOrEmail(session.phone);
  if (customer) {
    const customerBookings = crmRepo.getBookings(customer.id);
    const customerLeads = crmRepo.getLeads().filter((l) => l.customerId === customer.id);

    if (customerBookings.length > 0 || customerLeads.length > 0) {
      session.flow = 'IDLE';
      session.step = 'START';

      let listText = `🔍 *Records Found For Your Phone Number (${session.phone}):*\n\n`;

      if (customerBookings.length > 0) {
        listText += `*Active Bookings:*\n`;
        customerBookings.forEach((b) => {
          listText += `• \`${b.bookingReference}\` — ${b.serviceType} (${b.status}) — ₹${b.totalAmountInr.toLocaleString('en-IN')}\n`;
        });
        listText += `\n`;
      }

      if (customerLeads.length > 0) {
        listText += `*Recent Enquiries:*\n`;
        customerLeads.slice(0, 3).forEach((l) => {
          listText += `• \`${l.referenceId}\` — ${l.serviceType} (${l.stage})\n`;
        });
      }

      listText += `\nTo view full details of any item, reply with the exact code (e.g. *${customerBookings[0]?.bookingReference || customerLeads[0]?.referenceId}*).`;

      return {
        reply: {
          toPhone: session.phone,
          text: listText,
        },
        actionTaken: 'PHONE_RECORDS_LISTED',
        sessionState: session,
      };
    }
  }

  // 4. Nothing found
  return {
    reply: {
      toPhone: session.phone,
      text: `⚠️ No booking or enquiry found matching "*${input}*".\n\nPlease check your reference code (e.g. *PKG-20261107-1234* or *VH-BKG-202611-0001*), or type *MENU* to return to the main options.`,
    },
    actionTaken: 'STATUS_NOT_FOUND',
    sessionState: session,
  };
}

