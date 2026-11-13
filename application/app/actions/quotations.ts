'use server';

import { crmRepo } from '@/lib/crm/store';
import { prisma } from '@/lib/prisma';
import { QuotationRecord } from '@/lib/crm/types';
import { calculateQuotationPricing, QuotationPricingInput } from '@/lib/quotations/pricing';
import { generateQuotationPdf, QuotationPdfData } from '@/lib/quotations/pdf-generator';
import { sendCustomerEmail, buildQuotationProposalEmailHtml } from '@/lib/integrations/email-service';
import { TOUR_PACKAGES_CATALOGUE, HOTELS_CATALOGUE, findPackageBySlug, findHotelById } from '@/lib/quotations/catalogue';
import { COMPANY_CONTACT } from '@/lib/config/contact';
import { DEFAULT_USERS } from '@/lib/auth/session';

/**
 * Fetch Quotations for Dashboard with Filter & Stats aggregation
 */
export async function getQuotationsDashboardAction(filters?: {
  status?: string;
  type?: string;
  search?: string;
  employeeId?: string;
}) {
  try {
    const allQuotes = crmRepo.getQuotations();

    // Calculate metrics across all active quotations
    const totalCount = allQuotes.length;
    const draftCount = allQuotes.filter((q) => q.status === 'DRAFT').length;
    const sentCount = allQuotes.filter((q) => q.status === 'SENT').length;
    const acceptedCount = allQuotes.filter((q) => q.status === 'ACCEPTED').length;
    const rejectedCount = allQuotes.filter((q) => q.status === 'REJECTED').length;
    const expiredCount = allQuotes.filter((q) => q.status === 'EXPIRED').length;
    const totalQuotedValue = allQuotes.reduce((sum, q) => sum + (Number(q.totalAmountInr) || 0), 0);

    // Apply filtering
    let filtered = [...allQuotes];

    if (filters?.status && filters.status !== 'ALL') {
      filtered = filtered.filter((q) => q.status === filters.status);
    }

    if (filters?.type && filters.type !== 'ALL') {
      filtered = filtered.filter((q) => q.quotationType === filters.type);
    }

    if (filters?.employeeId && filters.employeeId !== 'ALL') {
      filtered = filtered.filter((q) => q.createdByUserId === filters.employeeId);
    }

    if (filters?.search && filters.search.trim()) {
      const qLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter((q) => {
        const num = (q.quotationNumber || '').toLowerCase();
        const title = (q.title || '').toLowerCase();
        const custName = (q.customerName || '').toLowerCase();
        const dest = (q.destination || '').toLowerCase();
        const phone = (q.customerPhone || '').toLowerCase();
        return (
          num.includes(qLower) ||
          title.includes(qLower) ||
          custName.includes(qLower) ||
          dest.includes(qLower) ||
          phone.includes(qLower)
        );
      });
    }

    return {
      success: true,
      quotations: filtered,
      metrics: {
        totalCount,
        draftCount,
        sentCount,
        acceptedCount,
        rejectedCount,
        expiredCount,
        totalQuotedValue,
      },
    };
  } catch (err: any) {
    console.error('getQuotationsDashboardAction error:', err);
    return {
      success: false,
      quotations: [],
      metrics: {
        totalCount: 0,
        draftCount: 0,
        sentCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        expiredCount: 0,
        totalQuotedValue: 0,
      },
      error: err.message || 'Failed to retrieve quotations',
    };
  }
}

/**
 * Retrieve comprehensive details for a single quotation
 */
export async function getQuotationDetailsAction(id: string) {
  try {
    const quotation = crmRepo.getQuotationById(id);
    if (!quotation) {
      return { success: false, error: `Quotation not found: ${id}` };
    }

    const customer = crmRepo.getCustomerById(quotation.customerId);
    const lead = quotation.leadId ? crmRepo.getLeadById(quotation.leadId) : null;
    const snapshots = crmRepo.getQuotationSnapshots(quotation.id);
    const emailLogs = crmRepo.getQuotationEmailLogs(quotation.id);

    return {
      success: true,
      quotation,
      customer: customer || {
        fullName: quotation.customerName || 'Valued Client',
        phoneNumber: quotation.customerPhone || '',
        email: quotation.customerEmail || null,
      },
      lead,
      snapshots,
      emailLogs,
    };
  } catch (err: any) {
    console.error('getQuotationDetailsAction error:', err);
    return { success: false, error: err.message || 'Failed to load quotation details' };
  }
}

/**
 * Create a brand new quotation with server-calculated pricing
 */
export async function createQuotationAction(payload: {
  quotationType: 'PACKAGE' | 'HOTEL' | 'CUSTOM';
  leadId?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  city?: string;
  actorId: string;

  title: string;
  destination?: string;
  durationNights?: number;
  durationDays?: number;
  travelStartDate?: string;
  travelEndDate?: string;
  adultsCount: number;
  childrenCount: number;
  roomsCount: number;
  hotelCategory?: string;
  mealPlan?: string;
  transportType?: string;
  sourcePackageSlug?: string;
  sourceHotelId?: string;

  pricing: QuotationPricingInput;

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
  terms?: string;
  internalNotes?: string;
  customerNotes?: string;
  validUntil?: string;
}) {
  try {
    const actor = DEFAULT_USERS.find((u) => u.id === payload.actorId) || DEFAULT_USERS[0];

    // Ensure customer exists or create a customer record in CRM
    let customerId = payload.customerId;
    if (!customerId) {
      // Find or create customer
      const existing = crmRepo.findCustomerByPhone(payload.customerPhone);
      if (existing) {
        customerId = existing.id;
      } else {
        const newCust = crmRepo.createCustomer({
          fullName: payload.customerName,
          phoneNumber: payload.customerPhone,
          email: payload.customerEmail || undefined,
          city: payload.city || undefined,
        });
        customerId = newCust.id;
      }
    }

    if (!customerId) {
      customerId = 'cust-direct';
    }

    // Accurate server-side calculation
    const calc = calculateQuotationPricing(payload.pricing);

    // Default validity: 7 days from now
    const validUntilDate = payload.validUntil
      ? new Date(payload.validUntil).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const quote = crmRepo.createQuotation({
      quotationType: payload.quotationType,
      leadId: payload.leadId,
      customerId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      createdByUserId: actor.id,
      createdByName: actor.fullName,
      title: payload.title,
      destination: payload.destination,
      durationNights: payload.durationNights,
      durationDays: payload.durationDays,
      travelStartDate: payload.travelStartDate,
      travelEndDate: payload.travelEndDate,
      adultsCount: calc.adultsCount,
      childrenCount: calc.childrenCount,
      roomsCount: calc.roomsCount,
      hotelCategory: payload.hotelCategory,
      mealPlan: payload.mealPlan,
      transportType: payload.transportType,
      sourcePackageSlug: payload.sourcePackageSlug,
      sourceHotelId: payload.sourceHotelId,

      basePriceInr: calc.basePriceInr,
      transportChargesInr: calc.transportChargesInr,
      additionalServicesInr: calc.additionalServicesTotalInr,
      extraChargesInr: calc.extraChargesInr,
      discountType: calc.discountType,
      discountValue: calc.discountValue,
      discountInr: calc.discountAmountInr,
      taxPercent: calc.taxPercent,
      taxesInr: calc.taxAmountInr,
      subtotalInr: calc.taxableSubtotalInr,
      totalAmountInr: calc.totalPayableAmountInr,

      validUntil: validUntilDate,
      terms:
        payload.terms ||
        'Standard Varni Holidays Terms: 25% booking advance, 50% upon voucher issuance, balance 7 days prior to travel. Cancellation penalties apply as per hotel & airline policies.',
      inclusions: payload.inclusions || [],
      exclusions: payload.exclusions || [],
      itineraryDays: payload.itineraryDays || [],
      hotelDetails: payload.hotelDetails,
      internalNotes: payload.internalNotes,
      customerNotes: payload.customerNotes,
      lineItems: calc.lineItems,
    });

    return {
      success: true,
      quotation: quote,
    };
  } catch (err: any) {
    console.error('createQuotationAction error:', err);
    return {
      success: false,
      error: err.message || 'Failed to create quotation',
    };
  }
}

/**
 * Update an existing draft quotation
 */
export async function updateQuotationDraftAction(
  id: string,
  payload: {
    title?: string;
    destination?: string;
    durationNights?: number;
    durationDays?: number;
    travelStartDate?: string;
    travelEndDate?: string;
    adultsCount?: number;
    childrenCount?: number;
    roomsCount?: number;
    hotelCategory?: string;
    mealPlan?: string;
    transportType?: string;
    pricing?: QuotationPricingInput;
    inclusions?: string[];
    exclusions?: string[];
    itineraryDays?: any[];
    hotelDetails?: any;
    terms?: string;
    internalNotes?: string;
    customerNotes?: string;
    validUntil?: string;
    actorId: string;
  }
) {
  try {
    const existing = crmRepo.getQuotationById(id);
    if (!existing) return { success: false, error: 'Quotation not found' };
    if (existing.status !== 'DRAFT') {
      return {
        success: false,
        error: `Cannot modify a quotation in status "${existing.status}". Create a new revision to preserve history.`,
      };
    }

    const updateData: Partial<QuotationRecord> = {};

    if (payload.title) updateData.title = payload.title;
    if (payload.destination !== undefined) updateData.destination = payload.destination;
    if (payload.durationNights !== undefined) updateData.durationNights = payload.durationNights;
    if (payload.durationDays !== undefined) updateData.durationDays = payload.durationDays;
    if (payload.travelStartDate !== undefined) updateData.travelStartDate = payload.travelStartDate;
    if (payload.travelEndDate !== undefined) updateData.travelEndDate = payload.travelEndDate;
    if (payload.hotelCategory !== undefined) updateData.hotelCategory = payload.hotelCategory;
    if (payload.mealPlan !== undefined) updateData.mealPlan = payload.mealPlan;
    if (payload.transportType !== undefined) updateData.transportType = payload.transportType;
    if (payload.inclusions) updateData.inclusions = payload.inclusions;
    if (payload.exclusions) updateData.exclusions = payload.exclusions;
    if (payload.itineraryDays) updateData.itineraryDays = payload.itineraryDays;
    if (payload.hotelDetails) updateData.hotelDetails = payload.hotelDetails;
    if (payload.terms) updateData.terms = payload.terms;
    if (payload.internalNotes !== undefined) updateData.internalNotes = payload.internalNotes;
    if (payload.customerNotes !== undefined) updateData.customerNotes = payload.customerNotes;
    if (payload.validUntil) updateData.validUntil = payload.validUntil;

    if (payload.pricing) {
      const calc = calculateQuotationPricing(payload.pricing);
      updateData.basePriceInr = calc.basePriceInr;
      updateData.transportChargesInr = calc.transportChargesInr;
      updateData.additionalServicesInr = calc.additionalServicesTotalInr;
      updateData.extraChargesInr = calc.extraChargesInr;
      updateData.discountType = calc.discountType;
      updateData.discountValue = calc.discountValue;
      updateData.discountInr = calc.discountAmountInr;
      updateData.taxPercent = calc.taxPercent;
      updateData.taxesInr = calc.taxAmountInr;
      updateData.subtotalInr = calc.taxableSubtotalInr;
      updateData.totalAmountInr = calc.totalPayableAmountInr;
      updateData.adultsCount = calc.adultsCount;
      updateData.childrenCount = calc.childrenCount;
      updateData.roomsCount = calc.roomsCount;
      updateData.lineItems = calc.lineItems;
    }

    const updated = crmRepo.updateQuotationDraft(id, updateData, payload.actorId);
    return { success: true, quotation: updated };
  } catch (err: any) {
    console.error('updateQuotationDraftAction error:', err);
    return { success: false, error: err.message || 'Failed to update quotation draft' };
  }
}

/**
 * Create a new revision from a sent quotation
 */
export async function createQuotationRevisionAction(id: string, actorId: string) {
  try {
    const revision = crmRepo.createQuotationRevision(id, actorId);
    return { success: true, quotation: revision };
  } catch (err: any) {
    console.error('createQuotationRevisionAction error:', err);
    return { success: false, error: err.message || 'Failed to create revision' };
  }
}

/**
 * Duplicate a quotation as a fresh draft
 */
export async function duplicateQuotationAction(id: string, actorId: string) {
  try {
    const duplicate = crmRepo.duplicateQuotation(id, actorId);
    return { success: true, quotation: duplicate };
  } catch (err: any) {
    console.error('duplicateQuotationAction error:', err);
    return { success: false, error: err.message || 'Failed to duplicate quotation' };
  }
}

/**
 * Update quotation status (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)
 */
export async function updateQuotationStatusAction(
  id: string,
  status: QuotationRecord['status'],
  actorId: string,
  notes?: string
) {
  try {
    const updated = crmRepo.updateQuotationStatus(id, status, actorId, notes);
    return { success: true, quotation: updated };
  } catch (err: any) {
    console.error('updateQuotationStatusAction error:', err);
    return { success: false, error: err.message || 'Failed to update status' };
  }
}

/**
 * Send Quotation Email via Resend with Server-Side Generated PDF Attached
 */
export async function sendQuotationEmailAction(payload: {
  quotationId: string;
  recipientEmail: string;
  subject?: string;
  customMessage?: string;
  actorId: string;
}) {
  try {
    const quote = crmRepo.getQuotationById(payload.quotationId);
    if (!quote) return { success: false, error: 'Quotation not found' };

    const actor = DEFAULT_USERS.find((u) => u.id === payload.actorId) || DEFAULT_USERS[0];
    const customer = crmRepo.getCustomerById(quote.customerId);
    const recipientName = customer?.fullName || quote.customerName || 'Valued Guest';

    // 1. Prepare PDF Data
    const pdfData: QuotationPdfData = {
      quotationNumber: quote.quotationNumber,
      quotationType: quote.quotationType || 'PACKAGE',
      version: quote.version || 1,
      revisionNumber: quote.revisionNumber,
      title: quote.title,
      createdAt: quote.createdAt,
      validUntil: quote.validUntil,
      createdByName: quote.createdByName,
      customer: {
        fullName: recipientName,
        email: payload.recipientEmail,
        phoneNumber: quote.customerPhone || customer?.phoneNumber || '',
        city: customer?.city,
      },
      destination: quote.destination,
      durationNights: quote.durationNights,
      durationDays: quote.durationDays,
      travelStartDate: quote.travelStartDate,
      travelEndDate: quote.travelEndDate,
      adultsCount: quote.adultsCount || 2,
      childrenCount: quote.childrenCount || 0,
      roomsCount: quote.roomsCount || 1,
      hotelCategory: quote.hotelCategory,
      mealPlan: quote.mealPlan,
      transportType: quote.transportType,
      itineraryDays: quote.itineraryDays,
      hotelDetails: quote.hotelDetails,
      inclusions: quote.inclusions || [],
      exclusions: quote.exclusions || [],
      basePriceInr: quote.basePriceInr || quote.subtotalInr,
      transportChargesInr: quote.transportChargesInr,
      additionalServicesTotalInr: quote.additionalServicesInr,
      extraChargesInr: quote.extraChargesInr,
      grossSubtotalInr: (quote.basePriceInr || quote.subtotalInr) + (quote.transportChargesInr || 0) + (quote.additionalServicesInr || 0) + (quote.extraChargesInr || 0),
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      discountAmountInr: quote.discountInr || 0,
      taxableSubtotalInr: quote.subtotalInr,
      taxPercent: quote.taxPercent !== undefined ? quote.taxPercent : 5,
      taxAmountInr: quote.taxesInr || 0,
      totalPayableAmountInr: quote.totalAmountInr,
      lineItems: quote.lineItems,
      termsAndConditions: quote.terms,
      customerNotes: quote.customerNotes,
    };

    // 2. Generate PDF Buffer & Base64
    const pdfBuffer = generateQuotationPdf(pdfData);
    const pdfBase64 = pdfBuffer.toString('base64');
    const attachmentFilename = `${quote.quotationNumber}.pdf`;

    // 3. Create Immutable Sent Snapshot
    const snapshot = crmRepo.createQuotationSnapshot(quote.id, pdfBase64, payload.recipientEmail, actor.id);

    // 4. Build Email Content
    const emailSubject =
      payload.subject ||
      `Official Travel Proposal (${quote.quotationNumber}) – ${quote.title} | Varni Holidays`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://varni-holidays.vercel.app';
    const proposalUrl = `${appUrl}/quotation/${quote.id}`;

    const emailHtml = buildQuotationProposalEmailHtml({
      customerName: recipientName,
      quotationNumber: quote.quotationNumber,
      title: quote.title,
      destination: quote.destination,
      totalAmountInr: quote.totalAmountInr,
      validUntil: quote.validUntil,
      customMessage: payload.customMessage,
      proposalUrl,
    });

    // 5. Send via Resend with PDF Attachment
    const sendResult = await sendCustomerEmail({
      to: payload.recipientEmail,
      toName: recipientName,
      subject: emailSubject,
      customHtml: emailHtml,
      quotationRef: quote.quotationNumber,
      attachments: [
        {
          filename: attachmentFilename,
          content: pdfBase64,
        },
      ],
    });

    // 6. Record Email Log in Database
    const log = crmRepo.recordQuotationEmailLog({
      quotationId: quote.id,
      snapshotId: snapshot.id,
      recipientEmail: payload.recipientEmail,
      recipientName,
      subject: emailSubject,
      messageBody: payload.customMessage || 'Standard Proposal Email with PDF Attachment',
      status: sendResult.success ? (sendResult.providerStatus === 'SIMULATED' ? 'SIMULATED' : 'SENT') : 'FAILED',
      providerMessageId: sendResult.messageId,
      errorMessage: sendResult.error,
      attachmentFilename,
      sentByUserId: actor.id,
      sentByName: actor.fullName,
    });

    // 7. Transition status to SENT if current is DRAFT
    if (quote.status === 'DRAFT' && sendResult.success) {
      crmRepo.updateQuotationStatus(quote.id, 'SENT', actor.id, `Dispatched via email to ${payload.recipientEmail}`);
    }

    return {
      success: sendResult.success,
      providerStatus: sendResult.providerStatus,
      messageId: sendResult.messageId,
      emailLog: log,
      error: sendResult.error,
    };
  } catch (err: any) {
    console.error('sendQuotationEmailAction error:', err);
    return {
      success: false,
      error: err.message || 'Failed to dispatch quotation email',
    };
  }
}

/**
 * Search CRM Customers and Enquiries for quick selection in quotation form
 */
export async function searchCrmCustomersAndLeadsAction(query: string) {
  try {
    const qLower = (query || '').toLowerCase().trim();
    const allCustomers = crmRepo.getCustomers();
    const allLeads = crmRepo.getLeads();

    const matchedCustomers = allCustomers
      .filter((c) => {
        if (!qLower) return true;
        return (
          c.fullName.toLowerCase().includes(qLower) ||
          c.phoneNumber.includes(qLower) ||
          (c.email && c.email.toLowerCase().includes(qLower))
        );
      })
      .slice(0, 10);

    const matchedLeads = allLeads
      .filter((l) => {
        if (!qLower) return true;
        const ref = (l.referenceId || '').toLowerCase();
        const cust = crmRepo.getCustomerById(l.customerId);
        const name = (cust?.fullName || '').toLowerCase();
        return ref.includes(qLower) || name.includes(qLower);
      })
      .map((l) => {
        const cust = crmRepo.getCustomerById(l.customerId);
        return {
          id: l.id,
          referenceId: l.referenceId,
          serviceType: l.serviceType,
          stage: l.stage,
          customerName: cust?.fullName || 'Unknown Customer',
          customerPhone: cust?.phoneNumber || '',
          customerEmail: cust?.email || null,
          packageDetail: l.packageDetail,
          customHolidayDetail: l.customHolidayDetail,
        };
      })
      .slice(0, 10);

    return {
      success: true,
      customers: matchedCustomers,
      leads: matchedLeads,
    };
  } catch (err: any) {
    console.error('searchCrmCustomersAndLeadsAction error:', err);
    return { success: false, customers: [], leads: [] };
  }
}

/**
 * Return Tour Packages Catalogue
 */
export async function getPackageCatalogueAction() {
  return { success: true, packages: TOUR_PACKAGES_CATALOGUE };
}

/**
 * Return Hotel Collections Catalogue
 */
export async function getHotelCatalogueAction() {
  return { success: true, hotels: HOTELS_CATALOGUE };
}

