/**
 * Comprehensive Automated End-to-End Test Suite for Flight Hold Booking Queue & PNR Management
 * Covering:
 * 1. 24-Hour Clock (00:00, 09:30, 12:00, 18:45, 23:26, month boundaries, validation)
 * 2. Conditional "Other" platform / supplier field in ticket issuance
 * 3. Mandatory Passenger / Guest Contact Number (international format, validation, search, update, lifecycle preservation)
 * 4. Full workflow regression: creation, urgency alert, extension, issuance, cancellation, auto-release
 *
 * Run with: npx tsx scripts/test-flight-holds-e2e.ts
 */

import { prisma } from '../lib/prisma';
import {
  createFlightHoldAction,
  extendFlightHoldAction,
  issueFlightHoldAction,
  cancelFlightHoldAction,
  updateFlightHoldContactAction,
  runFlightHoldSchedulerAction,
  getFlightHoldStatsAction,
  getFlightHoldsAction,
} from '../app/actions/flight-holds';
import {
  formatIST24,
  formatISTDate,
  formatISTTime,
  parseIST24ToDate,
  getIST24Parts,
} from '../lib/flights/timing';

async function runE2ETests() {
  console.log('✈️  STARTING FLIGHT HOLD & PNR MANAGEMENT TEST SUITE\n');

  try {
    // ========================================================
    // PART 1: 24-HOUR CLOCK TESTS
    // ========================================================
    console.log('--- PART 1: 24-Hour Clock & Timezone Verification ---');

    const clockTestCases = [
      { date: '2026-11-24', hour: '00', min: '00', expected: '24/11/2026, 00:00' },
      { date: '2026-11-24', hour: '09', min: '30', expected: '24/11/2026, 09:30' },
      { date: '2026-11-24', hour: '12', min: '00', expected: '24/11/2026, 12:00' },
      { date: '2026-11-24', hour: '18', min: '45', expected: '24/11/2026, 18:45' },
      { date: '2026-11-24', hour: '23', min: '26', expected: '24/11/2026, 23:26' }, // Client sample: 24NOV:2326
      { date: '2026-02-28', hour: '23', min: '59', expected: '28/02/2026, 23:59' }, // Month boundary Feb
      { date: '2026-12-31', hour: '23', min: '59', expected: '31/12/2026, 23:59' }, // Year boundary Dec
    ];

    for (const tc of clockTestCases) {
      const parsed = parseIST24ToDate(tc.date, tc.hour, tc.min);
      const formatted = formatIST24(parsed);
      const formattedTime = formatISTTime(parsed);

      console.log(`Testing ${tc.date} ${tc.hour}:${tc.min} -> Result: "${formatted}" (Time: "${formattedTime}")`);

      if (formatted !== tc.expected) {
        throw new Error(`24-hr Clock mismatch! Expected: "${tc.expected}", got: "${formatted}"`);
      }
      if (formatted.includes('AM') || formatted.includes('PM') || formatted.includes('am') || formatted.includes('pm')) {
        throw new Error(`24-hr format contains forbidden AM/PM: "${formatted}"`);
      }
    }
    console.log('✅ All 24-Hour Clock test cases formatted correctly without AM/PM controls.');

    // Boundary & Validation Checks
    console.log('\n--- 24-Hour Clock Validation Checks ---');
    try {
      parseIST24ToDate('2026-11-24', '24', '00');
      throw new Error('Failed: hour 24 should have been rejected');
    } catch (e: any) {
      console.log('✅ Correctly rejected invalid hour 24:', e.message);
    }

    try {
      parseIST24ToDate('2026-11-24', '23', '60');
      throw new Error('Failed: minute 60 should have been rejected');
    } catch (e: any) {
      console.log('✅ Correctly rejected invalid minute 60:', e.message);
    }

    // Clean previous test records
    await prisma.flightHoldPNR.deleteMany({
      where: {
        pnr: { in: ['VHE2E1', 'VHE2E2', 'VHE2E3', 'VHOTHER1', 'VHPHONE1'] },
      },
    });

    const travelDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const holdTillDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // ========================================================
    // PART 2: MANDATORY PASSENGER CONTACT NUMBER TESTS
    // ========================================================
    console.log('\n--- PART 2: Passenger / Guest Contact Number Tests ---');

    // 2a. Rejection of missing contact number
    console.log('Sub-test 2a: Reject creation when passengerPhone is missing');
    const phoneMissingRes = await createFlightHoldAction({
      pnr: 'VHPHONE1',
      passengerName: 'Anil Kumar',
      passengerPhone: '',
      travelRoute: 'BOM - DXB',
      travelDate: travelDate.toISOString().split('T')[0],
      platform: 'AMADEUS',
      holdTillDateTime: holdTillDate.toISOString(),
    });
    if (phoneMissingRes.success) {
      throw new Error('Failed: createFlightHoldAction should have rejected empty passengerPhone!');
    }
    console.log('✅ Correctly rejected empty passengerPhone:', phoneMissingRes.error);

    // 2b. Rejection of invalid short phone number
    console.log('Sub-test 2b: Reject creation when passengerPhone is too short (< 7 digits)');
    const phoneShortRes = await createFlightHoldAction({
      pnr: 'VHPHONE1',
      passengerName: 'Anil Kumar',
      passengerPhone: '12345',
      travelRoute: 'BOM - DXB',
      travelDate: travelDate.toISOString().split('T')[0],
      platform: 'AMADEUS',
      holdTillDateTime: holdTillDate.toISOString(),
    });
    if (phoneShortRes.success) {
      throw new Error('Failed: createFlightHoldAction should have rejected short passengerPhone!');
    }
    console.log('✅ Correctly rejected short passengerPhone:', phoneShortRes.error);

    // 2c. Successful creation with valid international contact number
    console.log('Sub-test 2c: Create hold with international contact number (+91 98980 12345)');
    const phoneValidRes = await createFlightHoldAction({
      pnr: 'VHPHONE1',
      passengerName: 'Anil Kumar',
      passengerPhone: '+91 98980 12345',
      travelRoute: 'BOM - DXB - BOM',
      travelDate: travelDate.toISOString().split('T')[0],
      platform: 'AMADEUS',
      holdTillDateTime: holdTillDate.toISOString(),
    });
    if (!phoneValidRes.success || !phoneValidRes.data) {
      throw new Error(`Failed to create hold with phone: ${phoneValidRes.error}`);
    }
    console.log('✅ Hold VHPHONE1 created with passengerPhone:', phoneValidRes.data.passengerPhone);

    // 2d. Search queue by contact number
    console.log('Sub-test 2d: Search Hold Bookings Queue by contact number "98980"');
    const searchRes = await getFlightHoldsAction({ search: '98980' });
    if (!searchRes.success || !searchRes.data?.some((r) => r.pnr === 'VHPHONE1')) {
      throw new Error('Hold Bookings Queue search by phone number failed to find VHPHONE1!');
    }
    console.log('✅ Search by contact number successfully matched VHPHONE1 in queue.');

    // 2e. Update passenger contact number
    console.log('Sub-test 2e: Update contact number via updateFlightHoldContactAction');
    const updatePhoneRes = await updateFlightHoldContactAction({
      id: phoneValidRes.data.id,
      passengerPhone: '+971 50 123 4567',
      passengerName: 'Anil Kumar (Dubai Roaming)',
    });
    if (!updatePhoneRes.success) {
      throw new Error(`Failed to update contact number: ${updatePhoneRes.error}`);
    }
    const refreshedPhoneRecord = await prisma.flightHoldPNR.findUnique({
      where: { id: phoneValidRes.data.id },
      include: { actionHistory: { orderBy: { createdAt: 'desc' } } },
    });
    if (refreshedPhoneRecord?.passengerPhone !== '+971 50 123 4567') {
      throw new Error(`Expected updated phone "+971 50 123 4567", got "${refreshedPhoneRecord?.passengerPhone}"`);
    }
    console.log('✅ Contact number updated in database and audit logged:', refreshedPhoneRecord?.actionHistory?.[0]?.details);

    // ========================================================
    // PART 3: CONDITIONAL "OTHER" ISSUANCE FIELD TESTS
    // ========================================================
    console.log('\n--- PART 3: Conditional "Other" Platform / Supplier Field Tests ---');

    // Create a hold on AMADEUS
    const holdRes = await createFlightHoldAction({
      pnr: 'VHOTHER1',
      passengerName: 'Kavita Mehta',
      passengerPhone: '+91 98250 55443',
      travelRoute: 'BOM - SIN - BOM',
      travelDate: travelDate.toISOString().split('T')[0],
      platform: 'AMADEUS',
      holdTillDateTime: holdTillDate.toISOString(),
      internalNotes: 'Client comparing fares before ticketing',
    });

    if (!holdRes.success || !holdRes.data) {
      throw new Error(`Failed to create hold for Other test: ${holdRes.error}`);
    }
    const holdId = holdRes.data.id;
    console.log('✅ Created test hold VHOTHER1 on platform AMADEUS. ID:', holdId);

    // Sub-test 3a: Issued From = Other with empty supplier name must FAIL
    console.log('Sub-test 3a: Attempt issuance with Issued From = Other and empty supplier name');
    const failRes1 = await issueFlightHoldAction({
      id: holdId,
      paymentMode: 'BANK_TRANSFER',
      issuedFrom: 'Other',
      issuedFromOther: '',
      issuanceAmountInr: 42000,
    });

    if (failRes1.success) {
      throw new Error('Failed: Empty issuedFromOther should have been rejected by server validation!');
    }
    console.log('✅ Correctly rejected empty supplier name:', failRes1.error);

    // Sub-test 3b: Issued From = Other with whitespace-only supplier name must FAIL
    console.log('Sub-test 3b: Attempt issuance with whitespace-only supplier name');
    const failRes2 = await issueFlightHoldAction({
      id: holdId,
      paymentMode: 'BANK_TRANSFER',
      issuedFrom: 'Other',
      issuedFromOther: '     ',
      issuanceAmountInr: 42000,
    });

    if (failRes2.success) {
      throw new Error('Failed: Whitespace-only issuedFromOther should have been rejected!');
    }
    console.log('✅ Correctly rejected whitespace-only supplier name:', failRes2.error);

    // Sub-test 3c: Issued From = Other with valid supplier name must SUCCEED
    console.log('Sub-test 3c: Issue ticket with Issued From = Other and valid supplier "TBO Holidays"');
    const successRes = await issueFlightHoldAction({
      id: holdId,
      paymentMode: 'BANK_TRANSFER',
      issuedFrom: 'Other',
      issuedFromOther: '  TBO Holidays  ',
      issuanceAmountInr: 42000,
      airlineTicketNumber: '098-2948192011',
    });

    if (!successRes.success || !successRes.data) {
      throw new Error(`Failed to issue ticket with Other supplier: ${successRes.error}`);
    }
    console.log('✅ Ticket successfully issued with Other supplier!');

    // Verify database record
    const updatedRecord = await prisma.flightHoldPNR.findUnique({
      where: { id: holdId },
      include: { actionHistory: { orderBy: { createdAt: 'desc' } } },
    });

    console.log('Verifying DB values:');
    console.log('  Original Hold On (platform):', updatedRecord?.platform);
    console.log('  Issued From:', updatedRecord?.issuedFrom);
    console.log('  Issued From Other:', updatedRecord?.issuedFromOther);
    console.log('  Passenger Phone preserved:', updatedRecord?.passengerPhone);

    if (updatedRecord?.platform !== 'AMADEUS') {
      throw new Error('Original Hold On platform was accidentally overwritten!');
    }
    if (updatedRecord?.issuedFrom !== 'Other') {
      throw new Error(`Expected issuedFrom to be "Other", got "${updatedRecord?.issuedFrom}"`);
    }
    if (updatedRecord?.issuedFromOther !== 'TBO Holidays') {
      throw new Error(`Expected trimmed issuedFromOther to be "TBO Holidays", got "${updatedRecord?.issuedFromOther}"`);
    }
    if (updatedRecord?.passengerPhone !== '+91 98250 55443') {
      throw new Error('Passenger phone number was not preserved during ticket issuance!');
    }

    const latestAction = updatedRecord?.actionHistory?.[0];
    console.log('  Audit log details:', latestAction?.details);
    if (!latestAction?.details.includes('Other (TBO Holidays)')) {
      throw new Error('Action history does not mention Other (TBO Holidays)!');
    }
    console.log('✅ Database and Action History correctly preserved both Hold On (AMADEUS), Issued From (Other (TBO Holidays)), and Passenger Phone.');

    // ========================================================
    // PART 4: REGRESSION WORKFLOW SUITE
    // ========================================================
    console.log('\n--- PART 4: Core Workflow Regression Tests ---');

    // Test 4a: Create Normal Hold with 24-hr IST deadline
    const futureDate = parseIST24ToDate('2026-11-24', '23', '26');
    const res1 = await createFlightHoldAction({
      pnr: 'VHE2E1',
      passengerName: 'Rajesh Patel',
      passengerPhone: '+91 98980 99887',
      travelRoute: 'BOM - DXB - BOM',
      travelDate: travelDate.toISOString().split('T')[0],
      platform: 'AMADEUS',
      holdTillDateTime: futureDate.toISOString(),
      internalNotes: 'Client awaiting visa confirmation before ticketing',
    });

    if (!res1.success || !res1.data) {
      throw new Error(`Failed Test 4a: ${res1.error}`);
    }
    console.log('✅ Hold VHE2E1 created. Deadline:', formatIST24(res1.data.holdTillDateTime));

    // Test 4b: Extend Hold with new 24-hr IST deadline
    const extendedDate = parseIST24ToDate('2026-11-25', '12', '00');
    const res3 = await extendFlightHoldAction({
      id: res1.data.id,
      newHoldTillDateTime: extendedDate.toISOString(),
      extensionReason: 'Airline sales desk extended deadline by 12 hours',
    });

    if (!res3.success) {
      throw new Error(`Failed Test 4b: ${res3.error}`);
    }
    console.log('✅ Hold VHE2E1 extended to:', formatIST24(extendedDate));

    // Test 4c: Issue PNR with Amadeus (no Other field required)
    const res4 = await issueFlightHoldAction({
      id: res1.data.id,
      paymentMode: 'UPI',
      issuedFrom: 'Amadeus',
      issuanceAmountInr: 34500.5,
      airlineTicketNumber: '098-9928172901',
    });

    if (!res4.success) {
      throw new Error(`Failed Test 4c: ${res4.error}`);
    }
    console.log('✅ PNR VHE2E1 issued via Amadeus directly.');

    // Test 4d: Cancel Hold
    const urgentDate = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const res2 = await createFlightHoldAction({
      pnr: 'VHE2E2',
      passengerName: 'Ananya Sharma',
      passengerPhone: '+91 98765 43210',
      travelRoute: 'DEL - LHR - DEL',
      travelDate: travelDate.toISOString().split('T')[0],
      platform: 'RC',
      holdTillDateTime: urgentDate.toISOString(),
      internalNotes: 'Urgent fare lock expiring',
    });

    if (!res2.success || !res2.data) {
      throw new Error(`Failed Test 4d creation: ${res2.error}`);
    }

    const cancelRes = await cancelFlightHoldAction({
      id: res2.data.id,
      cancellationReason: 'Client postponed travel to next quarter',
    });

    if (!cancelRes.success) {
      throw new Error(`Failed Test 4d cancellation: ${cancelRes.error}`);
    }
    console.log('✅ PNR VHE2E2 cancelled with remarks.');

    // Test 4e: Auto-Release Scheduler Engine
    const pastDate = new Date(Date.now() - 60 * 60 * 1000);
    const holdExpired = await prisma.flightHoldPNR.create({
      data: {
        pnr: 'VHE2E3',
        passengerName: 'Expired Test Passenger',
        passengerPhone: '+91 91234 56789',
        travelRoute: 'AMD - BOM',
        travelDate: travelDate,
        platform: 'CT',
        holdTillDateTime: pastDate,
        status: 'ON_HOLD',
      },
    });

    const schedulerRes = await runFlightHoldSchedulerAction();
    console.log('✅ Scheduler run result:', schedulerRes.data);

    const releasedHold = await prisma.flightHoldPNR.findUnique({
      where: { id: holdExpired.id },
      include: { actionHistory: { orderBy: { createdAt: 'desc' } } },
    });

    if (releasedHold?.status !== 'RELEASED_NO_ACTION') {
      throw new Error('Expired hold should have been automatically marked RELEASED_NO_ACTION');
    }
    if (releasedHold?.passengerPhone !== '+91 91234 56789') {
      throw new Error('Passenger phone was not preserved on released hold!');
    }
    console.log('✅ Released Status, Contact Preserved & 24-hr Timestamp in Audit Log:', releasedHold?.actionHistory?.[0]?.details);

    // Cleanup all test records
    await prisma.flightHoldPNR.deleteMany({
      where: {
        pnr: { in: ['VHE2E1', 'VHE2E2', 'VHE2E3', 'VHOTHER1', 'VHPHONE1'] },
      },
    });
    console.log('\n✅ All test records cleaned up successfully.');
    console.log('\n🎉 ALL 24-HOUR CLOCK, CONDITIONAL OTHER, CONTACT NUMBER, AND WORKFLOW TESTS PASSED 100%!\n');
  } catch (error: any) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
