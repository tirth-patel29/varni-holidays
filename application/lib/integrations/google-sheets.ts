import { google } from 'googleapis';
import { crmRepo } from '../crm/store';
import { SyncJobRecord, GoogleSheetsConfig } from '../crm/types';
import { DEFAULT_USERS } from '../auth/session';

// Tab Headers defined strictly in accordance with Phase 2.1 SRS
export const ALL_LEADS_HEADERS = [
  'Lead ID',
  'Enquiry Date',
  'Customer Name',
  'Phone Number',
  'Email',
  'Service Category',
  'Destination / Package',
  'Travel Date',
  'Lead Stage',
  'Priority',
  'Assigned Employee',
  'Last Contacted Date',
  'Next Follow-Up',
  'Updated Timestamp',
];

export const FOLLOW_UPS_HEADERS = [
  'Follow-up ID',
  'Lead ID',
  'Customer',
  'Assigned Employee',
  'Due Date',
  'Follow-up Status',
  'Completion Timestamp',
];

export const BOOKINGS_HEADERS = [
  'Booking Reference',
  'Customer',
  'Service Category',
  'Related Lead ID',
  'Assigned Employee',
  'Travel Dates',
  'Booking Status',
  'Booking Creation Date',
];

// In-Memory Simulated Google Sheets State for offline development / test environments
interface SimulatedSheet {
  headers: string[];
  rows: Array<Record<string, any>>;
}

class SimulatedGoogleSheetsStore {
  public tabs: {
    ALL_LEADS: SimulatedSheet;
    FOLLOW_UPS: SimulatedSheet;
    BOOKINGS: SimulatedSheet;
    BUSINESS_SUMMARY: Array<Array<string | number>>;
  } = {
    ALL_LEADS: { headers: ALL_LEADS_HEADERS, rows: [] },
    FOLLOW_UPS: { headers: FOLLOW_UPS_HEADERS, rows: [] },
    BOOKINGS: { headers: BOOKINGS_HEADERS, rows: [] },
    BUSINESS_SUMMARY: [],
  };

  public reset() {
    this.tabs.ALL_LEADS.rows = [];
    this.tabs.FOLLOW_UPS.rows = [];
    this.tabs.BOOKINGS.rows = [];
    this.tabs.BUSINESS_SUMMARY = [];
  }
}

export const simulatedSheets = new SimulatedGoogleSheetsStore();

// ----------------------------------------------------
// GOOGLE SHEETS API CLIENT & SYNCHRONIZATION ENGINE
// ----------------------------------------------------

export class GoogleSheetsSyncEngine {
  private getAuthClient() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!clientEmail || !privateKey) {
      return null;
    }

    try {
      return new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } catch (e) {
      console.warn('Failed to construct Google Sheets JWT client:', e);
      return null;
    }
  }

  public isLiveCredentialsConfigured(): boolean {
    return !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
  }

  /**
   * Reconciles all four tabs from the database in a full batch sync.
   */
  public async reconcileFullWorkbook(): Promise<{
    success: boolean;
    syncedLeads: number;
    syncedFollowUps: number;
    syncedBookings: number;
    error?: string;
  }> {
    const config = crmRepo.getGoogleSheetsConfig();
    const leads = crmRepo.getLeads();
    const followUps = crmRepo.getFollowUps();
    const bookings = crmRepo.getBookings();
    const summary = this.computeBusinessSummary();

    // 1. Live Google Sheets API sync if credentials configured
    const auth = this.getAuthClient();
    if (auth && config.spreadsheetId) {
      try {
        const sheets = google.sheets({ version: 'v4', auth });

        // Ensure tabs exist
        await this.ensureSheetTabsExist(sheets, config.spreadsheetId);

        // A. ALL_LEADS
        const leadsRows = [
          ALL_LEADS_HEADERS,
          ...leads.map((l) => {
            const row = crmRepo.formatLeadForSync(l);
            return [
              row.leadId,
              row.enquiryDate,
              row.customerName,
              row.phoneNumber,
              row.email,
              row.serviceCategory,
              row.destinationOrPackage,
              row.travelDate,
              row.stage,
              row.priority,
              row.assignedEmployee,
              row.lastContactedDate,
              row.nextFollowUp,
              row.updatedAt,
            ];
          }),
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: config.spreadsheetId,
          range: 'ALL_LEADS!A1:N',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: leadsRows },
        });

        // B. FOLLOW_UPS
        const followUpRows = [
          FOLLOW_UPS_HEADERS,
          ...followUps.map((f) => {
            const row = crmRepo.formatFollowUpForSync(f);
            return [
              row.followUpId,
              row.leadId,
              row.customer,
              row.assignedEmployee,
              row.dueDate,
              row.status,
              row.completionTimestamp,
            ];
          }),
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: config.spreadsheetId,
          range: 'FOLLOW_UPS!A1:G',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: followUpRows },
        });

        // C. BOOKINGS
        const bookingRows = [
          BOOKINGS_HEADERS,
          ...bookings.map((b) => {
            const row = crmRepo.formatBookingForSync(b);
            return [
              row.bookingReference,
              row.customer,
              row.serviceCategory,
              row.relatedLeadId,
              row.assignedEmployee,
              row.travelDates,
              row.bookingStatus,
              row.bookingCreationDate,
            ];
          }),
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: config.spreadsheetId,
          range: 'BOOKINGS!A1:H',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: bookingRows },
        });

        // D. BUSINESS_SUMMARY
        await sheets.spreadsheets.values.update({
          spreadsheetId: config.spreadsheetId,
          range: 'BUSINESS_SUMMARY!A1:E',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: summary },
        });

        crmRepo.updateGoogleSheetsConfig({
          status: 'CONNECTED',
          lastSuccessfulSyncAt: new Date().toISOString(),
          lastSyncError: null,
          totalSyncedEvents: config.totalSyncedEvents + 1,
        });

        return {
          success: true,
          syncedLeads: leads.length,
          syncedFollowUps: followUps.length,
          syncedBookings: bookings.length,
        };
      } catch (err: any) {
        console.error('Google Sheets API Live Sync Error:', err.message);
        crmRepo.updateGoogleSheetsConfig({
          lastSyncError: `Google Sheets API Error: ${err.message}`,
        });
        // We do not throw to prevent crashing caller
        return {
          success: false,
          syncedLeads: 0,
          syncedFollowUps: 0,
          syncedBookings: 0,
          error: err.message,
        };
      }
    }

    // 2. Simulated Offline Mirror (when credentials not present, for local dev/testing)
    simulatedSheets.tabs.ALL_LEADS.rows = leads.map((l) => crmRepo.formatLeadForSync(l));
    simulatedSheets.tabs.FOLLOW_UPS.rows = followUps.map((f) => crmRepo.formatFollowUpForSync(f));
    simulatedSheets.tabs.BOOKINGS.rows = bookings.map((b) => crmRepo.formatBookingForSync(b));
    simulatedSheets.tabs.BUSINESS_SUMMARY = summary;

    crmRepo.updateGoogleSheetsConfig({
      lastSuccessfulSyncAt: new Date().toISOString(),
      lastSyncError: null,
      totalSyncedEvents: config.totalSyncedEvents + 1,
    });

    return {
      success: true,
      syncedLeads: leads.length,
      syncedFollowUps: followUps.length,
      syncedBookings: bookings.length,
    };
  }

  /**
   * Idempotent single job processor from the Outbox Queue
   */
  public async processSyncJob(job: SyncJobRecord): Promise<{ success: boolean; error?: string }> {
    try {
      const config = crmRepo.getGoogleSheetsConfig();
      const auth = this.getAuthClient();

      if (job.targetTab === 'ALL_LEADS') {
        const lead = crmRepo.getLeadById(job.entityId);
        if (!lead) return { success: true }; // already removed

        const row = crmRepo.formatLeadForSync(lead);

        if (auth && config.spreadsheetId) {
          const sheets = google.sheets({ version: 'v4', auth });
          await this.upsertGoogleSheetsRow(
            sheets,
            config.spreadsheetId,
            'ALL_LEADS',
            row.leadId,
            [
              row.leadId,
              row.enquiryDate,
              row.customerName,
              row.phoneNumber,
              row.email,
              row.serviceCategory,
              row.destinationOrPackage,
              row.travelDate,
              row.stage,
              row.priority,
              row.assignedEmployee,
              row.lastContactedDate,
              row.nextFollowUp,
              row.updatedAt,
            ]
          );
        } else {
          // Update simulated mirror
          const existingIdx = simulatedSheets.tabs.ALL_LEADS.rows.findIndex(
            (r) => r.leadId === row.leadId
          );
          if (existingIdx >= 0) {
            simulatedSheets.tabs.ALL_LEADS.rows[existingIdx] = row;
          } else {
            simulatedSheets.tabs.ALL_LEADS.rows.push(row);
          }
        }
      } else if (job.targetTab === 'FOLLOW_UPS') {
        const followUps = crmRepo.getFollowUps();
        const f = followUps.find((item) => item.id === job.entityId);
        if (!f) return { success: true };

        const row = crmRepo.formatFollowUpForSync(f);

        if (auth && config.spreadsheetId) {
          const sheets = google.sheets({ version: 'v4', auth });
          await this.upsertGoogleSheetsRow(
            sheets,
            config.spreadsheetId,
            'FOLLOW_UPS',
            row.followUpId,
            [
              row.followUpId,
              row.leadId,
              row.customer,
              row.assignedEmployee,
              row.dueDate,
              row.status,
              row.completionTimestamp,
            ]
          );
        } else {
          const existingIdx = simulatedSheets.tabs.FOLLOW_UPS.rows.findIndex(
            (r) => r.followUpId === row.followUpId
          );
          if (existingIdx >= 0) {
            simulatedSheets.tabs.FOLLOW_UPS.rows[existingIdx] = row;
          } else {
            simulatedSheets.tabs.FOLLOW_UPS.rows.push(row);
          }
        }
      } else if (job.targetTab === 'BOOKINGS') {
        const booking = crmRepo.getBookingById(job.entityId);
        if (!booking) return { success: true };

        const row = crmRepo.formatBookingForSync(booking);

        if (auth && config.spreadsheetId) {
          const sheets = google.sheets({ version: 'v4', auth });
          await this.upsertGoogleSheetsRow(
            sheets,
            config.spreadsheetId,
            'BOOKINGS',
            row.bookingReference,
            [
              row.bookingReference,
              row.customer,
              row.serviceCategory,
              row.relatedLeadId,
              row.assignedEmployee,
              row.travelDates,
              row.bookingStatus,
              row.bookingCreationDate,
            ]
          );
        } else {
          const existingIdx = simulatedSheets.tabs.BOOKINGS.rows.findIndex(
            (r) => r.bookingReference === row.bookingReference
          );
          if (existingIdx >= 0) {
            simulatedSheets.tabs.BOOKINGS.rows[existingIdx] = row;
          } else {
            simulatedSheets.tabs.BOOKINGS.rows.push(row);
          }
        }
      } else if (job.targetTab === 'BUSINESS_SUMMARY') {
        const summary = this.computeBusinessSummary();
        if (auth && config.spreadsheetId) {
          const sheets = google.sheets({ version: 'v4', auth });
          await sheets.spreadsheets.values.update({
            spreadsheetId: config.spreadsheetId,
            range: 'BUSINESS_SUMMARY!A1:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: summary },
          });
        } else {
          simulatedSheets.tabs.BUSINESS_SUMMARY = summary;
        }
      }

      crmRepo.updateGoogleSheetsConfig({
        lastSuccessfulSyncAt: new Date().toISOString(),
        lastSyncError: null,
      });

      return { success: true };
    } catch (err: any) {
      console.warn(`Sync job ${job.id} failed:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Idempotent row upsert: checks if primary key exists in column A.
   * If exists, updates that specific row range. If not, appends.
   */
  private async upsertGoogleSheetsRow(
    sheets: any,
    spreadsheetId: string,
    tabName: string,
    primaryKey: string,
    rowValues: any[]
  ) {
    try {
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${tabName}!A:A`,
      });

      const existingColA = getRes.data.values || [];
      let rowIndex = -1;

      for (let i = 0; i < existingColA.length; i++) {
        if (existingColA[i][0] === primaryKey) {
          rowIndex = i + 1; // 1-based index in sheets
          break;
        }
      }

      if (rowIndex > 0) {
        // Update existing row
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tabName}!A${rowIndex}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [rowValues] },
        });
      } else {
        // Append new row
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${tabName}!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [rowValues] },
        });
      }
    } catch (err: any) {
      throw new Error(`Failed to upsert row in ${tabName}: ${err.message}`);
    }
  }

  private async ensureSheetTabsExist(sheets: any, spreadsheetId: string) {
    const requiredTabs = ['ALL_LEADS', 'FOLLOW_UPS', 'BOOKINGS', 'BUSINESS_SUMMARY'];
    try {
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      const currentTitles = (meta.data.sheets || []).map((s: any) => s.properties?.title);

      const requests: any[] = [];
      for (const tab of requiredTabs) {
        if (!currentTitles.includes(tab)) {
          requests.push({
            addSheet: {
              properties: { title: tab },
            },
          });
        }
      }

      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: { requests },
        });
      }
    } catch (e: any) {
      console.warn('Could not verify/create tabs automatically:', e.message);
    }
  }

  /**
   * Computes the real-time BUSINESS_SUMMARY table.
   * Strict Rule: Never report estimated package prices as actual revenue.
   */
  public computeBusinessSummary(): Array<Array<string | number>> {
    const leads = crmRepo.getLeads();
    const followUps = crmRepo.getFollowUps();
    const bookings = crmRepo.getBookings();

    const totalEnquiries = leads.length;
    const flightEnquiries = leads.filter((l) => l.serviceType === 'FLIGHT').length;
    const packageEnquiries = leads.filter((l) => l.serviceType === 'PACKAGE').length;
    const visaEnquiries = leads.filter((l) => l.serviceType === 'VISA').length;

    const requestsCount = leads.filter((l) => l.stage === 'REQUESTS').length;
    const generalCount = leads.filter((l) => l.stage === 'GENERAL').length;
    const priorityCount = leads.filter((l) => l.stage === 'PRIORITY').length;
    const convertedCount = leads.filter((l) => l.stage === 'CONVERTED').length;
    const closedCount = leads.filter((l) => l.stage === 'CLOSED').length;

    const pendingFollowUps = followUps.filter((f) => f.status === 'PENDING').length;
    const now = new Date();
    const overdueFollowUps = followUps.filter(
      (f) => f.status === 'PENDING' && new Date(f.scheduledAt).getTime() < now.getTime()
    ).length;

    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;

    const rows: Array<Array<string | number>> = [
      ['VARNI HOLIDAYS - EXECUTIVE BUSINESS SUMMARY', '', '', '', ''],
      ['Proprietor / Super Admin: Neel Patel', '', 'Data Mode: PostgreSQL Live Outbox Sync', '', ''],
      [`Report Generated (IST): ${new Date().toLocaleString('en-IN')}`, '', '', '', ''],
      ['----------------------------------------', '-----------', '---------------------------------------------------', '', ''],
      ['SECTION 1: PIPELINE FUNNEL METRICS', 'COUNT', 'BUSINESS CALCULATION DEFINITION', '', ''],
      ['Total Enquiries Received', totalEnquiries, 'All customer inquiries across Flight, Package, and Visa'],
      ['Flight Enquiries', flightEnquiries, 'Air ticket consultation and itinerary inquiries'],
      ['Package Tour Enquiries', packageEnquiries, 'Domestic and international verified package requests'],
      ['Visa Assistance Enquiries', visaEnquiries, 'Immigration and tourist visa file consultation'],
      ['Stage: Fresh Requests', requestsCount, 'Inquiries awaiting initial employee outreach and qualification'],
      ['Stage: General Discussions', generalCount, 'Contacted inquiries actively reviewing destinations or dates'],
      ['Stage: Priority / High Intent', priorityCount, 'High-intent clients negotiating bespoke quotes or itineraries'],
      ['Stage: Converted to Booking', convertedCount, 'Formally converted inquiries resulting in confirmed bookings'],
      ['Stage: Closed / Lost', closedCount, 'Unresponsive, cancelled, or lost to competitor'],
      ['', '', '', '', ''],
      ['SECTION 2: OPERATIONAL & CLIENT HEALTH', 'COUNT', 'GOVERNANCE BENCHMARK', '', ''],
      ['Pending Client Follow-Ups', pendingFollowUps, 'Upcoming scheduled reminder calls and tasks'],
      ['Overdue Follow-Ups', overdueFollowUps, 'Action items past scheduled execution timestamp'],
      ['Confirmed Bookings', confirmedBookings, 'Formally accepted bookings with deposit/payment authorization'],
      ['', '', '', '', ''],
      ['SECTION 3: EMPLOYEE PERFORMANCE MATRIX', 'ACTIVE LEADS', 'CONVERTED LEADS', 'CONVERSION RATE (%)', 'ROLE'],
    ];

    // Employee-wise statistics
    DEFAULT_USERS.forEach((user) => {
      const empLeads = leads.filter((l) => l.assignedUserId === user.id);
      const empConverted = empLeads.filter((l) => l.stage === 'CONVERTED').length;
      const rate = empLeads.length > 0 ? Math.round((empConverted / empLeads.length) * 100) : 0;
      rows.push([user.fullName, empLeads.length, empConverted, `${rate}%`, user.role.replace('_', ' ')]);
    });

    rows.push(['', '', '', '', '']);
    rows.push(['SECTION 4: SERVICE CONVERSION EFFICIENCY', 'TOTAL LEADS', 'CONVERTED', 'CONVERSION RATE (%)', 'NOTES']);

    const services = [
      { name: 'Flight Enquiries', code: 'FLIGHT' },
      { name: 'Package Holidays', code: 'PACKAGE' },
      { name: 'Visa Assistance', code: 'VISA' },
    ];

    services.forEach((s) => {
      const sLeads = leads.filter((l) => l.serviceType === s.code);
      const sConverted = sLeads.filter((l) => l.stage === 'CONVERTED').length;
      const rate = sLeads.length > 0 ? Math.round((sConverted / sLeads.length) * 100) : 0;
      rows.push([s.name, sLeads.length, sConverted, `${rate}%`, 'Excludes closed/unresponsive']);
    });

    rows.push(['', '', '', '', '']);
    rows.push(['SECTION 5: DATA GOVERNANCE & INTEGRITY', '', '', '', '']);
    rows.push(['Primary System of Record', 'PostgreSQL (Varni CRM)', '', '', '']);
    rows.push(['Synchronization Flow', 'PostgreSQL → Outbox Queue → Google Sheets (Strictly One-Way Read-Only)', '', '', '']);
    rows.push(['Viewer Privilege', 'Neel Patel (neel@varniholidays.com) - Read-Only Viewer', '', '', '']);
    rows.push(['Confidential Data Protection', 'Passport numbers, DOB, supplier net rates, and margins strictly excluded', '', '', '']);

    return rows;
  }
}

export const googleSheetsSync = new GoogleSheetsSyncEngine();

