'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getBookingDetailsAction, updateBookingStatusAction, recordPaymentAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  BookmarkCheck,
  Calendar,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  RotateCw,
  FileText,
  Send,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCrm();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Quick Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'CASH'>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getBookingDetailsAction(bookingId);
      if (!data) {
        router.push('/admin/bookings');
        return;
      }
      setBooking(data);
    } catch (e) {
      console.error('Failed to load booking details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) loadData();
  }, [bookingId]);

  const handleStatusUpdate = async (newStatus: any) => {
    setStatusUpdating(true);
    try {
      await updateBookingStatusAction(bookingId, newStatus, currentUser.id);
      await loadData();
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) return;
    setPayLoading(true);
    try {
      await recordPaymentAction({
        bookingId,
        amountInr: parseFloat(payAmount),
        paymentMethod: (payMethod as any) || 'UPI',
        bankTransactionRef: payRef || `TXN-${Date.now()}`,
        recordedByUserId: currentUser.id,
      });
      setShowPayModal(false);
      setPayAmount('');
      setPayRef('');
      await loadData();
    } catch (e) {
      console.error('Failed to record payment:', e);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-[#F7F8FA]">
        <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#718096] uppercase font-mono">
          Loading booking reservation dossier...
        </p>
      </div>
    );
  }

  const total = Number(booking.totalAmount) || Number(booking.totalAmountInr) || 0;
  const paid = Number(booking.paidAmount) || 0;
  const balance = Math.max(0, total - paid);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title={`Booking ${booking.bookingReference || booking.id}`}
        subtitle={`Confirmed travel reservation • ${booking.serviceType || 'Travel Package'} • Created ${new Date(booking.createdAt).toLocaleDateString()}`}
        breadcrumbs={[
          { label: 'Bookings & Operations', href: '/admin/bookings' },
          { label: 'All Bookings', href: '/admin/bookings' },
          { label: booking.bookingReference || booking.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPayModal(true)}
              className="px-3.5 py-1.5 bg-[#168653] hover:bg-[#15803D] text-[#FFFFFF] text-xs font-bold rounded-none flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CreditCard size={13} />
              <span>Record Payment</span>
            </button>
            <Link
              href="/admin/bookings"
              className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E8ED] text-xs font-semibold text-[#667085] hover:bg-[#F9FAFB] rounded-none"
            >
              ← Back to Bookings
            </Link>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* SUMMARY TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Booking Status
            </span>
            <div className="mt-1">
              <StatusBadge status={booking.status} type="booking" size="md" />
            </div>
            <p className="text-[11px] text-[#718096] mt-1 font-mono">
              Operational state
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Package Price
            </span>
            <div className="text-xl font-bold text-[#153650] mt-1 font-mono">
              ₹{total.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">Agreed invoice total</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Payment Received
            </span>
            <div className="text-xl font-bold text-[#168653] mt-1 font-mono">
              ₹{paid.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5">Realized funds</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 rounded-none shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Balance Remaining
            </span>
            <div className="text-xl font-bold text-[#D54747] mt-1 font-mono">
              ₹{balance.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#D54747] mt-0.5 font-medium">
              {balance > 0 ? 'Pending collection' : 'Fully settled'}
            </p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Booking Components (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Travel Details Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3 mb-4">
                Itinerary & Operational Component
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#718096]">Destination / Service</span>
                  <p className="text-sm font-bold text-[#153650] mt-0.5">
                    {booking.destination || booking.serviceDetails?.destination || 'Custom Travel Itinerary'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#718096]">Travel Dates</span>
                  <p className="text-sm font-semibold text-[#153650] mt-0.5 font-mono">
                    {booking.travelDates || booking.serviceDetails?.travelDates || 'Dates finalized'}
                  </p>
                </div>
              </div>

              {booking.serviceDetails?.components && booking.serviceDetails.components.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#E5E8ED]">
                  <span className="text-[10px] font-bold uppercase text-[#718096] block mb-2">
                    Service Components Breakdown
                  </span>
                  <div className="space-y-2">
                    {booking.serviceDetails.components.map((comp: any, idx: number) => (
                      <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#153650]">{comp.name || comp.type}</span>
                        <StatusBadge status={comp.status || 'CONFIRMED'} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Ledger Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
              <div className="flex justify-between items-center border-b border-[#E5E8ED] pb-3 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono">
                  Payment History & Ledger
                </h3>
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-2.5 py-1 text-xs font-bold bg-[#153650] text-[#FFFFFF] rounded-none"
                >
                  + Add Payment
                </button>
              </div>

              <div className="space-y-3">
                {booking.payments && booking.payments.length > 0 ? (
                  booking.payments.map((p: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#FAFBFD] border border-[#E5E8ED] flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[#153650] font-mono">₹{Number(p.amount).toLocaleString()}</span>
                        <span className="text-[11px] text-[#718096] ml-2">via {p.method}</span>
                        <p className="text-[10px] text-[#A0AEC0] font-mono mt-0.5">Ref: {p.transactionRef || 'N/A'}</p>
                      </div>
                      <span className="text-[10px] text-[#718096] font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#718096] italic py-4 text-center">
                    No itemized payments logged in database yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Consultant Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Customer Contact Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-2">
                Traveler Profile
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Client Name</span>
                  <span className="font-bold text-[#153650] text-sm">{booking.customerName || 'Valued Client'}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Mobile Phone</span>
                  <span className="font-mono text-[#153650]">{booking.customerPhone || 'Not recorded'}</span>
                </div>
                <div>
                  <span className="text-[#718096] block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-mono text-[#153650]">{booking.customerEmail || '—'}</span>
                </div>
                {booking.customerId && (
                  <div className="pt-2 border-t border-[#E5E8ED]">
                    <Link
                      href={`/admin/customers/${booking.customerId}`}
                      className="text-xs font-bold text-[#24689B] hover:underline"
                    >
                      View Complete Customer Dossier →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status Control */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-2">
                Update Booking Lifecycle
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('CONFIRMED')}
                  className="w-full py-1.5 text-xs font-semibold border border-[#E5E8ED] hover:bg-[#F9FAFB] text-[#153650]"
                >
                  Set as CONFIRMED
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('VOUCHERED')}
                  className="w-full py-1.5 text-xs font-semibold bg-[#DEF7EC] border border-[#BCF0DA] text-[#03543F]"
                >
                  Set as VOUCHERED
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('CANCELLED')}
                  className="w-full py-1.5 text-xs font-semibold bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B]"
                >
                  Set as CANCELLED
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* RECORD PAYMENT MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#153650]/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] w-full max-w-md shadow-2xl rounded-none p-5">
            <h3 className="text-sm font-bold uppercase text-[#153650] font-mono border-b border-[#E5E8ED] pb-2 mb-3">
              Record Payment for {booking.bookingReference || booking.id}
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder={`Outstanding: ₹${balance}`}
                  className="w-full h-9 px-3 text-xs border border-[#E5E8ED]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">Payment Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full h-9 px-2 text-xs border border-[#E5E8ED]"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash at Anand Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#153650] mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UTR12345678"
                  className="w-full h-9 px-3 text-xs border border-[#E5E8ED] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 text-xs border border-[#E5E8ED] text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-4 py-1.5 bg-[#153650] text-[#FFFFFF] text-xs font-bold"
                >
                  {payLoading ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

