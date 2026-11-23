'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getCrmDashboardMetricsAction } from '@/app/actions/crm-unified';
import {
  TrendingUp,
  RotateCw,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  DollarSign,
  PieChart,
  Users,
  Target,
  XCircle,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export default function SalesAnalyticsPage() {
  const [dateFilter, setDateFilter] = useState<'TODAY' | '7D' | '30D' | 'MONTH' | 'ALL'>('30D');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (filter = dateFilter) => {
    setLoading(true);
    try {
      const res = await getCrmDashboardMetricsAction(filter);
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (e) {
      console.error('Failed to load sales analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(dateFilter);
  }, [dateFilter]);

  const kpis = metrics?.kpis || {
    totalLeads: 0,
    wonDeals: 0,
    lostDeals: 0,
    conversionRate: 0,
    pipelineValueInr: 0,
    realizedRevenueInr: 0,
  };

  const stageBreakdown = metrics?.stageBreakdown || [];
  const sourceBreakdown = metrics?.sourceBreakdown || [];
  const staffPerformance = metrics?.staffPerformance || [];
  const lossReasonBreakdown = metrics?.lossReasonBreakdown || [];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="CRM Pipeline & Sales Analytics"
        subtitle="Real-time conversion metrics, channel attribution, employee leaderboard, and pipeline valuation"
        breadcrumbs={[
          { label: 'Reports & Analytics', href: '/admin/reports' },
          { label: 'CRM Sales Analytics' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* DATE FILTER BUTTONS */}
            <div className="flex items-center bg-[#FFFFFF] border border-[#E5E8ED] p-0.5 text-xs font-semibold">
              {(['TODAY', '7D', '30D', 'MONTH', 'ALL'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDateFilter(tab)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${
                    dateFilter === tab
                      ? 'bg-[#153650] text-[#FFFFFF]'
                      : 'text-[#667085] hover:text-[#153650] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {tab === '7D' ? 'Last 7 Days' : tab === '30D' ? 'Last 30 Days' : tab === 'MONTH' ? 'This Month' : tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => loadData(dateFilter)}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* TOPLINE KPI TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#FFFFFF] p-3.5 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Total Leads</span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">{kpis.totalLeads}</div>
            <p className="text-[10px] text-[#718096] mt-0.5">Logged briefs</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Won Deals</span>
            <div className="text-xl font-bold text-[#168653] mt-1 font-headline">{kpis.wonDeals}</div>
            <p className="text-[10px] text-[#168653] mt-0.5">Converted files</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Lost Deals</span>
            <div className="text-xl font-bold text-[#DC2626] mt-1 font-headline">{kpis.lostDeals}</div>
            <p className="text-[10px] text-[#DC2626] mt-0.5">With reason logged</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Win Rate</span>
            <div className="text-xl font-bold text-[#24689B] mt-1 font-headline">{kpis.conversionRate}%</div>
            <p className="text-[10px] text-[#24689B] mt-0.5">Won / Closed leads</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Pipeline Value</span>
            <div className="text-lg font-bold text-[#153650] mt-1 font-mono">
              ₹{(kpis.pipelineValueInr || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-[#718096] mt-0.5">Active negotiation</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Realized Revenue</span>
            <div className="text-lg font-bold text-[#168653] mt-1 font-mono">
              ₹{(kpis.realizedRevenueInr || 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-[#168653] mt-0.5">Won bookings value</p>
          </div>
        </div>

        {/* 2 COLUMN SECTION: PIPELINE STAGE DISTRIBUTION & CHANNEL SOURCES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PIPELINE STAGES */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono flex items-center gap-2">
                <Target size={14} className="text-[#24689B]" />
                <span>Pipeline Stage Distribution</span>
              </h3>
              <Link href="/admin/leads" className="text-xs text-[#24689B] font-bold hover:underline">
                View Kanban →
              </Link>
            </div>

            <div className="space-y-3">
              {stageBreakdown.map((st: any) => {
                const pct = kpis.totalLeads > 0 ? Math.round((st.count / kpis.totalLeads) * 100) : 0;
                return (
                  <div key={st.stage} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#153650]">{st.label || st.stage}</span>
                      <span className="font-mono text-[#667085]">
                        <strong className="text-[#153650]">{st.count}</strong> leads ({pct}%) • ₹{(st.valueInr || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] h-2">
                      <div
                        className="bg-[#153650] h-2 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {stageBreakdown.length === 0 && (
                <p className="py-6 text-center text-[#718096] text-xs">No pipeline activity recorded.</p>
              )}
            </div>
          </div>

          {/* CHANNEL ATTRIBUTION */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono flex items-center gap-2">
                <PieChart size={14} className="text-[#168653]" />
                <span>Lead Channel Attribution</span>
              </h3>
              <Link href="/admin/inbox" className="text-xs text-[#24689B] font-bold hover:underline">
                Unified Inbox →
              </Link>
            </div>

            <div className="space-y-3">
              {sourceBreakdown.map((src: any) => {
                const pct = kpis.totalLeads > 0 ? Math.round((src.count / kpis.totalLeads) * 100) : 0;
                return (
                  <div key={src.source} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#153650]">{src.source}</span>
                      <span className="font-mono text-[#667085]">
                        <strong className="text-[#153650]">{src.count}</strong> inquiries ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] h-2">
                      <div
                        className="bg-[#24689B] h-2 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {sourceBreakdown.length === 0 && (
                <p className="py-6 text-center text-[#718096] text-xs">No channel attribution logged.</p>
              )}
            </div>
          </div>
        </div>

        {/* 2 COLUMN SECTION: TEAM LEADERBOARD & LOSS REASONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EMPLOYEE PERFORMANCE */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono flex items-center gap-2">
                <Users size={14} className="text-[#D97706]" />
                <span>Consultant & Sales Leaderboard</span>
              </h3>
              <span className="text-[10px] font-mono text-[#718096]">Round-Robin Assigned</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E5E8ED] text-[10px] uppercase text-[#718096] bg-[#F8FAFC]">
                    <th className="py-2 px-2.5">Consultant</th>
                    <th className="py-2 px-2.5">Assigned</th>
                    <th className="py-2 px-2.5">Won</th>
                    <th className="py-2 px-2.5">Win Rate</th>
                    <th className="py-2 px-2.5 text-right">Won Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8ED]">
                  {staffPerformance.map((emp: any) => (
                    <tr key={emp.staffId} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-2.5 font-bold text-[#153650]">{emp.name}</td>
                      <td className="py-2.5 px-2.5 font-mono">{emp.assignedCount}</td>
                      <td className="py-2.5 px-2.5 font-mono text-[#168653] font-bold">{emp.wonCount}</td>
                      <td className="py-2.5 px-2.5 font-mono font-bold text-[#24689B]">{emp.winRate}%</td>
                      <td className="py-2.5 px-2.5 font-mono text-right font-semibold">
                        ₹{(emp.wonRevenueInr || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {staffPerformance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#718096]">
                        No consultant activity during this date filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* LOSS REASONS */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono flex items-center gap-2">
                <XCircle size={14} className="text-[#DC2626]" />
                <span>Lost Deal Root Cause Analysis</span>
              </h3>
              <span className="text-[10px] font-mono text-[#DC2626] font-bold">{kpis.lostDeals} Total Lost</span>
            </div>

            <div className="space-y-3">
              {lossReasonBreakdown.map((r: any) => {
                const pct = kpis.lostDeals > 0 ? Math.round((r.count / kpis.lostDeals) * 100) : 0;
                return (
                  <div key={r.reason} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#153650]">{r.reason}</span>
                      <span className="font-mono text-[#667085]">
                        <strong className="text-[#DC2626]">{r.count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] h-2">
                      <div
                        className="bg-[#DC2626] h-2 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {lossReasonBreakdown.length === 0 && (
                <p className="py-6 text-center text-[#718096] text-xs">
                  {kpis.lostDeals === 0 ? 'No lost deals in this period!' : 'No reason breakdown available.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
