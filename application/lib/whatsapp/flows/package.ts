/**
 * VARNI HOLIDAYS - WhatsApp Tour Package Booking Flow
 * Handles destination selection, duration, dates, pax counts,
 * hotel tier selection, instant dynamic pricing, and CRM lead/booking creation.
 */

import { WhatsAppSessionData, BotOutgoingMessage, BotProcessingResult } from '../types';
import { calculateKeralaPrice } from '../../pricing/kerala';
import { crmRepo } from '../../crm/store';
import { validatePhoneNumber } from '../../validation/phone';
import { processSyncQueueAction } from '../../../app/actions/google-sheets';

function generateReference(prefix: 'PKG' | 'BKG'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

export async function handlePackageFlow(
  session: WhatsAppSessionData,
  userText: string,
  interactiveId?: string
): Promise<BotProcessingResult> {
  const input = (interactiveId || userText).trim();
  const lower = input.toLowerCase();

  // Allow resetting flow
  if (lower === 'cancel' || lower === 'menu' || lower === 'main menu') {
    session.flow = 'IDLE';
    session.step = 'START';
    session.data = {};
    return {
      reply: {
        toPhone: session.phone,
        text: '❌ Booking flow cancelled. Returning to main menu.\n\nType *MENU* to see all services.',
      },
      actionTaken: 'CANCELLED_TO_MENU',
      sessionState: session,
    };
  }

  switch (session.step) {
    case 'START':
    case 'SELECT_DESTINATION': {
      session.step = 'SELECT_DURATION';
      if (
        input === 'pkg_kerala' ||
        input === 'menu_package' ||
        lower.includes('kerala') ||
        input === '1'
      ) {
        session.data.destination = 'Kerala';
        return {
          reply: {
            toPhone: session.phone,
            text: `🌴 *Kerala Tour Package Selection*\n\nPlease choose your preferred duration:`,
            buttons: [
              { id: 'dur_6n7d', title: '6N/7D Grand Tour' },
              { id: 'dur_5n6d', title: '5N/6D Classic' },
            ],
          },
          actionTaken: 'DESTINATION_CHOSEN_KERALA',
          sessionState: session,
        };
      } else if (input === 'pkg_rajasthan' || lower.includes('rajasthan')) {
        session.data.destination = 'Rajasthan Royal Tour';
      } else if (input === 'pkg_kashmir' || lower.includes('kashmir') || input === '4') {
        session.data.destination = 'Kashmir Paradise';
      } else if (input === 'pkg_south' || lower.includes('south') || input === '2') {
        session.data.destination = 'South India Temple Tour';
      } else if (input === 'pkg_andaman' || lower.includes('andaman') || input === '3') {
        session.data.destination = 'Andaman Islands';
      } else {
        session.data.destination = input.length > 2 && input !== 'menu_package' ? input : 'Custom Tour Package';
      }

      session.step = 'SELECT_DATES';
      return {
        reply: {
          toPhone: session.phone,
          text: `Selected Destination: *${session.data.destination}*\n\n📅 When are you planning to travel? Pick below or type your dates:`,
          buttons: [
            { id: 'date_next_month', title: '📅 Next Month' },
            { id: 'date_dec_winter', title: '❄️ Dec / Winter' },
            { id: 'date_flexible', title: '✨ Flexible Dates' },
          ],
        },
        actionTaken: 'DESTINATION_CHOSEN_OTHER',
        sessionState: session,
      };
    }

    case 'SELECT_DURATION': {
      if (input === 'dur_6n7d' || input === '1' || lower.includes('6')) {
        session.data.duration = '6N7D';
        session.data.durationLabel = '6 Nights / 7 Days';
      } else {
        session.data.duration = '5N6D';
        session.data.durationLabel = '5 Nights / 6 Days';
      }

      session.step = 'SELECT_DATES';
      return {
        reply: {
          toPhone: session.phone,
          text: `Selected: *Kerala ${session.data.durationLabel}*\n\n📅 When are you planning to travel? Pick an option below or type your date:`,
          buttons: [
            { id: 'date_next_month', title: '📅 Next Month' },
            { id: 'date_dec_winter', title: '❄️ Dec / Winter' },
            { id: 'date_flexible', title: '✨ Flexible Dates' },
          ],
        },
        actionTaken: 'DURATION_SELECTED',
        sessionState: session,
      };
    }

    case 'SELECT_DATES': {
      let travelDate = input;
      if (input === 'date_next_month') travelDate = 'Next Month';
      else if (input === 'date_dec_winter') travelDate = 'Dec 2026 (Winter Peak)';
      else if (input === 'date_flexible') travelDate = 'Flexible Dates';

      session.data.travelDate = travelDate;
      session.step = 'SELECT_PAX';
      return {
        reply: {
          toPhone: session.phone,
          text: `Travel Date: *${travelDate}*\n\n👥 How many *Adults* (age 12+) will be traveling?`,
          buttons: [
            { id: 'pax_2', title: '2 Adults (Couples)' },
            { id: 'pax_4', title: '4 Adults' },
            { id: 'pax_6', title: '6 Adults (Family)' },
          ],
        },
        actionTaken: 'DATE_RECORDED',
        sessionState: session,
      };
    }

    case 'SELECT_PAX': {
      let adults = 2;
      const numMatch = input.match(/\d+/);
      if (numMatch) {
        adults = parseInt(numMatch[0], 10);
      }
      session.data.adultsCount = adults;

      // If Kerala, ask hotel tier for instant pricing calculation
      if (session.data.destination === 'Kerala') {
        session.step = 'SELECT_HOTEL_TIER';
        return {
          reply: {
            toPhone: session.phone,
            text: `Number of Adults: *${adults}*\n\n🏨 Which Hotel Tier do you prefer? Tap the dropdown below to select:`,
            list: {
              buttonText: 'Select Hotel Tier 🏨',
              title: 'Accommodation Tiers',
              sections: [
                {
                  title: 'Select Category',
                  rows: [
                    { id: 'tier_deluxe', title: 'Deluxe (Value ⭐)', description: '3-Star Deluxe stays (Popular)' },
                    { id: 'tier_super_deluxe', title: 'Super Deluxe (4⭐)', description: 'Scenic 4-star leisure stays' },
                    { id: 'tier_luxury', title: 'Luxury Heritage (5⭐)', description: '5-star resorts & private villas' },
                    { id: 'tier_standard', title: 'Standard (3-Star)', description: 'Comfortable budget stays' },
                    { id: 'tier_premium', title: 'Premium Retreats', description: 'Boutique premium retreats' },
                  ],
                },
              ],
            },
          },
          actionTaken: 'PAX_RECORDED_ASK_TIER',
          sessionState: session,
        };
      } else {
        // Non-Kerala destination skips tier calculation
        session.step = 'ASK_NAME';
        const knownName = session.customerName;
        return {
          reply: {
            toPhone: session.phone,
            text: `Travelers: *${adults} Adults*\n\n👤 Please provide your *Full Name* for the booking proposal:`,
            ...(knownName
              ? {
                  buttons: [
                    { id: 'use_my_name', title: `Use ${knownName.slice(0, 15)}` },
                  ],
                }
              : {}),
          },
          actionTaken: 'PAX_RECORDED_ASK_NAME',
          sessionState: session,
        };
      }
    }

    case 'SELECT_HOTEL_TIER': {
      let tier: 'STANDARD' | 'DELUXE' | 'SUPER_DELUXE' | 'PREMIUM' | 'LUXURY' = 'DELUXE';
      if (input === 'tier_standard' || input === '1' || lower.includes('standard')) tier = 'STANDARD';
      else if (input === 'tier_deluxe' || input === '2' || lower.includes('deluxe')) tier = 'DELUXE';
      else if (input === 'tier_super_deluxe' || input === '3' || lower.includes('super')) tier = 'SUPER_DELUXE';
      else if (input === 'tier_premium' || input === '4' || lower.includes('premium')) tier = 'PREMIUM';
      else if (input === 'tier_luxury' || input === '5' || lower.includes('luxury')) tier = 'LUXURY';

      session.data.hotelTier = tier;

      // Calculate authoritative Kerala price immediately
      try {
        const pricing = calculateKeralaPrice({
          duration: session.data.duration === '5N6D' ? '5N6D' : '6N7D',
          hotelTier: tier,
          adultsCount: session.data.adultsCount || 2,
          childrenWithBedCount: 0,
          childrenNoBedCount: 0,
          infantsCount: 0,
        });

        session.data.pricing = pricing;
      } catch (e) {
        console.warn('WhatsApp pricing calculation error:', e);
      }

      session.step = 'ASK_NAME';
      const knownName = session.customerName;
      return {
        reply: {
          toPhone: session.phone,
          text: `Selected Tier: *${tier}*\n\n👤 Please confirm your *Name* for the formal booking quote:`,
          ...(knownName
            ? {
                buttons: [
                  { id: 'use_my_name', title: `Use ${knownName.slice(0, 15)}` },
                ],
              }
            : {}),
        },
        actionTaken: 'TIER_SELECTED_ASK_NAME',
        sessionState: session,
      };
    }

    case 'ASK_NAME': {
      const knownName = session.customerName || session.data.customerName;
      let finalName = input;
      if (input === 'use_my_name' && knownName) {
        finalName = knownName;
      }

      session.data.customerName = finalName;
      session.customerName = finalName;
      session.step = 'ASK_EMAIL';
      return {
        reply: {
          toPhone: session.phone,
          text: `Thank you, *${finalName}*!\n\n📧 What is your *Email Address* for the PDF quotation? (Or tap Skip):`,
          buttons: [
            { id: 'email_skip', title: 'Skip Email ⏩' },
            { id: 'email_whatsapp', title: 'WhatsApp Only 💬' },
          ],
        },
        actionTaken: 'NAME_RECORDED_ASK_EMAIL',
        sessionState: session,
      };
    }

    case 'ASK_EMAIL': {
      const email = (lower === 'skip' || input === 'email_skip' || input === 'email_whatsapp') ? null : input.includes('@') ? input.trim() : null;
      session.data.customerEmail = email;
      if (email) session.customerEmail = email;

      // Finalize Booking & Lead Creation in CRM
      return await finalizePackageBooking(session);
    }

    default: {
      session.step = 'SELECT_DESTINATION';
      return {
        reply: {
          toPhone: session.phone,
          text: 'Let us start your holiday booking! Which destination are you looking for?\n\n1️⃣ Kerala\n2️⃣ South India\n3️⃣ Andaman\n4️⃣ Kashmir\n5️⃣ Other',
        },
        actionTaken: 'RESET_TO_DESTINATION',
        sessionState: session,
      };
    }
  }
}

async function finalizePackageBooking(session: WhatsAppSessionData): Promise<BotProcessingResult> {
  const phoneValidation = validatePhoneNumber('+91', session.phone);
  const normalizedPhone = phoneValidation.normalized || session.phone;
  const customerName = session.data.customerName || 'Valued Traveler';
  const customerEmail = session.data.customerEmail || null;
  const destination = session.data.destination || 'Kerala';
  const durationLabel = session.data.durationLabel || '6 Nights / 7 Days';
  const travelDate = session.data.travelDate || 'Upcoming Season';
  const adults = session.data.adultsCount || 2;
  const hotelTier = session.data.hotelTier || 'DELUXE';
  const pricing = session.data.pricing;

  const pkgRef = generateReference('PKG');
  const bkgRef = `VH-BKG-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  let totalEstimate = pricing?.totalEstimate || 0;
  let unitPrice = pricing?.unitPricePerAdult || 0;
  let vehicle = pricing?.matchedVehicleType || 'AC Private Vehicle';

  try {
    // 1. Deduplicate / Upsert Customer in CRM
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

    // 2. Create Lead in CRM
    const newLead = crmRepo.saveLead({
      id: `lead-wa-${Date.now()}`,
      referenceId: pkgRef,
      serviceType: 'PACKAGE',
      stage: 'REQUESTS',
      priorityLevel: 'HIGH',
      source: 'WHATSAPP_BOT',
      customerId: cust.id,
      assignedUserId: 'usr-harshil-desai-packages',
      packageDetail: {
        packageSlug: 'kerala-6n7d-winter',
        packageName: `${destination} ${durationLabel} Tour`,
        duration: durationLabel,
        hotelTier,
        adultsCount: adults,
        childrenWithBedCount: 0,
        childrenNoBedCount: 0,
        roomsCount: pricing?.roomCount || Math.ceil(adults / 2),
        preferredTravelDate: travelDate,
        includeHouseboatUpgrade: false,
        includeMealPlan: false,
        includeAthirapillyTrip: false,
        includeKanyakumariTrip: false,
        pricingStatus: pricing ? 'EXACT_MATCH' : 'CUSTOM_QUOTATION_REQUIRED',
        quotedUnitPriceInr: unitPrice || null,
        quotedTotalPriceInr: totalEstimate || null,
        vehicleAssigned: vehicle,
      },
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 3. Create initial Booking in PENDING status
    const booking = crmRepo.createBooking({
      customerId: cust.id,
      leadId: newLead.id,
      serviceType: 'PACKAGE',
      managedByUserId: 'usr-harshil-desai-packages',
      travelStartDate: travelDate,
      travelEndDate: travelDate,
      totalAmountInr: totalEstimate > 0 ? totalEstimate : 25000 * adults,
      initialPaidAmountInr: 0,
      status: 'PENDING',
    });

    crmRepo.addActivity({
      leadId: newLead.id,
      userId: 'usr-harshil-desai-packages',
      userName: 'WhatsApp Bot Engine',
      type: 'NOTE',
      title: 'WhatsApp Booking Request Generated',
      description: `Customer ${customerName} booked ${destination} (${durationLabel}) via WhatsApp. Booking Ref: ${booking.bookingReference}.`,
    });

    // Enqueue Google Sheets live synchronization
    processSyncQueueAction().catch((err) => console.warn('Outbox sync error:', err));

    // Reset session flow back to idle
    session.flow = 'IDLE';
    session.step = 'START';
    session.data = {};

    const priceText = totalEstimate > 0
      ? `💰 *Estimated Total:* ₹${totalEstimate.toLocaleString('en-IN')} (₹${unitPrice.toLocaleString('en-IN')}/person)\n🚗 *Vehicle:* ${vehicle}`
      : `💰 *Pricing:* Custom quotation will be prepared by our specialist.`;

    const confirmationText =
`🎉 *BOOKING REQUEST CONFIRMED!*

Dear *${customerName}*, your holiday request has been successfully submitted to *Varni Holidays*.

🔖 *Enquiry Ref:* \`${pkgRef}\`
🎫 *Booking Ref:* \`${booking.bookingReference}\`
📍 *Package:* ${destination} (${durationLabel})
🏨 *Hotel Tier:* ${hotelTier}
👥 *Travelers:* ${adults} Adults
📅 *Planned Date:* ${travelDate}
${priceText}
📑 *Status:* *PENDING ADVANCE DEPOSIT*

✨ *Included in Kerala Tour:*
• Daily Breakfast (CPAI)
• Private Dedicated AC Vehicle for Transfers & Sightseeing
• Driver Allowances, Toll & Parking
• Standard Hotel Check-in Amenities

Our holiday specialist (*Harshil Desai*) will call you shortly to customize your itinerary and confirm hotel vouchers.

To track this anytime, text: *STATUS ${booking.bookingReference}*
To return to menu, text: *MENU*`;

    return {
      reply: {
        toPhone: session.phone,
        text: confirmationText,
        buttons: [
          { id: 'menu_agent', title: '📞 Speak to Agent' },
          { id: 'btn_menu', title: '🔙 Main Menu' },
        ],
      },
      actionTaken: 'PACKAGE_BOOKING_CREATED',
      leadReferenceId: pkgRef,
      bookingReferenceId: booking.bookingReference,
      sessionState: session,
    };
  } catch (err: any) {
    console.error('Finalize package booking error:', err);
    return {
      reply: {
        toPhone: session.phone,
        text: `We noted your interest in *${destination}*! An agent from our Anand office will reach out to you directly at this number.\n\nType *MENU* to view options.`,
      },
      actionTaken: 'PACKAGE_BOOKING_ERROR_FALLBACK',
      sessionState: session,
    };
  }
}

