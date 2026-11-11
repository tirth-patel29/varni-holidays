'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  Calendar,
  AlertTriangle,
  Clock,
  RotateCw,
  Search,
  CheckCircle2,
  FileText,
  CreditCard,
  Plane,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function UpcomingDeparturesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7' | '14' | '30' | 'ALL'>('14');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBookingsAction();
      const bList = Array.isArray(res?.bookings) ? res.bookings : Array.isArray(res) ? res : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load departures:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute days until departure and readiness flags
  const departures = bookings.map((b) => {
    const total = Number(b.totalAmount) || Number(b.totalAmountInr) || 0;
    const paid = Number(b.paidAmount) || 0;
    const balance = Math.max(0, total - paid);

    // Approximate travel date parse or future fallback
    const travelDate = b.travelStartDate ? new Date(b.travelStartDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const diffDays = Math.ceil((travelDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return {
      ...b,
      travelDate,
      diffDays,
      total,
      paid,
      balance,
      hasPendingPayment: balance > 0,
      isVouchered: b.status === 'VOUCHERED',
    };
  });

  const filtered = departures.filter((d) => {
    if (timeframe === '7' && (d.diffDays < 0 || d.diffDays > 7)) return false;
    if (timeframe === '14' && (d.diffDays < 0 || d.diffDays > 14)) return false;
    if (timeframe === '30' && (d.diffDays < 0 || d.diffDays > 30)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (d.customerName || '').toLowerCase();
      const dest = (d.destination || d.serviceDetails?.destination || '').toLowerCase();
      const ref = (d.bookingReference || d.id || '').toLowerCase();
      return name.includes(q) || dest.includes(q) || ref.includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Upcoming Travel Departures & Flight Operations"
        subtitle="Operational flight manifests, departure countdown alerts, voucher readiness, and pending payment flags"
        breadcrumbs={[
          { label: 'Bookings & Operations', href: '/admin/bookings' },
          { label: 'Upcoming Departures' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh Roster</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* TIMEFRAME FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto select-none">
          <button
            onClick={() => setTimeframe('7')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors ${
              timeframe === '7'
                ? 'bg-[#153650] text-[#FFFFFF] border-[#153650] shadow-xs'
                : 'bg-[#FFFFFF] text-[#667085] border-[#E5E8ED] hover:bg-[#F9FAFB]'
            }`}
          >
            Departing in Next 7 Days
          </button>
          <button
            onClick={() => setTimeframe('14')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors ${
              timeframe === '14'
                ? 'bg-[#153650] text-[#FFFFFF] border-[#153650] shadow-xs'
                : 'bg-[#FFFFFF] text-[#667085] border-[#E5E8ED] hover:bg-[#F9FAFB]'
            }`}
          >
            Departing in Next 14 Days
          </button>
          <button
            onClick={() => setTimeframe('30')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors ${
              timeframe === '30'
                ? 'bg-[#153650] text-[#FFFFFF] border-[#153650] shadow-xs'
                : 'bg-[#FFFFFF] text-[#667085] border-[#E5E8ED] hover:bg-[#F9FAFB]'
            }`}
          >
            Departing in Next 30 Days
          </button>
          <button
            onClick={() => setTimeframe('ALL')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors ${
              timeframe === 'ALL'
                ? 'bg-[#153650] text-[#FFFFFF] border-[#153650] shadow-xs'
                : 'bg-[#FFFFFF] text-[#667085] border-[#E5E8ED] hover:bg-[#F9FAFB]'
            }`}
          >
            All Scheduled Departures
          </button>
        </div>

        {/* SEARCH AND ROSTER TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departures by traveler, destination, booking ID..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              Showing {filtered.length} upcoming travel files
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Countdown</th>
                  <th className="px-4 py-3 font-semibold">Traveler & Ref</th>
                  <th className="px-4 py-3 font-semibold">Destination / Route</th>
                  <th className="px-4 py-3 font-semibold">Readiness Checklist</th>
                  <th className="px-4 py-3 font-semibold">Payment Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading departure manifests...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No travelers scheduled to depart in this window.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-bold font-mono bg-[#153650] text-[#E9B95E] rounded-none inline-block">
                          {d.diffDays > 0 ? `${d.diffDays} Days` : 'Today'}
                        </span>
                        <span className="text-[10px] text-[#718096] block mt-0.5 font-mono">
                          {d.travelDate.toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${d.id}`}
                          className="font-bold text-[#153650] hover:text-[#24689B] block"
                        >
                          {d.customerName || 'Valued Client'}
                        </Link>
                        <span className="text-[10px] text-[#718096] font-mono">
                          {d.bookingReference || d.id} • {d.customerPhone || 'No phone'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#4A5568]">
                        <span className="text-[#153650] font-semibold block">
                          {d.destination || d.serviceDetails?.destination || 'Tour Package'}
                        </span>
                        <StatusBadge status={d.serviceType || 'PACKAGE'} type="service" size="sm" />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          {d.isVouchered ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#168653] font-semibold">
                              <CheckCircle2 size={12} />
                              Vouchers Issued
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#C05621] font-semibold">
                              <AlertTriangle size={12} />
                              Vouchers Pending
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                        {d.hasPendingPayment ? (
                          <span className="text-[#D54747] font-bold text-xs">
                            Due: ₹{d.balance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[#168653] font-bold text-xs">
                            Fully Settled (₹{d.paid.toLocaleString()})
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${d.id}`}
                          className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED]"
                        >
                          Voucher File →
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

