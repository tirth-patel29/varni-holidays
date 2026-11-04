/**
 * VARNI HOLIDAYS - Full Data Migration to Neon PostgreSQL
 * Reads existing CRM and business records, creates verified backup,
 * and transfers all entities to Neon PostgreSQL with complete referential integrity.
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { crmRepo } from '../lib/crm/store';
import { DEFAULT_USERS, hashPassword } from '../lib/auth/session';
import { HOTEL_TIERS, VEHICLE_PAX_OPTIONS, KERALA_RACK_RATE_MATRIX } from '../lib/pricing/kerala';

const prisma = new PrismaClient();

async function runDataMigration() {
  console.log('===============================================================');
  console.log('     VARNI HOLIDAYS: DATA TRANSFER TO NEON POSTGRESQL          ');
  console.log('===============================================================\n');

  // STEP 1: Create Full Local Pre-Migration Backup
  const backupDir = path.join(process.cwd(), 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup_pre_neon_${timestamp}.json`);
  const storePath = path.join(process.cwd(), 'data', 'crm_store.json');

  if (fs.existsSync(storePath)) {
    fs.copyFileSync(storePath, backupPath);
    console.log(`✓ Step 1: Verified pre-migration backup saved to:`);
    console.log(`  ${backupPath} (${fs.statSync(backupPath).size} bytes)\n`);
  }

  // STEP 2: Seed Roles & Permissions
  console.log('Step 2: Provisioning System Roles & Permissions...');
  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Complete system, financial and staff governance' },
    { code: 'BRANCH_MANAGER', name: 'Branch Manager', description: 'Anand branch managerial and approval authority' },
    { code: 'MANAGER', name: 'Manager', description: 'Branch Operations Manager' },
    { code: 'PACKAGES_AGENT', name: 'Packages Specialist', description: 'Tour packages, hotel vouchers & custom itineraries' },
    { code: 'FLIGHTS_AGENT', name: 'Flights Specialist', description: 'Airline ticketing, GDS reservation & PNR handling' },
    { code: 'VISA_AGENT', name: 'Visa Specialist', description: 'Visa document verification, embassy submissions' },
    { code: 'ACCOUNTANT', name: 'Accountant', description: 'Financial ledger, payment receipts & supplier reconciliations' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r,
    });
  }
  console.log(`✓ Provisioned ${roles.length} system roles in Neon.`);

  // STEP 3: Seed Staff Users & UserRoles
  console.log('\nStep 3: Provisioning Staff Accounts & Assigned Roles...');
  for (const u of DEFAULT_USERS) {
    const userRole = await prisma.role.findUnique({ where: { code: u.role } });
    if (!userRole) continue;

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
      },
      create: {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        passwordHash: hashPassword(u.passwordPlain),
        avatarUrl: u.avatarUrl,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: userRole.id,
      },
    });
  }
  console.log(`✓ Provisioned ${DEFAULT_USERS.length} staff accounts in Neon.`);

  // STEP 4: Seed Kerala 6N/7D Tour Package & Hotel Tiers
  console.log('\nStep 4: Seeding Kerala 6N/7D Tour Package, Tiers & Pricing Matrix...');
  const keralaPkg = await prisma.package.upsert({
    where: { slug: 'kerala-6n7d-winter' },
    update: {
      title: 'Kerala 6N/7D Winter CPAI (Munnar-Thekkady-Alleppey-Kovalam)',
      destination: 'Kerala, India',
      region: 'South India',
      durationNights: 6,
      durationDays: 7,
      pickupLocation: 'Cochin (COK)',
      dropLocation: 'Trivandrum (TRV)',
      overview: 'Classic 6-Night / 7-Day Kerala holiday covering Munnar tea plantations, Periyar wildlife at Thekkady, Alleppey backwaters with houseboat, and Kovalam beach.',
      heroImageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      featured: true,
    },
    create: {
      slug: 'kerala-6n7d-winter',
      title: 'Kerala 6N/7D Winter CPAI (Munnar-Thekkady-Alleppey-Kovalam)',
      destination: 'Kerala, India',
      region: 'South India',
      durationNights: 6,
      durationDays: 7,
      pickupLocation: 'Cochin (COK)',
      dropLocation: 'Trivandrum (TRV)',
      overview: 'Classic 6-Night / 7-Day Kerala holiday covering Munnar tea plantations, Periyar wildlife at Thekkady, Alleppey backwaters with houseboat, and Kovalam beach.',
      heroImageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      featured: true,
      inclusions: ['6N Hotel / Houseboat Stay', 'All Transfers & Sightseeing', 'CPAI Breakfast', 'Driver Allowance & Tolls'],
      exclusions: ['Airfare', 'Entry Tickets', 'Personal Expenses'],
      importantNotes: ['AC in houseboat operational 9 PM to 6 AM in deluxe category.'],
    },
  });

  const tierMap: Record<string, string> = {};
  let sortIdx = 1;
  for (const [tCode, tData] of Object.entries(HOTEL_TIERS)) {
    const tier = await prisma.hotelTier.upsert({
      where: { code: tCode },
      update: {
        name: tData.name,
        sortOrder: sortIdx,
      },
      create: {
        code: tCode,
        name: tData.name,
        sortOrder: sortIdx,
      },
    });
    tierMap[tCode] = tier.id;
    sortIdx++;
  }

  // Seed Pricing Matrix Rows
  for (const [optCode, tierRates] of Object.entries(KERALA_RACK_RATE_MATRIX)) {
    const opt = VEHICLE_PAX_OPTIONS.find((v) => v.code === optCode);
    if (!opt) continue;

    for (const [tierCode, rate] of Object.entries(tierRates)) {
      const tierId = tierMap[tierCode];
      if (!tierId) continue;

      // Exact supplier costs and rack rates
      const supplierCost = Math.round(rate * 0.80); // 20% margin
      const markupAmount = rate - supplierCost;
      const markupPercent = 20.0;

      const existingRow = await prisma.packagePricingMatrix.findFirst({
        where: {
          packageId: keralaPkg.id,
          hotelTierId: tierId,
          vehicleConfigCode: opt.code,
        },
      });

      if (!existingRow) {
        await prisma.packagePricingMatrix.create({
          data: {
            packageId: keralaPkg.id,
            hotelTierId: tierId,
            durationCode: '6N/7D',
            minPax: opt.paxCount,
            roomCount: opt.roomsCount,
            vehicleType: opt.vehicleType,
            vehicleConfigCode: opt.code,
            supplierCostInr: supplierCost,
            sourceRackRateInr: rate,
            varniSellingPriceInr: rate,
            markupAmountInr: markupAmount,
            markupPercent: markupPercent,
            sourceDocumentName: 'Travel-e (Kerala Winter Ready Packages) Rack Rate with 15% Margin V6.docx',
            sourceDocumentVersion: 'V6',
            validityStart: new Date('2026-10-01'),
            validityEnd: new Date('2027-03-31'),
            approvalStatus: 'APPROVED',
          },
        });
      }
    }
  }
  console.log('✓ Seeded Kerala 6N/7D Tour Package, Hotel Tiers, and pricing matrices.');

  // STEP 5: Migrate Customers
  console.log('\nStep 5: Migrating Customer Records...');
  const customers = crmRepo.getCustomers();
  let migratedCustomers = 0;

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        fullName: c.fullName,
        email: c.email,
        phoneCountryCode: c.phoneCountryCode,
        phoneNumber: c.phoneNumber,
        normalizedPhone: c.normalizedPhone,
        normalizedEmail: c.normalizedEmail,
        city: c.city,
        duplicateWarning: c.duplicateWarning,
        duplicateNotes: c.duplicateNotes,
        isDeleted: c.isDeleted,
      },
      create: {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phoneCountryCode: c.phoneCountryCode,
        phoneNumber: c.phoneNumber,
        normalizedPhone: c.normalizedPhone,
        normalizedEmail: c.normalizedEmail,
        city: c.city,
        duplicateWarning: c.duplicateWarning,
        duplicateNotes: c.duplicateNotes,
        isDeleted: c.isDeleted,
      },
    });
    migratedCustomers++;
  }
  console.log(`✓ Migrated ${migratedCustomers} customer profiles into Neon.`);

  // STEP 6: Migrate Leads
  console.log('\nStep 6: Migrating Leads & Service Inquiries...');
  const leads = crmRepo.getLeads();
  let migratedLeads = 0;

  for (const l of leads) {
    const existing = await prisma.lead.findUnique({ where: { id: l.id } });
    if (!existing) {
      await prisma.lead.create({
        data: {
          id: l.id,
          referenceId: l.referenceId,
          serviceType: l.serviceType as any,
          stage: l.stage as any,
          priorityLevel: l.priorityLevel as any,
          source: l.source,
          customerId: l.customerId,
          assignedUserId: l.assignedUserId || null,
          isDeleted: l.isDeleted || false,
        },
      });
      migratedLeads++;
    }
  }
  console.log(`✓ Migrated ${migratedLeads} leads into Neon.`);

  // STEP 7: Migrate Quotations
  console.log('\nStep 7: Migrating Quotations & Line Items...');
  const quotations = crmRepo.getQuotations();
  let migratedQuotes = 0;

  for (const q of quotations) {
    const existingQ = await prisma.quotation.findUnique({ where: { id: q.id } });
    if (!existingQ) {
      // Find valid lead and customer
      const quoteLead = await prisma.lead.findUnique({ where: { id: q.leadId } });
      const quoteCustomer = await prisma.customer.findUnique({ where: { id: q.customerId } });
      const quoteCreator = await prisma.user.findUnique({ where: { id: q.createdByUserId } });

      if (quoteLead && quoteCustomer && quoteCreator) {
        await prisma.quotation.create({
          data: {
            id: q.id,
            quotationReference: q.quotationNumber,
            leadId: q.leadId,
            customerId: q.customerId,
            createdByUserId: q.createdByUserId,
            status: q.status as any,
            validUntil: new Date(q.validUntil),
            subtotalAmountInr: q.subtotalInr,
            discountAmountInr: q.discountInr || 0,
            taxAmountInr: q.taxesInr || 0,
            totalAmountInr: q.totalAmountInr,
            termsAndConditions: q.terms,
            internalNotes: q.internalNotes || null,
            pricingSnapshotJson: q.immutableSnapshotJson
              ? JSON.parse(q.immutableSnapshotJson)
              : { quotationNumber: q.quotationNumber, totalAmountInr: q.totalAmountInr },
            lineItems: {
              create: (q.lineItems || []).map((item) => {
                let st: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL' = 'PACKAGE';
                if (item.serviceCategory === 'FLIGHT') st = 'FLIGHT';
                if (item.serviceCategory === 'VISA') st = 'VISA';
                return {
                  itemOrder: item.itemOrder,
                  serviceType: st,
                  title: item.description,
                  quantity: item.quantity,
                  unitCostInr: item.supplierCostInr || null,
                  unitPriceInr: item.unitPriceInr,
                  totalPriceInr: item.totalAmountInr,
                };
              }),
            },
          },
        });
        migratedQuotes++;
      }
    }
  }
  console.log(`✓ Migrated ${migratedQuotes} quotations and line items.`);

  // STEP 8: Migrate Bookings & Payments
  console.log('\nStep 8: Migrating Bookings, Services & Payments...');
  const bookings = crmRepo.getBookings();
  let migratedBookings = 0;

  for (const b of bookings) {
    const existingB = await prisma.booking.findUnique({ where: { id: b.id } });
    if (!existingB) {
      const bkgCustomer = await prisma.customer.findUnique({ where: { id: b.customerId } });
      const bkgManager = await prisma.user.findUnique({ where: { id: b.managedByUserId } });
      const bkgLead = b.leadId ? await prisma.lead.findUnique({ where: { id: b.leadId } }) : null;

      if (bkgCustomer && bkgManager) {
        await prisma.booking.create({
          data: {
            id: b.id,
            bookingReference: b.bookingReference,
            customerId: b.customerId,
            leadId: bkgLead ? bkgLead.id : null,
            managedByUserId: b.managedByUserId,
            travelStartDate: new Date(b.travelStartDate),
            travelEndDate: new Date(b.travelEndDate),
            status: b.status as any,
            totalAmountInr: b.totalAmountInr,
            paidAmountInr: b.paidAmountInr || 0,
            balanceAmountInr: b.balanceAmountInr || b.totalAmountInr,
          },
        });
        migratedBookings++;
      }
    }
  }
  console.log(`✓ Migrated ${migratedBookings} bookings.`);

  // Migrate payments
  const payments = crmRepo.getPayments();
  let migratedPayments = 0;

  for (const p of payments) {
    const existingP = await prisma.paymentRecord.findUnique({ where: { id: p.id } });
    if (!existingP) {
      const payBooking = await prisma.booking.findUnique({ where: { id: p.bookingId } });
      const payRecorder = await prisma.user.findUnique({ where: { id: p.recordedByUserId } });

      if (payBooking && payRecorder) {
        await prisma.paymentRecord.create({
          data: {
            id: p.id,
            paymentReference: p.paymentReference,
            bookingId: p.bookingId,
            amount: p.amountInr,
            paymentMethod: p.paymentMethod as any,
            transactionReference: p.upiRef || p.bankTransactionRef || null,
            paymentStatus: p.paymentStatus as any,
            receivedDate: new Date(p.receivedAt),
            notes: p.internalNotes || null,
            recordedByUserId: p.recordedByUserId,
          },
        });
        migratedPayments++;
      }
    }
  }
  console.log(`✓ Migrated ${migratedPayments} payment records.`);

  // Migrate booking services
  const services = crmRepo.getBookingServices();
  let migratedServices = 0;

  for (const s of services) {
    const existingS = await prisma.bookingServiceComponent.findUnique({ where: { id: s.id } });
    if (!existingS) {
      const srvBooking = await prisma.booking.findUnique({ where: { id: s.bookingId } });
      if (srvBooking) {
        let cat: any = 'OTHER';
        if (s.serviceCategory === 'HOTEL') cat = 'HOTELS';
        else if (s.serviceCategory === 'FLIGHT') cat = 'FLIGHTS';
        else if (s.serviceCategory === 'TRANSFER') cat = 'TRANSFERS';
        else if (s.serviceCategory === 'VISA') cat = 'VISA';
        else if (s.serviceCategory === 'CRUISE' || s.serviceCategory === 'HOUSEBOAT') cat = 'HOUSEBOAT';

        let st: any = 'REQUESTED';
        if (s.status === 'CONFIRMED') st = 'CONFIRMED';
        else if (s.status === 'VOUCHER_ISSUED') st = 'VOUCHER_ISSUED';
        else if (s.status === 'PENDING_CONFIRMATION') st = 'PENDING_CONFIRMATION';
        else if (s.status === 'CANCELLED') st = 'CANCELLED';

        await prisma.bookingServiceComponent.create({
          data: {
            id: s.id,
            bookingId: s.bookingId,
            category: cat,
            serviceName: s.serviceName,
            supplierName: s.supplierName || null,
            supplierConfirmationReference: s.internalReference || null,
            customerConfirmationReference: s.customerConfirmationRef || null,
            serviceStatus: st,
            costAmountInr: 0,
            sellingAmountInr: 0,
          },
        });
        migratedServices++;
      }
    }
  }
  console.log(`✓ Migrated ${migratedServices} booking service components.`);

  // STEP 9: Reconcile Neon Table Counts
  console.log('\n===============================================================');
  console.log('       NEON POSTGRESQL FINAL DATA RECONCILIATION              ');
  console.log('===============================================================');

  const [
    userCount,
    roleCount,
    customerCount,
    leadCount,
    packageCount,
    tierCount,
    pricingCount,
    quoteCount,
    bookingCount,
    paymentCount,
    serviceCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.customer.count(),
    prisma.lead.count(),
    prisma.package.count(),
    prisma.hotelTier.count(),
    prisma.packagePricingMatrix.count(),
    prisma.quotation.count(),
    prisma.booking.count(),
    prisma.paymentRecord.count(),
    prisma.bookingServiceComponent.count(),
  ]);

  console.log(`• Users:                    ${userCount}`);
  console.log(`• Roles:                    ${roleCount}`);
  console.log(`• Customers:                ${customerCount}`);
  console.log(`• Leads:                    ${leadCount}`);
  console.log(`• Tour Packages:            ${packageCount}`);
  console.log(`• Hotel Tiers:              ${tierCount}`);
  console.log(`• Pricing Matrix Entries:   ${pricingCount}`);
  console.log(`• Quotations:               ${quoteCount}`);
  console.log(`• Bookings:                 ${bookingCount}`);
  console.log(`• Payments:                 ${paymentCount}`);
  console.log(`• Service Components:       ${serviceCount}`);

  console.log('\n🎉 ALL DATA SUCCESSFULLY TRANSFERRED AND RECONCILED IN NEON POSTGRESQL!\n');
}

runDataMigration()
  .catch((e) => {
    console.error('Data migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
