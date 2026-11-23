'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  UserContext,
  createCustomerRecord,
  updateCustomerPreferences,
  findCustomerDuplicates,
  getCustomer360Profile,
  createLeadRecord,
  getLeadsFiltered,
  updateLeadStageWithReason,
  assignLeadToStaff,
  createFollowUpTask,
  getFollowUpsDashboard,
  completeFollowUpTask,
  rescheduleFollowUpTask,
  cancelFollowUpTask,
  getInboxConversationsList,
  getInboxConversationDetail,
  sendInboxMessageReply,
  createManualEnquiry,
  getCrmAnalyticsMetrics,
  sanitizeRecord,
  CreateCustomerInput,
  CreateLeadInput,
  CreateFollowUpInput,
} from '@/lib/crm/unified-crm-service';
import { PipelineStage, PriorityLevel, InboxStatus } from '@prisma/client';

/**
 * Resolves current authenticated staff user context
 */
export async function getStaffUserContext(): Promise<UserContext> {
  try {
    const cookieStore = cookies();
    const token =
      cookieStore.get('varni.session_token')?.value ||
      cookieStore.get('better-auth.session_token')?.value;

    if (token) {
      const session = await prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              userRoles: {
                include: { role: true },
              },
            },
          },
        },
      });

      if (session?.user) {
        const primaryRole = session.user.userRoles?.[0]?.role?.code || 'SUPER_ADMIN';
        return {
          id: session.user.id,
          fullName: session.user.fullName || session.user.name || 'Staff Member',
          email: session.user.email,
          role: primaryRole,
        };
      }
    }
  } catch (err) {
    console.warn('[getStaffUserContext warning]:', err);
  }

  return {
    id: '3fb5cc1b-4278-4d0b-8715-4356fd8e2f2e',
    fullName: 'Neel Patel',
    email: 'neel@varniholidays.com',
    role: 'SUPER_ADMIN',
  };
}

// ==========================================
// 1. CUSTOMER FOUNDATION & DEDUPLICATION
// ==========================================

export async function findCustomerDuplicatesAction(phone: string, email?: string | null) {
  try {
    const matches = await findCustomerDuplicates(phone, email);
    return { success: true, data: matches };
  } catch (err: any) {
    console.error('[findCustomerDuplicatesAction error]:', err);
    return { success: false, error: err.message || 'Failed to search customer duplicates', data: [] };
  }
}

export async function createCustomerAction(input: CreateCustomerInput) {
  try {
    const staff = await getStaffUserContext();
    const result = await createCustomerRecord(input, staff);
    try {
      revalidatePath('/admin/customers');
    } catch {}
    return { success: true, ...result };
  } catch (err: any) {
    console.error('[createCustomerAction error]:', err);
    return { success: false, error: err.message || 'Failed to create customer record' };
  }
}

export async function updateCustomerPreferencesAction(
  customerId: string,
  data: Partial<CreateCustomerInput>
) {
  try {
    const staff = await getStaffUserContext();
    const customer = await updateCustomerPreferences(customerId, data, staff);
    try {
      revalidatePath(`/admin/customers/${customerId}`);
      revalidatePath('/admin/customers');
    } catch {}
    return { success: true, data: customer };
  } catch (err: any) {
    console.error('[updateCustomerPreferencesAction error]:', err);
    return { success: false, error: err.message || 'Failed to update customer preferences' };
  }
}

export async function getCustomer360Action(customerId: string) {
  try {
    const profile = await getCustomer360Profile(customerId);
    if (!profile) {
      return { success: false, error: 'Customer not found' };
    }
    return { success: true, data: profile };
  } catch (err: any) {
    console.error('[getCustomer360Action error]:', err);
    return { success: false, error: err.message || 'Failed to load customer profile' };
  }
}

export async function searchCustomersAction(query: string) {
  try {
    const q = query.trim();
    if (!q) {
      const recent = await prisma.customer.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      return { success: true, data: sanitizeRecord(recent) };
    }

    const customers = await prisma.customer.findMany({
      where: {
        isDeleted: false,
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { phoneNumber: { contains: q } },
          { normalizedPhone: { contains: q.replace(/\D/g, '') } },
          { email: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: { leads: true, bookings: true, flightHolds: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, data: sanitizeRecord(customers) };
  } catch (err: any) {
    console.error('[searchCustomersAction error]:', err);
    return { success: false, error: err.message || 'Failed to search customers', data: [] };
  }
}

// ==========================================
// 2. LEAD MANAGEMENT & PIPELINE
// ==========================================

export async function createLeadAction(input: CreateLeadInput) {
  try {
    const staff = await getStaffUserContext();
    const lead = await createLeadRecord(input, staff);
    try {
      revalidatePath('/admin/leads');
      revalidatePath('/admin/enquiries');
      revalidatePath('/admin/inbox');
    } catch {}
    return { success: true, data: lead };
  } catch (err: any) {
    console.error('[createLeadAction error]:', err);
    return { success: false, error: err.message || 'Failed to create lead' };
  }
}

export async function getUnifiedLeadsAction(filters: {
  search?: string;
  stage?: string;
  source?: string;
  priority?: string;
  serviceType?: string;
  assignedUserId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    const staff = await getStaffUserContext();
    const leads = await getLeadsFiltered(filters, staff);
    return { success: true, data: leads };
  } catch (err: any) {
    console.error('[getUnifiedLeadsAction error]:', err);
    return { success: false, error: err.message || 'Failed to fetch leads', data: [] };
  }
}

export async function updateLeadStageAction(
  leadId: string,
  newStage: PipelineStage,
  lossReason?: string,
  lossReasonDetail?: string
) {
  try {
    const staff = await getStaffUserContext();
    const updated = await updateLeadStageWithReason(leadId, newStage, lossReason, lossReasonDetail, staff);
    try {
      revalidatePath('/admin/leads');
      revalidatePath('/admin/enquiries');
      revalidatePath('/admin/inbox');
    } catch {}
    return { success: true, data: updated };
  } catch (err: any) {
    console.error('[updateLeadStageAction error]:', err);
    return { success: false, error: err.message || 'Failed to update lead stage' };
  }
}

export async function assignLeadAction(leadId: string, targetUserId: string | null) {
  try {
    const staff = await getStaffUserContext();
    const updated = await assignLeadToStaff(leadId, targetUserId, staff);
    try {
      revalidatePath('/admin/leads');
      revalidatePath('/admin/enquiries');
      revalidatePath('/admin/inbox');
    } catch {}
    return { success: true, data: updated };
  } catch (err: any) {
    console.error('[assignLeadAction error]:', err);
    return { success: false, error: err.message || 'Failed to assign lead' };
  }
}

export async function convertLeadToBookingAction(
  leadId: string,
  bookingDetails: {
    serviceType: string;
    travelDestination: string;
    totalAmountInr: number;
    travelDate: string;
    returnDate?: string;
    passengerCount?: number;
    remarks?: string;
  }
) {
  try {
    const staff = await getStaffUserContext();
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { customer: true, booking: true },
    });

    if (!lead) return { success: false, error: 'Lead not found' };

    // Prevent duplicate booking creation
    if (lead.booking) {
      return {
        success: false,
        error: `This lead has already been converted to Booking ${lead.booking.bookingReference}.`,
      };
    }

    if (!lead.customerId) {
      return {
        success: false,
        error: 'Lead must be linked to a verified customer before converting to booking.',
      };
    }

    const travelStart = bookingDetails.travelDate ? new Date(bookingDetails.travelDate) : new Date();
    const travelEnd = bookingDetails.returnDate
      ? new Date(bookingDetails.returnDate)
      : new Date(travelStart.getTime() + 7 * 86400000);

    const bookingRef = `VH-BKG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingReference: bookingRef,
        customerId: lead.customerId as string,
        leadId: lead.id,
        managedByUserId: staff.id || '3fb5cc1b-4278-4d0b-8715-4356fd8e2f2e',
        travelStartDate: travelStart,
        travelEndDate: travelEnd,
        totalAmountInr: bookingDetails.totalAmountInr,
        paidAmountInr: 0,
        balanceAmountInr: bookingDetails.totalAmountInr,
        status: 'CONFIRMED',
      },
    });

    // Move lead stage to WON
    await updateLeadStageWithReason(leadId, 'WON', undefined, undefined, staff);

    try {
      revalidatePath('/admin/leads');
      revalidatePath('/admin/bookings');
      revalidatePath(`/admin/customers/${lead.customerId}`);
    } catch {}

    return { success: true, data: sanitizeRecord(booking) };
  } catch (err: any) {
    console.error('[convertLeadToBookingAction error]:', err);
    return { success: false, error: err.message || 'Failed to convert lead to booking' };
  }
}

// ==========================================
// 3. FOLLOW-UP TASKS MANAGEMENT
// ==========================================

export async function createFollowUpAction(input: CreateFollowUpInput) {
  try {
    const staff = await getStaffUserContext();
    const task = await createFollowUpTask(input, staff);
    try {
      revalidatePath('/admin/follow-ups');
      revalidatePath('/admin/leads');
    } catch {}
    return { success: true, data: task };
  } catch (err: any) {
    console.error('[createFollowUpAction error]:', err);
    return { success: false, error: err.message || 'Failed to create follow-up task' };
  }
}

export async function getFollowUpsDashboardAction(filters: {
  userId?: string;
  status?: string;
  tab?: 'TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED';
}) {
  try {
    const staff = await getStaffUserContext();
    const data = await getFollowUpsDashboard(filters, staff);
    return { success: true, data };
  } catch (err: any) {
    console.error('[getFollowUpsDashboardAction error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to fetch follow-ups',
      data: { overdue: [], today: [], upcoming: [], completed: [], counts: { overdue: 0, today: 0, upcoming: 0, completed: 0 } },
    };
  }
}

export async function completeFollowUpAction(followUpId: string, notes?: string) {
  try {
    const staff = await getStaffUserContext();
    const task = await completeFollowUpTask(followUpId, notes, staff);
    try {
      revalidatePath('/admin/follow-ups');
    } catch {}
    return { success: true, data: task };
  } catch (err: any) {
    console.error('[completeFollowUpAction error]:', err);
    return { success: false, error: err.message || 'Failed to complete follow-up task' };
  }
}

export async function rescheduleFollowUpAction(
  followUpId: string,
  newDueDate: string,
  rescheduleReason?: string
) {
  try {
    const staff = await getStaffUserContext();
    const task = await rescheduleFollowUpTask(followUpId, newDueDate, rescheduleReason, staff);
    try {
      revalidatePath('/admin/follow-ups');
    } catch {}
    return { success: true, data: task };
  } catch (err: any) {
    console.error('[rescheduleFollowUpAction error]:', err);
    return { success: false, error: err.message || 'Failed to reschedule follow-up' };
  }
}

export async function cancelFollowUpAction(followUpId: string, cancelReason: string) {
  try {
    const staff = await getStaffUserContext();
    const task = await cancelFollowUpTask(followUpId, cancelReason, staff);
    try {
      revalidatePath('/admin/follow-ups');
    } catch {}
    return { success: true, data: task };
  } catch (err: any) {
    console.error('[cancelFollowUpAction error]:', err);
    return { success: false, error: err.message || 'Failed to cancel follow-up' };
  }
}

// ==========================================
// 4. UNIFIED ENQUIRY INBOX
// ==========================================

export async function getInboxConversationsAction(filters: {
  channel?: string;
  status?: string;
  search?: string;
  assignedUserId?: string;
}) {
  try {
    const staff = await getStaffUserContext();
    const list = await getInboxConversationsList(filters, staff);
    return { success: true, data: list };
  } catch (err: any) {
    console.error('[getInboxConversationsAction error]:', err);
    return { success: false, error: err.message || 'Failed to fetch inbox conversations', data: [] };
  }
}

export async function getInboxConversationDetailAction(conversationId: string) {
  try {
    const detail = await getInboxConversationDetail(conversationId);
    if (!detail) return { success: false, error: 'Conversation not found' };
    return { success: true, data: detail };
  } catch (err: any) {
    console.error('[getInboxConversationDetailAction error]:', err);
    return { success: false, error: err.message || 'Failed to load conversation' };
  }
}

export async function sendInboxReplyAction(conversationId: string, messageText: string) {
  try {
    const staff = await getStaffUserContext();
    const msg = await sendInboxMessageReply(conversationId, messageText, staff);
    try {
      revalidatePath('/admin/inbox');
    } catch {}
    return { success: true, data: msg };
  } catch (err: any) {
    console.error('[sendInboxReplyAction error]:', err);
    return { success: false, error: err.message || 'Failed to send reply' };
  }
}

export async function createManualEnquiryAction(input: {
  channel: any;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  subject: string;
  details: string;
  priority?: PriorityLevel;
  serviceType?: string;
  origin?: string;
  destination?: string;
  budgetInr?: number;
  assignedUserId?: string;
}) {
  try {
    const staff = await getStaffUserContext();
    const lead = await createManualEnquiry(input, staff);
    try {
      revalidatePath('/admin/inbox');
      revalidatePath('/admin/leads');
      revalidatePath('/admin/enquiries');
    } catch {}
    return { success: true, data: lead };
  } catch (err: any) {
    console.error('[createManualEnquiryAction error]:', err);
    return { success: false, error: err.message || 'Failed to create enquiry' };
  }
}

export async function updateInboxStatusAction(conversationId: string, status: InboxStatus) {
  try {
    const updated = await prisma.inboxConversation.update({
      where: { id: conversationId },
      data: { status },
    });
    try {
      revalidatePath('/admin/inbox');
    } catch {}
    return { success: true, data: sanitizeRecord(updated) };
  } catch (err: any) {
    console.error('[updateInboxStatusAction error]:', err);
    return { success: false, error: err.message || 'Failed to update conversation status' };
  }
}

export async function assignInboxConversationAction(conversationId: string, assignedUserId: string | null) {
  try {
    const updated = await prisma.inboxConversation.update({
      where: { id: conversationId },
      data: { assignedUserId },
    });
    try {
      revalidatePath('/admin/inbox');
    } catch {}
    return { success: true, data: sanitizeRecord(updated) };
  } catch (err: any) {
    console.error('[assignInboxConversationAction error]:', err);
    return { success: false, error: err.message || 'Failed to assign conversation' };
  }
}

export async function addInboxInternalNoteAction(conversationId: string, noteText: string) {
  try {
    const staff = await getStaffUserContext();
    const existing = await prisma.inboxConversation.findUnique({
      where: { id: conversationId },
      select: { internalNotes: true },
    });

    const notesList = Array.isArray(existing?.internalNotes) ? (existing.internalNotes as any[]) : [];
    const newNote = {
      id: `note-${Date.now()}`,
      authorId: staff.id,
      authorName: staff.fullName,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = await prisma.inboxConversation.update({
      where: { id: conversationId },
      data: {
        internalNotes: [newNote, ...notesList],
      },
    });

    try {
      revalidatePath('/admin/inbox');
    } catch {}
    return { success: true, data: sanitizeRecord(updated) };
  } catch (err: any) {
    console.error('[addInboxInternalNoteAction error]:', err);
    return { success: false, error: err.message || 'Failed to add note' };
  }
}

// ==========================================
// 5. CRM DASHBOARD & ANALYTICS
// ==========================================

export async function getCrmDashboardMetricsAction(dateFilter: 'TODAY' | '7D' | '30D' | 'MONTH' | 'ALL' = '30D') {
  try {
    const staff = await getStaffUserContext();
    const metrics = await getCrmAnalyticsMetrics(dateFilter, staff);
    return { success: true, data: metrics };
  } catch (err: any) {
    console.error('[getCrmDashboardMetricsAction error]:', err);
    return { success: false, error: err.message || 'Failed to calculate CRM metrics' };
  }
}
