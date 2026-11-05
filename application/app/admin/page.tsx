'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDashboardMetricsAction, getLeadsAction } from '@/app/actions/crm';
import { getBookingsAction } from '@/app/actions/phase3';
import { getGoogleSheetsStatusAction } from '@/app/actions/google-sheets';
import { useCrm } from '@/components/crm/CrmContext';
import { DEFAULT_USERS } from '@/lib/auth/session';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [metrics, setMetrics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [sheetsStatus, setSheetsStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsData, leadsData, bookingsRes, sheets] = await Promise.all([
        getDashboardMetricsAction(),
        getLeadsAction(),
        getBookingsAction(),
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

  // Calculate real workload per employee
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

  const confirmedBookingsCount = (Array.isArray(bookings) ? bookings : []).filter(
    (b) => b.status === 'CONFIRMED'
  ).length;

  const insuranceCount = leads.filter((l) => l.serviceType === 'TRAVEL_INSURANCE').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45] selection:bg-[#E9B95E]/30 selection:text-[#153650]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* =========================================================================
            1. DASHBOARD WELCOME BANNER WITH PANORAMIC MOUNTAIN LANDSCAPE
           ========================================================================= */}
        <section className="relative overflow-hidden bg-[#153650] border border-[#E5E8ED] rounded-none shadow-xs">
          {/* Panoramic Mountain Landscape Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/admin-mountain-banner.jpg"
              alt="Himalayan mountain lake dawn landscape reflecting morning sunbeams"
              fill
              priority
              className="object-cover object-[center_35%]"
              sizes="(max-width: 1400px) 100vw, 1400px"
            />
            {/* Soft ivory-to-navy mist gradient fade across left side to ensure high-contrast editorial typography */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(21, 54, 80, 0.94) 0%, rgba(21, 54, 80, 0.88) 38%, rgba(21, 54, 80, 0.5) 65%, rgba(21, 54, 80, 0.15) 100%)',
              }}
            />
          </div>

          {/* Banner Editorial Foreground Content */}
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
              Here&apos;s what&apos;s happening across Varni Holidays operations today. Monitor customer enquiries, tour package profitability, and consular visa progress from Anand HQ.
            </p>

            {/* Quick Action Navigation Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                href="/admin/leads"
                className="px-3.5 py-1.5 bg-[#E9B95E] hover:bg-[#F0C878] text-[#153650] font-bold text-xs rounded-none transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Lead Pipeline</span>
                <ArrowRight size={13} />
              </Link>

              <Link
                href="/admin/packages"
                className="px-3.5 py-1.5 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#153650] font-semibold text-xs rounded-none transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Compass size={13} className="text-[#24689B]" />
                <span>Tour Packages</span>
              </Link>

              {sheetsStatus?.config?.spreadsheetUrl && (
                <a
                  href={sheetsStatus.config.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#153650]/80 hover:bg-[#153650] text-[#FFFFFF] border border-[#FFFFFF]/30 font-medium text-xs rounded-none transition-colors inline-flex items-center gap-1.5"
                >
                  <Table size={13} className="text-[#55B98A]" />
                  <span>Live Google Sheet</span>
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

        {loading || !metrics ? (
          <div className="py-24 text-center text-[#718096] bg-[#FFFFFF] border border-[#E5E8ED] rounded-none">
            <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold tracking-wide uppercase font-mono">
              Loading executive analytics...
            </p>
          </div>
        ) : (
          <>
            {/* =========================================================================
                2. SIX RECTANGULAR KPI CARDS (SHARP 0-2PX GEOMETRY, CLEAN LIGHT THEME)
               ========================================================================= */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              
              {/* Card 1: Total Leads */}
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#CBD5E1] transition-colors shadow-xs">
                <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                  <span>Total Leads</span>
                  <Users size={15} className="text-[#153650]" />
                </div>
                <div className="text-2xl font-bold text-[#153650] mt-2 tabular-nums font-headline">
                  {metrics.totalLeads}
                </div>
                <div className="text-[10px] text-[#718096] mt-1 font-medium truncate">
                  Active database records
                </div>
              </div>

              {/* Card 2: New Enquiries */}
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#CBD5E1] transition-colors shadow-xs">
                <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                  <span>New Enquiries</span>
                  <Inbox size={15} className="text-[#24689B]" />
                </div>
                <div className="text-2xl font-bold text-[#24689B] mt-2 tabular-nums font-headline">
                  {metrics.requestsCount}
                </div>
                <div className="text-[10px] text-[#24689B] mt-1 font-semibold truncate">
                  Awaiting staff triage
                </div>
              </div>

              {/* Card 3: Priority Intent */}
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#CBD5E1] transition-colors shadow-xs">
                <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                  <span>Priority Intent</span>
                  <Flame size={15} className="text-[#C58A27]" />
                </div>
                <div className="text-2xl font-bold text-[#C58A27] mt-2 tabular-nums font-headline">
                  {metrics.priorityCount}
                </div>
                <div className="text-[10px] text-[#718096] mt-1 font-medium truncate">
                  High travel readiness
                </div>
              </div>

              {/* Card 4: Converted */}
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#CBD5E1] transition-colors shadow-xs">
                <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                  <span>Converted</span>
                  <CheckCircle2 size={15} className="text-[#168653]" />
                </div>
                <div className="text-2xl font-bold text-[#168653] mt-2 tabular-nums font-headline">
                  {metrics.convertedCount}
                </div>
                <div className="text-[10px] text-[#168653] mt-1 font-semibold truncate">
                  {metrics.conversionRate}% overall win rate
                </div>
              </div>

              {/* Card 5: Pending Tasks */}
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#CBD5E1] transition-colors shadow-xs">
                <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                  <span>Pending Tasks</span>
                  <Clock size={15} className="text-[#C58A27]" />
                </div>
                <div className="text-2xl font-bold text-[#172B45] mt-2 tabular-nums font-headline">
                  {metrics.pendingFollowUps}
                </div>
                <div className="text-[10px] text-[#718096] mt-1 font-medium truncate">
                  Scheduled follow-ups
                </div>
              </div>

              {/* Card 6: Confirmed Bookings */}
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 hover:border-[#CBD5E1] transition-colors shadow-xs">
                <div className="flex items-center justify-between text-[#718096] text-[11px] font-bold uppercase tracking-wider">
                  <span>Bookings</span>
                  <BookmarkCheck size={15} className="text-[#153650]" />
                </div>
                <div className="text-2xl font-bold text-[#153650] mt-2 tabular-nums font-headline">
                  {confirmedBookingsCount}
                </div>
                <div className="text-[10px] text-[#168653] mt-1 font-semibold truncate">
                  Voucher-ready files
                </div>
              </div>
            </div>

            {/* =========================================================================
                3. DASHBOARD ANALYTICS (INFLOW MOMENTUM & SERVICE DEMAND SPLIT)
               ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Analytics Panel A: Lead Inflow & Conversion Momentum (2 cols) */}
              <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 sm:p-6 flex flex-col justify-between shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5E8ED]">
                  <div>
                    <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                      Lead Inflow & Conversion Momentum
                    </h2>
                    <p className="text-xs text-[#718096] mt-0.5">
                      Weekly customer enquiries vs converted client itineraries
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[#153650]">
                      <span className="w-3 h-1 bg-[#24689B] inline-block" />
                      Inbound Enquiries
                    </span>
                    <span className="flex items-center gap-1.5 text-[#168653]">
                      <span className="w-3 h-1 bg-[#168653] inline-block" />
                      Converted Bookings
                    </span>
                  </div>
                </div>

                {/* Clean Light-Theme SVG Line & Area Chart */}
                <div className="h-48 w-full relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="135" x2="500" y2="135" stroke="#E2E8F0" strokeWidth="1" />

                    {/* Gradient Fill under Enquiries line */}
                    <defs>
                      <linearGradient id="adminLeadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#24689B" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#24689B" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="adminConvertGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#168653" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#168653" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Shaded Area for Enquiries */}
                    <path
                      d="M 0,110 Q 70,80 125,70 T 250,45 T 375,55 T 500,25 L 500,135 L 0,135 Z"
                      fill="url(#adminLeadGrad)"
                    />

                    {/* Enquiries Line (Navy / Blue) */}
                    <path
                      d="M 0,110 Q 70,80 125,70 T 250,45 T 375,55 T 500,25"
                      fill="none"
                      stroke="#24689B"
                      strokeWidth="2.5"
                    />

                    {/* Converted Line (Mint Green) */}
                    <path
                      d="M 0,130 Q 70,120 125,115 T 250,95 T 375,80 T 500,60"
                      fill="none"
                      stroke="#168653"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />

                    {/* Sharp Data Points */}
                    <rect x="247" y="42" width="6" height="6" fill="#24689B" stroke="#FFFFFF" strokeWidth="1" />
                    <rect x="497" y="22" width="6" height="6" fill="#24689B" stroke="#FFFFFF" strokeWidth="1" />
                    <rect x="497" y="57" width="6" height="6" fill="#168653" stroke="#FFFFFF" strokeWidth="1" />
                  </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[11px] font-mono text-[#718096] pt-3 border-t border-[#E5E8ED]">
                  <span>Week 1 (Oct)</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                  <span className="font-bold text-[#153650]">Current (Nov 2026)</span>
                </div>
              </div>

              {/* Analytics Panel B: Service Demand Split (1 col) */}
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 sm:p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="pb-3 border-b border-[#E5E8ED] mb-4">
                    <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                      Service Demand Split
                    </h2>
                    <p className="text-xs text-[#718096] mt-0.5">
                      Volume distribution across travel services
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Tour Packages */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 font-semibold text-[#153650]">
                          <Compass size={14} className="text-[#C58A27]" />
                          Holiday Packages
                        </span>
                        <span className="text-[#718096] font-mono font-medium tabular-nums">
                          {metrics.packagesCount} leads (
                          {metrics.totalLeads > 0
                            ? Math.round((metrics.packagesCount / metrics.totalLeads) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-none overflow-hidden">
                        <div
                          className="h-full bg-[#E9B95E] rounded-none"
                          style={{
                            width: `${
                              metrics.totalLeads > 0
                                ? (metrics.packagesCount / metrics.totalLeads) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Flight Ticketing */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 font-semibold text-[#153650]">
                          <Plane size={14} className="text-[#24689B]" />
                          Flight Ticketing
                        </span>
                        <span className="text-[#718096] font-mono font-medium tabular-nums">
                          {metrics.flightsCount} leads (
                          {metrics.totalLeads > 0
                            ? Math.round((metrics.flightsCount / metrics.totalLeads) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-none overflow-hidden">
                        <div
                          className="h-full bg-[#24689B] rounded-none"
                          style={{
                            width: `${
                              metrics.totalLeads > 0
                                ? (metrics.flightsCount / metrics.totalLeads) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Visa Processing */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 font-semibold text-[#153650]">
                          <Stamp size={14} className="text-[#168653]" />
                          Visa Processing
                        </span>
                        <span className="text-[#718096] font-mono font-medium tabular-nums">
                          {metrics.visaCount} leads (
                          {metrics.totalLeads > 0
                            ? Math.round((metrics.visaCount / metrics.totalLeads) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-none overflow-hidden">
                        <div
                          className="h-full bg-[#168653] rounded-none"
                          style={{
                            width: `${
                              metrics.totalLeads > 0
                                ? (metrics.visaCount / metrics.totalLeads) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Travel Insurance */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-1.5 font-semibold text-[#153650]">
                          <Shield size={14} className="text-[#64748B]" />
                          Travel Insurance
                        </span>
                        <span className="text-[#718096] font-mono font-medium tabular-nums">
                          {insuranceCount} leads (
                          {metrics.totalLeads > 0
                            ? Math.round((insuranceCount / metrics.totalLeads) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-none overflow-hidden">
                        <div
                          className="h-full bg-[#64748B] rounded-none"
                          style={{
                            width: `${
                              metrics.totalLeads > 0
                                ? (insuranceCount / metrics.totalLeads) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E5E8ED] text-[11px] text-[#718096] flex items-center justify-between">
                  <span className="font-mono">Database: PostgreSQL</span>
                  <span className="text-[#168653] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#168653] inline-block" />
                    100% Synchronised
                  </span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                4. RECENT ENQUIRIES TABLE & WORKLOAD SUMMARY
               ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Enquiries (2 cols) */}
              <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5E8ED]">
                  <div>
                    <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                      Recent Inbound Enquiries
                    </h2>
                    <p className="text-xs text-[#718096] mt-0.5">
                      Latest travel requirements logged across web, phone, and walk-in desks
                    </p>
                  </div>
                  <Link
                    href="/admin/leads"
                    className="px-3 py-1 bg-[#F7F8FA] hover:bg-[#E5E8ED] text-[#153650] text-xs font-semibold rounded-none border border-[#E5E8ED] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>View All in Pipeline</span>
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
                            <span className="inline-block px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#153650] border border-[#CBD5E1]">
                              {lead.serviceType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#718096] max-w-[200px] truncate font-medium">
                            {lead.serviceType === 'PACKAGE' && (lead.packageDetail?.packageName || 'Holiday Package')}
                            {lead.serviceType === 'FLIGHT' && `${lead.flightDetail?.originAirport?.split('-')[0] || 'AMD'} → ${lead.flightDetail?.destinationAirport?.split('-')[0] || 'DXB'}`}
                            {lead.serviceType === 'VISA' && `${lead.visaDetail?.destinationCountry || 'International'} Visa`}
                            {lead.serviceType === 'TRAVEL_INSURANCE' && `${lead.insuranceDetail?.destinationCountry || 'Global'} Insurance`}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${
                                lead.priorityLevel === 'URGENT'
                                  ? 'text-[#D54747] bg-[#FEF2F2] border border-[#FCDAD7]'
                                  : lead.priorityLevel === 'HIGH'
                                  ? 'text-[#C58A27] bg-[#FFFBEB] border border-[#FCE8C3]'
                                  : 'text-[#718096] bg-[#F1F5F9] border border-[#E2E8F0]'
                              }`}
                            >
                              {lead.priorityLevel}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-none text-[10px] font-semibold bg-[#F1F5F9] text-[#153650] border border-[#E2E8F0]">
                              {lead.stage}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/admin/leads/${lead.id}`}
                              className="font-bold text-[#24689B] hover:text-[#153650] hover:underline text-xs"
                            >
                              Inspect Dossier
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Staff Workload & Follow-ups Summary (1 col) */}
              <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E8ED] mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                        Staff Allocation
                      </h2>
                      <p className="text-xs text-[#718096] mt-0.5">
                        Enquiries assigned per specialist
                      </p>
                    </div>
                    <Link
                      href="/admin/users"
                      className="text-xs font-bold text-[#24689B] hover:text-[#153650] inline-flex items-center gap-1"
                    >
                      Staff Directory <ArrowUpRight size={12} />
                    </Link>
                  </div>

                  <div className="divide-y divide-[#E5E8ED]">
                    {employeeWorkload.map((emp) => (
                      <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-none bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#153650]">
                            {emp.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#153650] truncate">{emp.name}</p>
                            <p className="text-[10px] text-[#718096] uppercase font-mono truncate">{emp.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-right shrink-0">
                          <div>
                            <span className="text-xs font-bold text-[#172B45] tabular-nums block">
                              {emp.leadsCount} leads
                            </span>
                            <span className="text-[10px] text-[#168653] font-semibold block">
                              {emp.convertedCount} won
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#153650] px-2 py-0.5 rounded-none bg-[#F1F5F9] border border-[#CBD5E1]">
                            {emp.conversionRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E5E8ED] flex items-center justify-between text-xs">
                  <span className="text-[#718096]">Super Admin Access:</span>
                  <span className="font-bold text-[#153650]">{currentUser.fullName}</span>
                </div>
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}
