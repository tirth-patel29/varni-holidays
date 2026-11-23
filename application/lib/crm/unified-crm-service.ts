import { prisma } from '@/lib/prisma';
import { PipelineStage, PriorityLevel, InboxChannel, InboxStatus, FollowUpStatus, ServiceType, Prisma } from '@prisma/client';
import { validatePhoneNumber } from '@/lib/validation/phone';
import { sendCustomerWhatsApp } from '@/lib/integrations/whatsapp-service';
import crypto from 'crypto';

export interface UserContext {
  id: string | null;
  fullName: string;
  email: string;
  role: string;
}

/**
 * Safely sanitizes Prisma records with Decimal and non-primitive fields to plain JSON primitives
 */
export function sanitizeRecord<T>(record: T): T {
  if (!record) return record;
  if (Array.isArray(record)) {
    return record.map(sanitizeRecord) as any;
  }
  if (typeof record === 'object' && record !== null) {
    const copy: any = { ...record };
    for (const key of Object.keys(copy)) {
      const val = copy[key];
      if (val instanceof Prisma.Decimal) {
        copy[key] = Number(val);
      } else if (val instanceof Date) {
        copy[key] = val.toISOString();
      } else if (typeof val === 'object' && val !== null) {
        copy[key] = sanitizeRecord(val);
      }
    }
    return copy;
  }
  return record;
}

// =========================================================================
// 1. CUSTOMER FOUNDATION & DEDUPLICATION
// =========================================================================

export interface CreateCustomerInput {
  fullName: string;
  phoneCountryCode?: string;
  phoneNumber: string;
  email?: string | null;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
  marketingConsent?: boolean;
  preferredChannel?: string;
  preferredAirlines?: string | string[] | null;
  preferredDestinations?: string | string[] | null;
  preferredCabinClass?: string;
  preferredSeat?: string;
  mealPreference?: string;
  budgetRange?: string;
  specialAssistance?: string;
  assignedStaffId?: string;
  internalRemarks?: string | null;
}

function formatStringList(val: any): string | null {
  if (!val) return null;
  if (Array.isArray(val)) return val.filter(Boolean).join(', ');
  return String(val).trim() || null;
}

export function normalizeServiceType(type?: string): ServiceType {
  if (!type) return 'GENERAL';
  const upper = String(type).toUpperCase().trim();
  if (upper === 'FLIGHT' || upper === 'FLIGHTS') return 'FLIGHT';
  if (upper === 'PACKAGE' || upper === 'TOUR_PACKAGE' || upper === 'TOUR' || upper === 'HOLIDAY') return 'PACKAGE';
  if (upper === 'VISA' || upper === 'VISAS') return 'VISA';
  if (upper === 'CUSTOM_HOLIDAY' || upper === 'CUSTOM') return 'CUSTOM_HOLIDAY';
  if (upper === 'TRAVEL_INSURANCE' || upper === 'INSURANCE') return 'TRAVEL_INSURANCE';
  return 'GENERAL';
}

export async function resolveValidUserId(preferredId?: string | null): Promise<string> {
  if (preferredId) {
    const user = await prisma.user.findUnique({
      where: { id: preferredId },
      select: { id: true },
    });
    if (user) return user.id;
  }
  const fallback = await prisma.user.findFirst({
    where: { isDeleted: false },
    select: { id: true },
  });
  return fallback?.id || '3fb5cc1b-4278-4d0b-8715-4356fd8e2f2e';
}

export async function findCustomerDuplicates(phone: string, email?: string | null) {
  const phoneValidation = validatePhoneNumber('+91', phone);
  const normalizedPhone = phoneValidation.isValid && phoneValidation.normalized
    ? phoneValidation.normalized
    : phone.replace(/\D/g, '');

  const normalizedEmail = email?.trim().toLowerCase() || null;

  const whereConditions: any[] = [];
  if (normalizedPhone && normalizedPhone.length >= 7) {
    whereConditions.push({ normalizedPhone: { contains: normalizedPhone.slice(-10) } });
  }
  if (normalizedEmail && normalizedEmail.includes('@')) {
    whereConditions.push({ normalizedEmail });
  }

  if (whereConditions.length === 0) return [];

  const candidates = await prisma.customer.findMany({
    where: {
      isDeleted: false,
      OR: whereConditions,
    },
    include: {
      leads: { select: { id: true, referenceId: true, stage: true } },
      bookings: { select: { id: true, bookingReference: true } },
      flightHolds: { select: { id: true, pnr: true, status: true } },
    },
    take: 5,
  });

  return sanitizeRecord(candidates);
}

export async function createCustomerRecord(input: CreateCustomerInput, staffUser: UserContext) {
  const phoneValidation = validatePhoneNumber(input.phoneCountryCode || '+91', input.phoneNumber);
  const normalizedPhone = phoneValidation.isValid && phoneValidation.normalized
    ? phoneValidation.normalized
    : input.phoneNumber.replace(/\D/g, '');
  const normalizedEmail = input.email ? input.email.trim().toLowerCase() : null;

  // Check for duplicates
  const existingMatches = await findCustomerDuplicates(input.phoneNumber, input.email);
  const hasDuplicate = existingMatches.length > 0;

  const customer = await prisma.customer.create({
    data: {
      fullName: input.fullName.trim(),
      phoneCountryCode: input.phoneCountryCode || '+91',
      phoneNumber: input.phoneNumber.trim(),
      normalizedPhone,
      email: input.email ? input.email.trim() : null,
      normalizedEmail,
      city: input.city?.trim() || null,
      state: input.state?.trim() || null,
      country: input.country || 'India',
      notes: input.notes?.trim() || null,
      marketingConsent: Boolean(input.marketingConsent),
      duplicateWarning: hasDuplicate,
      duplicateNotes: hasDuplicate
        ? `Found ${existingMatches.length} existing record(s) with matching contact credentials.`
        : null,
      preferredChannel: input.preferredChannel || 'WHATSAPP',
      preferredAirlines: formatStringList(input.preferredAirlines),
      preferredDestinations: formatStringList(input.preferredDestinations),
      preferredCabinClass: input.preferredCabinClass || null,
      preferredSeat: input.preferredSeat || null,
      mealPreference: input.mealPreference || null,
      budgetRange: input.budgetRange || null,
      specialAssistance: input.specialAssistance || null,
      assignedStaffId: input.assignedStaffId || null,
      internalRemarks: input.internalRemarks || null,
    },
  });

  return { customer: sanitizeRecord(customer), existingMatches, hasDuplicate };
}

export async function updateCustomerPreferences(
  customerId: string,
  data: Partial<CreateCustomerInput>,
  staffUser: UserContext
) {
  const updatePayload: any = {};
  if (data.fullName !== undefined) updatePayload.fullName = data.fullName.trim();
  if (data.email !== undefined) {
    updatePayload.email = data.email ? data.email.trim() : null;
    updatePayload.normalizedEmail = data.email ? data.email.trim().toLowerCase() : null;
  }
  if (data.phoneNumber !== undefined) {
    updatePayload.phoneNumber = data.phoneNumber.trim();
    const phoneValidation = validatePhoneNumber(data.phoneCountryCode || '+91', data.phoneNumber);
    updatePayload.normalizedPhone = phoneValidation.isValid && phoneValidation.normalized
      ? phoneValidation.normalized
      : data.phoneNumber.replace(/\D/g, '');
  }
  if (data.city !== undefined) updatePayload.city = data.city?.trim() || null;
  if (data.notes !== undefined) updatePayload.notes = data.notes;
  if (data.marketingConsent !== undefined) updatePayload.marketingConsent = Boolean(data.marketingConsent);
  if (data.preferredChannel !== undefined) updatePayload.preferredChannel = data.preferredChannel;
  if (data.preferredAirlines !== undefined) updatePayload.preferredAirlines = formatStringList(data.preferredAirlines);
  if (data.preferredDestinations !== undefined) updatePayload.preferredDestinations = formatStringList(data.preferredDestinations);
  if (data.preferredCabinClass !== undefined) updatePayload.preferredCabinClass = data.preferredCabinClass;
  if (data.preferredSeat !== undefined) updatePayload.preferredSeat = data.preferredSeat;
  if (data.mealPreference !== undefined) updatePayload.mealPreference = data.mealPreference;
  if (data.budgetRange !== undefined) updatePayload.budgetRange = data.budgetRange;
  if (data.specialAssistance !== undefined) updatePayload.specialAssistance = data.specialAssistance;
  if (data.assignedStaffId !== undefined) updatePayload.assignedStaffId = data.assignedStaffId || null;
  if (data.internalRemarks !== undefined) updatePayload.internalRemarks = data.internalRemarks || null;

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: updatePayload,
  });

  return sanitizeRecord(updated);
}

// =========================================================================
// 2. CUSTOMER 360° PROFILE
// =========================================================================

export async function getCustomer360Profile(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      assignedStaff: { select: { id: true, fullName: true, email: true, phone: true } },
      leads: {
        where: { isDeleted: false },
        include: {
          assignedTo: { select: { id: true, fullName: true } },
          activities: { orderBy: { createdAt: 'desc' }, take: 5 },
          followUps: { orderBy: { dueDate: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      },
      bookings: {
        where: { isDeleted: false },
        include: {
          managedBy: { select: { id: true, fullName: true } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      quotations: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      },
      flightHolds: {
        where: { isDeleted: false },
        include: {
          assignedStaff: { select: { id: true, fullName: true } },
          ticketDocuments: { select: { id: true, fileName: true, downloadToken: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      passengerNotifications: {
        orderBy: { createdAt: 'desc' },
        take: 15,
      },
      inboxConversations: {
        include: {
          messages: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy: { updatedAt: 'desc' },
      },
      followUps: {
        include: {
          user: { select: { id: true, fullName: true } },
          lead: { select: { id: true, referenceId: true, title: true } },
        },
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!customer) return null;

  // Also query flight holds matched by phone/email if not yet explicitly linked by customerId
  const matchingHolds = await prisma.flightHoldPNR.findMany({
    where: {
      isDeleted: false,
      customerId: null,
      OR: [
        { passengerPhone: { contains: customer.phoneNumber.slice(-10) } },
        ...(customer.email ? [{ passengerEmail: { equals: customer.email, mode: 'insensitive' as any } }] : []),
      ],
    },
    include: {
      assignedStaff: { select: { id: true, fullName: true } },
      ticketDocuments: { select: { id: true, fileName: true, downloadToken: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const combinedHolds = [...customer.flightHolds, ...matchingHolds];
  // Deduplicate by ID
  const uniqueHolds = Array.from(new Map(combinedHolds.map(h => [h.id, h])).values());

  // Aggregate statistics
  const totalEnquiries = customer.leads.length;
  const totalBookings = customer.bookings.length;
  const totalIssuedPnrs = uniqueHolds.filter(h => h.status === 'ISSUED').length;
  const totalBookingValueInr = customer.bookings.reduce((sum, b) => sum + Number(b.totalAmountInr || 0), 0);

  // Build unified chronological activity timeline
  const timeline: Array<{
    id: string;
    type: 'ENQUIRY' | 'LEAD_STAGE' | 'BOOKING' | 'FLIGHT_HOLD' | 'TICKET_ISSUED' | 'QUOTATION' | 'COMMUNICATION' | 'NOTE' | 'FOLLOW_UP';
    title: string;
    description: string;
    timestamp: string;
    badgeColor?: string;
    metadata?: any;
  }> = [];

  // 1. Leads
  for (const lead of customer.leads) {
    timeline.push({
      id: `lead-${lead.id}`,
      type: 'ENQUIRY',
      title: `Enquiry Received: ${lead.referenceId}`,
      description: `${lead.serviceType} enquiry from ${lead.source} • Stage: ${lead.stage}`,
      timestamp: lead.createdAt.toISOString(),
      metadata: { leadId: lead.id, referenceId: lead.referenceId, stage: lead.stage },
    });

    for (const act of lead.activities) {
      timeline.push({
        id: `act-${act.id}`,
        type: act.activityType === 'STAGE_CHANGE' ? 'LEAD_STAGE' : 'NOTE',
        title: act.summary,
        description: act.details || '',
        timestamp: act.createdAt.toISOString(),
        metadata: { leadId: lead.id },
      });
    }
  }

  // 2. Bookings
  for (const b of customer.bookings) {
    timeline.push({
      id: `book-${b.id}`,
      type: 'BOOKING',
      title: `Booking Confirmed: ${b.bookingReference}`,
      description: `Confirmed travel file • Amount: ₹${Number(b.totalAmountInr || 0).toLocaleString('en-IN')}`,
      timestamp: b.createdAt.toISOString(),
      metadata: { bookingId: b.id, bookingReference: b.bookingReference, status: b.status },
    });
  }

  // 3. Flight Holds & Issued PNRs
  for (const h of uniqueHolds) {
    const routeStr = (h as any).travelRoute || ((h as any).originAirport && (h as any).destinationAirport ? `${(h as any).originAirport} → ${(h as any).destinationAirport}` : 'Flight');
    timeline.push({
      id: `hold-${h.id}`,
      type: h.status === 'ISSUED' ? 'TICKET_ISSUED' : 'FLIGHT_HOLD',
      title: h.status === 'ISSUED' ? `Ticket Issued: PNR ${h.pnr}` : `Flight Hold Placed: PNR ${h.pnr}`,
      description: `${(h as any).airline || 'Airline'} ${h.flightNumber || ''} (${routeStr}) • Status: ${h.status}${h.issuanceAmountInr ? ` • ₹${Number(h.issuanceAmountInr).toLocaleString('en-IN')}` : ''}`,
      timestamp: (h.issuedAt || h.createdAt).toISOString(),
      metadata: { pnr: h.pnr, status: h.status, flightHoldId: h.id },
    });
  }

  // 4. Quotations
  for (const q of customer.quotations) {
    timeline.push({
      id: `quote-${q.id}`,
      type: 'QUOTATION',
      title: `Quotation Prepared: ${q.quotationReference}`,
      description: `Proposal for ₹${Number(q.totalAmountInr || 0).toLocaleString('en-IN')} • Status: ${q.status}`,
      timestamp: q.createdAt.toISOString(),
      metadata: { quotationId: q.id, quotationReference: q.quotationReference, status: q.status },
    });
  }

  // 5. Communications & Notifications
  for (const u of customer.updates) {
    timeline.push({
      id: `update-${u.id}`,
      type: 'COMMUNICATION',
      title: `${u.channel} Communication: ${u.category}`,
      description: u.subject || u.messageContent.slice(0, 100),
      timestamp: u.createdAt.toISOString(),
      metadata: { channel: u.channel, status: u.status },
    });
  }

  for (const n of customer.passengerNotifications) {
    timeline.push({
      id: `notif-${n.id}`,
      type: 'COMMUNICATION',
      title: `Notification ${n.type}: ${n.channel}`,
      description: `Sent to ${n.recipientEmail || n.recipientPhone} • Status: ${n.status}`,
      timestamp: n.createdAt.toISOString(),
      metadata: { type: n.type, channel: n.channel, status: n.status },
    });
  }

  // 6. Follow-ups
  for (const f of customer.followUps) {
    timeline.push({
      id: `follow-${f.id}`,
      type: 'FOLLOW_UP',
      title: `Follow-Up (${f.status}): ${f.title}`,
      description: `${f.notes || ''} (Scheduled: ${f.dueDate.toLocaleDateString('en-IN')})`,
      timestamp: f.createdAt.toISOString(),
      metadata: { status: f.status, dueDate: f.dueDate.toISOString() },
    });
  }

  // Sort chronological descending
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const outstandingDueInr = customer.bookings.reduce((sum, b) => sum + Math.max(0, Number(b.balanceAmountInr || 0)), 0);

  return sanitizeRecord({
    customer,
    flightHolds: uniqueHolds,
    leads: customer.leads,
    bookings: customer.bookings,
    quotations: customer.quotations,
    followUps: customer.followUps,
    inboxConversations: customer.inboxConversations,
    stats: {
      totalEnquiries,
      totalBookings: totalBookings + totalIssuedPnrs,
      totalIssuedPnrs,
      totalSpendInr: totalBookingValueInr,
      outstandingDueInr,
    },
    timeline,
  });
}

// =========================================================================
// 3. LEAD MANAGEMENT & PIPELINE
// =========================================================================

export interface CreateLeadInput {
  title?: string;
  description?: string;
  serviceType: string; // FLIGHT, PACKAGE, VISA, CUSTOM_HOLIDAY, etc.
  stage?: PipelineStage;
  priorityLevel?: PriorityLevel;
  source?: string;
  // Customer details
  customerId?: string;
  customerName: string;
  customerPhone: string;
  phoneCountryCode?: string;
  customerEmail?: string;
  // Trip specifics
  origin?: string;
  destination?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  passengerCount?: number;
  estimatedBudgetInr?: number;
  expectedValueInr?: number;
  assignedUserId?: string;
  nextFollowUpDate?: string;
  internalNotes?: string;
}

export async function getNextRoundRobinAssignee(): Promise<string | null> {
  // Find all active sales employees
  const salesUsers = await prisma.user.findMany({
    where: {
      isDeleted: false,
      userRoles: {
        some: {
          role: {
            code: { in: ['SALES_MANAGER', 'SALES_EXECUTIVE', 'ADMIN', 'SUPER_ADMIN'] },
          },
        },
      },
    },
    select: { id: true, fullName: true },
  });

  if (salesUsers.length === 0) return null;

  // Find user with lowest count of active (NEW / CONTACTED / QUOTED / NEGOTIATION / REQUESTS / GENERAL / PRIORITY) leads
  const activeLeadCounts = await prisma.lead.groupBy({
    by: ['assignedUserId'],
    where: {
      isDeleted: false,
      stage: { in: ['NEW', 'CONTACTED', 'QUOTED', 'NEGOTIATION', 'REQUESTS', 'GENERAL', 'PRIORITY'] },
      assignedUserId: { in: salesUsers.map(u => u.id) },
    },
    _count: { id: true },
  });

  const countMap = new Map<string, number>();
  for (const item of activeLeadCounts) {
    if (item.assignedUserId) {
      countMap.set(item.assignedUserId, item._count.id);
    }
  }

  salesUsers.sort((a, b) => {
    const countA = countMap.get(a.id) || 0;
    const countB = countMap.get(b.id) || 0;
    return countA - countB;
  });

  return salesUsers[0].id;
}

export function generateLeadReference(prefix: string = 'LEAD'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${rand}`;
}

export async function createLeadRecord(input: CreateLeadInput, staffUser: UserContext) {
  // 1. Resolve or Create Customer
  let customerId = input.customerId;
  if (!customerId) {
    const rawPhone = input.customerPhone || '';
    const phoneValidation = validatePhoneNumber(input.phoneCountryCode || '+91', rawPhone);
    const normalizedPhone = phoneValidation.isValid && phoneValidation.normalized
      ? phoneValidation.normalized
      : rawPhone.replace(/\D/g, '');

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        isDeleted: false,
        OR: [
          { normalizedPhone: { contains: normalizedPhone.slice(-10) } },
          ...(input.customerEmail ? [{ normalizedEmail: input.customerEmail.trim().toLowerCase() }] : []),
        ],
      },
    });

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const created = await prisma.customer.create({
        data: {
          fullName: input.customerName.trim(),
          phoneCountryCode: input.phoneCountryCode || '+91',
          phoneNumber: input.customerPhone.trim(),
          normalizedPhone,
          email: input.customerEmail ? input.customerEmail.trim() : null,
          normalizedEmail: input.customerEmail ? input.customerEmail.trim().toLowerCase() : null,
          marketingConsent: true,
        },
      });
      customerId = created.id;
    }
  }

  // 2. Resolve Assignee (Support Round-Robin if requested)
  let assigneeId = input.assignedUserId;
  if (assigneeId === 'ROUND_ROBIN' || !assigneeId) {
    assigneeId = await getNextRoundRobinAssignee() || undefined;
  }

  const normalizedService = normalizeServiceType(input.serviceType);
  const prefix = normalizedService === 'FLIGHT' ? 'FLT' : normalizedService === 'PACKAGE' ? 'PKG' : normalizedService === 'VISA' ? 'VIS' : 'LEAD';
  const referenceId = generateLeadReference(prefix);

  const parsedStart = input.travelStartDate ? new Date(input.travelStartDate) : null;
  const parsedEnd = input.travelEndDate ? new Date(input.travelEndDate) : null;
  const parsedFollowUp = input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : null;

  const lead = await prisma.lead.create({
    data: {
      referenceId,
      serviceType: normalizedService,
      stage: input.stage || 'NEW',
      priorityLevel: input.priorityLevel || 'MEDIUM',
      source: input.source || 'WEBSITE',
      customerId,
      assignedUserId: assigneeId || null,
      title: input.title?.trim() || `${input.serviceType} enquiry - ${input.destination || input.origin || 'General'}`,
      description: input.description?.trim() || null,
      origin: input.origin?.trim() || null,
      destination: input.destination?.trim() || null,
      travelStartDate: parsedStart && !isNaN(parsedStart.getTime()) ? parsedStart : null,
      travelEndDate: parsedEnd && !isNaN(parsedEnd.getTime()) ? parsedEnd : null,
      passengerCount: input.passengerCount ? Number(input.passengerCount) : 1,
      estimatedBudgetInr: input.estimatedBudgetInr ? new Prisma.Decimal(input.estimatedBudgetInr) : null,
      expectedValueInr: input.expectedValueInr ? new Prisma.Decimal(input.expectedValueInr) : null,
      nextFollowUpDate: parsedFollowUp && !isNaN(parsedFollowUp.getTime()) ? parsedFollowUp : null,
      internalNotes: input.internalNotes?.trim() || null,
    },
    include: {
      customer: true,
      assignedTo: { select: { id: true, fullName: true, email: true } },
    },
  });

  // Log creation activity
  const activityUserId = await resolveValidUserId(staffUser?.id);
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      userId: activityUserId,
      activityType: 'INTERNAL_NOTE',
      summary: `Lead created from ${input.source || 'WEBSITE'}`,
      details: `Created by ${staffUser.fullName}. Initial stage: ${lead.stage}, Priority: ${lead.priorityLevel}.`,
    },
  });

  // Create follow up if requested
  if (parsedFollowUp && !isNaN(parsedFollowUp.getTime())) {
    const followUpUserId = await resolveValidUserId(assigneeId || staffUser?.id);
    await prisma.followUp.create({
      data: {
        leadId: lead.id,
        customerId,
        userId: followUpUserId,
        dueDate: parsedFollowUp,
        title: `Follow up on lead ${lead.referenceId}`,
        notes: `Initial follow-up scheduled during lead creation: ${input.internalNotes || ''}`,
        priority: input.priorityLevel || 'MEDIUM',
      },
    });
  }

  // Create unified inbox conversation
  await createOrUpdateInboxConversationForLead(lead);

  return sanitizeRecord(lead);
}

export async function getLeadsFiltered(
  filters: {
    search?: string;
    stage?: string;
    source?: string;
    priority?: string;
    serviceType?: string;
    assignedUserId?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  staffUser: UserContext
) {
  const where: any = { isDeleted: false };

  // Role-based visibility: SALES_EXECUTIVE can only view leads assigned to them or unassigned
  if (staffUser.role === 'SALES_EXECUTIVE' && staffUser.id) {
    where.OR = [
      { assignedUserId: staffUser.id },
      { assignedUserId: null },
    ];
  } else if (filters.assignedUserId && filters.assignedUserId !== 'ALL') {
    if (filters.assignedUserId === 'UNASSIGNED') {
      where.assignedUserId = null;
    } else {
      where.assignedUserId = filters.assignedUserId;
    }
  }

  if (filters.stage && filters.stage !== 'ALL') {
    // Support matching both standard and legacy stage codes
    if (filters.stage === 'NEW') where.stage = { in: ['NEW', 'REQUESTS'] };
    else if (filters.stage === 'CONTACTED') where.stage = { in: ['CONTACTED', 'GENERAL'] };
    else if (filters.stage === 'QUOTED') where.stage = { in: ['QUOTED', 'PRIORITY'] };
    else if (filters.stage === 'NEGOTIATION') where.stage = 'NEGOTIATION';
    else if (filters.stage === 'WON') where.stage = { in: ['WON', 'CONVERTED'] };
    else if (filters.stage === 'LOST') where.stage = { in: ['LOST', 'CLOSED'] };
    else where.stage = filters.stage;
  }

  if (filters.source && filters.source !== 'ALL') {
    where.source = { contains: filters.source, mode: 'insensitive' };
  }

  if (filters.priority && filters.priority !== 'ALL') {
    where.priorityLevel = filters.priority;
  }

  if (filters.serviceType && filters.serviceType !== 'ALL') {
    where.serviceType = filters.serviceType;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const q = filters.search.trim();
    where.AND = [
      {
        OR: [
          { referenceId: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { origin: { contains: q, mode: 'insensitive' } },
          { destination: { contains: q, mode: 'insensitive' } },
          { customer: { fullName: { contains: q, mode: 'insensitive' } } },
          { customer: { phoneNumber: { contains: q } } },
          { customer: { email: { contains: q, mode: 'insensitive' } } },
        ],
      },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      customer: true,
      assignedTo: { select: { id: true, fullName: true, email: true, phone: true } },
      followUps: {
        where: { status: 'PENDING' },
        orderBy: { dueDate: 'asc' },
        take: 1,
      },
      quotations: {
        select: { id: true, quotationReference: true, totalAmountInr: true, status: true },
        take: 1,
      },
      booking: {
        select: { id: true, bookingReference: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sanitizeRecord(leads);
}

export async function updateLeadStageWithReason(
  leadId: string,
  newStage: PipelineStage,
  lossReason?: string,
  lossReasonDetail?: string,
  staffUser?: UserContext
) {
  const existing = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { customer: true },
  });

  if (!existing) throw new Error('Lead not found');

  const oldStage = existing.stage;
  const updateData: any = {
    stage: newStage,
  };

  if (newStage === 'LOST' || newStage === 'CLOSED') {
    if (!lossReason && !existing.lossReason) {
      throw new Error('A loss reason is mandatory when moving a lead to LOST.');
    }
    updateData.lossReason = lossReason || existing.lossReason || 'Other';
    updateData.lossReasonDetail = lossReasonDetail || null;
    updateData.closeReason = lossReason || 'Lost';
    updateData.closedAt = new Date();
  } else if (newStage === 'WON' || newStage === 'CONVERTED') {
    updateData.closeReason = 'Converted / Won';
    updateData.closedAt = new Date();
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: updateData,
    include: {
      customer: true,
      assignedTo: true,
    },
  });

  // Log activity
  const activityUserId = await resolveValidUserId(staffUser?.id);
  await prisma.leadActivity.create({
    data: {
      leadId,
      userId: activityUserId,
      activityType: 'STAGE_CHANGE',
      summary: `Stage updated: ${oldStage} → ${newStage}`,
      details: newStage === 'LOST' || newStage === 'CLOSED'
        ? `Marked as LOST. Reason: ${lossReason || 'Not specified'}.${lossReasonDetail ? ` Detail: ${lossReasonDetail}` : ''}`
        : `Lead transitioned from ${oldStage} to ${newStage} by ${staffUser?.fullName || 'Staff'}.`,
    },
  });

  return sanitizeRecord(updated);
}

export async function assignLeadToStaff(
  leadId: string,
  targetUserId: string | null,
  staffUser: UserContext
) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { assignedTo: true },
  });
  if (!lead) throw new Error('Lead not found');

  let newStaffName = 'Unassigned';
  if (targetUserId) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (user) newStaffName = user.fullName;
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { assignedUserId: targetUserId },
    include: { customer: true, assignedTo: true },
  });

  const assignActivityUserId = await resolveValidUserId(staffUser?.id);
  await prisma.leadActivity.create({
    data: {
      leadId,
      userId: assignActivityUserId,
      activityType: 'ASSIGNMENT_CHANGE',
      summary: `Lead Reassigned: ${newStaffName}`,
      details: `Reassigned from ${lead.assignedTo?.fullName || 'Unassigned'} to ${newStaffName} by ${staffUser.fullName}.`,
    },
  });

  return sanitizeRecord(updated);
}

// =========================================================================
// 4. FOLLOW-UP TASKS MANAGEMENT
// =========================================================================

export interface CreateFollowUpInput {
  leadId: string;
  dueDate?: string;
  scheduledAt?: string;
  title: string;
  notes?: string;
  priority?: PriorityLevel;
  assignedUserId?: string;
}

export async function createFollowUpTask(input: CreateFollowUpInput, staffUser: UserContext) {
  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
    include: { customer: true },
  });
  if (!lead) throw new Error('Lead not found');

  const rawDate = input.dueDate || input.scheduledAt;
  if (!rawDate) throw new Error('Invalid follow-up date');
  const parsedDue = new Date(rawDate);
  if (isNaN(parsedDue.getTime())) throw new Error('Invalid follow-up date');

  const followUpUserId = await resolveValidUserId(input.assignedUserId || staffUser?.id);
  const followUp = await prisma.followUp.create({
    data: {
      leadId: input.leadId,
      customerId: lead.customerId,
      userId: followUpUserId,
      dueDate: parsedDue,
      title: input.title.trim(),
      notes: input.notes?.trim() || null,
      priority: input.priority || 'MEDIUM',
      status: 'PENDING',
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      lead: { select: { id: true, referenceId: true, title: true, stage: true } },
      customer: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
    },
  });

  // Also update nextFollowUpDate on lead
  await prisma.lead.update({
    where: { id: input.leadId },
    data: { nextFollowUpDate: parsedDue },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: input.leadId,
      userId: followUpUserId,
      activityType: 'INTERNAL_NOTE',
      summary: `Follow-Up Scheduled: ${input.title}`,
      details: `Scheduled for ${parsedDue.toLocaleString('en-IN')}. Priority: ${input.priority || 'MEDIUM'}.${input.notes ? ` Notes: ${input.notes}` : ''}`,
    },
  });

  return sanitizeRecord(followUp);
}

export async function getFollowUpsDashboard(
  filters: { userId?: string; status?: string; tab?: 'TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED' },
  staffUser: UserContext
) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

  const where: any = {};
  if (staffUser.role === 'SALES_EXECUTIVE' && staffUser.id) {
    where.userId = staffUser.id;
  } else if (filters.userId && filters.userId !== 'ALL') {
    where.userId = filters.userId;
  }

  const allFollowUps = await prisma.followUp.findMany({
    where,
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      lead: {
        select: {
          id: true,
          referenceId: true,
          title: true,
          stage: true,
          priorityLevel: true,
          customer: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
        },
      },
      customer: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  const sanitized = sanitizeRecord(allFollowUps);

  const overdue = sanitized.filter(f => f.status === 'PENDING' && new Date(f.dueDate).getTime() < startOfToday.getTime());
  const today = sanitized.filter(f => f.status === 'PENDING' && new Date(f.dueDate).getTime() >= startOfToday.getTime() && new Date(f.dueDate).getTime() <= endOfToday.getTime());
  const upcoming = sanitized.filter(f => f.status === 'PENDING' && new Date(f.dueDate).getTime() > endOfToday.getTime());
  const completed = sanitized.filter(f => f.status === 'COMPLETED');

  return {
    overdue,
    today,
    upcoming,
    completed,
    counts: {
      overdue: overdue.length,
      today: today.length,
      upcoming: upcoming.length,
      completed: completed.length,
    },
  };
}

export async function completeFollowUpTask(followUpId: string, notes?: string, staffUser?: UserContext) {
  const updated = await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      notes: notes ? `${notes} (Completed by ${staffUser?.fullName || 'Staff'})` : undefined,
    },
    include: { lead: true },
  });

  if (updated.leadId) {
    const actUserId = await resolveValidUserId(staffUser?.id);
    await prisma.leadActivity.create({
      data: {
        leadId: updated.leadId,
        userId: actUserId,
        activityType: 'INTERNAL_NOTE',
        summary: `Follow-up Completed: ${updated.title}`,
        details: notes || 'Task marked as completed.',
      },
    });
  }

  return sanitizeRecord(updated);
}

export async function rescheduleFollowUpTask(
  followUpId: string,
  newDueDate: string,
  rescheduleReason?: string,
  staffUser?: UserContext
) {
  const parsed = new Date(newDueDate);
  if (isNaN(parsed.getTime())) throw new Error('Invalid reschedule date');

  const updated = await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      dueDate: parsed,
      rescheduledTo: parsed,
      notes: rescheduleReason ? `Rescheduled: ${rescheduleReason}` : undefined,
      status: 'PENDING',
    },
    include: { lead: true },
  });

  if (updated.leadId) {
    await prisma.lead.update({
      where: { id: updated.leadId },
      data: { nextFollowUpDate: parsed },
    });

    const actUserId = await resolveValidUserId(staffUser?.id);
    await prisma.leadActivity.create({
      data: {
        leadId: updated.leadId,
        userId: actUserId,
        activityType: 'INTERNAL_NOTE',
        summary: `Follow-up Rescheduled to ${parsed.toLocaleDateString('en-IN')}`,
        details: rescheduleReason || `Rescheduled by ${staffUser?.fullName || 'Staff'}.`,
      },
    });
  }

  return sanitizeRecord(updated);
}

export async function cancelFollowUpTask(
  followUpId: string,
  cancelReason: string,
  staffUser?: UserContext
) {
  const updated = await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status: 'CANCELLED',
      cancelReason,
    },
    include: { lead: true },
  });

  return sanitizeRecord(updated);
}

// =========================================================================
// 5. UNIFIED ENQUIRY INBOX & META WEBHOOKS
// =========================================================================

export async function createOrUpdateInboxConversationForLead(lead: any) {
  try {
    const channelMap: Record<string, InboxChannel> = {
      WEBSITE: 'WEBSITE',
      WHATSAPP: 'WHATSAPP',
      INSTAGRAM: 'INSTAGRAM',
      FACEBOOK: 'FACEBOOK',
      PHONE_CALL: 'PHONE_CALL',
      WALK_IN: 'WALK_IN',
    };

    const channel: InboxChannel = channelMap[lead.source?.toUpperCase()] || 'WEBSITE';
    const senderIdentity = lead.customer?.phoneNumber || lead.customer?.email || lead.customer?.fullName || 'Unknown';

    // Find existing open conversation for this customer/identity
    let conversation = await prisma.inboxConversation.findFirst({
      where: {
        channel,
        senderIdentity,
        status: { in: ['NEW', 'OPEN', 'PENDING'] },
      },
    });

    const snippet = lead.description || `${lead.serviceType} enquiry: ${lead.origin || ''} -> ${lead.destination || ''}`.trim();

    if (conversation) {
      conversation = await prisma.inboxConversation.update({
        where: { id: conversation.id },
        data: {
          leadId: lead.id,
          customerId: lead.customerId,
          lastMessageAt: new Date(),
          lastMessageSnippet: snippet,
          unreadCount: { increment: 1 },
        },
      });
    } else {
      conversation = await prisma.inboxConversation.create({
        data: {
          channel,
          senderIdentity,
          senderName: lead.customer?.fullName || 'Valued Guest',
          subject: lead.title || `${lead.serviceType} Enquiry`,
          status: 'NEW',
          priority: lead.priorityLevel || 'MEDIUM',
          customerId: lead.customerId,
          leadId: lead.id,
          assignedUserId: lead.assignedUserId,
          lastMessageAt: new Date(),
          lastMessageSnippet: snippet,
          unreadCount: 1,
        },
      });
    }

    // Add first inbox message
    await prisma.inboxMessage.create({
      data: {
        conversationId: conversation.id,
        direction: 'INBOUND',
        senderType: 'CUSTOMER',
        senderId: senderIdentity,
        senderName: lead.customer?.fullName || 'Customer',
        content: snippet || `New ${lead.serviceType} enquiry submitted via ${lead.source}.`,
      },
    });

    return conversation;
  } catch (err) {
    console.error('[createOrUpdateInboxConversationForLead Error]:', err);
    return null;
  }
}

export async function getInboxConversationsList(
  filters: { channel?: string; status?: string; search?: string; assignedUserId?: string },
  staffUser: UserContext
) {
  const where: any = {};
  if (filters.channel && filters.channel !== 'ALL') {
    where.channel = filters.channel as InboxChannel;
  }
  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status as InboxStatus;
  }
  if (staffUser.role === 'SALES_EXECUTIVE' && staffUser.id) {
    where.OR = [
      { assignedUserId: staffUser.id },
      { assignedUserId: null },
    ];
  } else if (filters.assignedUserId && filters.assignedUserId !== 'ALL') {
    where.assignedUserId = filters.assignedUserId === 'UNASSIGNED' ? null : filters.assignedUserId;
  }

  if (filters.search && filters.search.trim().length > 0) {
    const q = filters.search.trim();
    where.OR = [
      { senderName: { contains: q, mode: 'insensitive' } },
      { senderIdentity: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
      { lastMessageSnippet: { contains: q, mode: 'insensitive' } },
    ];
  }

  const conversations = await prisma.inboxConversation.findMany({
    where,
    include: {
      customer: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
      lead: { select: { id: true, referenceId: true, stage: true, priorityLevel: true, title: true } },
      assignedTo: { select: { id: true, fullName: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  return sanitizeRecord(conversations);
}

export async function getInboxConversationDetail(conversationId: string) {
  const conversation = await prisma.inboxConversation.findUnique({
    where: { id: conversationId },
    include: {
      customer: {
        include: {
          bookings: { select: { id: true, bookingReference: true, status: true } },
          flightHolds: { select: { id: true, pnr: true, status: true } },
        },
      },
      lead: {
        include: {
          activities: { orderBy: { createdAt: 'desc' }, take: 5 },
          followUps: { orderBy: { dueDate: 'asc' } },
        },
      },
      assignedTo: { select: { id: true, fullName: true, email: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) return null;

  // Mark as read
  await prisma.inboxConversation.update({
    where: { id: conversationId },
    data: { unreadCount: 0 },
  });

  return sanitizeRecord(conversation);
}

export async function sendInboxMessageReply(
  conversationIdOrInput: string | { conversationId: string; messageContent?: string; messageText?: string; channel?: string },
  messageTextOrStaff?: string | UserContext,
  maybeStaffUser?: UserContext
) {
  let conversationId: string;
  let text: string;
  let staffUser: UserContext;

  if (typeof conversationIdOrInput === 'object') {
    conversationId = conversationIdOrInput.conversationId;
    text = (conversationIdOrInput.messageContent || conversationIdOrInput.messageText || '').trim();
    staffUser = (messageTextOrStaff as UserContext) || { id: '3fb5cc1b-4278-4d0b-8715-4356fd8e2f2e', fullName: 'Staff', email: 'staff@varniholidays.com', role: 'SUPER_ADMIN' };
  } else {
    conversationId = conversationIdOrInput;
    text = String(messageTextOrStaff || '').trim();
    staffUser = maybeStaffUser || { id: '3fb5cc1b-4278-4d0b-8715-4356fd8e2f2e', fullName: 'Staff', email: 'staff@varniholidays.com', role: 'SUPER_ADMIN' };
  }

  const conversation = await prisma.inboxConversation.findUnique({
    where: { id: conversationId },
    include: { customer: true },
  });

  if (!conversation) throw new Error('Conversation not found');

  if (!text) throw new Error('Message content cannot be empty');

  let providerMessageId: string | null = null;
  let providerDeliveryStatus = 'DELIVERED';

  // If channel is WHATSAPP, attempt Meta Cloud API dispatch
  if (conversation.channel === 'WHATSAPP') {
    const phone = conversation.senderIdentity;
    try {
      const dispatchRes = await sendCustomerWhatsApp({
        phoneNumber: phone,
        recipientName: conversation.senderName,
        category: 'DOCUMENTS_SHARED' as any,
        messageText: text,
      });
      providerMessageId = dispatchRes.messageId;
      providerDeliveryStatus = dispatchRes.deliveryStatus;
    } catch (e: any) {
      console.warn('[sendInboxMessageReply WhatsApp Error]:', e);
    }
  }

  // Create message record
  const msg = await prisma.inboxMessage.create({
    data: {
      conversationId,
      direction: 'OUTBOUND',
      senderType: 'HUMAN_AGENT',
      senderId: staffUser.id || 'staff',
      senderName: staffUser.fullName,
      content: text,
      providerMessageId: providerMessageId || `local-${Date.now()}`,
      status: providerDeliveryStatus as any,
    },
  });

  // Update conversation
  await prisma.inboxConversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessageSnippet: text,
      status: 'OPEN',
    },
  });

  const sanitizedMsg = sanitizeRecord(msg);
  return {
    ...sanitizedMsg,
    message: sanitizedMsg,
  };
}

export async function createManualEnquiry(input: {
  channel: InboxChannel;
  senderName?: string;
  customerName?: string;
  senderPhone?: string;
  phoneNumber?: string;
  senderEmail?: string;
  customerEmail?: string;
  subject: string;
  details?: string;
  initialMessage?: string;
  priority?: PriorityLevel;
  serviceType?: string;
  origin?: string;
  destination?: string;
  budgetInr?: number;
  estimatedBudgetInr?: number;
  assignedUserId?: string;
}, staffUser: UserContext) {
  const name = input.senderName || input.customerName || 'Valued Guest';
  const phone = input.senderPhone || input.phoneNumber || '';
  const email = input.senderEmail || input.customerEmail;
  const details = input.details || input.initialMessage || '';
  const budget = input.budgetInr || input.estimatedBudgetInr;

  // Create lead record which automatically creates customer & inbox conversation
  const lead = await createLeadRecord({
    title: input.subject,
    description: details,
    serviceType: input.serviceType || 'GENERAL',
    source: input.channel,
    priorityLevel: input.priority || 'MEDIUM',
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    origin: input.origin,
    destination: input.destination,
    estimatedBudgetInr: budget,
    assignedUserId: input.assignedUserId || staffUser.id || undefined,
  }, staffUser);

  const conversation = await prisma.inboxConversation.findFirst({
    where: { leadId: lead.id },
    include: { messages: true },
  });

  return sanitizeRecord({
    lead,
    conversation: conversation || lead,
  });
}

// =========================================================================
// 6. REAL-TIME CRM DASHBOARD METRICS
// =========================================================================

export async function getCrmAnalyticsMetrics(
  dateFilter: 'TODAY' | '7D' | '30D' | 'MONTH' | 'ALL' = '30D',
  staffUser: UserContext
) {
  const now = new Date();
  let gteDate: Date | null = null;

  if (dateFilter === 'TODAY') {
    gteDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (dateFilter === '7D') {
    gteDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateFilter === '30D') {
    gteDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (dateFilter === 'MONTH') {
    gteDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const whereTime: any = gteDate ? { createdAt: { gte: gteDate } } : {};
  const baseLeadWhere = { isDeleted: false, ...whereTime };

  // Fetch counts
  const [
    totalLeads,
    newLeads,
    contactedLeads,
    quotedLeads,
    negotiationLeads,
    wonLeads,
    lostLeads,
    unassignedLeads,
    assignedToMeLeads,
    leadsBySourceRaw,
    users,
    followUpsOverdue,
    followUpsToday,
  ] = await Promise.all([
    prisma.lead.count({ where: baseLeadWhere }),
    prisma.lead.count({ where: { ...baseLeadWhere, stage: { in: ['NEW', 'REQUESTS'] } } }),
    prisma.lead.count({ where: { ...baseLeadWhere, stage: { in: ['CONTACTED', 'GENERAL'] } } }),
    prisma.lead.count({ where: { ...baseLeadWhere, stage: { in: ['QUOTED', 'PRIORITY'] } } }),
    prisma.lead.count({ where: { ...baseLeadWhere, stage: 'NEGOTIATION' } }),
    prisma.lead.count({ where: { ...baseLeadWhere, stage: { in: ['WON', 'CONVERTED'] } } }),
    prisma.lead.count({ where: { ...baseLeadWhere, stage: { in: ['LOST', 'CLOSED'] } } }),
    prisma.lead.count({ where: { ...baseLeadWhere, assignedUserId: null } }),
    staffUser.id ? prisma.lead.count({ where: { ...baseLeadWhere, assignedUserId: staffUser.id } }) : 0,
    prisma.lead.groupBy({
      by: ['source'],
      where: baseLeadWhere,
      _count: { id: true },
    }),
    prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        userRoles: { select: { role: { select: { code: true } } } },
      },
    }),
    prisma.followUp.count({
      where: {
        status: 'PENDING',
        dueDate: { lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
      },
    }),
    prisma.followUp.count({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
    }),
  ]);

  // Conversion rate calculation
  const closedLeads = wonLeads + lostLeads;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  // Source breakdown
  const sourceBreakdown = leadsBySourceRaw.map((s) => ({
    source: s.source || 'Website',
    count: s._count.id,
    percentage: totalLeads > 0 ? Math.round((s._count.id / totalLeads) * 100) : 0,
  }));

  // Employee-wise performance calculation
  const employeeLeads = await prisma.lead.findMany({
    where: baseLeadWhere,
    select: { assignedUserId: true, stage: true },
  });

  const employeePerformance = users
    .filter(u => u.userRoles.some(r => ['SALES_MANAGER', 'SALES_EXECUTIVE', 'ADMIN', 'SUPER_ADMIN'].includes(r.role.code)))
    .map((u) => {
      const myLeads = employeeLeads.filter(l => l.assignedUserId === u.id);
      const total = myLeads.length;
      const won = myLeads.filter(l => ['WON', 'CONVERTED'].includes(l.stage)).length;
      const lost = myLeads.filter(l => ['LOST', 'CLOSED'].includes(l.stage)).length;
      const inProgress = total - won - lost;
      const rate = total > 0 ? Math.round((won / total) * 100) : 0;

      return {
        userId: u.id,
        name: u.fullName,
        email: u.email,
        totalAssigned: total,
        wonCount: won,
        lostCount: lost,
        inProgressCount: inProgress,
        conversionRate: rate,
      };
    })
    .sort((a, b) => b.totalAssigned - a.totalAssigned);

  // Fetch all leads with amounts and bookings for financial KPIs
  const allLeadsWithAmounts = await prisma.lead.findMany({
    where: baseLeadWhere,
    select: {
      id: true,
      stage: true,
      source: true,
      lossReason: true,
      expectedValueInr: true,
      estimatedBudgetInr: true,
      assignedUserId: true,
    },
  });

  const allBookingsWithAmounts = await prisma.booking.findMany({
    where: {
      isDeleted: false,
      ...(gteDate ? { createdAt: { gte: gteDate } } : {}),
    },
    select: {
      id: true,
      totalAmountInr: true,
      managedByUserId: true,
      status: true,
    },
  });

  const pipelineValueInr = allLeadsWithAmounts
    .filter(l => ['NEW', 'CONTACTED', 'QUOTED', 'NEGOTIATION', 'REQUESTS', 'GENERAL', 'PRIORITY'].includes(l.stage))
    .reduce((sum, l) => sum + Number(l.expectedValueInr || l.estimatedBudgetInr || 0), 0);

  const realizedRevenueInr = allBookingsWithAmounts
    .filter(b => b.status === 'CONFIRMED' || (b.status as any) === 'VOUCHERED')
    .reduce((sum, b) => sum + Number(b.totalAmountInr || 0), 0);

  const sumStage = (stages: string[]) =>
    allLeadsWithAmounts
      .filter(l => stages.includes(l.stage))
      .reduce((sum, l) => sum + Number(l.expectedValueInr || l.estimatedBudgetInr || 0), 0);

  const stageBreakdown = [
    { stage: 'NEW', label: 'New Inquiries', count: newLeads, valueInr: sumStage(['NEW', 'REQUESTS']) },
    { stage: 'CONTACTED', label: 'Contacted', count: contactedLeads, valueInr: sumStage(['CONTACTED', 'GENERAL']) },
    { stage: 'QUOTED', label: 'Proposal Sent', count: quotedLeads, valueInr: sumStage(['QUOTED', 'PRIORITY']) },
    { stage: 'NEGOTIATION', label: 'Negotiation', count: negotiationLeads, valueInr: sumStage(['NEGOTIATION']) },
    { stage: 'WON', label: 'Won / Booked', count: wonLeads, valueInr: sumStage(['WON', 'CONVERTED']) },
    { stage: 'LOST', label: 'Lost / Closed', count: lostLeads, valueInr: sumStage(['LOST', 'CLOSED']) },
  ];

  // Loss reason breakdown
  const lossReasonCounts: Record<string, number> = {};
  for (const l of allLeadsWithAmounts) {
    if (['LOST', 'CLOSED'].includes(l.stage) && l.lossReason) {
      lossReasonCounts[l.lossReason] = (lossReasonCounts[l.lossReason] || 0) + 1;
    }
  }
  const lossReasonBreakdown = Object.entries(lossReasonCounts).map(([reason, count]) => ({
    reason,
    count,
  })).sort((a, b) => b.count - a.count);

  const staffPerformance = employeePerformance.map((emp) => {
    const wonBookings = allBookingsWithAmounts.filter(b => b.managedByUserId === emp.userId);
    const wonRevenueInr = wonBookings.reduce((sum, b) => sum + Number(b.totalAmountInr || 0), 0);
    return {
      staffId: emp.userId,
      name: emp.name,
      email: emp.email,
      assignedCount: emp.totalAssigned,
      wonCount: emp.wonCount,
      winRate: emp.conversionRate,
      wonRevenueInr,
    };
  });

  return {
    dateFilter,
    kpis: {
      totalLeads,
      wonDeals: wonLeads,
      lostDeals: lostLeads,
      conversionRate,
      pipelineValueInr,
      realizedRevenueInr,
    },
    stageBreakdown,
    sourceBreakdown,
    staffPerformance,
    lossReasonBreakdown,
    totalLeads,
    newLeads,
    contactedLeads,
    quotedLeads,
    negotiationLeads,
    wonLeads,
    lostLeads,
    unassignedLeads,
    assignedToMeLeads,
    conversionRate,
    followUpsOverdue,
    followUpsToday,
    employeePerformance,
  };
}
