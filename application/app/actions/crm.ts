'use server';

import { crmRepo } from '@/lib/crm/store';
import { DEFAULT_USERS, getUserSession } from '@/lib/auth/session';
import { PipelineStageCode, PriorityLevelCode, ServiceTypeCode } from '@/lib/auth/types';

// Helper to resolve current user name
function getUserName(userId: string): string {
  const user = DEFAULT_USERS.find((u) => u.id === userId);
  return user ? user.fullName : 'System Employee';
}

function getUserEmail(userId: string): string {
  const user = DEFAULT_USERS.find((u) => u.id === userId);
  return user ? user.email : 'system@varniholidays.com';
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
  return crmRepo.getLeads(filters);
}

export async function getLeadByIdAction(id: string) {
  return crmRepo.getLeadById(id);
}

export async function getLeadActivitiesAction(leadId: string) {
  return crmRepo.getActivitiesForLead(leadId);
}

export async function updateLeadStageAction(
  leadId: string,
  newStage: PipelineStageCode,
  reasonNotes?: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  const lead = crmRepo.getLeadById(leadId);
  if (!lead) return { success: false, error: 'Lead not found' };

  const oldStage = lead.stage;
  lead.stage = newStage;

  if (newStage === 'CLOSED') {
    lead.closedAt = new Date().toISOString();
    lead.closeReason = reasonNotes || 'Closed / Archived';
  } else if (newStage === 'CONVERTED') {
    lead.closeReason = 'Converted to Confirmed Booking';
  }

  crmRepo.saveLead(lead);

  // Add Lead Activity
  crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'STAGE_CHANGE',
    title: `Stage Changed: ${oldStage} → ${newStage}`,
    description: reasonNotes
      ? `Transitioned from ${oldStage} to ${newStage}. Notes: ${reasonNotes}`
      : `Transitioned pipeline stage from ${oldStage} to ${newStage}.`,
    metadata: {
      fromStage: oldStage,
      toStage: newStage,
    },
  });

  // Audit Log
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

export async function assignLeadAction(
  leadId: string,
  newAssigneeId: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  const lead = crmRepo.getLeadById(leadId);
  if (!lead) return { success: false, error: 'Lead not found' };

  const oldAssigneeName = lead.assigneeName;
  const newAssignee = DEFAULT_USERS.find((u) => u.id === newAssigneeId);
  const newAssigneeName = newAssignee ? newAssignee.fullName : 'Unassigned';

  lead.assignedUserId = newAssigneeId === 'UNASSIGNED' ? null : newAssigneeId;
  crmRepo.saveLead(lead);

  crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'ASSIGNMENT',
    title: `Lead Reassigned: ${newAssigneeName}`,
    description: `Assigned responsibility from ${oldAssigneeName} to ${newAssigneeName}.`,
    metadata: {
      previousAssignee: oldAssigneeName,
      newAssignee: newAssigneeName,
    },
  });

  crmRepo.addAuditLog({
    userId: currentUserId,
    userEmail: getUserEmail(currentUserId),
    action: 'LEAD_REASSIGNED',
    entityType: 'LEAD',
    entityId: leadId,
    details: `Reassigned lead ${lead.referenceId} to ${newAssigneeName}.`,
    ipAddress: 'Internal Desk',
  });

  return { success: true, lead };
}

export async function updateLeadPriorityAction(
  leadId: string,
  newPriority: PriorityLevelCode,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  const lead = crmRepo.getLeadById(leadId);
  if (!lead) return { success: false, error: 'Lead not found' };

  const oldPriority = lead.priorityLevel;
  lead.priorityLevel = newPriority;
  crmRepo.saveLead(lead);

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
  const activity = crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'CALL',
    title: `Call Logged: ${outcome} (${Math.round(durationSeconds / 60)} min)`,
    description: notes,
    metadata: {
      callDurationSeconds: durationSeconds,
      callOutcome: outcome,
    },
  });

  return { success: true, activity };
}

export async function logEmailActivityAction(
  leadId: string,
  subject: string,
  body: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  const activity = crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'EMAIL',
    title: `Email Dispatched: ${subject}`,
    description: body,
    metadata: {
      emailSubject: subject,
    },
  });

  return { success: true, activity };
}

/**
 * STRICT REQUIREMENT FROM PHASE 0 REVIEW:
 * WhatsApp click-to-chat opens https://wa.me/ on the agent's workstation.
 * It provides NO delivery receipt from Meta.
 * It must NEVER be recorded as DELIVERED; it must be recorded as CLICK_TO_CHAT_TRIGGERED.
 */
export async function recordWhatsAppClickAction(
  leadId: string,
  customerPhone: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
  const activity = crmRepo.addActivity({
    leadId,
    userId: currentUserId,
    userName: getUserName(currentUserId),
    type: 'WHATSAPP_CLICK',
    title: 'WhatsApp Click-to-Chat Launched',
    description: `Agent launched WhatsApp Web chat with customer at ${customerPhone}. (Note: Click event launched on agent workstation; not an automated delivery receipt).`,
    metadata: {
      whatsappStatus: 'CLICK_TO_CHAT_TRIGGERED',
    },
  });

  return { success: true, activity };
}

export async function addGeneralNoteAction(
  leadId: string,
  noteText: string,
  currentUserId: string = 'usr-neel-patel-superadmin'
) {
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
  return crmRepo.getCustomers();
}

export async function getCustomerByIdAction(id: string) {
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

  if (newStatus === 'ACCEPTED') {
    // Automatically advance lead to CONVERTED
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
