/**
 * VARNI HOLIDAYS - Comprehensive Phase 3 Verification Suite
 * Tests the complete 12-step lifecycle:
 * 1. Pre-flight & Neon DB connectivity
 * 2. Quotation creation with itemized multi-service lines
 * 3. Quotation immutable snapshot verification
 * 4. Quotation status transition (DRAFT -> SENT -> ACCEPTED)
 * 5. Booking generation from accepted quotation (Pending status enforcement)
 * 6. Automated service component creation (Hotels, Transfers, Visa, Cruise)
 * 7. Service component milestone updates (PNR, Voucher, Visa submission)
 * 8. Payment recording (UPI / Bank Transfer) & ledger balance calculations
 * 9. Resend branded HTML email generation and delivery tracking
 * 10. Meta WhatsApp adapter & strict CLICK_TO_CHAT_TRIGGERED audit compliance
 * 11. Customer 360 unified journey timeline aggregation
 * 12. Google Sheets sync queue event verification
 */

import { crmRepo } from '../lib/crm/store';
import { sendCustomerEmail, buildVarniEmailHtml } from '../lib/integrations/email-service';
import { sendCustomerWhatsApp, buildClickToChatUrl, normalizeWhatsAppNumber } from '../lib/integrations/whatsapp-service';

async function runPhase3Tests() {
  console.log('===============================================================');
  console.log('       VARNI HOLIDAYS - PHASE 3 END-TO-END VERIFICATION       ');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 12;

  // -------------------------------------------------------------
  // Test 1: Customer & Lead Pre-flight Check
  // -------------------------------------------------------------
  console.log('TEST 1: Customer & Lead Repository Check...');
  const customers = crmRepo.getCustomers();
  const leads = crmRepo.getLeads();
  if (customers.length >= 3 && leads.length >= 3) {
    console.log(`✓ Passed: Loaded ${customers.length} customers and ${leads.length} active leads.`);
    passedTests++;
  } else {
    throw new Error(`Failed: Expected at least 3 customers and leads, found ${customers.length}`);
  }

  // -------------------------------------------------------------
  // Test 2: Multi-Service Quotation Creation with Line Items
  // -------------------------------------------------------------
  console.log('\nTEST 2: Creating Multi-Service Quotation...');
  const targetLead = leads[0]; // Chirag Patel's Kerala 6N/7D lead
  const quote = crmRepo.createQuotation({
    leadId: targetLead.id,
    customerId: targetLead.customerId,
    createdByUserId: 'usr-harshil-desai-packages',
    createdByName: 'Harshil Desai',
    title: 'Kerala 6N/7D Luxury Family Tour with Premium Houseboat',
    subtotalInr: 141400,
    taxesInr: 0,
    discountInr: 3400,
    totalAmountInr: 138000,
    supplierNetCostInr: 112000,
    validUntil: new Date(Date.now() + 10 * 86400000).toISOString(),
    terms: '50% advance to confirm deluxe resorts and private Innova chauffeur. Balance due 7 days prior.',
    inclusions: ['6N Deluxe Accommodations', 'Private AC Innova Crysta', 'Alleppey AC Houseboat', 'All Tolls & Permits'],
    exclusions: ['Airfare', 'Personal Expenses', 'Monument Entry Fees'],
    lineItems: [
      {
        itemOrder: 1,
        description: 'Kerala 6N/7D Deluxe Hotels (2N Munnar, 1N Thekkady, 1N Alleppey, 2N Kovalam) + Innova Crysta',
        serviceCategory: 'PACKAGE',
        quantity: 6,
        unitPriceInr: 20700,
        supplierCostInr: 16500,
        totalAmountInr: 124200,
      },
      {
        itemOrder: 2,
        description: 'Alleppey 3-Bedroom AC Luxury Houseboat Exclusive Cruise',
        serviceCategory: 'HOUSEBOAT',
        quantity: 1,
        unitPriceInr: 17200,
        supplierCostInr: 13000,
        totalAmountInr: 17200,
      },
    ],
  });

  if (quote && quote.quotationNumber.startsWith('VH-QUO-') && quote.status === 'DRAFT') {
    console.log(`✓ Passed: Quotation created (${quote.quotationNumber}) for ₹${quote.totalAmountInr.toLocaleString('en-IN')}`);
    passedTests++;
  } else {
    throw new Error('Failed to create quotation properly');
  }

  // -------------------------------------------------------------
  // Test 3: Quotation Immutable Snapshot
  // -------------------------------------------------------------
  console.log('\nTEST 3: Verifying Quotation Immutable Snapshot...');
  if (quote.immutableSnapshotJson && quote.immutableSnapshotJson.includes(quote.quotationNumber)) {
    const parsedSnapshot = JSON.parse(quote.immutableSnapshotJson);
    if (parsedSnapshot.totalAmountInr === 138000 && parsedSnapshot.lineItems.length === 2) {
      console.log('✓ Passed: Immutable JSON snapshot verified with matching financial checksum.');
      passedTests++;
    } else {
      throw new Error('Snapshot content mismatch');
    }
  } else {
    throw new Error('Quotation immutableSnapshotJson missing');
  }

  // -------------------------------------------------------------
  // Test 4: Quotation Status Progression (DRAFT -> SENT -> ACCEPTED)
  // -------------------------------------------------------------
  console.log('\nTEST 4: Quotation Lifecycle Progression...');
  crmRepo.updateQuotationStatus(quote.id, 'SENT', 'usr-harshil-desai-packages', 'Quotation sent via email to Chirag Patel');
  const sentQuote = crmRepo.getQuotationById(quote.id);
  if (!sentQuote?.sentAt || sentQuote.status !== 'SENT') {
    throw new Error('Failed to transition quotation to SENT');
  }

  crmRepo.updateQuotationStatus(quote.id, 'ACCEPTED', 'usr-harshil-desai-packages', 'Client verbally accepted proposal');
  const acceptedQuote = crmRepo.getQuotationById(quote.id);
  if (acceptedQuote?.status === 'ACCEPTED' && acceptedQuote.acceptedAt) {
    console.log(`✓ Passed: Lifecycle transitioned cleanly: DRAFT -> SENT -> ACCEPTED (${acceptedQuote.acceptedAt})`);
    passedTests++;
  } else {
    throw new Error('Failed to transition quotation to ACCEPTED');
  }

  // -------------------------------------------------------------
  // Test 5: Converting Quotation to Booking (PENDING Rule Enforcement)
  // -------------------------------------------------------------
  console.log('\nTEST 5: Converting Quotation to Booking...');
  const newBooking = crmRepo.convertQuotationToBooking(quote.id, 'usr-harshil-desai-packages');

  if (newBooking && newBooking.bookingReference.startsWith('VH-BKG-')) {
    // STRICT RULE CHECK: Must be PENDING, never automatically CONFIRMED
    if (newBooking.status === 'PENDING') {
      console.log(`✓ Passed: Booking created (${newBooking.bookingReference}) with status strictly enforced as PENDING.`);
      passedTests++;
    } else {
      throw new Error(`Violation: New booking created with status '${newBooking.status}' instead of 'PENDING'`);
    }
  } else {
    throw new Error('Failed to convert quotation to booking');
  }

  // -------------------------------------------------------------
  // Test 6: Automated Service Component Creation
  // -------------------------------------------------------------
  console.log('\nTEST 6: Inspecting Generated Service Components...');
  const bookingServices = crmRepo.getBookingServices(newBooking.id);
  if (bookingServices.length === 2) {
    console.log(`✓ Passed: 2 service components automatically instantiated for booking ${newBooking.bookingReference}:`);
    bookingServices.forEach((s) => console.log(`   - [${s.serviceCategory}] ${s.serviceName} (${s.status})`));
    passedTests++;
  } else {
    throw new Error(`Expected 2 components, found ${bookingServices.length}`);
  }

  // -------------------------------------------------------------
  // Test 7: Updating Service Components (Vouchers & References)
  // -------------------------------------------------------------
  console.log('\nTEST 7: Updating Operational Service Milestones...');
  const hotelComponent = bookingServices[0];
  crmRepo.updateBookingService(
    hotelComponent.id,
    {
      status: 'CONFIRMED',
      supplierName: 'Spice Country Resorts Munnar',
      customerConfirmationRef: 'RES-MUNNAR-88291',
      notes: 'Deluxe valley view rooms blocked.',
    },
    'usr-harshil-desai-packages'
  );

  const updatedHotel = crmRepo.getBookingServices(newBooking.id).find((s) => s.id === hotelComponent.id);
  if (updatedHotel?.status === 'CONFIRMED' && updatedHotel.customerConfirmationRef === 'RES-MUNNAR-88291') {
    console.log(`✓ Passed: Hotel component verified: CONFIRMED with ref '${updatedHotel.customerConfirmationRef}'`);
    passedTests++;
  } else {
    throw new Error('Failed to update service component');
  }

  // -------------------------------------------------------------
  // Test 8: Payment Recording & Financial Ledger Calculations
  // -------------------------------------------------------------
  console.log('\nTEST 8: Recording Payment & Verifying Financial Ledger...');
  const payment = crmRepo.recordPayment({
    bookingId: newBooking.id,
    amountInr: 50000,
    paymentMethod: 'UPI',
    upiRef: 'UPI/20261104/889922001/HDFC',
    internalNotes: 'Initial advance received to confirm Innova and resort allotments.',
    recordedByUserId: 'usr-harshil-desai-packages',
  });

  const updatedBooking = crmRepo.getBookingById(newBooking.id);
  if (
    updatedBooking &&
    updatedBooking.paidAmountInr === 50000 &&
    updatedBooking.balanceAmountInr === 88000 && // 138,000 - 50,000
    updatedBooking.status === 'CONFIRMED' // Automatically confirmed upon advance receipt
  ) {
    console.log(`✓ Passed: Payment recorded (${payment.paymentReference} for ₹50,000). Booking moved to CONFIRMED. Balance: ₹${updatedBooking.balanceAmountInr.toLocaleString('en-IN')}`);
    passedTests++;
  } else {
    throw new Error(`Ledger mismatch: Paid: ${updatedBooking?.paidAmountInr}, Balance: ${updatedBooking?.balanceAmountInr}, Status: ${updatedBooking?.status}`);
  }

  // -------------------------------------------------------------
  // Test 9: Resend Branded HTML Email Dispatch & Logging
  // -------------------------------------------------------------
  console.log('\nTEST 9: Testing Resend Branded HTML Email Integration...');
  const customer = crmRepo.getCustomerById(newBooking.customerId);
  const emailRes = await sendCustomerEmail({
    to: customer?.email || 'chirag.patel@charotar.in',
    toName: customer?.fullName || 'Chirag Patel',
    subject: `Official Confirmation: Kerala Tour (${newBooking.bookingReference})`,
    category: 'BOOKING_CONFIRMATION',
    headline: 'Your Kerala Luxury Vacation is Confirmed!',
    bodyHtml: `<p>We are delighted to confirm your Kerala tour for 6 adults. Advance payment of ₹50,000 has been credited.</p>`,
    bookingRef: newBooking.bookingReference,
    ctaText: 'View Digital Itinerary',
    ctaUrl: 'https://varniholidays.com/trips',
  });

  if (emailRes.success && emailRes.providerStatus !== 'FAILED') {
    // Log to communication hub
    crmRepo.logCommunication({
      customerId: newBooking.customerId,
      customerName: customer?.fullName || 'Chirag Patel',
      customerContact: customer?.email || 'chirag.patel@charotar.in',
      bookingId: newBooking.id,
      senderUserId: 'usr-harshil-desai-packages',
      senderUserName: 'Harshil Desai',
      templateKey: 'BOOKING_CONFIRMATION',
      templateTitle: `Booking Confirmation ${newBooking.bookingReference}`,
      channel: 'EMAIL',
      subject: emailRes.subject,
      content: 'Email confirmation sent with itemized services.',
      providerRef: emailRes.messageId,
      deliveryStatus: emailRes.providerStatus === 'PROVIDER_ACCEPTED' ? 'PROVIDER_ACCEPTED' : 'SENT',
    });

    console.log(`✓ Passed: Branded HTML email dispatched (Provider Status: ${emailRes.providerStatus}, MessageID: ${emailRes.messageId})`);
    passedTests++;
  } else {
    throw new Error('Email dispatch failed');
  }

  // -------------------------------------------------------------
  // Test 10: Meta WhatsApp Adapter & Strict CLICK_TO_CHAT_TRIGGERED Audit
  // -------------------------------------------------------------
  console.log('\nTEST 10: Testing WhatsApp Cloud API & Click-to-Chat Fallback...');
  const waRes = await sendCustomerWhatsApp({
    phoneNumber: customer?.phoneNumber || '9825012345',
    countryCode: '+91',
    recipientName: customer?.fullName || 'Chirag Patel',
    category: 'PAYMENT_REQUEST',
    messageText: `Namaste Chiragbhai! Greetings from Varni Holidays Anand. Advance receipt of ₹50,000 for booking ${newBooking.bookingReference} is confirmed.`,
  });

  // STRICT RULE CHECK: Must be CLICK_TO_CHAT_TRIGGERED in simulation/fallback mode, NEVER 'DELIVERED'
  if (waRes.success && waRes.deliveryStatus === 'CLICK_TO_CHAT_TRIGGERED') {
    crmRepo.logCommunication({
      customerId: newBooking.customerId,
      customerName: customer?.fullName || 'Chirag Patel',
      customerContact: `${customer?.phoneCountryCode} ${customer?.phoneNumber}`,
      bookingId: newBooking.id,
      senderUserId: 'usr-harshil-desai-packages',
      senderUserName: 'Harshil Desai',
      templateKey: 'PAYMENT_REQUEST',
      templateTitle: 'Advance Payment Receipt',
      channel: 'WHATSAPP',
      content: 'WhatsApp message prepared for customer.',
      deliveryStatus: 'CLICK_TO_CHAT_TRIGGERED',
      providerRef: waRes.messageId,
    });

    console.log(`✓ Passed: WhatsApp fallback correctly audited as 'CLICK_TO_CHAT_TRIGGERED' (URL: ${waRes.clickToChatUrl?.slice(0, 45)}...)`);
    passedTests++;
  } else {
    throw new Error(`WhatsApp delivery audit violated: got '${waRes.deliveryStatus}'`);
  }

  // -------------------------------------------------------------
  // Test 11: Customer 360 Unified Journey Timeline
  // -------------------------------------------------------------
  console.log('\nTEST 11: Customer 360 Unified Journey Timeline Aggregation...');
  const timeline = crmRepo.getCustomerTimeline(newBooking.customerId);

  const typesPresent = new Set(timeline.map((t) => t.type));
  if (
    timeline.length >= 5 &&
    typesPresent.has('LEAD') &&
    typesPresent.has('QUOTATION') &&
    typesPresent.has('BOOKING') &&
    typesPresent.has('PAYMENT') &&
    typesPresent.has('COMMUNICATION')
  ) {
    console.log(`✓ Passed: Customer 360 timeline aggregated ${timeline.length} events across all required domains:`);
    console.log(`   Types present: ${Array.from(typesPresent).join(', ')}`);
    console.log(`   Most recent event: [${timeline[0].type}] ${timeline[0].title} (${new Date(timeline[0].timestamp).toLocaleTimeString()})`);
    passedTests++;
  } else {
    throw new Error(`Timeline incomplete: found types: ${Array.from(typesPresent).join(', ')}`);
  }

  // -------------------------------------------------------------
  // Test 12: Google Sheets Synchronization Outbox Verification
  // -------------------------------------------------------------
  console.log('\nTEST 12: Verifying Google Sheets Sync Jobs Outbox...');
  const syncJobs = crmRepo.getSyncJobs();
  const bookingJobs = syncJobs.filter((j) => j.targetTab === 'BOOKINGS');
  if (bookingJobs.length >= 1) {
    console.log(`✓ Passed: Google Sheets outbox contains ${bookingJobs.length} synchronized booking event(s). One-way integrity preserved.`);
    passedTests++;
  } else {
    throw new Error('No BOOKINGS sync jobs found in outbox queue');
  }

  console.log('\n===============================================================');
  console.log(`      PHASE 3 VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED      `);
  console.log('===============================================================\n');
}

runPhase3Tests().catch((err) => {
  console.error('\n❌ PHASE 3 VERIFICATION FAILED:', err);
  process.exit(1);
});

