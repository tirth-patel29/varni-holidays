'use server';

import { prisma } from '@/lib/prisma';
import { crmRepo } from '@/lib/crm/store';
import {
  QuotationRecord,
  BookingRecord,
  BookingServiceComponent,
  PaymentRecord,
  CommunicationLogRecord,
  UpdateCategory,
  CommunicationChannel,
} from '@/lib/crm/types';
import { sendCustomerEmail, buildVarniEmailHtml } from '@/lib/integrations/email-service';
import { sendCustomerWhatsApp, buildClickToChatUrl } from '@/lib/integrations/whatsapp-service';
import { revalidatePath } from 'next/cache';

// ----------------------------------------------------
// 1. QUOTATION ACTIONS
// ----------------------------------------------------

export async function createQuotationAction(formData: {
  leadId: string;
  customerId: string;
  createdByUserId: string;
  createdByName: string;
  title: string;
  subtotalInr: number;
  taxesInr: number;
  discountInr: number;
  totalAmountInr: number;
  supplierNetCostInr?: number;
  validUntil: string;
  terms: string;
  inclusions?: string[];
  exclusions?: string[];
  internalNotes?: string;
  lineItems: Array<{
    itemOrder: number;
    description: string;
    serviceCategory: string;
    quantity: number;
    unitPriceInr: number;
    supplierCostInr?: number;
    totalAmountInr: number;
  }>;
}) {
  try {
    const quote = crmRepo.createQuotation(formData);
    revalidatePath('/employee/quotations');
    revalidatePath(`/employee/leads/${formData.leadId}`);
    return { success: true, quotation: quote };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateQuotationStatusAction(
  quotationId: string,
  status: QuotationRecord['status'],
  actorId: string,
  notes?: string
) {
  try {
    const quote = crmRepo.updateQuotationStatus(quotationId, status, actorId, notes);
    revalidatePath('/employee/quotations');
    revalidatePath(`/employee/quotations/${quotationId}`);
    return { success: true, quotation: quote };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function convertQuotationToBookingAction(quotationId: string, actorId: string) {
  try {
    const booking = crmRepo.convertQuotationToBooking(quotationId, actorId);
    revalidatePath('/employee/quotations');
    revalidatePath('/employee/bookings');
    revalidatePath('/employee/leads');
    return { success: true, booking };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// 2. BOOKING ACTIONS
// ----------------------------------------------------

export async function createManualBookingAction(data: {
  customerId: string;
  leadId?: string;
  serviceType: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL';
  managedByUserId: string;
  travelStartDate: string;
  travelEndDate: string;
  totalAmountInr: number;
  initialPaidAmountInr?: number;
  status?: BookingRecord['status'];
}) {
  try {
    const booking = crmRepo.createBooking(data);
    revalidatePath('/employee/bookings');
    return { success: true, booking };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateBookingStatusAction(
  bookingId: string,
  status: BookingRecord['status'],
  actorId: string,
  notes?: string
) {
  try {
    const booking = crmRepo.updateBookingStatus(bookingId, status, actorId, notes);
    revalidatePath('/employee/bookings');
    revalidatePath(`/employee/bookings/${bookingId}`);
    return { success: true, booking };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateBookingServiceComponentAction(
  serviceId: string,
  updates: Partial<BookingServiceComponent>,
  actorId: string
) {
  try {
    const component = crmRepo.updateBookingService(serviceId, updates, actorId);
    revalidatePath('/employee/bookings');
    return { success: true, component };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addBookingServiceComponentAction(
  arg1: any,
  arg2?: any,
  arg3?: string
) {
  try {
    let bId: string;
    let comp: any;
    if (typeof arg1 === 'string') {
      bId = arg1;
      comp = arg2;
    } else {
      bId = arg1.bookingId;
      comp = arg1;
    }
    const created = crmRepo.addBookingService({ ...comp, bookingId: bId });
    revalidatePath(`/employee/bookings/${bId}`);
    return { success: true, component: created };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// 3. PAYMENT & REFUND ACTIONS
// ----------------------------------------------------

export async function recordPaymentAction(data: {
  bookingId: string;
  amountInr: number;
  paymentMethod: PaymentRecord['paymentMethod'];
  bankTransactionRef?: string;
  upiRef?: string;
  chequeDetails?: string;
  internalNotes?: string;
  recordedByUserId: string;
}) {
  try {
    const payment = crmRepo.recordPayment(data);
    revalidatePath('/employee/bookings');
    revalidatePath(`/employee/bookings/${data.bookingId}`);
    return { success: true, payment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function recordRefundAction(
  paymentId: string,
  refundAmount: number,
  refundReference: string,
  actorId: string
) {
  try {
    const payment = crmRepo.recordRefund(paymentId, refundAmount, refundReference, actorId);
    revalidatePath('/employee/bookings');
    return { success: true, payment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// 4. CUSTOMER UPDATE COMPOSER ACTIONS (EMAIL & WHATSAPP)
// ----------------------------------------------------

export async function sendCustomerUpdateAction(payload: {
  customerId: string;
  leadId?: string;
  bookingId?: string;
  quotationId?: string;
  senderUserId: string;
  senderUserName: string;
  channel: CommunicationChannel;
  category: UpdateCategory;
  templateTitle: string;
  subject?: string;
  content: string;
  recipientContact: string; // Email or Phone number
}) {
  try {
    const customer = crmRepo.getCustomerById(payload.customerId);
    const customerName = customer ? customer.fullName : 'Valued Traveler';

    let deliveryStatus: CommunicationLogRecord['deliveryStatus'] = 'RECORD_CREATED';
    let providerRef: string | undefined = undefined;
    let clickToChatUrl: string | undefined = undefined;

    if (payload.channel === 'EMAIL') {
      const emailResult = await sendCustomerEmail({
        to: payload.recipientContact,
        toName: customerName,
        subject: payload.subject || `${payload.templateTitle} - Varni Holidays`,
        category: payload.category,
        headline: payload.templateTitle,
        bodyHtml: `<p>${payload.content.replace(/\n/g, '<br/>')}</p>`,
      });

      deliveryStatus = emailResult.success
        ? emailResult.providerStatus === 'PROVIDER_ACCEPTED' ? 'PROVIDER_ACCEPTED' : 'SENT'
        : 'FAILED';
      providerRef = emailResult.messageId;
    } else {
      // WHATSAPP
      const waResult = await sendCustomerWhatsApp({
        phoneNumber: payload.recipientContact,
        recipientName: customerName,
        category: payload.category,
        messageText: payload.content,
      });

      deliveryStatus = waResult.deliveryStatus;
      providerRef = waResult.messageId;
      clickToChatUrl = waResult.clickToChatUrl;
    }

    const log = crmRepo.logCommunication({
      customerId: payload.customerId,
      customerName,
      customerContact: payload.recipientContact,
      leadId: payload.leadId,
      bookingId: payload.bookingId,
      quotationId: payload.quotationId,
      senderUserId: payload.senderUserId,
      senderUserName: payload.senderUserName,
      templateKey: payload.category,
      templateTitle: payload.templateTitle,
      channel: payload.channel,
      subject: payload.subject,
      content: payload.content,
      providerRef,
      deliveryStatus,
      sentAt: new Date().toISOString(),
    });

    revalidatePath('/employee/communications');
    revalidatePath(`/employee/customers/${payload.customerId}`);

    return {
      success: true,
      log,
      clickToChatUrl,
      deliveryStatus,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// 5. DATA QUERIES
// ----------------------------------------------------

export async function getBookingsAction(customerId?: string) {
  try {
    const bookings = crmRepo.getBookings(customerId);
    return { success: true, bookings };
  } catch (err: any) {
    return { success: false, error: err.message, bookings: [] };
  }
}

export async function getCommunicationsAction(filter?: { customerId?: string; leadId?: string; bookingId?: string; channel?: string }) {
  try {
    const logs = crmRepo.getCommunicationLogs(filter);
    return { success: true, logs };
  } catch (err: any) {
    return { success: false, error: err.message, logs: [] };
  }
}

export async function getCustomerTimelineAction(customerId: string) {
  try {
    const timeline = crmRepo.getCustomerTimeline(customerId);
    return { success: true, timeline };
  } catch (err: any) {
    return { success: false, error: err.message, timeline: [] };
  }
}

export async function getBookingDetailsAction(bookingId: string) {
  try {
    const booking = crmRepo.getBookingById(bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };
    const services = crmRepo.getBookingServices(booking.id);
    const payments = crmRepo.getPayments(booking.id);
    const customer = crmRepo.getCustomerById(booking.customerId);
    return { success: true, booking, services, payments, customer };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getQuotationDetailsAction(quotationId: string) {
  try {
    // 1. Try Prisma first if database is available
    try {
      const dbQuo = await prisma.quotation.findFirst({
        where: {
          OR: [
            { id: quotationId },
            { quotationReference: quotationId },
          ],
        },
        include: {
          customer: true,
          lead: true,
          lineItems: true,
          createdByUser: true,
        },
      });

      if (dbQuo) {
        const lineItems = dbQuo.lineItems.map((li) => ({
          itemOrder: li.itemOrder,
          description: li.title || li.description || 'Travel Service',
          serviceCategory: li.serviceType,
          quantity: li.quantity,
          unitPriceInr: Number(li.unitPriceInr),
          totalPriceInr: Number(li.totalPriceInr),
        }));

        return {
          success: true,
          quotation: {
            id: dbQuo.id,
            quotationNumber: dbQuo.quotationReference,
            leadId: dbQuo.leadId,
            customerId: dbQuo.customerId,
            createdByUserId: dbQuo.createdByUserId,
            createdByName: dbQuo.createdByUser?.fullName || 'Neel Patel',
            status: dbQuo.status,
            title: (dbQuo as any).title || dbQuo.customerNotes || 'Customized Travel Quotation',
            subtotalInr: Number(dbQuo.subtotalAmountInr || dbQuo.totalAmountInr),
            taxesInr: Number(dbQuo.taxAmountInr || 0),
            discountInr: Number(dbQuo.discountAmountInr || 0),
            totalAmountInr: Number(dbQuo.totalAmountInr),
            validUntil: dbQuo.validUntil.toISOString(),
            terms: dbQuo.termsAndConditions || '50% advance for booking confirmation. Balance due 7 days prior to travel.',
            inclusions: (dbQuo as any).inclusions || ['Accommodation with breakfast', 'Private AC Vehicle & Chauffeur', 'Tolls, parking, and driver allowances'],
            exclusions: (dbQuo as any).exclusions || ['Airfare (unless specified)', 'Personal expenses', 'Monument entry fees'],
            lineItems,
            createdAt: dbQuo.createdAt.toISOString(),
          },
          customer: dbQuo.customer,
          lead: dbQuo.lead,
          lineItems,
        };
      }
    } catch (e) {
      console.warn('Prisma getQuotationDetails fallback to crmRepo:', e);
    }

    // 2. Fallback to crmRepo
    const quotation = crmRepo.getQuotationById(quotationId);
    if (!quotation) return { success: false, error: 'Quotation not found' };
    const customer = crmRepo.getCustomerById(quotation.customerId);
    const lead = quotation.leadId ? crmRepo.getLeadById(quotation.leadId) : undefined;
    return { success: true, quotation, customer, lead, lineItems: quotation.lineItems };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
