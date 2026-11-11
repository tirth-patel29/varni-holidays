'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { getLeadsAction, getFollowUpsAction, getQuotationsAction } from '@/app/actions/crm';
import { getBookingsAction } from '@/app/actions/phase3';
import { DEFAULT_USERS } from '@/lib/auth/session';
import {
  Users,
  RotateCw,
  CheckCircle2,
  Clock,
  BookmarkCheck,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function EmployeePerformancePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [l, f, q, bRes] = await Promise.all([
        getLeadsAction(),
        getFollowUpsAction(),
        getQuotationsAction(),
        getBookingsAction(),
      ]);
      setLeads(Array.isArray(l) ? l : []);
      setFollowUps(Array.isArray(f) ? f : []);
      setQuotations(Array.isArray(q) ? q : []);
      const bList = Array.isArray(bRes?.bookings) ? bRes.bookings : Array.isArray(bRes) ? bRes : [];
      setBookings(bList);
    } catch (e) {
      console.error('Failed to load employee metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats per team member
  const staffStats = DEFAULT_USERS.map((user) => {
    const assignedLeads = leads.filter((l) => l.assignedUserId === user.id);
    const converted = assignedLeads.filter((l) => l.stage === 'CONVERTED').length;
    const rate = assignedLeads.length > 0 ? Math.round((converted / assignedLeads.length) * 100) : 0;
    const userFollowUps = followUps.filter((f) => f.assignedUserId === user.id);
    const completedFollowUps = userFollowUps.filter((f) => f.status === 'COMPLETED').length;
    const userBookings = bookings.filter((b) => b.assignedUserId === user.id);

    return {
      ...user,
      leadsCount: assignedLeads.length,
      convertedCount: converted,
      conversionRate: rate,
      followUpsCount: userFollowUps.length,
      completedFollowUps,
      bookingsCount: userBookings.length,
    };
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Consultant Workload & Performance Reporting"
        subtitle="Assigned lead volume, follow-up SLA completion, proposal generation, and client conversion ratios"
        breadcrumbs={[
          { label: 'Reports & Analytics', href: '/admin/reports' },
          { label: 'Employee Performance' },
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
        {/* STAFF DIRECTORY TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E8ED]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#153650] font-mono">
              Travel Consultant Performance Matrix
            </h3>
            <p className="text-[11px] text-[#718096] mt-0.5">
              Audited workload distribution across senior management and operations consultants
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Specialist Name & Role</th>
                  <th className="px-4 py-3 font-semibold">Assigned Leads</th>
                  <th className="px-4 py-3 font-semibold">Touchpoints Done</th>
                  <th className="px-4 py-3 font-semibold">Confirmed Bookings</th>
                  <th className="px-4 py-3 font-semibold">Conversion Rate</th>
                  <th className="px-4 py-3 font-semibold text-right">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading staff performance records...
                    </td>
                  </tr>
                ) : (
                  staffStats.map((staff) => (
                    <tr key={staff.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-none bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#153650]">
                            {staff.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#153650] block">{staff.fullName}</span>
                            <span className="text-[10px] text-[#718096] font-mono uppercase">
                              {staff.role.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        {staff.leadsCount} leads
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-[#24689B]">
                        {staff.completedFollowUps} completed
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#168653]">
                        {staff.convertedCount} won
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                        <span className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1]">
                          {staff.conversionRate}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-[#168653] flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 bg-[#168653] inline-block" />
                          <span>Active on Duty</span>
                        </span>
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

