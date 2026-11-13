import fs from 'fs';
import path from 'path';
import {
  CustomerRecord,
  LeadRecord,
  LeadActivityRecord,
  FollowUpRecord,
  QuotationRecord,
  BookingRecord,
  AuditLogRecord,
  PackageCostItem,
  SyncJobRecord,
  GoogleSheetsConfig,
  SyncEventType,
  SyncTargetTab,
  BookingServiceComponent,
  PaymentRecord,
  CommunicationLogRecord,
  QuotationSnapshotRecord,
  QuotationEmailLogRecord,
  VisaApplicationRecord,
  VisaStatusHistoryRecord,
  VisaDocumentRecord,
  VisaCommunicationLogRecord,
  VisaApplicationStatusCode,
} from './types';
import { DEFAULT_USERS } from '../auth/session';

interface CrmDatabaseState {
  customers: CustomerRecord[];
  leads: LeadRecord[];
  activities: LeadActivityRecord[];
  followUps: FollowUpRecord[];
  quotations: QuotationRecord[];
  quotationSnapshots: QuotationSnapshotRecord[];
  quotationEmailLogs: QuotationEmailLogRecord[];
  bookings: BookingRecord[];
  auditLogs: AuditLogRecord[];
  packageCosts: PackageCostItem[];
  syncJobs: SyncJobRecord[];
  sheetsConfig: GoogleSheetsConfig;
  bookingServices: BookingServiceComponent[];
  payments: PaymentRecord[];
  communicationLogs: CommunicationLogRecord[];
  visaApplications: VisaApplicationRecord[];
  visaStatusHistory: VisaStatusHistoryRecord[];
  visaDocuments: VisaDocumentRecord[];
  visaCommunicationLogs: VisaCommunicationLogRecord[];
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const STORE_DIR = isServerless ? '/tmp' : path.join(process.cwd(), 'data');
const STORE_PATH = path.join(STORE_DIR, 'crm_store.json');

// Initial seed data adhering strictly to the SRS and Phase 0/1 verified rules
function generateInitialState(): CrmDatabaseState {
  const defaultSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A';
  const sheetsConfig: GoogleSheetsConfig = {
    spreadsheetId: defaultSpreadsheetId,
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/' + defaultSpreadsheetId + '/edit',
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'varni-sheets-sync@varni-holidays-crm.iam.gserviceaccount.com',
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    status: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY ? 'CONNECTED' : 'DISCONNECTED',
    lastSuccessfulSyncAt: null,
    lastSyncError: null,
    totalSyncedEvents: 0,
    activeViewerEmail: 'neel@varniholidays.com',
  };

  return {
    customers: [],
    leads: [],
    activities: [],
    followUps: [],
    quotations: [],
    quotationSnapshots: [],
    quotationEmailLogs: [],
    bookings: [],
    auditLogs: [],
    packageCosts: [],
    syncJobs: [],
    sheetsConfig,
    bookingServices: [],
    payments: [],
    communicationLogs: [],
    visaApplications: [],
    visaStatusHistory: [],
    visaDocuments: [],
    visaCommunicationLogs: [],
  };
}

class CrmRepository {
  private state: CrmDatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): CrmDatabaseState {
    const seed = generateInitialState();
    try {
      let candidatePath = STORE_PATH;
      if (!fs.existsSync(candidatePath)) {
        const bundledPath = path.join(process.cwd(), 'data', 'crm_store.json');
        if (fs.existsSync(bundledPath)) {
          candidatePath = bundledPath;
        }
      }

      if (fs.existsSync(candidatePath)) {
        const raw = fs.readFileSync(candidatePath, 'utf-8');
        const loaded = JSON.parse(raw);
        const merged = {
          ...seed,
          ...loaded,
          leads: loaded.leads || seed.leads,
          customers: loaded.customers || seed.customers,
          activities: loaded.activities || seed.activities,
          followUps: loaded.followUps || seed.followUps,
          quotations: loaded.quotations || seed.quotations,
          quotationSnapshots: loaded.quotationSnapshots || seed.quotationSnapshots,
          quotationEmailLogs: loaded.quotationEmailLogs || seed.quotationEmailLogs,
          bookings: loaded.bookings || seed.bookings,
          syncJobs: loaded.syncJobs || seed.syncJobs,
          sheetsConfig: loaded.sheetsConfig || seed.sheetsConfig,
          bookingServices: loaded.bookingServices || seed.bookingServices,
          payments: loaded.payments || seed.payments,
          communicationLogs: loaded.communicationLogs || seed.communicationLogs,
          visaApplications: loaded.visaApplications || seed.visaApplications,
          visaStatusHistory: loaded.visaStatusHistory || seed.visaStatusHistory,
          visaDocuments: loaded.visaDocuments || seed.visaDocuments,
          visaCommunicationLogs: loaded.visaCommunicationLogs || seed.visaCommunicationLogs,
        };
        if (candidatePath !== STORE_PATH) {
          this.persist(merged);
        }
        return merged;
      }
    } catch (e) {
      console.warn('Error reading CRM store from disk, falling back to seed:', e);
    }
    this.persist(seed);
    return seed;
  }

  private persist(data: CrmDatabaseState) {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist CRM store to disk:', e);
    }
  }

  public reset(): void {
    this.state = generateInitialState();
    this.persist(this.state);
  }

  // --- Customers ---
  public getCustomers(): CustomerRecord[] {
    return this.state.customers.filter((c) => !c.isDeleted);
  }

  public getCustomerById(id: string): CustomerRecord | null {
    return this.state.customers.find((c) => c.id === id && !c.isDeleted) || null;
  }

  public findCustomerByPhone(phoneNumber: string): CustomerRecord | null {
    const clean = phoneNumber.replace(/\D/g, '');
    return (
      this.state.customers.find(
        (c) => !c.isDeleted && c.phoneNumber.replace(/\D/g, '').endsWith(clean.slice(-10))
      ) || null
    );
  }

  public createCustomer(data: {
    fullName: string;
    phoneNumber: string;
    phoneCountryCode?: string;
    email?: string;
    city?: string;
  }): CustomerRecord {
    const id = `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const phoneCountryCode = data.phoneCountryCode || '+91';
    const normalizedPhone = `${phoneCountryCode}${data.phoneNumber.replace(/\D/g, '')}`;
    const customer: CustomerRecord = {
      id,
      fullName: data.fullName,
      email: data.email || null,
      phoneCountryCode,
      phoneNumber: data.phoneNumber,
      normalizedPhone,
      normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
      city: data.city,
      duplicateWarning: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.saveCustomer(customer);
  }

  public findCustomerByPhoneOrEmail(normalizedPhone: string, normalizedEmail?: string | null): CustomerRecord | null {
    return (
      this.state.customers.find(
        (c) =>
          !c.isDeleted &&
          (c.normalizedPhone === normalizedPhone || (normalizedEmail && c.normalizedEmail === normalizedEmail))
      ) || null
    );
  }

  public findPotentialDuplicates(): Array<{ primary: CustomerRecord; matches: CustomerRecord[] }> {
    const active = this.state.customers.filter((c) => !c.isDeleted && !c.mergedIntoCustomerId);
    const groups: Record<string, CustomerRecord[]> = {};

    for (const c of active) {
      if (!groups[c.normalizedPhone]) {
        groups[c.normalizedPhone] = [];
      }
      groups[c.normalizedPhone].push(c);
    }

    const duplicates: Array<{ primary: CustomerRecord; matches: CustomerRecord[] }> = [];
    for (const key in groups) {
      if (groups[key].length > 1) {
        const [primary, ...matches] = groups[key];
        duplicates.push({ primary, matches });
      }
    }
    return duplicates;
  }

  public saveCustomer(customer: CustomerRecord): CustomerRecord {
    const idx = this.state.customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      this.state.customers[idx] = { ...customer, updatedAt: new Date().toISOString() };
    } else {
      this.state.customers.push(customer);
    }
    this.persist(this.state);
    return customer;
  }

  // Admin-controlled non-destructive customer merging
  public mergeCustomers(
    primaryId: string,
    subordinateId: string,
    mergedByUserId: string,
    mergedByEmail: string
  ): { success: boolean; message: string } {
    const primary = this.getCustomerById(primaryId);
    const subordinate = this.getCustomerById(subordinateId);

    if (!primary || !subordinate) {
      return { success: false, message: 'Customer record not found.' };
    }

    // 1. Mark subordinate as merged
    subordinate.mergedIntoCustomerId = primary.id;
    subordinate.mergedAt = new Date().toISOString();
    subordinate.mergedByUserId = mergedByUserId;
    subordinate.isDeleted = true; // Archived, not purged
    this.saveCustomer(subordinate);

    // 2. Re-point subordinate leads to primary customer
    let transferredLeadsCount = 0;
    this.state.leads.forEach((l) => {
      if (l.customerId === subordinateId) {
        l.customerId = primary.id;
        l.updatedAt = new Date().toISOString();
        transferredLeadsCount++;
      }
    });

    // 3. Clear duplicate warning on primary
    primary.duplicateWarning = false;
    primary.duplicateNotes = `Merged with ${subordinate.fullName} (${subordinate.id}) on ${new Date().toLocaleDateString('en-IN')}`;
    this.saveCustomer(primary);

    // 4. Record audit log
    this.addAuditLog({
      userId: mergedByUserId,
      userEmail: mergedByEmail,
      action: 'CUSTOMER_MERGED',
      entityType: 'CUSTOMER',
      entityId: primary.id,
      details: `Merged subordinate customer ${subordinate.fullName} (${subordinate.id}) into ${primary.fullName} (${primary.id}). Transferred ${transferredLeadsCount} leads.`,
      ipAddress: 'Internal Portal',
    });

    this.persist(this.state);
    return {
      success: true,
      message: `Successfully merged ${subordinate.fullName} into ${primary.fullName}. All historical leads preserved.`,
    };
  }

  // --- Leads ---
  public getLeads(filters?: {
    serviceType?: string;
    stage?: string;
    priority?: string;
    assignedUserId?: string;
    search?: string;
  }): Array<LeadRecord & { customer: CustomerRecord; assigneeName?: string }> {
    let result = this.state.leads.filter((l) => !l.isDeleted);

    if (filters?.serviceType && filters.serviceType !== 'ALL') {
      result = result.filter((l) => l.serviceType === filters.serviceType);
    }
    if (filters?.stage && filters.stage !== 'ALL') {
      result = result.filter((l) => l.stage === filters.stage);
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      result = result.filter((l) => l.priorityLevel === filters.priority);
    }
    if (filters?.assignedUserId && filters.assignedUserId !== 'ALL') {
      result = result.filter((l) => l.assignedUserId === filters.assignedUserId);
    }

    const enhanced = result.map((l) => {
      const customer =
        this.getCustomerById(l.customerId) || {
          id: l.customerId,
          fullName: 'Unknown Customer',
          email: null,
          phoneCountryCode: '+91',
          phoneNumber: '',
          normalizedPhone: '',
          normalizedEmail: null,
          duplicateWarning: false,
          isDeleted: false,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        };
      const assignee = DEFAULT_USERS.find((u) => u.id === l.assignedUserId);
      return {
        ...l,
        customer,
        assigneeName: assignee ? assignee.fullName : 'Unassigned',
      };
    });

    if (filters?.search) {
      const query = filters.search.toLowerCase().trim();
      return enhanced.filter(
        (l) =>
          l.referenceId.toLowerCase().includes(query) ||
          l.customer.fullName.toLowerCase().includes(query) ||
          l.customer.phoneNumber.includes(query) ||
          (l.customer.email && l.customer.email.toLowerCase().includes(query))
      );
    }

    return enhanced;
  }

  public getLeadById(id: string): (LeadRecord & { customer: CustomerRecord; assigneeName?: string }) | null {
    const lead = this.state.leads.find((l) => (l.id === id || l.referenceId === id) && !l.isDeleted);
    if (!lead) return null;
    const customer =
      this.getCustomerById(lead.customerId) || {
        id: lead.customerId,
        fullName: 'Unknown Customer',
        email: null,
        phoneCountryCode: '+91',
        phoneNumber: '',
        normalizedPhone: '',
        normalizedEmail: null,
        duplicateWarning: false,
        isDeleted: false,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      };
    const assignee = DEFAULT_USERS.find((u) => u.id === lead.assignedUserId);
    return {
      ...lead,
      customer,
      assigneeName: assignee ? assignee.fullName : 'Unassigned',
    };
  }

  public saveLead(lead: LeadRecord): LeadRecord {
    const idx = this.state.leads.findIndex((l) => l.id === lead.id);
    const isNew = idx < 0;
    if (idx >= 0) {
      this.state.leads[idx] = { ...lead, updatedAt: new Date().toISOString() };
    } else {
      this.state.leads.unshift(lead);
    }

    // Transactional Outbox enqueue: DB mutation & Sheets Sync Job committed together
    this.enqueueSyncJob(
      isNew ? 'LEAD_CREATED' : 'LEAD_UPDATED',
      'ALL_LEADS',
      lead.id,
      this.formatLeadForSync(lead)
    );
    this.enqueueSyncJob(
      isNew ? 'LEAD_CREATED' : 'STAGE_CHANGED',
      'BUSINESS_SUMMARY',
      lead.id,
      {}
    );

    this.persist(this.state);
    return lead;
  }

  // --- Lead Activities ---
  public getActivitiesForLead(leadId: string): LeadActivityRecord[] {
    return this.state.activities
      .filter((a) => a.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addActivity(activity: Omit<LeadActivityRecord, 'id' | 'createdAt'>): LeadActivityRecord {
    const newAct: LeadActivityRecord = {
      ...activity,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.activities.unshift(newAct);
    this.persist(this.state);
    return newAct;
  }

  public addLeadActivity(activity: Omit<LeadActivityRecord, 'id' | 'createdAt'>): LeadActivityRecord {
    return this.addActivity(activity);
  }

  // --- Follow Ups ---
  public getFollowUps(filters?: { userId?: string; status?: string }): Array<FollowUpRecord & { leadRef?: string; customerName?: string }> {
    let result = [...this.state.followUps];
    if (filters?.userId && filters.userId !== 'ALL') {
      result = result.filter((f) => f.userId === filters.userId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((f) => f.status === filters.status);
    }

    return result
      .map((f) => {
        const lead = this.state.leads.find((l) => l.id === f.leadId);
        const customer = lead ? this.getCustomerById(lead.customerId) : null;
        return {
          ...f,
          leadRef: lead ? lead.referenceId : 'Unknown Lead',
          customerName: customer ? customer.fullName : 'Unknown Customer',
        };
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  public addFollowUp(item: Omit<FollowUpRecord, 'id' | 'createdAt'>): FollowUpRecord {
    const newF: FollowUpRecord = {
      ...item,
      id: `flw-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.followUps.push(newF);

    this.enqueueSyncJob(
      'FOLLOW_UP_CREATED',
      'FOLLOW_UPS',
      newF.id,
      this.formatFollowUpForSync(newF)
    );
    this.enqueueSyncJob(
      'FOLLOW_UP_CREATED',
      'BUSINESS_SUMMARY',
      newF.id,
      {}
    );

    this.persist(this.state);
    return newF;
  }

  public completeFollowUp(id: string): boolean {
    const f = this.state.followUps.find((item) => item.id === id);
    if (!f) return false;
    f.status = 'COMPLETED';
    f.completedAt = new Date().toISOString();

    this.enqueueSyncJob(
      'FOLLOW_UP_UPDATED',
      'FOLLOW_UPS',
      f.id,
      this.formatFollowUpForSync(f)
    );
    this.enqueueSyncJob(
      'FOLLOW_UP_UPDATED',
      'BUSINESS_SUMMARY',
      f.id,
      {}
    );

    this.persist(this.state);
    return true;
  }

  // --- Bookings ---
  public getBookings(customerId?: string): BookingRecord[] {
    if (customerId) {
      return this.state.bookings.filter((b) => b.customerId === customerId);
    }
    return this.state.bookings;
  }

  public getBookingById(id: string): BookingRecord | undefined {
    return this.state.bookings.find((b) => b.id === id || b.bookingReference === id);
  }

  public saveBooking(booking: BookingRecord): BookingRecord {
    const idx = this.state.bookings.findIndex((b) => b.id === booking.id || b.bookingReference === booking.bookingReference);
    const isNew = idx < 0;
    if (idx >= 0) {
      this.state.bookings[idx] = { ...booking, updatedAt: new Date().toISOString() };
    } else {
      this.state.bookings.unshift(booking);
    }

    this.enqueueSyncJob(
      isNew ? 'BOOKING_CREATED' : 'BOOKING_STATUS_CHANGED',
      'BOOKINGS',
      booking.id,
      this.formatBookingForSync(booking)
    );
    this.enqueueSyncJob(
      isNew ? 'BOOKING_CREATED' : 'BOOKING_STATUS_CHANGED',
      'BUSINESS_SUMMARY',
      booking.id,
      {}
    );

    this.persist(this.state);
    return booking;
  }

  // --- Google Sheets Outbox Queue & Config ---
  public enqueueSyncJob(
    eventType: SyncEventType,
    targetTab: SyncTargetTab,
    entityId: string,
    payload: Record<string, any>
  ): SyncJobRecord {
    const job: SyncJobRecord = {
      id: `sync-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      eventType,
      targetTab,
      entityId,
      payload,
      status: 'PENDING',
      retryCount: 0,
      maxRetries: 5,
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.state.syncJobs.unshift(job);
    return job;
  }

  public getSyncJobs(limit: number = 50): SyncJobRecord[] {
    return this.state.syncJobs.slice(0, limit);
  }

  public getPendingSyncJobs(): SyncJobRecord[] {
    return this.state.syncJobs.filter((j) => j.status === 'PENDING');
  }

  public updateSyncJob(id: string, updates: Partial<SyncJobRecord>): void {
    const job = this.state.syncJobs.find((j) => j.id === id);
    if (job) {
      Object.assign(job, updates);
      this.persist(this.state);
    }
  }

  public retryFailedSyncJobs(): number {
    let count = 0;
    this.state.syncJobs.forEach((j) => {
      if (j.status === 'FAILED') {
        j.status = 'PENDING';
        j.error = null;
        count++;
      }
    });
    this.persist(this.state);
    return count;
  }

  public getGoogleSheetsConfig(): GoogleSheetsConfig {
    return this.state.sheetsConfig;
  }

  public updateGoogleSheetsConfig(updates: Partial<GoogleSheetsConfig>): GoogleSheetsConfig {
    this.state.sheetsConfig = { ...this.state.sheetsConfig, ...updates };
    this.persist(this.state);
    return this.state.sheetsConfig;
  }

  // Sanitized formatting methods strictly excluding passport, DOB, supplier costs, margins
  public formatLeadForSync(lead: LeadRecord): Record<string, any> {
    const customer = this.getCustomerById(lead.customerId);
    const assignee = DEFAULT_USERS.find((u) => u.id === lead.assignedUserId);
    const activities = this.getActivitiesForLead(lead.id);
    const lastActivity = activities[0];
    const followUps = this.state.followUps.filter((f) => f.leadId === lead.id && f.status === 'PENDING');
    const nextFollowUp = followUps[0]?.scheduledAt ? new Date(followUps[0].scheduledAt).toLocaleDateString('en-IN') : 'None Scheduled';

    let destinationOrPackage = 'General Enquiry';
    let travelDate = 'TBD';

    if (lead.serviceType === 'PACKAGE' && lead.packageDetail) {
      destinationOrPackage = lead.packageDetail.packageName;
      travelDate = lead.packageDetail.preferredTravelDate || 'Winter 2026';
    } else if (lead.serviceType === 'FLIGHT' && lead.flightDetail) {
      destinationOrPackage = `${lead.flightDetail.originAirport} → ${lead.flightDetail.destinationAirport} (${lead.flightDetail.tripType})`;
      travelDate = lead.flightDetail.departureDate;
    } else if (lead.serviceType === 'VISA' && lead.visaDetail) {
      destinationOrPackage = `${lead.visaDetail.destinationCountry} (${lead.visaDetail.visaCategory})`;
      travelDate = lead.visaDetail.plannedTravelDate || 'TBD';
    }

    return {
      leadId: lead.referenceId,
      enquiryDate: new Date(lead.createdAt).toLocaleDateString('en-IN'),
      customerName: customer ? customer.fullName : 'Unknown Customer',
      phoneNumber: customer ? customer.normalizedPhone : '',
      email: customer?.email || 'N/A',
      serviceCategory: lead.serviceType,
      destinationOrPackage,
      travelDate,
      stage: lead.stage,
      priority: lead.priorityLevel,
      assignedEmployee: assignee ? assignee.fullName : 'Unassigned',
      lastContactedDate: lastActivity ? new Date(lastActivity.createdAt).toLocaleDateString('en-IN') : 'New Lead',
      nextFollowUp,
      updatedAt: new Date(lead.updatedAt).toISOString(),
    };
  }

  public formatFollowUpForSync(followUp: FollowUpRecord): Record<string, any> {
    const lead = this.state.leads.find((l) => l.id === followUp.leadId);
    const customer = lead ? this.getCustomerById(lead.customerId) : null;
    return {
      followUpId: followUp.id,
      leadId: lead ? lead.referenceId : followUp.leadId,
      customer: customer ? customer.fullName : 'Unknown Customer',
      assignedEmployee: followUp.userName,
      dueDate: new Date(followUp.scheduledAt).toLocaleString('en-IN'),
      status: followUp.status,
      completionTimestamp: followUp.completedAt ? new Date(followUp.completedAt).toLocaleString('en-IN') : 'Pending',
    };
  }

  public formatBookingForSync(booking: BookingRecord): Record<string, any> {
    const lead = booking.leadId ? this.state.leads.find((l) => l.id === booking.leadId) : null;
    return {
      bookingReference: booking.bookingReference,
      customer: booking.customerName,
      serviceCategory: booking.serviceType,
      relatedLeadId: lead ? lead.referenceId : (booking.leadId || 'N/A'),
      assignedEmployee: booking.managedByName,
      travelDates: `${new Date(booking.travelStartDate).toLocaleDateString('en-IN')} to ${new Date(booking.travelEndDate).toLocaleDateString('en-IN')}`,
      bookingStatus: booking.status,
      bookingCreationDate: new Date(booking.createdAt).toLocaleDateString('en-IN'),
    };
  }

  public formatQuotationForSync(quote: QuotationRecord): Record<string, any> {
    const customer = this.getCustomerById(quote.customerId);
    const lead = this.state.leads.find((l) => l.id === quote.leadId);
    return {
      quotationReference: quote.quotationNumber || (quote as any).quotationReference || quote.id,
      leadReference: lead ? lead.referenceId : (quote.leadId || 'N/A'),
      customerName: customer ? customer.fullName : ((quote as any).customerName || 'Customer'),
      customerPhone: customer ? `${customer.phoneCountryCode || '+91'} ${customer.phoneNumber}` : ((quote as any).customerPhone || ''),
      title: quote.title,
      totalAmount: quote.totalAmountInr ?? (quote as any).finalPayableAmountInr ?? 0,
      status: quote.status,
      validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('en-IN') : '',
      createdBy: quote.createdByName || 'Neel Patel',
      createdAt: quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('en-IN') : '',
    };
  }

  // --- Quotations (Phase 3) ---
  public getQuotations(leadId?: string): QuotationRecord[] {
    if (leadId) {
      return this.state.quotations.filter((q) => q.leadId === leadId);
    }
    return this.state.quotations;
  }

  public getQuotationById(id: string): QuotationRecord | undefined {
    return this.state.quotations.find((q) => q.id === id || q.quotationNumber === id);
  }

  public saveQuotation(quote: QuotationRecord): QuotationRecord {
    const idx = this.state.quotations.findIndex((q) => q.id === quote.id);
    if (idx >= 0) {
      this.state.quotations[idx] = quote;
    } else {
      this.state.quotations.unshift(quote);
    }

    this.enqueueSyncJob(
      'QUOTATION_CREATED',
      'QUOTATIONS',
      quote.id,
      this.formatQuotationForSync(quote)
    );

    this.persist(this.state);
    return quote;
  }

  public createQuotation(data: {
    quotationType?: 'PACKAGE' | 'HOTEL' | 'CUSTOM';
    leadId?: string;
    leadReferenceId?: string;
    customerId: string;
    customerName?: string;
    customerEmail?: string | null;
    customerPhone?: string;
    createdByUserId: string;
    createdByName: string;
    title: string;
    destination?: string | null;
    durationNights?: number | null;
    durationDays?: number | null;
    travelStartDate?: string | null;
    travelEndDate?: string | null;
    adultsCount?: number;
    childrenCount?: number;
    roomsCount?: number;
    hotelCategory?: string | null;
    mealPlan?: string | null;
    transportType?: string | null;
    sourcePackageSlug?: string | null;
    sourceHotelId?: string | null;

    basePriceInr?: number;
    transportChargesInr?: number;
    additionalServicesInr?: number;
    extraChargesInr?: number;
    discountType?: 'FIXED' | 'PERCENTAGE';
    discountValue?: number;
    discountInr?: number;
    taxPercent?: number;
    taxesInr?: number;
    subtotalInr: number;
    totalAmountInr: number;
    supplierNetCostInr?: number;
    validUntil: string;
    terms: string;
    inclusions?: string[];
    exclusions?: string[];
    itineraryDays?: Array<{
      dayNumber: number;
      title: string;
      description: string;
      meals?: string;
      stayDestination?: string;
    }>;
    hotelDetails?: {
      hotelName: string;
      location: string;
      roomType: string;
      mealPlan: string;
      checkInTime?: string;
      checkOutTime?: string;
      perks?: string[];
    };
    internalNotes?: string;
    customerNotes?: string;
    lineItems: Array<{
      itemOrder: number;
      description: string;
      serviceCategory: string;
      quantity: number;
      unitPriceInr: number;
      supplierCostInr?: number;
      totalAmountInr: number;
    }>;
  }): QuotationRecord {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.quotations.length + 1).toString().padStart(4, '0');
    const quotationNumber = `VH-QUO-${yearMonth}-${seq}`;

    // Look up customer if not provided
    const customer = this.getCustomerById(data.customerId);
    const customerName = data.customerName || customer?.fullName || 'Valued Guest';
    const customerPhone = data.customerPhone || customer?.phoneNumber || '';
    const customerEmail = data.customerEmail !== undefined ? data.customerEmail : (customer?.email || null);

    const quote: QuotationRecord = {
      id: `quo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quotationNumber,
      quotationType: data.quotationType || 'PACKAGE',
      version: 1,
      revisionNumber: 0,
      parentQuotationId: null,
      leadId: data.leadId || '',
      leadReferenceId: data.leadReferenceId,
      customerId: data.customerId,
      customerName,
      customerEmail,
      customerPhone,
      createdByUserId: data.createdByUserId,
      createdByName: data.createdByName,
      status: 'DRAFT',
      title: data.title,
      destination: data.destination,
      durationNights: data.durationNights,
      durationDays: data.durationDays,
      travelStartDate: data.travelStartDate,
      travelEndDate: data.travelEndDate,
      adultsCount: data.adultsCount || 2,
      childrenCount: data.childrenCount || 0,
      roomsCount: data.roomsCount || 1,
      hotelCategory: data.hotelCategory,
      mealPlan: data.mealPlan,
      transportType: data.transportType,
      sourcePackageSlug: data.sourcePackageSlug,
      sourceHotelId: data.sourceHotelId,

      basePriceInr: data.basePriceInr || data.subtotalInr,
      transportChargesInr: data.transportChargesInr || 0,
      additionalServicesInr: data.additionalServicesInr || 0,
      extraChargesInr: data.extraChargesInr || 0,
      discountType: data.discountType || 'FIXED',
      discountValue: data.discountValue || 0,
      discountInr: data.discountInr || 0,
      taxPercent: data.taxPercent !== undefined ? data.taxPercent : 5,
      taxesInr: data.taxesInr || 0,
      subtotalInr: data.subtotalInr,
      totalAmountInr: data.totalAmountInr,
      supplierNetCostInr: data.supplierNetCostInr,
      validUntil: data.validUntil,
      terms: data.terms,
      inclusions: data.inclusions || [],
      exclusions: data.exclusions || [],
      itineraryDays: data.itineraryDays || [],
      hotelDetails: data.hotelDetails,
      internalNotes: data.internalNotes,
      customerNotes: data.customerNotes,
      lineItems: data.lineItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Immutable snapshot JSON
    quote.immutableSnapshotJson = JSON.stringify(quote);

    this.state.quotations.unshift(quote);

    // Add activity to lead if leadId present
    if (data.leadId) {
      this.addLeadActivity({
        leadId: data.leadId,
        userId: data.createdByUserId,
        userName: data.createdByName,
        type: 'QUOTATION',
        title: `Quotation Created (${quotationNumber})`,
        description: `Official proposal prepared for ₹${quote.totalAmountInr.toLocaleString('en-IN')}: ${quote.title}`,
        metadata: { quotationNumber, totalAmountInr: quote.totalAmountInr },
      });
    }

    // Audit log
    this.addAuditLog({
      userId: data.createdByUserId,
      userEmail: data.createdByName,
      action: 'QUOTATION_CREATED',
      entityType: 'QUOTATION',
      entityId: quote.id,
      details: `Created quotation ${quotationNumber} for customer ${customerName} (Amount: ₹${quote.totalAmountInr})`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.enqueueSyncJob(
      'QUOTATION_CREATED',
      'QUOTATIONS',
      quote.id,
      this.formatQuotationForSync(quote)
    );

    this.persist(this.state);
    return quote;
  }

  public updateQuotationDraft(
    id: string,
    data: Partial<QuotationRecord>,
    actorId: string
  ): QuotationRecord {
    const quote = this.getQuotationById(id);
    if (!quote) throw new Error(`Quotation not found: ${id}`);
    if (quote.status !== 'DRAFT') {
      throw new Error(`Cannot modify quotation ${quote.quotationNumber} because status is ${quote.status}. Please create a new revision instead.`);
    }

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];

    Object.assign(quote, data);
    quote.updatedAt = new Date().toISOString();
    quote.immutableSnapshotJson = JSON.stringify(quote);

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'QUOTATION_UPDATED',
      entityType: 'QUOTATION',
      entityId: quote.id,
      details: `Updated draft quotation ${quote.quotationNumber}. New Amount: ₹${quote.totalAmountInr}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return quote;
  }

  public createQuotationRevision(id: string, actorId: string): QuotationRecord {
    const original = this.getQuotationById(id);
    if (!original) throw new Error(`Quotation not found: ${id}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    const newRevNumber = (original.revisionNumber || 0) + 1;
    const baseRef = original.quotationNumber.replace(/-R\d+$/, '');
    const newQuotationNumber = `${baseRef}-R${newRevNumber}`;

    const revision: QuotationRecord = {
      ...JSON.parse(JSON.stringify(original)),
      id: `quo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quotationNumber: newQuotationNumber,
      version: (original.version || 1) + 1,
      revisionNumber: newRevNumber,
      parentQuotationId: original.id,
      status: 'DRAFT',
      sentAt: null,
      acceptedAt: null,
      rejectedAt: null,
      createdByUserId: actor.id,
      createdByName: actor.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    revision.immutableSnapshotJson = JSON.stringify(revision);
    this.state.quotations.unshift(revision);

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'QUOTATION_REVISION_CREATED',
      entityType: 'QUOTATION',
      entityId: revision.id,
      details: `Created revision ${newQuotationNumber} from original ${original.quotationNumber}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return revision;
  }

  public duplicateQuotation(id: string, actorId: string): QuotationRecord {
    const original = this.getQuotationById(id);
    if (!original) throw new Error(`Quotation not found: ${id}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.quotations.length + 1).toString().padStart(4, '0');
    const newQuotationNumber = `VH-QUO-${yearMonth}-${seq}`;

    const clone: QuotationRecord = {
      ...JSON.parse(JSON.stringify(original)),
      id: `quo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quotationNumber: newQuotationNumber,
      version: 1,
      revisionNumber: 0,
      parentQuotationId: null,
      status: 'DRAFT',
      title: `${original.title} (Copy)`,
      sentAt: null,
      acceptedAt: null,
      rejectedAt: null,
      createdByUserId: actor.id,
      createdByName: actor.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clone.immutableSnapshotJson = JSON.stringify(clone);
    this.state.quotations.unshift(clone);

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'QUOTATION_DUPLICATED',
      entityType: 'QUOTATION',
      entityId: clone.id,
      details: `Duplicated quotation ${original.quotationNumber} into new proposal ${newQuotationNumber}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return clone;
  }

  public createQuotationSnapshot(
    quotationId: string,
    pdfBase64: string,
    sentToEmail: string,
    actorId?: string
  ): QuotationSnapshotRecord {
    const quote = this.getQuotationById(quotationId);
    if (!quote) throw new Error(`Quotation not found: ${quotationId}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId);

    const snapshot: QuotationSnapshotRecord = {
      id: `qsnap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quotationId: quote.id,
      version: quote.version || 1,
      revisionNumber: quote.revisionNumber || 0,
      snapshotDataJson: JSON.stringify(quote),
      totalAmountInr: quote.totalAmountInr,
      pdfBase64,
      sentToEmail,
      sentAt: new Date().toISOString(),
      sentByUserId: actor?.id,
      sentByName: actor?.fullName,
      createdAt: new Date().toISOString(),
    };

    if (!this.state.quotationSnapshots) {
      this.state.quotationSnapshots = [];
    }
    this.state.quotationSnapshots.unshift(snapshot);
    this.persist(this.state);
    return snapshot;
  }

  public recordQuotationEmailLog(data: {
    quotationId: string;
    snapshotId?: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    messageBody?: string;
    status: 'SENT' | 'PROVIDER_ACCEPTED' | 'FAILED' | 'SIMULATED';
    providerMessageId?: string;
    errorMessage?: string;
    attachmentFilename?: string;
    sentByUserId?: string;
    sentByName?: string;
  }): QuotationEmailLogRecord {
    const log: QuotationEmailLogRecord = {
      id: `qemail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quotationId: data.quotationId,
      snapshotId: data.snapshotId,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      messageBody: data.messageBody,
      status: data.status,
      providerMessageId: data.providerMessageId,
      errorMessage: data.errorMessage,
      attachmentFilename: data.attachmentFilename,
      sentByUserId: data.sentByUserId,
      sentByName: data.sentByName,
      sentAt: new Date().toISOString(),
    };

    if (!this.state.quotationEmailLogs) {
      this.state.quotationEmailLogs = [];
    }
    this.state.quotationEmailLogs.unshift(log);
    this.persist(this.state);
    return log;
  }

  public getQuotationSnapshots(quotationId: string): QuotationSnapshotRecord[] {
    return (this.state.quotationSnapshots || []).filter((s) => s.quotationId === quotationId);
  }

  public getQuotationEmailLogs(quotationId: string): QuotationEmailLogRecord[] {
    return (this.state.quotationEmailLogs || []).filter((l) => l.quotationId === quotationId);
  }

  public updateQuotationStatus(
    id: string,
    status: QuotationRecord['status'],
    actorId: string,
    notes?: string
  ): QuotationRecord {
    const quote = this.getQuotationById(id);
    if (!quote) throw new Error(`Quotation not found: ${id}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    quote.status = status;

    if (status === 'SENT') {
      quote.sentAt = new Date().toISOString();
    } else if (status === 'ACCEPTED') {
      quote.acceptedAt = new Date().toISOString();
    } else if (status === 'REJECTED') {
      quote.rejectedAt = new Date().toISOString();
    }

    this.addLeadActivity({
      leadId: quote.leadId,
      userId: actor.id,
      userName: actor.fullName,
      type: 'QUOTATION',
      title: `Quotation Status Updated: ${status}`,
      description: notes || `Quotation ${quote.quotationNumber} changed to ${status}`,
      metadata: { quotationNumber: quote.quotationNumber, status },
    });

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: `QUOTATION_${status}`,
      entityType: 'QUOTATION',
      entityId: quote.id,
      details: `Quotation ${quote.quotationNumber} transitioned to ${status}. Notes: ${notes || 'N/A'}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.enqueueSyncJob(
      'QUOTATION_UPDATED',
      'QUOTATIONS',
      quote.id,
      this.formatQuotationForSync(quote)
    );

    this.persist(this.state);
    return quote;
  }

  public convertQuotationToBooking(quotationId: string, actorId: string): BookingRecord {
    const quote = this.getQuotationById(quotationId);
    if (!quote) throw new Error(`Quotation not found: ${quotationId}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    const customer = this.getCustomerById(quote.customerId);
    const lead = this.state.leads.find((l) => l.id === quote.leadId);

    // Accept quotation if not already accepted
    if (quote.status !== 'ACCEPTED') {
      quote.status = 'ACCEPTED';
      quote.acceptedAt = new Date().toISOString();
    }

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.bookings.length + 1).toString().padStart(4, '0');
    const bookingReference = `VH-BKG-${yearMonth}-${seq}`;

    // STRICT BUSINESS RULE: New bookings are NEVER automatically confirmed on creation; default to PENDING
    const booking: BookingRecord = {
      id: `bkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingReference,
      customerId: quote.customerId,
      customerName: customer ? customer.fullName : 'Customer',
      serviceType: lead ? lead.serviceType : 'PACKAGE',
      leadId: quote.leadId,
      managedByUserId: actor.id,
      managedByName: actor.fullName,
      travelStartDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      travelEndDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
      status: 'PENDING', // STRICT RULE: Pending confirmation
      totalAmountInr: quote.totalAmountInr,
      paidAmountInr: 0,
      balanceAmountInr: quote.totalAmountInr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.bookings.unshift(booking);

    // Create service components from quotation line items
    quote.lineItems.forEach((item, index) => {
      let category: BookingServiceComponent['serviceCategory'] = 'OTHER';
      const cat = item.serviceCategory.toUpperCase();
      if (cat.includes('FLIGHT')) category = 'FLIGHT';
      else if (cat.includes('HOTEL')) category = 'HOTEL';
      else if (cat.includes('VISA')) category = 'VISA';
      else if (cat.includes('TRANSFER') || cat.includes('VEHICLE')) category = 'TRANSFER';
      else if (cat.includes('HOUSEBOAT') || cat.includes('CRUISE')) category = 'CRUISE';

      const initialStatus = category === 'VISA' ? 'DOCUMENTS_REQUESTED' : 'REQUESTED';

      this.state.bookingServices.push({
        id: `srv-${Date.now()}-${index + 1}`,
        bookingId: booking.id,
        serviceCategory: category,
        serviceName: item.description,
        status: initialStatus,
        responsibleUserId: actor.id,
        responsibleUserName: actor.fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Advance lead stage to CONVERTED
    if (lead) {
      lead.stage = 'CONVERTED';
      lead.updatedAt = new Date().toISOString();
    }

    // Queue Google Sheets Sync for Bookings & Leads
    this.enqueueSyncJob('BOOKING_CREATED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));
    if (lead) {
      this.enqueueSyncJob('STAGE_CHANGED', 'ALL_LEADS', lead.id, this.formatLeadForSync(lead));
    }

    // Add activity & audit log
    this.addLeadActivity({
      leadId: quote.leadId,
      userId: actor.id,
      userName: actor.fullName,
      type: 'STAGE_CHANGE',
      title: 'Booking Created from Quotation',
      description: `Quotation ${quote.quotationNumber} accepted. Booking created (${bookingReference}) in PENDING status.`,
      metadata: { bookingReference, quotationNumber: quote.quotationNumber },
    });

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'BOOKING_CREATED_FROM_QUOTATION',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Created booking ${bookingReference} from accepted quote ${quote.quotationNumber}. Total: ₹${booking.totalAmountInr}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return booking;
  }

  public createBooking(data: {
    customerId: string;
    leadId?: string;
    serviceType: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL';
    managedByUserId: string;
    travelStartDate: string;
    travelEndDate: string;
    totalAmountInr: number;
    initialPaidAmountInr?: number;
    status?: BookingRecord['status'];
  }): BookingRecord {
    const actor = DEFAULT_USERS.find((u) => u.id === data.managedByUserId) || DEFAULT_USERS[0];
    const customer = this.getCustomerById(data.customerId);

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.bookings.length + 1).toString().padStart(4, '0');
    const bookingReference = `VH-BKG-${yearMonth}-${seq}`;

    const paid = data.initialPaidAmountInr || 0;
    const balance = data.totalAmountInr - paid;

    const booking: BookingRecord = {
      id: `bkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingReference,
      customerId: data.customerId,
      customerName: customer ? customer.fullName : 'Customer',
      serviceType: data.serviceType,
      leadId: data.leadId || null,
      managedByUserId: actor.id,
      managedByName: actor.fullName,
      travelStartDate: data.travelStartDate,
      travelEndDate: data.travelEndDate,
      status: data.status || 'PENDING',
      totalAmountInr: data.totalAmountInr,
      paidAmountInr: paid,
      balanceAmountInr: balance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.bookings.unshift(booking);

    this.enqueueSyncJob('BOOKING_CREATED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'BOOKING_CREATED_MANUAL',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Created manual booking ${bookingReference} for ${booking.customerName} (₹${booking.totalAmountInr})`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return booking;
  }

  public updateBookingStatus(
    id: string,
    status: BookingRecord['status'],
    actorId: string,
    notes?: string
  ): BookingRecord {
    const booking = this.getBookingById(id);
    if (!booking) throw new Error(`Booking not found: ${id}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    this.enqueueSyncJob('BOOKING_STATUS_CHANGED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));

    if (booking.leadId) {
      this.addLeadActivity({
        leadId: booking.leadId,
        userId: actor.id,
        userName: actor.fullName,
        type: 'STATUS_CHANGE',
        title: `Booking Status: ${status}`,
        description: notes || `Booking ${booking.bookingReference} status changed to ${status}`,
        metadata: { bookingReference: booking.bookingReference, status },
      });
    }

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'BOOKING_STATUS_CHANGED',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Booking ${booking.bookingReference} moved to status ${status}. Notes: ${notes || 'N/A'}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return booking;
  }

  // --- Booking Services (Phase 3) ---
  public getBookingServices(bookingId?: string): BookingServiceComponent[] {
    if (bookingId) {
      return this.state.bookingServices.filter((s) => s.bookingId === bookingId);
    }
    return this.state.bookingServices;
  }

  public addBookingService(component: Omit<BookingServiceComponent, 'id' | 'createdAt' | 'updatedAt'>): BookingServiceComponent {
    const newComp: BookingServiceComponent = {
      ...component,
      id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.bookingServices.push(newComp);
    this.persist(this.state);
    return newComp;
  }

  public updateBookingService(
    serviceId: string,
    updates: Partial<BookingServiceComponent>,
    actorId: string
  ): BookingServiceComponent {
    const idx = this.state.bookingServices.findIndex((s) => s.id === serviceId);
    if (idx === -1) throw new Error(`Booking service component not found: ${serviceId}`);

    const existing = this.state.bookingServices[idx];
    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];

    const updated: BookingServiceComponent = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.bookingServices[idx] = updated;

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'BOOKING_SERVICE_UPDATED',
      entityType: 'BOOKING_SERVICE',
      entityId: serviceId,
      details: `Updated ${updated.serviceCategory} component '${updated.serviceName}' to status '${updated.status}'`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return updated;
  }

  // --- Payments (Phase 3) ---
  public getPayments(bookingId?: string): PaymentRecord[] {
    if (bookingId) {
      return this.state.payments.filter((p) => p.bookingId === bookingId);
    }
    return this.state.payments;
  }

  public recordPayment(data: {
    bookingId: string;
    amountInr: number;
    paymentMethod: PaymentRecord['paymentMethod'];
    bankTransactionRef?: string;
    upiRef?: string;
    chequeDetails?: string;
    internalNotes?: string;
    recordedByUserId: string;
  }): PaymentRecord {
    const booking = this.getBookingById(data.bookingId);
    if (!booking) throw new Error(`Booking not found: ${data.bookingId}`);

    const actor = DEFAULT_USERS.find((u) => u.id === data.recordedByUserId) || DEFAULT_USERS[0];
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.payments.length + 1).toString().padStart(4, '0');
    const paymentReference = `VH-PAY-${yearMonth}-${seq}`;

    const payment: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentReference,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      customerId: booking.customerId,
      customerName: booking.customerName,
      amountInr: data.amountInr,
      paymentMethod: data.paymentMethod,
      bankTransactionRef: data.bankTransactionRef,
      upiRef: data.upiRef,
      chequeDetails: data.chequeDetails,
      paymentStatus: 'COMPLETED',
      receivedAt: new Date().toISOString(),
      internalNotes: data.internalNotes,
      recordedByUserId: actor.id,
      recordedByName: actor.fullName,
      createdAt: new Date().toISOString(),
    };

    this.state.payments.unshift(payment);

    // Update booking financials
    booking.paidAmountInr = (booking.paidAmountInr || 0) + data.amountInr;
    booking.balanceAmountInr = Math.max(0, booking.totalAmountInr - booking.paidAmountInr);
    booking.updatedAt = new Date().toISOString();

    // Auto-confirm booking if in PENDING and payment received
    if (booking.status === 'PENDING' && booking.paidAmountInr > 0) {
      booking.status = 'CONFIRMED';
    }

    // Sync booking status to Google Sheets
    this.enqueueSyncJob('BOOKING_STATUS_CHANGED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));

    // Lead activity
    if (booking.leadId) {
      this.addLeadActivity({
        leadId: booking.leadId,
        userId: actor.id,
        userName: actor.fullName,
        type: 'PAYMENT',
        title: `Payment Received: ₹${data.amountInr.toLocaleString('en-IN')}`,
        description: `Payment ${paymentReference} received via ${data.paymentMethod}. Balance remaining: ₹${booking.balanceAmountInr.toLocaleString('en-IN')}`,
        metadata: { paymentReference, amountInr: data.amountInr, balanceAmountInr: booking.balanceAmountInr },
      });
    }

    // Audit log
    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'PAYMENT_RECORDED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: `Recorded payment ${paymentReference} of ₹${data.amountInr} for booking ${booking.bookingReference} (${data.paymentMethod})`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return payment;
  }

  public recordRefund(
    paymentId: string,
    refundAmount: number,
    refundReference: string,
    actorId: string
  ): PaymentRecord {
    const payment = this.state.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error(`Payment record not found: ${paymentId}`);

    const booking = this.getBookingById(payment.bookingId);
    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];

    payment.refundAmountInr = refundAmount;
    payment.refundReference = refundReference;
    payment.refundedAt = new Date().toISOString();
    payment.paymentStatus = 'REFUNDED';

    if (booking) {
      booking.paidAmountInr = Math.max(0, (booking.paidAmountInr || 0) - refundAmount);
      booking.balanceAmountInr = booking.totalAmountInr - booking.paidAmountInr;
      booking.updatedAt = new Date().toISOString();
      this.enqueueSyncJob('BOOKING_STATUS_CHANGED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));
    }

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'PAYMENT_REFUNDED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: `Processed refund of ₹${refundAmount} for payment ${payment.paymentReference}. Refund ref: ${refundReference}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return payment;
  }

  // --- Communication Logs (Phase 3) ---
  public getCommunicationLogs(filter?: {
    customerId?: string;
    leadId?: string;
    bookingId?: string;
    channel?: string;
  }): CommunicationLogRecord[] {
    let logs = [...this.state.communicationLogs];
    if (filter?.customerId) {
      logs = logs.filter((l) => l.customerId === filter.customerId);
    }
    if (filter?.leadId) {
      logs = logs.filter((l) => l.leadId === filter.leadId);
    }
    if (filter?.bookingId) {
      logs = logs.filter((l) => l.bookingId === filter.bookingId);
    }
    if (filter?.channel) {
      logs = logs.filter((l) => l.channel === filter.channel);
    }
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public logCommunication(entry: Omit<CommunicationLogRecord, 'id' | 'createdAt'>): CommunicationLogRecord {
    const record: CommunicationLogRecord = {
      ...entry,
      id: `com-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    this.state.communicationLogs.unshift(record);

    if (entry.leadId) {
      this.addLeadActivity({
        leadId: entry.leadId,
        userId: entry.senderUserId,
        userName: entry.senderUserName,
        type: entry.channel === 'EMAIL' ? 'EMAIL' : 'WHATSAPP_CLICK',
        title: `${entry.channel === 'EMAIL' ? 'Email' : 'WhatsApp'} Dispatched: ${entry.templateTitle}`,
        description: `Status: ${entry.deliveryStatus}. Recipient: ${entry.customerContact}`,
        metadata: { channel: entry.channel, deliveryStatus: entry.deliveryStatus, templateKey: entry.templateKey },
      });
    }

    this.addAuditLog({
      userId: entry.senderUserId,
      userEmail: entry.senderUserName,
      action: `COMMUNICATION_${entry.channel}_${entry.deliveryStatus}`,
      entityType: 'COMMUNICATION',
      entityId: record.id,
      details: `Sent ${entry.channel} to ${entry.customerName} (${entry.customerContact}) - ${entry.templateTitle}. Status: ${entry.deliveryStatus}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return record;
  }

  // --- Customer 360 Unified Timeline ---
  public getCustomerTimeline(customerId: string) {
    const customer = this.getCustomerById(customerId);
    if (!customer) return [];

    const timeline: Array<{
      id: string;
      timestamp: string;
      type: 'LEAD' | 'ACTIVITY' | 'QUOTATION' | 'BOOKING' | 'PAYMENT' | 'SERVICE' | 'COMMUNICATION';
      title: string;
      subtitle?: string;
      status?: string;
      badgeColor?: string;
      details?: any;
      actor?: string;
    }> = [];

    // 1. Leads
    const customerLeads = this.state.leads.filter((l) => l.customerId === customerId);
    customerLeads.forEach((l) => {
      timeline.push({
        id: `tl-lead-${l.id}`,
        timestamp: l.createdAt,
        type: 'LEAD',
        title: `Enquiry Created: ${l.referenceId}`,
        subtitle: `${l.serviceType} Enquiry (${l.source})`,
        status: l.stage,
        badgeColor: 'sky',
        details: l,
      });

      // Activities for this lead
      const leadActs = this.state.activities.filter((a) => a.leadId === l.id);
      leadActs.forEach((a) => {
        timeline.push({
          id: `tl-act-${a.id}`,
          timestamp: a.createdAt,
          type: 'ACTIVITY',
          title: a.title,
          subtitle: a.description,
          status: a.type,
          badgeColor: 'amber',
          actor: a.userName,
          details: a.metadata,
        });
      });
    });

    // 2. Quotations
    const customerQuotes = this.state.quotations.filter((q) => q.customerId === customerId);
    customerQuotes.forEach((q) => {
      timeline.push({
        id: `tl-quo-${q.id}`,
        timestamp: q.createdAt,
        type: 'QUOTATION',
        title: `Quotation Issued: ${q.quotationNumber}`,
        subtitle: `${q.title} • ₹${q.totalAmountInr.toLocaleString('en-IN')}`,
        status: q.status,
        badgeColor: 'indigo',
        actor: q.createdByName,
        details: { totalAmountInr: q.totalAmountInr, validUntil: q.validUntil },
      });
    });

    // 3. Bookings & Services
    const customerBookings = this.state.bookings.filter((b) => b.customerId === customerId);
    customerBookings.forEach((b) => {
      timeline.push({
        id: `tl-bkg-${b.id}`,
        timestamp: b.createdAt,
        type: 'BOOKING',
        title: `Booking Established: ${b.bookingReference}`,
        subtitle: `${b.serviceType} • Total: ₹${b.totalAmountInr.toLocaleString('en-IN')} (Paid: ₹${(b.paidAmountInr || 0).toLocaleString('en-IN')})`,
        status: b.status,
        badgeColor: 'emerald',
        actor: b.managedByName,
        details: b,
      });

      // Service components for this booking
      const services = this.state.bookingServices.filter((s) => s.bookingId === b.id);
      services.forEach((s) => {
        timeline.push({
          id: `tl-srv-${s.id}`,
          timestamp: s.updatedAt || s.createdAt,
          type: 'SERVICE',
          title: `${s.serviceCategory} Milestone: ${s.serviceName}`,
          subtitle: `Reference: ${s.customerConfirmationRef || s.internalReference || 'Pending'}`,
          status: s.status,
          badgeColor: 'purple',
          actor: s.responsibleUserName,
          details: s,
        });
      });
    });

    // 4. Payments
    const customerPayments = this.state.payments.filter((p) => p.customerId === customerId);
    customerPayments.forEach((p) => {
      timeline.push({
        id: `tl-pay-${p.id}`,
        timestamp: p.receivedAt || p.createdAt,
        type: 'PAYMENT',
        title: `Payment Received: ₹${p.amountInr.toLocaleString('en-IN')}`,
        subtitle: `${p.paymentMethod} • Ref: ${p.paymentReference} (Booking: ${p.bookingReference})`,
        status: p.paymentStatus,
        badgeColor: 'emerald',
        actor: p.recordedByName,
        details: p,
      });
    });

    // 5. Communications
    const customerComms = this.state.communicationLogs.filter((c) => c.customerId === customerId);
    customerComms.forEach((c) => {
      timeline.push({
        id: `tl-com-${c.id}`,
        timestamp: c.createdAt,
        type: 'COMMUNICATION',
        title: `${c.channel} Notification: ${c.templateTitle}`,
        subtitle: c.content,
        status: c.deliveryStatus,
        badgeColor: c.deliveryStatus === 'FAILED' ? 'rose' : 'teal',
        actor: c.senderUserName,
        details: c,
      });
    });

    // Sort descending by timestamp
    return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLogRecord[] {
    return [...this.state.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addAuditLog(item: Omit<AuditLogRecord, 'id' | 'createdAt'>): AuditLogRecord {
    const log: AuditLogRecord = {
      ...item,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
    this.persist(this.state);
    return log;
  }

  // ====================================================
  // --- Visa Application & Client Communication System ---
  // ====================================================

  public getVisaApplications(filters?: {
    status?: VisaApplicationStatusCode;
    search?: string;
    country?: string;
    assignedUserId?: string;
  }): VisaApplicationRecord[] {
    let list = (this.state.visaApplications || []).filter((a) => !a.isDeleted);

    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.country) {
      list = list.filter((a) => a.destinationCountry.toLowerCase() === filters.country!.toLowerCase());
    }
    if (filters?.assignedUserId) {
      list = list.filter((a) => a.assignedUserId === filters.assignedUserId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.applicationReference.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.customerEmail.toLowerCase().includes(q) ||
          a.customerPhone.includes(q) ||
          a.destinationCountry.toLowerCase().includes(q) ||
          (a.officialReferenceNo && a.officialReferenceNo.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getVisaApplicationById(id: string): VisaApplicationRecord | null {
    return (this.state.visaApplications || []).find((a) => a.id === id && !a.isDeleted) || null;
  }

  public getVisaApplicationByReference(reference: string): VisaApplicationRecord | null {
    return (this.state.visaApplications || []).find((a) => a.applicationReference === reference && !a.isDeleted) || null;
  }

  public createVisaApplication(
    payload: Partial<VisaApplicationRecord>,
    actorId: string = 'usr-ananya-joshi-visa'
  ): VisaApplicationRecord {
    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    const now = new Date().toISOString();
    const id = `visa-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const currentCount = (this.state.visaApplications || []).length + 1;
    const applicationReference = `VH-VIS-${yearMonth}-${String(currentCount).padStart(4, '0')}`;

    const assignedUser = payload.assignedUserId
      ? DEFAULT_USERS.find((u) => u.id === payload.assignedUserId)
      : DEFAULT_USERS.find((u) => u.id === 'usr-ananya-joshi-visa') || actor;

    const record: VisaApplicationRecord = {
      id,
      applicationReference,
      leadId: payload.leadId || null,
      customerId: payload.customerId || '',
      customerName: payload.customerName || 'Valued Applicant',
      customerEmail: payload.customerEmail || '',
      customerPhone: payload.customerPhone || '',
      assignedUserId: assignedUser?.id || actor.id,
      assignedUserName: assignedUser?.fullName || actor.fullName,
      assignedUserEmail: assignedUser?.email || actor.email,
      assignedUserPhone: assignedUser?.phone || actor.phone,
      destinationCountry: payload.destinationCountry || 'Canada',
      visaType: payload.visaType || 'Tourist / Visitor Visa',
      visaCategory: payload.visaCategory || 'TOURIST',
      applicantCount: payload.applicantCount || 1,
      travelPlannedDate: payload.travelPlannedDate || null,
      stayDurationDays: payload.stayDurationDays || null,
      status: 'INQUIRY_RECEIVED',
      officialReferenceNo: payload.officialReferenceNo || null,
      inquiryDate: now,
      documentReceivedDate: null,
      submissionDate: null,
      decisionDate: null,
      completionDate: null,
      internalNotes: payload.internalNotes || '',
      specialInstructions: payload.specialInstructions || '',
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    if (!this.state.visaApplications) this.state.visaApplications = [];
    this.state.visaApplications.push(record);

    // Initial Status History Entry
    if (!this.state.visaStatusHistory) this.state.visaStatusHistory = [];
    this.state.visaStatusHistory.push({
      id: `vsh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      visaApplicationId: id,
      fromStatus: null,
      toStatus: 'INQUIRY_RECEIVED',
      changedByUserId: actor.id,
      changedByName: actor.fullName,
      notes: payload.internalNotes || 'Visa inquiry dossier registered into CRM',
      createdAt: now,
    });

    // Add Activity
    this.addActivity({
      leadId: payload.leadId || '',
      userId: actor.id,
      userName: actor.fullName,
      type: 'STATUS_CHANGE',
      title: `Visa Application Registered: ${applicationReference}`,
      description: `Inquiry for ${record.destinationCountry} (${record.visaType}) registered for ${record.customerName}`,
      metadata: { visaApplicationId: id, applicationReference, status: 'INQUIRY_RECEIVED' },
    });

    this.persist(this.state);
    return record;
  }

  public updateVisaApplicationStatus(
    id: string,
    newStatus: VisaApplicationStatusCode,
    actorId: string = 'usr-ananya-joshi-visa',
    notes?: string,
    officialRef?: string
  ): VisaApplicationRecord | null {
    const app = this.getVisaApplicationById(id);
    if (!app) return null;

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    const previousStatus = app.status;
    const now = new Date().toISOString();

    app.status = newStatus;
    app.updatedAt = now;

    if (officialRef) {
      app.officialReferenceNo = officialRef;
    }

    // Update milestone dates based on status
    if (newStatus === 'DOCUMENTS_RECEIVED' && !app.documentReceivedDate) {
      app.documentReceivedDate = now;
    } else if (newStatus === 'FILE_SUBMITTED' && !app.submissionDate) {
      app.submissionDate = now;
    } else if ((newStatus === 'VISA_APPROVED' || newStatus === 'VISA_REJECTED') && !app.decisionDate) {
      app.decisionDate = now;
    } else if (newStatus === 'COMPLETED' && !app.completionDate) {
      app.completionDate = now;
    }

    // Append to status history
    if (!this.state.visaStatusHistory) this.state.visaStatusHistory = [];
    this.state.visaStatusHistory.push({
      id: `vsh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      visaApplicationId: id,
      fromStatus: previousStatus,
      toStatus: newStatus,
      changedByUserId: actor.id,
      changedByName: actor.fullName,
      notes: notes || `Status changed from ${previousStatus} to ${newStatus}`,
      createdAt: now,
    });

    // Add activity
    this.addActivity({
      leadId: app.leadId || '',
      userId: actor.id,
      userName: actor.fullName,
      type: 'STATUS_CHANGE',
      title: `Visa Status: ${newStatus}`,
      description: `Application ${app.applicationReference} (${app.customerName}) transitioned to ${newStatus}. Notes: ${notes || 'Updated by employee'}`,
      metadata: { visaApplicationId: id, applicationReference: app.applicationReference, status: newStatus },
    });

    this.persist(this.state);
    return app;
  }

  public updateVisaApplication(
    id: string,
    updates: Partial<VisaApplicationRecord>,
    actorId: string = 'usr-ananya-joshi-visa'
  ): VisaApplicationRecord | null {
    const app = this.getVisaApplicationById(id);
    if (!app) return null;

    Object.assign(app, updates, { updatedAt: new Date().toISOString() });
    this.persist(this.state);
    return app;
  }

  public addVisaDocument(
    doc: Omit<VisaDocumentRecord, 'id' | 'uploadedAt'>
  ): VisaDocumentRecord {
    const id = `vdoc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const record: VisaDocumentRecord = {
      ...doc,
      id,
      uploadedAt: now,
    };

    if (!this.state.visaDocuments) this.state.visaDocuments = [];
    this.state.visaDocuments.push(record);
    this.persist(this.state);
    return record;
  }

  public getVisaDocuments(visaApplicationId: string): VisaDocumentRecord[] {
    return (this.state.visaDocuments || []).filter((d) => d.visaApplicationId === visaApplicationId);
  }

  public verifyVisaDocument(
    docId: string,
    isVerified: boolean,
    actorId: string = 'usr-ananya-joshi-visa'
  ): VisaDocumentRecord | null {
    const doc = (this.state.visaDocuments || []).find((d) => d.id === docId);
    if (!doc) return null;

    doc.isVerified = isVerified;
    doc.verifiedAt = isVerified ? new Date().toISOString() : null;
    this.persist(this.state);
    return doc;
  }

  public getVisaStatusHistory(visaApplicationId: string): VisaStatusHistoryRecord[] {
    return (this.state.visaStatusHistory || [])
      .filter((h) => h.visaApplicationId === visaApplicationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public addVisaCommunicationLog(
    log: Omit<VisaCommunicationLogRecord, 'id' | 'sentAt'>
  ): VisaCommunicationLogRecord {
    const id = `vlog-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const record: VisaCommunicationLogRecord = {
      ...log,
      id,
      sentAt: now,
    };

    if (!this.state.visaCommunicationLogs) this.state.visaCommunicationLogs = [];
    this.state.visaCommunicationLogs.push(record);

    // Also mirror to global CRM communicationLogs so it appears in unified timeline
    this.logCommunication({
      customerId: '',
      customerName: record.recipientName || 'Valued Applicant',
      customerContact: record.recipientEmail,
      senderUserId: record.sentByUserId,
      senderUserName: record.sentByName,
      templateKey: 'CUSTOM_MESSAGE',
      templateTitle: record.templateCode,
      channel: 'EMAIL',
      subject: record.subject,
      content: record.messageText || record.messageHtml,
      deliveryStatus: record.status === 'FAILED' ? 'FAILED' : 'SENT',
      providerRef: record.resendMessageId || undefined,
    });

    this.persist(this.state);
    return record;
  }

  public getVisaCommunicationLogs(visaApplicationId: string): VisaCommunicationLogRecord[] {
    return (this.state.visaCommunicationLogs || [])
      .filter((l) => l.visaApplicationId === visaApplicationId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  public getVisaDashboardStats() {
    const apps = (this.state.visaApplications || []).filter((a) => !a.isDeleted);
    const total = apps.length;

    const counts: Record<VisaApplicationStatusCode, number> = {
      INQUIRY_RECEIVED: 0,
      DOCUMENTS_RECEIVED: 0,
      DOCUMENTS_UNDER_REVIEW: 0,
      FILE_SUBMITTED: 0,
      UNDER_PROCESSING: 0,
      ADDITIONAL_INFORMATION_REQUIRED: 0,
      VISA_APPROVED: 0,
      VISA_REJECTED: 0,
      COMPLETED: 0,
    };

    for (const app of apps) {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    }

    return {
      total,
      counts,
      activeProcessing:
        counts.DOCUMENTS_RECEIVED +
        counts.DOCUMENTS_UNDER_REVIEW +
        counts.FILE_SUBMITTED +
        counts.UNDER_PROCESSING +
        counts.ADDITIONAL_INFORMATION_REQUIRED,
      approvedCount: counts.VISA_APPROVED + counts.COMPLETED,
      recentApplications: apps.slice(0, 10),
    };
  }

  // --- Package Cost Governance ---
  public getPackageCosts(): PackageCostItem[] {
    return this.state.packageCosts;
  }

  // --- Dashboard Analytics ---
  public getDashboardMetrics() {
    const totalLeads = this.state.leads.filter((l) => !l.isDeleted).length;
    const requestsCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'REQUESTS').length;
    const generalCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'GENERAL').length;
    const priorityCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'PRIORITY').length;
    const convertedCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'CONVERTED').length;
    const closedCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'CLOSED').length;

    const flightsCount = this.state.leads.filter((l) => !l.isDeleted && l.serviceType === 'FLIGHT').length;
    const packagesCount = this.state.leads.filter((l) => !l.isDeleted && l.serviceType === 'PACKAGE').length;
    const visaCount = this.state.leads.filter((l) => !l.isDeleted && l.serviceType === 'VISA').length;

    const pendingFollowUps = this.state.followUps.filter((f) => f.status === 'PENDING').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

    return {
      totalLeads,
      requestsCount,
      generalCount,
      priorityCount,
      convertedCount,
      closedCount,
      flightsCount,
      packagesCount,
      visaCount,
      pendingFollowUps,
      conversionRate,
      recentActivities: this.state.activities.slice(0, 10),
    };
  }
}

// Global Singleton for Hot Reloading in Next.js
const globalForCrm = globalThis as unknown as { crmRepo?: CrmRepository };
export const crmRepo = globalForCrm.crmRepo || new CrmRepository();
if (process.env.NODE_ENV !== 'production') globalForCrm.crmRepo = crmRepo;

