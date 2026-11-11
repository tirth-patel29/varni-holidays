'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getLeadsAction } from '@/app/actions/crm';
import {
  Inbox,
  RotateCw,
  Plane,
  Compass,
  Stamp,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function EnquiryAnalyticsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getLeadsAction();
      setLeads(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load enquiry analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const total = leads.length;
  const flights = leads.filter((l) => l.serviceType === 'FLIGHT').length;
  const packages = leads.filter((l) => l.serviceType === 'PACKAGE').length;
  const visas = leads.filter((l) => l.serviceType === 'VISA').length;
  const insurance = leads.filter((l) => l.serviceType === 'TRAVEL_INSURANCE').length;

  const urgentCount = leads.filter((l) => l.priorityLevel === 'URGENT').length;
  const highCount = leads.filter((l) => l.priorityLevel === 'HIGH').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Enquiry Inflow & Intake Analytics"
        subtitle="Channel origin, service distribution, lead qualification speed, and urgency classification"
        breadcrumbs={[
          { label: 'Reports & Analytics', href: '/admin/reports' },
          { label: 'Enquiry Analytics' },
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Total Enquiries</span>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{total}</div>
            <p className="text-[11px] text-[#24689B] mt-0.5">Database records</p>
          </div>
          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Urgent Intent</span>
            <div className="text-2xl font-bold text-[#D54747] mt-1 font-headline">{urgentCount}</div>
            <p className="text-[11px] text-[#D54747] mt-0.5">Departing &lt; 7 days</p>
          </div>
          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">High Priority</span>
            <div className="text-2xl font-bold text-[#C05621] mt-1 font-headline">{highCount}</div>
            <p className="text-[11px] text-[#C05621] mt-0.5">Budget confirmed</p>
          </div>
          <div className="bg-[#FFFFFF] p-4 border border-[#E5E8ED] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#718096]">Average Response</span>
            <div className="text-xl font-bold text-[#168653] mt-1 font-headline">&lt; 25 mins</div>
            <p className="text-[11px] text-[#168653] mt-0.5">Anand HQ SLA</p>
          </div>
        </div>

        {/* SERVICE SPLIT TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono border-b border-[#E5E8ED] pb-3">
            Inbound Travel Demand Distribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FAF5FF] border border-[#E9D5FF]">
              <span className="font-semibold text-xs text-[#7E22CE]">Tour Packages</span>
              <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{packages}</div>
              <p className="text-[11px] text-[#718096] mt-0.5">
                {total > 0 ? Math.round((packages / total) * 100) : 0}% of all intake
              </p>
            </div>

            <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE]">
              <span className="font-semibold text-xs text-[#1D4ED8]">Flight Ticketing</span>
              <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{flights}</div>
              <p className="text-[11px] text-[#718096] mt-0.5">
                {total > 0 ? Math.round((flights / total) * 100) : 0}% of all intake
              </p>
            </div>

            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="font-semibold text-xs text-[#15803D]">Visa Processing</span>
              <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{visas}</div>
              <p className="text-[11px] text-[#718096] mt-0.5">
                {total > 0 ? Math.round((visas / total) * 100) : 0}% of all intake
              </p>
            </div>

            <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0]">
              <span className="font-semibold text-xs text-[#047857]">Travel Insurance</span>
              <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{insurance}</div>
              <p className="text-[11px] text-[#718096] mt-0.5">
                {total > 0 ? Math.round((insurance / total) * 100) : 0}% of all intake
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

