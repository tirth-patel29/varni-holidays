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
} from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import {
  getFlightHoldsAction,
  getFlightHoldStatsAction,
  createFlightHoldAction,
  extendFlightHoldAction,
  issueFlightHoldAction,
  cancelFlightHoldAction,
  runFlightHoldSchedulerAction,
  CreateFlightHoldInput,
} from '@/app/actions/flight-holds';
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
  const [actionType, setActionType] = useState<'EXTEND' | 'ISSUE' | 'CANCEL' | 'HISTORY' | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateFlightHoldInput>({
    pnr: '',
    passengerName: '',
    travelRoute: '',
    travelDate: new Date().toISOString().split('T')[0],
    platform: 'AMADEUS',
    platformOtherName: '',
    holdDateTime: '',
    holdTillDateTime: '',
    internalNotes: '',
  });

  const [extendForm, setExtendForm] = useState({
    newHoldTillDateTime: '',
    extensionReason: '',
  });

  const [issueForm, setIssueForm] = useState({
    paymentMode: 'BANK_TRANSFER' as FlightHoldPaymentMode,
    paymentModeOther: '',
    issuedFrom: 'Amadeus',
    issuedFromOther: '',
    issuanceAmountInr: '',
    airlineTicketNumber: '',
  });

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

  // Run Scheduler manually
  const handleRunScheduler = async () => {
    setLoading(true);
    try {
      const res = await runFlightHoldSchedulerAction();
      if (res.success) {
        setFormSuccess(
          `Scheduler executed: ${res.data?.autoReleasedCount || 0} holds auto-released, ${
            res.data?.remindersTriggeredCount || 0
          } reminders triggered.`
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
      const res = await createFlightHoldAction(createForm);
      if (!res.success) {
        setFormError(res.error || 'Failed to create flight hold');
        return;
      }

      setIsCreateOpen(false);
      setCreateForm({
        pnr: '',
        passengerName: '',
        travelRoute: '',
        travelDate: new Date().toISOString().split('T')[0],
        platform: 'AMADEUS',
        platformOtherName: '',
        holdDateTime: '',
        holdTillDateTime: '',
        internalNotes: '',
      });
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    }
  };

  // Submit Extend
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHoldForAction) return;
    setFormError(null);

    try {
      const res = await extendFlightHoldAction({
        id: activeHoldForAction.id,
        newHoldTillDateTime: extendForm.newHoldTillDateTime,
        extensionReason: extendForm.extensionReason,
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

    try {
      const res = await issueFlightHoldAction({
        id: activeHoldForAction.id,
        paymentMode: issueForm.paymentMode,
        paymentModeOther: issueForm.paymentModeOther,
        issuedFrom: issueForm.issuedFrom,
        issuedFromOther: issueForm.issuedFromOther,
        issuanceAmountInr: amount,
        airlineTicketNumber: issueForm.airlineTicketNumber,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to issue ticket');
        return;
      }

      setActionType(null);
      setActiveHoldForAction(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to issue ticket');
    }
  };

  // Submit Cancel
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHoldForAction) return;
    setFormError(null);

    try {
      const res = await cancelFlightHoldAction({
        id: activeHoldForAction.id,
        cancellationReason: cancelForm.cancellationReason,
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

  // Helper for formatting date-time in IST
  const formatIST = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatISTDateOnly = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen">
      {/* 1. Page Header with Breadcrumbs & Action Buttons */}
      <PageHeader
        title="Flight Hold Queue & PNR Management"
        subtitle="Live PNR hold tracking, automated 10-hour reminders, and ticketing queue operations (IST Timezone)"
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
              className="inline-flex items-center gap-2 px-3 py-2 bg-white text-[#153650] border border-[#D0D5DD] rounded-lg text-xs font-semibold hover:bg-[#F1F5F9] transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Queue
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#153650] hover:bg-[#0E2537] text-white text-xs font-bold rounded-lg shadow-sm transition-colors border border-[#153650]"
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
            <X className="w-4 h-4 text-emerald-600" />
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
            placeholder="Search PNR, passenger, route, ticket #..."
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
                    <th className="py-3 px-4">Hold On</th>
                    <th className="py-3 px-4">Hold Till (IST)</th>
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

                        {/* 2. Passenger & Route */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {item.passengerName || '—'}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Plane className="w-3 h-3 text-slate-400" />
                            <span>{item.travelRoute || 'Route unassigned'}</span>
                          </div>
                        </td>

                        {/* 3. Travel Date */}
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {formatISTDateOnly(item.travelDate)}
                        </td>

                        {/* 4. Hold On */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {item.platform === 'OTHER'
                              ? item.platformOtherName || 'Other'
                              : item.platform}
                          </span>
                        </td>

                        {/* 5. Hold Till */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {formatIST(item.holdTillDateTime)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Pl: {formatIST(item.holdDateTime)}
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
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* Only show operational actions when ON_HOLD */}
                            {item.status === 'ON_HOLD' && (
                              <>
                                <button
                                  onClick={() => {
                                    setActiveHoldForAction(item);
                                    setExtendForm({
                                      newHoldTillDateTime: '',
                                      extensionReason: '',
                                    });
                                    setActionType('EXTEND');
                                  }}
                                  className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold rounded-md transition-colors"
                                >
                                  Extend
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveHoldForAction(item);
                                    setIssueForm({
                                      paymentMode: 'BANK_TRANSFER',
                                      paymentModeOther: '',
                                      issuedFrom:
                                        item.platform === 'OTHER' ? 'Other' : item.platform,
                                      issuedFromOther: item.platformOtherName || '',
                                      issuanceAmountInr: '',
                                      airlineTicketNumber: '',
                                    });
                                    setActionType('ISSUE');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md transition-colors shadow-xs"
                                >
                                  Issue
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveHoldForAction(item);
                                    setCancelForm({ cancellationReason: '' });
                                    setActionType('CANCEL');
                                  }}
                                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-semibold rounded-md transition-colors"
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
      {/* MODAL 1: NEW HOLD BOOKING                                 */}
      {/* ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-[#153650]" />
                <h3 className="font-bold text-slate-900 text-sm">New Flight Hold Booking</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              {/* PNR & Travel Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-[#153650] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.travelDate}
                    onChange={(e) => setCreateForm({ ...createForm, travelDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#153650] focus:outline-none"
                  />
                </div>
              </div>

              {/* Passenger Name & Route */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Passenger Name
                  </label>
                  <input
                    type="text"
                    placeholder="Lead passenger name"
                    value={createForm.passengerName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, passengerName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#153650] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Travel Route
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BOM - DXB - BOM"
                    value={createForm.travelRoute}
                    onChange={(e) => setCreateForm({ ...createForm, travelRoute: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#153650] focus:outline-none"
                  />
                </div>
              </div>

              {/* Platform */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#153650] focus:outline-none"
                  >
                    <option value="AMADEUS">Amadeus</option>
                    <option value="CT">CT (Cleartrip)</option>
                    <option value="RC">RC (Riya Connect)</option>
                    <option value="AIRLINE">Airline Direct</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {createForm.platform === 'OTHER' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Supplier / Platform Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TBO, Akbar, etc."
                      value={createForm.platformOtherName}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, platformOtherName: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#153650] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Hold Till Date & Time (IST) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hold Till Date & Time (IST) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={createForm.holdTillDateTime}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, holdTillDateTime: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#153650] focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  The system will automatically trigger urgent alerts 10 hours prior to this deadline.
                </p>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Airline remarks, baggage allowance, client payment deadline..."
                  value={createForm.internalNotes}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, internalNotes: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#153650] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#153650] hover:bg-[#0E2537] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Create Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EXTEND HOLD                                      */}
      {/* ======================================================== */}
      {actionType === 'EXTEND' && activeHoldForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Extend Hold Deadline: PNR {activeHoldForAction.pnr}
              </h3>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExtendSubmit} className="mt-4 space-y-3">
              {formError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                Current Deadline:{' '}
                <strong className="text-slate-900">
                  {formatIST(activeHoldForAction.holdTillDateTime)}
                </strong>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Hold Till Date & Time (IST) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={extendForm.newHoldTillDateTime}
                  onChange={(e) =>
                    setExtendForm({ ...extendForm, newHoldTillDateTime: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#153650]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Extension Reason / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Airline granted waiver, passenger paying in evening..."
                  value={extendForm.extensionReason}
                  onChange={(e) =>
                    setExtendForm({ ...extendForm, extensionReason: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#153650]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Confirm Extension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ISSUE TICKET                                     */}
      {/* ======================================================== */}
      {actionType === 'ISSUE' && activeHoldForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Confirm Ticket Issuance: PNR {activeHoldForAction.pnr}
                </h3>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="mt-4 space-y-3.5">
              {formError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              {/* Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
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

                {issueForm.paymentMode === 'OTHER' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Specify Payment Mode *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cheque / Foreign Wire"
                      value={issueForm.paymentModeOther}
                      onChange={(e) =>
                        setIssueForm({ ...issueForm, paymentModeOther: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                )}
              </div>

              {/* Issued From & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issued From *
                  </label>
                  <select
                    value={issueForm.issuedFrom}
                    onChange={(e) => setIssueForm({ ...issueForm, issuedFrom: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Amadeus">Amadeus</option>
                    <option value="CT">CT (Cleartrip)</option>
                    <option value="RC">RC (Riya Connect)</option>
                    <option value="Airline Direct">Airline Direct</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issuance Amount (INR) *
                  </label>
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Airline Ticket Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Airline Ticket Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 176-2495819401"
                  value={issueForm.airlineTicketNumber}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, airlineTicketNumber: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Confirm Issuance
                </button>
              </div>
            </form>
          </div>
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
                className="text-slate-400 hover:text-slate-600"
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
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: AUDIT HISTORY                                    */}
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
                className="text-slate-400 hover:text-slate-600"
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
                      <span className="text-slate-400">{formatIST(log.createdAt)}</span>
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
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
