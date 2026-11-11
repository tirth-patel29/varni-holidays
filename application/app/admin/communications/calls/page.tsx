'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getCommunicationsAction } from '@/app/actions/phase3';
import { getAuditLogsAction } from '@/app/actions/crm';
import {
  Phone,
  RotateCw,
  Search,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';

export default function PhoneCallLogsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCommunicationsAction({ channel: 'CALL' });
      setCalls(Array.isArray(data) ? data.filter((d) => d.channel === 'CALL') : []);
    } catch (e) {
      console.error('Failed to load call logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = calls.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.recipientContact || '').toLowerCase().includes(q) ||
      (c.content || '').toLowerCase().includes(q) ||
      (c.subject || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Phone Call & Consultation Logs"
        subtitle="Travel consultant telephone interaction records, customer enquiry callbacks, and itinerary notes"
        breadcrumbs={[
          { label: 'Communications', href: '/admin/communications' },
          { label: 'Call Logs' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh Logs</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* SEARCH AND TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search call logs by phone number or notes..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              {filtered.length} call logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Client Mobile</th>
                  <th className="px-4 py-3 font-semibold">Consultation Subject</th>
                  <th className="px-4 py-3 font-semibold">Call Summary & Outcome</th>
                  <th className="px-4 py-3 font-semibold">Logged By</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading phone consultation logs...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No phone consultation records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {item.recipientContact || item.recipient}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-[#153650]">
                        {item.subject || 'Itinerary Consultation'}
                      </td>

                      <td className="px-4 py-3.5 max-w-sm text-[#4A5568]">
                        {item.content}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#153650]">
                        {item.actorId ? item.actorId.replace('usr-', '') : 'Consultant'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {new Date(item.dispatchedAt || item.createdAt || Date.now()).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="text-xs text-[#168653] font-semibold">Logged</span>
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

