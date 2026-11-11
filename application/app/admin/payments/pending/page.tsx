'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  CreditCard,
  AlertTriangle,
  RotateCw,
  Search,
  Phone,
  Mail,
  Send,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function PendingPaymentsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBookingsAction();
      const bList = Array.isArray(res?.bookings) ? res.bookings : Array.isArray(res) ? res : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load pending payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter bookings with balance > 0
  const pendingList = bookings
    .map((b) => {
      const total = Number(b.totalAmount) || Number(b.totalAmountInr) || 0;
      const paid = Number(b.paidAmount) || 0;
      const balance = Math.max(0, total - paid);
      return {
        ...b,
        total,
        paid,
        balance,
      };
    })
    .filter((b) => b.balance > 0);

  const filtered = pendingList.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (b.customerName || '').toLowerCase();
    const ref = (b.bookingReference || b.id || '').toLowerCase();
    const dest = (b.destination || '').toLowerCase();
    return name.includes(q) || ref.includes(q) || dest.includes(q);
  });

  const totalOutstanding = pendingList.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Pending Receivables & Payment Collections"
        subtitle="Unsettled customer payment balances, milestone collections, and payment reminders"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Payments', href: '/admin/payments' },
          { label: 'Pending Payments' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh Ledger</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* OUTSTANDING METRICS TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Unsettled Bookings
            </span>
            <div className="text-2xl font-bold text-[#D54747] mt-1 font-headline">
              {pendingList.length}
            </div>
            <p className="text-[11px] text-[#D54747] mt-0.5 font-medium">Awaiting final collection</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Outstanding Balance (₹)
            </span>
            <div className="text-2xl font-bold text-[#D54747] mt-1 font-mono">
              ₹{totalOutstanding.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5 font-medium">Pending realization</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Settlement Status
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">
              Milestone Active
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Payment reminders available</p>
          </div>
        </div>

        {/* SEARCH AND PENDING TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, booking ID, destination..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              Showing {filtered.length} pending receivables
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Booking Ref</th>
                  <th className="px-4 py-3 font-semibold">Traveler Dossier</th>
                  <th className="px-4 py-3 font-semibold">Destination</th>
                  <th className="px-4 py-3 font-semibold">Total Invoice</th>
                  <th className="px-4 py-3 font-semibold">Collected</th>
                  <th className="px-4 py-3 font-semibold">Outstanding Due</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading pending receivables...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#168653] font-medium">
                      All confirmed bookings are 100% paid and settled!
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        <Link href={`/admin/bookings/${b.id}`} className="hover:text-[#24689B]">
                          {b.bookingReference || b.id}
                        </Link>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[#153650] block">{b.customerName || 'Valued Client'}</span>
                        <span className="text-[10px] text-[#718096] font-mono">{b.customerPhone || 'Direct Client'}</span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-[#4A5568] font-medium">
                        {b.destination || b.serviceDetails?.destination || 'Tour Package'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-semibold text-[#153650]">
                        ₹{b.total.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#168653] font-semibold">
                        ₹{b.paid.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#D54747]">
                        ₹{b.balance.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="px-2.5 py-1 text-xs font-bold text-[#FFFFFF] bg-[#153650] hover:bg-[#24689B] rounded-none inline-block"
                        >
                          Collect Payment →
                        </Link>
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

