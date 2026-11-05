const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedOneQuotation() {
  console.log('--- SEEDING EXACTLY 1 REAL QUOTATION & LINKED LEAD ---');

  const customerId = 'cust-real-1001';
  const leadId = 'lead-real-pkg-1001';
  const quotationId = 'quo-real-202611-0001';
  const quotationRef = 'VH-QUO-202611-0001';
  const leadRef = 'PKG-20261105-1001';

  // 1. Upsert Customer in Prisma DB
  const customer = await prisma.customer.upsert({
    where: { id: customerId },
    update: {
      fullName: 'Chirag Patel',
      email: 'chirag.patel@charotar.in',
      phoneCountryCode: '+91',
      phoneNumber: '9825012345',
      normalizedPhone: '+919825012345',
      normalizedEmail: 'chirag.patel@charotar.in',
      city: 'Anand',
      state: 'Gujarat',
      country: 'India',
    },
    create: {
      id: customerId,
      fullName: 'Chirag Patel',
      email: 'chirag.patel@charotar.in',
      phoneCountryCode: '+91',
      phoneNumber: '9825012345',
      normalizedPhone: '+919825012345',
      normalizedEmail: 'chirag.patel@charotar.in',
      city: 'Anand',
      state: 'Gujarat',
      country: 'India',
    },
  });
  console.log('✅ Customer seeded:', customer.fullName, customer.id);

  // 2. Upsert Lead in Prisma DB
  const lead = await prisma.lead.upsert({
    where: { id: leadId },
    update: {
      referenceId: leadRef,
      serviceType: 'PACKAGE',
      stage: 'PRIORITY',
      priorityLevel: 'HIGH',
      source: 'WEBSITE',
      customerId: customer.id,
      assignedUserId: 'usr-harshil-desai-packages',
    },
    create: {
      id: leadId,
      referenceId: leadRef,
      serviceType: 'PACKAGE',
      stage: 'PRIORITY',
      priorityLevel: 'HIGH',
      source: 'WEBSITE',
      customerId: customer.id,
      assignedUserId: 'usr-harshil-desai-packages',
    },
  });
  console.log('✅ Lead seeded:', lead.referenceId, lead.id);

  // 2b. Upsert PackageEnquiryDetail
  const pkgDetail = await prisma.packageEnquiryDetail.upsert({
    where: { leadId: lead.id },
    update: {
      packageId: 'bc67541a-ed2c-4be9-836e-a177e454066e',
      hotelTierId: 'be105bcb-4514-4a34-be28-49864400e5c1',
      preferredTravelDate: new Date('2026-12-20T00:00:00.000Z'),
      adultsCount: 2,
      childrenWithBedCount: 0,
      childrenNoBedCount: 0,
      roomsCount: 1,
      vehicleType: 'Innova Crysta',
    },
    create: {
      leadId: lead.id,
      packageId: 'bc67541a-ed2c-4be9-836e-a177e454066e',
      hotelTierId: 'be105bcb-4514-4a34-be28-49864400e5c1',
      preferredTravelDate: new Date('2026-12-20T00:00:00.000Z'),
      adultsCount: 2,
      childrenWithBedCount: 0,
      childrenNoBedCount: 0,
      roomsCount: 1,
      vehicleType: 'Innova Crysta',
    },
  });
  console.log('✅ PackageEnquiryDetail seeded');

  // 3. Upsert Quotation in Prisma DB
  const inclusions = [
    '6 Nights 4-Star Deluxe Accommodations (Munnar 2N, Thekkady 1N, Alleppey 1N, Kovalam 2N)',
    'Daily Buffet Breakfast and Alleppey Houseboat All-Meals (CPAI Plan)',
    'Private Air-Conditioned Toyota Innova Crysta with Dedicated English/Hindi Speaking Chauffeur',
    'Alleppey 1-Night Exclusive Deluxe AC Houseboat Cruise on Vembanad Lake',
    'All Tolls, Interstate Permits, Parking Fees, Fuel Charges, and Driver Bata',
    'Spice Plantation Guided Walk & Periyar Lake Boating Assistance',
  ];

  const exclusions = [
    'Airfare / Train tickets to Kochi (COK) and from Trivandrum (TRV)',
    'National Park entry fees, monument camera passes, and personal activities',
    'Personal expenses, laundry, tips, room service, and travel insurance',
  ];

  const terms = '50% advance deposit required for reservation confirmation. Balance payable 7 days prior to journey date. Cancellation policy as per Varni Holidays standard terms.';

  const lineItemsData = [
    {
      itemOrder: 1,
      serviceType: 'PACKAGE',
      title: 'Kerala 6N Deluxe Accommodations (Munnar, Thekkady, Kovalam) + Private AC Innova Crysta Chauffeur',
      description: 'Luxury 4-star category resorts with daily breakfast and dedicated private chauffeur throughout the tour.',
      quantity: 6,
      unitPriceInr: 20700,
      unitCostInr: 17500,
      totalPriceInr: 124200,
    },
    {
      itemOrder: 2,
      serviceType: 'PACKAGE',
      title: 'Alleppey Exclusive Luxury AC Houseboat (1 Night Cruise with Traditional Kerala CPAI Meals)',
      description: 'Private luxury houseboat cruising the scenic backwaters of Alleppey. Includes lunch, evening tea/snacks, dinner, and breakfast.',
      quantity: 1,
      unitPriceInr: 17200,
      unitCostInr: 13500,
      totalPriceInr: 17200,
    },
  ];

  // Delete existing quotation if any to re-create cleanly
  await prisma.quotationLineItem.deleteMany({ where: { quotationId } });
  await prisma.quotation.deleteMany({ where: { id: quotationId } });

  const quotation = await prisma.quotation.create({
    data: {
      id: quotationId,
      quotationReference: quotationRef,
      leadId: lead.id,
      customerId: customer.id,
      createdByUserId: 'usr-neel-patel-superadmin',
      status: 'SENT',
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      currency: 'INR',
      subtotalAmountInr: 141400,
      taxAmountInr: 0,
      discountAmountInr: 3400,
      totalAmountInr: 138000,
      customerNotes: 'Kerala 6N/7D Luxury Family Tour with Premium Houseboat',
      termsAndConditions: terms,
      internalNotes: 'VIP Client referral from Anand HQ. Upgraded vehicle to Innova Crysta.',
      pricingSnapshotJson: {
        title: 'Kerala 6N/7D Luxury Family Tour with Premium Houseboat',
        subtotalInr: 141400,
        discountInr: 3400,
        totalAmountInr: 138000,
        inclusions,
        exclusions,
      },
      lineItems: {
        create: lineItemsData,
      },
    },
  });
  console.log('✅ Quotation seeded in DB:', quotation.quotationReference, quotation.id);

  // 4. Update application/data/crm_store.json for local store parity
  const storePath = path.join(__dirname, '..', 'data', 'crm_store.json');
  const targetSpreadsheetId = '1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A';

  const storeCustomer = {
    id: customerId,
    fullName: 'Chirag Patel',
    email: 'chirag.patel@charotar.in',
    phoneCountryCode: '+91',
    phoneNumber: '9825012345',
    normalizedPhone: '+919825012345',
    city: 'Anand',
    state: 'Gujarat',
    country: 'India',
    createdAt: new Date().toISOString(),
  };

  const storeLead = {
    id: leadId,
    referenceId: leadRef,
    serviceType: 'PACKAGE',
    stage: 'PRIORITY',
    priorityLevel: 'HIGH',
    source: 'WEBSITE',
    customerId: customerId,
    customerName: 'Chirag Patel',
    customerPhone: '+91 98250 12345',
    customerEmail: 'chirag.patel@charotar.in',
    assignedUserId: 'usr-harshil-desai-packages',
    assignedUserName: 'Harshil Desai',
    packageDetail: {
      packageSlug: 'kerala-6n7d-winter',
      packageName: 'Kerala 6N/7D Winter CPAI (Munnar-Thekkady-Alleppey-Kovalam)',
      hotelTier: 'LUXURY',
      adultsCount: 2,
      childrenWithBedCount: 0,
      childrenNoBedCount: 0,
      roomsCount: 1,
      preferredTravelDate: '2026-12-20',
      pricingStatus: 'EXACT_MATCH',
      quotedUnitPriceInr: 69000,
      quotedTotalPriceInr: 138000,
    },
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const storeQuotation = {
    id: quotationId,
    quotationNumber: quotationRef,
    quotationReference: quotationRef,
    leadId: leadId,
    leadReference: leadRef,
    customerId: customerId,
    customerName: 'Chirag Patel',
    customerPhone: '+91 98250 12345',
    customerEmail: 'chirag.patel@charotar.in',
    createdByUserId: 'usr-neel-patel-superadmin',
    createdByName: 'Neel Patel',
    status: 'SENT',
    title: 'Kerala 6N/7D Luxury Family Tour with Premium Houseboat',
    subtotalInr: 141400,
    taxesInr: 0,
    discountInr: 3400,
    totalAmountInr: 138000,
    finalPayableAmountInr: 138000,
    supplierNetCostInr: 118500,
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    terms,
    inclusions,
    exclusions,
    internalNotes: 'VIP Client referral from Anand HQ. Upgraded vehicle to Innova Crysta.',
    lineItems: lineItemsData.map((li) => ({
      itemOrder: li.itemOrder,
      description: li.title,
      serviceCategory: li.serviceType,
      quantity: li.quantity,
      unitPriceInr: li.unitPriceInr,
      supplierCostInr: li.unitCostInr,
      totalAmountInr: li.totalPriceInr,
    })),
    createdAt: new Date().toISOString(),
  };

  const crmStore = {
    customers: [storeCustomer],
    leads: [storeLead],
    activities: [
      {
        id: `act-${Date.now()}-1`,
        leadId: leadId,
        userId: 'usr-neel-patel-superadmin',
        userName: 'Neel Patel',
        type: 'QUOTATION',
        title: 'Official Quotation Dispatched',
        description: 'Quotation VH-QUO-202611-0001 (₹1,38,000) generated and shared with client Chirag Patel.',
        metadata: { quotationNumber: quotationRef, totalAmountInr: 138000 },
        createdAt: new Date().toISOString(),
      },
    ],
    followUps: [
      {
        id: `fu-${Date.now()}-1`,
        leadId: leadId,
        assignedUserId: 'usr-harshil-desai-packages',
        assignedUserName: 'Harshil Desai',
        customerName: 'Chirag Patel',
        status: 'PENDING',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Follow up on Kerala proposal review and confirm flight arrival times into Cochin (COK).',
        createdAt: new Date().toISOString(),
      },
    ],
    quotations: [storeQuotation],
    bookings: [],
    auditLogs: [],
    packageCosts: [],
    syncJobs: [],
    sheetsConfig: {
      spreadsheetId: targetSpreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}/edit`,
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'varni-sheets-sync@varni-holidays-crm.iam.gserviceaccount.com',
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      status: 'CONNECTED',
      lastSuccessfulSyncAt: new Date().toISOString(),
      lastSyncError: null,
      totalSyncedEvents: 1,
      activeViewerEmail: 'neel@varniholidays.com',
    },
    bookingServices: [],
    payments: [],
    communicationLogs: [],
  };

  fs.writeFileSync(storePath, JSON.stringify(crmStore, null, 2));
  console.log('✅ crm_store.json updated with 1 real quotation, lead, and new Google Sheet ID.');
}

seedOneQuotation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
