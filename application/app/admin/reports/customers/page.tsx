'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getCustomersAction, getLeadsAction } from '@/app/actions/crm';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  Users,
  RotateCw,
  Crown,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function CustomerInsightsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, bRes] = await Promise.all([
        getCustomersAction(),
        getBookingsAction(),
      ]);
      setCustomers(Array.isArray(c) ? c : []);
      const bList = Array.isArray(bRes?.bookings) ? bRes.bookings : Array.isArray(bRes) ? bRes : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load customer insights:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalClients = customers.length;
  const repeatTravelers = customers.filter((c) => bookings.filter((b) => b.customerId === c.id).length > 1).length;
  const repeatRate = totalClients > 0 ? Math.round((repeatTravelers / totalClients) * 100) : 0;
  const totalBilled = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || Number(b.totalAmountInr) || 0), 0);
  const avgCLV = totalClients > 0 ? Math.round(totalBilled / totalClients) : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Customer Intelligence & Lifetime Value (CLV)"
        subtitle="Repeat traveler retention, average lifetime spend, geographical distribution, and loyalty cohorts"
        breadcrumbs={[
          { label: 'Reports & Analytics', href: '/admin/reports' },
          { label: 'Customer Insights' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Registered Travelers</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{totalClients}</div>
            <p className="text-[11px] text-[#24689B] mt-0.5">Verified profiles</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Repeat Client Rate</span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-headline">{repeatRate}%</div>
            <p className="text-[11px] text-[#168653] mt-0.5">{repeatTravelers} repeat bookers</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Average Lifetime Value (CLV)</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-mono">₹{avgCLV.toLocaleString()}</div>
            <p className="text-[11px] text-[#718096] mt-0.5">Per client profile</p>
          </div>
        </div>

        {/* INSIGHTS SUMMARY */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3">
            Regional Hub & Demographic Insights
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[#F8FAFC] border border-[#E5E8ED]">
              <span className="font-semibold text-[#153650]">Geographical Origin</span>
              <p className="text-lg font-bold text-[#153650] mt-1">Anand / Vidyanagar / Vadodara</p>
              <p className="text-[11px] text-[#718096] mt-0.5">Primary catchment area in Gujarat</p>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#E5E8ED]">
              <span className="font-semibold text-[#153650]">Preferred Holiday Profile</span>
              <p className="text-lg font-bold text-[#153650] mt-1">Family & Premium Leisure</p>
              <p className="text-[11px] text-[#718096] mt-0.5">High demand for Kerala, Dubai, and Southeast Asia</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

