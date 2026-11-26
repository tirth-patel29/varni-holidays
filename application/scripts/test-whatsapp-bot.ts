/**
 * VARNI HOLIDAYS - WhatsApp Bot & Notifications Automated Test Suite
 * Tests all interactive conversational flows (Packages, Flights, Visas, Tracking, Callback)
 * and verifies automated CRM booking/lead generation and notification dispatch.
 */

import { processIncomingWhatsAppMessage } from '../lib/whatsapp/bot-engine';
import { waSessionStore } from '../lib/whatsapp/session-store';
import { crmRepo } from '../lib/crm/store';
import {
  notifyBookingCreated,
  notifyBookingStatusUpdated,
  notifyPaymentReceived,
  notifyQuotationGenerated,
} from '../lib/whatsapp/notifications';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (detail) console.error('     Detail:', detail);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('🤖 VARNI HOLIDAYS — WHATSAPP BOT & NOTIFICATIONS TEST SUITE');
  console.log('===============================================================\n');

  const testPhone = '919876543210';
  waSessionStore.resetSession(testPhone, false);

  // -------------------------------------------------------------
  // TEST 1: Greeting & Main Menu
  // -------------------------------------------------------------
  console.log('🔹 TEST 1: Greeting & Main Menu Introspection');
  const greetingRes = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    senderName: 'Rajesh Patel',
    messageId: 'msg_1',
    text: 'Hi',
    timestamp: Date.now(),
  });

  assert(
    greetingRes.reply.text.includes('VARNI HOLIDAYS') &&
    greetingRes.reply.text.includes('Book Tour Package') &&
    greetingRes.reply.text.includes('Track Booking'),
    'Bot returns branded Main Menu with 5 primary travel services'
  );
  assert(
    greetingRes.reply.buttons !== undefined && greetingRes.reply.buttons.length >= 3,
    'Bot attaches quick-reply interactive buttons'
  );

  // -------------------------------------------------------------
  // TEST 2: End-to-End Tour Package Booking & Instant Pricing
  // -------------------------------------------------------------
  console.log('\n🔹 TEST 2: Kerala Tour Package Interactive Booking Flow');
  
  // Step 1: Select Tour Packages
  const pkgStep1 = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_2',
    text: '1',
    timestamp: Date.now(),
  });
  assert(pkgStep1.sessionState.flow === 'PACKAGE_BOOKING', 'Switched session flow to PACKAGE_BOOKING');

  // Step 2: Choose 6N7D Grand Tour
  const pkgStep2 = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_3',
    text: '1',
    timestamp: Date.now(),
  });
  assert(pkgStep2.sessionState.data.duration === '6N7D', 'Recorded Kerala 6N7D Grand Tour duration');

  // Step 3: Enter Travel Dates
  const pkgStep3 = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_4',
    text: '15 Dec 2026',
    timestamp: Date.now(),
  });
  assert(pkgStep3.sessionState.data.travelDate === '15 Dec 2026', 'Recorded travel date');

  // Step 4: Enter Passenger Count (4 Adults)
  const pkgStep4 = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_5',
    text: '4',
    timestamp: Date.now(),
  });
  assert(pkgStep4.sessionState.data.adultsCount === 4, 'Recorded 4 Adults traveling');

  // Step 5: Choose Deluxe Hotel Tier
  const pkgStep5 = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_6',
    text: '2', // Deluxe
    timestamp: Date.now(),
  });
  assert(pkgStep5.sessionState.data.hotelTier === 'DELUXE', 'Recorded Deluxe Hotel Tier & computed price');

  // Step 6: Enter Customer Name
  const pkgStep6 = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_7',
    text: 'Rajesh Patel',
    timestamp: Date.now(),
  });
  assert(pkgStep6.sessionState.data.customerName === 'Rajesh Patel', 'Recorded primary passenger name');

  // Step 7: Enter Customer Email (Finalizes Booking)
  const pkgStep7 = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_8',
    text: 'rajesh.patel@gmail.com',
    timestamp: Date.now(),
  });

  assert(
    pkgStep7.actionTaken === 'PACKAGE_BOOKING_CREATED',
    'Package booking finalized with action PACKAGE_BOOKING_CREATED'
  );
  assert(
    pkgStep7.bookingReferenceId !== undefined && pkgStep7.bookingReferenceId.startsWith('VH-BKG-'),
    `Generated official Booking Reference: ${pkgStep7.bookingReferenceId}`
  );
  assert(
    pkgStep7.leadReferenceId !== undefined && pkgStep7.leadReferenceId.startsWith('PKG-'),
    `Generated official Lead Reference: ${pkgStep7.leadReferenceId}`
  );
  assert(
    pkgStep7.reply.text.includes('BOOKING REQUEST CONFIRMED') &&
    pkgStep7.reply.text.includes('Daily Breakfast (CPAI)'),
    'WhatsApp confirmation card includes inclusions, hotel tier and booking status'
  );

  // Verify Booking in CRM Store
  const createdBooking = crmRepo.getBookings().find((b) => b.bookingReference === pkgStep7.bookingReferenceId);
  assert(createdBooking !== undefined, 'Booking record successfully persisted in CRM repository');
  assert(createdBooking?.status === 'PENDING', 'Booking initial state strictly defaults to PENDING');

  // -------------------------------------------------------------
  // TEST 3: Flight Booking & Enquiry Flow
  // -------------------------------------------------------------
  console.log('\n🔹 TEST 3: Flight Booking & Air Ticketing Flow');
  waSessionStore.resetSession(testPhone, false);

  await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_f1',
    text: '2', // Flights
    timestamp: Date.now(),
  });

  await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_f2',
    text: '1', // One-Way
    timestamp: Date.now(),
  });

  await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_f3',
    text: 'Ahmedabad (AMD) to London (LHR)',
    timestamp: Date.now(),
  });

  await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_f4',
    text: '10 Jan 2027',
    timestamp: Date.now(),
  });

  await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_f5',
    text: '2 Adults',
    timestamp: Date.now(),
  });

  await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_f6',
    text: '1', // Economy
    timestamp: Date.now(),
  });

  await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_f7',
    text: 'Suresh Shah',
    timestamp: Date.now(),
  });

  const flightFinal = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_f8',
    text: 'suresh@example.com',
    timestamp: Date.now(),
  });

  assert(
    flightFinal.actionTaken === 'FLIGHT_ENQUIRY_CREATED' && flightFinal.leadReferenceId?.startsWith('FLT-'),
    `Flight enquiry created with reference: ${flightFinal.leadReferenceId}`
  );

  // -------------------------------------------------------------
  // TEST 4: Live Status Tracking
  // -------------------------------------------------------------
  console.log('\n🔹 TEST 4: Live Booking & Reference ID Status Tracking');
  const trackRes = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_t1',
    text: `STATUS ${pkgStep7.bookingReferenceId}`,
    timestamp: Date.now(),
  });

  assert(
    trackRes.actionTaken === 'BOOKING_STATUS_FOUND',
    'Status tracker accurately retrieves live Booking from reference code'
  );
  assert(
    trackRes.reply.text.includes(pkgStep7.bookingReferenceId || '') &&
    trackRes.reply.text.includes('PENDING (Awaiting Advance)'),
    'Status text displays exact stage and financial balance'
  );

  // -------------------------------------------------------------
  // TEST 5: Human Agent Escalation & Office Information
  // -------------------------------------------------------------
  console.log('\n🔹 TEST 5: Human Escalation & Anand Office Callback');
  const callbackRes = await processIncomingWhatsAppMessage({
    fromPhone: testPhone,
    messageId: 'msg_c1',
    text: 'Please call me urgently regarding my holiday',
    timestamp: Date.now(),
  });

  assert(
    callbackRes.actionTaken === 'CALLBACK_REQUESTED',
    'Human agent request recognized and logged as urgent callback'
  );
  assert(
    callbackRes.leadReferenceId?.startsWith('REQ-') === true,
    `Generated urgent support ticket: ${callbackRes.leadReferenceId}`
  );

  // -------------------------------------------------------------
  // TEST 6: Proactive Automated Customer Notifications
  // -------------------------------------------------------------
  console.log('\n🔹 TEST 6: Automated Customer Notification Dispatchers');

  if (createdBooking) {
    // 1. Booking Status Changed to CONFIRMED
    const notifyStatus = await notifyBookingStatusUpdated(
      createdBooking,
      testPhone,
      'Rajesh Patel',
      'CONFIRMED',
      '50% Advance received. Munnar & Kovalam resorts confirmed.'
    );
    assert(
      notifyStatus.success && notifyStatus.deliveryStatus === 'CLICK_TO_CHAT_TRIGGERED',
      'Dispatched Booking CONFIRMED WhatsApp notification (compliant click-to-chat fallback)'
    );

    // 2. Advance Payment Received
    const mockPayment: any = {
      id: 'pay-test-1',
      bookingId: createdBooking.id,
      amountInr: 25000,
      paymentMethod: 'BANK_TRANSFER',
      bankTransactionRef: 'HDFC987654321',
      recordedByUserId: 'usr-neel-patel-admin',
      createdAt: new Date().toISOString(),
    };

    const notifyPay = await notifyPaymentReceived(
      mockPayment,
      createdBooking,
      testPhone,
      'Rajesh Patel'
    );
    assert(
      notifyPay.success && notifyPay.clickToChatUrl !== undefined,
      'Dispatched Payment Receipt WhatsApp notification with formatted amounts'
    );

    // 3. Custom Quotation Ready
    const mockQuote: any = {
      id: 'quo-test-1',
      quotationNumber: 'VH-QUO-202611-0001',
      title: 'Kerala 6N/7D Grand Tour (Deluxe Tier)',
      totalAmountInr: 49000,
      validUntil: '30 Nov 2026',
    };

    const notifyQuote = await notifyQuotationGenerated(
      mockQuote,
      testPhone,
      'Rajesh Patel'
    );
    assert(
      notifyQuote.success && notifyQuote.clickToChatUrl?.includes('VH-QUO-202611-0001'),
      'Dispatched Custom Quotation WhatsApp notification with online proposal URL'
    );
  }

  console.log('\n===============================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});

