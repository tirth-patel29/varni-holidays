'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getBookingsAction, updateBookingStatusAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  BookmarkCheck,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  CreditCard,
  Calendar,
  ArrowRight,
  Plane,
  Building2,
  Compass,
  Stamp,
  Shield,
  Plus,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service') || 'ALL';

  const { currentUser } = useCrm();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(serviceParam);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Synchronize when query param changes
  useEffect(() => {
    setSelectedService(serviceParam);
  }, [serviceParam]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBookingsAction();
      const bList = Array.isArray(res?.bookings) ? res.bookings : Array.isArray(res) ? res : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: any) => {
    await updateBookingStatusAction(bookingId, newStatus, currentUser.id);
    await loadData();
  };

  const filtered = bookings.filter((b) => {
    // Service filter
    if (selectedService !== 'ALL') {
      const s = (b.serviceType || '').toUpperCase();
      if (selectedService === 'FLIGHT' && s !== 'FLIGHT') return false;
      if (selectedService === 'HOTEL' && s !== 'HOTEL') return false;
      if (selectedService === 'PACKAGE' && s !== 'PACKAGE' && s !== 'TOUR') return false;
      if (selectedService === 'VISA' && s !== 'VISA') return false;
      if (selectedService === 'INSURANCE' && s !== 'INSURANCE' && s !== 'TRAVEL_INSURANCE') return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const ref = (b.bookingReference || b.id || '').toLowerCase();
      const name = (b.customerName || b.customer?.fullName || '').toLowerCase();
      const phone = (b.customerPhone || b.customer?.phoneNumber || '').toLowerCase();
      const dest = (b.destination || b.serviceDetails?.destination || '').toLowerCase();
      return ref.includes(q) || name.includes(q) || phone.includes(q) || dest.includes(q);
    }

    return true;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || Number(b.totalAmountInr) || 0), 0);
  const totalCollected = bookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const totalBalance = Math.max(0, totalRevenue - totalCollected);
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'VOUCHERED').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Bookings & Travel Operations"
        subtitle="Confirmed reservations across Flights, Hotels, Tour Packages, Visas, and Travel Insurance with voucher readiness tracking"
        breadcrumbs={[
          { label: 'Bookings & Operations', href: '/admin/bookings' },
          { label: 'All Bookings' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/operations/departures"
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Calendar size={13} className="text-[#24689B]" />
              <span>Upcoming Departures</span>
            </Link>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* SERVICE FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto crm-scrollbar pb-1 select-none">
          <Link
            href="/admin/bookings"
            onClick={() => setSelectedService('ALL')}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedService === 'ALL'
                ? 'bg-[#153650] text-[#FFFFFF] border-[#153650] shadow-xs'
                : 'bg-[#FFFFFF] text-[#667085] border-[#E5E8ED] hover:bg-[#F9FAFB]'
            }`}
          >
            All Bookings ({bookings.length})
          </Link>

          <Link
            href="/admin/bookings?service=FLIGHT"
            onClick={() => setSelectedService('FLIGHT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedService === 'FLIGHT'
                ? 'bg-[#1D4ED8] text-[#FFFFFF] border-[#1D4ED8] shadow-xs'
                : 'bg-[#FFFFFF] text-[#1D4ED8] border-[#BFDBFE] hover:bg-[#EFF6FF]'
            }`}
          >
            <Plane size={13} />
            <span>Flight Tickets</span>
          </Link>

          <Link
            href="/admin/bookings?service=HOTEL"
            onClick={() => setSelectedService('HOTEL')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedService === 'HOTEL'
                ? 'bg-[#B45309] text-[#FFFFFF] border-[#B45309] shadow-xs'
                : 'bg-[#FFFFFF] text-[#B45309] border-[#FDE68A] hover:bg-[#FFFBEB]'
            }`}
          >
            <Building2 size={13} />
            <span>Hotel Bookings</span>
          </Link>

          <Link
            href="/admin/bookings?service=PACKAGE"
            onClick={() => setSelectedService('PACKAGE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedService === 'PACKAGE'
                ? 'bg-[#7E22CE] text-[#FFFFFF] border-[#7E22CE] shadow-xs'
                : 'bg-[#FFFFFF] text-[#7E22CE] border-[#E9D5FF] hover:bg-[#FAF5FF]'
            }`}
          >
            <Compass size={13} />
            <span>Tour Packages</span>
          </Link>

          <Link
            href="/admin/bookings?service=VISA"
            onClick={() => setSelectedService('VISA')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedService === 'VISA'
                ? 'bg-[#15803D] text-[#FFFFFF] border-[#15803D] shadow-xs'
                : 'bg-[#FFFFFF] text-[#15803D] border-[#BBF7D0] hover:bg-[#F0FDF4]'
            }`}
          >
            <Stamp size={13} />
            <span>Visa Applications</span>
          </Link>

          <Link
            href="/admin/bookings?service=INSURANCE"
            onClick={() => setSelectedService('INSURANCE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border rounded-none transition-colors whitespace-nowrap ${
              selectedService === 'INSURANCE'
                ? 'bg-[#047857] text-[#FFFFFF] border-[#047857] shadow-xs'
                : 'bg-[#FFFFFF] text-[#047857] border-[#A7F3D0] hover:bg-[#ECFDF5]'
            }`}
          >
            <Shield size={13} />
            <span>Travel Insurance</span>
          </Link>
        </div>

        {/* 3 METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Total Bookings Volume
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {bookings.length}
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">
              {confirmedCount} confirmed & voucher-ready
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Realized Payments Collected
            </span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-headline">
              ₹{totalCollected.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5 font-medium">
              Out of ₹{totalRevenue.toLocaleString()} gross value
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Outstanding Receivables
            </span>
            <div className="text-2xl font-bold text-[#D54747] mt-1 font-headline">
              ₹{totalBalance.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#D54747] mt-0.5 font-medium">
              Awaiting milestone settlement
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by booking reference, traveler name, phone, destination..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
            >
              <option value="ALL">All Booking Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="VOUCHERED">Vouchered</option>
              <option value="PENDING">Pending Documents</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <span className="text-xs font-mono text-[#718096] whitespace-nowrap">
              {filtered.length} matched
            </span>
          </div>
        </div>

        {/* BOOKINGS DATA TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Booking Ref</th>
                  <th className="px-4 py-3 font-semibold">Customer Dossier</th>
                  <th className="px-4 py-3 font-semibold">Service Type</th>
                  <th className="px-4 py-3 font-semibold">Travel Dates / Destination</th>
                  <th className="px-4 py-3 font-semibold">Total Amount</th>
                  <th className="px-4 py-3 font-semibold">Paid / Balance</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading bookings register...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#718096]">
                      No confirmed bookings found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => {
                    const total = Number(b.totalAmount) || Number(b.totalAmountInr) || 0;
                    const paid = Number(b.paidAmount) || 0;
                    const balance = Math.max(0, total - paid);

                    return (
                      <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                          <Link
                            href={`/admin/bookings/${b.id}`}
                            className="font-bold text-[#153650] hover:text-[#24689B] block"
                          >
                            {b.bookingReference || b.id}
                          </Link>
                          <span className="text-[10px] text-[#718096]">
                            {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {b.customerId ? (
                            <Link
                              href={`/admin/customers/${b.customerId}`}
                              className="font-bold text-[#153650] hover:text-[#24689B] block"
                            >
                              {b.customerName || b.customer?.fullName || 'Traveler'}
                            </Link>
                          ) : (
                            <span className="font-bold text-[#153650] block">
                              {b.customerName || b.customer?.fullName || 'Traveler'}
                            </span>
                          )}
                          <span className="text-[10px] text-[#718096] font-mono">
                            {b.customerPhone || b.customer?.phoneNumber || 'No phone'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={b.serviceType || 'PACKAGE'} type="service" size="sm" />
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-[#4A5568]">
                          <div className="font-medium text-[#153650]">
                            {b.destination || b.serviceDetails?.destination || 'Tour Itinerary'}
                          </div>
                          <span className="text-[10px] text-[#718096] font-mono">
                            {b.travelDates || b.serviceDetails?.travelDates || 'Dates confirmed'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                          ₹{total.toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                          <span className="text-[#168653] font-semibold">₹{paid.toLocaleString()}</span>
                          {balance > 0 && (
                            <span className="text-[#D54747] font-semibold block text-[10px]">
                              Due: ₹{balance.toLocaleString()}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className="h-7 px-2 text-[11px] font-mono font-bold uppercase bg-[#FFFFFF] border border-[#E5E8ED] rounded-none focus:outline-none"
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="VOUCHERED">VOUCHERED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/bookings/${b.id}`}
                            className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED] inline-block"
                          >
                            Voucher File →
                          </Link>
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
    </div>
  );
}
