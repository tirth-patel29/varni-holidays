'use server';

import fs from 'fs';
import path from 'path';
import { crmRepo } from '@/lib/crm/store';
import {
  VisaApplicationRecord,
  VisaApplicationStatusCode,
  VisaDocumentRecord,
} from '@/lib/crm/types';
import { VISA_EMAIL_TEMPLATES, renderVisaEmail } from '@/lib/visa/templates';
import { sendCustomerEmail } from '@/lib/integrations/email-service';
import { DEFAULT_USERS } from '@/lib/auth/session';

// Secure Document Vault Root
const isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
);
const VAULT_ROOT = isServerless ? path.join('/tmp', 'varni_vault') : path.join(process.cwd(), 'data', 'vault');

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
    const app = crmRepo.getVisaApplicationById(payload.visaApplicationId);
    if (!app) {
      return { success: false, error: 'Visa application not found' };
    }

    if (!payload.fileName || !payload.fileDataUrl) {
      return { success: false, error: 'File name and file content are required' };
    }

    const actor =
      DEFAULT_USERS.find((u) => u.id === payload.actorId) ||
      DEFAULT_USERS.find((u) => u.id === 'usr-ananya-joshi-visa') ||
      DEFAULT_USERS[0];

    // Compute accurate MIME type and file size
    let mimeType = payload.mimeType;
    if (!mimeType || mimeType === 'application/octet-stream') {
      const ext = path.extname(payload.fileName).toLowerCase();
      if (ext === '.pdf') mimeType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else mimeType = 'application/pdf';
    }

    const base64Data = payload.fileDataUrl.includes('base64,')
      ? payload.fileDataUrl.split('base64,')[1]
      : payload.fileDataUrl;

    const computedSize =
      payload.fileSize && payload.fileSize > 0
        ? payload.fileSize
        : Math.round((base64Data.length * 3) / 4);

    // Save physical file copy into secure vault directory on server
    let savedFilePath: string | undefined = undefined;
    try {
      const appVaultDir = path.join(VAULT_ROOT, payload.visaApplicationId);
      if (!fs.existsSync(appVaultDir)) {
        fs.mkdirSync(appVaultDir, { recursive: true });
      }
      const safeName = `${Date.now()}_${payload.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      savedFilePath = path.join(appVaultDir, safeName);
      fs.writeFileSync(savedFilePath, Buffer.from(base64Data, 'base64'));
    } catch (fsErr) {
      console.warn('[Vault Disk Storage Warning]:', fsErr);
    }

    // Auto-verify approved visa uploads by authorized staff
    const isApprovedVisa = payload.documentType === 'APPROVED_VISA';

    const doc = crmRepo.addVisaDocument({
      visaApplicationId: payload.visaApplicationId,
      documentType: payload.documentType,
      fileName: payload.fileName,
      fileSize: computedSize,
      mimeType,
      fileDataUrl: payload.fileDataUrl,
      filePath: savedFilePath,
      isVerified: isApprovedVisa,
      verifiedAt: isApprovedVisa ? new Date().toISOString() : null,
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
  selectedDocumentId?: string;
  actorId?: string;
}) {
  try {
    const app = crmRepo.getVisaApplicationById(payload.applicationId);
    if (!app) {
      return { success: false, error: 'Visa application not found' };
    }

    const actor =
      DEFAULT_USERS.find((u) => u.id === payload.actorId) ||
      DEFAULT_USERS.find((u) => u.id === app.assignedUserId) ||
      DEFAULT_USERS[0];

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
      // Find verified APPROVED_VISA documents for this specific application
      const docs = crmRepo.getVisaDocuments(app.id);
      const approvedDocs = docs.filter((d) => d.documentType === 'APPROVED_VISA');

      if (approvedDocs.length === 0) {
        return {
          success: false,
          error: 'No approved visa document found in vault for this dossier. Please upload one first.',
        };
      }

      // Security check: verify selected document belongs to this application
      let targetDoc: VisaDocumentRecord | undefined;
      if (payload.selectedDocumentId) {
        targetDoc = approvedDocs.find((d) => d.id === payload.selectedDocumentId);
        if (!targetDoc) {
          return {
            success: false,
            error: 'Selected document is not an authorized approved visa document for this dossier.',
          };
        }
      } else {
        // Default to latest approved visa document
        targetDoc = approvedDocs[approvedDocs.length - 1];
      }

      // Retrieve binary content securely
      let base64Data = '';
      if (targetDoc.fileDataUrl) {
        base64Data = targetDoc.fileDataUrl.includes('base64,')
          ? targetDoc.fileDataUrl.split('base64,')[1]
          : targetDoc.fileDataUrl;
      } else if (targetDoc.filePath && fs.existsSync(targetDoc.filePath)) {
        base64Data = fs.readFileSync(targetDoc.filePath).toString('base64');
      }

      if (!base64Data) {
        return {
          success: false,
          error: `Document "${targetDoc.fileName}" content is empty or unreadable in vault.`,
        };
      }

      // Validate attachment size (< 10 MB)
      const approxBytes = Math.round((base64Data.length * 3) / 4);
      if (approxBytes > 10 * 1024 * 1024) {
        return {
          success: false,
          error: `Document attachment (${Math.round(approxBytes / 1024 / 1024)} MB) exceeds maximum allowed size of 10 MB.`,
        };
      }

      attachments.push({
        filename: targetDoc.fileName || `Official_Approved_Visa_${app.destinationCountry}.pdf`,
        content: base64Data,
      });
      attachmentNames.push(targetDoc.fileName);
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

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error || 'Failed to dispatch email via Resend.',
        log,
      };
    }

    return {
      success: true,
      messageId: sendResult.messageId,
      providerStatus: sendResult.providerStatus,
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
