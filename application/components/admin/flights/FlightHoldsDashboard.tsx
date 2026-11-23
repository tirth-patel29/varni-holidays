'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  Plane,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  History,
  ShieldAlert,
  CreditCard,
  Building,
  Tag,
  Check,
  X,
  ChevronRight,
  FileText,
  Phone,
  Edit2,
  Mail,
  Download,
  UploadCloud,
  FileCheck,
  Send,
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import DateTimePicker24 from './DateTimePicker24';
import {
  getFlightHoldsAction,
  getFlightHoldStatsAction,
  createFlightHoldAction,
  extendFlightHoldAction,
  issueFlightHoldAction,
  cancelFlightHoldAction,
  updateFlightHoldContactAction,
  runFlightHoldSchedulerAction,
  CreateFlightHoldInput,
} from '@/app/actions/flight-holds';
import {
  formatIST24,
  formatISTDate,
  getIST24Parts,
  parseIST24ToDate,
  isValidEmail,
} from '@/lib/flights/timing';
import { COUNTRY_CODES, validatePhoneNumber } from '@/lib/validation/phone';
import { FlightHoldPlatform, FlightHoldStatus, FlightHoldPaymentMode } from '@prisma/client';

export type FlightViewTab =
  | 'ALL'
  | 'HOLD_QUEUE'
  | 'REMINDERS'
  | 'ISSUED'
  | 'CANCELLED'
  | 'RELEASED';

interface FlightHoldsDashboardProps {
  initialTab?: FlightViewTab;
}

export default function FlightHoldsDashboard({
  initialTab = 'HOLD_QUEUE',
}: FlightHoldsDashboardProps) {
  const [activeTab, setActiveTab] = useState<FlightViewTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Data
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeCount: 0,
    urgentCount: 0,
    issuedCount: 0,
    cancelledCount: 0,
    releasedCount: 0,
    total: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeHoldForAction, setActiveHoldForAction] = useState<any | null>(null);
  const [actionType, setActionType] = useState<
    'EXTEND' | 'ISSUE' | 'CANCEL' | 'HISTORY' | 'EDIT_CONTACT' | null
  >(null);

  // Form states - Create Hold
  const [createForm, setCreateForm] = useState({
    pnr: '',
    passengerName: '',
    passengerEmail: '',
    travelRoute: '',
    travelDate: new Date().toISOString().split('T')[0],
    platform: 'AMADEUS' as FlightHoldPlatform,
    platformOtherName: '',
    internalNotes: '',
  });

  // Contact number for Create Hold (Country code + phone)
  const [createPhone, setCreatePhone] = useState({
    dialCode: '+91',
    nationalNumber: '',
  });

  // Edit contact state
  const [editContactForm, setEditContactForm] = useState({
    passengerPhone: '',
    passengerEmail: '',
    passengerName: '',
  });

  // 24-Hour Date/Time states for Create Hold (Single ISO string)
  const [createHoldTillIso, setCreateHoldTillIso] = useState<string>(() => {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  });

  const [createHoldPlacedIso, setCreateHoldPlacedIso] = useState<string>(() => {
    return new Date().toISOString();
  });

  // 24-Hour Date/Time states for Extend Hold
  const [extendHoldTillIso, setExtendHoldTillIso] = useState<string>('');
  const [extendReason, setExtendReason] = useState('');

  // Form state - Issue Ticket & Passenger Care
  const [issueForm, setIssueForm] = useState({
    paymentMode: 'BANK_TRANSFER' as FlightHoldPaymentMode,
    paymentModeOther: '',
    issuedFrom: 'Amadeus',
    issuedFromOther: '',
    issuanceAmountInr: '',
    airlineTicketNumber: '',
    passengerEmail: '',
    airline: '',
    flightNumber: '',
    originAirport: '',
    destinationAirport: '',
    departureDateTimeIso: '',
    sendEmailNotification: true,
    sendWhatsAppNotification: true,
    scheduleDepartureReminder: true,
  });

  // PDF Attachment State for Ticket Issuance
  const [ticketPdfFile, setTicketPdfFile] = useState<{
    name: string;
    size: number;
    base64: string;
  } | null>(null);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);

  // Form state - Cancel Hold
  const [cancelForm, setCancelForm] = useState({
    cancellationReason: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch Stats & Records
  const loadData = async () => {
    setLoading(true);
    setFormError(null);
    try {
      // 1. Fetch Stats
      const statsRes = await getFlightHoldStatsAction();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      // 2. Fetch Records based on activeTab
      let statusQuery: any = undefined;
      let urgentOnlyQuery = false;

      if (activeTab === 'HOLD_QUEUE') {
        statusQuery = 'ON_HOLD';
      } else if (activeTab === 'REMINDERS') {
        statusQuery = 'ON_HOLD';
        urgentOnlyQuery = true;
      } else if (activeTab === 'ISSUED') {
        statusQuery = 'ISSUED';
      } else if (activeTab === 'CANCELLED') {
        statusQuery = 'CANCELLED';
      } else if (activeTab === 'RELEASED') {
        statusQuery = 'RELEASED_NO_ACTION';
      }

      const listRes = await getFlightHoldsAction({
        status: statusQuery,
        urgentOnly: urgentOnlyQuery,
        platform: platformFilter,
        search,
      });

      if (listRes.success) {
        setRecords(listRes.data);
      }
    } catch (e: any) {
      console.error('Error loading flight holds:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, platformFilter]);

  // Handle Search on Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Handle E-Ticket PDF File Selection
  const handlePdfFileSelect = (file: File) => {
    setPdfUploadError(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfUploadError('Only PDF documents are allowed (.pdf)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfUploadError('PDF file size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setTicketPdfFile({
        name: file.name,
        size: file.size,
        base64,
      });
    };
    reader.onerror = () => {
      setPdfUploadError('Failed to read selected PDF file');
    };
    reader.readAsDataURL(file);
  };

  // Run Scheduler manually
  const handleRunScheduler = async () => {
    setLoading(true);
    try {
      const res = await runFlightHoldSchedulerAction();
      if (res.success) {
        setFormSuccess(
          `Scheduler executed: ${res.data?.autoReleasedCount || 0} holds auto-released, ${
            res.data?.remindersTriggeredCount || 0
          } hold reminders, ${
            res.data?.passengerRemindersTriggeredCount || 0
          } passenger departure reminders triggered.`
        );
        setTimeout(() => setFormSuccess(null), 5000);
        await loadData();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Create Hold
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      // Validate Contact Phone Number
      const phoneValidation = validatePhoneNumber(createPhone.dialCode, createPhone.nationalNumber);
      if (!phoneValidation.isValid) {
        setFormError(phoneValidation.error || 'Please enter a valid guest contact number.');
        return;
      }
      const fullContactNumber = `${createPhone.dialCode} ${createPhone.nationalNumber.replace(/\D/g, '')}`;

      // Optional Email Validation
      const cleanEmail = createForm.passengerEmail.trim().toLowerCase();
      if (cleanEmail && !isValidEmail(cleanEmail)) {
        setFormError('Please enter a valid passenger email address (e.g. passenger@example.com)');
        return;
      }

      // Parse 24-hour IST dates
      const holdTillDate = new Date(createHoldTillIso);
      const holdPlacedDate = new Date(createHoldPlacedIso);

      const now = new Date();
      if (holdTillDate.getTime() <= now.getTime()) {
        setFormError('Hold Till Date & Time must be in the future');
        return;
      }

      if (holdTillDate.getTime() <= holdPlacedDate.getTime()) {
        setFormError('Hold Till Date & Time must be strictly later than Hold Placed Date & Time');
        return;
      }

      if (
        createForm.platform === 'OTHER' &&
        (!createForm.platformOtherName || createForm.platformOtherName.trim().length === 0)
      ) {
        setFormError('Please specify the Platform/Supplier Name when selecting "Other"');
        return;
      }

      const payload: CreateFlightHoldInput = {
        pnr: createForm.pnr,
        passengerName: createForm.passengerName,
        passengerPhone: fullContactNumber,
        passengerEmail: cleanEmail || undefined,
        travelRoute: createForm.travelRoute,
        travelDate: createForm.travelDate,
        platform: createForm.platform,
        platformOtherName:
          createForm.platform === 'OTHER' ? createForm.platformOtherName.trim() : undefined,
        holdDateTime: holdPlacedDate.toISOString(),
        holdTillDateTime: holdTillDate.toISOString(),
        internalNotes: createForm.internalNotes,
      };

      const res = await createFlightHoldAction(payload);
      if (!res.success) {
        setFormError(res.error || 'Failed to create flight hold');
        return;
      }

      setIsCreateOpen(false);
      setCreateForm({
        pnr: '',
        passengerName: '',
        passengerEmail: '',
        travelRoute: '',
        travelDate: new Date().toISOString().split('T')[0],
        platform: 'AMADEUS',
        platformOtherName: '',
        internalNotes: '',
      });
      setCreatePhone({
        dialCode: '+91',
        nationalNumber: '',
      });
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    }
  };

  // Open Edit Contact Modal
  const handleOpenEditContact = (item: any) => {
    setActiveHoldForAction(item);
    setFormError(null);
    setEditContactForm({
      passengerPhone: item.passengerPhone || '',
      passengerEmail: item.passengerEmail || '',
      passengerName: item.passengerName || '',
    });
    setActionType('EDIT_CONTACT');
  };

  // Submit Edit Contact
  const handleUpdateContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHoldForAction) return;
    setFormError(null);

    const cleanPhone = editContactForm.passengerPhone.trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      setFormError('Passenger Contact Number is mandatory (minimum 7 digits)');
      return;
    }

    const cleanEmail = editContactForm.passengerEmail.trim().toLowerCase();
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      setFormError('Please enter a valid passenger email address');
      return;
    }

    try {
      const res = await updateFlightHoldContactAction({
        id: activeHoldForAction.id,
        passengerPhone: cleanPhone,
        passengerEmail: cleanEmail || undefined,
        passengerName: editContactForm.passengerName,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to update contact details');
        return;
      }

      setActionType(null);
      setActiveHoldForAction(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update contact details');
    }
  };

  // Open Extend Modal
  const handleOpenExtend = (item: any) => {
    setActiveHoldForAction(item);
    setFormError(null);
    const currentDeadline = new Date(item.holdTillDateTime);
    // Suggest +12 hours from current deadline
    const suggested = new Date(currentDeadline.getTime() + 12 * 60 * 60 * 1000);
    setExtendHoldTillIso(suggested.toISOString());
    setExtendReason('');
    setActionType('EXTEND');
  };

  // Submit Extend
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHoldForAction) return;
    setFormError(null);

    try {
      const newDeadline = new Date(extendHoldTillIso);
      const currentDeadline = new Date(activeHoldForAction.holdTillDateTime);

      if (newDeadline.getTime() <= currentDeadline.getTime()) {
        setFormError(
          'The new hold deadline must be strictly later than current hold deadline (' +
            formatIST24(currentDeadline) +
            ')'
        );
        return;
      }

      const res = await extendFlightHoldAction({
        id: activeHoldForAction.id,
        newHoldTillDateTime: newDeadline.toISOString(),
        extensionReason: extendReason,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to extend hold');
        return;
      }

      setActionType(null);
      setActiveHoldForAction(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to extend hold');
    }
  };

  // Open Issue Modal
  const handleOpenIssue = (item: any) => {
    setActiveHoldForAction(item);
    setFormError(null);

    // Parse route for origin / destination defaults
    const routeParts = (item.travelRoute || '').split('-').map((s: string) => s.trim());
    const originGuess = routeParts[0] || '';
    const destGuess = routeParts.length > 1 ? routeParts[1] : '';

    let departureIso = '';
    if (item.departureDateTime) {
      departureIso = new Date(item.departureDateTime).toISOString();
    } else if (item.travelDate) {
      const d = new Date(item.travelDate);
      d.setHours(10, 0, 0, 0);
      departureIso = d.toISOString();
    }

    setIssueForm({
      paymentMode: 'BANK_TRANSFER',
      paymentModeOther: '',
      issuedFrom: item.platform === 'OTHER' ? 'Other' : item.platform,
      issuedFromOther: item.platformOtherName || '',
      issuanceAmountInr: '',
      airlineTicketNumber: item.airlineTicketNumber || '',
      passengerEmail: item.passengerEmail || '',
      airline: item.airline || '',
      flightNumber: item.flightNumber || '',
      originAirport: item.originAirport || originGuess,
      destinationAirport: item.destinationAirport || destGuess,
      departureDateTimeIso: departureIso,
      sendEmailNotification: Boolean(item.passengerEmail),
      sendWhatsAppNotification: Boolean(item.passengerPhone),
      scheduleDepartureReminder: Boolean(departureIso),
    });
    setTicketPdfFile(null);
    setPdfUploadError(null);
    setActionType('ISSUE');
  };

  // Submit Issue
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHoldForAction) return;
    setFormError(null);

    const amount = parseFloat(issueForm.issuanceAmountInr);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid positive issuance amount');
      return;
    }

    if (issueForm.paymentMode === 'OTHER' && !issueForm.paymentModeOther?.trim()) {
      setFormError('Please specify the payment mode description');
      return;
    }

    if (issueForm.issuedFrom === 'Other') {
      const trimmedOther = issueForm.issuedFromOther?.trim();
      if (!trimmedOther || trimmedOther.length === 0) {
        setFormError('Please specify the other platform or supplier name for Issued From');
        return;
      }
    }

    const cleanEmail = issueForm.passengerEmail.trim().toLowerCase();
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      setFormError('Please enter a valid passenger email address');
      return;
    }

    try {
      const res = await issueFlightHoldAction({
        id: activeHoldForAction.id,
        paymentMode: issueForm.paymentMode,
        paymentModeOther:
          issueForm.paymentMode === 'OTHER' ? issueForm.paymentModeOther?.trim() : undefined,
        issuedFrom: issueForm.issuedFrom,
        issuedFromOther:
          issueForm.issuedFrom === 'Other' ? issueForm.issuedFromOther?.trim() : undefined,
        issuanceAmountInr: amount,
        airlineTicketNumber: issueForm.airlineTicketNumber?.trim() || undefined,
        passengerEmail: cleanEmail || undefined,
        airline: issueForm.airline.trim() || undefined,
        flightNumber: issueForm.flightNumber.trim() || undefined,
        originAirport: issueForm.originAirport.trim() || undefined,
        destinationAirport: issueForm.destinationAirport.trim() || undefined,
        departureDateTime: issueForm.departureDateTimeIso || undefined,
        pdfBase64: ticketPdfFile?.base64,
        pdfFileName: ticketPdfFile?.name,
        sendEmailNotification: issueForm.sendEmailNotification,
        sendWhatsAppNotification: issueForm.sendWhatsAppNotification,
        scheduleDepartureReminder: issueForm.scheduleDepartureReminder,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to issue ticket');
        return;
      }

      if (res.notificationWarnings && res.notificationWarnings.length > 0) {
        setFormSuccess(`PNR issued successfully! Notices: ${res.notificationWarnings.join('; ')}`);
        setTimeout(() => setFormSuccess(null), 8000);
      } else {
        setFormSuccess(`PNR ${activeHoldForAction.pnr} issued successfully and customer notified!`);
        setTimeout(() => setFormSuccess(null), 5000);
      }

      setActionType(null);
      setActiveHoldForAction(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to issue ticket');
    }
  };

  // Open Cancel Modal
  const handleOpenCancel = (item: any) => {
    setActiveHoldForAction(item);
    setFormError(null);
    setCancelForm({ cancellationReason: '' });
    setActionType('CANCEL');
  };

  // Submit Cancel
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHoldForAction) return;
    setFormError(null);

    const reason = cancelForm.cancellationReason?.trim();
    if (!reason || reason.length < 3) {
      setFormError('Cancellation remarks are mandatory (minimum 3 characters)');
      return;
    }

    try {
      const res = await cancelFlightHoldAction({
        id: activeHoldForAction.id,
        cancellationReason: reason,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to cancel hold');
        return;
      }

      setActionType(null);
      setActiveHoldForAction(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to cancel hold');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen">
      {/* 1. Page Header with Breadcrumbs & Action Buttons */}
      <PageHeader
        title="Flight Hold Queue & PNR Management"
        subtitle="Live PNR hold tracking, automated 10-hour reminders, and ticketing queue operations (24-Hour Clock IST)"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Bookings & Operations', href: '/admin/bookings' },
          { label: 'Flight Bookings', href: '/admin/bookings/flights' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunScheduler}
              disabled={loading}
              title="Run expiration & reminder engine"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white text-[#153650] border border-[#D0D5DD] rounded-lg text-xs font-semibold hover:bg-[#F1F5F9] transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Queue
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setCreateHoldTillIso(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
                setCreateHoldPlacedIso(new Date().toISOString());
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#153650] hover:bg-[#0E2537] text-white text-xs font-bold rounded-lg shadow-sm transition-colors border border-[#153650] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Hold Booking
            </button>
          </div>
        }
      />

      {/* Success banner if scheduler ran */}
      {formSuccess && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center justify-between">
          <span>{formSuccess}</span>
          <button onClick={() => setFormSuccess(null)}>
            <X className="w-4 h-4 text-emerald-600 cursor-pointer" />
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards (5 Spec Blocks) */}
      <div className="px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Active Holds */}
          <div
            onClick={() => setActiveTab('HOLD_QUEUE')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-xs ${
              activeTab === 'HOLD_QUEUE'
                ? 'border-[#153650] ring-2 ring-[#153650]/10'
                : 'border-[#E2E8F0] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Hold PNRs
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#153650]">
                {stats.activeCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Awaiting action</span>
            </div>
          </div>

          {/* 2. Expiring in <= 10 Hours */}
          <div
            onClick={() => setActiveTab('REMINDERS')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-xs ${
              activeTab === 'REMINDERS'
                ? 'border-amber-500 ring-2 ring-amber-500/10'
                : 'border-[#E2E8F0] hover:border-amber-300'
            } ${stats.urgentCount > 0 ? 'bg-amber-50/30' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Expiring ≤ 10 Hours
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  stats.urgentCount > 0
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-700">
                {stats.urgentCount}
              </span>
              <span className="text-[11px] text-amber-800 font-medium">Urgent Issuance</span>
            </div>
          </div>

          {/* 3. Issued PNRs */}
          <div
            onClick={() => setActiveTab('ISSUED')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-xs ${
              activeTab === 'ISSUED'
                ? 'border-emerald-600 ring-2 ring-emerald-600/10'
                : 'border-[#E2E8F0] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Issued PNRs
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-700">
                {stats.issuedCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Ticketed</span>
            </div>
          </div>

          {/* 4. Cancelled PNRs */}
          <div
            onClick={() => setActiveTab('CANCELLED')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-xs ${
              activeTab === 'CANCELLED'
                ? 'border-rose-500 ring-2 ring-rose-500/10'
                : 'border-[#E2E8F0] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Cancelled PNRs
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-rose-600">
                {stats.cancelledCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Cancelled by staff</span>
            </div>
          </div>

          {/* 5. Released - No Action */}
          <div
            onClick={() => setActiveTab('RELEASED')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-xs col-span-2 md:col-span-1 ${
              activeTab === 'RELEASED'
                ? 'border-slate-500 ring-2 ring-slate-500/10'
                : 'border-[#E2E8F0] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Released (No Action)
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-700">
                {stats.releasedCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Expired Queue</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Page Navigation Tabs */}
      <div className="px-4 sm:px-6 border-b border-[#E2E8F0] bg-white">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          <Link
            href="/admin/bookings/flights"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('ALL');
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
              activeTab === 'ALL'
                ? 'bg-[#153650] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Flight Bookings ({stats.total})
          </Link>

          <Link
            href="/admin/bookings/flights/hold-queue"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('HOLD_QUEUE');
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-2 transition-colors ${
              activeTab === 'HOLD_QUEUE'
                ? 'bg-[#153650] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Hold Bookings Queue</span>
            {stats.activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9B95E] text-[#153650]">
                {stats.activeCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/bookings/flights/reminders"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('REMINDERS');
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-2 transition-colors ${
              activeTab === 'REMINDERS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
            }`}
          >
            <span>Issuance Reminders</span>
            {stats.urgentCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-amber-800">
                {stats.urgentCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/bookings/flights/issued"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('ISSUED');
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-2 transition-colors ${
              activeTab === 'ISSUED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Issued PNRs</span>
            <span className="text-[10px] opacity-80">({stats.issuedCount})</span>
          </Link>

          <Link
            href="/admin/bookings/flights/cancelled"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('CANCELLED');
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-2 transition-colors ${
              activeTab === 'CANCELLED'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Cancelled PNRs</span>
            <span className="text-[10px] opacity-80">({stats.cancelledCount})</span>
          </Link>

          <Link
            href="/admin/bookings/flights/released"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('RELEASED');
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-2 transition-colors ${
              activeTab === 'RELEASED'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Released (No Action Taken)</span>
            <span className="text-[10px] opacity-80">({stats.releasedCount})</span>
          </Link>
        </div>
      </div>

      {/* 4. Released Queue Legal / Operational Disclaimer */}
      {activeTab === 'RELEASED' && (
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-slate-900">
              Internal Queue Status Clarification:
            </strong>{' '}
            PNRs listed under "Released – No Action Taken on Time" reflect records where the
            internal agency hold deadline expired without staff issuing or cancelling the
            booking. This represents an internal queue state and{' '}
            <em>does not constitute automatic confirmation of cancellation with the airline or GDS platform</em>.
            Staff should verify live PNR status in Amadeus/portal if ticket retention is desired.
          </div>
        </div>
      )}

      {/* 5. Filter & Search Bar */}
      <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PNR, passenger, phone, route, ticket #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#D0D5DD] rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#153650]"
          />
        </form>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Platform:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-transparent font-semibold text-[#153650] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Platforms</option>
              <option value="AMADEUS">Amadeus</option>
              <option value="CT">CT (Cleartrip)</option>
              <option value="RC">RC (Riya Connect)</option>
              <option value="AIRLINE">Airline Direct</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Active Queue Table / Card View */}
      <div className="px-4 sm:px-6 pb-12 flex-1">
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[#153650] mb-2" />
              <span>Loading Flight Hold records...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
              <Plane className="w-8 h-8 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-800 text-sm">No flight bookings found</p>
              <p className="text-slate-500 mt-1">
                {activeTab === 'HOLD_QUEUE'
                  ? 'There are currently no active holds in this queue.'
                  : activeTab === 'REMINDERS'
                  ? 'No holds currently expiring within the 10-hour issuance window.'
                  : 'No records match the current filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">PNR / Ref</th>
                    <th className="py-3 px-4">Passenger & Route</th>
                    <th className="py-3 px-4">Travel Date</th>
                    <th className="py-3 px-4">Hold On / Issued From</th>
                    <th className="py-3 px-4">Hold Till (24-hr IST)</th>
                    <th className="py-3 px-4">Time Remaining</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {records.map((item) => {
                    const isUrgent = item.timing?.isUrgent;
                    const isExpired = item.timing?.isExpired;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#F8FAFC] transition-colors ${
                          isUrgent && item.status === 'ON_HOLD' ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* 1. PNR */}
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-[#153650] tracking-wider text-sm flex items-center gap-1.5">
                            <span>{item.pnr}</span>
                            {item.extensions?.length > 0 && (
                              <span
                                title={`Extended ${item.extensions.length} time(s)`}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700"
                              >
                                +{item.extensions.length}
                              </span>
                            )}
                          </div>
                          {item.airlineTicketNumber && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Tkt: {item.airlineTicketNumber}
                            </div>
                          )}
                        </td>

                        {/* 2. Passenger & Route & Contact */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{item.passengerName || '—'}</span>
                            <button
                              onClick={() => handleOpenEditContact(item)}
                              title="Edit Guest Name / Phone / Email"
                              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          {item.passengerPhone && (
                            <div className="flex items-center gap-1 text-[11px] text-[#153650] font-semibold mt-0.5">
                              <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <a
                                href={`tel:${item.passengerPhone.replace(/\s+/g, '')}`}
                                className="hover:underline font-mono"
                                title="Click to call guest"
                              >
                                {item.passengerPhone}
                              </a>
                            </div>
                          )}
                          {item.passengerEmail && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium mt-0.5">
                              <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${item.passengerEmail}`}
                                className="hover:underline truncate max-w-[170px]"
                                title={item.passengerEmail}
                              >
                                {item.passengerEmail}
                              </a>
                            </div>
                          )}
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Plane className="w-3 h-3 text-slate-400" />
                            <span>{item.travelRoute || 'Route unassigned'}</span>
                          </div>

                          {/* E-Ticket PDF Download Pill */}
                          {item.ticketDocuments?.length > 0 && (
                            <div className="mt-1">
                              <a
                                href={`/api/tickets/download/${item.ticketDocuments[0].downloadToken}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                                title={`Download ${item.ticketDocuments[0].fileName}`}
                              >
                                <FileText className="w-2.5 h-2.5 text-rose-600" />
                                <span>E-Ticket PDF</span>
                                <Download className="w-2.5 h-2.5 text-rose-500" />
                              </a>
                            </div>
                          )}

                          {/* Customer Notified Badge */}
                          {item.customerNotificationSent && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Customer Notified</span>
                            </div>
                          )}
                        </td>

                        {/* 3. Travel Date (24h IST) */}
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                          {formatISTDate(item.travelDate)}
                        </td>

                        {/* 4. Hold On Platform & Issued From Supplier */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 w-fit">
                              Hold On:{' '}
                              {item.platform === 'OTHER'
                                ? item.platformOtherName || 'Other'
                                : item.platform}
                            </span>
                            {item.status === 'ISSUED' && (
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                Issued via:{' '}
                                {item.issuedFrom === 'Other' && item.issuedFromOther
                                  ? `Other (${item.issuedFromOther})`
                                  : item.issuedFrom || 'Direct'}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Hold Till (24-Hour Format DD/MM/YYYY, HH:mm) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 font-mono text-xs">
                            {formatIST24(item.holdTillDateTime)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Placed: {formatIST24(item.holdDateTime)}
                          </div>
                        </td>

                        {/* 6. Time Remaining */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.status === 'ON_HOLD' ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                isUrgent
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                  : isExpired
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {item.timing?.formatted}
                            </span>
                          ) : item.status === 'ISSUED' ? (
                            <span className="text-emerald-700 font-semibold text-[11px]">
                              ₹{item.issuanceAmountInr?.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* 7. Assigned Staff */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {item.assignedStaff?.fullName ||
                                item.assignedStaff?.name ||
                                'Unassigned'}
                            </span>
                          </div>
                        </td>

                        {/* 8. Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.status === 'ON_HOLD' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              ON HOLD
                            </span>
                          )}
                          {item.status === 'ISSUED' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ISSUED
                            </span>
                          )}
                          {item.status === 'CANCELLED' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              CANCELLED
                            </span>
                          )}
                          {item.status === 'RELEASED_NO_ACTION' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                              RELEASED
                            </span>
                          )}
                        </td>

                        {/* 9. Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Action: View History */}
                            <button
                              onClick={() => {
                                setActiveHoldForAction(item);
                                setActionType('HISTORY');
                              }}
                              title="Audit History"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* Operational actions when ON_HOLD */}
                            {item.status === 'ON_HOLD' && (
                              <>
                                <button
                                  onClick={() => handleOpenExtend(item)}
                                  className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                                >
                                  Extend
                                </button>
                                <button
                                  onClick={() => handleOpenIssue(item)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md transition-colors shadow-xs cursor-pointer"
                                >
                                  Issue
                                </button>
                                <button
                                  onClick={() => handleOpenCancel(item)}
                                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: NEW HOLD BOOKING (WIDE ENTERPRISE 2-COLUMN)     */}
      {/* ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-[min(920px,calc(100vw-24px))] sm:max-w-[min(920px,calc(100vw-48px))] max-h-[min(90vh,820px)] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
          >
            {/* Header (Sticky / Fixed at Top) */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-[#153650]/10 flex items-center justify-center text-[#153650] shrink-0">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">New Flight Hold Booking</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Queue a new PNR with deadline tracking and automated alerts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body (Only content area scrolls vertically if needed) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 md:p-7 space-y-4 md:space-y-5">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-md">
                  {formError}
                </div>
              )}

              {/* Grid 2-Column Desktop, 1-Column Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-5">
                {/* Field 1: PNR / Ref */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                    PNR / Ref *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6Q8Y9Z"
                    value={createForm.pnr}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, pnr: e.target.value.toUpperCase() })
                    }
                    className="w-full h-10 px-3.5 border border-slate-300 rounded-md text-sm font-mono font-bold uppercase text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all"
                  />
                </div>

                {/* Field 2: Travel Date */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.travelDate}
                    onChange={(e) => setCreateForm({ ...createForm, travelDate: e.target.value })}
                    className="w-full h-10 px-3.5 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all"
                  />
                </div>

                {/* Field 3: Passenger Name */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                    Passenger Name
                  </label>
                  <input
                    type="text"
                    placeholder="Lead passenger name"
                    value={createForm.passengerName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, passengerName: e.target.value })
                    }
                    className="w-full h-10 px-3.5 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Field 4: Guest Contact Number */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                    Guest Contact Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={createPhone.dialCode}
                      onChange={(e) => setCreatePhone({ ...createPhone, dialCode: e.target.value })}
                      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      className="w-28 md:w-32 h-10 px-2.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none cursor-pointer shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={`${c.code}-${c.dialCode}`} value={c.dialCode} style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                          {c.flag} {c.dialCode}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="98980 12345"
                      value={createPhone.nationalNumber}
                      onChange={(e) => setCreatePhone({ ...createPhone, nationalNumber: e.target.value })}
                      className="flex-1 min-w-0 h-10 px-3.5 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Field 5: Passenger Email Address (Optional) */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5 flex items-center justify-between">
                    <span>Passenger Email Address</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">optional</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="passenger@example.com"
                      value={createForm.passengerEmail}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, passengerEmail: e.target.value })
                      }
                      className="w-full h-10 pl-9 pr-3.5 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all placeholder:text-slate-400"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Field 5: Travel Route */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                    Travel Route
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BOM - DXB - BOM"
                    value={createForm.travelRoute}
                    onChange={(e) => setCreateForm({ ...createForm, travelRoute: e.target.value })}
                    className="w-full h-10 px-3.5 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Field 6: Hold On (Platform) */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                    Hold On (Platform) *
                  </label>
                  <select
                    value={createForm.platform}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        platform: e.target.value as FlightHoldPlatform,
                      })
                    }
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                    className="w-full h-10 px-3.5 border border-slate-300 rounded-md text-sm font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none cursor-pointer"
                  >
                    <option value="AMADEUS">Amadeus</option>
                    <option value="CT">CT (Cleartrip)</option>
                    <option value="RC">RC (Riya Connect)</option>
                    <option value="AIRLINE">Airline Direct</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Conditional Other Platform Supplier input (Spans 2 cols on desktop) */}
                {createForm.platform === 'OTHER' && (
                  <div className="col-span-1 md:col-span-2 min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                      Specify Supplier / Platform Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TBO, Akbar, etc."
                      value={createForm.platformOtherName}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, platformOtherName: e.target.value })
                      }
                      className="w-full h-10 px-3.5 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all"
                    />
                  </div>
                )}

                {/* Field 7: Hold Placed Date & Time (IST) */}
                <div className="min-w-0">
                  <DateTimePicker24
                    label="Hold Placed Date & Time (IST)"
                    value={createHoldPlacedIso}
                    onChange={setCreateHoldPlacedIso}
                    idPrefix="new-hold-placed"
                    placeholder="DD/MM/YYYY, HH:mm"
                  />
                </div>

                {/* Field 8: Hold Till Deadline (IST) */}
                <div className="min-w-0">
                  <DateTimePicker24
                    label="Hold Till Deadline (IST) *"
                    value={createHoldTillIso}
                    onChange={setCreateHoldTillIso}
                    required
                    idPrefix="new-hold-till"
                    placeholder="DD/MM/YYYY, HH:mm"
                    helperText="Automated alert triggers 10 hours prior to deadline"
                  />
                </div>

                {/* Field 9: Internal Notes / Remarks (Spans 2 cols on desktop) */}
                <div className="col-span-1 md:col-span-2 min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                    Internal Notes / Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Airline remarks, baggage allowance, client payment deadline..."
                    value={createForm.internalNotes}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, internalNotes: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all resize-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Action Footer (Sticky / Fixed at Bottom, never scrolls away) */}
            <div className="px-6 py-4 border-t border-slate-200 shrink-0 flex items-center justify-end gap-3 bg-slate-50/75">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-10 px-5 text-sm font-semibold rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-300 bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-6 text-sm font-bold rounded-md bg-[#153650] hover:bg-[#0E2537] text-white shadow-sm transition-colors cursor-pointer"
              >
                Create Flight Hold
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EXTEND HOLD (CLEAN ENTERPRISE LAYOUT)            */}
      {/* ======================================================== */}
      {actionType === 'EXTEND' && activeHoldForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleExtendSubmit}
            className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-[540px] max-h-[min(90vh,600px)] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <h3 className="font-bold text-slate-900 text-base">
                Extend Hold Deadline: PNR {activeHoldForAction.pnr}
              </h3>
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-md">
                  {formError}
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
                Current Deadline:{' '}
                <strong className="text-slate-900 font-mono font-bold">
                  {formatIST24(activeHoldForAction.holdTillDateTime)} IST
                </strong>
              </div>

              {/* 24-Hour Single Rectangular DateTime Picker for Extend */}
              <DateTimePicker24
                label="New Hold Till Date & Time (IST) *"
                value={extendHoldTillIso}
                onChange={setExtendHoldTillIso}
                required
                idPrefix="extend-hold"
                placeholder="DD/MM/YYYY, HH:mm"
                helperText="Must be strictly later than current deadline."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                  Extension Reason / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Airline granted waiver, passenger paying in evening..."
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 shrink-0 flex justify-end gap-3 bg-slate-50/75">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="h-10 px-5 text-sm font-semibold rounded-md text-slate-700 hover:bg-slate-100 border border-slate-300 bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-6 text-sm font-bold rounded-md bg-purple-700 hover:bg-purple-800 text-white shadow-sm transition-colors cursor-pointer"
              >
                Confirm Extension
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CONFIRM TICKET ISSUANCE & PASSENGER CARE        */}
      {/* ======================================================== */}
      {actionType === 'ISSUE' && activeHoldForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleIssueSubmit}
            className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-[min(880px,calc(100vw-24px))] max-h-[min(92vh,860px)] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    Confirm Ticket Issuance: PNR {activeHoldForAction.pnr}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record payment, attach e-ticket document, and send instant passenger notifications
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-md">
                  {formError}
                </div>
              )}

              {/* Section 1: Financial & Platform Source */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#153650]" />
                  <span>1. Financial & Issuance Source</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Mode */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Payment Mode *
                    </label>
                    <select
                      value={issueForm.paymentMode}
                      onChange={(e) =>
                        setIssueForm({
                          ...issueForm,
                          paymentMode: e.target.value as FlightHoldPaymentMode,
                        })
                      }
                      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
                      <option value="UPI">UPI</option>
                      <option value="CASH">Cash</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="CREDIT_PAY_LATER">Credit / Pay Later</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Issuance Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Issuance Amount (INR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        required
                        placeholder="e.g. 24500"
                        value={issueForm.issuanceAmountInr}
                        onChange={(e) =>
                          setIssueForm({ ...issueForm, issuanceAmountInr: e.target.value })
                        }
                        className="w-full h-10 pl-7 pr-3.5 border border-slate-300 rounded-md text-sm font-bold text-emerald-800 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {issueForm.paymentMode === 'OTHER' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Specify Payment Mode Details *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cheque / Foreign Wire / Corporate Voucher"
                      value={issueForm.paymentModeOther}
                      onChange={(e) =>
                        setIssueForm({ ...issueForm, paymentModeOther: e.target.value })
                      }
                      className="w-full h-10 px-3.5 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Issued From */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Issued From Platform *
                    </label>
                    <select
                      value={issueForm.issuedFrom}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIssueForm({
                          ...issueForm,
                          issuedFrom: val,
                          issuedFromOther: val === 'Other' ? issueForm.issuedFromOther : '',
                        });
                      }}
                      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                    >
                      <option value="Amadeus">Amadeus</option>
                      <option value="CT">CT (Cleartrip)</option>
                      <option value="RC">RC (Riya Connect)</option>
                      <option value="Airline Direct">Airline Direct</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Airline Ticket Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                      <span>Airline Ticket Number</span>
                      <span className="text-[10px] text-slate-400 font-normal lowercase">optional</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 176-2495819401"
                      value={issueForm.airlineTicketNumber}
                      onChange={(e) =>
                        setIssueForm({ ...issueForm, airlineTicketNumber: e.target.value })
                      }
                      className="w-full h-10 px-3.5 border border-slate-300 rounded-md text-sm font-mono font-medium bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {issueForm.issuedFrom === 'Other' && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-md">
                    <label className="block text-xs font-semibold text-slate-800 uppercase mb-1">
                      Specify Other Platform / Supplier Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TBO, Akbar, Flyhub..."
                      value={issueForm.issuedFromOther}
                      onChange={(e) =>
                        setIssueForm({ ...issueForm, issuedFromOther: e.target.value })
                      }
                      className="w-full h-9 px-3 border border-amber-300 rounded-md text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Section 2: Passenger Travel Care & Customer Notifications */}
              <div className="border border-sky-200 bg-sky-50/30 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-700" />
                    <span>2. Passenger Travel Care & Customer Notifications</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                    Branded Multichannel
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Passenger Email (Editable) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                      <span>Passenger Email Address</span>
                      <span className="text-[10px] text-slate-400 font-normal lowercase">editable</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="passenger@example.com"
                        value={issueForm.passengerEmail}
                        onChange={(e) =>
                          setIssueForm({ ...issueForm, passengerEmail: e.target.value })
                        }
                        className="w-full h-10 pl-9 pr-3.5 border border-slate-300 rounded-md text-sm font-medium bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Passenger Phone Display */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                      Passenger WhatsApp Number
                    </label>
                    <div className="h-10 px-3.5 border border-slate-200 bg-slate-100 rounded-md text-sm font-mono font-medium text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{activeHoldForAction.passengerPhone || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Flight Segment Details (Optional / Enhancements) */}
                <div className="p-3 bg-white border border-slate-200 rounded-md space-y-3">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-slate-500" />
                    <span>Flight Segment Details (for Checklist & Web Check-in)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Airline</label>
                      <input
                        type="text"
                        placeholder="e.g. IndiGo / AI"
                        value={issueForm.airline}
                        onChange={(e) => setIssueForm({ ...issueForm, airline: e.target.value })}
                        className="w-full h-8 px-2.5 border border-slate-300 rounded text-xs font-medium bg-white focus:ring-1 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Flight Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 6E 2134"
                        value={issueForm.flightNumber}
                        onChange={(e) => setIssueForm({ ...issueForm, flightNumber: e.target.value })}
                        className="w-full h-8 px-2.5 border border-slate-300 rounded text-xs font-medium font-mono uppercase bg-white focus:ring-1 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Origin Airport</label>
                      <input
                        type="text"
                        placeholder="e.g. BOM"
                        value={issueForm.originAirport}
                        onChange={(e) => setIssueForm({ ...issueForm, originAirport: e.target.value.toUpperCase() })}
                        className="w-full h-8 px-2.5 border border-slate-300 rounded text-xs font-medium font-mono uppercase bg-white focus:ring-1 focus:ring-sky-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">Destination</label>
                      <input
                        type="text"
                        placeholder="e.g. DXB"
                        value={issueForm.destinationAirport}
                        onChange={(e) => setIssueForm({ ...issueForm, destinationAirport: e.target.value.toUpperCase() })}
                        className="w-full h-8 px-2.5 border border-slate-300 rounded text-xs font-medium font-mono uppercase bg-white focus:ring-1 focus:ring-sky-600"
                      />
                    </div>
                  </div>

                  {/* Departure Date & Time (for 24h reminder) */}
                  <div className="pt-1">
                    <DateTimePicker24
                      label="Scheduled Departure Date & Time (IST)"
                      value={issueForm.departureDateTimeIso}
                      onChange={(iso) => setIssueForm({ ...issueForm, departureDateTimeIso: iso })}
                      idPrefix="issue-departure-dt"
                      placeholder="DD/MM/YYYY, HH:mm"
                      helperText="Used to schedule the automated 24-hour passenger departure reminder & web check-in guide"
                    />
                  </div>
                </div>

                {/* E-Ticket PDF Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      Attach E-Ticket PDF Document (Optional)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">max 10MB • PDF only</span>
                  </label>

                  {ticketPdfFile ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate">{ticketPdfFile.name}</div>
                          <div className="text-[10px] text-slate-500">{(ticketPdfFile.size / 1024).toFixed(1)} KB • Valid PDF Document</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTicketPdfFile(null)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer shrink-0"
                        title="Remove attached PDF"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-lg p-4 text-center bg-white transition-colors">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePdfFileSelect(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Click to browse or drag & drop E-Ticket PDF</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Securely delivered via Resend attachment and tokenized WhatsApp download link</p>
                    </div>
                  )}

                  {pdfUploadError && (
                    <div className="text-xs text-rose-600 font-medium">{pdfUploadError}</div>
                  )}
                </div>

                {/* Notification Toggles */}
                <div className="space-y-2 pt-2 border-t border-sky-200">
                  {/* Email Toggle */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={issueForm.sendEmailNotification}
                      onChange={(e) => setIssueForm({ ...issueForm, sendEmailNotification: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">Send ticket confirmation by Email</span>
                      <p className="text-[11px] text-slate-500">
                        {issueForm.passengerEmail
                          ? `Will be delivered to ${issueForm.passengerEmail} with branded HTML itinerary & PDF attachment`
                          : 'No email specified. Enter passenger email above to enable email dispatch.'}
                      </p>
                    </div>
                  </label>

                  {/* WhatsApp Toggle */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={issueForm.sendWhatsAppNotification}
                      onChange={(e) => setIssueForm({ ...issueForm, sendWhatsAppNotification: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">Send ticket confirmation by WhatsApp</span>
                      <p className="text-[11px] text-slate-500">
                        {activeHoldForAction.passengerPhone
                          ? `Will be sent to ${activeHoldForAction.passengerPhone} with booking details & secure ticket download link`
                          : 'No passenger phone number available.'}
                      </p>
                    </div>
                  </label>

                  {/* 24-Hour Reminder Toggle */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={issueForm.scheduleDepartureReminder}
                      onChange={(e) => setIssueForm({ ...issueForm, scheduleDepartureReminder: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">Schedule 24-Hour Departure Reminder</span>
                      <p className="text-[11px] text-slate-500">
                        Automated check-in links, travel checklist, and baggage guidance delivered 24 hours prior to departure
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 shrink-0 flex items-center justify-between bg-slate-50/75">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Core ticket issuance is guaranteed; notifications run safely in background.
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="h-10 px-5 text-sm font-semibold rounded-md text-slate-700 hover:bg-slate-100 border border-slate-300 bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 text-sm font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Issuance & Notify</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CANCEL HOLD                                      */}
      {/* ======================================================== */}
      {actionType === 'CANCEL' && activeHoldForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Cancel Flight Hold: PNR {activeHoldForAction.pnr}
                </h3>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="mt-4 space-y-3">
              {formError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cancellation Reason / Remarks *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Passenger opted out, fare increased, visa rejected..."
                  value={cancelForm.cancellationReason}
                  onChange={(e) =>
                    setCancelForm({ ...cancelForm, cancellationReason: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: AUDIT HISTORY (24-HOUR FORMAT)                   */}
      {/* ======================================================== */}
      {actionType === 'HISTORY' && activeHoldForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#153650]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Action History & Audit Log: PNR {activeHoldForAction.pnr}
                </h3>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {activeHoldForAction.actionHistory?.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-6">
                  No log entries recorded yet.
                </div>
              ) : (
                activeHoldForAction.actionHistory.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#153650]">{log.actionType}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {formatIST24(log.createdAt)} IST
                      </span>
                    </div>
                    <p className="text-slate-700">{log.details}</p>
                    {log.performedByName && (
                      <div className="mt-1 text-[10px] text-slate-500">
                        Actor: {log.performedByName} ({log.performedByRole || 'Staff'})
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: EDIT PASSENGER CONTACT DETAILS                  */}
      {/* ======================================================== */}
      {actionType === 'EDIT_CONTACT' && activeHoldForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#153650]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Update Guest Contact: PNR {activeHoldForAction.pnr}
                </h3>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateContactSubmit} className="mt-4 space-y-3.5">
              {formError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Passenger Name
                </label>
                <input
                  type="text"
                  value={editContactForm.passengerName}
                  onChange={(e) =>
                    setEditContactForm({ ...editContactForm, passengerName: e.target.value })
                  }
                  placeholder="Passenger / Guest Name"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#153650]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={editContactForm.passengerPhone}
                  onChange={(e) =>
                    setEditContactForm({ ...editContactForm, passengerPhone: e.target.value })
                  }
                  placeholder="e.g. +91 98980 12345"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#153650]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Passenger Email Address</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">optional</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={editContactForm.passengerEmail}
                    onChange={(e) =>
                      setEditContactForm({ ...editContactForm, passengerEmail: e.target.value })
                    }
                    placeholder="passenger@example.com"
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#153650]"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#153650] hover:bg-[#0E2537] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
