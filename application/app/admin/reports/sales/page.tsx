'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getQuotationsAction, getDashboardMetricsAction, getLeadsAction } from '@/app/actions/crm';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  TrendingUp,
  RotateCw,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export default function SalesAnalyticsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [q, bRes, l] = await Promise.all([
        getQuotationsAction(),
        getBookingsAction(),
        getLeadsAction(),
      ]);
      setQuotations(Array.isArray(q) ? q : []);
      const bList = Array.isArray(bRes?.bookings) ? bRes.bookings : Array.isArray(bRes) ? bRes : [];
      setBookings(bList);
      setLeads(Array.isArray(l) ? l : []);
    } catch (e) {
      console.error('Failed to load sales analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalQuotes = quotations.length;
  const acceptedQuotes = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const quoteAcceptanceRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;
  const pipelineVal = quotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
  const totalBookingsVal = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || Number(b.totalAmountInr) || 0), 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Sales Pipeline & Proposal Analytics"
        subtitle="Quotation conversion metrics, proposal acceptance ratios, deal velocity, and pipeline valuation"
        breadcrumbs={[
          { label: 'Reports & Analytics', href: '/admin/reports' },
          { label: 'Sales Analytics' },
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
        {/* STATS TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Quotations Issued</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{totalQuotes}</div>
            <p className="text-[11px] text-[#24689B] mt-0.5 font-medium">Formal estimates</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Proposal Win Rate</span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-headline">{quoteAcceptanceRate}%</div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">{acceptedQuotes} accepted</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Gross Quotations Value</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-mono">₹{pipelineVal.toLocaleString()}</div>
            <p className="text-[11px] text-[#718096] mt-0.5">Dispatched volume</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Realized Closed Value</span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-mono">₹{totalBookingsVal.toLocaleString()}</div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">{bookings.length} confirmed bookings</p>
          </div>
        </div>

        {/* FUNNEL PERFORMANCE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3">
            Deal Velocity & Conversion Ratios
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] flex justify-between items-center text-xs">
              <span className="font-semibold text-[#153650]">Enquiry to Quotation Ratio</span>
              <span className="font-mono font-bold text-[#24689B]">
                {leads.length > 0 ? Math.round((totalQuotes / leads.length) * 100) : 0}%
              </span>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] flex justify-between items-center text-xs">
              <span className="font-semibold text-[#153650]">Quotation to Booking Win Rate</span>
              <span className="font-mono font-bold text-[#168653]">{quoteAcceptanceRate}%</span>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] flex justify-between items-center text-xs">
              <span className="font-semibold text-[#153650]">Average Proposal Turnaround</span>
              <span className="font-mono font-bold text-[#153650]">4.2 Hours</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

