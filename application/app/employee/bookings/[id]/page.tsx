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
  sendCustomerUpdateAction,
} from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  ArrowLeft,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  Send,
  X,
  Compass,
  Plane,
  Stamp,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

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
      amountInr: Number(payAmount),
      paymentMethod: payMethod,
      upiRef: payRef,
      internalNotes: payNotes,
      recordedByUserId: currentUser.id,
      recordedByName: currentUser.fullName,
    });
    setRecordingPay(false);

    if (res.success) {
      setShowPayModal(false);
      setPayNotes('');
      setPayRef('');
      setActionMsg({ text: `Payment recorded successfully! New Balance: ₹${res.booking?.balanceAmountInr?.toLocaleString('en-IN')}`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to record payment', type: 'error' });
    }
  };

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.booking || !compName) return;

    setAddingComp(true);
    const res = await addBookingServiceComponentAction({
      bookingId: data.booking.id,
      serviceCategory: compCategory,
      serviceName: compName,
      supplierName: compSupplier,
      internalReference: compRef,
      status: compStatus,
      startDate: data.booking.travelStartDate,
      endDate: data.booking.travelEndDate,
      responsibleUserId: currentUser.id,
      responsibleUserName: currentUser.fullName,
    });
    setAddingComp(false);

    if (res.success) {
      setShowCompModal(false);
      setCompName('');
      setCompSupplier('');
      setCompRef('');
      setActionMsg({ text: 'Service component added to fulfillment roadmap!', type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to add component', type: 'error' });
    }
  };

  const handleSendCustomerUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.customer || !data?.booking) return;

    setSendingUpdate(true);
    const recipientContact = updateChannel === 'EMAIL' ? data.customer.email : `${data.customer.phoneCountryCode || '+91'}${data.customer.phoneNumber}`;

    const res = await sendCustomerUpdateAction({
      customerId: data.customer.id,
      bookingId: data.booking.id,
      senderUserId: currentUser.id,
      senderUserName: currentUser.fullName,
      channel: updateChannel,
      category: updateCategory,
      templateTitle: `Reservation Notice: ${data.booking.bookingReference}`,
      subject: updateChannel === 'EMAIL' ? updateSubject : undefined,
      content: updateContent,
      recipientContact,
    });
    setSendingUpdate(false);

    if (res.success) {
      setShowUpdateModal(false);
      if (res.clickToChatUrl) {
        window.open(res.clickToChatUrl, '_blank');
      }
      setActionMsg({ text: `Update dispatched via ${updateChannel}! (Status: ${res.deliveryStatus})`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to send update', type: 'error' });
    }
  };

  if (loading || !data?.booking) {
    return (
      <div className="min-h-screen bg-[#101113] flex items-center justify-center p-8 text-[#969CA5]">
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="w-5 h-5 border-2 border-[#E9B95E] border-t-transparent rounded-full animate-spin" />
          <span>Loading Booking Management Dossier...</span>
        </div>
      </div>
    );
  }

  const b = data.booking;
  const c = data.customer;
  const components = data.serviceComponents || [];
  const payments = data.payments || [];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      {/* Header */}
      <header className="bg-[#17191D] border-b border-[#2A2E34] px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/bookings"
            className="p-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-[#F4F4F2] font-mono">{b.bookingReference}</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1D2025] text-[#969CA5] border border-[#2A2E34]">
                {b.serviceType}
              </span>
            </div>
            <p className="text-[11px] text-[#969CA5]">
              Customer: <span className="text-[#F4F4F2] font-medium">{c?.fullName}</span> • Period:{' '}
              {new Date(b.travelStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
              {new Date(b.travelEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpdateModal(true)}
            className="px-3 py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-xs font-medium text-[#F4F4F2] border border-[#2A2E34] inline-flex items-center gap-1.5 transition-colors"
          >
            <Send size={13} />
            <span>Send Advisory</span>
          </button>
          <button
            onClick={() => setShowPayModal(true)}
            className="px-3.5 py-1.5 rounded bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <CreditCard size={13} />
            <span>Record Payment</span>
          </button>
        </div>
      </header>

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        {actionMsg && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              actionMsg.type === 'success'
                ? 'bg-[#55B98A]/10 border-[#55B98A]/30 text-[#55B98A]'
                : 'bg-[#DF7373]/10 border-[#DF7373]/30 text-[#DF7373]'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-[#969CA5] hover:text-[#F4F4F2]">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Financial Progress & Lifecycle Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
            <span className="text-[10px] text-[#666E79] uppercase block">Total Package Value</span>
            <span className="text-xl font-semibold text-[#F4F4F2] font-mono tabular-nums mt-0.5 block">
              ₹{(b?.totalAmountInr ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#969CA5]">Quoted contract amount</span>
          </div>

          <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
            <span className="text-[10px] text-[#666E79] uppercase block">Total Received</span>
            <span className="text-xl font-semibold text-[#55B98A] font-mono tabular-nums mt-0.5 block">
              ₹{(b?.paidAmountInr ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#55B98A]">{payments.length} ledger receipts</span>
          </div>

          <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
            <span className="text-[10px] text-[#666E79] uppercase block">Outstanding Balance</span>
            <span
              className={`text-xl font-semibold font-mono tabular-nums mt-0.5 block ${
                b.balanceAmountInr > 0 ? 'text-[#DF7373]' : 'text-[#55B98A]'
              }`}
            >
              ₹{(b?.balanceAmountInr ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#666E79]">
              {b.balanceAmountInr > 0 ? 'Pending traveler payment' : 'Fully Settled'}
            </span>
          </div>

          <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
            <span className="text-[10px] text-[#666E79] uppercase block">Booking Lifecycle</span>
            <div className="mt-1">
              <select
                value={b.status}
                onChange={(e) => handleBookingStatusChange(e.target.value)}
                className="w-full text-xs bg-[#1D2025] text-[#F4F4F2] rounded px-2 py-1.5 border border-[#2A2E34] focus:outline-none cursor-pointer"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <span className="text-[10px] text-[#969CA5] mt-1 block">Managed by {b.managedByName}</span>
          </div>
        </div>

        {/* Service Components (Operational Vouchers & Suppliers) */}
        <div className="bg-[#17191D] rounded-lg p-5 border border-[#2A2E34] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
            <div>
              <h2 className="text-sm font-semibold text-[#F4F4F2]">Operational Service Components</h2>
              <p className="text-xs text-[#969CA5]">Supplier reservations, confirmations, and traveler vouchers</p>
            </div>
            <button
              onClick={() => setShowCompModal(true)}
              className="px-2.5 py-1 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-xs font-medium text-[#F4F4F2] border border-[#2A2E34] inline-flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle size={13} />
              <span>Add Component</span>
            </button>
          </div>

          <div className="divide-y divide-[#1F2329]">
            {components.map((comp: any) => (
              <div key={comp.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-[#1D2025] text-[#969CA5] border border-[#2A2E34]">
                      {comp.serviceCategory}
                    </span>
                    <h3 className="text-xs font-semibold text-[#F4F4F2]">{comp.serviceName}</h3>
                  </div>
                  <div className="text-[11px] text-[#969CA5] flex items-center gap-3">
                    <span>Supplier: <strong className="text-[#F4F4F2]">{comp.supplierName || 'Varni Concierge'}</strong></span>
                    {comp.customerConfirmationRef && (
                      <span className="font-mono text-[#55B98A]">Ref: {comp.customerConfirmationRef}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={comp.status}
                    onChange={(e) => handleServiceStatusChange(comp.id, e.target.value, comp.customerConfirmationRef)}
                    className="text-[11px] bg-[#1D2025] text-[#F4F4F2] rounded px-2 py-1 border border-[#2A2E34] focus:outline-none cursor-pointer"
                  >
                    <option value="REQUESTED">REQUESTED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="VOUCHER_ISSUED">VOUCHER ISSUED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))}

            {components.length === 0 && (
              <p className="text-xs text-[#666E79] py-6 text-center">No service components attached yet.</p>
            )}
          </div>
        </div>

        {/* Payment Ledger */}
        <div className="bg-[#17191D] rounded-lg p-5 border border-[#2A2E34] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
            <div>
              <h2 className="text-sm font-semibold text-[#F4F4F2]">Payment Ledger & Receipts</h2>
              <p className="text-xs text-[#969CA5]">All financial receipts registered against booking {b.bookingReference}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#2A2E34] text-[10px] uppercase text-[#666E79]">
                  <th className="py-2.5 px-3">Receipt Ref</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Transaction / UPI Ref</th>
                  <th className="py-2.5 px-3">Recorded At</th>
                  <th className="py-2.5 px-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2329] text-[#969CA5]">
                {payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-mono font-medium text-[#F4F4F2]">{p.paymentReference}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#55B98A] tabular-nums">
                      ₹{(p?.amountInr ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px]">{p.paymentMethod}</td>
                    <td className="py-3 px-3 font-mono text-[11px]">{p.upiRef || '—'}</td>
                    <td className="py-3 px-3 text-[#666E79]">
                      {new Date(p.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 text-[#F4F4F2]">{p.recordedByName}</td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#666E79]">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] p-5 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F2]">Record Payment Receipt</h3>
                <p className="text-xs text-[#969CA5]">Booking: {b.bookingReference}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-[#969CA5] hover:text-[#F4F4F2]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Receipt Amount (₹)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="BANK_TRANSFER">Bank IMPS / NEFT / RTGS</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash Deposit at Anand Desk</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Transaction Ref / Cheque #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI/20261104/991823/HDFC"
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Receipt notes..."
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E34]">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 text-xs text-[#969CA5] hover:text-[#F4F4F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPay}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#E9B95E] text-[#101113] hover:bg-[#F0C878] transition-colors"
                >
                  {recordingPay ? 'Saving...' : 'Record Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Component Modal */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] p-5 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F2]">Add Operational Service Component</h3>
                <p className="text-xs text-[#969CA5]">Attach hotel, transfer, cruise, flight, or visa voucher</p>
              </div>
              <button onClick={() => setShowCompModal(false)} className="text-[#969CA5] hover:text-[#F4F4F2]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddComponent} className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Category</label>
                <select
                  value={compCategory}
                  onChange={(e: any) => setCompCategory(e.target.value)}
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                >
                  <option value="HOTEL">Hotel Accommodation</option>
                  <option value="TRANSFER">Private Cab / Transfer</option>
                  <option value="CRUISE">Houseboat / Cruise</option>
                  <option value="FLIGHT">Flight Ticket</option>
                  <option value="VISA">Visa Application</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Component Name</label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. 2N Deluxe Room Munnar (Breakfast & Dinner)"
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={compSupplier}
                  onChange={(e) => setCompSupplier(e.target.value)}
                  placeholder="e.g. Spice Country Holidays Kochi"
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Voucher / Confirmation Ref</label>
                <input
                  type="text"
                  value={compRef}
                  onChange={(e) => setCompRef(e.target.value)}
                  placeholder="e.g. CONF-KL-9921"
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E34]">
                <button
                  type="button"
                  onClick={() => setShowCompModal(false)}
                  className="px-3 py-1.5 text-xs text-[#969CA5] hover:text-[#F4F4F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingComp}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#E9B95E] text-[#101113] hover:bg-[#F0C878] transition-colors"
                >
                  {addingComp ? 'Adding...' : 'Attach Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advisory Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] p-5 w-full max-w-lg space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F2]">Send Traveler Notification</h3>
                <p className="text-xs text-[#969CA5]">Direct outbound itinerary or voucher advisory</p>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="text-[#969CA5] hover:text-[#F4F4F2]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendCustomerUpdate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Channel</label>
                  <select
                    value={updateChannel}
                    onChange={(e: any) => setUpdateChannel(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  >
                    <option value="EMAIL">Email (Resend API)</option>
                    <option value="WHATSAPP">WhatsApp (Click-to-Chat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Category</label>
                  <select
                    value={updateCategory}
                    onChange={(e: any) => setUpdateCategory(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  >
                    <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
                    <option value="VOUCHER_ISSUANCE">Voucher Issuance</option>
                    <option value="PAYMENT_RECEIPT">Payment Receipt</option>
                    <option value="CUSTOM_MESSAGE">Custom Advisory</option>
                  </select>
                </div>
              </div>

              {updateChannel === 'EMAIL' && (
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    value={updateSubject}
                    onChange={(e) => setUpdateSubject(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Content</label>
                <textarea
                  rows={4}
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E34]">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-3 py-1.5 text-xs text-[#969CA5] hover:text-[#F4F4F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingUpdate}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#E9B95E] text-[#101113] hover:bg-[#F0C878] transition-colors"
                >
                  {sendingUpdate ? 'Dispatching...' : 'Dispatch Advisory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
