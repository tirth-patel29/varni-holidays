'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { useCrm } from '@/components/crm/CrmContext';
import {
  getGoogleSheetsStatusAction,
  triggerManualSyncAction,
  retryFailedJobsAction,
  testGoogleSheetsConnectionAction,
  updateGoogleSheetsSettingsAction,
  disconnectGoogleSheetsAction,
} from '@/app/actions/google-sheets';

export default function GoogleSheetsAdminPage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    const res = await getGoogleSheetsStatusAction();
    setData(res);
    setSpreadsheetIdInput(res.config.spreadsheetId);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualSync = async () => {
    setActionLoading(true);
    setFeedback({ type: 'info', text: 'Executing live reconciliation across all 4 sheets...' });
    const res = await triggerManualSyncAction();
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Sync Complete: Reconciled ${res.syncedLeads} leads, ${res.syncedFollowUps} follow-ups, and ${res.syncedBookings} bookings into Google Sheets.`,
      });
    } else {
      setFeedback({ type: 'error', text: `Sync failed: ${res.error}` });
    }
    await loadData();
    setActionLoading(false);
  };

  const handleTestConnection = async () => {
    setActionLoading(true);
    const res = await testGoogleSheetsConnectionAction();
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Connection Validated [${res.mode}]: ${res.message}`,
      });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
    await loadData();
    setActionLoading(false);
  };

  const handleRetryFailed = async () => {
    setActionLoading(true);
    const res = await retryFailedJobsAction();
    setFeedback({
      type: 'success',
      text: `Retried ${res.retriedCount} failed synchronization jobs. Processed: ${res.processResult.processed}.`,
    });
    await loadData();
    setActionLoading(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await updateGoogleSheetsSettingsAction({ spreadsheetId: spreadsheetIdInput });
    setFeedback({ type: 'success', text: 'Spreadsheet configuration successfully updated.' });
    await loadData();
    setActionLoading(false);
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect live Google Sheets synchronization?')) return;
    setActionLoading(true);
    await disconnectGoogleSheetsAction();
    setFeedback({ type: 'info', text: 'Google Sheets synchronization disconnected.' });
    await loadData();
    setActionLoading(false);
  };

  const cfg = data?.config;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <CrmHeader
        title="Google Sheets Live Business Reporting"
        subtitle="One-way transactional outbox synchronization: PostgreSQL → Google Sheets (Read-only executive reporting for Neel Patel)."
        actions={
          cfg && (
            <a
              href={cfg.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#E9B95E] text-[#0B1E2E] font-black text-xs shadow hover:bg-[#C29033] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>Open Business Google Sheet</span>
            </a>
          )
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : feedback.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-300'
                : 'bg-sky-50 text-sky-900 border-sky-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {feedback.type === 'success' ? 'check_circle' : feedback.type === 'error' ? 'error' : 'info'}
              </span>
              <span className="font-medium">{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Governance & Architecture Notice */}
        <div className="clay-card rounded-2xl p-5 bg-[#FBF9F5] border border-[#C29033]/40 text-xs text-slate-700 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#153650]">
            <span className="material-symbols-outlined text-[#C29033]">shield</span>
            <span>Strict One-Way Synchronization Governance</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            • <strong>Sole Source of Truth:</strong> PostgreSQL remains the only system of record. Changes made inside Google Sheets are never imported back into the CRM.<br />
            • <strong>Viewer Privilege:</strong> Neel Patel has read-only Viewer access to the workbook. Operational records are managed exclusively through the CRM desk.<br />
            • <strong>Zero Sensitive Leakage:</strong> Passport details, DOB, confidential supplier net rates, and margins are strictly stripped from all outbound sheet payloads.<br />
            • <strong>Outbox Resilience:</strong> Google API outages or rate limits are captured in the outbox queue and will never interrupt CRM desk operations.
          </p>
        </div>

        {/* Status & Control KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sync Status</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  cfg?.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </div>
            <div className="font-serif text-xl font-bold text-[#153650]">
              {loading ? '...' : cfg?.status || 'DISCONNECTED'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {data?.isLive ? 'Live GCP Service Account' : 'Development Simulation Mirror'}
            </div>
          </div>

          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Sync</span>
              <span className="material-symbols-outlined text-slate-400 text-lg">history</span>
            </div>
            <div className="font-mono text-sm font-bold text-[#153650]">
              {loading
                ? '...'
                : cfg?.lastSuccessfulSyncAt
                ? new Date(cfg.lastSuccessfulSyncAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : 'Never'}
            </div>
            <div className="text-[11px] text-slate-500">
              {cfg?.lastSuccessfulSyncAt
                ? new Date(cfg.lastSuccessfulSyncAt).toLocaleDateString('en-IN')
                : 'Pending initial sync'}
            </div>
          </div>

          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Outbox Queue</span>
              <span className="material-symbols-outlined text-slate-400 text-lg">sync_alt</span>
            </div>
            <div className="font-serif text-xl font-bold text-[#153650]">
              {loading ? '...' : data?.counts.pending || 0} Pending
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              {data?.counts.completed || 0} Successfully Synced
            </div>
          </div>

          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed Jobs</span>
              <span className="material-symbols-outlined text-rose-500 text-lg">report_problem</span>
            </div>
            <div className="font-serif text-xl font-bold text-rose-800">
              {loading ? '...' : data?.counts.failed || 0}
            </div>
            <div className="text-[11px] text-slate-500">
              {data?.counts.failed > 0 ? (
                <button
                  onClick={handleRetryFailed}
                  disabled={actionLoading}
                  className="text-rose-700 font-bold hover:underline"
                >
                  Retry Failed Jobs Now
                </button>
              ) : (
                'All jobs healthy'
              )}
            </div>
          </div>
        </div>

        {/* Operational Actions Bar */}
        <div className="clay-card rounded-3xl p-6 border border-[#E3DCCB] bg-white space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E3DCCB] pb-4">
            <div>
              <h3 className="font-serif font-bold text-[#153650] text-lg">Sync Operations & Governance Controls</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Trigger live reconciliation, test service account connectivity, or retry failed transactional queue items.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSync}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-[#153650] text-white font-bold text-xs hover:bg-[#24689B] transition-colors shadow flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>{actionLoading ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                onClick={handleTestConnection}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E3DCCB] text-[#153650] font-bold text-xs hover:bg-[#F5F2EB] transition-colors shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">cable</span>
                <span>Test Connection</span>
              </button>

              {data?.counts.failed > 0 && (
                <button
                  onClick={handleRetryFailed}
                  disabled={actionLoading}
                  className="px-3.5 py-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs hover:bg-rose-200 transition-colors shadow-xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  <span>Retry ({data.counts.failed})</span>
                </button>
              )}

              <button
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">power_off</span>
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#153650] uppercase mb-1.5">
                Target Google Spreadsheet ID
              </label>
              <input
                type="text"
                required
                value={spreadsheetIdInput}
                onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E3DCCB] bg-[#FBF9F5] text-xs font-mono text-slate-800 focus:outline-none focus:bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Found in your Google Sheet URL: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
              </span>
            </div>

            <div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-[#153650] text-white font-bold text-xs hover:bg-[#0B1E2E] shadow transition-colors"
              >
                Save Spreadsheet ID
              </button>
            </div>
          </form>
        </div>

        {/* 4 Tabs Architecture Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#153650]">Tab 1: ALL_LEADS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">14 Columns</span>
            </div>
            <p className="text-xs text-slate-600">
              Live customer inquiries with Lead ID, contact details, service category, destination, pipeline stage, priority, and assigned staff.
            </p>
          </div>

          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#153650]">Tab 2: FOLLOW_UPS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">7 Columns</span>
            </div>
            <p className="text-xs text-slate-600">
              Scheduled customer callback appointments, assigned agents, target due dates, and completion timestamps.
            </p>
          </div>

          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#153650]">Tab 3: BOOKINGS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">8 Columns</span>
            </div>
            <p className="text-xs text-slate-600">
              Confirmed customer bookings with unique booking references, passenger details, travel dates, and status milestones.
            </p>
          </div>

          <div className="clay-card rounded-2xl p-5 border border-[#E3DCCB] bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#153650]">Tab 4: BUSINESS_SUMMARY</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">Executive KPI</span>
            </div>
            <p className="text-xs text-slate-600">
              Automated database-derived metrics, stage counts, employee-wise conversion %, and service-wise conversion efficiency.
            </p>
          </div>
        </div>

        {/* Transactional Outbox Queue Audit Table */}
        <div className="clay-card rounded-3xl overflow-hidden border border-[#E3DCCB] bg-white shadow-sm">
          <div className="p-6 border-b border-[#E3DCCB] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-[#153650] text-lg">Transactional Outbox Queue</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Every CRM database transaction commits an outbox event before synchronization.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-[#F5F2EB] px-3 py-1 rounded-full border border-[#E3DCCB]">
              Recent 20 Outbox Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E5DEC9]/80 text-[#153650] uppercase text-[10px] font-black tracking-wider border-b border-[#E3DCCB]">
                <tr>
                  <th className="px-6 py-4">Job ID</th>
                  <th className="px-5 py-4">Event Type</th>
                  <th className="px-5 py-4">Target Tab</th>
                  <th className="px-5 py-4">Entity ID</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Retries</th>
                  <th className="px-6 py-4">Scheduled At (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCB]/60 bg-[#FBF9F5]/60 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-sans">
                      Loading synchronization queue...
                    </td>
                  </tr>
                ) : data?.recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-sans">
                      No synchronization jobs queued.
                    </td>
                  </tr>
                ) : (
                  data?.recentJobs.map((job: any) => (
                    <tr key={job.id} className="hover:bg-[#F5F2EB] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#153650]">{job.id}</td>

                      <td className="px-5 py-4 font-sans font-bold">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#153650]/10 text-[#153650] border border-[#153650]/20">
                          {job.eventType}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-700">{job.targetTab}</td>

                      <td className="px-5 py-4 text-slate-600">{job.entityId}</td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            job.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : job.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {job.status === 'COMPLETED' ? 'check' : job.status === 'PENDING' ? 'hourglass_empty' : 'warning'}
                          </span>
                          {job.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center font-bold text-slate-700">
                        {job.retryCount} / {job.maxRetries}
                      </td>

                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(job.scheduledAt).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

