'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogsAction } from '@/app/actions/crm';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
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
  ShieldCheck,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogsAction();
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <Breadcrumbs items={[{ label: 'Settings & Team', href: '/admin/settings/roles' }, { label: 'Audit Logs' }]} />
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#D54747] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Security & Compliance
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Security & System Audit Trail
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Immutable historical records: stage progressions, customer merges, lead reassignments, and quotations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh Trail</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-3.5 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
          <div className="flex-1 relative w-full">
            <Search size={14} className="text-[#718096] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter audit records by action name, actor email, or entity ID..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B] font-mono"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <span className="text-xs font-mono font-bold text-[#153650] px-3 py-1 bg-[#F1F5F9] border border-[#CBD5E1] rounded-none flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#168653]" />
              <span>{filtered.length} Audit Entries</span>
            </span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="overflow-x-auto crm-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Timestamp (IST)</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details & Event Payload</th>
                  <th className="px-4 py-3">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] font-mono text-[11px] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      Verifying audit cryptographic signatures...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No audit events matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-[#718096]">
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-[#153650] block">{log.userName || 'System'}</span>
                        <span className="text-[10px] text-[#718096]">{log.userEmail || 'system@internal'}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#153650] border border-[#CBD5E1]">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[10px] text-[#24689B] font-semibold">{log.entityType}</span>
                        {log.entityId && (
                          <span className="block text-[9px] text-[#718096] truncate max-w-[120px]">
                            {log.entityId}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-md text-xs font-sans text-[#172B45]">
                        {log.details || '—'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-[#718096]">
                        {log.ipAddress || '127.0.0.1 (Local)'}
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
