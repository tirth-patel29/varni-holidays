'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { FlightHoldPlatform, FlightHoldStatus, FlightHoldPaymentMode } from '@prisma/client';
import { calculateRemainingTime } from '@/lib/flights/timing';

export interface StaffUserContext {
  id: string | null;
  fullName: string;
  email: string;
  role: string;
}

/**
 * Resolve authenticated staff user from cookies/DB
 */
export async function getStaffUser(): Promise<StaffUserContext> {
  // 1. Try reading cookies if in Next.js request context
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
        const primaryRole = session.user.userRoles?.[0]?.role?.code || 'STAFF';
        return {
          id: session.user.id,
          fullName: session.user.fullName || session.user.name || 'Staff User',
          email: session.user.email,
          role: primaryRole,
        };
      }
    }
  } catch {
    // cookies() called outside request context (e.g. test or cron)
  }

  // 2. Query real database user
  try {
    const dbUser = await prisma.user.findFirst({
      where: { isDeleted: false },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (dbUser) {
      return {
        id: dbUser.id,
        fullName: dbUser.fullName || dbUser.name || 'System Admin',
        email: dbUser.email,
        role: dbUser.userRoles?.[0]?.role?.code || 'SUPER_ADMIN',
      };
    }
  } catch (err) {
    console.error('[getStaffUser DB Error]:', err);
  }

  return {
    id: null,
    fullName: 'Operations Desk',
    email: 'ops@varniholidays.com',
    role: 'OPERATIONS',
  };
}

// ==========================================
// 1. STATS ACTION
// ==========================================
export async function getFlightHoldStatsAction() {
  try {
    const now = new Date();
    const tenHoursFromNow = new Date(now.getTime() + 10 * 60 * 60 * 1000);

    const [activeCount, urgentCount, issuedCount, cancelledCount, releasedCount] = await Promise.all([
      // Active Holds: status ON_HOLD and deadline not passed
      prisma.flightHoldPNR.count({
        where: {
          isDeleted: false,
          status: 'ON_HOLD',
          holdTillDateTime: { gt: now },
        },
      }),
      // Urgent: status ON_HOLD, deadline between now and 10 hours
      prisma.flightHoldPNR.count({
        where: {
          isDeleted: false,
          status: 'ON_HOLD',
          holdTillDateTime: {
            gt: now,
            lte: tenHoursFromNow,
          },
        },
      }),
      // Issued PNRs
      prisma.flightHoldPNR.count({
        where: {
          isDeleted: false,
          status: 'ISSUED',
        },
      }),
      // Cancelled PNRs
      prisma.flightHoldPNR.count({
        where: {
          isDeleted: false,
          status: 'CANCELLED',
        },
      }),
      // Released - No Action Taken
      prisma.flightHoldPNR.count({
        where: {
          isDeleted: false,
          status: 'RELEASED_NO_ACTION',
        },
      }),
    ]);

    return {
      success: true,
      data: {
        activeCount,
        urgentCount,
        issuedCount,
        cancelledCount,
        releasedCount,
        total: activeCount + issuedCount + cancelledCount + releasedCount,
      },
    };
  } catch (error: any) {
    console.error('[getFlightHoldStatsAction error]:', error);
    return {
      success: false,
      error: error.message || 'Failed to retrieve flight hold statistics',
      data: {
        activeCount: 0,
        urgentCount: 0,
        issuedCount: 0,
        cancelledCount: 0,
        releasedCount: 0,
        total: 0,
      },
    };
  }
}

// ==========================================
// 2. QUERY / LIST ACTION
// ==========================================
export interface FlightHoldFilters {
  status?: FlightHoldStatus | 'ALL';
  urgentOnly?: boolean;
  platform?: string;
  search?: string;
  assignedStaffId?: string;
  page?: number;
  limit?: number;
}

export async function getFlightHoldsAction(filters: FlightHoldFilters = {}) {
  try {
    const {
      status,
      urgentOnly = false,
      platform,
      search,
      assignedStaffId,
      page = 1,
      limit = 50,
    } = filters;

    const now = new Date();
    const tenHoursFromNow = new Date(now.getTime() + 10 * 60 * 60 * 1000);

    const where: any = {
      isDeleted: false,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (urgentOnly) {
      where.status = 'ON_HOLD';
      where.holdTillDateTime = {
        gt: now,
        lte: tenHoursFromNow,
      };
    }

    if (platform && platform !== 'ALL') {
      where.platform = platform as FlightHoldPlatform;
    }

    if (assignedStaffId && assignedStaffId !== 'ALL') {
      where.assignedStaffId = assignedStaffId;
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { pnr: { contains: q, mode: 'insensitive' } },
        { passengerName: { contains: q, mode: 'insensitive' } },
        { travelRoute: { contains: q, mode: 'insensitive' } },
        { airlineTicketNumber: { contains: q, mode: 'insensitive' } },
        { internalNotes: { contains: q, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      prisma.flightHoldPNR.count({ where }),
      prisma.flightHoldPNR.findMany({
        where,
        include: {
          assignedStaff: {
            select: { id: true, fullName: true, name: true, email: true, phone: true },
          },
          issuedByUser: {
            select: { id: true, fullName: true, name: true, email: true },
          },
          cancelledByUser: {
            select: { id: true, fullName: true, name: true, email: true },
          },
          extensions: {
            orderBy: { createdAt: 'desc' },
            include: {
              extendedByUser: {
                select: { id: true, fullName: true, name: true },
              },
            },
          },
          reminders: {
            orderBy: { scheduledFor: 'desc' },
          },
          actionHistory: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
        orderBy: [
          // If on hold, prioritize closest deadline
          { holdTillDateTime: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
    ]);

    const formattedRecords = records.map((record) => {
      const timing = calculateRemainingTime(record.holdTillDateTime);
      return {
        ...record,
        issuanceAmountInr: record.issuanceAmountInr ? Number(record.issuanceAmountInr) : null,
        timing,
      };
    });

    return {
      success: true,
      data: formattedRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error('[getFlightHoldsAction error]:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch flight holds',
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    };
  }
}

// ==========================================
// 3. GET SINGLE HOLD DETAIL
// ==========================================
export async function getFlightHoldDetailAction(id: string) {
  try {
    const record = await prisma.flightHoldPNR.findUnique({
      where: { id },
      include: {
        assignedStaff: {
          select: { id: true, fullName: true, name: true, email: true, phone: true },
        },
        issuedByUser: {
          select: { id: true, fullName: true, name: true, email: true },
        },
        cancelledByUser: {
          select: { id: true, fullName: true, name: true, email: true },
        },
        extensions: {
          orderBy: { createdAt: 'desc' },
          include: {
            extendedByUser: {
              select: { id: true, fullName: true, name: true },
            },
          },
        },
        reminders: {
          orderBy: { scheduledFor: 'desc' },
        },
        actionHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!record) {
      return { success: false, error: 'Flight Hold PNR not found' };
    }

    const timing = calculateRemainingTime(record.holdTillDateTime);

    return {
      success: true,
      data: {
        ...record,
        issuanceAmountInr: record.issuanceAmountInr ? Number(record.issuanceAmountInr) : null,
        timing,
      },
    };
  } catch (error: any) {
    console.error('[getFlightHoldDetailAction error]:', error);
    return { success: false, error: error.message || 'Failed to fetch hold details' };
  }
}

// ==========================================
// 4. CREATE FLIGHT HOLD
// ==========================================
export interface CreateFlightHoldInput {
  pnr: string;
  passengerName?: string;
  travelRoute?: string;
  travelDate: string; // ISO date
  platform: FlightHoldPlatform;
  platformOtherName?: string;
  holdDateTime?: string; // Optional: default now
  holdTillDateTime: string; // ISO date time
  internalNotes?: string;
  assignedStaffId?: string;
  bookingId?: string;
  customerId?: string;
}

export async function createFlightHoldAction(input: CreateFlightHoldInput) {
  try {
    const staff = await getStaffUser();

    // 1. Validation
    const cleanPNR = input.pnr?.trim().toUpperCase();
    if (!cleanPNR || cleanPNR.length < 4 || cleanPNR.length > 12) {
      return { success: false, error: 'PNR must be between 4 and 12 alphanumeric characters' };
    }

    if (!input.travelDate) {
      return { success: false, error: 'Travel Date is required' };
    }

    if (!input.holdTillDateTime) {
      return { success: false, error: 'Hold Till Date & Time is mandatory' };
    }

    const holdTillDate = new Date(input.holdTillDateTime);
    if (isNaN(holdTillDate.getTime())) {
      return { success: false, error: 'Invalid Hold Till Date & Time format' };
    }

    const now = new Date();
    if (holdTillDate.getTime() <= now.getTime()) {
      return { success: false, error: 'Hold Till Date & Time must be in the future' };
    }

    if (input.platform === 'OTHER' && (!input.platformOtherName || input.platformOtherName.trim().length === 0)) {
      return { success: false, error: 'Please specify the Platform/Supplier Name when selecting "Other"' };
    }

    const travelDateParsed = new Date(input.travelDate);
    const holdDateParsed = input.holdDateTime ? new Date(input.holdDateTime) : now;

    // 2. Create Record
    const flightHold = await prisma.flightHoldPNR.create({
      data: {
        pnr: cleanPNR,
        passengerName: input.passengerName?.trim() || null,
        travelRoute: input.travelRoute?.trim() || null,
        travelDate: travelDateParsed,
        platform: input.platform,
        platformOtherName: input.platform === 'OTHER' ? input.platformOtherName?.trim() : null,
        holdDateTime: holdDateParsed,
        holdTillDateTime: holdTillDate,
        internalNotes: input.internalNotes?.trim() || null,
        assignedStaffId: input.assignedStaffId || staff.id || null,
        bookingId: input.bookingId || null,
        customerId: input.customerId || null,
        status: 'ON_HOLD',
      },
    });

    // 3. Log Action History
    await prisma.flightHoldActionHistory.create({
      data: {
        flightHoldId: flightHold.id,
        actionType: 'CREATED',
        details: `Hold created for PNR ${cleanPNR} on ${input.platform} by ${staff.fullName}. Deadline: ${holdTillDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.`,
        performedByUserId: staff.id || null,
        performedByName: staff.fullName,
        performedByRole: staff.role,
        metadata: {
          pnr: cleanPNR,
          platform: input.platform,
          holdTill: holdTillDate.toISOString(),
          assignedStaffId: input.assignedStaffId || staff.id || null,
        },
      },
    });

    // 4. Calculate Reminders: 10 hours before deadline
    const diffHours = (holdTillDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 10) {
      // Immediate urgency reminder
      await prisma.flightHoldReminder.create({
        data: {
          flightHoldId: flightHold.id,
          reminderType: 'URGENT_IMMEDIATE',
          scheduledFor: now,
          status: 'TRIGGERED',
          triggeredAt: now,
          recipientUserId: input.assignedStaffId || staff.id || null,
        },
      });
    } else {
      // Scheduled 10-hour reminder
      const reminderTime = new Date(holdTillDate.getTime() - 10 * 60 * 60 * 1000);
      await prisma.flightHoldReminder.create({
        data: {
          flightHoldId: flightHold.id,
          reminderType: 'TEN_HOUR_WARNING',
          scheduledFor: reminderTime,
          status: 'PENDING',
          recipientUserId: input.assignedStaffId || staff.id || null,
        },
      });
    }

    try {
      revalidatePath('/admin/bookings/flights');
    } catch {}
    return { success: true, data: flightHold };
  } catch (error: any) {
    console.error('[createFlightHoldAction error]:', error);
    return { success: false, error: error.message || 'Failed to create flight hold' };
  }
}

// ==========================================
// 5. EXTEND HOLD ACTION
// ==========================================
export interface ExtendFlightHoldInput {
  id: string;
  newHoldTillDateTime: string; // ISO date time
  extensionReason?: string;
}

export async function extendFlightHoldAction(input: ExtendFlightHoldInput) {
  try {
    const staff = await getStaffUser();

    const existing = await prisma.flightHoldPNR.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return { success: false, error: 'Flight Hold record not found' };
    }

    if (existing.status !== 'ON_HOLD') {
      return { success: false, error: `Cannot extend hold. Current status is ${existing.status}` };
    }

    const newDeadline = new Date(input.newHoldTillDateTime);
    if (isNaN(newDeadline.getTime())) {
      return { success: false, error: 'Invalid new hold deadline format' };
    }

    if (newDeadline.getTime() <= existing.holdTillDateTime.getTime()) {
      return {
        success: false,
        error: 'The new hold deadline must be strictly later than the current hold deadline',
      };
    }

    const previousDeadline = existing.holdTillDateTime;

    // 1. Create extension record
    await prisma.flightHoldExtension.create({
      data: {
        flightHoldId: existing.id,
        previousHoldTill: previousDeadline,
        newHoldTill: newDeadline,
        extensionReason: input.extensionReason?.trim() || null,
        extendedByUserId: staff.id || null,
        extendedByName: staff.fullName,
      },
    });

    // 2. Update hold record
    const updated = await prisma.flightHoldPNR.update({
      where: { id: existing.id },
      data: {
        holdTillDateTime: newDeadline,
      },
    });

    // 3. Log history
    await prisma.flightHoldActionHistory.create({
      data: {
        flightHoldId: existing.id,
        actionType: 'EXTENDED',
        details: `Hold extended from ${previousDeadline.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST to ${newDeadline.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST by ${staff.fullName}. Reason: ${input.extensionReason || 'Not specified'}`,
        performedByUserId: staff.id || null,
        performedByName: staff.fullName,
        performedByRole: staff.role,
        metadata: {
          previousHoldTill: previousDeadline.toISOString(),
          newHoldTill: newDeadline.toISOString(),
          reason: input.extensionReason,
        },
      },
    });

    // 4. Cancel previous pending reminders and re-calculate
    await prisma.flightHoldReminder.updateMany({
      where: {
        flightHoldId: existing.id,
        status: 'PENDING',
      },
      data: {
        status: 'DISMISSED',
      },
    });

    const now = new Date();
    const diffHours = (newDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 10) {
      await prisma.flightHoldReminder.create({
        data: {
          flightHoldId: existing.id,
          reminderType: 'URGENT_IMMEDIATE',
          scheduledFor: now,
          status: 'TRIGGERED',
          triggeredAt: now,
          recipientUserId: existing.assignedStaffId || staff.id || null,
        },
      });
    } else {
      const reminderTime = new Date(newDeadline.getTime() - 10 * 60 * 60 * 1000);
      await prisma.flightHoldReminder.create({
        data: {
          flightHoldId: existing.id,
          reminderType: 'TEN_HOUR_WARNING',
          scheduledFor: reminderTime,
          status: 'PENDING',
          recipientUserId: existing.assignedStaffId || staff.id || null,
        },
      });
    }

    try {
      revalidatePath('/admin/bookings/flights');
    } catch {}
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[extendFlightHoldAction error]:', error);
    return { success: false, error: error.message || 'Failed to extend flight hold' };
  }
}

// ==========================================
// 6. ISSUE PNR ACTION
// ==========================================
export interface IssueFlightHoldInput {
  id: string;
  paymentMode: FlightHoldPaymentMode;
  paymentModeOther?: string;
  issuedFrom: string; // Amadeus, CT, RC, Airline Direct, Other
  issuedFromOther?: string;
  issuanceAmountInr: number;
  airlineTicketNumber?: string;
}

export async function issueFlightHoldAction(input: IssueFlightHoldInput) {
  try {
    const staff = await getStaffUser();

    const existing = await prisma.flightHoldPNR.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return { success: false, error: 'Flight Hold record not found' };
    }

    if (existing.status === 'ISSUED') {
      return { success: false, error: 'This PNR has already been marked as ISSUED' };
    }

    if (existing.status === 'CANCELLED') {
      return { success: false, error: 'Cannot issue a CANCELLED hold' };
    }

    if (!input.paymentMode) {
      return { success: false, error: 'Payment Mode is mandatory for ticket issuance' };
    }

    if (input.paymentMode === 'OTHER' && (!input.paymentModeOther || input.paymentModeOther.trim().length === 0)) {
      return { success: false, error: 'Please specify the Payment Mode description' };
    }

    if (!input.issuedFrom || input.issuedFrom.trim().length === 0) {
      return { success: false, error: 'Issued From platform is mandatory' };
    }

    if (input.issuedFrom === 'Other' && (!input.issuedFromOther || input.issuedFromOther.trim().length === 0)) {
      return { success: false, error: 'Please specify the supplier/platform name for Issued From' };
    }

    const amount = Number(input.issuanceAmountInr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Issuance Amount must be a positive number greater than ₹0' };
    }

    const now = new Date();

    // 1. Update Hold to ISSUED
    const updated = await prisma.flightHoldPNR.update({
      where: { id: existing.id },
      data: {
        status: 'ISSUED',
        paymentMode: input.paymentMode,
        paymentModeOther: input.paymentMode === 'OTHER' ? input.paymentModeOther?.trim() : null,
        issuedFrom: input.issuedFrom.trim(),
        issuedFromOther: input.issuedFrom === 'Other' ? input.issuedFromOther?.trim() : null,
        issuanceAmountInr: amount,
        airlineTicketNumber: input.airlineTicketNumber?.trim() || null,
        issuedByUserId: staff.id || null,
        issuedAt: now,
      },
    });

    // 2. Dismiss any pending reminders
    await prisma.flightHoldReminder.updateMany({
      where: {
        flightHoldId: existing.id,
        status: 'PENDING',
      },
      data: {
        status: 'SUPPRESSED',
      },
    });

    // 3. Log in action history
    await prisma.flightHoldActionHistory.create({
      data: {
        flightHoldId: existing.id,
        actionType: 'ISSUED',
        details: `PNR ${existing.pnr} confirmed ISSUED by ${staff.fullName}. Amount: ₹${amount.toLocaleString('en-IN')}, Mode: ${input.paymentMode}, Issued From: ${input.issuedFrom}${input.airlineTicketNumber ? `, Ticket: ${input.airlineTicketNumber}` : ''}.`,
        performedByUserId: staff.id || null,
        performedByName: staff.fullName,
        performedByRole: staff.role,
        metadata: {
          amount,
          paymentMode: input.paymentMode,
          issuedFrom: input.issuedFrom,
          airlineTicketNumber: input.airlineTicketNumber,
          originalHoldOn: existing.platform,
        },
      },
    });

    try {
      revalidatePath('/admin/bookings/flights');
    } catch {}
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[issueFlightHoldAction error]:', error);
    return { success: false, error: error.message || 'Failed to issue PNR' };
  }
}

// ==========================================
// 7. CANCEL HOLD ACTION
// ==========================================
export interface CancelFlightHoldInput {
  id: string;
  cancellationReason: string;
}

export async function cancelFlightHoldAction(input: CancelFlightHoldInput) {
  try {
    const staff = await getStaffUser();

    const existing = await prisma.flightHoldPNR.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return { success: false, error: 'Flight Hold record not found' };
    }

    if (existing.status === 'CANCELLED') {
      return { success: false, error: 'This hold has already been marked as CANCELLED' };
    }

    if (existing.status === 'ISSUED') {
      return { success: false, error: 'Cannot cancel an already ISSUED ticket through this queue' };
    }

    const reason = input.cancellationReason?.trim();
    if (!reason || reason.length < 3) {
      return { success: false, error: 'Cancellation Reason / Remarks is mandatory (minimum 3 characters)' };
    }

    const now = new Date();

    // 1. Update status to CANCELLED
    const updated = await prisma.flightHoldPNR.update({
      where: { id: existing.id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledByUserId: staff.id || null,
        cancelledAt: now,
      },
    });

    // 2. Dismiss any pending reminders
    await prisma.flightHoldReminder.updateMany({
      where: {
        flightHoldId: existing.id,
        status: 'PENDING',
      },
      data: {
        status: 'DISMISSED',
      },
    });

    // 3. Log history
    await prisma.flightHoldActionHistory.create({
      data: {
        flightHoldId: existing.id,
        actionType: 'CANCELLED',
        details: `Hold for PNR ${existing.pnr} marked CANCELLED by ${staff.fullName}. Reason: ${reason}`,
        performedByUserId: staff.id || null,
        performedByName: staff.fullName,
        performedByRole: staff.role,
        metadata: {
          reason,
        },
      },
    });

    try {
      revalidatePath('/admin/bookings/flights');
    } catch {}
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[cancelFlightHoldAction error]:', error);
    return { success: false, error: error.message || 'Failed to cancel flight hold' };
  }
}

// ==========================================
// 8. AUTO-RELEASE & REMINDER TRIGGER RUNNER
// ==========================================
export async function runFlightHoldSchedulerAction() {
  try {
    const now = new Date();
    const tenHoursFromNow = new Date(now.getTime() + 10 * 60 * 60 * 1000);

    // A. Auto-Release Expired Holds
    const expiredHolds = await prisma.flightHoldPNR.findMany({
      where: {
        isDeleted: false,
        status: 'ON_HOLD',
        holdTillDateTime: { lte: now },
      },
    });

    let autoReleasedCount = 0;
    for (const hold of expiredHolds) {
      await prisma.flightHoldPNR.update({
        where: { id: hold.id },
        data: {
          status: 'RELEASED_NO_ACTION',
          releasedAt: now,
          releaseReason:
            'Internal hold deadline expired with no issuance or cancellation action.',
        },
      });

      await prisma.flightHoldActionHistory.create({
        data: {
          flightHoldId: hold.id,
          actionType: 'RELEASED',
          details: `Hold automatically marked as RELEASED_NO_ACTION at ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST because the deadline (${hold.holdTillDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST) passed without action. Note: This indicates internal system queue status and does not automatically confirm release on airline/GDS platform.`,
          performedByName: 'Auto-Release Engine',
          performedByRole: 'SYSTEM_SCHEDULER',
        },
      });

      // Dismiss pending reminders
      await prisma.flightHoldReminder.updateMany({
        where: { flightHoldId: hold.id, status: 'PENDING' },
        data: { status: 'DISMISSED' },
      });

      autoReleasedCount++;
    }

    // B. Trigger Pending 10-Hour Reminders
    const dueReminders = await prisma.flightHoldReminder.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: now },
        flightHold: {
          status: 'ON_HOLD',
        },
      },
      include: {
        flightHold: true,
      },
    });

    let remindersTriggeredCount = 0;
    for (const reminder of dueReminders) {
      await prisma.flightHoldReminder.update({
        where: { id: reminder.id },
        data: {
          status: 'TRIGGERED',
          triggeredAt: now,
        },
      });

      await prisma.flightHoldActionHistory.create({
        data: {
          flightHoldId: reminder.flightHoldId,
          actionType: 'REMINDER_SENT',
          details: `10-hour urgent issuance alert triggered for PNR ${reminder.flightHold.pnr}. Deadline is within 10 hours (${reminder.flightHold.holdTillDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST).`,
          performedByName: 'Issuance Reminder System',
          performedByRole: 'SYSTEM_SCHEDULER',
        },
      });

      remindersTriggeredCount++;
    }

    try {
      revalidatePath('/admin/bookings/flights');
    } catch {}
    return {
      success: true,
      data: {
        autoReleasedCount,
        remindersTriggeredCount,
        processedAt: now.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('[runFlightHoldSchedulerAction error]:', error);
    return { success: false, error: error.message || 'Scheduler failed' };
  }
}
