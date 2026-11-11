'use client';

import React, { useState, useEffect } from 'react';
import { useCrm } from '@/components/crm/CrmContext';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
import {
  getGoogleSheetsStatusAction,
  triggerManualSyncAction,
  retryFailedJobsAction,
  testGoogleSheetsConnectionAction,
  updateGoogleSheetsSettingsAction,
  disconnectGoogleSheetsAction,
} from '@/app/actions/google-sheets';
import {
  Table,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Settings,
  X,
  History,
  Layers,
  Link as LinkIcon,
  Check,
  Play,
} from 'lucide-react';

export default function GoogleSheetsAdminPage() {
  const { currentUser } = useCrm();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState('');
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [showAppsScript, setShowAppsScript] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getGoogleSheetsStatusAction();
      setData(res);
      setSpreadsheetIdInput(res.config.spreadsheetId);
      setWebhookUrlInput(res.config.webhookUrl || '');
    } catch (err) {
      console.error('Failed to load Google Sheets config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualSync = async () => {
    setActionLoading(true);
    setFeedback({ type: 'info', text: 'Executing live outbox reconciliation into Google Sheets...' });
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
    await updateGoogleSheetsSettingsAction({ spreadsheetId: spreadsheetIdInput, webhookUrl: webhookUrlInput });
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <Breadcrumbs items={[{ label: 'Settings & Team', href: '/admin/settings/roles' }, { label: 'Google Sheets Integration' }]} />
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#168653] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                External Sync & Reporting
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Google Sheets Live Sync
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Transactional outbox synchronization: PostgreSQL → Google Sheets (Read-only executive replica for Neel Patel).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {cfg?.spreadsheetUrl && (
              <a
                href={cfg.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Table size={13} className="text-[#E9B95E]" />
                <span>Open Google Sheet</span>
                <ExternalLink size={11} />
              </a>
            )}

            <button
              onClick={handleManualSync}
              disabled={actionLoading}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#153650] border border-[#E5E8ED] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={actionLoading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-none border text-xs font-medium flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-[#F0FDF4] border-[#D1F0E0] text-[#168653]'
                : feedback.type === 'error'
                ? 'bg-[#FEF2F2] border-[#FCDAD7] text-[#D54747]'
                : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
            }`}
          >
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="hover:opacity-75">
              <X size={14} />
            </button>
          </div>
        )}

        {/* 4 Status KPI Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
                Connection Status
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2 h-2 ${cfg?.enabled ? 'bg-[#168653]' : 'bg-[#D54747]'}`} />
                <span className="text-sm font-bold text-[#153650] font-mono">
                  {cfg?.enabled ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <span className="text-[10px] text-[#718096] mt-1 block">Mode: {cfg?.mode || 'Apps Script Webhook'}</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
                Pending Outbox
              </span>
              <div className="text-xl font-bold text-[#153650] mt-1.5 font-headline tabular-nums">
                {data.outbox.pending} jobs
              </div>
              <span className="text-[10px] text-[#718096] mt-1 block">Awaiting batch delivery</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
                Synced Records
              </span>
              <div className="text-xl font-bold text-[#168653] mt-1.5 font-headline tabular-nums">
                {data.outbox.completed} jobs
              </div>
              <span className="text-[10px] text-[#168653] font-semibold mt-1 block">Successfully reconciled</span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
                Failed Attempts
              </span>
              <div className="text-xl font-bold text-[#D54747] mt-1.5 font-headline tabular-nums">
                {data.outbox.failed} jobs
              </div>
              {data.outbox.failed > 0 ? (
                <button
                  onClick={handleRetryFailed}
                  className="text-[10px] font-bold text-[#D54747] hover:underline mt-1 block"
                >
                  Retry All Failed
                </button>
              ) : (
                <span className="text-[10px] text-[#718096] mt-1 block">Zero sync errors</span>
              )}
            </div>
          </div>
        )}

        {/* Configuration Form Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                Spreadsheet Integration Settings
              </h2>
              <p className="text-xs text-[#718096] mt-0.5">
                Target Google Sheet ID and Google Apps Script deployment URL
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={actionLoading}
              className="px-3 py-1 bg-[#F7F8FA] hover:bg-[#E5E8ED] text-[#153650] border border-[#CBD5E1] text-xs font-semibold rounded-none transition-colors"
            >
              Test Webhook Ping
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Google Spreadsheet ID
                </label>
                <input
                  type="text"
                  required
                  value={spreadsheetIdInput}
                  onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-mono rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                  placeholder="1abcXYZ..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#718096] mb-1">
                  Google Apps Script Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  className="w-full h-9 px-3 bg-[#F8FAFC] border border-[#E5E8ED] text-xs text-[#172B45] font-mono rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                  placeholder="https://script.google.com/macros/s/.../exec"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowAppsScript(!showAppsScript)}
                className="text-xs font-bold text-[#24689B] hover:text-[#153650] hover:underline"
              >
                {showAppsScript ? 'Hide Apps Script Code' : 'View Embedded Apps Script Handler'}
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors shadow-xs"
              >
                Save Configuration
              </button>
            </div>
          </form>

          {showAppsScript && (
            <div className="mt-4 p-4 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#153650] block font-mono mb-2">
                Google Apps Script Webhook Handler (Code.gs)
              </span>
              <pre className="text-[10px] font-mono text-[#172B45] bg-[#FFFFFF] p-3 border border-[#E5E8ED] overflow-x-auto crm-scrollbar max-h-48 leading-relaxed">
{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("All Leads");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("All Leads");
    }
    // Append sanitized row
    sheet.appendRow([
      data.referenceId,
      data.createdAt,
      data.customerName,
      data.phone,
      data.email,
      data.serviceType,
      data.stage,
      data.quotedPrice || "-"
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
              </pre>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
