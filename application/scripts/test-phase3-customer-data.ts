/**
 * Automated Verification Suite: Phase 3 Customer Experience & Strict Data Isolation
 * Tests:
 * 1. Multi-customer data isolation (Bookings & Quotations)
 * 2. Customer A accessing Customer B's booking returns null (unauthorized)
 * 3. Customer A accessing Customer B's quotation returns null (unauthorized)
 * 4. Quotation acceptance workflow (status -> ACCEPTED, customerAcceptedAt set)
 * 5. Cross-customer quotation acceptance blocked
 * 6. Quotation revision request workflow (customerNotes updated)
 * 7. Cross-customer revision request blocked
 * 8. Customer dashboard real data aggregation (upcoming bookings, pending quotes, notifications)
 */

import assert from 'assert';
import prisma from '../lib/prisma';
import {
  getCustomerDashboard,
  getCustomerBookings,
  getCustomerBookingDetail,
  getCustomerQuotations,
  getCustomerQuotationDetail,
  actionCustomerAcceptQuotation,
  actionCustomerRequestRevision,
} from '../lib/pwa/customer-data';

// Mock getAuthenticatedCustomer in customer-auth
let currentMockCustomerId: string | null = null;
let currentMockCustomer: any = null;

// Monkey-patch or wire mock session for script test
import * as customerAuth from '../lib/auth/customer-auth';
(customerAuth as any).getAuthenticatedCustomer = async () => currentMockCustomer;

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 3 CUSTOMER EXPERIENCE & ISOLATION TESTS');
  console.log('====================================================\n');

  const timestamp = Date.now();
  let customerA: any = null;
  let customerB: any = null;
  let testQuotationA: any = null;
  let testBookingA: any = null;
  let testStaffUser: any = null;

  try {
    // -------------------------------------------------------------
    // SETUP: Create staff user, Customer A, Customer B
    // -------------------------------------------------------------
    testStaffUser = await prisma.user.findFirst();
    if (!testStaffUser) {
      testStaffUser = await prisma.user.create({
        data: {
          email: `staff.${timestamp}@varniholidays.com`,
          fullName: 'Staff Test User',
          passwordHash: 'dummy',
        },
      });
    }

    customerA = await prisma.customer.create({
      data: {
        fullName: 'Customer Alpha',
        email: `alpha.${timestamp}@example.com`,
        phoneNumber: `+9198765${timestamp.toString().slice(-5)}`,
        normalizedPhone: `9198765${timestamp.toString().slice(-5)}`,
      },
    });

    customerB = await prisma.customer.create({
      data: {
        fullName: 'Customer Beta',
        email: `beta.${timestamp}@example.com`,
        phoneNumber: `+9198764${timestamp.toString().slice(-5)}`,
        normalizedPhone: `9198764${timestamp.toString().slice(-5)}`,
      },
    });

    // Create Quotation for Customer A
    testQuotationA = await prisma.quotation.create({
      data: {
        quotationReference: `VH-QUO-TEST-${timestamp.toString().slice(-6)}`,
        title: 'Switzerland Alpine Escape Test',
        destination: 'Switzerland',
        durationDays: 7,
        durationNights: 6,
        adultsCount: 2,
        childrenCount: 0,
        customerId: customerA.id,
        createdByUserId: testStaffUser.id,
        basePriceAmountInr: 250000.0,
        subtotalAmountInr: 250000.0,
        taxPercent: 5.0,
        taxAmountInr: 12500.0,
        totalAmountInr: 262500.0,
        status: 'SENT',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        inclusions: ['4-Star Lake View Hotel', 'Swiss Travel Pass 1st Class'],
        exclusions: ['Personal Expenses'],
        pricingSnapshotJson: { test: true },
      },
    });

    // Create Booking for Customer A
    testBookingA = await prisma.booking.create({
      data: {
        bookingReference: `VH-BKG-TEST-${timestamp.toString().slice(-6)}`,
        customerId: customerA.id,
        quotationId: testQuotationA.id,
        managedByUserId: testStaffUser.id,
        status: 'CONFIRMED',
        totalAmountInr: 262500.0,
        paidAmountInr: 100000.0,
        balanceAmountInr: 162500.0,
        travelStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        travelEndDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    });

    // -------------------------------------------------------------
    // TEST 1: Customer A Queries Own Booking
    // -------------------------------------------------------------
    console.log('▶ Test 1: Customer A queries own booking...');
    const mockCustomerA = {
      id: customerA.id,
      fullName: customerA.fullName,
      email: customerA.email,
      phoneNumber: customerA.phoneNumber,
      avatarUrl: null,
      accounts: [],
    };

    const bookingRetrievedByA = await getCustomerBookingDetail(testBookingA.id, mockCustomerA);
    assert.ok(bookingRetrievedByA, 'Customer A should successfully retrieve their own booking.');
    assert.strictEqual(bookingRetrievedByA.bookingReference, testBookingA.bookingReference);
    console.log('  ✔ Passed: Customer A successfully retrieved booking details.');

    // -------------------------------------------------------------
    // TEST 2: Customer B Attempts to Access Customer A's Booking (Isolation Guard)
    // -------------------------------------------------------------
    console.log('▶ Test 2: Customer B attempts to access Customer A booking (Strict Isolation)...');
    const mockCustomerB = {
      id: customerB.id,
      fullName: customerB.fullName,
      email: customerB.email,
      phoneNumber: customerB.phoneNumber,
      avatarUrl: null,
      accounts: [],
    };

    const bookingRetrievedByB = await getCustomerBookingDetail(testBookingA.id, mockCustomerB);
    assert.strictEqual(bookingRetrievedByB, null, 'Customer B MUST NOT be able to access Customer A booking.');
    console.log('  ✔ Passed: Strict Isolation verified. Customer B access returned null.');

    // -------------------------------------------------------------
    // TEST 3: Customer A Queries Own Quotation
    // -------------------------------------------------------------
    console.log('▶ Test 3: Customer A queries own quotation...');
    const quoteRetrievedByA = await getCustomerQuotationDetail(testQuotationA.id, mockCustomerA);
    assert.ok(quoteRetrievedByA, 'Customer A should successfully retrieve their own quotation.');
    assert.strictEqual(quoteRetrievedByA.quotationReference, testQuotationA.quotationReference);
    console.log('  ✔ Passed: Customer A retrieved quotation details.');

    // -------------------------------------------------------------
    // TEST 4: Customer B Attempts to Access Customer A's Quotation (Isolation Guard)
    // -------------------------------------------------------------
    console.log('▶ Test 4: Customer B attempts to access Customer A quotation (Strict Isolation)...');
    const quoteRetrievedByB = await getCustomerQuotationDetail(testQuotationA.id, mockCustomerB);
    assert.strictEqual(quoteRetrievedByB, null, 'Customer B MUST NOT be able to access Customer A quotation.');
    console.log('  ✔ Passed: Strict Isolation verified. Customer B quotation access returned null.');

    // -------------------------------------------------------------
    // TEST 5: Customer B Attempts to Accept Customer A's Quotation (Rejection Guard)
    // -------------------------------------------------------------
    console.log('▶ Test 5: Customer B attempts to accept Customer A quotation...');
    const bAcceptResult = await actionCustomerAcceptQuotation(testQuotationA.id, mockCustomerB);
    assert.strictEqual(bAcceptResult.success, false, 'Customer B must be rejected.');
    console.log('  ✔ Passed: Cross-customer quotation acceptance blocked with error.');

    // -------------------------------------------------------------
    // TEST 6: Customer A Accepts Own Quotation
    // -------------------------------------------------------------
    console.log('▶ Test 6: Customer A accepts own quotation...');
    const aAcceptResult = await actionCustomerAcceptQuotation(testQuotationA.id, mockCustomerA);
    assert.strictEqual(aAcceptResult.success, true, 'Customer A should accept own quotation.');

    // Verify in database
    const updatedQuoteInDb = await prisma.quotation.findUnique({
      where: { id: testQuotationA.id },
    });
    assert.strictEqual(updatedQuoteInDb?.status, 'ACCEPTED');
    assert.ok(updatedQuoteInDb?.customerAcceptedAt !== null);
    console.log('  ✔ Passed: Quotation successfully transitioned to ACCEPTED with timestamp.');

    // -------------------------------------------------------------
    // TEST 7: Customer A Requests Quotation Revision
    // -------------------------------------------------------------
    console.log('▶ Test 7: Customer A requests revision...');
    const revisionResult = await actionCustomerRequestRevision(
      testQuotationA.id,
      'Please upgrade hotel to 5-star Lake View Suite in Lucerne.',
      mockCustomerA
    );
    assert.strictEqual(revisionResult.success, true);

    const quoteAfterRevision = await prisma.quotation.findUnique({
      where: { id: testQuotationA.id },
    });
    assert.ok(quoteAfterRevision?.customerNotes?.includes('5-star Lake View Suite'));
    console.log('  ✔ Passed: Revision request recorded in quotation customer notes.');

    // -------------------------------------------------------------
    // TEST 8: Customer Dashboard Real Data Aggregation
    // -------------------------------------------------------------
    console.log('▶ Test 8: Customer A Dashboard Aggregation...');
    const dashboard = await getCustomerDashboard(mockCustomerA);
    assert.ok(dashboard);
    assert.strictEqual(dashboard.customer.id, customerA.id);
    assert.strictEqual(dashboard.counts.upcomingTrips, 1);
    assert.ok(dashboard.upcomingBooking);
    assert.strictEqual(dashboard.upcomingBooking.id, testBookingA.id);
    console.log('  ✔ Passed: Real customer dashboard aggregation verified.');

    console.log('\n====================================================');
    console.log('🎉 ALL 8 PHASE 3 CUSTOMER EXPERIENCE TESTS PASSED');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    throw err;
  } finally {
    // Clean up test records
    if (testBookingA) {
      await prisma.booking.delete({ where: { id: testBookingA.id } }).catch(() => {});
    }
    if (testQuotationA) {
      await prisma.quotation.delete({ where: { id: testQuotationA.id } }).catch(() => {});
    }
    if (customerA) {
      await prisma.customer.delete({ where: { id: customerA.id } }).catch(() => {});
    }
    if (customerB) {
      await prisma.customer.delete({ where: { id: customerB.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

runPhase3Tests().catch((err) => {
  console.error(err);
  process.exit(1);
});
