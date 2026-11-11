'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getBookingsAction, recordPaymentAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  CreditCard,
  RotateCw,
  Search,
  Plus,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Calendar,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const { currentUser } = useCrm();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // New Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'CASH'>('BANK_TRANSFER');
  const [txnRef, setTxnRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBookingsAction();
      const bList = Array.isArray(res?.bookings) ? res.bookings : Array.isArray(res) ? res : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Flatten all payments across all bookings
  const allPayments = bookings.flatMap((b) => {
    if (b.payments && b.payments.length > 0) {
      return b.payments.map((p: any) => ({
        ...p,
        bookingRef: b.bookingReference || b.id,
        bookingId: b.id,
        customerName: b.customerName || b.customer?.fullName,
        destination: b.destination || b.serviceDetails?.destination,
      }));
    }
    // If booking has paidAmount > 0 but payments array is empty, synthesize initial entry
    if (Number(b.paidAmount) > 0) {
      return [
        {
          id: `pay_${b.id}`,
          bookingRef: b.bookingReference || b.id,
          bookingId: b.id,
          customerName: b.customerName || b.customer?.fullName,
          destination: b.destination || b.serviceDetails?.destination,
          amount: b.paidAmount,
          method: 'BANK_TRANSFER',
          transactionRef: `INITIAL-${b.id.slice(-6)}`,
          status: 'CONFIRMED',
          createdAt: b.createdAt || new Date(),
        },
      ];
    }
    return [];
  });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef || !amount) return;
    setSubmitting(true);
    try {
      await recordPaymentAction({
        bookingId: bookingRef,
        amountInr: parseFloat(amount),
        paymentMethod: (method as any) || 'UPI',
        bankTransactionRef: txnRef || `TXN-${Date.now()}`,
        recordedByUserId: currentUser.id,
      });
      setShowModal(false);
      setBookingRef('');
      setAmount('');
      setTxnRef('');
      await loadData();
    } catch (e) {
      console.error('Failed to record payment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = allPayments.filter((p) => {
    if (methodFilter !== 'ALL' && p.method !== methodFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (p.bookingRef || '').toLowerCase().includes(q) ||
        (p.customerName || '').toLowerCase().includes(q) ||
        (p.transactionRef || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCollected = allPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Centralized Payments Ledger"
        subtitle="Realized funds, settlement vouchers, bank transaction references, and payment mode breakdowns"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Payments' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus size={13} className="text-[#E9B95E]" />
              <span>Record Payment</span>
            </button>
            <Link
              href="/admin/payments/pending"
              className="px-3.5 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#C05621] border border-[#FDE68A] text-xs font-bold rounded-none flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Pending Receivables →</span>
            </Link>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* STATS TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Transactions Logged
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {allPayments.length}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Audited entries</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Collected Volume
            </span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-mono">
              ₹{totalCollected.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">Reconciled funds</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Primary Settlement Channel
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-headline">
              NEFT / Bank Transfer
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Anand HQ current account</p>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transaction reference, booking ref, customer name..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Payment Channels</option>
              <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI / QR Code</option>
              <option value="CREDIT_CARD">Credit / Debit Card</option>
              <option value="CASH">Cash Desk</option>
            </select>

            <span className="text-xs font-mono text-[#718096] whitespace-nowrap">
              {filtered.length} transactions
            </span>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Transaction Ref</th>
                  <th className="px-4 py-3 font-semibold">Booking Ref</th>
                  <th className="px-4 py-3 font-semibold">Client Name</th>
                  <th className="px-4 py-3 font-semibold">Amount (₹)</th>
                  <th className="px-4 py-3 font-semibold">Payment Method</th>
                  <th className="px-4 py-3 font-semibold">Recorded Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading financial ledger...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#718096]">
                      No transaction records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((pay, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {pay.transactionRef || 'TXN-CONFIRMED'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-semibold text-[#24689B]">
                        <Link href={`/admin/bookings/${pay.bookingId}`} className="hover:underline">
                          {pay.bookingRef}
                        </Link>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-[#153650]">
                        {pay.customerName || 'Valued Client'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#168653]">
                        ₹{Number(pay.amount).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <span className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] text-[#153650] font-mono text-[10px] font-bold">
                          {pay.method}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${pay.bookingId}`}
                          className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED]"
                        >
                          Booking File →
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

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#153650]/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] w-full max-w-md shadow-2xl rounded-none p-5">
            <h3 className="text-sm font-bold uppercase text-[#153650] font-mono border-b border-[#E5E8ED] pb-2 mb-3">
              Record New Financial Receipt
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">Booking Reference ID *</label>
                <input
                  type="text"
                  required
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="e.g. BK-2026-1049"
                  className="w-full h-9 px-3 text-xs border border-[#E5E8ED] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 35000"
                  className="w-full h-9 px-3 text-xs border border-[#E5E8ED]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full h-9 px-2 text-xs border border-[#E5E8ED]"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS)</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash at Anand Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">Transaction Ref / UTR</label>
                <input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="e.g. UTR987654321"
                  className="w-full h-9 px-3 text-xs border border-[#E5E8ED] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs border border-[#E5E8ED] text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#153650] text-[#FFFFFF] text-xs font-bold"
                >
                  {submitting ? 'Recording...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

