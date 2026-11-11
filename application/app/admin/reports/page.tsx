'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getDashboardMetricsAction, getLeadsAction } from '@/app/actions/crm';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  BarChart3,
  TrendingUp,
  RotateCw,
  Calendar,
  Compass,
  Plane,
  Stamp,
  Shield,
  Users,
  DollarSign,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export default function BusinessPerformanceReportsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'TODAY' | '7D' | '30D' | 'MONTH' | 'ALL'>('30D');

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, l, b] = await Promise.all([
        getDashboardMetricsAction(),
        getLeadsAction(),
        getBookingsAction(),
      ]);
      setMetrics(m);
      setLeads(Array.isArray(l) ? l : []);
      const bList = Array.isArray(b?.bookings) ? b.bookings : Array.isArray(b) ? b : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEnquiries = leads.length;
  const convertedCount = leads.filter((l) => l.stage === 'CONVERTED').length;
  const conversionRate = totalEnquiries > 0 ? Math.round((convertedCount / totalEnquiries) * 100) : 0;
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || Number(b.totalAmountInr) || 0), 0);
  const avgBookingVal = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Business Performance & Analytics Executive Cockpit"
        subtitle="Audited enterprise metrics, conversion funnels, order valuation, and travel product demand trends"
        breadcrumbs={[
          { label: 'Reports & Analytics', href: '/admin/reports' },
          { label: 'Business Performance' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="h-8 px-2 text-xs bg-[#FFFFFF] border border-[#E5E8ED] text-[#153650] font-semibold"
            >
              <option value="TODAY">Today</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="MONTH">This Month</option>
              <option value="ALL">All Time History</option>
            </select>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* SUB-CATEGORY TABS */}
        <div className="flex items-center border-b border-[#E5E8ED] bg-[#FFFFFF] px-4 overflow-x-auto crm-scrollbar select-none">
          <Link
            href="/admin/reports"
            className="px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap border-[#24689B] text-[#24689B] bg-[#F7F8FA]"
          >
            Business Performance
          </Link>
          <Link
            href="/admin/reports/enquiries"
            className="px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap border-transparent text-[#667085] hover:text-[#153650]"
          >
            Enquiry Analytics
          </Link>
          <Link
            href="/admin/reports/sales"
            className="px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap border-transparent text-[#667085] hover:text-[#153650]"
          >
            Sales Funnel
          </Link>
          <Link
            href="/admin/reports/bookings"
            className="px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap border-transparent text-[#667085] hover:text-[#153650]"
          >
            Booking Trends
          </Link>
          <Link
            href="/admin/reports/revenue"
            className="px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap border-transparent text-[#667085] hover:text-[#153650]"
          >
            Revenue Reports
          </Link>
          <Link
            href="/admin/reports/employees"
            className="px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap border-transparent text-[#667085] hover:text-[#153650]"
          >
            Employee Workload
          </Link>
          <Link
            href="/admin/reports/customers"
            className="px-4 py-3 text-xs font-bold border-b-2 uppercase tracking-wider whitespace-nowrap border-transparent text-[#667085] hover:text-[#153650]"
          >
            Customer Insights
          </Link>
        </div>

        {/* 6 EXECUTIVE METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Total Enquiries</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{totalEnquiries}</div>
            <p className="text-[11px] text-[#24689B] mt-0.5 font-medium">All channels</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Conversion Rate</span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-headline">{conversionRate}%</div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">{convertedCount} won deals</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Confirmed Bookings</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{bookings.length}</div>
            <p className="text-[11px] text-[#718096] mt-0.5">Voucher-ready files</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Total Revenue</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-mono">₹{(totalRevenue / 1000).toFixed(0)}k</div>
            <p className="text-[11px] text-[#718096] mt-0.5">₹{totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Average Order Value</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-mono">₹{(avgBookingVal / 1000).toFixed(0)}k</div>
            <p className="text-[11px] text-[#718096] mt-0.5">Per confirmed trip</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Primary Channel</span>
            <div className="text-xl font-bold text-[#24689B] mt-1 font-headline truncate">Website & WA</div>
            <p className="text-[11px] text-[#718096] mt-0.5">Organic customer intent</p>
          </div>
        </div>

        {/* DETAILED REPORT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3">
              Sales Pipeline Stage Velocity
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#153650]">1. Inbound Leads Received</span>
                  <span className="font-mono text-[#718096]">{totalEnquiries} (100%)</span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9]">
                  <div className="h-full bg-[#153650] w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#153650]">2. Contacted & Requirements Collected</span>
                  <span className="font-mono text-[#718096]">
                    {leads.filter((l) => l.stage !== 'NEW').length} (
                    {totalEnquiries > 0 ? Math.round((leads.filter((l) => l.stage !== 'NEW').length / totalEnquiries) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9]">
                  <div
                    className="h-full bg-[#24689B]"
                    style={{
                      width: `${totalEnquiries > 0 ? (leads.filter((l) => l.stage !== 'NEW').length / totalEnquiries) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#153650]">3. Formal Quotations Sent</span>
                  <span className="font-mono text-[#718096]">
                    {leads.filter((l) => l.stage === 'QUOTATION_SENT' || l.stage === 'NEGOTIATION' || l.stage === 'CONVERTED').length} (
                    {totalEnquiries > 0 ? Math.round((leads.filter((l) => l.stage === 'QUOTATION_SENT' || l.stage === 'NEGOTIATION' || l.stage === 'CONVERTED').length / totalEnquiries) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9]">
                  <div
                    className="h-full bg-[#C05621]"
                    style={{
                      width: `${totalEnquiries > 0 ? (leads.filter((l) => l.stage === 'QUOTATION_SENT' || l.stage === 'NEGOTIATION' || l.stage === 'CONVERTED').length / totalEnquiries) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#153650]">4. Converted into Confirmed Bookings</span>
                  <span className="font-mono text-[#168653] font-bold">
                    {convertedCount} ({conversionRate}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9]">
                  <div
                    className="h-full bg-[#168653]"
                    style={{ width: `${conversionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Mix Distribution */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3 mb-4">
                Travel Product Volume Share
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FAF5FF] border border-[#E9D5FF]">
                  <span className="text-[#7E22CE] font-bold block">Tour Packages</span>
                  <div className="text-lg font-bold text-[#153650] mt-1">
                    {metrics?.packagesCount || 0} enquiries
                  </div>
                </div>

                <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE]">
                  <span className="text-[#1D4ED8] font-bold block">Flight Tickets</span>
                  <div className="text-lg font-bold text-[#153650] mt-1">
                    {metrics?.flightsCount || 0} enquiries
                  </div>
                </div>

                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0]">
                  <span className="text-[#15803D] font-bold block">Consular Visa</span>
                  <div className="text-lg font-bold text-[#153650] mt-1">
                    {metrics?.visaCount || 0} enquiries
                  </div>
                </div>

                <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0]">
                  <span className="text-[#047857] font-bold block">Travel Insurance</span>
                  <div className="text-lg font-bold text-[#153650] mt-1">
                    {leads.filter((l) => l.serviceType === 'TRAVEL_INSURANCE').length} enquiries
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E8ED] mt-4 flex items-center justify-between text-xs text-[#718096]">
              <span>Reporting Engine:</span>
              <span className="font-semibold text-[#153650]">Live Neon PostgreSQL Aggregation</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

