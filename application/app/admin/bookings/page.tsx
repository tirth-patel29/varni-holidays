'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCustomersAction } from '@/app/actions/crm';
import { updateBookingStatusAction } from '@/app/actions/phase3';
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
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const { currentUser } = useCrm();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
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
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchSearch =
      !search.trim() ||
      b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.destination?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmountInr || 0), 0);
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#168653] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Operational Fulfilment
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Confirmed Bookings & Vouchers
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Full lifecycle tracking: confirmed passenger reservations, supplier vouchers, payment milestones, and ticketing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Refresh Bookings</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <div className="flex items-center justify-between text-[#718096] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Total Bookings</span>
              <BookmarkCheck size={16} className="text-[#153650]" />
            </div>
            <div className="text-2xl font-bold font-headline text-[#153650] mt-1">
              {bookings.length}
            </div>
            <div className="text-[11px] text-[#718096] mt-1">
              {confirmedCount} Confirmed & voucher-ready
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <div className="flex items-center justify-between text-[#718096] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Booking Value</span>
              <CreditCard size={16} className="text-[#168653]" />
            </div>
            <div className="text-2xl font-bold font-headline text-[#168653] mt-1 tabular-nums font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#168653] font-semibold mt-1">
              All active customer files
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <div className="flex items-center justify-between text-[#718096] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Average Value</span>
              <Calendar size={16} className="text-[#24689B]" />
            </div>
            <div className="text-2xl font-bold font-headline text-[#24689B] mt-1 tabular-nums font-mono">
              ₹{bookings.length > 0 ? Math.round(totalRevenue / bookings.length).toLocaleString('en-IN') : 0}
            </div>
            <div className="text-[11px] text-[#718096] mt-1">
              Per itinerary booking
            </div>
          </div>
        </div>

        {/* Filters & Bookings Table Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by reference, traveler name, or destination..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
              />
              <Search size={14} className="text-[#718096] absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#153650] font-semibold py-1.5 px-3 rounded-none focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROVISIONAL">PROVISIONAL</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Booking Ref</th>
                  <th className="px-4 py-3">Traveler Name</th>
                  <th className="px-4 py-3">Service / Destination</th>
                  <th className="px-4 py-3">Travel Dates</th>
                  <th className="px-4 py-3 font-mono">Total Invoiced</th>
                  <th className="px-4 py-3 font-mono">Paid to Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#718096]">
                      Loading bookings directory...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#718096]">
                      No bookings matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {b.bookingReference}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#153650]">{b.customerName}</div>
                        <span className="text-[10px] text-[#718096] font-mono">{b.customerPhone}</span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-[#718096] font-medium">
                        {b.serviceType} • {b.destination || 'Kerala Leisure'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[#718096]">
                        {b.travelStartDate ? new Date(b.travelStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Tentative'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        ₹{(b.totalAmountInr || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#168653]">
                        ₹{(b.paidAmountInr || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="text-xs bg-[#F8FAFC] text-[#153650] font-bold rounded-none px-2 py-1 border border-[#E5E8ED] focus:outline-none cursor-pointer"
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROVISIONAL">PROVISIONAL</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right font-medium">
                        <Link
                          href={`/employee/bookings/${b.id}`}
                          className="text-xs font-bold text-[#24689B] hover:text-[#153650] hover:underline"
                        >
                          Voucher Dossier →
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

