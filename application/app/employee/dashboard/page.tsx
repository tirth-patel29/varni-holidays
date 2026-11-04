'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
import { getDashboardMetricsAction } from '@/app/actions/crm';
import { getGoogleSheetsStatusAction } from '@/app/actions/google-sheets';
import { useCrm } from '@/components/crm/CrmContext';

export default function DashboardPage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [metrics, setMetrics] = useState<any>(null);
  const [sheetsStatus, setSheetsStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [data, sheets] = await Promise.all([
        getDashboardMetricsAction(),
        getGoogleSheetsStatusAction(),
      ]);
      setMetrics(data);
      setSheetsStatus(sheets);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FBF9F5]">
      <CrmHeader
        title="CRM Operations Dashboard"
        subtitle={`Welcome back, ${currentUser.fullName}. Anand Headquarters Travel Desk.`}
        actions={
          <div className="flex items-center gap-2">
            {sheetsStatus?.config && (
              <a
                href={sheetsStatus.config.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#E9B95E] text-[#0B1E2E] font-black text-xs hover:bg-[#C29033] hover:text-white transition-colors shadow-sm inline-flex items-center gap-1.5"
                title="Open Live Business Google Sheet (Neel Patel Read-Only)"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Open Business Google Sheet</span>
              </a>
            )}

            <Link
              href="/employee/leads"
              className="px-3.5 py-2 rounded-xl bg-[#153650] text-white font-bold text-xs hover:bg-[#24689B] transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              <span>Pipeline Kanban</span>
            </Link>
          </div>
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {loading || !metrics ? (
          <div className="py-20 text-center text-[#153650]">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#C29033]">progress_activity</span>
            <p className="font-bold text-sm mt-2">Aggregating CRM Operations Data...</p>
          </div>
        ) : (
          <>
            {/* Super Admin Google Sheets Executive Sync Card */}
            {sheetsStatus?.config && (
              <div className="bg-white rounded-2xl p-5 border border-[#E3DCCB] shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">table_view</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-bold text-[#153650]">
                        Google Sheets Live Business Reporting
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        {sheetsStatus.config.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Strict One-Way Outbox Sync: PostgreSQL → Google Sheets (4 Tabs: ALL_LEADS, FOLLOW_UPS, BOOKINGS, BUSINESS_SUMMARY).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Successful Sync</span>
                    <span className="font-mono font-bold text-slate-700">
                      {sheetsStatus.config.lastSuccessfulSyncAt
                        ? new Date(sheetsStatus.config.lastSuccessfulSyncAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Pending Initial Sync'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Outbox Health</span>
                    <span className="font-bold text-emerald-700">
                      {sheetsStatus.counts?.failed > 0
                        ? `${sheetsStatus.counts.failed} Errors`
                        : `${sheetsStatus.counts?.completed || 0} Synced (0 Errors)`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={sheetsStatus.config.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#153650] text-white font-bold text-xs hover:bg-[#24689B] transition-colors shadow-xs inline-flex items-center gap-1"
                    >
                      <span>Open Sheet</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                    {isSuperAdmin && (
                      <Link
                        href="/admin/google-sheets"
                        className="px-3 py-1.5 rounded-xl bg-[#F5F2EB] border border-[#E3DCCB] text-[#153650] font-bold text-xs hover:bg-[#E5DEC9] transition-colors shadow-xs inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">settings</span>
                        <span>Manage Sync</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    Total Enquiries
                  </span>
                  <div className="font-serif text-3xl font-bold text-[#153650] mt-1">
                    {metrics.totalLeads}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                    All channels (Web & Anand desk)
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#153650]/10 text-[#153650] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">leaderboard</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    Fresh Requests
                  </span>
                  <div className="font-serif text-3xl font-bold text-sky-800 mt-1">
                    {metrics.requestsCount}
                  </div>
                  <span className="text-[11px] text-slate-600 font-bold mt-1 block">
                    Awaiting initial contact
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">inbox</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    Priority Intent
                  </span>
                  <div className="font-serif text-3xl font-bold text-[#C29033] mt-1">
                    {metrics.priorityCount}
                  </div>
                  <span className="text-[11px] text-amber-800 font-bold mt-1 block">
                    High intent & urgent dates
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#F7E5BD] text-[#453000] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">star</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    Conversion Rate
                  </span>
                  <div className="font-serif text-3xl font-bold text-emerald-800 mt-1">
                    {metrics.conversionRate}%
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                    {metrics.convertedCount} Converted Bookings
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
              </div>
            </div>

            {/* Service Distribution & Pipeline Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Service Volumes (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-[#153650]">Inquiries by Travel Service</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-emerald-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">luggage</span>
                        Tour Packages (Kerala & Curated)
                      </span>
                      <span className="text-[#153650]">{metrics.packagesCount} Leads</span>
                    </div>
                    <div className="w-full bg-[#F5F2EB] rounded-full h-3 overflow-hidden border border-[#E3DCCB]">
                      <div
                        className="bg-emerald-600 h-3 rounded-full"
                        style={{ width: `${(metrics.packagesCount / (metrics.totalLeads || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-sky-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">flight</span>
                        Flight Ticketing & Enquiries
                      </span>
                      <span className="text-[#153650]">{metrics.flightsCount} Leads</span>
                    </div>
                    <div className="w-full bg-[#F5F2EB] rounded-full h-3 overflow-hidden border border-[#E3DCCB]">
                      <div
                        className="bg-sky-600 h-3 rounded-full"
                        style={{ width: `${(metrics.flightsCount / (metrics.totalLeads || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-purple-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">badge</span>
                        Visa Consultation (Dubai, Schengen...)
                      </span>
                      <span className="text-[#153650]">{metrics.visaCount} Leads</span>
                    </div>
                    <div className="w-full bg-[#F5F2EB] rounded-full h-3 overflow-hidden border border-[#E3DCCB]">
                      <div
                        className="bg-purple-600 h-3 rounded-full"
                        style={{ width: `${(metrics.visaCount / (metrics.totalLeads || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E3DCCB] flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">Pending Follow-Ups Today:</span>
                  <span className="font-black text-[#153650] px-3 py-1 rounded-full bg-[#F5F2EB] border border-[#E3DCCB]">
                    {metrics.pendingFollowUps} Due
                  </span>
                </div>
              </div>

              {/* Recent Activity Feed (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-[#153650]">Live Activity Stream</h3>
                  <Link href="/employee/leads" className="text-xs font-bold text-[#24689B] hover:underline">
                    View Full Pipeline
                  </Link>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {metrics.recentActivities.map((act: any) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-[#F5F2EB]/80 border border-[#E3DCCB] flex items-start gap-3 text-xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#153650]/10 text-[#153650] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[15px]">
                          {act.type === 'CALL'
                            ? 'call'
                            : act.type === 'WHATSAPP_CLICK'
                            ? 'chat'
                            : act.type === 'STAGE_CHANGE'
                            ? 'published_with_changes'
                            : 'edit_note'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#153650] truncate">{act.title}</span>
                          <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                            {new Date(act.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium text-[11px] truncate mt-0.5">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
