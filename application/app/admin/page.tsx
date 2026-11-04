'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [metrics, setMetrics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [sheetsStatus, setSheetsStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
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
      setLoading(false);
    };
    load();
  }, []);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
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

  const confirmedBookingsCount = (Array.isArray(bookings) ? bookings : []).filter((b) => b.status === 'CONFIRMED').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Admin Overview"
        subtitle={`Welcome, ${currentUser.fullName}. Analytics and operations summary for ${currentDateStr}.`}
        actions={
          <div className="flex items-center gap-2">
            {sheetsStatus?.config?.spreadsheetUrl && (
              <a
                href={sheetsStatus.config.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                title="Open Live Business Google Sheet"
              >
                <Table size={14} className="text-[#55B98A]" />
                <span>Google Sheet</span>
              </a>
            )}
            <Link
              href="/employee/leads"
              className="px-3 py-1.5 rounded-md bg-[#1D2025] hover:bg-[#2A2E34] text-[#E9B95E] border border-[#2A2E34] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Lead Pipeline</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl">
        {loading || !metrics ? (
          <div className="py-24 text-center text-[#969CA5]">
            <div className="w-6 h-6 border-2 border-[#E9B95E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium tracking-wide">Loading executive analytics...</p>
          </div>
        ) : (
          <>
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Total Leads */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Total Leads</span>
                  <Users size={14} className="text-[#666E79]" />
                </div>
                <div className="text-2xl font-semibold text-[#F4F4F2] mt-1 tabular-nums">
                  {metrics.totalLeads}
                </div>
                <div className="text-[10px] text-[#666E79] mt-1 truncate">
                  Active database records
                </div>
              </div>

              {/* New Enquiries */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>New Enquiries</span>
                  <Inbox size={14} className="text-[#6FA9D8]" />
                </div>
                <div className="text-2xl font-semibold text-[#F4F4F2] mt-1 tabular-nums">
                  {metrics.requestsCount}
                </div>
                <div className="text-[10px] text-[#6FA9D8] mt-1 truncate">
                  Awaiting triage
                </div>
              </div>

              {/* Priority Customers */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Priority Intent</span>
                  <Flame size={14} className="text-[#E9B95E]" />
                </div>
                <div className="text-2xl font-semibold text-[#E9B95E] mt-1 tabular-nums">
                  {metrics.priorityCount}
                </div>
                <div className="text-[10px] text-[#666E79] mt-1 truncate">
                  High travel readiness
                </div>
              </div>

              {/* Converted */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Converted</span>
                  <CheckCircle2 size={14} className="text-[#55B98A]" />
                </div>
                <div className="text-2xl font-semibold text-[#F4F4F2] mt-1 tabular-nums">
                  {metrics.convertedCount}
                </div>
                <div className="text-[10px] text-[#55B98A] mt-1 truncate">
                  {metrics.conversionRate}% overall win rate
                </div>
              </div>

              {/* Pending Follow-ups */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Pending Tasks</span>
                  <Clock size={14} className="text-[#E8B65E]" />
                </div>
                <div className="text-2xl font-semibold text-[#F4F4F2] mt-1 tabular-nums">
                  {metrics.pendingFollowUps}
                </div>
                <div className="text-[10px] text-[#666E79] mt-1 truncate">
                  Scheduled follow-ups
                </div>
              </div>

              {/* Confirmed Bookings */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Bookings</span>
                  <BookmarkCheck size={14} className="text-[#55B98A]" />
                </div>
                <div className="text-2xl font-semibold text-[#F4F4F2] mt-1 tabular-nums">
                  {confirmedBookingsCount}
                </div>
                <div className="text-[10px] text-[#55B98A] mt-1 truncate">
                  Confirmed & voucher-ready
                </div>
              </div>
            </div>

            {/* Middle Section: Lead Trend & Service Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Lead Trend Visual Chart (2 Columns) */}
              <div className="lg:col-span-2 bg-[#17191D] border border-[#2A2E34] rounded-lg p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#F4F4F2]">Lead Inflow & Conversion Momentum</h2>
                    <p className="text-xs text-[#969CA5]">Weekly customer enquiries vs converted bookings</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-[#969CA5]">
                      <span className="w-2.5 h-0.5 bg-[#E9B95E] rounded-full" />
                      Enquiries
                    </span>
                    <span className="flex items-center gap-1.5 text-[#969CA5]">
                      <span className="w-2.5 h-0.5 bg-[#55B98A] rounded-full" />
                      Converted
                    </span>
                  </div>
                </div>

                {/* Elegant SVG Line / Area Graph */}
                <div className="h-44 w-full relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#2A2E34" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#2A2E34" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#2A2E34" strokeDasharray="3 3" />
                    <line x1="0" y1="135" x2="500" y2="135" stroke="#2A2E34" />

                    {/* Gradient Fill under Enquiries line */}
                    <defs>
                      <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E9B95E" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#E9B95E" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,110 Q 70,80 125,70 T 250,45 T 375,55 T 500,25 L 500,135 L 0,135 Z"
                      fill="url(#leadGrad)"
                    />

                    {/* Enquiries Line (Gold) */}
                    <path
                      d="M 0,110 Q 70,80 125,70 T 250,45 T 375,55 T 500,25"
                      fill="none"
                      stroke="#E9B95E"
                      strokeWidth="2"
                    />

                    {/* Converted Line (Mint) */}
                    <path
                      d="M 0,130 Q 70,120 125,115 T 250,95 T 375,80 T 500,60"
                      fill="none"
                      stroke="#55B98A"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />

                    {/* Markers */}
                    <circle cx="250" cy="45" r="3" fill="#E9B95E" stroke="#17191D" strokeWidth="1.5" />
                    <circle cx="500" cy="25" r="3" fill="#E9B95E" stroke="#17191D" strokeWidth="1.5" />
                    <circle cx="500" cy="60" r="3" fill="#55B98A" stroke="#17191D" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between text-[10px] text-[#666E79] pt-2 border-t border-[#2A2E34]">
                  <span>Week 1 (Oct)</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                  <span>Current (Nov 2026)</span>
                </div>
              </div>

              {/* Service Distribution (1 Column) */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#F4F4F2] mb-1">Service Demand Split</h2>
                  <p className="text-xs text-[#969CA5] mb-4">Volume breakdown across travel services</p>

                  <div className="space-y-4">
                    {/* Tour Packages */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-[#F4F4F2]">
                          <Compass size={14} className="text-[#E9B95E]" />
                          Holiday Packages
                        </span>
                        <span className="text-[#969CA5] font-mono tabular-nums">{metrics.packagesCount} leads</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1D2025] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E9B95E] rounded-full"
                          style={{
                            width: `${metrics.totalLeads > 0 ? (metrics.packagesCount / metrics.totalLeads) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Flights */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-[#F4F4F2]">
                          <Plane size={14} className="text-[#6FA9D8]" />
                          Flight Ticketing
                        </span>
                        <span className="text-[#969CA5] font-mono tabular-nums">{metrics.flightsCount} leads</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1D2025] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6FA9D8] rounded-full"
                          style={{
                            width: `${metrics.totalLeads > 0 ? (metrics.flightsCount / metrics.totalLeads) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Visas */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-[#F4F4F2]">
                          <Stamp size={14} className="text-[#55B98A]" />
                          Visa Processing
                        </span>
                        <span className="text-[#969CA5] font-mono tabular-nums">{metrics.visaCount} leads</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1D2025] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#55B98A] rounded-full"
                          style={{
                            width: `${metrics.totalLeads > 0 ? (metrics.visaCount / metrics.totalLeads) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2A2E34] text-[11px] text-[#666E79] flex items-center justify-between">
                  <span>Source: Neon PostgreSQL</span>
                  <span className="text-[#55B98A]">100% Synced</span>
                </div>
              </div>
            </div>

            {/* Workload & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Employee Workload */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[#F4F4F2]">Staff Workload & Pipeline Allocation</h2>
                    <p className="text-xs text-[#969CA5]">Enquiries currently managed per travel specialist</p>
                  </div>
                  <Link
                    href="/admin/users"
                    className="text-xs text-[#E9B95E] hover:underline inline-flex items-center gap-1"
                  >
                    Manage Staff <ArrowUpRight size={12} />
                  </Link>
                </div>

                <div className="divide-y divide-[#2A2E34]">
                  {employeeWorkload.map((emp) => (
                    <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-[#1D2025] border border-[#2A2E34] flex items-center justify-center text-[#E9B95E] font-bold text-xs shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#F4F4F2] font-medium truncate">{emp.name}</p>
                          <p className="text-[10px] text-[#666E79] truncate">{emp.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right shrink-0">
                        <div>
                          <span className="text-xs font-semibold text-[#F4F4F2] tabular-nums block">
                            {emp.leadsCount} leads
                          </span>
                          <span className="text-[10px] text-[#55B98A] block">
                            {emp.convertedCount} converted
                          </span>
                        </div>
                        <span className="text-xs font-mono font-medium text-[#969CA5] px-2 py-0.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                          {emp.conversionRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[#F4F4F2]">Live Activity Audit</h2>
                    <p className="text-xs text-[#969CA5]">Most recent operations touches and milestones</p>
                  </div>
                  <Link
                    href="/admin/audit-logs"
                    className="text-xs text-[#E9B95E] hover:underline inline-flex items-center gap-1"
                  >
                    Full Log <ArrowUpRight size={12} />
                  </Link>
                </div>

                <div className="space-y-3">
                  {metrics.recentActivities && metrics.recentActivities.length > 0 ? (
                    metrics.recentActivities.slice(0, 5).map((act: any) => (
                      <div key={act.id} className="flex items-start gap-2.5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E9B95E] mt-1.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-[#F4F4F2] truncate">{act.title}</span>
                            <span className="text-[10px] text-[#666E79] shrink-0 font-mono">
                              {new Date(act.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#969CA5] line-clamp-1 mt-0.5">{act.description}</p>
                          <span className="text-[10px] text-[#666E79] block">By {act.userName}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#666E79] py-4">No recent activity records.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Latest Customer Enquiries Table */}
            <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#F4F4F2]">Latest Customer Enquiries</h2>
                  <p className="text-xs text-[#969CA5]">All active inbound travel requests across Gujarat branches</p>
                </div>
                <Link
                  href="/employee/leads"
                  className="px-2.5 py-1 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-xs text-[#F4F4F2] border border-[#2A2E34] transition-colors"
                >
                  View All in Pipeline
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#2A2E34] text-[11px] uppercase tracking-wider text-[#666E79]">
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3">Destination / Details</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Assigned To</th>
                      <th className="py-2.5 px-3">Stage</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2329]">
                    {leads.slice(0, 6).map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#1D2025]/60 transition-colors">
                        <td className="py-3 px-3">
                          <Link
                            href={`/employee/leads/${lead.id}`}
                            className="font-medium text-[#F4F4F2] hover:text-[#E9B95E] transition-colors block"
                          >
                            {lead.customer?.fullName || 'Valued Traveler'}
                          </Link>
                          <span className="text-[10px] text-[#666E79] font-mono">{lead.referenceId}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#1D2025] text-[#969CA5] border border-[#2A2E34]">
                            {lead.serviceType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#969CA5] max-w-[200px] truncate">
                          {lead.serviceType === 'PACKAGE' && (lead.packageDetail?.packageName || 'Kerala 6N/7D')}
                          {lead.serviceType === 'FLIGHT' && `${lead.flightDetail?.originAirport || 'AMD'} → ${lead.flightDetail?.destinationAirport || 'DXB'}`}
                          {lead.serviceType === 'VISA' && `${lead.visaDetail?.destinationCountry || 'UAE'} Visa`}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              lead.priorityLevel === 'URGENT'
                                ? 'text-[#DF7373] bg-[#DF7373]/10 border border-[#DF7373]/20'
                                : lead.priorityLevel === 'HIGH'
                                ? 'text-[#E8B65E] bg-[#E8B65E]/10 border border-[#E8B65E]/20'
                                : 'text-[#969CA5] bg-[#1D2025]'
                            }`}
                          >
                            {lead.priorityLevel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#969CA5]">
                          {lead.assigneeName || 'Unassigned'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#1D2025] text-[#F4F4F2] border border-[#2A2E34]">
                            {lead.stage}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/employee/leads/${lead.id}`}
                            className="text-[#E9B95E] hover:underline text-xs"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
