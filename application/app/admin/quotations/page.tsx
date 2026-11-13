'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getQuotationsDashboardAction,
  updateQuotationStatusAction,
  duplicateQuotationAction,
} from '@/app/actions/quotations';
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
  Download,
  Copy,
  Building2,
  Compass,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function AdminQuotationsDashboardPage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalCount: 0,
    draftCount: 0,
    sentCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    expiredCount: 0,
    totalQuotedValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getQuotationsDashboardAction({
        status: statusFilter,
        type: typeFilter,
        search,
      });
      if (res.success) {
        setQuotations(res.quotations || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (e) {
      console.error('Failed to load quotations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleStatusChange = async (quoteId: string, newStatus: any) => {
    await updateQuotationStatusAction(quoteId, newStatus, currentUser.id);
    await loadData();
  };

  const handleDuplicate = async (quoteId: string) => {
    if (!confirm('Duplicate this quotation as a new editable draft?')) return;
    const res = await duplicateQuotationAction(quoteId, currentUser.id);
    if (res.success) {
      await loadData();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Quotation Generator & Proposal Desk"
        subtitle="Tailor-made tour itineraries, hotel stays, client proposal tracking, editable pricing engine, and verified PDF generation"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Quotations' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh</span>
            </button>

            <Link
              href="/admin/quotations/create"
              className="px-4 py-1.5 bg-[#002037] hover:bg-[#153650] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus size={14} className="text-[#E9B95E]" />
              <span>Create Quotation</span>
            </Link>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* STATS TILES (7 METRICS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#FFFFFF] p-3.5 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
              Total Proposals
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">
              {metrics.totalCount}
            </div>
            <p className="text-[10px] text-[#718096] mt-0.5">Lifetime issued</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
              Drafts
            </span>
            <div className="text-xl font-bold text-[#64748B] mt-1 font-headline">
              {metrics.draftCount}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">In composition</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B45309] block">
              Sent / Pending
            </span>
            <div className="text-xl font-bold text-[#B45309] mt-1 font-headline">
              {metrics.sentCount}
            </div>
            <p className="text-[10px] text-[#B45309] mt-0.5">Awaiting customer</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#168653] block">
              Accepted
            </span>
            <div className="text-xl font-bold text-[#168653] mt-1 font-headline">
              {metrics.acceptedCount}
            </div>
            <p className="text-[10px] text-[#168653] mt-0.5">Won / Booking ready</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D54747] block">
              Declined
            </span>
            <div className="text-xl font-bold text-[#D54747] mt-1 font-headline">
              {metrics.rejectedCount}
            </div>
            <p className="text-[10px] text-[#D54747] mt-0.5">Lost proposals</p>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#153650] block">
              Pipeline Value
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-mono truncate">
              ₹{(metrics.totalQuotedValue || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-[#718096] mt-0.5">Gross quoted amount</p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, customer name, destination, phone..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>
            <button
              type="submit"
              className="h-9 px-3 bg-[#F4F6F9] hover:bg-[#E5E8ED] border border-[#CBD5E1] text-xs font-semibold text-[#153650] rounded-none"
            >
              Filter
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Quotation Types</option>
              <option value="PACKAGE">Tour Package Quotations</option>
              <option value="HOTEL">Hotel Stay Quotations</option>
              <option value="CUSTOM">Custom Holiday Quotations</option>
            </select>

            {/* Status Filter */}
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

            <span className="text-xs font-mono text-[#718096] whitespace-nowrap pl-1">
              {quotations.length} records
            </span>
          </div>
        </div>

        {/* QUOTATIONS TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Reference & Type</th>
                  <th className="px-4 py-3 font-semibold">Customer / Guest</th>
                  <th className="px-4 py-3 font-semibold">Itinerary / Destination</th>
                  <th className="px-4 py-3 font-semibold text-right">Quoted Amount</th>
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
                      Loading quotations...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      <p className="font-semibold text-sm text-[#153650] mb-1">No quotations found</p>
                      <p className="text-xs text-[#718096] mb-3">Create your first proposal using the button above.</p>
                      <Link
                        href="/admin/quotations/create"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#002037] text-white text-xs font-bold rounded-none"
                      >
                        <Plus size={13} />
                        <span>Create Quotation</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => {
                    const isHotel = q.quotationType === 'HOTEL';
                    const rev = q.revisionNumber && q.revisionNumber > 0 ? ` (R${q.revisionNumber})` : '';

                    return (
                      <tr key={q.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#153650]">{q.quotationNumber}</span>
                            {rev && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#EFF6FF] text-[#24689B] border border-[#BFDBFE] font-bold">
                                {rev}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isHotel ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[#B45309] font-medium">
                                <Building2 size={11} /> Hotel Stay
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[#24689B] font-medium">
                                <Compass size={11} /> Tour Package
                              </span>
                            )}
                            <span className="text-[10px] text-[#718096]">
                              • {new Date(q.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-bold text-[#153650] block">
                            {q.customerName || 'Valued Guest'}
                          </span>
                          <span className="text-[10px] text-[#718096] font-mono block">
                            {q.customerPhone || 'Direct Client'}
                          </span>
                          {q.customerEmail && (
                            <span className="text-[10px] text-[#718096] block truncate max-w-[150px]">
                              {q.customerEmail}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#4A5568]">
                          <span className="text-[#153650] font-semibold block truncate max-w-[220px]">
                            {q.title || 'Custom Tour Proposal'}
                          </span>
                          <span className="text-[10px] text-[#718096]">
                            {q.destination || 'Kerala / India'}
                            {q.durationNights ? ` • ${q.durationNights}N / ${(q.durationNights || 0) + 1}D` : ''}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold text-[#153650]">
                          ₹{Number(q.totalAmountInr || 0).toLocaleString('en-IN')}
                          <span className="text-[10px] text-[#168653] font-normal block">
                            Incl. {q.taxPercent || 5}% GST
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#718096]">
                          {q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '7 Days'}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <select
                            value={q.status}
                            onChange={(e) => handleStatusChange(q.id, e.target.value)}
                            className="h-7 px-2 text-[10px] font-mono font-bold uppercase bg-[#FFFFFF] border border-[#CBD5E1] rounded-none focus:outline-none"
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="SENT">SENT</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="EXPIRED">EXPIRED</option>
                          </select>
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/quotations/${q.id}`}
                              className="px-2.5 py-1 text-xs font-bold text-[#002037] hover:bg-[#F4F6F9] border border-[#E5E8ED] inline-flex items-center gap-1"
                              title="View Quotation Dossier"
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </Link>

                            <a
                              href={`/api/quotations/${q.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 border border-[#E5E8ED] text-[#24689B] hover:bg-[#F4F6F9] rounded-none"
                              title="Preview PDF"
                            >
                              <Printer size={13} />
                            </a>

                            <a
                              href={`/api/quotations/${q.id}/pdf?download=1`}
                              className="p-1 border border-[#E5E8ED] text-[#168653] hover:bg-[#F4F6F9] rounded-none"
                              title="Download PDF"
                            >
                              <Download size={13} />
                            </a>

                            <button
                              onClick={() => handleDuplicate(q.id)}
                              className="p-1 border border-[#E5E8ED] text-[#718096] hover:bg-[#F4F6F9] rounded-none"
                              title="Duplicate as New Draft"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
