'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
import { getCustomersAction } from '@/app/actions/crm';
import { createManualBookingAction, updateBookingStatusAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  BookmarkCheck,
  PlusCircle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  X,
  CreditCard,
  Calendar,
} from 'lucide-react';

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
      setActionMsg({ text: `Booking ${res.booking.bookingReference} instantiated successfully!`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to create booking', type: 'error' });
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Bookings Desk"
        subtitle="Operational booking management, component fulfillment milestones, and financial payment ledgers."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 rounded-md bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle size={14} />
            <span>New Booking</span>
          </button>
        }
      />

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

        {/* Filter Bar */}
        <div className="bg-[#17191D] rounded-lg p-3 flex items-center justify-between gap-3 border border-[#2A2E34]">
          <div className="flex items-center gap-2">
            {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-[#1D2025] text-[#F4F4F2] border border-[#2A2E34]'
                    : 'text-[#969CA5] hover:text-[#F4F4F2]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-[#969CA5] px-2 py-0.5 rounded bg-[#1D2025] border border-[#2A2E34]">
            {filteredBookings.length} Bookings
          </span>
        </div>

        {/* Bookings Data Table */}
        <div className="bg-[#17191D] rounded-lg overflow-hidden border border-[#2A2E34]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101113] text-[#666E79] uppercase text-[10px] font-medium tracking-wider border-b border-[#2A2E34]">
                <tr>
                  <th className="px-4 py-3">Booking Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Travel Period</th>
                  <th className="px-4 py-3">Financials</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Managed By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2329] text-[#969CA5]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#666E79]">
                      Loading booking records...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#666E79]">
                      No booking records found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#1D2025]/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-[#F4F4F2] whitespace-nowrap">
                        <Link href={`/employee/bookings/${b.id}`} className="hover:text-[#E9B95E] transition-colors">
                          {b.bookingReference}
                        </Link>
                        <span className="block text-[10px] text-[#666E79] font-sans">
                          {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-[#F4F4F2] block">{b.customerName}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-[#1D2025] text-[#969CA5] border border-[#2A2E34]">
                          {b.serviceType}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-[#F4F4F2]">
                        {new Date(b.travelStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                        {new Date(b.travelEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono tabular-nums font-semibold text-[#F4F4F2]">
                          ₹{b.totalAmountInr.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-[#666E79]">
                          Paid: <span className="text-[#55B98A]">₹{b.paidAmountInr.toLocaleString('en-IN')}</span> • Bal:{' '}
                          <span className={b.balanceAmountInr > 0 ? 'text-[#DF7373]' : 'text-[#666E79]'}>
                            ₹{b.balanceAmountInr.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="text-[11px] bg-[#1D2025] text-[#F4F4F2] rounded px-2 py-1 border border-[#2A2E34] focus:outline-none cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#969CA5]">
                        {b.managedByName || 'Staff Desk'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Link
                          href={`/employee/bookings/${b.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#E9B95E] hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowUpRight size={12} />
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

      {/* Manual Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] p-5 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F2]">Instantiate Booking Record</h3>
                <p className="text-xs text-[#969CA5]">Creates operational reservation in PENDING status</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#969CA5] hover:text-[#F4F4F2]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  required
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phoneCountryCode} {c.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e: any) => setServiceType(e.target.value)}
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                >
                  <option value="PACKAGE">Tour Package</option>
                  <option value="FLIGHT">Flight Ticketing</option>
                  <option value="VISA">Visa Desk</option>
                  <option value="GENERAL">General Services</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Travel Start</label>
                  <input
                    type="date"
                    value={travelStartDate}
                    onChange={(e) => setTravelStartDate(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Travel End</label>
                  <input
                    type="date"
                    value={travelEndDate}
                    onChange={(e) => setTravelEndDate(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Initial Deposit (₹)</label>
                  <input
                    type="number"
                    value={initialPaid}
                    onChange={(e) => setInitialPaid(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E34]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-[#969CA5] hover:text-[#F4F4F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#E9B95E] text-[#101113] hover:bg-[#F0C878] transition-colors"
                >
                  {creating ? 'Creating...' : 'Instantiate Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
