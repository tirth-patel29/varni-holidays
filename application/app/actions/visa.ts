'use server';

import { crmRepo } from '@/lib/crm/store';
import {
  VisaApplicationRecord,
  VisaApplicationStatusCode,
  VisaDocumentRecord,
} from '@/lib/crm/types';
import { VISA_EMAIL_TEMPLATES, renderVisaEmail } from '@/lib/visa/templates';
import { sendCustomerEmail } from '@/lib/integrations/email-service';
import { DEFAULT_USERS } from '@/lib/auth/session';

export async function getVisaDashboardAction(filters?: {
  status?: VisaApplicationStatusCode;
  search?: string;
  country?: string;
  assignedUserId?: string;
}) {
  try {
    const applications = crmRepo.getVisaApplications(filters);
    const stats = crmRepo.getVisaDashboardStats();

    return {
      success: true,
      applications,
      stats,
    };
  } catch (err: any) {
    console.error('getVisaDashboardAction error:', err);
    return {
      success: false,
      error: err.message || 'Failed to fetch visa applications',
      applications: [],
      stats: {
        total: 0,
        counts: {} as any,
        activeProcessing: 0,
        approvedCount: 0,
        recentApplications: [],
      },
    };
  }
}

export async function getVisaApplicationDetailsAction(id: string) {
  try {
    const application = crmRepo.getVisaApplicationById(id);
    if (!application) {
      return { success: false, error: 'Visa application not found' };
    }

    const statusHistory = crmRepo.getVisaStatusHistory(id);
    const documents = crmRepo.getVisaDocuments(id);
    const communicationLogs = crmRepo.getVisaCommunicationLogs(id);

    return {
      success: true,
      application,
      statusHistory,
      documents,
      communicationLogs,
    };
  } catch (err: any) {
    console.error('getVisaApplicationDetailsAction error:', err);
    return { success: false, error: err.message || 'Failed to fetch visa dossier' };
  }
}

export async function createVisaApplicationAction(
  payload: Partial<VisaApplicationRecord>,
  actorId: string = 'usr-ananya-joshi-visa'
) {
  try {
    if (!payload.customerName || !payload.destinationCountry || !payload.visaType) {
      return { success: false, error: 'Customer name, destination country, and visa type are required.' };
    }

    // Auto-create or link customer if email/phone provided
    let customerId = payload.customerId;
    if (!customerId && (payload.customerEmail || payload.customerPhone)) {
      const existing = crmRepo.findCustomerByPhoneOrEmail(
        payload.customerPhone || '',
        payload.customerEmail || ''
      );

      if (existing) {
        customerId = existing.id;
      } else {
        const createdCustomer = crmRepo.createCustomer({
          fullName: payload.customerName,
          phoneNumber: payload.customerPhone || '9999999999',
          email: payload.customerEmail || '',
        });
        customerId = createdCustomer.id;
      }
    }

    const application = crmRepo.createVisaApplication(
      {
        ...payload,
        customerId: customerId || 'cust-direct',
      },
      actorId
    );

    return {
      success: true,
      application,
    };
  } catch (err: any) {
    console.error('createVisaApplicationAction error:', err);
    return { success: false, error: err.message || 'Failed to register visa inquiry' };
  }
}

export async function updateVisaStatusAction(
  id: string,
  newStatus: VisaApplicationStatusCode,
  notes?: string,
  officialRef?: string,
  actorId: string = 'usr-ananya-joshi-visa'
) {
  try {
    const updated = crmRepo.updateVisaApplicationStatus(id, newStatus, actorId, notes, officialRef);
    if (!updated) {
      return { success: false, error: 'Visa application not found' };
    }

    return {
      success: true,
      application: updated,
    };
  } catch (err: any) {
    console.error('updateVisaStatusAction error:', err);
    return { success: false, error: err.message || 'Failed to update status' };
  }
}

export async function uploadVisaDocumentAction(payload: {
  visaApplicationId: string;
  documentType: 'PASSPORT_FRONT' | 'PASSPORT_BACK' | 'PHOTO' | 'FINANCIAL_PROOF' | 'EMPLOYMENT_PROOF' | 'APPROVED_VISA' | 'OTHER';
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  fileDataUrl?: string;
  actorId?: string;
}) {
  try {
    const actor = DEFAULT_USERS.find((u) => u.id === payload.actorId) || DEFAULT_USERS.find((u) => u.id === 'usr-ananya-joshi-visa') || DEFAULT_USERS[0];

    const doc = crmRepo.addVisaDocument({
      visaApplicationId: payload.visaApplicationId,
      documentType: payload.documentType,
      fileName: payload.fileName,
      fileSize: payload.fileSize || 0,
      mimeType: payload.mimeType || 'application/pdf',
      fileDataUrl: payload.fileDataUrl || '',
      isVerified: false,
      uploadedByUserId: actor.id,
      uploadedByName: actor.fullName,
    });

    return {
      success: true,
      document: doc,
    };
  } catch (err: any) {
    console.error('uploadVisaDocumentAction error:', err);
    return { success: false, error: err.message || 'Failed to record document' };
  }
}

export async function verifyVisaDocumentAction(
  docId: string,
  isVerified: boolean,
  actorId: string = 'usr-ananya-joshi-visa'
) {
  try {
    const doc = crmRepo.verifyVisaDocument(docId, isVerified, actorId);
    if (!doc) {
      return { success: false, error: 'Document not found' };
    }
    return { success: true, document: doc };
  } catch (err: any) {
    console.error('verifyVisaDocumentAction error:', err);
    return { success: false, error: err.message || 'Failed to verify document' };
  }
}

export async function sendVisaEmailAction(payload: {
  applicationId: string;
  templateCode: string;
  recipientEmail: string;
  subject: string;
  customMessage?: string;
  attachApprovedVisa?: boolean;
  actorId?: string;
}) {
  try {
    const app = crmRepo.getVisaApplicationById(payload.applicationId);
    if (!app) {
      return { success: false, error: 'Visa application not found' };
    }

    const actor = DEFAULT_USERS.find((u) => u.id === payload.actorId) || DEFAULT_USERS.find((u) => u.id === app.assignedUserId) || DEFAULT_USERS[0];

    // Context preparation
    const context = {
      customer_name: app.customerName,
      customer_email: payload.recipientEmail,
      customer_phone: app.customerPhone,
      destination_country: app.destinationCountry,
      visa_type: app.visaType,
      application_reference: app.applicationReference,
      official_reference: app.officialReferenceNo || 'Under Consular File Allocation',
      inquiry_date: app.inquiryDate,
      document_received_date: app.documentReceivedDate || app.createdAt,
      submission_date: app.submissionDate || app.updatedAt,
      approval_date: app.decisionDate || new Date().toISOString(),
      decision_date: app.decisionDate || new Date().toISOString(),
      employee_name: actor.fullName,
      employee_email: actor.email,
      employee_phone: actor.phone,
    };

    const rendered = renderVisaEmail(payload.templateCode, context, payload.customMessage);

    // Attachments handling
    const attachments: Array<{ filename: string; content: string }> = [];
    const attachmentNames: string[] = [];

    if (payload.attachApprovedVisa) {
      // Find verified APPROVED_VISA document
      const docs = crmRepo.getVisaDocuments(app.id);
      const approvedDoc = docs.find((d) => d.documentType === 'APPROVED_VISA' && d.fileDataUrl);

      if (approvedDoc && approvedDoc.fileDataUrl) {
        // Remove data URL prefix if present
        const base64Data = approvedDoc.fileDataUrl.includes('base64,')
          ? approvedDoc.fileDataUrl.split('base64,')[1]
          : approvedDoc.fileDataUrl;

        attachments.push({
          filename: approvedDoc.fileName || `Official_Visa_${app.destinationCountry}.pdf`,
          content: base64Data,
        });
        attachmentNames.push(approvedDoc.fileName);
      }
    }

    // Dispatch via Resend
    const sendResult = await sendCustomerEmail({
      to: payload.recipientEmail,
      toName: app.customerName,
      subject: payload.subject || rendered.subject,
      customHtml: rendered.html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    // Record in communication log
    const log = crmRepo.addVisaCommunicationLog({
      visaApplicationId: app.id,
      applicationReference: app.applicationReference,
      templateCode: payload.templateCode,
      recipientEmail: payload.recipientEmail,
      recipientName: app.customerName,
      subject: payload.subject || rendered.subject,
      messageHtml: rendered.html,
      messageText: rendered.text,
      status: sendResult.success ? (sendResult.providerStatus === 'SIMULATED' ? 'SIMULATED' : 'SENT') : 'FAILED',
      resendMessageId: sendResult.messageId || null,
      errorMessage: sendResult.error || null,
      attachmentNames,
      sentByUserId: actor.id,
      sentByName: actor.fullName,
    });

    return {
      success: sendResult.success,
      messageId: sendResult.messageId,
      providerStatus: sendResult.providerStatus,
      error: sendResult.error,
      log,
    };
  } catch (err: any) {
    console.error('sendVisaEmailAction error:', err);
    return { success: false, error: err.message || 'Failed to dispatch visa email' };
  }
}

export async function getVisaTemplatesAction() {
  return {
    success: true,
    templates: Object.values(VISA_EMAIL_TEMPLATES),
  };
}

export async function searchCustomersForVisaAction(query: string) {
  try {
    if (!query || query.trim().length < 2) return { success: true, customers: [] };
    const q = query.toLowerCase().trim();
    const customers = crmRepo.getCustomers()
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phoneNumber && c.phoneNumber.includes(q))
      )
      .slice(0, 8);

    return { success: true, customers };
  } catch (err: any) {
    return { success: false, customers: [] };
  }
}
