'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
import {
  getVisaApplicationDetailsAction,
  updateVisaStatusAction,
  uploadVisaDocumentAction,
  verifyVisaDocumentAction,
  sendVisaEmailAction,
} from '@/app/actions/visa';
import {
  VisaApplicationRecord,
  VisaApplicationStatusCode,
  VisaDocumentRecord,
  VisaStatusHistoryRecord,
  VisaCommunicationLogRecord,
} from '@/lib/crm/types';
import { VISA_EMAIL_TEMPLATES, renderVisaEmail, formatVisaDate } from '@/lib/visa/templates';
import { DEFAULT_USERS } from '@/lib/auth/session';
import {
  FileText,
  User,
  MapPin,
  Calendar,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Eye,
  Mail,
  Upload,
  Check,
  X,
  RotateCw,
  Paperclip,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  FileCheck,
} from 'lucide-react';

const ALL_STATUSES: { code: VisaApplicationStatusCode; label: string; stepNumber: number }[] = [
  { code: 'INQUIRY_RECEIVED', label: '1. Inquiry Received', stepNumber: 1 },
  { code: 'DOCUMENTS_RECEIVED', label: '2. Docs Received', stepNumber: 2 },
  { code: 'DOCUMENTS_UNDER_REVIEW', label: '3. Docs Review', stepNumber: 3 },
  { code: 'FILE_SUBMITTED', label: '4. File Submitted', stepNumber: 4 },
  { code: 'UNDER_PROCESSING', label: '5. Under Processing', stepNumber: 5 },
  { code: 'ADDITIONAL_INFORMATION_REQUIRED', label: '6. Action Required', stepNumber: 6 },
  { code: 'VISA_APPROVED', label: '7. Visa Approved', stepNumber: 7 },
  { code: 'VISA_REJECTED', label: '7. Visa Rejected', stepNumber: 7 },
  { code: 'COMPLETED', label: '8. Completed', stepNumber: 8 },
];

export default function VisaApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = params.id as string;

  // Data State
  const [app, setApp] = useState<VisaApplicationRecord | null>(null);
  const [statusHistory, setStatusHistory] = useState<VisaStatusHistoryRecord[]>([]);
  const [documents, setDocuments] = useState<VisaDocumentRecord[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<VisaCommunicationLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Status Update State
  const [newStatus, setNewStatus] = useState<VisaApplicationStatusCode>('INQUIRY_RECEIVED');
  const [statusNotes, setStatusNotes] = useState('');
  const [officialRefInput, setOfficialRefInput] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Unified Single-Modal Architecture: strictly one primary dialog active at a time
  type ActiveModalType = 'NONE' | 'EMAIL_COMPOSER' | 'CONFIRM_SEND' | 'DOCUMENT_UPLOAD' | 'VIEW_LOG';
  const [activeModal, setActiveModal] = useState<ActiveModalType>('NONE');
  const [viewLogRecord, setViewLogRecord] = useState<VisaCommunicationLogRecord | null>(null);

  // Document Upload State (for Standalone Vault Upload)
  const [docType, setDocType] = useState<VisaDocumentRecord['documentType']>('PASSPORT_FRONT');
  const [docFileName, setDocFileName] = useState('');
  const [docFileDataUrl, setDocFileDataUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Email Composer Modal State
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>('INQUIRY_RECEIVED');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [customCounselorMessage, setCustomCounselorMessage] = useState('');
  const [attachApprovedVisa, setAttachApprovedVisa] = useState(false);
  const [selectedApprovedDocId, setSelectedApprovedDocId] = useState<string>('');
  const [activePreviewTab, setActivePreviewTab] = useState<'HTML' | 'TEXT'>('HTML');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Inline Approved Visa Upload State (within Email Composer)
  const [inlineFileName, setInlineFileName] = useState('');
  const [inlineFileDataUrl, setInlineFileDataUrl] = useState('');
  const [uploadingInlineDoc, setUploadingInlineDoc] = useState(false);

  // Prevent background body scrolling while any modal dialog is active
  useEffect(() => {
    if (activeModal !== 'NONE') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeModal]);

  // Support Escape key to close or step-back modals cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal === 'CONFIRM_SEND') {
          setActiveModal('EMAIL_COMPOSER'); // step back to composer without losing work
        } else if (activeModal !== 'NONE') {
          setActiveModal('NONE');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const loadDossier = async () => {
    setLoading(true);
    try {
      const res = await getVisaApplicationDetailsAction(applicationId);
      if (res.success && res.application) {
        setApp(res.application);
        setStatusHistory(res.statusHistory || []);
        setDocuments(res.documents || []);
        setCommunicationLogs(res.communicationLogs || []);
        setNewStatus(res.application.status);
        setOfficialRefInput(res.application.officialReferenceNo || '');
        setRecipientEmail(res.application.customerEmail || '');

        // Auto-match template to status if requested via query parameter
        if (searchParams.get('tab') === 'email') {
          setActiveModal('EMAIL_COMPOSER');
        }
      } else {
        setFeedback({ type: 'error', text: res.error || 'Dossier not found' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDossier();
  }, [applicationId]);

  // When email modal opens or template changes, re-render preview
  useEffect(() => {
    if (!app) return;
    const rendered = renderVisaEmail(
      selectedTemplateCode,
      {
        customer_name: app.customerName,
        customer_email: recipientEmail || app.customerEmail,
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
        employee_name: app.assignedUserName || 'Ananya Joshi',
        employee_phone: app.assignedUserPhone || '+91 94260 45678',
      },
      customCounselorMessage
    );
    setEmailSubject(rendered.subject);
  }, [selectedTemplateCode, app, recipientEmail, customCounselorMessage]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;

    if (newStatus === app.status && !officialRefInput.trim()) {
      setFeedback({ type: 'info', text: 'Status is already set to ' + newStatus });
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await updateVisaStatusAction(
        app.id,
        newStatus,
        statusNotes.trim() || undefined,
        officialRefInput.trim() || undefined,
        app.assignedUserId || 'usr-ananya-joshi-visa'
      );

      if (res.success && res.application) {
        setFeedback({
          type: 'success',
          text: `Application status transitioned to ${newStatus}.`,
        });
        setStatusNotes('');
        await loadDossier();

        // Prompt to send corresponding email template if appropriate
        if (
          ['DOCUMENTS_RECEIVED', 'FILE_SUBMITTED', 'VISA_APPROVED', 'ADDITIONAL_INFORMATION_REQUIRED', 'VISA_REJECTED', 'COMPLETED'].includes(
            newStatus
          )
        ) {
          setSelectedTemplateCode(newStatus);
          setActiveModal('EMAIL_COMPOSER');
        }
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to update status' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDocFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !docFileName) return;

    setUploadingDoc(true);
    try {
      const res = await uploadVisaDocumentAction({
        visaApplicationId: app.id,
        documentType: docType,
        fileName: docFileName,
        fileDataUrl: docFileDataUrl,
        actorId: app.assignedUserId || 'usr-ananya-joshi-visa',
      });

      if (res.success) {
        setFeedback({ type: 'success', text: `Document ${docFileName} added to vault.` });
        setActiveModal('NONE');
        setDocFileName('');
        setDocFileDataUrl('');
        await loadDossier();
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to upload document' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleToggleVerifyDoc = async (docId: string, currentVerified: boolean) => {
    try {
      const res = await verifyVisaDocumentAction(docId, !currentVerified);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: !currentVerified ? 'Document marked as verified.' : 'Document verification revoked.',
        });
        await loadDossier();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  // Inline Approved Visa file selection & upload (directly inside Email Composer)
  const handleInlineFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInlineFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setInlineFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInlineUploadApprovedVisa = async () => {
    if (!app || !inlineFileName || !inlineFileDataUrl) return;
    setUploadingInlineDoc(true);
    try {
      const res = await uploadVisaDocumentAction({
        visaApplicationId: app.id,
        documentType: 'APPROVED_VISA',
        fileName: inlineFileName,
        fileDataUrl: inlineFileDataUrl,
        actorId: app.assignedUserId || 'usr-ananya-joshi-visa',
      });

      if (res.success && res.document) {
        setFeedback({
          type: 'success',
          text: `Official Approved Visa (${inlineFileName}) saved to vault & auto-attached.`,
        });
        setInlineFileName('');
        setInlineFileDataUrl('');
        await loadDossier();
        setSelectedApprovedDocId(res.document.id);
        setAttachApprovedVisa(true);
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to upload approved visa' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setUploadingInlineDoc(false);
    }
  };

  const handleDispatchEmail = async () => {
    if (!app || !recipientEmail.trim()) return;

    setSendingEmail(true);
    try {
      const docToAttach = attachApprovedVisa
        ? selectedApprovedDocId || documents.find((d) => d.documentType === 'APPROVED_VISA')?.id
        : undefined;

      const res = await sendVisaEmailAction({
        applicationId: app.id,
        templateCode: selectedTemplateCode,
        recipientEmail: recipientEmail.trim(),
        subject: emailSubject,
        customMessage: customCounselorMessage.trim() || undefined,
        attachApprovedVisa,
        selectedDocumentId: docToAttach,
        actorId: app.assignedUserId || 'usr-ananya-joshi-visa',
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: `Email dispatched successfully via Resend to ${recipientEmail}. Log recorded.`,
        });
        setActiveModal('NONE');
        setCustomCounselorMessage('');
        await loadDossier();
      } else {
        setFeedback({
          type: 'error',
          text: `Email delivery failed: ${res.error || 'Check Resend credentials'}`,
        });
        // Return to composer so employee can review and re-dispatch
        setActiveModal('EMAIL_COMPOSER');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
      setActiveModal('EMAIL_COMPOSER');
    } finally {
      setSendingEmail(false);
    }
  };

  // Filter all approved visa documents in vault
  const approvedVisaDocs = documents.filter((d) => d.documentType === 'APPROVED_VISA');
  const selectedApprovedDoc =
    approvedVisaDocs.find((d) => d.id === selectedApprovedDocId) || approvedVisaDocs[0];

  // Auto-sync selection when approved visa documents become available
  useEffect(() => {
    if (approvedVisaDocs.length > 0) {
      if (!selectedApprovedDocId || !approvedVisaDocs.some((d) => d.id === selectedApprovedDocId)) {
        setSelectedApprovedDocId(approvedVisaDocs[0].id);
        setAttachApprovedVisa(true);
      }
    }
  }, [documents, selectedApprovedDocId]);

  if (loading && !app) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#F7F8FA]">
        <div className="text-center space-y-2">
          <RotateCw size={24} className="animate-spin text-[#24689B] mx-auto" />
          <p className="text-xs text-[#718096] font-semibold">Loading visa dossier...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-8 text-center bg-[#F7F8FA]">
        <p className="text-sm font-bold text-[#D54747]">Dossier not found</p>
        <Link href="/admin/communications/visa" className="text-xs text-[#24689B] underline mt-2 block">
          Return to Visa Applications
        </Link>
      </div>
    );
  }


  // Preview generation
  const emailPreview = renderVisaEmail(
    selectedTemplateCode,
    {
      customer_name: app.customerName,
      customer_email: recipientEmail || app.customerEmail,
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
      employee_name: app.assignedUserName || 'Ananya Joshi',
      employee_phone: app.assignedUserPhone || '+91 94260 45678',
    },
    customCounselorMessage
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <Breadcrumbs
          items={[
            { label: 'Communications', href: '/admin/communications' },
            { label: 'Visa Management', href: '/admin/communications/visa' },
            { label: app.applicationReference },
          ]}
        />

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 border rounded-none text-xs font-semibold flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                : feedback.type === 'error'
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
            }`}
          >
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="hover:opacity-75">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 rounded-none shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-[#E9B95E] inline-block" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                  Official Dossier #{app.applicationReference}
                </span>
              </div>
              <h1 className="font-headline text-2xl font-bold text-[#153650]">
                {app.customerName} — {app.destinationCountry}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#718096] mt-1.5">
                <span className="font-semibold text-[#153650]">{app.visaType}</span>
                <span>•</span>
                <span>Contact: {app.customerPhone}</span>
                {app.customerEmail && (
                  <>
                    <span>•</span>
                    <span>{app.customerEmail}</span>
                  </>
                )}
                <span>•</span>
                <span>Officer: {app.assignedUserName || 'Ananya Joshi'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveModal('EMAIL_COMPOSER')}
                className="px-4 py-2 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Mail size={13} className="text-[#E9B95E]" />
                <span>Send Visa Email</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('DOCUMENT_UPLOAD')}
                className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#153650] border border-[#E5E8ED] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Upload size={13} className="text-[#24689B]" />
                <span>Upload Document</span>
              </button>

              <Link
                href="/admin/communications/visa"
                className="px-3 py-2 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#718096] border border-[#E5E8ED] text-xs font-semibold rounded-none inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </Link>
            </div>
          </div>

          {/* Interactive Milestone Progress Bar */}
          <div className="pt-6 overflow-x-auto crm-scrollbar">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold mb-3">
              Application Lifecycle Milestones
            </div>
            <div className="flex items-center justify-between min-w-[720px] relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E5E8ED] -translate-y-1/2 z-0" />
              {ALL_STATUSES.slice(0, 8).map((st, idx) => {
                const isCurrent = app.status === st.code;
                const isPast =
                  statusHistory.some((h) => h.toStatus === st.code) ||
                  ALL_STATUSES.findIndex((s) => s.code === app.status) >= idx;

                return (
                  <div key={st.code} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                        isCurrent
                          ? 'bg-[#153650] text-[#FFFFFF] ring-4 ring-[#E9B95E]/40'
                          : isPast
                          ? 'bg-[#168653] text-[#FFFFFF]'
                          : 'bg-[#F1F3F5] text-[#A0AEC0] border border-[#E5E8ED]'
                      }`}
                    >
                      {isPast && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-2 text-center whitespace-nowrap ${
                        isCurrent ? 'text-[#153650]' : isPast ? 'text-[#168653]' : 'text-[#A0AEC0]'
                      }`}
                    >
                      {st.label.split('. ')[1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Dossier Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Lifecycle Timeline & Documents Vault */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Transition Control Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 rounded-none shadow-xs">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#24689B]" />
                  <h2 className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                    Update Application Status
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-[#718096]">
                  Current: <strong className="text-[#153650]">{app.status}</strong>
                </span>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                      New Status Transition
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-bold rounded-none focus:outline-none focus:border-[#24689B]"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                      Official Reference / Tracking No (e.g. VFS / Portal)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VFS-CAN-2026-9812"
                      value={officialRefInput}
                      onChange={(e) => setOfficialRefInput(e.target.value)}
                      className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-mono rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                    Transition Notes / Reason
                  </label>
                  <input
                    type="text"
                    placeholder="Enter audit notes for this status change..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-[#718096]">
                    Updating status appends an immutable entry to the timeline.
                  </div>
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors"
                  >
                    {updatingStatus ? (
                      <RotateCw size={13} className="animate-spin text-[#E9B95E]" />
                    ) : (
                      <Check size={13} className="text-[#E9B95E]" />
                    )}
                    <span>Apply Status Transition</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Document Vault Section */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 rounded-none shadow-xs">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck size={15} className="text-[#168653]" />
                  <h2 className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                    Document Vault & Verifications ({documents.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('DOCUMENT_UPLOAD')}
                  className="px-2.5 py-1 bg-[#F4F6F9] hover:bg-[#E5E8ED] text-[#153650] text-[11px] font-bold rounded-none inline-flex items-center gap-1 transition-colors"
                >
                  <Upload size={12} className="text-[#24689B]" />
                  <span>Upload File</span>
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#718096]">
                  No documents recorded in the vault yet. Click "Upload File" to record passports or approved visa scans.
                </div>
              ) : (
                <div className="divide-y divide-[#E5E8ED] border border-[#E5E8ED]">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                            doc.documentType === 'APPROVED_VISA'
                              ? 'bg-[#ECFDF5] text-[#168653]'
                              : 'bg-[#F4F6F9] text-[#24689B]'
                          }`}
                        >
                          <Paperclip size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-[#153650] truncate flex items-center gap-2">
                            <span>{doc.fileName}</span>
                            {doc.documentType === 'APPROVED_VISA' && (
                              <span className="px-1.5 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[9px] font-bold">
                                Official Visa Document
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#718096] flex items-center gap-2 mt-0.5">
                            <span>Type: {doc.documentType}</span>
                            <span>•</span>
                            <span>Uploaded by {doc.uploadedByName}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleVerifyDoc(doc.id, doc.isVerified)}
                          className={`px-2 py-1 text-[10px] font-bold border rounded-none transition-colors ${
                            doc.isVerified
                              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534] hover:bg-[#DCFCE7]'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#718096] hover:bg-[#E5E8ED]'
                          }`}
                        >
                          {doc.isVerified ? '✓ Verified' : 'Mark Verified'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 rounded-none shadow-xs">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#A0AEC0]" />
                  <h2 className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                    Status History & Audit Trail ({statusHistory.length})
                  </h2>
                </div>
                <span className="text-[11px] text-[#718096]">Chronological log</span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E8ED]">
                {statusHistory.map((h, i) => (
                  <div key={h.id} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#153650] ring-4 ring-[#FFFFFF]" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#153650]">{h.toStatus}</span>
                        {h.fromStatus && (
                          <span className="text-[10px] text-[#718096]">
                            (from {h.fromStatus})
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#A0AEC0]">
                          {new Date(h.createdAt).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4A5568] mt-0.5">{h.notes || 'Status updated.'}</p>
                      <div className="text-[10px] text-[#718096] mt-0.5">By {h.changedByName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Communication Logs & Dossier Metadata */}
          <div className="space-y-6">
            {/* Quick Email Dispatch Card */}
            <div className="bg-[#002037] text-[#FFFFFF] p-5 rounded-none shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E9B95E] font-bold block mb-1">
                Client Automation
              </span>
              <h3 className="font-headline text-lg font-bold">Dispatch Visa Email</h3>
              <p className="text-xs text-[#CBD5E1] mt-1 mb-4 leading-relaxed">
                Choose from 7 official consular templates. Merges applicant tokens and sends via Resend with delivery logging.
              </p>

              <button
                type="button"
                onClick={() => setActiveModal('EMAIL_COMPOSER')}
                className="w-full py-2.5 bg-[#E9B95E] hover:bg-[#D4A347] text-[#002037] font-bold text-xs rounded-none transition-colors inline-flex items-center justify-center gap-2"
              >
                <Mail size={14} />
                <span>Open Email Composer</span>
              </button>
            </div>

            {/* Dossier Summary Box */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 rounded-none shadow-xs space-y-3">
              <div className="border-b border-[#E5E8ED] pb-2 text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                Dossier Summary
              </div>

              <div className="text-xs space-y-2 text-[#4A5568]">
                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#718096]">Reference:</span>
                  <span className="font-mono font-bold text-[#153650]">{app.applicationReference}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#718096]">Official Portal Ref:</span>
                  <span className="font-mono text-[#153650]">{app.officialReferenceNo || 'None'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#718096]">Country:</span>
                  <span className="font-semibold text-[#153650]">{app.destinationCountry}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#718096]">Category:</span>
                  <span className="text-[#153650]">{app.visaCategory}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#718096]">Applicants:</span>
                  <span className="text-[#153650]">{app.applicantCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#718096]">Planned Travel:</span>
                  <span className="text-[#153650]">{formatVisaDate(app.travelPlannedDate)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#718096]">Assigned Officer:</span>
                  <span className="font-bold text-[#153650]">{app.assignedUserName || 'Ananya Joshi'}</span>
                </div>
              </div>
            </div>

            {/* Communication History & Email Logs */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 rounded-none shadow-xs">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-[#24689B]" />
                  <h2 className="text-xs font-bold text-[#153650] uppercase tracking-wider font-mono">
                    Email Logs ({communicationLogs.length})
                  </h2>
                </div>
                <span className="text-[11px] text-[#718096]">Sent history</span>
              </div>

              {communicationLogs.length === 0 ? (
                <div className="p-6 text-center bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#718096]">
                  Zero emails sent yet. Use the composer to dispatch your first update.
                </div>
              ) : (
                <div className="space-y-3">
                  {communicationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs space-y-1 hover:border-[#CBD5E1] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#153650] truncate">{log.subject}</span>
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded-none shrink-0 ${
                            log.status === 'SENT'
                              ? 'bg-[#F0FDF4] text-[#166534]'
                              : log.status === 'SIMULATED'
                              ? 'bg-[#EFF6FF] text-[#1E40AF]'
                              : 'bg-[#FEF2F2] text-[#991B1B]'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-[#718096] flex items-center justify-between">
                        <span>To: {log.recipientEmail}</span>
                        <span>{new Date(log.sentAt).toLocaleDateString('en-GB')}</span>
                      </div>

                      {log.attachmentNames && log.attachmentNames.length > 0 && (
                        <div className="text-[10px] text-[#168653] font-semibold flex items-center gap-1">
                          <Paperclip size={10} />
                          <span>Attached: {log.attachmentNames.join(', ')}</span>
                        </div>
                      )}

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-[#A0AEC0]">
                          ID: {log.resendMessageId ? log.resendMessageId.slice(0, 14) + '...' : 'LOCAL'}
                        </span>
                        <button
                          onClick={() => {
                            setViewLogRecord(log);
                            setActiveModal('VIEW_LOG');
                          }}
                          className="text-[10px] font-bold text-[#24689B] hover:underline"
                        >
                          View Email
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SINGLE-MODAL WORKFLOW ENGINE (Guaranteed 1 Active Dialog at any time)       */}
        {/* ========================================================================= */}

        {/* DIALOG 1: Standalone Vault Document Upload */}
        {activeModal === 'DOCUMENT_UPLOAD' && (
          <div className="fixed inset-0 z-50 bg-[#002037]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
                <h3 className="font-headline text-base font-bold text-[#153650]">
                  Upload Dossier Document
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal('NONE')}
                  className="text-[#718096] hover:text-[#153650]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveDocument} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-semibold rounded-none focus:outline-none focus:border-[#24689B]"
                  >
                    <option value="PASSPORT_FRONT">Passport Bio-Data (Front)</option>
                    <option value="PASSPORT_BACK">Passport Address (Back)</option>
                    <option value="PHOTO">Consular Spec Photo (White BG)</option>
                    <option value="FINANCIAL_PROOF">Bank Statement / ITR</option>
                    <option value="EMPLOYMENT_PROOF">Employment / Business Proof</option>
                    <option value="APPROVED_VISA">Official Approved Visa Document (PDF)</option>
                    <option value="OTHER">Supporting Letter / Affidavit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                    Select File (PDF / JPG / PNG)
                  </label>
                  <input
                    type="file"
                    required
                    onChange={handleFileUpload}
                    className="w-full text-xs text-[#718096] file:mr-3 file:py-1.5 file:px-3 file:border-0 file:bg-[#153650] file:text-[#FFFFFF] file:text-xs file:font-bold file:rounded-none hover:file:bg-[#24689B]"
                  />
                </div>

                {docFileName && (
                  <div className="p-2.5 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#153650]">
                    Selected: <strong>{docFileName}</strong>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E8ED]">
                  <button
                    type="button"
                    onClick={() => setActiveModal('NONE')}
                    className="px-3.5 py-1.5 text-xs text-[#718096] hover:text-[#153650]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingDoc || !docFileName}
                    className="px-4 py-2 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors inline-flex items-center gap-1.5"
                  >
                    {uploadingDoc ? (
                      <RotateCw size={13} className="animate-spin text-[#E9B95E]" />
                    ) : (
                      <Check size={13} className="text-[#E9B95E]" />
                    )}
                    <span>Save to Vault</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DIALOG 2: Official Visa Email Composer */}
        {activeModal === 'EMAIL_COMPOSER' && (
          <div className="fixed inset-0 z-50 bg-[#002037]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl rounded-none">
              {/* Fixed Header */}
              <div className="shrink-0 p-4 sm:p-5 border-b border-[#E5E8ED] flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-base sm:text-lg font-bold text-[#153650]">
                    Compose Official Visa Email
                  </h3>
                  <p className="text-xs text-[#718096]">
                    Template engine automatically populates customer, dossier, and counselor metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('NONE')}
                  className="p-1 text-[#718096] hover:text-[#153650] hover:bg-[#F1F5F9] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 crm-scrollbar">
                {/* Template Selector Strip */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1.5">
                    Select Official Email Template
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                    {Object.values(VISA_EMAIL_TEMPLATES).map((tmpl) => (
                      <button
                        key={tmpl.code}
                        type="button"
                        onClick={() => setSelectedTemplateCode(tmpl.code)}
                        className={`p-2 text-left border rounded-none text-xs transition-colors ${
                          selectedTemplateCode === tmpl.code
                            ? 'border-[#153650] bg-[#153650] text-[#FFFFFF]'
                            : 'border-[#E5E8ED] bg-[#F8FAFC] text-[#172B45] hover:bg-[#FFFFFF]'
                        }`}
                      >
                        <div className="font-bold truncate text-[11px]">
                          {tmpl.title.split(' — ')[1] || tmpl.title}
                        </div>
                        <div
                          className={`text-[9px] truncate ${
                            selectedTemplateCode === tmpl.code ? 'text-[#E9B95E]' : 'text-[#718096]'
                          }`}
                        >
                          {tmpl.code}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient and Subject Line Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                      Recipient Email Address <span className="text-[#D54747]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-semibold rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                      Email Subject Line <span className="text-[#D54747]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-semibold rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                    />
                  </div>
                </div>

                {/* Custom Counselor Message Note */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                    Optional Custom Counselor Note (Appended Safely)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add custom travel instructions, specific meeting times, or additional requirements..."
                    value={customCounselorMessage}
                    onChange={(e) => setCustomCounselorMessage(e.target.value)}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                  />
                </div>

                {/* Approved Visa Document Attachment & Vault Integration */}
                {selectedTemplateCode === 'VISA_APPROVED' && (
                  <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Paperclip size={16} className="text-[#168653] shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-[#166534] block">
                            Attach Official Approved Visa PDF from Vault
                          </span>
                          <span className="text-[11px] text-[#4A5568]">
                            Directly binds the physical visa document to the Resend email attachment payload.
                          </span>
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={attachApprovedVisa}
                          onChange={(e) => setAttachApprovedVisa(e.target.checked)}
                          disabled={approvedVisaDocs.length === 0}
                          className="h-4 w-4 rounded-none text-[#168653] border-[#CBD5E1] focus:ring-[#168653]"
                        />
                        <span className="text-xs font-bold text-[#166534]">
                          {attachApprovedVisa ? 'Attachment Active' : 'Do Not Attach'}
                        </span>
                      </label>
                    </div>

                    {/* Case 1: Approved Documents Available in Vault */}
                    {approvedVisaDocs.length > 0 ? (
                      <div className="space-y-2 pt-2 border-t border-[#BBF7D0]/60">
                        <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wider block">
                          Select Approved Document from Vault ({approvedVisaDocs.length} available):
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto crm-scrollbar pr-1">
                          {approvedVisaDocs.map((doc) => (
                            <label
                              key={doc.id}
                              className={`flex items-center justify-between p-2.5 border text-xs cursor-pointer transition-colors ${
                                (selectedApprovedDocId || selectedApprovedDoc?.id) === doc.id
                                  ? 'bg-[#FFFFFF] border-[#168653] shadow-xs'
                                  : 'bg-[#F0FDF4] border-[#D1FAE5] hover:bg-[#FFFFFF]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="radio"
                                  name="selectedApprovedVisaDoc"
                                  checked={(selectedApprovedDocId || selectedApprovedDoc?.id) === doc.id}
                                  onChange={() => {
                                    setSelectedApprovedDocId(doc.id);
                                    setAttachApprovedVisa(true);
                                  }}
                                  className="text-[#168653] focus:ring-[#168653]"
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-[#153650] block truncate">
                                    {doc.fileName}
                                  </span>
                                  <span className="text-[10px] text-[#718096] flex items-center gap-2">
                                    <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}</span>
                                    {doc.fileSize && <span>• {(doc.fileSize / 1024).toFixed(1)} KB</span>}
                                    <span>• By {doc.uploadedByName}</span>
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${
                                  doc.isVerified
                                    ? 'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]'
                                    : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                                }`}
                              >
                                {doc.isVerified ? '✓ Verified' : 'Unverified'}
                              </span>
                            </label>
                          ))}
                        </div>

                        {/* Optional Inline Uploader to add an updated PDF without closing composer */}
                        <details className="text-[11px] text-[#166534] pt-1">
                          <summary className="cursor-pointer font-bold hover:underline select-none">
                            + Upload an updated or revised Visa PDF to vault
                          </summary>
                          <div className="mt-2 p-2.5 bg-white border border-[#BBF7D0] flex flex-col sm:flex-row items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={handleInlineFileSelect}
                              className="w-full text-xs text-[#718096] file:mr-2 file:py-1 file:px-2.5 file:border-0 file:bg-[#153650] file:text-[#FFFFFF] file:text-xs file:font-bold hover:file:bg-[#24689B]"
                            />
                            <button
                              type="button"
                              onClick={handleInlineUploadApprovedVisa}
                              disabled={uploadingInlineDoc || !inlineFileName}
                              className="w-full sm:w-auto px-3.5 py-1.5 bg-[#168653] hover:bg-[#147246] text-[#FFFFFF] text-xs font-bold shrink-0 inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              {uploadingInlineDoc ? (
                                <RotateCw size={12} className="animate-spin text-white" />
                              ) : (
                                <Upload size={12} />
                              )}
                              <span>Upload & Select</span>
                            </button>
                          </div>
                        </details>
                      </div>
                    ) : (
                      /* Case 2: Zero Approved Documents in Vault -> Direct Inline Uploader */
                      <div className="p-3 bg-[#FFFFFF] border border-[#D1FAE5] space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#92400E]">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span>
                            No APPROVED_VISA document found in vault. Select and upload the official PDF directly below:
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleInlineFileSelect}
                            className="w-full text-xs text-[#718096] file:mr-2 file:py-1 file:px-2.5 file:border-0 file:bg-[#153650] file:text-[#FFFFFF] file:text-xs file:font-bold hover:file:bg-[#24689B]"
                          />
                          <button
                            type="button"
                            onClick={handleInlineUploadApprovedVisa}
                            disabled={uploadingInlineDoc || !inlineFileName}
                            className="w-full sm:w-auto px-3.5 py-1.5 bg-[#168653] hover:bg-[#147246] text-[#FFFFFF] text-xs font-bold shrink-0 inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {uploadingInlineDoc ? (
                              <RotateCw size={12} className="animate-spin text-white" />
                            ) : (
                              <Upload size={12} />
                            )}
                            <span>Upload & Attach Now</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Preview Tabs */}
                <div className="border border-[#E5E8ED] rounded-none">
                  <div className="bg-[#F8FAFC] border-b border-[#E5E8ED] px-4 py-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                      Email Content Preview
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePreviewTab('HTML')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-none ${
                          activePreviewTab === 'HTML' ? 'bg-[#153650] text-[#FFFFFF]' : 'text-[#718096]'
                        }`}
                      >
                        Formatted HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePreviewTab('TEXT')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-none ${
                          activePreviewTab === 'TEXT' ? 'bg-[#153650] text-[#FFFFFF]' : 'text-[#718096]'
                        }`}
                      >
                        Plain Text
                      </button>
                    </div>
                  </div>

                  <div className="p-4 max-h-64 overflow-y-auto crm-scrollbar bg-[#F8F6F0]">
                    {activePreviewTab === 'HTML' ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: emailPreview.html }}
                        className="bg-[#FFFFFF] p-2 border border-[#E5E8ED]"
                      />
                    ) : (
                      <pre className="text-xs font-mono text-[#172B45] whitespace-pre-wrap bg-[#FFFFFF] p-4 border border-[#E5E8ED] leading-relaxed">
                        {emailPreview.text}
                      </pre>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Footer Actions - Transitions smoothly without overlapping */}
              <div className="shrink-0 p-4 sm:p-5 border-t border-[#E5E8ED] bg-[#F8FAFC] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModal('NONE')}
                  className="text-xs font-bold text-[#718096] hover:text-[#153650]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal('CONFIRM_SEND')}
                  disabled={!recipientEmail.trim() || sendingEmail}
                  className="px-5 py-2.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Send size={13} className="text-[#E9B95E]" />
                  <span>Send Official Email</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIALOG 3: Single-Modal Confirmation View (Replaces Composer without Stacking) */}
        {activeModal === 'CONFIRM_SEND' && (
          <div className="fixed inset-0 z-50 bg-[#002037]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>

              <div className="text-center">
                <h3 className="font-headline text-base font-bold text-[#153650]">
                  Confirm Email Dispatch
                </h3>
                <p className="text-xs text-[#718096] mt-1">
                  You are about to dispatch an official visa communication to:
                </p>
                <div className="my-3 p-2 bg-[#F8FAFC] border border-[#E5E8ED] font-mono font-bold text-xs text-[#153650]">
                  {recipientEmail}
                </div>
                <div className="text-[11px] text-[#718096] text-left space-y-1 bg-[#F8FAFC] p-3 border border-[#E5E8ED]">
                  <div>
                    • Template: <strong>{selectedTemplateCode}</strong>
                  </div>
                  <div className="truncate">
                    • Subject: <strong>{emailSubject}</strong>
                  </div>
                  {attachApprovedVisa && (
                    <div className="text-[#168653] font-bold flex items-center gap-1 mt-1">
                      <Paperclip size={12} />
                      <span>
                        Attached: {selectedApprovedDoc?.fileName || 'Approved Visa PDF'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={() => setActiveModal('EMAIL_COMPOSER')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#718096] hover:text-[#153650]"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleDispatchEmail}
                  disabled={sendingEmail}
                  className="px-4 py-2 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors"
                >
                  {sendingEmail ? (
                    <RotateCw size={13} className="animate-spin text-[#E9B95E]" />
                  ) : (
                    <Send size={13} className="text-[#E9B95E]" />
                  )}
                  <span>Confirm & Send Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIALOG 4: View Sent Communication Log Modal */}
        {activeModal === 'VIEW_LOG' && viewLogRecord && (
          <div className="fixed inset-0 z-50 bg-[#002037]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3 shrink-0">
                <div>
                  <h3 className="font-headline text-base font-bold text-[#153650]">
                    {viewLogRecord.subject}
                  </h3>
                  <div className="text-[11px] text-[#718096] mt-0.5">
                    Dispatched on {new Date(viewLogRecord.sentAt).toLocaleString('en-GB')} by {viewLogRecord.sentByName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('NONE')}
                  className="text-[#718096] hover:text-[#153650]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto crm-scrollbar">
                <div
                  dangerouslySetInnerHTML={{ __html: viewLogRecord.messageHtml }}
                  className="bg-[#FFFFFF] p-4 border border-[#E5E8ED]"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-[#E5E8ED] shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal('NONE')}
                  className="px-4 py-2 bg-[#153650] text-[#FFFFFF] text-xs font-bold rounded-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

