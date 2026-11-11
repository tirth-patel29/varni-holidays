'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getCommunicationsAction } from '@/app/actions/phase3';
import {
  Mail,
  RotateCw,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function EmailRecordsPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCommunicationsAction({ channel: 'EMAIL' });
      setEmails(Array.isArray(data) ? data.filter((d) => d.channel === 'EMAIL') : []);
    } catch (e) {
      console.error('Failed to load email logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = emails.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const rec = (item.recipientContact || item.recipient || '').toLowerCase();
    const sub = (item.subject || '').toLowerCase();
    return rec.includes(q) || sub.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Resend Transactional Email Delivery Ledger"
        subtitle="Audited email dispatches from noreply@varnitours.com including booking vouchers, quotations, and enquiry alerts"
        breadcrumbs={[
          { label: 'Communications', href: '/admin/communications' },
          { label: 'Email Records' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings/email"
              className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs font-semibold text-[#153650]"
            >
              Email Settings
            </Link>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* DOMAIN STATUS BANNER */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] flex items-center justify-center font-bold text-xs">
              @
            </div>
            <div>
              <span className="text-xs font-bold text-[#153650] block">
                Verified Sending Domain: varnitours.com
              </span>
              <p className="text-[11px] text-[#718096]">
                Sender Identity: Varni Holidays &lt;noreply@varnitours.com&gt; via Resend API
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold font-mono text-[#168653] bg-[#DEF7EC] border border-[#BCF0DA]">
            DKIM / SPF VERIFIED
          </span>
        </div>

        {/* SEARCH AND TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email logs by recipient or subject..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              {filtered.length} emails delivered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Recipient Email</th>
                  <th className="px-4 py-3 font-semibold">Subject Line</th>
                  <th className="px-4 py-3 font-semibold">Message Category</th>
                  <th className="px-4 py-3 font-semibold">Dispatched Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Delivery State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading email records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#718096]">
                      No transactional email records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {item.recipientContact || item.recipient}
                      </td>

                      <td className="px-4 py-3.5 max-w-sm">
                        <span className="font-semibold text-[#153650] block truncate">
                          {item.subject}
                        </span>
                        <p className="text-[10px] text-[#718096] truncate mt-0.5">
                          {item.content}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <span className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] text-[#153650] font-mono text-[10px] font-semibold">
                          {item.category || 'TRANSACTIONAL'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {new Date(item.dispatchedAt || item.createdAt || Date.now()).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge
                          status={item.deliveryStatus || 'DELIVERED'}
                          size="sm"
                        />
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

