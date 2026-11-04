'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
import { getCustomersAction } from '@/app/actions/crm';
import { createManualBookingAction, updateBookingStatusAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';

export default function BookingsPage() {
  const { currentUser } = useCrm();

  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Manual booking modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [serviceType, setServiceType] = useState<'PACKAGE' | 'FLIGHT' | 'VISA' | 'GENERAL'>('PACKAGE');
  const [travelStartDate, setTravelStartDate] = useState('');
  const [travelEndDate, setTravelEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('50000');
  const [initialPaid, setInitialPaid] = useState('0');
  const [creating, setCreating] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    // Fetch bookings via simple fetch or action
    try {
      const res = await fetch('/api/crm/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      // fallback
    }
    const custs = await getCustomersAction();
    setCustomers(custs || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: any) => {
    const res = await updateBookingStatusAction(bookingId, newStatus, currentUser.id);
    if (res.success) {
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to update booking status', type: 'error' });
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !travelStartDate || !travelEndDate) {
      setActionMsg({ text: 'Please fill in all required booking details', type: 'error' });
      return;
    }

    setCreating(true);
    // STRICT BUSINESS RULE: Bookings are NEVER automatically confirmed on creation; created in PENDING status
    const res = await createManualBookingAction({
      customerId: selectedCustomerId,
      serviceType,
      managedByUserId: currentUser.id,
      travelStartDate,
      travelEndDate,
      totalAmountInr: Number(totalAmount) || 0,
      initialPaidAmountInr: Number(initialPaid) || 0,
      status: 'PENDING',
    });

    setCreating(false);

    if (res.success && res.booking) {
      setShowModal(false);
      setActionMsg({ text: `Booking ${res.booking.bookingReference} created successfully in PENDING status!`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to create booking', type: 'error' });
    }
  };

  // Financial metrics
  const totalVolume = bookings.reduce((sum, b) => sum + (b.totalAmountInr || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmountInr || 0), 0);
  const totalBalance = bookings.reduce((sum, b) => sum + (b.balanceAmountInr || 0), 0);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900 font-sans">
      <CrmHeader
        title="Bookings & Reservations Desk"
        subtitle="Track multi-service operations, flight PNRs, hotel vouchers, and payment milestones."
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {actionMsg && (
          <div className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-slate-500 hover:text-slate-800">×</button>
          </div>
        )}

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Booked Volume</span>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-1">₹{totalVolume.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 mt-1 block">{bookings.length} reservations recorded</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Total Collected</span>
            <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">₹{totalPaid.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 mt-1 block">Advance & full receipts</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Balance Outstanding</span>
            <div className="text-2xl font-mono font-bold text-amber-700 mt-1">₹{totalBalance.toLocaleString('en-IN')}</div>
            <span className="text-xs text-slate-500 mt-1 block">Pending client settlements</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Confirmed Deliveries</span>
            <div className="text-2xl font-mono font-bold text-indigo-700 mt-1">
              {bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS').length}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Active operations underway</span>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>New Manual Booking</span>
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Booking Ref</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Service Type</th>
                  <th className="px-5 py-3.5">Travel Dates</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Financial Progress</th>
                  <th className="px-5 py-3.5">Assigned Lead</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      No bookings found for this criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const percent = b.totalAmountInr > 0 ? Math.min(100, Math.round(((b.paidAmountInr || 0) / b.totalAmountInr) * 100)) : 0;

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          <Link href={`/employee/bookings/${b.id}`} className="hover:text-indigo-600 hover:underline">
                            {b.bookingReference}
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 block">{b.customerName}</span>
                          <span className="text-[11px] text-slate-500">Managed by {b.managedByName}</span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            b.serviceType === 'FLIGHT'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : b.serviceType === 'PACKAGE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {b.serviceType}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-700 text-[11px] leading-tight">
                          <span className="font-medium">{new Date(b.travelStartDate).toLocaleDateString('en-IN')}</span>
                          <span className="text-slate-400 block">to {new Date(b.travelEndDate).toLocaleDateString('en-IN')}</span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'IN_PROGRESS'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : b.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : b.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 min-w-[160px]">
                          <div className="flex justify-between text-[11px] font-mono mb-1">
                            <span className="font-bold text-slate-900">₹{(b.paidAmountInr || 0).toLocaleString('en-IN')}</span>
                            <span className="text-slate-400">/ ₹{b.totalAmountInr.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">{percent}% settled</span>
                        </td>

                        <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                          {b.leadId ? b.leadId.slice(0, 16) : 'Direct Booking'}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/employee/bookings/${b.id}`}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                            >
                              Manage Desk
                            </Link>

                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              className="text-[11px] bg-white border border-slate-200 rounded-lg p-1 text-slate-700 focus:outline-none"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
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

      {/* Manual Booking Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Direct Reservation</h3>
                <p className="text-xs text-slate-500">Initiate a booking in PENDING status for operations tracking.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} • {c.phoneNumber} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                >
                  <option value="PACKAGE">Holiday Package (Kerala, Domestic, International)</option>
                  <option value="FLIGHT">Flight Reservation</option>
                  <option value="VISA">Visa Assistance</option>
                  <option value="GENERAL">General / Customized Travel Booking</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Travel Start Date</label>
                  <input
                    type="date"
                    value={travelStartDate}
                    onChange={(e) => setTravelStartDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Travel End Date</label>
                  <input
                    type="date"
                    value={travelEndDate}
                    onChange={(e) => setTravelEndDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Package / Fare (INR)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Advance Received (INR)</label>
                  <input
                    type="number"
                    value={initialPaid}
                    onChange={(e) => setInitialPaid(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                <strong>Business Rule:</strong> New bookings are created in <strong>PENDING</strong> status. They require manual voucher confirmation or payment verification before moving to CONFIRMED.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Initialize Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
