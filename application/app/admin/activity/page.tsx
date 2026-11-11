'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getAuditLogsAction, getLeadsAction } from '@/app/actions/crm';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  Activity,
  RotateCw,
  Search,
  Calendar,
  User,
  MessageSquare,
  CreditCard,
  BookmarkCheck,
  Inbox,
  Filter,
} from 'lucide-react';

export default function CustomerActivityStreamPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const audit = await getAuditLogsAction();
      setLogs(Array.isArray(audit) ? audit : []);
    } catch (err) {
      console.error('Failed to load activity stream:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const act = (log.action || '').toLowerCase();
      const det = (log.details || '').toLowerCase();
      const user = (log.actorName || log.actorId || '').toLowerCase();
      return act.includes(q) || det.includes(q) || user.includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Live Customer & Operational Activity Stream"
        subtitle="Chronological feed of customer enquiries, consultant actions, communication dispatches, and financial ledger events"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'Customer Activity' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh Stream</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* FILTERS TOOLBAR */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter activity stream by keywords, users, or notes..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Event Types</option>
              <option value="ENQUIRY_RECEIVED">Enquiry Submissions</option>
              <option value="LEAD_STAGE_UPDATED">Stage Changes</option>
              <option value="COMMUNICATION_DISPATCHED">Communications</option>
              <option value="BOOKING_CREATED">Bookings</option>
              <option value="PAYMENT_RECORDED">Payments</option>
            </select>
            <span className="text-xs font-mono text-[#718096] whitespace-nowrap">
              {filtered.length} events
            </span>
          </div>
        </div>

        {/* ACTIVITY TIMELINE CARDS */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs p-5 sm:p-6">
          <div className="relative border-l-2 border-[#E5E8ED] ml-4 pl-6 space-y-6">
            {loading ? (
              <div className="py-12 text-center text-[#718096]">
                <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                Streaming activity records...
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-xs text-[#718096]">No activity events match your query.</p>
            ) : (
              filtered.map((log) => (
                <div key={log.id} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 bg-[#153650] border-2 border-[#FFFFFF] shadow-xs group-hover:scale-125 transition-transform" />
                  <div className="bg-[#FAFBFD] border border-[#E5E8ED] p-3.5 hover:border-[#CBD5E1] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1">
                      <span className="font-bold text-[#153650] font-mono uppercase tracking-wider text-[11px]">
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-[#718096]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#2D3748] font-medium">{log.details}</p>
                    <div className="mt-2 pt-2 border-t border-[#E5E8ED] flex items-center justify-between text-[11px] text-[#718096]">
                      <span>Actor: <strong className="text-[#153650]">{log.actorName || log.actorId}</strong></span>
                      <span className="font-mono text-[10px]">{log.targetType}: {log.targetId}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

