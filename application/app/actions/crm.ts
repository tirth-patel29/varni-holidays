'use server';

import { prisma } from '@/lib/prisma';
import { crmRepo } from '@/lib/crm/store';
import { DEFAULT_USERS } from '@/lib/auth/session';
import { PipelineStageCode, PriorityLevelCode, ServiceTypeCode } from '@/lib/auth/types';
import {
  CustomerRecord,
  LeadRecord,
  PackageEnquiryData,
  FlightEnquiryData,
  VisaEnquiryData,
  CustomHolidayData,
  TravelInsuranceData,
} from '@/lib/crm/types';
import { processSyncQueueAction } from '@/app/actions/google-sheets';

// Helper to resolve current user name
function getUserName(userId: string): string {
  const user = DEFAULT_USERS.find((u) => u.id === userId);
  return user ? user.fullName : 'System Employee';
}

function getUserEmail(userId: string): string {
  const user = DEFAULT_USERS.find((u) => u.id === userId);
  return user ? user.email : 'system@varniholidays.com';
}

function mapPrismaLeadToCrm(dbLead: any): LeadRecord & { customer: CustomerRecord; assigneeName?: string } {
  const assignee = DEFAULT_USERS.find((u) => u.id === dbLead.assignedUserId) ||
                   (dbLead.assignedTo ? { fullName: dbLead.assignedTo.fullName, id: dbLead.assignedTo.id } : undefined);

  let packageDetail: PackageEnquiryData | undefined;
  if (dbLead.packageDetail) {
    const pd = dbLead.packageDetail;
    const priceSnap = pd.priceSnapshotJson && typeof pd.priceSnapshotJson === 'object' ? pd.priceSnapshotJson : {};
    
    let hotelTier: 'STANDARD' | 'DELUXE' | 'SUPER_DELUXE' | 'PREMIUM' | 'LUXURY' = 'DELUXE';
    const combinedStr = `${pd.rateBasis || ''} ${JSON.stringify(priceSnap)}`.toUpperCase();
    if (combinedStr.includes('LUXURY')) hotelTier = 'LUXURY';
    else if (combinedStr.includes('PREMIUM')) hotelTier = 'PREMIUM';
    else if (combinedStr.includes('SUPER_DELUXE') || combinedStr.includes('SUPER DELUXE')) hotelTier = 'SUPER_DELUXE';
    else if (combinedStr.includes('STANDARD')) hotelTier = 'STANDARD';

    packageDetail = {
      packageSlug: pd.package?.slug || 'kerala-6n7d-winter',
      packageName: pd.package?.title || 'Kerala 6N/7D Winter CPAI',
      hotelTier,
      adultsCount: pd.adultsCount || 2,
      childrenWithBedCount: pd.childrenWithBedCount || 0,
      childrenNoBedCount: pd.childrenNoBedCount || 0,
      roomsCount: pd.roomsCount || 1,
      preferredTravelDate: pd.preferredTravelDate ? new Date(pd.preferredTravelDate).toISOString().split('T')[0] : null,
      includeHouseboatUpgrade: Boolean(priceSnap.houseboatUpgradeAmount),
      includeMealPlan: Boolean(priceSnap.mealPlanAmount),
      includeAthirapillyTrip: Boolean(priceSnap.dayTripsAmount),
      includeKanyakumariTrip: false,
      pricingStatus: pd.pricingStatus || 'EXACT_MATCH',
      quotedUnitPriceInr: pd.quotedUnitPriceInr ? Number(pd.quotedUnitPriceInr) : null,
      quotedTotalPriceInr: pd.quotedTotalPriceInr ? Number(pd.quotedTotalPriceInr) : null,
      vehicleAssigned: pd.vehicleType || 'AC Sedan (Dzire / Etios)',
    };
  }

  let flightDetail: FlightEnquiryData | undefined;
  if (dbLead.flightDetail) {
    const fd = dbLead.flightDetail;
    flightDetail = {
      tripType: fd.tripType || 'ONE_WAY',
      originAirport: fd.originAirport || '',
      destinationAirport: fd.destinationAirport || '',
      departureDate: fd.departureDate ? new Date(fd.departureDate).toISOString().split('T')[0] : '',
      returnDate: fd.returnDate ? new Date(fd.returnDate).toISOString().split('T')[0] : null,
      adultsCount: fd.adultsCount || 1,
      childrenCount: fd.childrenCount || 0,
      infantsCount: fd.infantsCount || 0,
      cabinClass: fd.cabinClass || 'ECONOMY',
      specialRequirements: fd.specialRequirements || undefined,
      mealPreferenceCode: fd.mealPreferenceCode || undefined,
      mealPreferenceDescription: fd.mealPreferenceDescription || undefined,
      wheelchairAssistanceCode: fd.wheelchairAssistanceCode || undefined,
      wheelchairAssistanceDescription: fd.wheelchairAssistanceDescription || undefined,
    };
  }

  let visaDetail: VisaEnquiryData | undefined;
  if (dbLead.visaDetail) {
    const vd = dbLead.visaDetail;
    visaDetail = {
      destinationCountry: vd.destinationCountry || '',
      otherCountryName: vd.otherCountryName || undefined,
      visaCategory: vd.visaCategory || 'TOURIST',
      visaType: vd.visaType || undefined,
      travelPurpose: vd.travelPurpose || undefined,
      applicantNationality: vd.applicantNationality || 'Indian',
      residenceCountry: vd.residenceCountry || 'India',
      plannedTravelDate: vd.plannedTravelDate ? new Date(vd.plannedTravelDate).toISOString().split('T')[0] : null,
      stayDurationDays: vd.stayDurationDays || null,
      applicantCount: vd.applicantCount || 1,
      specialCircumstances: vd.specialCircumstances || undefined,
    };
  }

  let customHolidayDetail: CustomHolidayData | undefined;
  if (dbLead.customHolidayDetail) {
    const cd = dbLead.customHolidayDetail;
    customHolidayDetail = {
      departureDate: cd.departureDate ? new Date(cd.departureDate).toISOString().split('T')[0] : '',
      returnDate: cd.returnDate ? new Date(cd.returnDate).toISOString().split('T')[0] : '',
      destinations: cd.destinations || '',
      adultsCount: cd.adultsCount || 2,
      childrenCount: cd.childrenCount || 0,
      infantsCount: cd.infantsCount || 0,
      mealPlan: cd.mealPlan || 'CPAI',
      hotelCategory: cd.hotelCategory || 'FOUR_STAR',
      transferType: cd.transferType || 'PRIVATE',
      specialRequirements: cd.specialRequirements || null,
      needVisa: cd.needVisa ?? false,
      needFlights: cd.needFlights ?? false,
      needInsurance: cd.needInsurance ?? false,
      confirmedFlightDetails: cd.confirmedFlightDetails || null,
      confirmedHotelDetails: cd.confirmedHotelDetails || null,
      confirmedVisaDetails: cd.confirmedVisaDetails || null,
      invoiceReference: cd.invoiceReference || null,
      itineraryNotes: cd.itineraryNotes || null,
    };
  }

  let insuranceDetail: TravelInsuranceData | undefined;
  if (dbLead.insuranceDetail) {
    const idData = dbLead.insuranceDetail;
    insuranceDetail = {
      departureDate: idData.departureDate ? new Date(idData.departureDate).toISOString().split('T')[0] : '',
      destinationCountry: idData.destinationCountry || '',
      dateOfBirth: idData.dateOfBirth ? new Date(idData.dateOfBirth).toISOString().split('T')[0] : '',
      hasPreExistingDisease: idData.hasPreExistingDisease ?? false,
      preExistingDiseaseDetails: idData.preExistingDiseaseDetails || null,
      consentGiven: idData.consentGiven ?? true,
    };
  }

  const customer: CustomerRecord = {
    id: dbLead.customer?.id || dbLead.customerId,
    fullName: dbLead.customer?.fullName || 'Unknown Customer',
    email: dbLead.customer?.email || null,
    phoneCountryCode: dbLead.customer?.phoneCountryCode || '+91',
    phoneNumber: dbLead.customer?.phoneNumber || '',
    normalizedPhone: dbLead.customer?.normalizedPhone || '',
    normalizedEmail: dbLead.customer?.normalizedEmail || null,
    city: dbLead.customer?.city || 'Anand, Gujarat',
    duplicateWarning: dbLead.customer?.duplicateWarning || false,
    duplicateNotes: dbLead.customer?.duplicateNotes || undefined,
    isDeleted: dbLead.customer?.isDeleted || false,
    createdAt: dbLead.customer?.createdAt ? new Date(dbLead.customer.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: dbLead.customer?.updatedAt ? new Date(dbLead.customer.updatedAt).toISOString() : new Date().toISOString(),
  };

  return {
    id: dbLead.id,
    referenceId: dbLead.referenceId,
    serviceType: dbLead.serviceType,
    stage: dbLead.stage,
    priorityLevel: dbLead.priorityLevel,
    source: dbLead.source,
    customerId: dbLead.customerId,
    assignedUserId: dbLead.assignedUserId || null,
    assigneeName: assignee ? assignee.fullName : 'Unassigned',
    packageDetail,
    flightDetail,
    visaDetail,
    customHolidayDetail,
    insuranceDetail,
    closeReason: dbLead.closeReason,
    closedAt: dbLead.closedAt ? new Date(dbLead.closedAt).toISOString() : null,
    isDeleted: dbLead.isDeleted || false,
    createdAt: new Date(dbLead.createdAt).toISOString(),
    updatedAt: new Date(dbLead.updatedAt).toISOString(),
    customer,
  };
}

// ----------------------------------------------------
// 1. LEADS & PIPELINE ACTIONS
// ----------------------------------------------------
export async function getLeadsAction(filters?: {
  serviceType?: string;
  stage?: string;
  priority?: string;
  assignedUserId?: string;
  search?: string;
}) {
  try {
    const whereClause: any = { isDeleted: false };
    if (filters?.serviceType && filters.serviceType !== 'ALL') {
      whereClause.serviceType = filters.serviceType;
    }
    if (filters?.stage && filters.stage !== 'ALL') {
      whereClause.stage = filters.stage;
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      whereClause.priorityLevel = filters.priority;
    }
    if (filters?.assignedUserId && filters.assignedUserId !== 'ALL') {
      whereClause.assignedUserId = filters.assignedUserId;
    }

    const dbLeads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        customer: true,
        assignedTo: true,
        packageDetail: { include: { package: true } },
        flightDetail: true,
        visaDetail: true,
        customHolidayDetail: true,
        insuranceDetail: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbLeads && dbLeads.length > 0) {
      let mapped = dbLeads.map(mapPrismaLeadToCrm);

      if (filters?.search) {
        const query = filters.search.toLowerCase().trim();
        mapped = mapped.filter(
          (l) =>
            l.referenceId.toLowerCase().includes(query) ||
            l.customer.fullName.toLowerCase().includes(query) ||
            l.customer.phoneNumber.includes(query) ||
            (l.customer.email && l.customer.email.toLowerCase().includes(query))
        );
      }
      return mapped;
    }
  } catch (err) {
    console.warn('Prisma getLeadsAction fallback to crmRepo:', err);
  }

  return crmRepo.getLeads(filters);
}

export async function getLeadByIdAction(id: string) {
  try {
    // 1. Try finding by ID or ReferenceID in Prisma
    let dbLead = await prisma.lead.findFirst({
      where: {
        OR: [
          { id: id },
          { referenceId: id },
        ],
      },
      include: {
        customer: true,
        assignedTo: true,
        packageDetail: { include: { package: true } },
        flightDetail: true,
        visaDetail: true,
        customHolidayDetail: true,
        insuranceDetail: true,
      },
    });

    // 2. If not found and ID is a synthetic timestamp ID like "lead-1793812222776-705"
    if (!dbLead && id.startsWith('lead-')) {
      const fallbackLead = crmRepo.getLeadById(id);
      if (fallbackLead?.referenceId) {
        dbLead = await prisma.lead.findFirst({
          where: { referenceId: fallbackLead.referenceId },
          include: {
            customer: true,
            assignedTo: true,
            packageDetail: { include: { package: true } },
            flightDetail: true,
            visaDetail: true,
            customHolidayDetail: true,
            insuranceDetail: true,
          },
        });
      }

      if (!dbLead) {
        const parts = id.split('-');
        if (parts.length >= 2 && !isNaN(Number(parts[1]))) {
          const ts = Number(parts[1]);
          const minTime = new Date(ts - 1800000); // 30 min before
          const maxTime = new Date(ts + 1800000); // 30 min after
          const candidates = await prisma.lead.findMany({
            where: {
              createdAt: {
                gte: minTime,
                lte: maxTime,
              },
            },
            include: {
              customer: true,
              assignedTo: true,
              packageDetail: { include: { package: true } },
              flightDetail: true,
              visaDetail: true,
              customHolidayDetail: true,
              insuranceDetail: true,
            },
          });
          if (candidates.length > 0) {
            candidates.sort((a, b) => Math.abs(a.createdAt.getTime() - ts) - Math.abs(b.createdAt.getTime() - ts));
            dbLead = candidates[0];
          }
        }
      }
    }

    if (dbLead) {
      return mapPrismaLeadToCrm(dbLead);
    }
  } catch (err) {
    console.warn('Prisma getLeadByIdAction fallback to crmRepo:', err);
  }

  return crmRepo.getLeadById(id);
}

export async function getLeadActivitiesAction(leadId: string) {
  try {
    const dbLead = await prisma.lead.findFirst({
      where: {
        OR: [
          { id: leadId },
          { referenceId: leadId },
        ],
      },
    });

    const targetId = dbLead ? dbLead.id : leadId;

    const activities = await prisma.leadActivity.findMany({
      where: { leadId: targetId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    if (activities && activities.length > 0) {
      return activities.map((a) => ({
        id: a.id,
        leadId: a.leadId,
        userId: a.userId,
        userName: a.user?.fullName || 'System Staff',
        type: a.activityType,
        title: a.summary,
        description: a.details,
        createdAt: a.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Prisma getLeadActivitiesAction error:', err);
  }

  return crmRepo.getActivitiesForLead(leadId);
}

export async function updateLeadStageAction(
  leadId: string,
  newStage: PipelineStageCode,
  reasonNotes?: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  // Sync to Prisma if available
  try {
    const dbLead = await prisma.lead.findFirst({
      where: { OR: [{ id: leadId }, { referenceId: leadId }] },
    });
    if (dbLead) {
      await prisma.lead.update({
        where: { id: dbLead.id },
        data: {
          stage: newStage as any,
          closeReason: newStage === 'CLOSED' ? (reasonNotes || 'Closed / Archived') : newStage === 'CONVERTED' ? 'Converted to Confirmed Booking' : undefined,
          closedAt: newStage === 'CLOSED' ? new Date() : undefined,
        },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: dbLead.id,
          userId: currentUserId,
          activityType: 'STAGE_CHANGE',
          summary: `Stage Changed: ${dbLead.stage} → ${newStage}`,
          details: reasonNotes || `Transitioned pipeline stage from ${dbLead.stage} to ${newStage}.`,
        },
      });
    }
  } catch (e) {
    console.warn('Prisma updateLeadStageAction error:', e);
  }

  const lead = crmRepo.getLeadById(leadId);
  if (lead) {
    const oldStage = lead.stage;
    lead.stage = newStage;

    if (newStage === 'CLOSED') {
      lead.closedAt = new Date().toISOString();
      lead.closeReason = reasonNotes || 'Closed / Archived';
    } else if (newStage === 'CONVERTED') {
      lead.closeReason = 'Converted to Confirmed Booking';
    }

    crmRepo.saveLead(lead);
    processSyncQueueAction().catch((e) => console.warn('Stage change Sheets sync err:', e));

    crmRepo.addActivity({
      leadId,
      userId: currentUserId,
      userName: getUserName(currentUserId),
      type: 'STAGE_CHANGE',
      title: `Stage Changed: ${oldStage} → ${newStage}`,
      description: reasonNotes
        ? `Transitioned from ${oldStage} to ${newStage}. Notes: ${reasonNotes}`
        : `Transitioned pipeline stage from ${oldStage} to ${newStage}.`,
      metadata: { fromStage: oldStage, toStage: newStage },
    });

    crmRepo.addAuditLog({
      userId: currentUserId,
      userEmail: getUserEmail(currentUserId),
      action: 'LEAD_STAGE_UPDATED',
      entityType: 'LEAD',
      entityId: leadId,
      details: `Updated stage from ${oldStage} to ${newStage} for reference ${lead.referenceId}.`,
      ipAddress: 'Internal Desk',
    });

    return { success: true, lead };
  }

  return { success: true };
}

export async function assignLeadAction(
  leadId: string,
  newAssigneeId: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  try {
    const dbLead = await prisma.lead.findFirst({
      where: { OR: [{ id: leadId }, { referenceId: leadId }] },
    });
    if (dbLead) {
      await prisma.lead.update({
        where: { id: dbLead.id },
        data: { assignedUserId: newAssigneeId === 'UNASSIGNED' ? null : newAssigneeId },
      });
    }
  } catch (e) {
    console.warn('Prisma assignLeadAction error:', e);
  }

  const lead = crmRepo.getLeadById(leadId);
  if (lead) {
    const oldAssigneeName = lead.assigneeName;
    const newAssignee = DEFAULT_USERS.find((u) => u.id === newAssigneeId);
    const newAssigneeName = newAssignee ? newAssignee.fullName : 'Unassigned';

    lead.assignedUserId = newAssigneeId === 'UNASSIGNED' ? null : newAssigneeId;
    crmRepo.saveLead(lead);
    processSyncQueueAction().catch((e) => console.warn('Stage change Sheets sync err:', e));

    crmRepo.addActivity({
      leadId,
      userId: currentUserId,
      userName: getUserName(currentUserId),
      type: 'ASSIGNMENT',
      title: `Lead Reassigned: ${newAssigneeName}`,
      description: `Assigned responsibility from ${oldAssigneeName} to ${newAssigneeName}.`,
      metadata: { previousAssignee: oldAssigneeName, newAssignee: newAssigneeName },
    });

    return { success: true, lead };
  }

  return { success: true };
}

export async function updateLeadPriorityAction(
  leadId: string,
  newPriority: PriorityLevelCode,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  try {
    const dbLead = await prisma.lead.findFirst({
      where: { OR: [{ id: leadId }, { referenceId: leadId }] },
    });
    if (dbLead) {
      await prisma.lead.update({
        where: { id: dbLead.id },
        data: { priorityLevel: newPriority as any },
      });
    }
  } catch (e) {
    console.warn('Prisma updateLeadPriorityAction error:', e);
  }

  const lead = crmRepo.getLeadById(leadId);
  if (lead) {
    const oldPriority = lead.priorityLevel;
    lead.priorityLevel = newPriority;
    crmRepo.saveLead(lead);
    processSyncQueueAction().catch((e) => console.warn('Stage change Sheets sync err:', e));

    crmRepo.addActivity({
      leadId,
      userId: currentUserId,
      userName: getUserName(currentUserId),
      type: 'NOTE',
      title: `Priority Updated to ${newPriority}`,
      description: `Priority shifted from ${oldPriority} to ${newPriority}.`,
    });

    return { success: true, lead };
  }

  return { success: true };
}

// ----------------------------------------------------
// 2. INTERACTION & ACTIVITY LOGGING
// ----------------------------------------------------
export async function logCallActivityAction(
  leadId: string,
  durationSeconds: number,
  outcome: 'CONNECTED' | 'BUSY' | 'UNANSWERED' | 'CALLBACK_REQUESTED',
  notes: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  try {
    const dbLead = await prisma.lead.findFirst({
      where: { OR: [{ id: leadId }, { referenceId: leadId }] },
    });
    if (dbLead) {
      await prisma.leadActivity.create({
        data: {
          leadId: dbLead.id,
          userId: currentUserId,
          activityType: 'CALL',
          summary: `Call Logged: ${outcome} (${Math.round(durationSeconds / 60)} min)`,
          details: notes,
          callOutcome: (outcome === 'CONNECTED' ? 'ANSWERED' : outcome === 'UNANSWERED' ? 'NO_ANSWER' : outcome) as any,
        },
      });
    }
  } catch (e) {
    console.warn('Prisma logCallActivityAction error:', e);
  }

  const activity = crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'CALL',
    title: `Call Logged: ${outcome} (${Math.round(durationSeconds / 60)} min)`,
    description: notes,
    metadata: { callDurationSeconds: durationSeconds, callOutcome: outcome },
  });

  return { success: true, activity };
}

export async function logEmailActivityAction(
  leadId: string,
  subject: string,
  body: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  try {
    const dbLead = await prisma.lead.findFirst({
      where: { OR: [{ id: leadId }, { referenceId: leadId }] },
    });
    if (dbLead) {
      await prisma.leadActivity.create({
        data: {
          leadId: dbLead.id,
          userId: currentUserId,
          activityType: 'EMAIL',
          summary: `Email Dispatched: ${subject}`,
          details: body,
        },
      });
    }
  } catch (e) {
    console.warn('Prisma logEmailActivityAction error:', e);
  }

  const activity = crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'EMAIL',
    title: `Email Dispatched: ${subject}`,
    description: body,
    metadata: { emailSubject: subject },
  });

  return { success: true, activity };
}

export async function recordWhatsAppClickAction(
  leadId: string,
  customerPhone: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  try {
    const dbLead = await prisma.lead.findFirst({
      where: { OR: [{ id: leadId }, { referenceId: leadId }] },
    });
    if (dbLead) {
      await prisma.leadActivity.create({
        data: {
          leadId: dbLead.id,
          userId: currentUserId,
          activityType: 'WHATSAPP',
          summary: 'WhatsApp Click-to-Chat Launched',
          details: `Agent launched WhatsApp chat with customer at ${customerPhone}. (Triggered on workstation).`,
        },
      });
    }
  } catch (e) {
    console.warn('Prisma recordWhatsAppClickAction error:', e);
  }

  const activity = crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'WHATSAPP_CLICK',
    title: 'WhatsApp Click-to-Chat Launched',
    description: `Agent launched WhatsApp Web chat with customer at ${customerPhone}. (Note: Click event launched on agent workstation; not an automated delivery receipt).`,
    metadata: { whatsappStatus: 'CLICK_TO_CHAT_TRIGGERED' },
  });

  return { success: true, activity };
}

export async function addGeneralNoteAction(
  leadId: string,
  noteText: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  try {
    const dbLead = await prisma.lead.findFirst({
      where: { OR: [{ id: leadId }, { referenceId: leadId }] },
    });
    if (dbLead) {
      await prisma.leadActivity.create({
        data: {
          leadId: dbLead.id,
          userId: currentUserId,
          activityType: 'INTERNAL_NOTE',
          summary: 'Internal Note Added',
          details: noteText,
        },
      });
    }
  } catch (e) {
    console.warn('Prisma addGeneralNoteAction error:', e);
  }

  const activity = crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'NOTE',
    title: 'Internal Note Added',
    description: noteText,
  });

  return { success: true, activity };
}

// ----------------------------------------------------
// 3. FOLLOW-UPS
// ----------------------------------------------------
export async function getFollowUpsAction(filters?: { userId?: string; status?: string }) {
  return crmRepo.getFollowUps(filters);
}

export async function createFollowUpAction(
  leadId: string,
  scheduledAt: string,
  note: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  const followUp = crmRepo.addFollowUp({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    scheduledAt,
    note,
    status: 'PENDING',
  });

  crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'NOTE',
    title: `Follow-Up Scheduled: ${new Date(scheduledAt).toLocaleString('en-IN')}`,
    description: note,
  });

  return { success: true, followUp };
}

export async function completeFollowUpAction(followUpId: string) {
  const success = crmRepo.completeFollowUp(followUpId);
  return { success };
}

// ----------------------------------------------------
// 4. CUSTOMER PROFILE & DEDUPLICATION / MERGING
// ----------------------------------------------------
export async function getCustomersAction() {
  try {
    const dbCustomers = await prisma.customer.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    if (dbCustomers && dbCustomers.length > 0) {
      return dbCustomers.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phoneCountryCode: c.phoneCountryCode,
        phoneNumber: c.phoneNumber,
        normalizedPhone: c.normalizedPhone,
        normalizedEmail: c.normalizedEmail,
        city: c.city || 'Anand, Gujarat',
        duplicateWarning: c.duplicateWarning,
        duplicateNotes: c.duplicateNotes || undefined,
        isDeleted: c.isDeleted,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));
    }
  } catch (e) {
    console.warn('Prisma getCustomersAction fallback:', e);
  }
  return crmRepo.getCustomers();
}

export async function getCustomerByIdAction(id: string) {
  try {
    const c = await prisma.customer.findUnique({ where: { id } });
    if (c) {
      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phoneCountryCode: c.phoneCountryCode,
        phoneNumber: c.phoneNumber,
        normalizedPhone: c.normalizedPhone,
        normalizedEmail: c.normalizedEmail,
        city: c.city || 'Anand, Gujarat',
        duplicateWarning: c.duplicateWarning,
        duplicateNotes: c.duplicateNotes || undefined,
        isDeleted: c.isDeleted,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    }
  } catch (e) {
    console.warn('Prisma getCustomerByIdAction fallback:', e);
  }
  return crmRepo.getCustomerById(id);
}

export async function getPotentialDuplicatesAction() {
  return crmRepo.findPotentialDuplicates();
}

export async function mergeCustomersAction(
  primaryId: string,
  subordinateId: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  const result = crmRepo.mergeCustomers(
    primaryId,
    subordinateId,
    currentUserId,
    getUserEmail(currentUserId)
  );
  return result;
}

// ----------------------------------------------------
// 5. QUOTATIONS
// ----------------------------------------------------
export async function getQuotationsAction(leadId?: string) {
  try {
    let whereClause: any = { isDeleted: false };
    if (leadId) {
      const dbLead = await prisma.lead.findFirst({
        where: { OR: [{ id: leadId }, { referenceId: leadId }] },
      });
      whereClause.leadId = dbLead ? dbLead.id : leadId;
    }
    const dbQuotations = await prisma.quotation.findMany({
      where: whereClause,
      include: {
        customer: true,
        createdByUser: true,
        lineItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (dbQuotations && dbQuotations.length > 0) {
      return dbQuotations.map((q) => {
        const snap = q.pricingSnapshotJson as any;
        return {
          id: q.id,
          quotationNumber: q.quotationReference,
          leadId: q.leadId,
          customerId: q.customerId,
          createdByUserId: q.createdByUserId,
          createdByName: q.createdByUser?.fullName || 'Neel Patel',
          status: q.status,
          title: snap?.title || q.customerNotes || 'Travel Proposal',
          subtotalInr: Number(q.subtotalAmountInr),
          taxesInr: Number(q.taxAmountInr),
          discountInr: Number(q.discountAmountInr),
          totalAmountInr: Number(q.totalAmountInr),
          validUntil: q.validUntil.toISOString(),
          terms: q.termsAndConditions || '',
          inclusions: snap?.inclusions || [],
          exclusions: snap?.exclusions || [],
          customerNotes: q.customerNotes || '',
          internalNotes: q.internalNotes || '',
          createdAt: q.createdAt.toISOString(),
          lineItems: q.lineItems.map((li) => ({
            id: li.id,
            itemOrder: li.itemOrder,
            serviceCategory: li.serviceType,
            description: li.title || li.description || '',
            quantity: li.quantity,
            unitPriceInr: Number(li.unitPriceInr),
            totalPriceInr: Number(li.totalPriceInr),
          })),
        };
      });
    }
  } catch (err) {
    console.warn('Prisma getQuotationsAction fallback:', err);
  }
  return crmRepo.getQuotations(leadId);
}

export async function updateQuotationStatusAction(
  quotationId: string,
  newStatus: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED',
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  const quotations = crmRepo.getQuotations();
  const quote = quotations.find((q) => q.id === quotationId);
  if (!quote) return { success: false, error: 'Quotation not found' };

  quote.status = newStatus;
  crmRepo.saveQuotation(quote);
  processSyncQueueAction().catch((e) => console.warn('Quotation status Sheets sync err:', e));

  if (newStatus === 'ACCEPTED') {
    await updateLeadStageAction(quote.leadId, 'CONVERTED', `Quotation ${quote.quotationNumber} accepted by customer.`, currentUserId);
  }

  return { success: true, quote };
}

// ----------------------------------------------------
// 6. DASHBOARD, AUDIT & PACKAGE GOVERNANCE
// ----------------------------------------------------
export async function getDashboardMetricsAction() {
  return crmRepo.getDashboardMetrics();
}

export async function getAuditLogsAction() {
  return crmRepo.getAuditLogs();
}

export async function getPackageCostsAction() {
  return crmRepo.getPackageCosts();
}
