'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  FileText,
  RotateCw,
  Search,
  Printer,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function AdminInvoicesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBookingsAction();
      const bList = Array.isArray(res?.bookings) ? res.bookings : Array.isArray(res) ? res : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map bookings to invoice records
  const invoices = bookings.map((b, idx) => {
    const total = Number(b.totalAmount) || Number(b.totalAmountInr) || 0;
    const paid = Number(b.paidAmount) || 0;
    const balance = Math.max(0, total - paid);
    const invoiceNum = `INV-2026-${String(idx + 1040).padStart(4, '0')}`;
    let payStatus = 'PAID';
    if (paid === 0) payStatus = 'UNPAID';
    else if (balance > 0) payStatus = 'PARTIAL';

    return {
      ...b,
      invoiceNum,
      total,
      paid,
      balance,
      payStatus,
      issueDate: b.createdAt ? new Date(b.createdAt) : new Date(),
    };
  });

  const filtered = invoices.filter((inv) => {
    if (paymentFilter !== 'ALL' && inv.payStatus !== paymentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inv.invoiceNum.toLowerCase().includes(q) ||
        (inv.bookingReference || '').toLowerCase().includes(q) ||
        (inv.customerName || '').toLowerCase().includes(q) ||
        (inv.destination || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalSettled = invoices.reduce((sum, i) => sum + i.paid, 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Tax Invoices & Billing Register"
        subtitle="Commercial and tax travel invoices issued for confirmed flights, holiday packages, and consular services"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Invoices' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh Invoices</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* SUMMARY TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Invoices Issued
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {invoices.length}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Reconciled tax documents</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Gross Invoiced Value
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-mono">
              ₹{totalBilled.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">
              ₹{totalSettled.toLocaleString()} collected
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Outstanding Receivables
            </span>
            <div className="text-2xl font-bold text-[#D54747] mt-1 font-mono">
              ₹{(totalBilled - totalSettled).toLocaleString()}
            </div>
            <p className="text-[11px] text-[#D54747] mt-0.5 font-medium">
              Unsettled balances
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
              placeholder="Search by invoice number, booking ref, client name..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Fully Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="UNPAID">Unpaid / Due</option>
            </select>

            <span className="text-xs font-mono text-[#718096] whitespace-nowrap">
              {filtered.length} invoices
            </span>
          </div>
        </div>

        {/* INVOICES TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Invoice No.</th>
                  <th className="px-4 py-3 font-semibold">Client Name</th>
                  <th className="px-4 py-3 font-semibold">Booking Ref</th>
                  <th className="px-4 py-3 font-semibold">Issue Date</th>
                  <th className="px-4 py-3 font-semibold">Invoice Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment State</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading invoice records...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      No invoice documents match your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {inv.invoiceNum}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[#153650] block">{inv.customerName || 'Valued Client'}</span>
                        <span className="text-[10px] text-[#718096] font-mono">{inv.customerPhone || 'Direct Client'}</span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#24689B] font-semibold">
                        <Link href={`/admin/bookings/${inv.id}`} className="hover:underline">
                          {inv.bookingReference || inv.id}
                        </Link>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {inv.issueDate.toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        ₹{inv.total.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={inv.payStatus} type="payment" size="sm" />
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/bookings/${inv.id}`}
                            className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED]"
                          >
                            Booking File →
                          </Link>
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

