import prisma from '@/lib/prisma';
import { getAuthenticatedCustomer, AuthenticatedCustomer } from '@/lib/auth/customer-auth';

export interface CustomerDashboardData {
  customer: AuthenticatedCustomer;
  upcomingBooking: any | null;
  activeBooking: any | null;
  counts: {
    upcomingTrips: number;
    pendingQuotations: number;
    activeVisas: number;
  };
  pendingQuotations: any[];
  recentVisas: any[];
  notifications: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    href?: string;
  }[];
}

/**
 * Retrieve personalized, strictly isolated dashboard data for the authenticated customer.
 */
export async function getCustomerDashboard(sessionCustomer?: AuthenticatedCustomer): Promise<CustomerDashboardData | null> {
  const customer = sessionCustomer || await getAuthenticatedCustomer();
  if (!customer) return null;

  const now = new Date();

  // 1. Fetch Customer's Bookings
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: customer.id,
      isDeleted: false,
    },
    include: {
      quotation: true,
      services: true,
      payments: true,
    },
    orderBy: {
      travelStartDate: 'asc',
    },
  });

  // Filter upcoming and ongoing trips
  const activeBooking = bookings.find(
    (b) => b.travelStartDate <= now && b.travelEndDate >= now && b.status === 'CONFIRMED'
  ) || null;

  const upcomingBooking = bookings.find(
    (b) => b.travelStartDate > now && (b.status === 'CONFIRMED' || b.status === 'DRAFT')
  ) || null;

  // 2. Fetch Customer's Quotations
  const quotations = await prisma.quotation.findMany({
    where: {
      customerId: customer.id,
      isDeleted: false,
    },
    include: {
      lineItems: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const pendingQuotations = quotations.filter(
    (q) => (q.status === 'SENT' || q.status === 'DRAFT') && q.validUntil >= now
  );

  // 3. Fetch Customer's Visa Dossiers
  const visas = await prisma.visaApplication.findMany({
    where: {
      customerId: customer.id,
      isDeleted: false,
    },
    include: {
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      documents: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // 4. Synthesize relevant real notifications
  const notifications: CustomerDashboardData['notifications'] = [];

  if (pendingQuotations.length > 0) {
    const topQuote = pendingQuotations[0];
    notifications.push({
      id: `quote-${topQuote.id}`,
      title: 'Quotation Ready for Review',
      message: `Your customized itinerary for ${topQuote.title || topQuote.destination} is ready for approval.`,
      type: 'warning',
      href: `/app/quotations/${topQuote.id}`,
    });
  }

  const inProgressVisa = visas.find(
    (v) => v.status === 'DOCUMENTS_RECEIVED' || v.status === 'FILE_SUBMITTED'
  );
  if (inProgressVisa) {
    notifications.push({
      id: `visa-${inProgressVisa.id}`,
      title: `Visa Application Update: ${inProgressVisa.destinationCountry}`,
      message: `Your file is currently processing under reference ${inProgressVisa.applicationReference}.`,
      type: 'info',
      href: '/app/visa',
    });
  }

  return {
    customer,
    upcomingBooking,
    activeBooking,
    counts: {
      upcomingTrips: bookings.filter((b) => b.travelStartDate > now).length,
      pendingQuotations: pendingQuotations.length,
      activeVisas: visas.filter((v) => v.status !== 'COMPLETED' && v.status !== 'VISA_REJECTED').length,
    },
    pendingQuotations,
    recentVisas: visas,
    notifications,
  };
}

/**
 * Retrieve all bookings for the authenticated customer, segmented by lifecycle status.
 */
export async function getCustomerBookings(sessionCustomer?: AuthenticatedCustomer) {
  const customer = sessionCustomer || await getAuthenticatedCustomer();
  if (!customer) return null;

  const now = new Date();

  const allBookings = await prisma.booking.findMany({
    where: {
      customerId: customer.id,
      isDeleted: false,
    },
    include: {
      quotation: true,
      services: true,
      payments: true,
    },
    orderBy: {
      travelStartDate: 'asc',
    },
  });

  const upcoming = allBookings.filter(
    (b) => b.travelStartDate > now && b.status !== 'CANCELLED'
  );
  const ongoing = allBookings.filter(
    (b) => b.travelStartDate <= now && b.travelEndDate >= now && b.status !== 'CANCELLED'
  );
  const completed = allBookings.filter(
    (b) => b.travelEndDate < now || b.status === 'COMPLETED'
  );
  const cancelled = allBookings.filter((b) => b.status === 'CANCELLED');

  return {
    customer,
    counts: {
      total: allBookings.length,
      upcoming: upcoming.length,
      ongoing: ongoing.length,
      completed: completed.length,
      cancelled: cancelled.length,
    },
    upcoming,
    ongoing,
    completed,
    cancelled,
  };
}

/**
 * Retrieve single booking detail with STRICT CUSTOMER DATA ISOLATION.
 * Guaranteed: Customer A can never access Customer B's booking.
 */
export async function getCustomerBookingDetail(bookingId: string, sessionCustomer?: AuthenticatedCustomer) {
  const customer = sessionCustomer || await getAuthenticatedCustomer();
  if (!customer) return null;

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId: customer.id, // STRICT ISOLATION
      isDeleted: false,
    },
    include: {
      quotation: {
        include: {
          lineItems: true,
        },
      },
      services: {
        orderBy: { startDate: 'asc' },
      },
      payments: {
        orderBy: { receivedDate: 'desc' },
      },
    },
  });

  return booking;
}

/**
 * Retrieve quotations for authenticated customer with optional status filtering.
 */
export async function getCustomerQuotations(
  filter?: 'all' | 'pending' | 'accepted' | 'expired',
  sessionCustomer?: AuthenticatedCustomer
) {
  const customer = sessionCustomer || await getAuthenticatedCustomer();
  if (!customer) return null;

  const now = new Date();

  const quotations = await prisma.quotation.findMany({
    where: {
      customerId: customer.id, // STRICT ISOLATION
      isDeleted: false,
    },
    include: {
      lineItems: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const pending = quotations.filter(
    (q) => (q.status === 'SENT' || q.status === 'DRAFT') && q.validUntil >= now
  );
  const accepted = quotations.filter((q) => q.status === 'ACCEPTED');
  const expired = quotations.filter((q) => q.status === 'EXPIRED' || (q.status !== 'ACCEPTED' && q.validUntil < now));

  let filtered = quotations;
  if (filter === 'pending') filtered = pending;
  else if (filter === 'accepted') filtered = accepted;
  else if (filter === 'expired') filtered = expired;

  return {
    customer,
    counts: {
      all: quotations.length,
      pending: pending.length,
      accepted: accepted.length,
      expired: expired.length,
    },
    quotations: filtered,
  };
}

/**
 * Retrieve single quotation detail with STRICT CUSTOMER DATA ISOLATION.
 */
export async function getCustomerQuotationDetail(quotationId: string, sessionCustomer?: AuthenticatedCustomer) {
  const customer = sessionCustomer || await getAuthenticatedCustomer();
  if (!customer) return null;

  const quotation = await prisma.quotation.findFirst({
    where: {
      id: quotationId,
      customerId: customer.id, // STRICT ISOLATION
      isDeleted: false,
    },
    include: {
      lineItems: true,
      revisions: {
        orderBy: { revisionNumber: 'desc' },
      },
    },
  });

  return quotation;
}

/**
 * Server Action: Customer accepts quotation
 */
export async function actionCustomerAcceptQuotation(quotationId: string, sessionCustomer?: AuthenticatedCustomer) {
  const customer = sessionCustomer || await getAuthenticatedCustomer();
  if (!customer) {
    return { success: false, error: 'Unauthorized. Please sign in to accept quotation.' };
  }

  const quotation = await prisma.quotation.findFirst({
    where: {
      id: quotationId,
      customerId: customer.id,
      isDeleted: false,
    },
  });

  if (!quotation) {
    return { success: false, error: 'Quotation not found or unauthorized.' };
  }

  if (quotation.status === 'ACCEPTED') {
    return { success: true, message: 'Quotation was already accepted.' };
  }

  if (quotation.validUntil < new Date()) {
    return { success: false, error: 'This quotation has expired. Please contact Varni Holidays for a revised quote.' };
  }

  // Update status to ACCEPTED
  await prisma.quotation.update({
    where: { id: quotation.id },
    data: {
      status: 'ACCEPTED',
      customerAcceptedAt: new Date(),
    },
  });

  // Log in LeadActivity if leadId exists
  if (quotation.leadId) {
    await prisma.leadActivity.create({
      data: {
        leadId: quotation.leadId,
        userId: quotation.createdByUserId,
        activityType: 'INTERNAL_NOTE',
        summary: 'Quotation Accepted by Customer',
        details: `Customer ${customer.fullName} accepted quotation #${quotation.quotationReference} (${quotation.title}).`,
      },
    }).catch(() => {});
  }

  return { success: true, message: 'Quotation accepted successfully! Your travel manager will now process your booking.' };
}

/**
 * Server Action: Customer requests revision on quotation
 */
export async function actionCustomerRequestRevision(
  quotationId: string,
  revisionNotes: string,
  sessionCustomer?: AuthenticatedCustomer
) {
  const customer = sessionCustomer || await getAuthenticatedCustomer();
  if (!customer) {
    return { success: false, error: 'Unauthorized.' };
  }

  if (!revisionNotes || revisionNotes.trim().length === 0) {
    return { success: false, error: 'Please describe the adjustments or revisions you would like.' };
  }

  const quotation = await prisma.quotation.findFirst({
    where: {
      id: quotationId,
      customerId: customer.id,
      isDeleted: false,
    },
  });

  if (!quotation) {
    return { success: false, error: 'Quotation not found or unauthorized.' };
  }

  const updatedNotes = quotation.customerNotes
    ? `${quotation.customerNotes}\n[${new Date().toISOString()}] Revision Request: ${revisionNotes.trim()}`
    : `[${new Date().toISOString()}] Revision Request: ${revisionNotes.trim()}`;

  await prisma.quotation.update({
    where: { id: quotation.id },
    data: {
      customerNotes: updatedNotes,
    },
  });

  if (quotation.leadId) {
    await prisma.leadActivity.create({
      data: {
        leadId: quotation.leadId,
        userId: quotation.createdByUserId,
        activityType: 'INTERNAL_NOTE',
        summary: 'Revision Requested by Customer',
        details: `Customer requested revision on quotation #${quotation.quotationReference}: "${revisionNotes.trim()}"`,
      },
    }).catch(() => {});
  }

  return {
    success: true,
    message: 'Revision request sent to your travel manager. We will update your proposal shortly.',
  };
}
