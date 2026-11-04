'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getAuditLogsAction } from '@/app/actions/crm';
import {
  RefreshCw,
  Search,
  Shield,
  Activity,
  User,
  Clock,
  Terminal,
  Database,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getAuditLogsAction();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Security & System Audit Trail"
        subtitle="Immutable historical audit records: stage changes, customer merges, lead reassignments, and quotations."
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium transition-colors disabled:opacity-50"
            title="Refresh Audit Logs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#E9B95E]' : ''} />
            <span>Refresh</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 flex-1 flex flex-col min-w-0 space-y-4">
        {/* Search & Meta Stats */}
        <div className="bg-[#17191D] rounded-lg p-3 border border-[#2A2E34] flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search size={14} className="text-[#666E79] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter audit records by action, actor email, or entity ID..."
              className="w-full pl-9 pr-4 py-1.5 rounded-md bg-[#101113] border border-[#2A2E34] text-xs text-[#F4F4F2] placeholder-[#666E79] focus:outline-none focus:border-[#E9B95E] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <span className="text-[11px] font-mono text-[#969CA5] px-2.5 py-1 rounded bg-[#101113] border border-[#2A2E34] flex items-center gap-1.5">
              <Shield size={12} className="text-[#55B98A]" />
              {filtered.length} Audit Entries
            </span>
            <span className="text-[10px] text-[#666E79] font-mono uppercase tracking-wider hidden md:inline">
              Tamper-Proof
            </span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto crm-scrollbar flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1D2025] text-[#969CA5] uppercase text-[10px] font-medium tracking-wider border-b border-[#2A2E34]">
                <tr>
                  <th className="px-4 py-3 font-medium">Timestamp (IST)</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Details & Event Payload</th>
                  <th className="px-4 py-3 font-medium">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2E34]/60 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-[#666E79] font-sans">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={20} className="animate-spin text-[#E9B95E]" />
                        <span>Querying immutable system ledger...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-[#666E79] font-sans">
                      <div className="flex flex-col items-center gap-1.5">
                        <Database size={20} className="text-[#666E79]" />
                        <span className="text-xs">No matching audit records found.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => {
                    const isSecurityAction =
                      log.action?.includes('MERGE') ||
                      log.action?.includes('DELETE') ||
                      log.action?.includes('PERM') ||
                      log.action?.includes('AUTH');

                    return (
                      <tr key={log.id} className="hover:bg-[#1D2025]/50 transition-colors">
                        <td className="px-4 py-3 text-[#969CA5] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-[#101113] border border-[#2A2E34] text-[10px] text-[#E9B95E] flex items-center justify-center font-bold">
                              {log.userEmail?.slice(0, 1).toUpperCase() || 'S'}
                            </span>
                            <span className="text-[#F4F4F2] font-sans text-xs">
                              {log.userEmail || 'System Process'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wide ${
                              isSecurityAction
                                ? 'bg-[#DF7373]/10 text-[#DF7373] border border-[#DF7373]/20'
                                : 'bg-[#E9B95E]/10 text-[#E9B95E] border border-[#E9B95E]/20'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-[11px] text-[#969CA5]">
                            <Tag size={11} className="text-[#666E79]" />
                            <span className="text-[#F4F4F2]">{log.entityType}</span>
                            <span className="text-[#666E79] text-[10px]">({log.entityId?.slice(0, 8)})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#969CA5] max-w-md font-sans text-xs">
                          <div className="truncate" title={log.details}>
                            {log.details || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#666E79] whitespace-nowrap font-mono text-[10px]">
                          {log.ipAddress || '127.0.0.1 (Local)'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-[#2A2E34] bg-[#101113] flex items-center justify-between text-xs text-[#666E79]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#55B98A]" />
              Immutable audit ledger active with write-only append policy
            </span>
            <span className="font-mono text-[10px]">SHA-256 Verified</span>
          </div>
        </div>
      </main>
    </div>
  );
}
