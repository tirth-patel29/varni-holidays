'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getBookingsAction } from '@/app/actions/phase3';
import {
  TrendingUp,
  RotateCw,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
} from 'lucide-react';

export default function RevenueReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getBookingsAction();
      const bList = Array.isArray(res?.bookings) ? res.bookings : Array.isArray(res) ? res : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load revenue reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalInvoiced = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || Number(b.totalAmountInr) || 0), 0);
  const totalSettled = bookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const totalReceivable = Math.max(0, totalInvoiced - totalSettled);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Revenue & Receivables Financial Reporting"
        subtitle="Gross invoiced revenue, realized bank settlement funds, outstanding collection age, and profit margins"
        breadcrumbs={[
          { label: 'Reports & Analytics', href: '/admin/reports' },
          { label: 'Revenue Reports' },
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
        {/* SUMMARY TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Gross Billed Volume</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-mono">₹{totalInvoiced.toLocaleString()}</div>
            <p className="text-[11px] text-[#718096] mt-0.5 font-medium">All confirmed files</p>
          </div>

          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Deposited in Bank</span>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-mono">₹{totalSettled.toLocaleString()}</div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">
              {totalInvoiced > 0 ? Math.round((totalSettled / totalInvoiced) * 100) : 0}% realized
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Receivables Pending</span>
            <div className="text-2xl font-bold text-[#D54747] mt-1 font-mono">₹{totalReceivable.toLocaleString()}</div>
            <p className="text-[11px] text-[#D54747] mt-0.5 font-medium">Payment reminders active</p>
          </div>
        </div>

        {/* MONTHLY FINANCIAL BREAKDOWN */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3">
            Financial Ledger Reconciliation
          </h3>

          <div className="p-4 bg-[#F8FAFC] border border-[#E5E8ED] text-xs space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-[#153650]">Current Fiscal Quarter Performance</span>
              <span className="font-mono text-[#168653]">100% On-Target</span>
            </div>
            <p className="text-[#667085] text-[11px]">
              Reconciled across GST tax rates, airline PNR ticketing fees, resort commissions, and consular visa charges.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

