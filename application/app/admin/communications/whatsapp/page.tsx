'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getCommunicationsAction } from '@/app/actions/phase3';
import {
  MessageSquare,
  RotateCw,
  Search,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Phone,
} from 'lucide-react';

export default function WhatsAppRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCommunicationsAction({ channel: 'WHATSAPP' });
      setRecords(Array.isArray(data) ? data.filter((d) => d.channel === 'WHATSAPP') : []);
    } catch (e) {
      console.error('Failed to load WhatsApp records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const phone = (r.recipientContact || r.recipient || '').toLowerCase();
    const content = (r.content || '').toLowerCase();
    return phone.includes(q) || content.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Meta WhatsApp Cloud API & Click-to-Chat Records"
        subtitle="Outbound client communications, quote links, booking updates, and wa.me customer engagement logs"
        breadcrumbs={[
          { label: 'Communications', href: '/admin/communications' },
          { label: 'WhatsApp Records' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings/whatsapp"
              className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs font-semibold text-[#153650]"
            >
              WhatsApp Config
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
        {/* COMPLIANCE AUDIT BANNER */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] flex items-center justify-center font-bold text-xs">
              WA
            </div>
            <div>
              <span className="text-xs font-bold text-[#153650] block">
                Official Business Number: +91 63570 50505
              </span>
              <p className="text-[11px] text-[#718096]">
                Audit rule strictly enforced: Click-to-Chat triggers are recorded as CLICK_TO_CHAT_TRIGGERED.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold font-mono text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0]">
            META GRAPH API v19.0 READY
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
                placeholder="Search by phone number or message text..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              {filtered.length} WhatsApp interaction records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Recipient Mobile</th>
                  <th className="px-4 py-3 font-semibold">Message Content</th>
                  <th className="px-4 py-3 font-semibold">Triggered By</th>
                  <th className="px-4 py-3 font-semibold">Dispatched Time</th>
                  <th className="px-4 py-3 font-semibold">Audit Delivery Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading WhatsApp ledger...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No WhatsApp activity records logged yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {item.recipientContact || item.recipient}
                      </td>

                      <td className="px-4 py-3.5 max-w-sm">
                        <p className="text-xs text-[#2D3748] truncate font-medium">
                          {item.content || item.messageText}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#4A5568]">
                        <span className="font-semibold text-[#153650]">
                          {item.actorId ? item.actorId.replace('usr-', '') : 'Staff Desk'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {new Date(item.dispatchedAt || item.createdAt || Date.now()).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-none font-mono text-[10px] font-bold ${
                            item.deliveryStatus === 'PROVIDER_ACCEPTED'
                              ? 'bg-[#DEF7EC] text-[#03543F] border border-[#BCF0DA]'
                              : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                          }`}
                        >
                          {item.deliveryStatus || 'CLICK_TO_CHAT_TRIGGERED'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <a
                          href={`https://wa.me/${(item.recipientContact || '').replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-bold text-[#15803D] hover:bg-[#F0FDF4] border border-[#BBF7D0] inline-flex items-center gap-1"
                        >
                          <span>Chat</span>
                          <ExternalLink size={10} />
                        </a>
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

