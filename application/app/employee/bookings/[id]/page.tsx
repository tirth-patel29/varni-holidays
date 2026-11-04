'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getBookingDetailsAction,
  updateBookingStatusAction,
  updateBookingServiceComponentAction,
  addBookingServiceComponentAction,
  recordPaymentAction,
  recordRefundAction,
  sendCustomerUpdateAction,
} from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params?.id as string;
  const { currentUser } = useCrm();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'UPI' | 'BANK_TRANSFER' | 'CARD' | 'CASH' | 'CHEQUE'>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [recordingPay, setRecordingPay] = useState(false);

  // Add Component Modal State
  const [showCompModal, setShowCompModal] = useState(false);
  const [compCategory, setCompCategory] = useState<'FLIGHT' | 'HOTEL' | 'VISA' | 'TRANSFER' | 'CRUISE'>('HOTEL');
  const [compName, setCompName] = useState('');
  const [compSupplier, setCompSupplier] = useState('');
  const [compRef, setCompRef] = useState('');
  const [compStatus, setCompStatus] = useState('REQUESTED');
  const [addingComp, setAddingComp] = useState(false);

  // Customer Update Composer State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateChannel, setUpdateChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [updateCategory, setUpdateCategory] = useState<any>('BOOKING_CONFIRMATION');
  const [updateSubject, setUpdateSubject] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [sendingUpdate, setSendingUpdate] = useState(false);

  const loadData = async () => {
    if (!bookingId) return;
    setLoading(true);
    const res = await getBookingDetailsAction(bookingId);
    if (res.success) {
      setData(res);
      if (res.booking) {
        setPayAmount(res.booking.balanceAmountInr > 0 ? String(res.booking.balanceAmountInr) : '0');
        setUpdateSubject(`Reservation Update: ${res.booking.bookingReference} - Varni Holidays`);
        setUpdateContent(
          `Dear ${res.customer?.fullName || 'Traveler'},\n\nWe have an update regarding your booking (${res.booking.bookingReference}).\nStatus: ${res.booking.status}\nTravel Dates: ${new Date(res.booking.travelStartDate).toLocaleDateString('en-IN')} to ${new Date(res.booking.travelEndDate).toLocaleDateString('en-IN')}.\n\nOur concierge desk is monitoring your arrangements.\n\nWarm regards,\nVarni Holidays Anand`
        );
      }
    } else {
      setActionMsg({ text: res.error || 'Failed to load booking details', type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [bookingId]);

  const handleBookingStatusChange = async (newStatus: any) => {
    if (!data?.booking) return;
    const res = await updateBookingStatusAction(data.booking.id, newStatus, currentUser.id);
    if (res.success) {
      setActionMsg({ text: `Booking status changed to ${newStatus}`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to update status', type: 'error' });
    }
  };

  const handleServiceStatusChange = async (serviceId: string, newStatus: string, confirmationRef?: string) => {
    const res = await updateBookingServiceComponentAction(serviceId, { status: newStatus, customerConfirmationRef: confirmationRef }, currentUser.id);
    if (res.success) {
      setActionMsg({ text: 'Service component updated successfully', type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to update component', type: 'error' });
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.booking || !payAmount) return;

    setRecordingPay(true);
    const res = await recordPaymentAction({
      bookingId: data.booking.id,
      amountInr: Number(payAmount) || 0,
      paymentMethod: payMethod,
      upiRef: payMethod === 'UPI' ? payRef : undefined,
      bankTransactionRef: payMethod === 'BANK_TRANSFER' ? payRef : undefined,
      internalNotes: payNotes,
      recordedByUserId: currentUser.id,
    });
    setRecordingPay(false);

    if (res.success && res.payment) {
      setShowPayModal(false);
      setActionMsg({ text: `Payment of ₹${res.payment.amountInr.toLocaleString('en-IN')} recorded successfully! Ref: ${res.payment.paymentReference}`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to record payment', type: 'error' });
    }
  };

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.booking || !compName) return;

    setAddingComp(true);
    const res = await addBookingServiceComponentAction(
      data.booking.id,
      {
        bookingId: data.booking.id,
        serviceCategory: compCategory,
        serviceName: compName,
        supplierName: compSupplier,
        customerConfirmationRef: compRef,
        status: compStatus,
        responsibleUserId: currentUser.id,
        responsibleUserName: currentUser.fullName,
      },
      currentUser.id
    );
    setAddingComp(false);

    if (res.success) {
      setShowCompModal(false);
      setCompName('');
      setActionMsg({ text: 'New service component attached to booking', type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to add service component', type: 'error' });
    }
  };

  const handleSendUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.booking || !data?.customer) return;

    setSendingUpdate(true);
    const recipientContact =
      updateChannel === 'EMAIL'
        ? data.customer.email
        : `${data.customer.phoneCountryCode || '+91'}${data.customer.phoneNumber}`;

    const res = await sendCustomerUpdateAction({
      customerId: data.customer.id,
      bookingId: data.booking.id,
      senderUserId: currentUser.id,
      senderUserName: currentUser.fullName,
      channel: updateChannel,
      category: updateCategory,
      templateTitle: `Booking Update: ${data.booking.bookingReference}`,
      subject: updateSubject,
      content: updateContent,
      recipientContact,
    });
    setSendingUpdate(false);

    if (res.success) {
      setShowUpdateModal(false);
      if (res.clickToChatUrl) {
        window.open(res.clickToChatUrl, '_blank');
      }
      setActionMsg({
        text: `${updateChannel} update dispatched! (Status: ${res.deliveryStatus})`,
        type: 'success',
      });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to dispatch customer update', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading Booking Command Desk...</span>
        </div>
      </div>
    );
  }

  if (!data?.booking) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
          <h2 className="text-lg font-bold text-slate-800">Booking Not Found</h2>
          <p className="text-sm text-slate-600 mt-1 mb-4">The reservation record could not be located.</p>
          <Link href="/employee/bookings" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
            Back to Bookings Desk
          </Link>
        </div>
      </div>
    );
  }

  const { booking, services, payments, customer } = data;
  const paymentPercent = booking.totalAmountInr > 0 ? Math.min(100, Math.round(((booking.paidAmountInr || 0) / booking.totalAmountInr) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Breadcrumb & Quick Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/employee/bookings" className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Bookings</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-mono font-bold text-sm text-slate-900">{booking.bookingReference}</span>
          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
            booking.status === 'CONFIRMED'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : booking.status === 'IN_PROGRESS'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : booking.status === 'PENDING'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {booking.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpdateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            <span>Notify Customer</span>
          </button>

          <button
            onClick={() => setShowPayModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-sm font-bold">payments</span>
            <span>Record Payment</span>
          </button>

          <select
            value={booking.status}
            onChange={(e) => handleBookingStatusChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {actionMsg && (
        <div className={`max-w-6xl mx-auto mt-4 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
          actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-500 hover:text-slate-800">×</button>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-6 sm:p-8 space-y-8">
        {/* Reservation Overview & Financial Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Information</span>
            <div className="text-base font-bold text-slate-900">{customer?.fullName || booking.customerName}</div>
            <div className="text-xs text-slate-600 leading-relaxed">
              <p>Phone: {customer?.phoneCountryCode} {customer?.phoneNumber}</p>
              <p>Email: {customer?.email || 'N/A'}</p>
              <p>City: {customer?.city || 'Anand, Gujarat'}</p>
            </div>
            {customer && (
              <Link
                href={`/employee/customers/${customer.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1"
              >
                <span>View Customer 360 Profile</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </Link>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trip & Booking Schedule</span>
            <div className="text-sm font-bold text-slate-900">{booking.serviceType} Journey</div>
            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Departure: <strong className="text-slate-800">{new Date(booking.travelStartDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </p>
              <p>
                Return: <strong className="text-slate-800">{new Date(booking.travelEndDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </p>
              <p>Case Manager: <span className="font-semibold text-slate-800">{booking.managedByName}</span></p>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Financial Ledger</span>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-600">Total Booked:</span>
              <span className="font-mono font-bold text-slate-900 text-base">₹{booking.totalAmountInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-emerald-700 font-medium">Collected:</span>
              <span className="font-mono font-bold text-emerald-700">₹{(booking.paidAmountInr || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-amber-700 font-medium">Balance Due:</span>
              <span className="font-mono font-bold text-amber-700">₹{(booking.balanceAmountInr || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${paymentPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${paymentPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 text-right">{paymentPercent}% Settled</div>
          </div>
        </div>

        {/* Service Progress Tracking Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Component Service Operations</h2>
              <p className="text-xs text-slate-500">Independent tracking for flights, hotel vouchers, visa filings, and transfers.</p>
            </div>
            <button
              onClick={() => setShowCompModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-xs"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Add Service Component</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                No service components attached yet. Click "Add Service Component" to attach Flights, Hotels, or Transfers.
              </div>
            ) : (
              services.map((srv: any) => (
                <div key={srv.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-1.5 ${
                        srv.serviceCategory === 'FLIGHT'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : srv.serviceCategory === 'HOTEL'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : srv.serviceCategory === 'VISA'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {srv.serviceCategory}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{srv.serviceName}</h3>
                    </div>

                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {srv.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {srv.supplierName && (
                      <p><strong className="text-slate-700">Vendor / Supplier:</strong> {srv.supplierName}</p>
                    )}
                    {srv.customerConfirmationRef && (
                      <p>
                        <strong className="text-slate-700">Confirmation / PNR / Voucher:</strong>{' '}
                        <span className="font-mono font-bold text-indigo-700">{srv.customerConfirmationRef}</span>
                      </p>
                    )}
                    {srv.notes && <p className="text-slate-500 italic mt-1">"{srv.notes}"</p>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400">Assigned: {srv.responsibleUserName}</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={srv.status}
                        onChange={(e) => handleServiceStatusChange(srv.id, e.target.value)}
                        className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-1 text-slate-700 font-semibold focus:outline-none"
                      >
                        <option value="REQUESTED">REQUESTED</option>
                        <option value="PENDING_CONFIRMATION">PENDING_CONFIRMATION</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="VOUCHER_ISSUED">VOUCHER_ISSUED</option>
                        <option value="RESERVED_TICKETED">RESERVED_TICKETED</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payments Ledger Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Payment Transactions & Receipts</h2>
              <p className="text-xs text-slate-500">Record payments via UPI, Bank Transfer, Card, or Cash with audit tracking.</p>
            </div>
            <button
              onClick={() => setShowPayModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Record New Payment</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Payment Ref</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Transaction ID / URN</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Received Date</th>
                  <th className="px-6 py-3.5">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No payments recorded yet for this booking.
                    </td>
                  </tr>
                ) : (
                  payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{p.paymentReference}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">₹{p.amountInr.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{p.upiRef || p.bankTransactionRef || 'N/A'}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{new Date(p.receivedAt).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3.5 text-slate-600 font-medium">{p.recordedByName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Client Payment</h3>
                <p className="text-xs text-slate-500">Log incoming funds and update booking balance.</p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full text-base font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm, BHIM)</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash Deposit at Anand Office</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank Transaction / UPI Reference ID</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI/20261104/991823 or HDFC-NEFT-88192"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. 50% advance confirmed by accounts."
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPay}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs disabled:opacity-50"
                >
                  {recordingPay ? 'Processing...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Component Modal */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Service Component</h3>
                <p className="text-xs text-slate-500">Attach an operational requirement to this booking.</p>
              </div>
              <button
                onClick={() => setShowCompModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddComponent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={compCategory}
                  onChange={(e) => setCompCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                >
                  <option value="FLIGHT">Flight Reservation (PNR Tracker)</option>
                  <option value="HOTEL">Hotel / Resort Stay</option>
                  <option value="VISA">Visa Application</option>
                  <option value="TRANSFER">Ground Transfer / Vehicle</option>
                  <option value="CRUISE">Houseboat / Cruise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Name / Route</label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Ahmedabad - Dubai IndiGo 6E-1453"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  value={compSupplier}
                  onChange={(e) => setCompSupplier(e.target.value)}
                  placeholder="e.g. IndiGo Airlines / Spice Country Kochi"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PNR / Voucher / Ref Number</label>
                <input
                  type="text"
                  value={compRef}
                  onChange={(e) => setCompRef(e.target.value)}
                  placeholder="e.g. PNR-6E-88291"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                <select
                  value={compStatus}
                  onChange={(e) => setCompStatus(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                >
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="PENDING_CONFIRMATION">PENDING_CONFIRMATION</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="VOUCHER_ISSUED">VOUCHER_ISSUED</option>
                  <option value="RESERVED_TICKETED">RESERVED_TICKETED</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCompModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingComp}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs disabled:opacity-50"
                >
                  {addingComp ? 'Adding...' : 'Attach Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Update Composer Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Notify Customer (Composer)</h3>
                <p className="text-xs text-slate-500">Send an update via Resend Email or Meta WhatsApp.</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendUpdate} className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUpdateChannel('EMAIL')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    updateChannel === 'EMAIL'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Resend Email
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateChannel('WHATSAPP')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    updateChannel === 'WHATSAPP'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  WhatsApp Business
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Category</label>
                <select
                  value={updateCategory}
                  onChange={(e) => setUpdateCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                >
                  <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
                  <option value="FLIGHT_CONFIRMED">Flight Ticket / PNR Issued</option>
                  <option value="HOTEL_CONFIRMED">Hotel Confirmation & Voucher</option>
                  <option value="VISA_SUBMITTED">Visa Application Progress</option>
                  <option value="ITINERARY_PREPARED">Itinerary Shared</option>
                  <option value="CUSTOM_MESSAGE">Custom Advisory</option>
                </select>
              </div>

              {updateChannel === 'EMAIL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={updateSubject}
                    onChange={(e) => setUpdateSubject(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Content</label>
                <textarea
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  rows={5}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingUpdate}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs disabled:opacity-50"
                >
                  {sendingUpdate ? 'Dispatching...' : `Send via ${updateChannel}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

