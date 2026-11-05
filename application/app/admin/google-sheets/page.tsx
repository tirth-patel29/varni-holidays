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
    const res = await getGoogleSheetsStatusAction();
    setData(res);
    setSpreadsheetIdInput(res.config.spreadsheetId);
    setWebhookUrlInput(res.config.webhookUrl || '');
    setLoading(false);
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Google Sheets Executive Reporting"
        subtitle="One-way transactional outbox synchronization: PostgreSQL → Google Sheets (Read-only for Neel Patel)."
        actions={
          cfg && (
            <a
              href={cfg.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-md bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Table size={14} />
              <span>Open Google Sheet</span>
            </a>
          )
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
              feedback.type === 'success'
                ? 'bg-[#55B98A]/10 text-[#55B98A] border-[#55B98A]/30'
                : feedback.type === 'error'
                ? 'bg-[#DF7373]/10 text-[#DF7373] border-[#DF7373]/30'
                : 'bg-[#6FA9D8]/10 text-[#6FA9D8] border-[#6FA9D8]/30'
            }`}
          >
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="text-[#969CA5] hover:text-[#F4F4F2]">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Governance & Privacy Notice */}
        <div className="rounded-lg p-4 bg-[#17191D] border border-[#2A2E34] text-xs text-[#969CA5] space-y-1.5">
          <div className="flex items-center gap-2 font-medium text-[#F4F4F2]">
            <ShieldCheck size={16} className="text-[#E9B95E]" />
            <span>Strict One-Way Synchronization Governance</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            • <strong>Sole Source of Truth:</strong> PostgreSQL remains the only system of record. Changes made inside Google Sheets are never imported back into the CRM.<br />
            • <strong>Viewer Privilege:</strong> Neel Patel has read-only Viewer access to the workbook. Operational records are managed exclusively through the CRM desk.<br />
            • <strong>Zero Sensitive Leakage:</strong> Passport details, DOB, confidential supplier net rates, and margins are strictly stripped from all outbound sheet payloads.<br />
            • <strong>Outbox Resilience:</strong> Google API outages or rate limits are captured in the outbox queue and will never interrupt CRM desk operations.
          </p>
        </div>

        {/* Status KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-lg p-4 border border-[#2A2E34] bg-[#17191D] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#666E79] uppercase">
              <span>Sync Status</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  cfg?.status === 'CONNECTED' ? 'bg-[#55B98A]' : 'bg-[#E8B65E]'
                }`}
              />
            </div>
            <div className="text-xl font-semibold text-[#F4F4F2]">
              {loading ? '...' : cfg?.status || 'DISCONNECTED'}
            </div>
            <div className="text-[11px] text-[#969CA5]">
              {data?.isLive ? 'Live GCP Service Account' : 'Development Simulation Mirror'}
            </div>
          </div>

          <div className="rounded-lg p-4 border border-[#2A2E34] bg-[#17191D] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#666E79] uppercase">
              <span>Last Sync</span>
              <History size={14} className="text-[#666E79]" />
            </div>
            <div className="font-mono text-sm font-semibold text-[#F4F4F2]">
              {loading
                ? '...'
                : cfg?.lastSuccessfulSyncAt
                ? new Date(cfg.lastSuccessfulSyncAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : 'Never'}
            </div>
            <div className="text-[11px] text-[#969CA5]">
              {cfg?.lastSuccessfulSyncAt
                ? new Date(cfg.lastSuccessfulSyncAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Pending initial sync'}
            </div>
          </div>

          <div className="rounded-lg p-4 border border-[#2A2E34] bg-[#17191D] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#666E79] uppercase">
              <span>Outbox Queue</span>
              <Layers size={14} className="text-[#666E79]" />
            </div>
            <div className="text-xl font-semibold text-[#F4F4F2] tabular-nums">
              {loading ? '...' : data?.counts.pending || 0} Pending
            </div>
            <div className="text-[11px] text-[#55B98A]">
              {data?.counts.completed || 0} Successfully Synced
            </div>
          </div>

          <div className="rounded-lg p-4 border border-[#2A2E34] bg-[#17191D] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#666E79] uppercase">
              <span>Failed Jobs</span>
              <AlertTriangle size={14} className={data?.counts.failed > 0 ? 'text-[#DF7373]' : 'text-[#666E79]'} />
            </div>
            <div className={`text-xl font-semibold tabular-nums ${data?.counts.failed > 0 ? 'text-[#DF7373]' : 'text-[#F4F4F2]'}`}>
              {loading ? '...' : data?.counts.failed || 0}
            </div>
            <div className="text-[11px] text-[#969CA5]">
              {data?.counts.failed > 0 ? (
                <button
                  onClick={handleRetryFailed}
                  disabled={actionLoading}
                  className="text-[#DF7373] hover:underline"
                >
                  Retry Failed Jobs Now
                </button>
              ) : (
                'Queue healthy'
              )}
            </div>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="rounded-lg p-5 border border-[#2A2E34] bg-[#17191D] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#2A2E34]">
            <div>
              <h3 className="text-sm font-semibold text-[#F4F4F2]">Outbox Operations & Governance</h3>
              <p className="text-xs text-[#969CA5]">Trigger live reconciliation, test connectivity, or retry outbox queue</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSync}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <RotateCw size={13} className={actionLoading ? 'animate-spin' : ''} />
                <span>{actionLoading ? 'Syncing...' : 'Sync Outbox Now'}</span>
              </button>
              <button
                onClick={handleTestConnection}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-xs font-medium text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] transition-colors"
              >
                Test Connectivity
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-[10px] text-[#666E79] uppercase mb-1">
                Target Google Spreadsheet ID
              </label>
              <input
                type="text"
                value={spreadsheetIdInput}
                onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                placeholder="1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A"
                className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs font-mono text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E]"
              />
              <p className="mt-1 text-[10px] text-[#969CA5]">
                Active Sheet: <a href={'https://docs.google.com/spreadsheets/d/' + spreadsheetIdInput + '/edit'} target="_blank" rel="noopener noreferrer" className="text-[#E9B95E] hover:underline font-mono">https://docs.google.com/spreadsheets/d/{spreadsheetIdInput}/edit</a>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] text-[#666E79] uppercase">
                  Google Apps Script Webhook URL (Optional for Direct Live Sync)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAppsScript(!showAppsScript)}
                  className="text-[10px] text-[#E9B95E] hover:underline"
                >
                  {showAppsScript ? 'Hide Instructions' : 'View 1-Click Apps Script Setup'}
                </button>
              </div>
              <input
                type="text"
                value={webhookUrlInput}
                onChange={(e) => setWebhookUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs font-mono text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E]"
              />
              {showAppsScript && (
                <div className="mt-2 p-3 rounded bg-[#101113] border border-[#2A2E34] text-[11px] text-[#969CA5] space-y-2">
                  <div className="font-semibold text-[#F4F4F2]">How to connect in 1 minute without Google Cloud:</div>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open your Google Sheet: <a href={'https://docs.google.com/spreadsheets/d/' + spreadsheetIdInput + '/edit'} target="_blank" rel="noopener noreferrer" className="text-[#E9B95E] underline">Click here</a></li>
                    <li>Click <strong>Extensions &gt; Apps Script</strong> in the menu.</li>
                    <li>Paste the webhook code and click <strong>Deploy &gt; New deployment &gt; Web app</strong>.</li>
                    <li>Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>.</li>
                    <li>Copy the resulting Web App URL and paste it above!</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="text-xs text-[#DF7373] hover:underline"
              >
                Disconnect Synchronization
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-1.5 rounded bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] text-xs font-semibold transition-colors"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
