'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import {
  getActiveSessionsAction,
  revokeSessionAction,
  revokeAllSessionsAction,
  getSecurityAuditLogsAction,
} from '@/app/actions/auth';
import {
  Shield,
  ShieldCheck,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [revoking, setRevoking] = useState(false);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await getActiveSessionsAction();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await getSecurityAuditLogsAction(50);
      if (res.success) {
        setAuditLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadSessions();
    loadAuditLogs();
  }, []);

  const handleRevokeSingle = async (sessionId: string) => {
    if (!confirm('Revoke this session? The device will be signed out immediately.')) return;
    setRevoking(true);
    try {
      const res = await revokeSessionAction(sessionId);
      if (res.success) {
        await loadSessions();
        await loadAuditLogs();
      } else {
        alert('Failed to revoke session.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRevoking(false);
    }
  };

  const handleRevokeAllOther = async () => {
    if (!confirm('Revoke all other active sessions? All other browsers and devices will be signed out.')) return;
    setRevoking(true);
    try {
      const res = await revokeAllSessionsAction();
      if (res.success) {
        await loadSessions();
        await loadAuditLogs();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Enterprise Security & Session Governance"
        subtitle="Active token management, mandatory TOTP authenticator enforcement, and immutable security audit logs"
        breadcrumbs={[
          { label: 'Settings', href: '/admin/settings/roles' },
          { label: 'Security & Active Sessions' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRevokeAllOther}
              disabled={revoking || sessions.length <= 1}
              className="px-3.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-40 text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Trash2 size={14} />
              <span>Revoke All Other Sessions</span>
            </button>
            <button
              type="button"
              onClick={() => {
                loadSessions();
                loadAuditLogs();
              }}
              className="p-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-[#718096] rounded-none"
              title="Refresh Security Status"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* SECTION 1: TOTP MFA ENFORCEMENT BANNER */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#DEF7EC] text-[#168653] flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#153650] flex items-center gap-2">
                <span>Mandatory TOTP Multi-Factor Authentication</span>
                <span className="font-mono text-[10px] bg-[#DEF7EC] text-[#168653] px-2 py-0.5 border border-[#BCF0DA]">
                  ENFORCED
                </span>
              </h2>
              <p className="text-xs text-[#718096] mt-0.5 leading-relaxed">
                RFC-6238 compliant authenticator protection is strictly enforced for all administrative and employee roles. Hardware keys and mobile authenticators (Google Authenticator, Microsoft Authenticator, 1Password) protect customer dossiers.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#153650] bg-[#F8FAFC] px-3 py-1.5 border border-[#CBD5E1] shrink-0 self-start sm:self-auto">
            100% Privileged Coverage
          </span>
        </div>

        {/* SECTION 2: ACTIVE SESSIONS */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex justify-between items-center bg-[#FFFFFF]">
            <div>
              <h3 className="text-sm font-bold text-[#153650] font-headline flex items-center gap-2">
                <Laptop size={16} className="text-[#153650]" />
                <span>Active Device Sessions</span>
              </h3>
              <p className="text-xs text-[#718096] mt-0.5">
                Revoking a session will immediately invalidate its token and require re-authentication.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#153650] bg-[#F1F5F9] px-2.5 py-1">
              {sessions.length} Active {sessions.length === 1 ? 'Session' : 'Sessions'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Device & Browser</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Session Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED]">
                {loadingSessions ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-[#718096]">
                      Loading active sessions...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-[#718096]">
                      No active sessions found.
                    </td>
                  </tr>
                ) : (
                  sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-mono text-[11px] text-[#153650] max-w-xs truncate">
                        {sess.userAgent || 'Modern Web Browser'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#64748B]">
                        {sess.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {new Date(sess.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {sess.isCurrent ? (
                          <span className="font-mono text-[10px] font-bold bg-[#DEF7EC] text-[#168653] px-2 py-0.5 border border-[#BCF0DA]">
                            Current Session
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] bg-[#F1F5F9] text-[#64748B] px-2 py-0.5">
                            Active Remote
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!sess.isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSingle(sess.id)}
                            className="text-[#DC2626] hover:underline font-bold text-[11px]"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: IMMUTABLE SECURITY AUDIT LOGS */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex justify-between items-center bg-[#FFFFFF]">
            <div>
              <h3 className="text-sm font-bold text-[#153650] font-headline flex items-center gap-2">
                <Terminal size={16} className="text-[#153650]" />
                <span>Security Audit Trail</span>
              </h3>
              <p className="text-xs text-[#718096] mt-0.5">
                Append-only log of logins, TOTP verifications, recovery code redemptions, and privilege updates.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#153650] bg-[#F1F5F9] px-2.5 py-1">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Actor / Target</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED]">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-[#718096]">
                      Loading audit events...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-[#718096]">
                      No security events logged yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 text-[#64748B] font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-bold text-[#153650]">
                          {log.eventType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 ${
                            log.outcome === 'SUCCESS'
                              ? 'bg-[#DEF7EC] text-[#168653]'
                              : log.outcome === 'BLOCKED'
                              ? 'bg-[#FEF3C7] text-[#D97706]'
                              : 'bg-[#FEE2E2] text-[#DC2626]'
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#153650]">
                        <span className="font-bold block">{log.actorName || log.actorEmail}</span>
                        {log.targetUserEmail && (
                          <span className="text-[10px] text-[#718096] block">
                            Target: {log.targetUserEmail}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#4A5568] max-w-sm truncate text-[11px]">
                        {log.details || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#718096]">
                        {log.ipAddress || '—'}
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
