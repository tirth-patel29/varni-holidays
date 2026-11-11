'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getQuotationsAction } from '@/app/actions/crm';
import { updateQuotationStatusAction, createQuotationAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  FileText,
  RotateCw,
  Search,
  Plus,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  Printer,
} from 'lucide-react';

export default function AdminQuotationsPage() {
  const { currentUser } = useCrm();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getQuotationsAction();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load quotations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (quoteId: string, newStatus: any) => {
    await updateQuotationStatusAction(quoteId, newStatus, currentUser.id);
    await loadData();
  };

  const filtered = quotations.filter((q) => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (search.trim()) {
      const query = search.toLowerCase();
      const id = (q.id || '').toLowerCase();
      const name = (q.customerName || '').toLowerCase();
      const dest = (q.destination || '').toLowerCase();
      return id.includes(query) || name.includes(query) || dest.includes(query);
    }
    return true;
  });

  const totalQuoteValue = quotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
  const acceptedQuotes = quotations.filter((q) => q.status === 'ACCEPTED').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Travel Quotations & Cost Estimates"
        subtitle="Custom itinerary proposals, itemized flight/hotel breakdowns, PDF exports, and client proposal tracking"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Quotations' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh Proposals</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* STATS TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Proposals Issued
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {quotations.length}
            </div>
            <p className="text-[11px] text-[#24689B] mt-0.5 font-medium">
              Active quotation files
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Pipeline Proposal Value
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-mono">
              ₹{totalQuoteValue.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5 font-medium">
              Gross quoted price
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Accepted Proposals
            </span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-headline">
              {acceptedQuotes}
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">
              Converted into bookings
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by quote ID, customer name, destination..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Proposal Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent to Customer</option>
              <option value="ACCEPTED">Accepted / Won</option>
              <option value="REJECTED">Declined / Lost</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <span className="text-xs font-mono text-[#718096] whitespace-nowrap">
              {filtered.length} quotations
            </span>
          </div>
        </div>

        {/* QUOTATIONS TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Quotation ID</th>
                  <th className="px-4 py-3 font-semibold">Customer / Traveler</th>
                  <th className="px-4 py-3 font-semibold">Itinerary & Services</th>
                  <th className="px-4 py-3 font-semibold">Total Quoted (₹)</th>
                  <th className="px-4 py-3 font-semibold">Validity</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading travel quotations...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      No quotations match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((q) => (
                    <tr key={q.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {q.id}
                        <span className="text-[10px] text-[#718096] block font-normal">
                          {new Date(q.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[#153650] block">
                          {q.customerName || 'Valued Client'}
                        </span>
                        <span className="text-[10px] text-[#718096] font-mono">
                          {q.customerPhone || 'Direct Client'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#4A5568]">
                        <span className="text-[#153650] font-semibold block">
                          {q.destination || 'Tailor-made Travel Package'}
                        </span>
                        <span className="text-[10px] text-[#718096]">
                          {q.durationNights ? `${q.durationNights}N / ${q.durationNights + 1}D` : 'Complete Tour'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        ₹{Number(q.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#718096]">
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '7 Days'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <select
                          value={q.status}
                          onChange={(e) => handleStatusChange(q.id, e.target.value)}
                          className="h-7 px-2 text-[11px] font-mono font-bold uppercase bg-[#FFFFFF] border border-[#E5E8ED] rounded-none focus:outline-none"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="SENT">SENT</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="EXPIRED">EXPIRED</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/quotation?id=${q.id}`}
                            target="_blank"
                            className="p-1.5 border border-[#E5E8ED] text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] rounded-none"
                            title="View / Print Proposal"
                          >
                            <Printer size={13} />
                          </Link>
                          {q.leadId && (
                            <Link
                              href={`/admin/leads/${q.leadId}`}
                              className="px-2 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED]"
                            >
                              Lead Dossier →
                            </Link>
                          )}
                        </div>
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

