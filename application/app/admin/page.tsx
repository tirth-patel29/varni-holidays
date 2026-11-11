'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDashboardMetricsAction, getLeadsAction, getFollowUpsAction, getAuditLogsAction } from '@/app/actions/crm';
import { getBookingsAction } from '@/app/actions/phase3';
import { getGoogleSheetsStatusAction } from '@/app/actions/google-sheets';
import { useCrm } from '@/components/crm/CrmContext';
import { DEFAULT_USERS } from '@/lib/auth/session';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  Users,
  Compass,
  FileText,
  BookmarkCheck,
  TrendingUp,
  Inbox,
  Flame,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Table,
  Plane,
  Stamp,
  UserCheck,
  Activity,
  AlertCircle,
  Calendar,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CreditCard,
  PhoneCall,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useCrm();

  const activeTab = searchParams.get('tab') || 'overview';

  const [metrics, setMetrics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [sheetsStatus, setSheetsStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsData, leadsData, bookingsRes, followUpsData, auditLogsData, sheets] = await Promise.all([
        getDashboardMetricsAction(),
        getLeadsAction(),
        getBookingsAction(),
        getFollowUpsAction(),
        getAuditLogsAction(),
        getGoogleSheetsStatusAction(),
      ]);
      setMetrics(metricsData);
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      const bList = Array.isArray(bookingsRes?.bookings)
        ? bookingsRes.bookings
        : Array.isArray(bookingsRes)
        ? bookingsRes
        : [];
      setBookings(bList);
      setFollowUps(Array.isArray(followUpsData) ? followUpsData : []);
      setAuditLogs(Array.isArray(auditLogsData) ? auditLogsData : []);
      setSheetsStatus(sheets);
    } catch (err) {
      console.error('Error loading admin dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate real metrics
  const totalEnquiries = leads.length;
  const activeLeads = leads.filter((l) => l.stage !== 'CONVERTED' && l.stage !== 'LOST');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'VOUCHERED');
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const pendingPaymentsAmount = Math.max(0, totalRevenue - totalPaid);
  const convertedLeads = leads.filter((l) => l.stage === 'CONVERTED');
  const conversionRate = totalEnquiries > 0 ? Math.round((convertedLeads.length / totalEnquiries) * 100) : 0;

  // Workload per employee
  const employeeWorkload = DEFAULT_USERS.filter((u) => u.role !== 'ACCOUNTANT').map((emp) => {
    const assignedLeads = leads.filter((l) => l.assignedUserId === emp.id && !l.isDeleted);
    const converted = assignedLeads.filter((l) => l.stage === 'CONVERTED').length;
    const rate = assignedLeads.length > 0 ? Math.round((converted / assignedLeads.length) * 100) : 0;
    return {
      id: emp.id,
      name: emp.fullName,
      role: emp.role.replace('_', ' '),
      leadsCount: assignedLeads.length,
      convertedCount: converted,
      conversionRate: rate,
    };
  });

  // Filter My Tasks for logged in consultant
  const myAssignedLeads = leads.filter((l) => l.assignedUserId === currentUser.id);
  const myFollowUps = followUps.filter((f) => f.assignedUserId === currentUser.id || !f.assignedUserId);

  // Filter Priority Inbox items
  const urgentLeads = leads.filter((l) => l.priorityLevel === 'URGENT' || l.priorityLevel === 'HIGH');
  const overdueFollowUps = followUps.filter((f) => {
    if (f.status === 'COMPLETED') return false;
    const due = new Date(f.scheduledAt).getTime();
    return due < Date.now();
  });
  const pendingPaymentsList = bookings.filter((b) => (b.totalAmount || 0) > (b.paidAmount || 0));

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45] selection:bg-[#E9B95E]/30 selection:text-[#153650]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* =========================================================================
            1. DASHBOARD WELCOME BANNER WITH PANORAMIC MOUNTAIN LANDSCAPE
           ========================================================================= */}
        <section className="relative overflow-hidden bg-[#153650] border border-[#E5E8ED] rounded-none shadow-xs">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/admin-mountain-banner.jpg"
              alt="Himalayan mountain dawn landscape"
              fill
              priority
              className="object-cover object-[center_35%]"
              sizes="(max-width: 1400px) 100vw, 1400px"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(21, 54, 80, 0.94) 0%, rgba(21, 54, 80, 0.88) 38%, rgba(21, 54, 80, 0.5) 65%, rgba(21, 54, 80, 0.15) 100%)',
              }}
            />
          </div>

          <div className="relative z-10 px-6 sm:px-8 py-7 sm:py-9 max-w-2xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#E9B95E] rounded-none inline-block" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#E9B95E] font-bold">
                Varni Holidays Executive Console • {currentDateStr}
              </span>
            </div>

            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FFFFFF] leading-tight drop-shadow-xs">
              {greeting}, {currentUser.fullName}
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#E2E8F0] leading-relaxed max-w-xl font-normal drop-shadow-xs">
              Unified travel operations cockpit for Varni Holidays. Monitor client enquiries, holiday bookings, flight itineraries, and financial health from Anand HQ.
            </p>

            {/* Quick Link Pills */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                href="/admin/enquiries"
                className="px-3.5 py-1.5 bg-[#E9B95E] hover:bg-[#F0C878] text-[#153650] font-bold text-xs rounded-none transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>All Enquiries</span>
                <ArrowRight size={13} />
              </Link>

              <Link
                href="/admin/bookings"
                className="px-3.5 py-1.5 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#153650] font-semibold text-xs rounded-none transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <BookmarkCheck size={13} className="text-[#24689B]" />
                <span>Bookings Register</span>
              </Link>

              {sheetsStatus?.config?.spreadsheetUrl && (
                <a
                  href={sheetsStatus.config.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#153650]/80 hover:bg-[#153650] text-[#FFFFFF] border border-[#FFFFFF]/30 font-medium text-xs rounded-none transition-colors inline-flex items-center gap-1.5"
                >
                  <Table size={13} className="text-[#55B98A]" />
                  <span>Google Sheets Sync</span>
                  <ExternalLink size={10} className="text-[#E2E8F0]" />
                </a>
              )}

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="px-2.5 py-1.5 bg-[#153650]/60 hover:bg-[#153650] text-[#E2E8F0] border border-[#FFFFFF]/20 text-xs rounded-none transition-colors inline-flex items-center gap-1"
                title="Refresh Metrics"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SUBSECTIONS NAVIGATION TABS (PHASE 1 - OVERVIEW)
           ========================================================================= */}
        <div className="flex items-center border-b border-[#E5E8ED] bg-[#FFFFFF] px-4 overflow-x-auto crm-scrollbar select-none">
          <Link
            href="/admin"
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                : 'border-transparent text-[#667085] hover:text-[#153650]'
            }`}
          >
            <TrendingUp size={14} />
            <span>Business Overview</span>
          </Link>

          <Link
            href="/admin?tab=tasks"
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === 'tasks'
                ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                : 'border-transparent text-[#667085] hover:text-[#153650]'
            }`}
          >
            <Clock size={14} />
            <span>My Tasks ({myFollowUps.filter((f) => f.status !== 'COMPLETED').length})</span>
          </Link>

          <Link
            href="/admin?tab=inbox"
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === 'inbox'
                ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                : 'border-transparent text-[#667085] hover:text-[#153650]'
            }`}
          >
            <AlertTriangle size={14} className="text-[#C05621]" />
            <span>Priority Inbox ({urgentLeads.length + overdueFollowUps.length})</span>
          </Link>

          <Link
            href="/admin?tab=activity"
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === 'activity'
                ? 'border-[#24689B] text-[#24689B] bg-[#F7F8FA]'
                : 'border-transparent text-[#667085] hover:text-[#153650]'
            }`}
          >
            <Activity size={14} />
            <span>Recent Activity</span>
          </Link>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="py-24 text-center text-[#718096] bg-[#FFFFFF] border border-[#E5E8ED] rounded-none">
            <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold tracking-wide uppercase font-mono">
              Loading operational data...
            </p>
          </div>
        ) : (
          <>
            {/* =========================================================================
                TAB 1: BUSINESS OVERVIEW
               ========================================================================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 6 EXECUTIVE KPI CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  {/* Card 1: Total Enquiries */}
                  <Link
                    href="/admin/enquiries"
                    className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#24689B] transition-colors shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                      <span>Total Enquiries</span>
                      <Inbox size={15} className="text-[#153650] group-hover:text-[#24689B]" />
                    </div>
                    <div className="text-2xl font-bold text-[#153650] mt-2 tabular-nums font-headline">
                      {totalEnquiries}
                    </div>
                    <div className="text-[10px] text-[#24689B] mt-1 font-semibold truncate">
                      View all inbound →
                    </div>
                  </Link>

                  {/* Card 2: Active Leads */}
                  <Link
                    href="/admin/leads"
                    className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#24689B] transition-colors shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                      <span>Active Leads</span>
                      <Flame size={15} className="text-[#C05621] group-hover:text-[#24689B]" />
                    </div>
                    <div className="text-2xl font-bold text-[#C05621] mt-2 tabular-nums font-headline">
                      {activeLeads.length}
                    </div>
                    <div className="text-[10px] text-[#718096] mt-1 font-medium truncate">
                      In qualification pipeline
                    </div>
                  </Link>

                  {/* Card 3: Confirmed Bookings */}
                  <Link
                    href="/admin/bookings"
                    className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#24689B] transition-colors shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                      <span>Confirmed Bookings</span>
                      <BookmarkCheck size={15} className="text-[#168653] group-hover:text-[#24689B]" />
                    </div>
                    <div className="text-2xl font-bold text-[#168653] mt-2 tabular-nums font-headline">
                      {confirmedBookings.length}
                    </div>
                    <div className="text-[10px] text-[#168653] mt-1 font-semibold truncate">
                      Voucher-ready files
                    </div>
                  </Link>

                  {/* Card 4: Total Revenue */}
                  <Link
                    href="/admin/finance/revenue"
                    className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#24689B] transition-colors shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                      <span>Total Revenue</span>
                      <DollarSign size={15} className="text-[#153650] group-hover:text-[#24689B]" />
                    </div>
                    <div className="text-2xl font-bold text-[#153650] mt-2 tabular-nums font-headline">
                      ₹{(totalRevenue / 1000).toFixed(0)}k
                    </div>
                    <div className="text-[10px] text-[#718096] mt-1 font-medium truncate">
                      ₹{totalPaid.toLocaleString()} collected
                    </div>
                  </Link>

                  {/* Card 5: Pending Payments */}
                  <Link
                    href="/admin/payments/pending"
                    className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#D54747] transition-colors shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                      <span>Pending Payments</span>
                      <CreditCard size={15} className="text-[#D54747] group-hover:text-[#B91C1C]" />
                    </div>
                    <div className="text-2xl font-bold text-[#D54747] mt-2 tabular-nums font-headline">
                      ₹{(pendingPaymentsAmount / 1000).toFixed(0)}k
                    </div>
                    <div className="text-[10px] text-[#D54747] mt-1 font-semibold truncate">
                      Receivables ledger →
                    </div>
                  </Link>

                  {/* Card 6: Conversion Rate */}
                  <Link
                    href="/admin/reports"
                    className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#24689B] transition-colors shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                      <span>Conversion Rate</span>
                      <TrendingUp size={15} className="text-[#168653] group-hover:text-[#24689B]" />
                    </div>
                    <div className="text-2xl font-bold text-[#168653] mt-2 tabular-nums font-headline">
                      {conversionRate}%
                    </div>
                    <div className="text-[10px] text-[#718096] mt-1 font-medium truncate">
                      {convertedLeads.length} won deals
                    </div>
                  </Link>
                </div>

                {/* TODAY'S SCHEDULE & SALES PERFORMANCE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Today's Schedule (1 col) */}
                  <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5E8ED] mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-[#24689B]" />
                          <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                            Today&apos;s Schedule
                          </h2>
                        </div>
                        <Link
                          href="/admin/follow-ups"
                          className="text-xs font-bold text-[#24689B] hover:text-[#153650]"
                        >
                          View All →
                        </Link>
                      </div>

                      <div className="space-y-3">
                        {followUps.slice(0, 4).map((f) => (
                          <div key={f.id} className="p-2.5 bg-[#F8FAFC] border border-[#E5E8ED] text-xs">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#153650]">
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="text-[#C05621]" />
                                {new Date(f.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <StatusBadge status={f.status} size="sm" />
                            </div>
                            <p className="font-semibold text-[#153650] mt-1 truncate">
                              {f.reminderNote}
                            </p>
                          </div>
                        ))}
                        {followUps.length === 0 && (
                          <p className="text-xs text-[#718096] py-6 text-center italic">
                            No pending reminders scheduled for today.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E8ED] mt-3 flex items-center justify-between text-xs">
                      <span className="text-[#718096]">Departures Approaching:</span>
                      <Link href="/admin/operations/departures" className="font-bold text-[#24689B]">
                        Inspect Roster →
                      </Link>
                    </div>
                  </div>

                  {/* Sales Performance & Service Split (2 cols) */}
                  <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E8ED] mb-4">
                        <div>
                          <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                            Sales Performance & Service Breakdown
                          </h2>
                          <p className="text-xs text-[#718096] mt-0.5">
                            Volume distribution across travel products and conversion health
                          </p>
                        </div>
                        <Link
                          href="/admin/reports"
                          className="text-xs font-bold text-[#24689B] hover:text-[#153650] mt-1 sm:mt-0"
                        >
                          Full Report →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {/* Tour Packages */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-[#153650] flex items-center gap-1.5">
                                <Compass size={13} className="text-[#7E22CE]" />
                                Holiday Packages
                              </span>
                              <span className="font-mono text-[#718096]">
                                {metrics?.packagesCount || 0} enquiries
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#F1F5F9]">
                              <div
                                className="h-full bg-[#7E22CE]"
                                style={{
                                  width: `${totalEnquiries > 0 ? ((metrics?.packagesCount || 0) / totalEnquiries) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Flights */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-[#153650] flex items-center gap-1.5">
                                <Plane size={13} className="text-[#1D4ED8]" />
                                Flight Ticketing
                              </span>
                              <span className="font-mono text-[#718096]">
                                {metrics?.flightsCount || 0} enquiries
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#F1F5F9]">
                              <div
                                className="h-full bg-[#1D4ED8]"
                                style={{
                                  width: `${totalEnquiries > 0 ? ((metrics?.flightsCount || 0) / totalEnquiries) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Visa Assistance */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-[#153650] flex items-center gap-1.5">
                                <Stamp size={13} className="text-[#15803D]" />
                                Visa Consular
                              </span>
                              <span className="font-mono text-[#718096]">
                                {metrics?.visaCount || 0} enquiries
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#F1F5F9]">
                              <div
                                className="h-full bg-[#15803D]"
                                style={{
                                  width: `${totalEnquiries > 0 ? ((metrics?.visaCount || 0) / totalEnquiries) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Financial Conversion Snapshot */}
                        <div className="bg-[#FAFBFD] border border-[#E5E8ED] p-4 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                              Financial Conversion
                            </span>
                            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">
                              ₹{totalRevenue.toLocaleString()} Total Order Value
                            </div>
                            <p className="text-[11px] text-[#667085] mt-1">
                              {confirmedBookings.length} bookings confirmed out of {totalEnquiries} enquiries ({conversionRate}% win rate).
                            </p>
                          </div>
                          <div className="pt-3 border-t border-[#E5E8ED] flex items-center justify-between text-xs">
                            <span className="text-[#718096]">Outstanding Receivables:</span>
                            <span className="font-bold text-[#D54747] font-mono">₹{pendingPaymentsAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E8ED] mt-3 flex items-center justify-between text-xs">
                      <span className="text-[#718096]">Primary Inflow Channel:</span>
                      <span className="font-semibold text-[#153650]">Website Enquiries & Direct WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* RECENT INBOUND ENQUIRIES TABLE */}
                <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5E8ED]">
                    <div>
                      <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                        Recent Inbound Travel Enquiries
                      </h2>
                      <p className="text-xs text-[#718096] mt-0.5">
                        Latest enquiries registered across Flights, Holiday Packages, Visas, and Travel Insurance
                      </p>
                    </div>
                    <Link
                      href="/admin/enquiries"
                      className="px-3 py-1 bg-[#F7F8FA] hover:bg-[#E5E8ED] text-[#153650] text-xs font-semibold rounded-none border border-[#E5E8ED] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>All Enquiries Workspace</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                          <th className="py-2.5 px-3 font-semibold">Reference & Customer</th>
                          <th className="py-2.5 px-3 font-semibold">Service</th>
                          <th className="py-2.5 px-3 font-semibold">Destination / Route</th>
                          <th className="py-2.5 px-3 font-semibold">Priority</th>
                          <th className="py-2.5 px-3 font-semibold">Stage</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                        {leads.slice(0, 6).map((lead) => (
                          <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-3 px-3">
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="font-bold text-[#153650] hover:text-[#24689B] transition-colors block leading-tight"
                              >
                                {lead.customer?.fullName || 'Valued Traveler'}
                              </Link>
                              <span className="text-[10px] text-[#718096] font-mono mt-0.5 block">
                                {lead.referenceId}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={lead.serviceType} type="service" size="sm" />
                            </td>
                            <td className="py-3 px-3 text-[#718096] max-w-[200px] truncate font-medium">
                              {lead.serviceType === 'PACKAGE' && (lead.packageDetail?.packageName || 'Holiday Package')}
                              {lead.serviceType === 'FLIGHT' && `${lead.flightDetail?.originAirport?.split('-')[0] || 'AMD'} → ${lead.flightDetail?.destinationAirport?.split('-')[0] || 'DXB'}`}
                              {lead.serviceType === 'VISA' && `${lead.visaDetail?.destinationCountry || 'International'} Visa`}
                              {lead.serviceType === 'TRAVEL_INSURANCE' && `${lead.insuranceDetail?.destinationCountry || 'Global'} Insurance`}
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={lead.priorityLevel} type="priority" size="sm" />
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={lead.stage} type="lead" size="sm" />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="font-bold text-[#24689B] hover:text-[#153650] hover:underline text-xs"
                              >
                                View Dossier →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 2: MY TASKS
               ========================================================================= */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E8ED] mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                        My Assigned Follow-ups & Reminders
                      </h2>
                      <p className="text-xs text-[#718096] mt-0.5">
                        Touchpoints scheduled for {currentUser.fullName}
                      </p>
                    </div>
                    <Link
                      href="/admin/follow-ups"
                      className="px-3 py-1.5 bg-[#153650] text-[#FFFFFF] text-xs font-semibold rounded-none"
                    >
                      Follow-ups Workspace →
                    </Link>
                  </div>

                  <div className="divide-y divide-[#E5E8ED]">
                    {myFollowUps.map((f) => (
                      <div key={f.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-[#C05621]" />
                            <span className="font-semibold text-[#153650]">
                              {new Date(f.scheduledAt).toLocaleString()}
                            </span>
                            <StatusBadge status={f.status} size="sm" />
                          </div>
                          <p className="text-xs text-[#172B45] mt-1 font-medium">{f.reminderNote}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/admin/leads/${f.leadId}`}
                            className="px-2.5 py-1 text-xs border border-[#E5E8ED] text-[#153650] hover:bg-[#F9FAFB]"
                          >
                            Open Lead
                          </Link>
                        </div>
                      </div>
                    ))}
                    {myFollowUps.length === 0 && (
                      <div className="py-12 text-center text-[#718096]">
                        <CheckCircle2 size={24} className="text-[#168653] mx-auto mb-2" />
                        <p className="text-xs font-semibold">You have no pending follow-up tasks!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* My Assigned Leads */}
                <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
                  <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono pb-3 border-b border-[#E5E8ED] mb-4">
                    Active Leads Assigned to Me ({myAssignedLeads.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                          <th className="py-2 px-3">Customer</th>
                          <th className="py-2 px-3">Service</th>
                          <th className="py-2 px-3">Stage</th>
                          <th className="py-2 px-3">Priority</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E8ED]">
                        {myAssignedLeads.map((l) => (
                          <tr key={l.id} className="hover:bg-[#F8FAFC]">
                            <td className="py-2.5 px-3 font-semibold text-[#153650]">{l.customer?.fullName}</td>
                            <td className="py-2.5 px-3"><StatusBadge status={l.serviceType} type="service" size="sm" /></td>
                            <td className="py-2.5 px-3"><StatusBadge status={l.stage} type="lead" size="sm" /></td>
                            <td className="py-2.5 px-3"><StatusBadge status={l.priorityLevel} type="priority" size="sm" /></td>
                            <td className="py-2.5 px-3 text-right">
                              <Link href={`/admin/leads/${l.id}`} className="text-[#24689B] font-bold hover:underline">
                                Dossier →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: PRIORITY INBOX
               ========================================================================= */}
            {activeTab === 'inbox' && (
              <div className="space-y-6">
                {/* Urgent Leads */}
                <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#E5E8ED] mb-4">
                    <Flame size={16} className="text-[#D54747]" />
                    <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                      High Readiness & Urgent Enquiries ({urgentLeads.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-[#E5E8ED]">
                    {urgentLeads.map((l) => (
                      <div key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#153650] text-sm">{l.customer?.fullName}</span>
                            <StatusBadge status={l.serviceType} type="service" size="sm" />
                            <StatusBadge status={l.priorityLevel} type="priority" size="sm" />
                          </div>
                          <p className="text-[#718096] text-[11px] mt-0.5">
                            Phone: {l.customer?.phone} • Stage: {l.stage}
                          </p>
                        </div>
                        <Link
                          href={`/admin/leads/${l.id}`}
                          className="px-3 py-1.5 bg-[#153650] text-[#FFFFFF] text-xs font-semibold rounded-none self-start sm:self-auto"
                        >
                          Respond Now →
                        </Link>
                      </div>
                    ))}
                    {urgentLeads.length === 0 && (
                      <p className="py-6 text-center text-xs text-[#718096]">No high-priority leads flagged.</p>
                    )}
                  </div>
                </div>

                {/* Overdue Follow-ups */}
                <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#E5E8ED] mb-4">
                    <AlertTriangle size={16} className="text-[#C05621]" />
                    <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                      Overdue Follow-up Touchpoints ({overdueFollowUps.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-[#E5E8ED]">
                    {overdueFollowUps.map((f) => (
                      <div key={f.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="text-[11px] font-mono text-[#D54747] font-bold">
                            Due: {new Date(f.scheduledAt).toLocaleString()}
                          </span>
                          <p className="text-xs text-[#172B45] font-semibold mt-0.5">{f.reminderNote}</p>
                        </div>
                        <Link
                          href={`/admin/leads/${f.leadId}`}
                          className="px-3 py-1.5 border border-[#E5E8ED] text-[#153650] hover:bg-[#F9FAFB] text-xs font-semibold rounded-none"
                        >
                          Take Action
                        </Link>
                      </div>
                    ))}
                    {overdueFollowUps.length === 0 && (
                      <p className="py-6 text-center text-xs text-[#718096]">All follow-up touchpoints are up to date.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 4: RECENT ACTIVITY
               ========================================================================= */}
            {activeTab === 'activity' && (
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E8ED] mb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#24689B]" />
                    <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                      Live Operational Activity Log
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#718096]">
                    Real-time immutable audit trail
                  </span>
                </div>

                <div className="divide-y divide-[#E5E8ED]">
                  {auditLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#153650] uppercase font-mono text-[11px]">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-[#718096] font-mono">
                            by {log.actorName || log.actorId}
                          </span>
                        </div>
                        <p className="text-xs text-[#4A5568] mt-0.5">
                          {log.details || log.targetType}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[#A0AEC0] shrink-0 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="py-12 text-center text-xs text-[#718096]">
                      No recent activity records found.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
