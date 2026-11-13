/**
 * Automated Verification Script for Advanced Quotation Generator
 * Tests all 12 core acceptance criteria specified in Section 11 of the SRS.
 */

import { crmRepo } from '../lib/crm/store';
import { calculateQuotationPricing } from '../lib/quotations/pricing';
import { generateQuotationPdf } from '../lib/quotations/pdf-generator';
import { TOUR_PACKAGES_CATALOGUE, HOTELS_CATALOGUE } from '../lib/quotations/catalogue';
import {
  createQuotationAction,
  updateQuotationDraftAction,
  createQuotationRevisionAction,
  updateQuotationStatusAction,
  sendQuotationEmailAction,
  getQuotationsDashboardAction,
  getQuotationDetailsAction,
} from '../app/actions/quotations';

async function runTests() {
  console.log('====================================================');
  console.log('VARNI HOLIDAYS - ADVANCED QUOTATION GENERATOR TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Create tour package quotation using catalogue
    // ----------------------------------------------------
    const keralaPkg = TOUR_PACKAGES_CATALOGUE[0];
    assert(!!keralaPkg, 'Kerala catalogue package exists');

    const originalCataloguePrice = keralaPkg.defaultPriceInr;
    console.log(`Original Kerala Catalogue Price: ₹${originalCataloguePrice}`);

    const res1 = await createQuotationAction({
      quotationType: 'PACKAGE',
      customerName: 'Chirag Patel',
      customerPhone: '+91 98250 12345',
      customerEmail: 'chirag.patel@charotar.in',
      city: 'Anand, Gujarat',
      actorId: 'usr-neel-patel-superadmin',
      title: keralaPkg.title,
      destination: keralaPkg.destination,
      durationNights: keralaPkg.durationNights,
      durationDays: keralaPkg.durationDays,
      adultsCount: 2,
      childrenCount: 1,
      roomsCount: 1,
      sourcePackageSlug: keralaPkg.slug,
      pricing: {
        basePriceInr: 28000, // Modified for this quote only!
        adultsCount: 2,
        childrenCount: 1,
        roomsCount: 1,
        transportChargesInr: 5000,
        extraChargesInr: 1000,
        discountType: 'FIXED',
        discountValue: 2000,
        taxPercent: 5,
      },
      inclusions: keralaPkg.inclusions,
      exclusions: keralaPkg.exclusions,
      itineraryDays: keralaPkg.itineraryDays,
    });

    assert(res1.success && !!res1.quotation, 'Test 1: Tour package quotation created successfully');
    const quote1 = res1.quotation!;
    console.log(`Quotation 1 Number: ${quote1.quotationNumber}, Total: ₹${quote1.totalAmountInr}`);

    // ----------------------------------------------------
    // TEST 2: Verify original catalogue price preserved
    // ----------------------------------------------------
    assert(
      keralaPkg.defaultPriceInr === originalCataloguePrice,
      'Test 2: Original catalogue package price remained unaltered after quotation pricing edit'
    );

    // ----------------------------------------------------
    // TEST 3: Create hotel quotation using fetched hotel details
    // ----------------------------------------------------
    const vembanadHotel = HOTELS_CATALOGUE[0];
    assert(!!vembanadHotel, 'Vembanad hotel collection exists');

    const resHotel = await createQuotationAction({
      quotationType: 'HOTEL',
      customerName: 'Dhaval Patel',
      customerPhone: '+91 98251 23456',
      customerEmail: 'dhaval.patel@example.com',
      city: 'Vadodara',
      actorId: 'usr-neel-patel-superadmin',
      title: `${vembanadHotel.name} Stay Package`,
      destination: vembanadHotel.location,
      adultsCount: 2,
      childrenCount: 0,
      roomsCount: 1,
      sourceHotelId: vembanadHotel.id,
      hotelDetails: {
        hotelName: vembanadHotel.name,
        location: vembanadHotel.location,
        roomType: vembanadHotel.roomTypes[0].name,
        mealPlan: 'CPAI',
        checkInTime: vembanadHotel.checkInTime,
        checkOutTime: vembanadHotel.checkOutTime,
        perks: vembanadHotel.perks,
      },
      pricing: {
        basePriceInr: 34500, // 3 nights @ 11,500
        adultsCount: 2,
        childrenCount: 0,
        roomsCount: 1,
        discountType: 'PERCENTAGE',
        discountValue: 10, // 10% discount
        taxPercent: 18, // 18% hotel GST
      },
      inclusions: vembanadHotel.perks,
      exclusions: ['Airfare transfers', 'Personal laundry'],
    });

    assert(resHotel.success && !!resHotel.quotation, 'Test 3: Hotel quotation created successfully');
    const quoteHotel = resHotel.quotation!;
    console.log(`Hotel Quotation Number: ${quoteHotel.quotationNumber}, Total: ₹${quoteHotel.totalAmountInr}`);

    // ----------------------------------------------------
    // TEST 4: Create manual quotation when no catalogue item exists
    // ----------------------------------------------------
    const resManual = await createQuotationAction({
      quotationType: 'CUSTOM',
      customerName: 'Anilbhai Shah',
      customerPhone: '+91 98240 55555',
      customerEmail: 'anil.shah@example.com',
      city: 'Nadiad',
      actorId: 'usr-neel-patel-superadmin',
      title: 'Bespoke Gujarat Saurashtra Temple & Wildlife Circuit',
      destination: 'Somnath, Dwarka, Gir Forest',
      durationNights: 4,
      durationDays: 5,
      adultsCount: 4,
      childrenCount: 0,
      roomsCount: 2,
      pricing: {
        basePriceInr: 42000,
        adultsCount: 4,
        childrenCount: 0,
        roomsCount: 2,
        transportChargesInr: 12000,
        extraChargesInr: 0,
        discountType: 'FIXED',
        discountValue: 0,
        taxPercent: 5,
      },
      inclusions: ['4 Nights 3-Star AC accommodation', 'Daily breakfast and dinner', 'AC Innova for all transfers'],
      exclusions: ['Temple VIP darshan tickets', 'Gir Lion Safari permits'],
    });

    assert(resManual.success && !!resManual.quotation, 'Test 4: Manual custom quotation created successfully');

    // ----------------------------------------------------
    // TEST 5: Link quotation to existing CRM enquiry
    // ----------------------------------------------------
    const leads = crmRepo.getLeads();
    const existingLead = leads[0];
    const resLeadLinked = await createQuotationAction({
      quotationType: 'PACKAGE',
      leadId: existingLead ? existingLead.id : undefined,
      customerName: 'Hardik Prajapati',
      customerPhone: '+91 98790 12345',
      customerEmail: 'hardik.prajapati@example.com',
      actorId: 'usr-neel-patel-superadmin',
      title: 'Kerala 5N/6D Winter Proposal for Enquiry',
      destination: 'Kerala, India',
      adultsCount: 2,
      childrenCount: 0,
      roomsCount: 1,
      pricing: {
        basePriceInr: 22000,
        adultsCount: 2,
        childrenCount: 0,
        roomsCount: 1,
        discountType: 'FIXED',
        discountValue: 1000,
        taxPercent: 5,
      },
    });

    assert(resLeadLinked.success && !!resLeadLinked.quotation, 'Test 5: Linked quotation to enquiry successfully');
    if (existingLead) {
      assert(resLeadLinked.quotation?.leadId === existingLead.id, 'Test 5: Lead ID correctly mapped');
    }

    // ----------------------------------------------------
    // TEST 6: Generate valid PDF buffer and verify bytes
    // ----------------------------------------------------
    const pdfBuffer = generateQuotationPdf({
      quotationNumber: quote1.quotationNumber,
      quotationType: 'PACKAGE',
      version: 1,
      title: quote1.title,
      createdAt: quote1.createdAt,
      validUntil: quote1.validUntil,
      customer: {
        fullName: quote1.customerName || 'Chirag Patel',
        phoneNumber: quote1.customerPhone || '+91 98250 12345',
        email: quote1.customerEmail,
        city: 'Anand, Gujarat',
      },
      destination: quote1.destination,
      durationNights: quote1.durationNights,
      durationDays: quote1.durationDays,
      adultsCount: quote1.adultsCount || 2,
      childrenCount: quote1.childrenCount || 0,
      roomsCount: quote1.roomsCount || 1,
      inclusions: quote1.inclusions || [],
      exclusions: quote1.exclusions || [],
      itineraryDays: quote1.itineraryDays,
      basePriceInr: quote1.basePriceInr || 28000,
      grossSubtotalInr: quote1.subtotalInr,
      discountAmountInr: quote1.discountInr,
      taxableSubtotalInr: quote1.subtotalInr,
      taxPercent: quote1.taxPercent || 5,
      taxAmountInr: quote1.taxesInr,
      totalPayableAmountInr: quote1.totalAmountInr,
    });

    assert(Buffer.isBuffer(pdfBuffer), 'Test 6: PDF generated as valid Node.js Buffer');
    assert(pdfBuffer.length > 5000, `Test 6: PDF buffer size is healthy (${pdfBuffer.length} bytes)`);
    const pdfMagic = pdfBuffer.slice(0, 5).toString('ascii');
    assert(pdfMagic.startsWith('%PDF-'), `Test 6: PDF magic byte header valid (${pdfMagic})`);

    // ----------------------------------------------------
    // TEST 7 & 8: Email PDF via Resend and verify email logs
    // ----------------------------------------------------
    const emailRes = await sendQuotationEmailAction({
      quotationId: quote1.id,
      recipientEmail: 'chirag.patel@charotar.in',
      subject: 'Your Official Kerala Vacation Proposal - Varni Holidays',
      customMessage: 'Namaste Chiragbhai, please find your complete quotation attached.',
      actorId: 'usr-neel-patel-superadmin',
    });

    assert(emailRes.success, 'Test 7: Quotation email sent / simulated successfully');
    const logs = crmRepo.getQuotationEmailLogs(quote1.id);
    assert(logs.length > 0, `Test 8: Email log recorded in repository (${logs.length} log entry)`);
    assert(logs[0].recipientEmail === 'chirag.patel@charotar.in', 'Test 8: Recipient email matches');

    // ----------------------------------------------------
    // TEST 9: Edit draft quotation
    // ----------------------------------------------------
    // Create fresh draft
    const draftRes = await createQuotationAction({
      quotationType: 'PACKAGE',
      customerName: 'Test Draft User',
      customerPhone: '+91 99999 11111',
      actorId: 'usr-neel-patel-superadmin',
      title: 'Initial Draft Proposal',
      pricing: {
        basePriceInr: 15000,
        adultsCount: 2,
        childrenCount: 0,
        roomsCount: 1,
        discountType: 'FIXED',
        discountValue: 0,
        taxPercent: 5,
      },
    });

    const draftQuote = draftRes.quotation!;
    const editRes = await updateQuotationDraftAction(draftQuote.id, {
      title: 'Updated Draft Proposal - Luxury Upgrade',
      pricing: {
        basePriceInr: 20000,
        adultsCount: 2,
        childrenCount: 0,
        roomsCount: 1,
        discountType: 'FIXED',
        discountValue: 1000,
        taxPercent: 5,
      },
      actorId: 'usr-neel-patel-superadmin',
    });

    assert(editRes.success, 'Test 9: Draft updated successfully');
    assert(editRes.quotation?.title.includes('Luxury Upgrade'), 'Test 9: Draft title reflected edit');

    // ----------------------------------------------------
    // TEST 10: Revise sent quotation and verify original preserved
    // ----------------------------------------------------
    // Update quote1 to SENT
    crmRepo.updateQuotationStatus(quote1.id, 'SENT', 'usr-neel-patel-superadmin');
    const originalSentAmount = quote1.totalAmountInr;

    const revRes = await createQuotationRevisionAction(quote1.id, 'usr-neel-patel-superadmin');
    assert(revRes.success && !!revRes.quotation, 'Test 10: Revision created successfully');
    const revision = revRes.quotation!;
    assert(revision.revisionNumber === 1, 'Test 10: Revision number is 1');
    assert(revision.quotationNumber.endsWith('-R1'), `Test 10: Quotation number ends with -R1 (${revision.quotationNumber})`);
    assert(revision.parentQuotationId === quote1.id, 'Test 10: Parent quotation ID correctly linked');

    // Verify original quote1 is untouched
    const freshOriginal = crmRepo.getQuotationById(quote1.id)!;
    assert(freshOriginal.totalAmountInr === originalSentAmount, 'Test 10: Original sent quotation amount unchanged');
    assert(freshOriginal.status === 'SENT', 'Test 10: Original sent quotation status intact');

    // ----------------------------------------------------
    // TEST 11 & 12: Pricing calculations & edge cases
    // ----------------------------------------------------
    // Edge case A: 100% discount
    const pZero = calculateQuotationPricing({
      basePriceInr: 10000,
      adultsCount: 1,
      childrenCount: 0,
      roomsCount: 1,
      discountType: 'PERCENTAGE',
      discountValue: 100,
      taxPercent: 5,
    });
    assert(pZero.totalPayableAmountInr === 0, 'Test 12: 100% discount produces 0 total payable');

    // Edge case B: High GST calculation check
    const pHotel = calculateQuotationPricing({
      basePriceInr: 10000,
      adultsCount: 2,
      childrenCount: 0,
      roomsCount: 1,
      transportChargesInr: 2000,
      discountType: 'FIXED',
      discountValue: 2000, // 12000 - 2000 = 10000 taxable
      taxPercent: 18,
    });
    assert(pHotel.taxableSubtotalInr === 10000, 'Test 12: Taxable subtotal correctly computed as 10000');
    assert(pHotel.taxAmountInr === 1800, 'Test 12: 18% GST correctly computed as 1800');
    assert(pHotel.cgstAmountInr === 900, 'Test 12: CGST split 900');
    assert(pHotel.sgstAmountInr === 900, 'Test 12: SGST split 900');
    assert(pHotel.totalPayableAmountInr === 11800, 'Test 12: Total payable correctly computed as 11800');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();

