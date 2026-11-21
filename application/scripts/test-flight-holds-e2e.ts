/**
 * Automated End-to-End Test Suite for Flight Hold Booking Queue & PNR Management
 * Run with: npx tsx scripts/test-flight-holds-e2e.ts
 */

import { prisma } from '../lib/prisma';
import {
  createFlightHoldAction,
  extendFlightHoldAction,
  issueFlightHoldAction,
  cancelFlightHoldAction,
  runFlightHoldSchedulerAction,
  getFlightHoldStatsAction,
  getFlightHoldsAction,
} from '../app/actions/flight-holds';

async function runE2ETests() {
  console.log('✈️  STARTING FLIGHT HOLD & PNR MANAGEMENT END-TO-END TEST SUITE\n');

  try {
    // 0. Clean any previous test artifacts
    await prisma.flightHoldPNR.deleteMany({
      where: {
        pnr: { in: ['VHE2E1', 'VHE2E2', 'VHE2E3'] },
      },
    });

    console.log('✅ Cleaned previous test records.');

    // 1. TEST: Create Normal Hold (> 10h remaining)
    console.log('\n--- Test 1: Create Normal Hold (>10h) ---');
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours later
    const travelDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    const res1 = await createFlightHoldAction({
      pnr: 'VHE2E1',
      passengerName: 'Rajesh Patel',
      travelRoute: 'BOM - DXB - BOM',
      travelDate: travelDate.toISOString().split('T')[0],
      platform: 'AMADEUS',
      holdTillDateTime: futureDate.toISOString(),
      internalNotes: 'Client awaiting visa confirmation before ticketing',
    });

    if (!res1.success || !res1.data) {
      throw new Error(`Failed Test 1: ${res1.error}`);
    }
    console.log('✅ Hold VHE2E1 created successfully. ID:', res1.data.id);

    // Verify reminder was scheduled for 10h before
    const reminders1 = await prisma.flightHoldReminder.findMany({
      where: { flightHoldId: res1.data.id },
    });
    console.log(`✅ Reminders created: ${reminders1.length}, Type: ${reminders1[0]?.reminderType}, Status: ${reminders1[0]?.status}`);
    if (reminders1[0]?.reminderType !== 'TEN_HOUR_WARNING' || reminders1[0]?.status !== 'PENDING') {
      throw new Error('Test 1 Reminder validation failed');
    }

    // 2. TEST: Create Urgent Hold (<= 10h remaining)
    console.log('\n--- Test 2: Create Urgent Hold (<=10h) ---');
    const urgentDate = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours later

    const res2 = await createFlightHoldAction({
      pnr: 'VHE2E2',
      passengerName: 'Ananya Sharma',
      travelRoute: 'DEL - LHR - DEL',
      travelDate: travelDate.toISOString().split('T')[0],
      platform: 'OTHER',
      platformOtherName: 'TBO Holidays',
      holdTillDateTime: urgentDate.toISOString(),
      internalNotes: 'Urgent fare lock expiring this afternoon',
    });

    if (!res2.success || !res2.data) {
      throw new Error(`Failed Test 2: ${res2.error}`);
    }
    console.log('✅ Urgent Hold VHE2E2 created successfully. ID:', res2.data.id);

    const reminders2 = await prisma.flightHoldReminder.findMany({
      where: { flightHoldId: res2.data.id },
    });
    console.log(`✅ Urgent Reminder Type: ${reminders2[0]?.reminderType}, Status: ${reminders2[0]?.status}`);
    if (reminders2[0]?.reminderType !== 'URGENT_IMMEDIATE' || reminders2[0]?.status !== 'TRIGGERED') {
      throw new Error('Test 2 Urgent Reminder validation failed');
    }

    // 3. TEST: Extend Hold
    console.log('\n--- Test 3: Extend Hold ---');
    const extendedDate = new Date(futureDate.getTime() + 12 * 60 * 60 * 1000); // +12 hours
    const res3 = await extendFlightHoldAction({
      id: res1.data.id,
      newHoldTillDateTime: extendedDate.toISOString(),
      extensionReason: 'Airline sales manager granted an additional 12-hour waiver',
    });

    if (!res3.success) {
      throw new Error(`Failed Test 3: ${res3.error}`);
    }
    console.log('✅ Hold VHE2E1 extended successfully to:', extendedDate.toISOString());

    const extensions1 = await prisma.flightHoldExtension.findMany({
      where: { flightHoldId: res1.data.id },
    });
    console.log(`✅ Extension recorded in DB: count = ${extensions1.length}`);

    // 4. TEST: Issue Ticket
    console.log('\n--- Test 4: Issue Ticket ---');
    const res4 = await issueFlightHoldAction({
      id: res1.data.id,
      paymentMode: 'UPI',
      issuedFrom: 'Amadeus',
      issuanceAmountInr: 34500.5,
      airlineTicketNumber: '098-9928172901',
    });

    if (!res4.success) {
      throw new Error(`Failed Test 4: ${res4.error}`);
    }
    console.log('✅ PNR VHE2E1 successfully issued! Amount: ₹34,500.50, Mode: UPI');

    const updatedHold1 = await prisma.flightHoldPNR.findUnique({
      where: { id: res1.data.id },
    });
    if (updatedHold1?.status !== 'ISSUED') {
      throw new Error('Hold status should be ISSUED');
    }

    // 5. TEST: Cancel Hold
    console.log('\n--- Test 5: Cancel Hold ---');
    const res5 = await cancelFlightHoldAction({
      id: res2.data.id,
      cancellationReason: 'Client decided to postpone trip to next quarter',
    });

    if (!res5.success) {
      throw new Error(`Failed Test 5: ${res5.error}`);
    }
    console.log('✅ Hold VHE2E2 successfully cancelled!');

    const updatedHold2 = await prisma.flightHoldPNR.findUnique({
      where: { id: res2.data.id },
    });
    if (updatedHold2?.status !== 'CANCELLED') {
      throw new Error('Hold status should be CANCELLED');
    }

    // 6. TEST: Auto-Expiration / Release Engine
    console.log('\n--- Test 6: Auto-Release Engine ---');
    // Create a hold that expired 1 hour ago
    const pastDate = new Date(Date.now() - 60 * 60 * 1000);
    const holdExpired = await prisma.flightHoldPNR.create({
      data: {
        pnr: 'VHE2E3',
        passengerName: 'Expired Test Passenger',
        travelRoute: 'AMD - BOM',
        travelDate: travelDate,
        platform: 'RC',
        holdTillDateTime: pastDate,
        status: 'ON_HOLD',
      },
    });

    console.log('Created expired hold VHE2E3. Triggering scheduler...');
    const schedulerRes = await runFlightHoldSchedulerAction();
    console.log('Scheduler Result:', schedulerRes);

    const releasedHold = await prisma.flightHoldPNR.findUnique({
      where: { id: holdExpired.id },
      include: { actionHistory: true },
    });

    console.log('Hold VHE2E3 Status after scheduler:', releasedHold?.status);
    if (releasedHold?.status !== 'RELEASED_NO_ACTION') {
      throw new Error('Expired hold should have been automatically marked RELEASED_NO_ACTION');
    }
    console.log('✅ Released Disclaimer in Audit Log:', releasedHold?.actionHistory?.[0]?.details);

    // 7. TEST: Stats & Queue Actions
    console.log('\n--- Test 7: Verify Dashboard Metrics & Queue ---');
    const statsRes = await getFlightHoldStatsAction();
    console.log('Current Dashboard Stats:', statsRes.data);

    const queueRes = await getFlightHoldsAction({ status: 'ALL' });
    console.log(`Queue total records returned: ${queueRes.data.length}`);

    // Cleanup test data
    await prisma.flightHoldPNR.deleteMany({
      where: {
        pnr: { in: ['VHE2E1', 'VHE2E2', 'VHE2E3'] },
      },
    });
    console.log('\n✅ Test records cleaned up successfully.');
    console.log('\n🎉 ALL FLIGHT HOLD & PNR E2E TESTS PASSED WITH 100% SUCCESS!\n');
  } catch (error: any) {
    console.error('❌ E2E TEST FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
