'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getAuditLogsAction } from '@/app/actions/crm';

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
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <CrmHeader
        title="Security & System Audit Trail"
        subtitle="Immutable historical audit records: stage changes, customer merges, lead reassignments, and quotations."
        actions={
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white border border-[#E3DCCB] text-[#153650] hover:bg-[#F5F2EB] transition-colors shadow-sm"
            title="Refresh Audit Logs"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {/* Search */}
        <div className="clay-card rounded-2xl p-4 flex items-center gap-3 border border-[#E3DCCB] bg-white shadow-xs">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter audit logs by action, actor email, or entity ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E3DCCB] bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2">
              search
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap bg-[#F5F2EB] px-3 py-1.5 rounded-lg border border-[#E3DCCB]">
            {filtered.length} Audit Entries
          </span>
        </div>

        {/* Audit Log Table */}
        <div className="clay-card rounded-3xl overflow-hidden border border-[#E3DCCB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E5DEC9]/80 text-[#153650] uppercase text-[10px] font-black tracking-wider border-b border-[#E3DCCB]">
                <tr>
                  <th className="px-6 py-4">Timestamp (IST)</th>
                  <th className="px-5 py-4">Actor</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Entity</th>
                  <th className="px-6 py-4">Details & Event Diff</th>
                  <th className="px-5 py-4">Origin / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCB]/60 bg-[#FBF9F5]/60 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                      No matching audit records.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F5F2EB] transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-medium">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4 font-sans font-bold text-[#153650] whitespace-nowrap">
                        {log.userEmail}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#153650]/10 text-[#153650] border border-[#153650]/20">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-700 font-sans">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">{log.entityType}</span>
                        <span>{log.entityId}</span>
                      </td>

                      <td className="px-6 py-4 text-slate-800 font-sans text-xs max-w-md">
                        {log.details}
                      </td>

                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap font-medium">
                        {log.ipAddress}
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

