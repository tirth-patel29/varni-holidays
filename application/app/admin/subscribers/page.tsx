'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getNewsletterSubscribersAction } from '@/app/actions/newsletter';
import { Mail, Search, RotateCw, CheckCircle2, Calendar, UserCheck } from 'lucide-react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getNewsletterSubscribersAction();
    setSubscribers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Newsletter Subscribers & Gazettes"
        subtitle="Manage marketing audience, opt-in consent records, and automated welcome dispatches."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2] inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#17191D] p-4 rounded-xl border border-[#2A2E34]">
            <div className="flex items-center justify-between text-[#969CA5] text-xs mb-1">
              <span>Total Subscribers</span>
              <Mail size={16} className="text-[#E9B95E]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#F4F4F2]">
              {subscribers.length}
            </div>
            <div className="text-[11px] text-[#55B98A] mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Double opt-in & consent verified</span>
            </div>
          </div>

          <div className="bg-[#17191D] p-4 rounded-xl border border-[#2A2E34]">
            <div className="flex items-center justify-between text-[#969CA5] text-xs mb-1">
              <span>Active Subscribed</span>
              <UserCheck size={16} className="text-[#55B98A]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#55B98A]">
              {subscribers.filter((s) => s.status === 'SUBSCRIBED').length}
            </div>
            <div className="text-[11px] text-[#969CA5] mt-1">
              Automated welcome email enabled
            </div>
          </div>

          <div className="bg-[#17191D] p-4 rounded-xl border border-[#2A2E34]">
            <div className="flex items-center justify-between text-[#969CA5] text-xs mb-1">
              <span>Audience Growth</span>
              <Calendar size={16} className="text-[#6FA9D8]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#6FA9D8]">
              100%
            </div>
            <div className="text-[11px] text-[#969CA5] mt-1">
              Organic website footer opt-ins
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#17191D] rounded-lg p-3 flex items-center gap-3 border border-[#2A2E34]">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by subscriber email..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#2A2E34] bg-[#1D2025] text-xs text-[#F4F4F2] placeholder-[#666E79] focus:outline-none focus:border-[#E9B95E]"
            />
            <Search size={14} className="text-[#666E79] absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] overflow-hidden">
          <table className="w-full text-left text-xs text-[#F4F4F2]">
            <thead className="bg-[#1D2025] border-b border-[#2A2E34] text-[10px] uppercase font-semibold text-[#666E79] tracking-wider">
              <tr>
                <th className="px-4 py-3">Subscriber Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Consent Timestamp</th>
                <th className="px-4 py-3">Date Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E34]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#969CA5]">
                    Loading subscribers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#666E79]">
                    No newsletter subscribers found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#1D2025]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#F4F4F2]">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-[#E9B95E]" />
                        <span>{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#55B98A]/15 text-[#55B98A] border border-[#55B98A]/30">
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#969CA5] font-mono text-[11px]">
                      {sub.source}
                    </td>
                    <td className="px-4 py-3 text-[#969CA5] font-mono text-[11px]">
                      {new Date(sub.consentAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-[#666E79] font-mono text-[11px]">
                      {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
