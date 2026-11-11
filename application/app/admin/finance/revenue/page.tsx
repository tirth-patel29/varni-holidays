'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getBookingsAction } from '@/app/actions/phase3';
import { getQuotationsAction, getDashboardMetricsAction } from '@/app/actions/crm';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  RotateCw,
  Compass,
  Plane,
  Stamp,
  Shield,
  Building2,
  Calendar,
} from 'lucide-react';

export default function RevenueOverviewPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, qRes, mData] = await Promise.all([
        getBookingsAction(),
        getQuotationsAction(),
        getDashboardMetricsAction(),
      ]);
      const bList = Array.isArray(bRes?.bookings) ? bRes.bookings : Array.isArray(bRes) ? bRes : [];
      setBookings(bList);
      setQuotations(Array.isArray(qRes) ? qRes : []);
      setMetrics(mData);
    } catch (e) {
      console.error('Failed to load revenue overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalInvoiced = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || Number(b.totalAmountInr) || 0), 0);
  const totalCollected = bookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalCollected);
  const totalQuotedPipeline = quotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);

  // Revenue by service breakdown
  const packageRevenue = bookings
    .filter((b) => (b.serviceType || '').toUpperCase() === 'PACKAGE' || (b.serviceType || '').toUpperCase() === 'TOUR')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const flightRevenue = bookings
    .filter((b) => (b.serviceType || '').toUpperCase() === 'FLIGHT')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const visaRevenue = bookings
    .filter((b) => (b.serviceType || '').toUpperCase() === 'VISA')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const hotelRevenue = bookings
    .filter((b) => (b.serviceType || '').toUpperCase() === 'HOTEL')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const insuranceRevenue = bookings
    .filter((b) => (b.serviceType || '').toUpperCase() === 'INSURANCE' || (b.serviceType || '').toUpperCase() === 'TRAVEL_INSURANCE')
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const otherRevenue = Math.max(0, totalInvoiced - (packageRevenue + flightRevenue + visaRevenue + hotelRevenue + insuranceRevenue));

  const averageBookingValue = bookings.length > 0 ? Math.round(totalInvoiced / bookings.length) : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Revenue & Financial Performance Overview"
        subtitle="Gross order value, realized bank receipts, service volume margins, and pipeline conversion valuation"
        breadcrumbs={[
          { label: 'Sales & Finance', href: '/admin/quotations' },
          { label: 'Revenue Overview' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh Analytics</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* 4 PRIMARY METRIC TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Actual Realized Revenue
            </span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-mono">
              ₹{totalCollected.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">Funds deposited in bank</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Pending Receivables Due
            </span>
            <div className="text-2xl font-bold text-[#D54747] mt-1 font-mono">
              ₹{totalOutstanding.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#D54747] mt-0.5 font-medium">From confirmed trips</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Quotation Pipeline Value
            </span>
            <div className="text-2xl font-bold text-[#24689B] mt-1 font-mono">
              ₹{totalQuotedPipeline.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5 font-medium">Active proposals in flight</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-none border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
              Average Order Value (AOV)
            </span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-mono">
              ₹{averageBookingValue.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5 font-medium">Per confirmed traveler</p>
          </div>
        </div>

        {/* SERVICE-WISE REVENUE BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3 mb-4">
              Revenue by Travel Service
            </h3>

            <div className="space-y-4">
              {/* Tour Packages */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 text-[#153650]">
                    <Compass size={14} className="text-[#7E22CE]" />
                    Tour & Holiday Packages
                  </span>
                  <span className="font-mono text-[#153650]">₹{packageRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9]">
                  <div
                    className="h-full bg-[#7E22CE]"
                    style={{ width: `${totalInvoiced > 0 ? (packageRevenue / totalInvoiced) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Flights */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 text-[#153650]">
                    <Plane size={14} className="text-[#1D4ED8]" />
                    Flight Ticketing
                  </span>
                  <span className="font-mono text-[#153650]">₹{flightRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9]">
                  <div
                    className="h-full bg-[#1D4ED8]"
                    style={{ width: `${totalInvoiced > 0 ? (flightRevenue / totalInvoiced) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Visas */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 text-[#153650]">
                    <Stamp size={14} className="text-[#15803D]" />
                    Consular Visa Assistance
                  </span>
                  <span className="font-mono text-[#153650]">₹{visaRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9]">
                  <div
                    className="h-full bg-[#15803D]"
                    style={{ width: `${totalInvoiced > 0 ? (visaRevenue / totalInvoiced) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Hotels */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 text-[#153650]">
                    <Building2 size={14} className="text-[#B45309]" />
                    Hotels & Resorts
                  </span>
                  <span className="font-mono text-[#153650]">₹{hotelRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-[#F1F5F9]">
                  <div
                    className="h-full bg-[#B45309]"
                    style={{ width: `${totalInvoiced > 0 ? (hotelRevenue / totalInvoiced) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FINANCIAL CONVERSION LEDGER SUMMARY */}
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3 mb-4">
                Booking Conversion & Realization Ratio
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED]">
                  <div className="flex justify-between font-semibold text-[#153650]">
                    <span>Quotation to Realized Conversion</span>
                    <span className="font-mono text-[#168653]">
                      {totalQuotedPipeline > 0 ? Math.round((totalCollected / totalQuotedPipeline) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#718096] mt-1">
                    Ratio of funds deposited relative to total proposals dispatched.
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED]">
                  <div className="flex justify-between font-semibold text-[#153650]">
                    <span>Collection Settlement Rate</span>
                    <span className="font-mono text-[#24689B]">
                      {totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#718096] mt-1">
                    Percentage of confirmed booking value that has been collected into Anand HQ bank accounts.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E8ED] flex items-center justify-between text-xs">
              <span className="text-[#718096]">Audit Source:</span>
              <span className="font-bold text-[#153650]">PostgreSQL Reconciled Ledger</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

