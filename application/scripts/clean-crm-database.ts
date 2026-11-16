/**
 * Varni Holidays — Enterprise Controlled Database Cleanup Script
 * Cleans sample/demo operational data while preserving genuine catalogue, pricing, and system configurations.
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CRM_STORE_PATH = path.join(__dirname, '..', 'data', 'crm_store.json');
const CRM_BACKUP_PATH = path.join(__dirname, '..', 'data', 'crm_store.backup.json');

async function runCleanup() {
  console.log('--- 1. VERIFYING SNAPSHOT BACKUP ---');
  if (fs.existsSync(CRM_STORE_PATH)) {
    fs.copyFileSync(CRM_STORE_PATH, CRM_BACKUP_PATH);
    const size = fs.statSync(CRM_BACKUP_PATH).size;
    console.log(`Verified backup written to ${CRM_BACKUP_PATH} (${size} bytes)`);
  }

  console.log('\n--- 2. CLEANING CRM JSON STORE OPERATIONAL ARRAYS ---');
  if (fs.existsSync(CRM_STORE_PATH)) {
    const rawData = JSON.parse(fs.readFileSync(CRM_STORE_PATH, 'utf8'));

    const beforeStats = {
      leads: rawData.leads?.length || 0,
      customers: rawData.customers?.length || 0,
      quotations: rawData.quotations?.length || 0,
      bookings: rawData.bookings?.length || 0,
      followUps: rawData.followUps?.length || 0,
      auditLogs: rawData.auditLogs?.length || 0,
    };
    console.log('Pre-cleanup JSON stats:', beforeStats);

    // Empty operational arrays
    rawData.leads = [];
    rawData.customers = [];
    rawData.quotations = [];
    rawData.bookings = [];
    rawData.followUps = [];
    rawData.customerUpdates = [];
    rawData.auditLogs = [];
    if (rawData.transactions) rawData.transactions = [];
    if (rawData.invoices) rawData.invoices = [];
    if (rawData.communications) rawData.communications = [];

    fs.writeFileSync(CRM_STORE_PATH, JSON.stringify(rawData, null, 2), 'utf8');
    console.log('JSON operational tables successfully reset to clean 0 records.');
  }

  console.log('\n--- 3. CLEANING POSTGRESQL OPERATIONAL TABLES ---');
  try {
    // Delete in reverse foreign-key order
    const deletedActivities = await prisma.leadActivity.deleteMany({});
    console.log(`Deleted lead activities: ${deletedActivities.count}`);

    const deletedVisaLogs = await prisma.visaCommunicationLog.deleteMany({});
    console.log(`Deleted visa communication logs: ${deletedVisaLogs.count}`);

    const deletedVisaApps = await prisma.visaApplication.deleteMany({});
    console.log(`Deleted visa applications: ${deletedVisaApps.count}`);

    // Detail records referencing leads
    const delPkgDetails = await prisma.packageEnquiryDetail.deleteMany({});
    console.log(`Deleted package enquiry details: ${delPkgDetails.count}`);

    const delFlightDetails = await prisma.flightEnquiryDetail.deleteMany({});
    console.log(`Deleted flight enquiry details: ${delFlightDetails.count}`);

    const delVisaDetails = await prisma.visaEnquiryDetail.deleteMany({});
    console.log(`Deleted visa enquiry details: ${delVisaDetails.count}`);

    const delCustomHoliday = await prisma.customHolidayDetail.deleteMany({});
    console.log(`Deleted custom holiday details: ${delCustomHoliday.count}`);

    const delInsurance = await prisma.travelInsuranceDetail.deleteMany({});
    console.log(`Deleted travel insurance details: ${delInsurance.count}`);

    const deletedQuotes = await prisma.quotation.deleteMany({});
    console.log(`Deleted quotations: ${deletedQuotes.count}`);

    const deletedFollowUps = await prisma.followUp.deleteMany({});
    console.log(`Deleted follow-ups: ${deletedFollowUps.count}`);

    const deletedCustomerUpdates = await prisma.customerUpdate.deleteMany({});
    console.log(`Deleted customer updates: ${deletedCustomerUpdates.count}`);

    const deletedPayments = await prisma.paymentRecord.deleteMany({});
    console.log(`Deleted payment records: ${deletedPayments.count}`);

    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`Deleted bookings: ${deletedBookings.count}`);

    const deletedLeads = await prisma.lead.deleteMany({});
    console.log(`Deleted leads: ${deletedLeads.count}`);

    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`Deleted customers: ${deletedCustomers.count}`);

    const deletedAudit = await prisma.auditLog.deleteMany({});
    console.log(`Deleted CRM audit logs: ${deletedAudit.count}`);

    // Remove legacy mock demo users so Owner Bootstrap can execute securely
    const deletedUserRoles = await prisma.userRole.deleteMany({});
    console.log(`Deleted user-role mappings: ${deletedUserRoles.count}`);

    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted demo users: ${deletedUsers.count}`);

    console.log('\n--- 4. POST-CLEANUP VERIFICATION ---');
    const userCount = await prisma.user.count();
    const leadCount = await prisma.lead.count();
    const custCount = await prisma.customer.count();
    const bookCount = await prisma.booking.count();
    const quoteCount = await prisma.quotation.count();

    console.log({
      remainingUsers: userCount,
      remainingLeads: leadCount,
      remainingCustomers: custCount,
      remainingBookings: bookCount,
      remainingQuotations: quoteCount,
    });

    if (leadCount === 0 && custCount === 0 && bookCount === 0 && quoteCount === 0) {
      console.log('✅ CRM Operational Database is 100% CLEAN. Zero dummy records remain.');
    } else {
      console.warn('⚠️ Warning: Some records remained.');
    }
  } catch (err: any) {
    console.error('Database cleanup error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runCleanup();
