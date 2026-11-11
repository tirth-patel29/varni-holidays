'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  CreditCard,
  RotateCw,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function FinancialTransactionsPage() {
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
      console.error('Failed to load transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const transactions = bookings.flatMap((b) => {
    if (b.payments && b.payments.length > 0) {
      return b.payments.map((p: any) => ({
        ...p,
        bookingRef: b.bookingReference || b.id,
        bookingId: b.id,
        customerName: b.customerName || b.customer?.fullName,
      }));
    }
    if (Number(b.paidAmount) > 0) {
      return [
        {
          id: `txn_${b.id}`,
          bookingRef: b.bookingReference || b.id,
          bookingId: b.id,
          customerName: b.customerName || b.customer?.fullName,
          amount: b.paidAmount,
          method: 'BANK_TRANSFER',
          transactionRef: `CONF-${b.id.slice(-6)}`,
          createdAt: b.createdAt || new Date(),
        },
      ];
    }
    return [];
  });

  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (t.transactionRef || '').toLowerCase().includes(q) ||
      (t.bookingRef || '').toLowerCase().includes(q) ||
      (t.customerName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Financial Transactions Audit Ledger"
        subtitle="Itemized audit trail of customer payments, bank credit receipts, and currency settlements"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Financial Transactions' },
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
        {/* SEARCH AND TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions by reference, booking ID, client name..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              {filtered.length} transaction entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Transaction ID / UTR</th>
                  <th className="px-4 py-3 font-semibold">Booking File</th>
                  <th className="px-4 py-3 font-semibold">Traveler</th>
                  <th className="px-4 py-3 font-semibold">Amount (₹)</th>
                  <th className="px-4 py-3 font-semibold">Channel</th>
                  <th className="px-4 py-3 font-semibold">Settlement Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading accounting entries...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      No transaction entries found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {t.transactionRef || t.id}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-semibold text-[#24689B]">
                        <Link href={`/admin/bookings/${t.bookingId}`} className="hover:underline">
                          {t.bookingRef}
                        </Link>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-[#153650]">
                        {t.customerName || 'Valued Client'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#168653]">
                        ₹{Number(t.amount).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[10px] uppercase font-bold text-[#4A5568]">
                        {t.method}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${t.bookingId}`}
                          className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED]"
                        >
                          Booking Dossier →
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

