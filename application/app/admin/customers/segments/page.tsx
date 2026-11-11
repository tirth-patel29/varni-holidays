'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getCustomersAction, getLeadsAction } from '@/app/actions/crm';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  Users,
  Crown,
  Compass,
  Plane,
  Clock,
  RotateCw,
  Search,
  ArrowRight,
  Send,
} from 'lucide-react';

export default function CustomerSegmentsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<'VIP' | 'FREQUENT' | 'PACKAGE' | 'FLIGHT'>('VIP');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, lData, bRes] = await Promise.all([
        getCustomersAction(),
        getLeadsAction(),
        getBookingsAction(),
      ]);
      setCustomers(Array.isArray(cData) ? cData : []);
      setLeads(Array.isArray(lData) ? lData : []);
      const bList = Array.isArray(bRes?.bookings) ? bRes.bookings : Array.isArray(bRes) ? bRes : [];
      setBookings(bList);
    } catch (err) {
      console.error('Failed to load segments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics per customer
  const enrichedCustomers = customers.map((c) => {
    const cBookings = bookings.filter((b) => b.customerId === c.id);
    const cLeads = leads.filter((l) => l.customerId === c.id);
    const totalSpent = cBookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
    const packageCount = cLeads.filter((l) => l.serviceType === 'PACKAGE').length;
    const flightCount = cLeads.filter((l) => l.serviceType === 'FLIGHT').length;

    return {
      ...c,
      totalSpent,
      bookingsCount: cBookings.length,
      enquiriesCount: cLeads.length,
      packageCount,
      flightCount,
    };
  });

  // Filter cohorts
  const vipList = [...enrichedCustomers].sort((a, b) => b.totalSpent - a.totalSpent);
  const frequentList = enrichedCustomers.filter((c) => c.bookingsCount > 1 || c.enquiriesCount > 2);
  const packageSeekers = enrichedCustomers.filter((c) => c.packageCount > 0);
  const flightRegulars = enrichedCustomers.filter((c) => c.flightCount > 0);

  let currentCohort = vipList;
  if (activeSegment === 'FREQUENT') currentCohort = frequentList;
  if (activeSegment === 'PACKAGE') currentCohort = packageSeekers;
  if (activeSegment === 'FLIGHT') currentCohort = flightRegulars;

  const filtered = currentCohort.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.fullName?.toLowerCase().includes(q) || c.phoneNumber?.includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Customer Cohorts & Intelligence Segments"
        subtitle="Automated clustering of clients based on lifetime booking value, service preferences, and engagement frequency"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'Customer Segments' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Recalculate Cohorts</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* SEGMENTS SELECTOR CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 select-none">
          <button
            onClick={() => setActiveSegment('VIP')}
            className={`p-4 border rounded-none text-left transition-colors ${
              activeSegment === 'VIP'
                ? 'bg-[#FFFFFF] border-[#C05621] ring-2 ring-[#C05621]/20 shadow-xs'
                : 'bg-[#FFFFFF] border-[#E5E8ED] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#718096] text-[10px] font-bold uppercase tracking-wider">
              <span>High-Value VIPs</span>
              <Crown size={14} className="text-[#C05621]" />
            </div>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {vipList.length}
            </div>
            <p className="text-[11px] text-[#C05621] mt-0.5 font-medium">Ranked by lifetime spend</p>
          </button>

          <button
            onClick={() => setActiveSegment('FREQUENT')}
            className={`p-4 border rounded-none text-left transition-colors ${
              activeSegment === 'FREQUENT'
                ? 'bg-[#FFFFFF] border-[#24689B] ring-2 ring-[#24689B]/20 shadow-xs'
                : 'bg-[#FFFFFF] border-[#E5E8ED] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#718096] text-[10px] font-bold uppercase tracking-wider">
              <span>Frequent Travelers</span>
              <Users size={14} className="text-[#24689B]" />
            </div>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {frequentList.length}
            </div>
            <p className="text-[11px] text-[#24689B] mt-0.5 font-medium">Multiple trips / inquiries</p>
          </button>

          <button
            onClick={() => setActiveSegment('PACKAGE')}
            className={`p-4 border rounded-none text-left transition-colors ${
              activeSegment === 'PACKAGE'
                ? 'bg-[#FFFFFF] border-[#7E22CE] ring-2 ring-[#7E22CE]/20 shadow-xs'
                : 'bg-[#FFFFFF] border-[#E5E8ED] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#718096] text-[10px] font-bold uppercase tracking-wider">
              <span>Package Enthusiasts</span>
              <Compass size={14} className="text-[#7E22CE]" />
            </div>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {packageSeekers.length}
            </div>
            <p className="text-[11px] text-[#7E22CE] mt-0.5 font-medium">Holiday package history</p>
          </button>

          <button
            onClick={() => setActiveSegment('FLIGHT')}
            className={`p-4 border rounded-none text-left transition-colors ${
              activeSegment === 'FLIGHT'
                ? 'bg-[#FFFFFF] border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 shadow-xs'
                : 'bg-[#FFFFFF] border-[#E5E8ED] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#718096] text-[10px] font-bold uppercase tracking-wider">
              <span>Flight Regulars</span>
              <Plane size={14} className="text-[#1D4ED8]" />
            </div>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {flightRegulars.length}
            </div>
            <p className="text-[11px] text-[#1D4ED8] mt-0.5 font-medium">Regular flight inquiries</p>
          </button>
        </div>

        {/* COHORT TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cohort members..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:border-[#24689B]"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              Showing {filtered.length} customers in cohort
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Client Name</th>
                  <th className="px-4 py-3 font-semibold">Contact Mobile</th>
                  <th className="px-4 py-3 font-semibold">Confirmed Bookings</th>
                  <th className="px-4 py-3 font-semibold">Total Paid (₹)</th>
                  <th className="px-4 py-3 font-semibold">Preferred Service</th>
                  <th className="px-4 py-3 font-semibold text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Computing segments...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No travelers found in this cohort.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-[#153650]">
                        <Link href={`/admin/customers/${c.id}`} className="hover:text-[#24689B]">
                          {c.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                        {c.phoneCountryCode || '+91'} {c.phoneNumber}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#168653]">
                        {c.bookingsCount} bookings
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        ₹{c.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {c.packageCount >= c.flightCount ? (
                          <span className="text-[#7E22CE] font-semibold text-[11px]">Holiday Packages</span>
                        ) : (
                          <span className="text-[#1D4ED8] font-semibold text-[11px]">Flight Ticketing</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED]"
                        >
                          Dossier →
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

