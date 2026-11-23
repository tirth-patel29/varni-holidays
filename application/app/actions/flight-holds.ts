'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { FlightHoldPlatform, FlightHoldStatus, FlightHoldPaymentMode } from '@prisma/client';
import { calculateRemainingTime, formatIST24, isValidEmail } from '@/lib/flights/timing';
import { storeFlightTicketPdf, buildTicketDownloadUrl } from '@/lib/flights/ticket-document-service';
import {
  dispatchTicketConfirmation,
  schedule24HourDepartureReminder,
  buildDepartureReminderEmailHtml,
  buildDepartureReminderWhatsAppText,
  TicketFlightDetails,
} from '@/lib/flights/passenger-care';
import { sendCustomerEmail } from '@/lib/integrations/email-service';
import { sendCustomerWhatsApp } from '@/lib/integrations/whatsapp-service';

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
        { passengerPhone: { contains: q, mode: 'insensitive' } },
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
          ticketDocuments: {
            select: { id: true, fileName: true, fileSize: true, downloadToken: true, createdAt: true },
          },
          passengerNotifications: {
            orderBy: { createdAt: 'desc' },
            take: 5,
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
        ticketDocuments: {
          select: { id: true, fileName: true, fileSize: true, downloadToken: true, createdAt: true },
        },
        passengerNotifications: {
          orderBy: { createdAt: 'desc' },
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
  passengerPhone: string; // Mandatory Passenger / Guest Contact Number
  passengerEmail?: string; // Optional Passenger Email Address
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

    const cleanPhone = input.passengerPhone?.trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      return {
        success: false,
        error: 'Passenger / Guest Contact Number is mandatory (minimum 7 digits)',
      };
    }

    const cleanEmail = input.passengerEmail?.trim().toLowerCase();
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return {
        success: false,
        error: 'Please enter a valid email address (e.g. passenger@example.com)',
      };
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

    // Check for existing customer to reuse relationship & avoid duplicate records
    let linkedCustomerId = input.customerId || null;
    if (!linkedCustomerId) {
      const cleanDigits = cleanPhone.replace(/\D/g, '');
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          OR: [
            ...(cleanDigits.length >= 7
              ? [
                  { phoneNumber: { contains: cleanDigits.slice(-10) } },
                  { normalizedPhone: { contains: cleanDigits.slice(-10) } },
                ]
              : []),
            ...(cleanEmail ? [{ normalizedEmail: cleanEmail }, { email: cleanEmail }] : []),
          ],
        },
      });
      if (existingCustomer) {
        linkedCustomerId = existingCustomer.id;
      }
    }

    // 2. Create Record
    const flightHold = await prisma.flightHoldPNR.create({
      data: {
        pnr: cleanPNR,
        passengerName: input.passengerName?.trim() || null,
        passengerPhone: cleanPhone,
        passengerEmail: cleanEmail || null,
        travelRoute: input.travelRoute?.trim() || null,
        travelDate: travelDateParsed,
        platform: input.platform,
        platformOtherName: input.platform === 'OTHER' ? input.platformOtherName?.trim() : null,
        holdDateTime: holdDateParsed,
        holdTillDateTime: holdTillDate,
        internalNotes: input.internalNotes?.trim() || null,
        assignedStaffId: input.assignedStaffId || staff.id || null,
        bookingId: input.bookingId || null,
        customerId: linkedCustomerId,
        status: 'ON_HOLD',
      },
    });

    // 3. Log Action History
    await prisma.flightHoldActionHistory.create({
      data: {
        flightHoldId: flightHold.id,
        actionType: 'CREATED',
        details: `Hold created for PNR ${cleanPNR} on ${input.platform} by ${staff.fullName}. Guest Contact: ${cleanPhone}${cleanEmail ? `, Email: ${cleanEmail}` : ''}. Deadline: ${formatIST24(holdTillDate)} IST.`,
        performedByUserId: staff.id || null,
        performedByName: staff.fullName,
        performedByRole: staff.role,
        metadata: {
          pnr: cleanPNR,
          passengerPhone: cleanPhone,
          passengerEmail: cleanEmail || null,
          platform: input.platform,
          holdTill: holdTillDate.toISOString(),
          assignedStaffId: input.assignedStaffId || staff.id || null,
          customerId: linkedCustomerId,
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
        details: `Hold extended from ${formatIST24(previousDeadline)} IST to ${formatIST24(newDeadline)} IST by ${staff.fullName}. Reason: ${input.extensionReason || 'Not specified'}`,
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
  // Passenger Travel Care additions
  passengerEmail?: string;
  airline?: string;
  flightNumber?: string;
  originAirport?: string;
  destinationAirport?: string;
  departureDateTime?: string; // ISO date-time string
  departureTimezone?: string;
  pdfBase64?: string;
  pdfFileName?: string;
  sendEmailNotification?: boolean;
  sendWhatsAppNotification?: boolean;
  scheduleDepartureReminder?: boolean;
}

export async function issueFlightHoldAction(input: IssueFlightHoldInput) {
  try {
    const staff = await getStaffUser();

    const existing = await prisma.flightHoldPNR.findUnique({
      where: { id: input.id },
      include: {
        ticketDocuments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
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

    if (input.issuedFrom === 'Other') {
      const trimmedOther = input.issuedFromOther?.trim();
      if (!trimmedOther || trimmedOther.length === 0) {
        return {
          success: false,
          error: 'Please specify the other platform or supplier name when Issued From is Other',
        };
      }
    }

    const amount = Number(input.issuanceAmountInr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Issuance Amount must be a positive number greater than ₹0' };
    }

    // Validate email if provided
    const cleanEmail = input.passengerEmail?.trim().toLowerCase();
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return { success: false, error: 'Please enter a valid passenger email address' };
    }

    // Parse departure date/time if provided
    let parsedDepartureDateTime: Date | null = existing.departureDateTime;
    if (input.departureDateTime) {
      const parsed = new Date(input.departureDateTime);
      if (!isNaN(parsed.getTime())) {
        parsedDepartureDateTime = parsed;
      }
    }

    const now = new Date();
    const effectivePassengerEmail = cleanEmail || existing.passengerEmail || null;
    const effectiveAirline = input.airline?.trim() || existing.airline || null;
    const effectiveFlightNumber = input.flightNumber?.trim() || existing.flightNumber || null;
    const effectiveOrigin = input.originAirport?.trim() || existing.originAirport || null;
    const effectiveDestination = input.destinationAirport?.trim() || existing.destinationAirport || null;
    const effectiveDepartureTz = input.departureTimezone?.trim() || existing.departureTimezone || 'Asia/Kolkata';

    // 1. Update Hold to ISSUED (Core Issuance is strictly atomic and independent)
    const updated = await prisma.flightHoldPNR.update({
      where: { id: existing.id },
      data: {
        status: 'ISSUED',
        paymentMode: input.paymentMode,
        paymentModeOther: input.paymentMode === 'OTHER' ? input.paymentModeOther?.trim() : null,
        issuedFrom: input.issuedFrom.trim(),
        issuedFromOther: input.issuedFrom === 'Other' ? input.issuedFromOther?.trim() || null : null,
        issuanceAmountInr: amount,
        airlineTicketNumber: input.airlineTicketNumber?.trim() || null,
        passengerEmail: effectivePassengerEmail,
        airline: effectiveAirline,
        flightNumber: effectiveFlightNumber,
        originAirport: effectiveOrigin,
        destinationAirport: effectiveDestination,
        departureDateTime: parsedDepartureDateTime,
        departureTimezone: effectiveDepartureTz,
        issuedByUserId: staff.id || null,
        issuedAt: now,
      },
    });

    // 2. Dismiss any pending hold expiry reminders
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
    const issuedFromDisplay =
      input.issuedFrom === 'Other' && input.issuedFromOther?.trim()
        ? `Other (${input.issuedFromOther.trim()})`
        : input.issuedFrom;

    await prisma.flightHoldActionHistory.create({
      data: {
        flightHoldId: existing.id,
        actionType: 'ISSUED',
        details: `PNR ${existing.pnr} confirmed ISSUED by ${staff.fullName} at ${formatIST24(now)} IST. Amount: ₹${amount.toLocaleString('en-IN')}, Mode: ${input.paymentMode}, Issued From: ${issuedFromDisplay}${input.airlineTicketNumber ? `, Ticket: ${input.airlineTicketNumber}` : ''}.${effectivePassengerEmail ? ` Passenger Email: ${effectivePassengerEmail}.` : ''}`,
        performedByUserId: staff.id || null,
        performedByName: staff.fullName,
        performedByRole: staff.role,
        metadata: {
          amount,
          paymentMode: input.paymentMode,
          issuedFrom: input.issuedFrom,
          issuedFromOther: input.issuedFrom === 'Other' ? input.issuedFromOther?.trim() || null : null,
          airlineTicketNumber: input.airlineTicketNumber,
          passengerEmail: effectivePassengerEmail,
          airline: effectiveAirline,
          flightNumber: effectiveFlightNumber,
          originalHoldOn: existing.platform,
        },
      },
    });

    const notificationWarnings: string[] = [];

    // 4. Handle Optional E-Ticket PDF Upload (Isolated try/catch - never rolls back issuance)
    let ticketPdfBuffer: Buffer | null = null;
    let ticketDownloadUrl: string | null = null;

    if (input.pdfBase64) {
      try {
        const cleanBase64 = input.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        ticketPdfBuffer = Buffer.from(cleanBase64, 'base64');
        const docResult = await storeFlightTicketPdf({
          flightHoldId: existing.id,
          fileName: input.pdfFileName || `Ticket-${existing.pnr}.pdf`,
          fileBuffer: ticketPdfBuffer,
          uploadedByUserId: staff.id || null,
        });

        if (docResult.success && docResult.downloadToken) {
          ticketDownloadUrl = buildTicketDownloadUrl(docResult.downloadToken);
          await prisma.flightHoldActionHistory.create({
            data: {
              flightHoldId: existing.id,
              actionType: 'DOCUMENT_UPLOADED',
              details: `E-Ticket PDF "${input.pdfFileName || `Ticket-${existing.pnr}.pdf`}" securely attached to PNR ${existing.pnr} by ${staff.fullName}.`,
              performedByUserId: staff.id || null,
              performedByName: staff.fullName,
              performedByRole: staff.role,
            },
          });
        } else {
          notificationWarnings.push(`PDF Attachment Error: ${docResult.error || 'Failed to validate PDF'}`);
        }
      } catch (pdfErr: any) {
        console.error('[Ticket PDF Storage Error]:', pdfErr);
        notificationWarnings.push(`Could not attach PDF document: ${pdfErr.message || 'Storage error'}`);
      }
    } else if (existing.ticketDocuments?.length > 0) {
      ticketDownloadUrl = buildTicketDownloadUrl(existing.ticketDocuments[0].downloadToken);
    }

    // 5. Build Flight Details Object for Passenger Communications
    const flightDetails: TicketFlightDetails = {
      pnr: existing.pnr,
      airlineTicketNumber: input.airlineTicketNumber?.trim() || existing.airlineTicketNumber || undefined,
      passengerName: existing.passengerName || 'Valued Guest',
      passengerEmail: effectivePassengerEmail || undefined,
      passengerPhone: existing.passengerPhone,
      airline: effectiveAirline || undefined,
      flightNumber: effectiveFlightNumber || undefined,
      travelRoute: existing.travelRoute || undefined,
      origin: effectiveOrigin || undefined,
      destination: effectiveDestination || undefined,
      departureDateTime: parsedDepartureDateTime || undefined,
      departureTimezone: effectiveDepartureTz,
      pdfDownloadUrl: ticketDownloadUrl || undefined,
      pdfAttachmentBase64: ticketPdfBuffer ? ticketPdfBuffer.toString('base64') : undefined,
      pdfFileName: input.pdfFileName || (ticketPdfBuffer ? `Ticket-${existing.pnr}.pdf` : undefined),
    };

    // 6. Customer Confirmation Dispatch (Email & WhatsApp, isolated non-blocking)
    const shouldSendEmail = Boolean(input.sendEmailNotification && effectivePassengerEmail);
    const shouldSendWhatsApp = Boolean(input.sendWhatsAppNotification && existing.passengerPhone);

    if (shouldSendEmail || shouldSendWhatsApp) {
      try {
        const dispatchResult = await dispatchTicketConfirmation({
          flightHoldId: existing.id,
          customerId: existing.customerId || undefined,
          details: flightDetails,
          sendEmail: shouldSendEmail,
          sendWhatsApp: shouldSendWhatsApp,
        });

        if (dispatchResult.emailError) {
          notificationWarnings.push(`Email Dispatch Warning: ${dispatchResult.emailError}`);
        }
        if (dispatchResult.whatsAppError) {
          notificationWarnings.push(`WhatsApp Dispatch Warning: ${dispatchResult.whatsAppError}`);
        }

        if (dispatchResult.emailDispatched || dispatchResult.whatsAppDispatched) {
          await prisma.flightHoldPNR.update({
            where: { id: existing.id },
            data: { customerNotificationSent: true },
          });
        }
      } catch (notifErr: any) {
        console.error('[Customer Notification Dispatch Error]:', notifErr);
        notificationWarnings.push(`Notification delivery encountered an error: ${notifErr.message}`);
      }
    }

    // 7. Schedule 24-Hour Departure Reminder (Isolated non-blocking)
    if (input.scheduleDepartureReminder && parsedDepartureDateTime) {
      try {
        const reminderResult = await schedule24HourDepartureReminder({
          flightHoldId: existing.id,
          customerId: existing.customerId || undefined,
          passengerName: flightDetails.passengerName,
          passengerEmail: flightDetails.passengerEmail,
          passengerPhone: flightDetails.passengerPhone,
          departureDateTime: parsedDepartureDateTime,
        });

        if (!reminderResult.scheduled) {
          notificationWarnings.push(`Departure Reminder Notice: ${reminderResult.reason}`);
        }
      } catch (remErr: any) {
        console.error('[Departure Reminder Scheduling Error]:', remErr);
        notificationWarnings.push(`Departure reminder scheduling notice: ${remErr.message}`);
      }
    }

    try {
      revalidatePath('/admin/bookings/flights');
    } catch {}

    return {
      success: true,
      data: updated,
      notificationWarnings: notificationWarnings.length > 0 ? notificationWarnings : undefined,
    };
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

    // 2. Dismiss any pending hold reminders
    await prisma.flightHoldReminder.updateMany({
      where: {
        flightHoldId: existing.id,
        status: 'PENDING',
      },
      data: {
        status: 'DISMISSED',
      },
    });

    // 3. Cancel any pending passenger departure reminders
    await prisma.passengerNotification.updateMany({
      where: {
        flightHoldId: existing.id,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
        failureReason: 'Hold cancelled before departure reminder trigger',
      },
    });

    // 4. Log history
    await prisma.flightHoldActionHistory.create({
      data: {
        flightHoldId: existing.id,
        actionType: 'CANCELLED',
        details: `Hold for PNR ${existing.pnr} marked CANCELLED by ${staff.fullName} at ${formatIST24(now)} IST. Reason: ${reason}`,
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
// 8. UPDATE HOLD CONTACT ACTION
// ==========================================
export interface UpdateFlightHoldContactInput {
  id: string;
  passengerPhone: string;
  passengerEmail?: string;
  passengerName?: string;
  internalNotes?: string;
}

export async function updateFlightHoldContactAction(input: UpdateFlightHoldContactInput) {
  try {
    const staff = await getStaffUser();

    const existing = await prisma.flightHoldPNR.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      return { success: false, error: 'Flight Hold record not found' };
    }

    const cleanPhone = input.passengerPhone?.trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      return { success: false, error: 'Passenger Contact Number is mandatory (minimum 7 digits)' };
    }

    const cleanEmail = input.passengerEmail !== undefined ? input.passengerEmail.trim().toLowerCase() : undefined;
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return { success: false, error: 'Please enter a valid passenger email address' };
    }

    const prevPhone = existing.passengerPhone || 'Not set';
    const prevEmail = existing.passengerEmail || 'Not set';

    const updated = await prisma.flightHoldPNR.update({
      where: { id: existing.id },
      data: {
        passengerPhone: cleanPhone,
        passengerEmail: cleanEmail !== undefined ? (cleanEmail || null) : existing.passengerEmail,
        passengerName: input.passengerName !== undefined ? input.passengerName?.trim() || null : existing.passengerName,
        internalNotes: input.internalNotes !== undefined ? input.internalNotes?.trim() || null : existing.internalNotes,
      },
    });

    const emailChangeMsg = cleanEmail !== undefined && cleanEmail !== existing.passengerEmail
      ? `, Email: ${prevEmail} → ${cleanEmail || 'None'}`
      : '';

    await prisma.flightHoldActionHistory.create({
      data: {
        flightHoldId: existing.id,
        actionType: 'EDITED',
        details: `Passenger contact details updated by ${staff.fullName} at ${formatIST24(new Date())} IST. Contact: ${prevPhone} → ${cleanPhone}${emailChangeMsg}${input.passengerName ? `, Name: ${input.passengerName}` : ''}.`,
        performedByUserId: staff.id || null,
        performedByName: staff.fullName,
        performedByRole: staff.role,
        metadata: {
          previousPhone: prevPhone,
          newPhone: cleanPhone,
          previousEmail: prevEmail,
          newEmail: cleanEmail,
        },
      },
    });

    try {
      revalidatePath('/admin/bookings/flights');
    } catch {}
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[updateFlightHoldContactAction error]:', error);
    return { success: false, error: error.message || 'Failed to update contact details' };
  }
}

// ==========================================
// 9. AUTO-RELEASE & REMINDER TRIGGER RUNNER
// ==========================================
export async function runFlightHoldSchedulerAction() {
  try {
    const now = new Date();

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
          details: `Hold automatically marked as RELEASED_NO_ACTION at ${formatIST24(now)} IST because the deadline (${formatIST24(hold.holdTillDateTime)} IST) passed without action. Note: This indicates internal system queue status and does not automatically confirm release on airline/GDS platform.`,
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

    // B. Trigger Pending 10-Hour Reminders (Staff Internal)
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
          details: `10-hour urgent issuance alert triggered for PNR ${reminder.flightHold.pnr}. Deadline is within 10 hours (${formatIST24(reminder.flightHold.holdTillDateTime)} IST).`,
          performedByName: 'Issuance Reminder System',
          performedByRole: 'SYSTEM_SCHEDULER',
        },
      });

      remindersTriggeredCount++;
    }

    // C. Trigger Pending 24-Hour Passenger Departure Reminders (Customer Facing)
    const duePassengerReminders = await prisma.passengerNotification.findMany({
      where: {
        status: 'PENDING',
        type: 'DEPARTURE_REMINDER_24H',
        scheduledFor: { lte: now },
      },
      include: {
        flightHold: {
          include: {
            ticketDocuments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    let passengerRemindersTriggeredCount = 0;
    for (const notif of duePassengerReminders) {
      const hold = notif.flightHold;
      if (!hold || hold.status !== 'ISSUED') {
        // If hold cancelled or released, cancel the notification
        await prisma.passengerNotification.update({
          where: { id: notif.id },
          data: {
            status: 'CANCELLED',
            failureReason: `Flight hold status is ${hold?.status || 'NOT_FOUND'}`,
          },
        });
        continue;
      }

      const ticketDownloadUrl = hold.ticketDocuments?.[0]?.downloadToken
        ? buildTicketDownloadUrl(hold.ticketDocuments[0].downloadToken)
        : undefined;

      const flightDetails: TicketFlightDetails = {
        pnr: hold.pnr,
        airlineTicketNumber: hold.airlineTicketNumber || undefined,
        passengerName: hold.passengerName || 'Valued Guest',
        passengerEmail: hold.passengerEmail || undefined,
        passengerPhone: hold.passengerPhone,
        airline: hold.airline || undefined,
        flightNumber: hold.flightNumber || undefined,
        travelRoute: hold.travelRoute || undefined,
        origin: hold.originAirport || undefined,
        destination: hold.destinationAirport || undefined,
        departureDateTime: hold.departureDateTime || undefined,
        departureTimezone: hold.departureTimezone || 'Asia/Kolkata',
        pdfDownloadUrl: ticketDownloadUrl,
      };

      try {
        if (notif.channel === 'EMAIL' && notif.recipientEmail) {
          const emailHtml = buildDepartureReminderEmailHtml(flightDetails);
          const emailResult = await sendCustomerEmail({
            to: notif.recipientEmail,
            toName: flightDetails.passengerName,
            subject: `Departure Reminder: Flight ${flightDetails.flightNumber || flightDetails.pnr} departs in 24 Hours – Varni Holidays`,
            customHtml: emailHtml,
          });

          if (emailResult.success) {
            await prisma.passengerNotification.update({
              where: { id: notif.id },
              data: {
                status: 'SENT',
                sentAt: new Date(),
                providerMessageId: emailResult.messageId || null,
              },
            });
            passengerRemindersTriggeredCount++;
          } else {
            await prisma.passengerNotification.update({
              where: { id: notif.id },
              data: {
                status: 'FAILED',
                failedAt: new Date(),
                failureReason: emailResult.error || 'Email dispatch failed',
                retryCount: { increment: 1 },
              },
            });
          }
        } else if (notif.channel === 'WHATSAPP' && notif.recipientPhone) {
          const waText = buildDepartureReminderWhatsAppText(flightDetails);
          const waResult = await sendCustomerWhatsApp({
            phoneNumber: notif.recipientPhone,
            recipientName: flightDetails.passengerName,
            category: 'FLIGHT_CONFIRMED',
            messageText: waText,
          });

          if (waResult.success) {
            await prisma.passengerNotification.update({
              where: { id: notif.id },
              data: {
                status: 'SENT',
                sentAt: new Date(),
                providerMessageId: waResult.messageId || null,
              },
            });
            passengerRemindersTriggeredCount++;
          } else {
            await prisma.passengerNotification.update({
              where: { id: notif.id },
              data: {
                status: 'FAILED',
                failedAt: new Date(),
                failureReason: waResult.error || 'WhatsApp dispatch failed',
                retryCount: { increment: 1 },
              },
            });
          }
        }
      } catch (err: any) {
        console.error(`[Scheduler departure reminder error for notif ${notif.id}]:`, err);
        await prisma.passengerNotification.update({
          where: { id: notif.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            failureReason: err.message || 'Unknown processing error',
            retryCount: { increment: 1 },
          },
        });
      }
    }

    try {
      revalidatePath('/admin/bookings/flights');
    } catch {}
    return {
      success: true,
      data: {
        autoReleasedCount,
        remindersTriggeredCount,
        passengerRemindersTriggeredCount,
        processedAt: now.toISOString(),
      },
    };
  } catch (error: any) {
    console.error('[runFlightHoldSchedulerAction error]:', error);
    return { success: false, error: error.message || 'Scheduler failed' };
  }
}
