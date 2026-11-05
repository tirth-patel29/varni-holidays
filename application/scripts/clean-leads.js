const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanAllLeadsAndData() {
  console.log('--- PURGING ALL TEST & SEED LEADS, QUOTATIONS, BOOKINGS & CUSTOMERS ---');

  // 1. Database cleanup in strict dependency order
  const delUpdates = await prisma.customerUpdate.deleteMany();
  console.log('Deleted CustomerUpdates:', delUpdates.count);

  const delPayments = await prisma.paymentRecord.deleteMany();
  console.log('Deleted PaymentRecords:', delPayments.count);

  const delComponents = await prisma.bookingServiceComponent.deleteMany();
  console.log('Deleted BookingServiceComponents:', delComponents.count);

  const delBookings = await prisma.booking.deleteMany();
  console.log('Deleted Bookings:', delBookings.count);

  const delQuoteItems = await prisma.quotationLineItem.deleteMany();
  console.log('Deleted QuotationLineItems:', delQuoteItems.count);

  const delQuotations = await prisma.quotation.deleteMany();
  console.log('Deleted Quotations:', delQuotations.count);

  const delActivities = await prisma.leadActivity.deleteMany();
  console.log('Deleted LeadActivities:', delActivities.count);

  const delFollowUps = await prisma.followUp.deleteMany();
  console.log('Deleted FollowUps:', delFollowUps.count);

  const delSegments = await prisma.flightSegment.deleteMany();
  console.log('Deleted FlightSegments:', delSegments.count);

  const delFlightDetails = await prisma.flightEnquiryDetail.deleteMany();
  console.log('Deleted FlightEnquiryDetails:', delFlightDetails.count);

  const delPkgDetails = await prisma.packageEnquiryDetail.deleteMany();
  console.log('Deleted PackageEnquiryDetails:', delPkgDetails.count);

  const delVisaDetails = await prisma.visaEnquiryDetail.deleteMany();
  console.log('Deleted VisaEnquiryDetails:', delVisaDetails.count);

  const delLeads = await prisma.lead.deleteMany();
  console.log('Deleted Leads:', delLeads.count);

  const delCustomers = await prisma.customer.deleteMany();
  console.log('Deleted Customers:', delCustomers.count);

  const delAudit = await prisma.auditLog.deleteMany({
    where: { entityType: { in: ['Lead', 'Customer', 'Quotation', 'Booking'] } },
  });
  console.log('Deleted Lead/Customer AuditLogs:', delAudit.count);

  // Verify counts in DB
  const remainingLeads = await prisma.lead.count();
  const remainingCustomers = await prisma.customer.count();
  const remainingBookings = await prisma.booking.count();
  console.log(`\nRemaining in Database: Leads=${remainingLeads}, Customers=${remainingCustomers}, Bookings=${remainingBookings}`);

  // 2. Clear crm_store.json
  const storePath = path.join(__dirname, '..', 'data', 'crm_store.json');
  const emptyStore = {
    customers: [],
    leads: [],
    activities: [],
    followUps: [],
    quotations: [],
    bookings: [],
    auditLogs: [],
    packageCosts: [],
    syncJobs: [],
    sheetsConfig: {
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A',
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A'}/edit`,
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'varni-sheets-sync@varni-holidays-crm.iam.gserviceaccount.com',
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      status: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY ? 'CONNECTED' : 'DISCONNECTED',
      lastSuccessfulSyncAt: null,
      lastSyncError: null,
      totalSyncedEvents: 0,
      activeViewerEmail: 'neel@varniholidays.com',
    },
    bookingServices: [],
    payments: [],
    communicationLogs: [],
  };

  fs.writeFileSync(storePath, JSON.stringify(emptyStore, null, 2));
  console.log('Successfully reset application/data/crm_store.json to 0 leads & customers.');
}

cleanAllLeadsAndData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

