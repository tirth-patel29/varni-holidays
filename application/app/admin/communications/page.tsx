'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getCommunicationsAction, sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  MessageSquare,
  Mail,
  Phone,
  RotateCw,
  Search,
  Filter,
  Send,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function AdminCommunicationsPage() {
  const { currentUser } = useCrm();
  const [communications, setCommunications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'EMAIL' | 'WHATSAPP' | 'CALL'>('ALL');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCommunicationsAction();
      setCommunications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load communications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = communications.filter((c) => {
    if (channelFilter !== 'ALL' && c.channel !== channelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const rec = (c.recipientContact || c.recipient || '').toLowerCase();
      const sub = (c.subject || '').toLowerCase();
      const body = (c.content || '').toLowerCase();
      return rec.includes(q) || sub.includes(q) || body.includes(q);
    }
    return true;
  });

  const emailCount = communications.filter((c) => c.channel === 'EMAIL').length;
  const waCount = communications.filter((c) => c.channel === 'WHATSAPP').length;
  const callCount = communications.filter((c) => c.channel === 'CALL').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Omnichannel Customer Communications"
        subtitle="Unified conversation records across Meta WhatsApp Cloud API, Resend Transactional Email, and Phone Consultation logs"
        breadcrumbs={[
          { label: 'Communications', href: '/admin/communications' },
          { label: 'Communication History' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/communications/templates"
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Message Templates</span>
            </Link>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* CHANNEL PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto select-none">
          <button
            onClick={() => setChannelFilter('ALL')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors ${
              channelFilter === 'ALL'
                ? 'bg-[#153650] text-[#FFFFFF] border-[#153650] shadow-xs'
                : 'bg-[#FFFFFF] text-[#667085] border-[#E5E8ED] hover:bg-[#F9FAFB]'
            }`}
          >
            All Channels ({communications.length})
          </button>

          <Link
            href="/admin/communications/emails"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors bg-[#FFFFFF] text-[#1D4ED8] border-[#BFDBFE] hover:bg-[#EFF6FF]"
          >
            <Mail size={13} />
            <span>Resend Emails ({emailCount})</span>
          </Link>

          <Link
            href="/admin/communications/whatsapp"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors bg-[#FFFFFF] text-[#15803D] border-[#BBF7D0] hover:bg-[#F0FDF4]"
          >
            <MessageSquare size={13} />
            <span>WhatsApp Log ({waCount})</span>
          </Link>

          <Link
            href="/admin/communications/calls"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors bg-[#FFFFFF] text-[#B45309] border-[#FDE68A] hover:bg-[#FFFBEB]"
          >
            <Phone size={13} />
            <span>Phone Logs ({callCount})</span>
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by recipient, subject, or message content..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          </div>

          <span className="text-xs font-mono font-medium text-[#718096]">
            Showing {filtered.length} interaction records
          </span>
        </div>

        {/* COMMUNICATIONS TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Channel</th>
                  <th className="px-4 py-3 font-semibold">Recipient Contact</th>
                  <th className="px-4 py-3 font-semibold">Message Subject / Summary</th>
                  <th className="px-4 py-3 font-semibold">Dispatched By</th>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Delivery State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading communication timeline...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No communication dispatches recorded yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.channel === 'WHATSAPP' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] font-mono font-bold text-[10px]">
                            <MessageSquare size={11} />
                            WHATSAPP
                          </span>
                        )}
                        {item.channel === 'EMAIL' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono font-bold text-[10px]">
                            <Mail size={11} />
                            EMAIL
                          </span>
                        )}
                        {item.channel === 'CALL' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] font-mono font-bold text-[10px]">
                            <Phone size={11} />
                            PHONE CALL
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {item.recipientContact || item.recipient || 'Direct Contact'}
                      </td>

                      <td className="px-4 py-3.5 max-w-md">
                        <span className="font-semibold text-[#153650] block truncate">
                          {item.subject || 'Customer Update'}
                        </span>
                        <p className="text-[#667085] truncate text-[11px] mt-0.5">
                          {item.content || item.body || 'Dispatched transactional template'}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-[#4A5568]">
                        <span className="font-semibold text-[#153650]">
                          {item.actorId ? item.actorId.replace('usr-', '').replace('-superadmin', ' (Admin)') : 'System Automation'}
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

