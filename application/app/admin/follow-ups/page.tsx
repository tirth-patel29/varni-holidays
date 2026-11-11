'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { getFollowUpsAction, completeFollowUpAction, createFollowUpAction, getLeadsAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RotateCw,
  Plus,
  Search,
  User,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function FollowUpsWorkspacePage() {
  const { currentUser, allUsers } = useCrm();
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED'>('TODAY');
  const [search, setSearch] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, lData] = await Promise.all([
        getFollowUpsAction(),
        getLeadsAction(),
      ]);
      setFollowUps(Array.isArray(fData) ? fData : []);
      setLeads(Array.isArray(lData) ? lData : []);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await completeFollowUpAction(id);
      await loadData();
    } catch (err) {
      console.error('Failed to complete follow up:', err);
    } finally {
      setCompletingId(null);
    }
  };

  // Helper date calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

  const overdueList = followUps.filter((f) => {
    if (f.status === 'COMPLETED') return false;
    const due = new Date(f.scheduledAt).getTime();
    return due < startOfToday;
  });

  const todayList = followUps.filter((f) => {
    if (f.status === 'COMPLETED') return false;
    const due = new Date(f.scheduledAt).getTime();
    return due >= startOfToday && due <= endOfToday;
  });

  const upcomingList = followUps.filter((f) => {
    if (f.status === 'COMPLETED') return false;
    const due = new Date(f.scheduledAt).getTime();
    return due > endOfToday;
  });

  const completedList = followUps.filter((f) => f.status === 'COMPLETED');

  // Active list based on tab
  let currentList = todayList;
  if (activeTab === 'OVERDUE') currentList = overdueList;
  if (activeTab === 'UPCOMING') currentList = upcomingList;
  if (activeTab === 'COMPLETED') currentList = completedList;

  // Search filter
  const filtered = currentList.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const note = (f.reminderNote || '').toLowerCase();
    const lead = leads.find((l) => l.id === f.leadId);
    const cust = (lead?.customer?.fullName || '').toLowerCase();
    return note.includes(q) || cust.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Follow-ups & Reminders Workspace"
        subtitle="Operational schedule for customer touchpoints, itinerary clarifications, and payment reminders"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'Follow-ups & Reminders' },
        ]}
        actions={
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
            <span>Refresh</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* STATS TABS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 select-none">
          <button
            onClick={() => setActiveTab('TODAY')}
            className={`p-4 border rounded-none text-left transition-colors ${
              activeTab === 'TODAY'
                ? 'bg-[#FFFFFF] border-[#24689B] ring-2 ring-[#24689B]/20 shadow-xs'
                : 'bg-[#FFFFFF] border-[#E5E8ED] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#718096] text-[10px] font-bold uppercase tracking-wider">
              <span>Today&apos;s Touchpoints</span>
              <Clock size={14} className="text-[#24689B]" />
            </div>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {todayList.length}
            </div>
            <p className="text-[11px] text-[#24689B] mt-0.5 font-medium">Due by end of day</p>
          </button>

          <button
            onClick={() => setActiveTab('OVERDUE')}
            className={`p-4 border rounded-none text-left transition-colors ${
              activeTab === 'OVERDUE'
                ? 'bg-[#FFFFFF] border-[#D54747] ring-2 ring-[#D54747]/20 shadow-xs'
                : 'bg-[#FFFFFF] border-[#E5E8ED] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#718096] text-[10px] font-bold uppercase tracking-wider">
              <span>Overdue Follow-ups</span>
              <AlertTriangle size={14} className="text-[#D54747]" />
            </div>
            <div className="text-2xl font-bold text-[#D54747] mt-1 font-headline">
              {overdueList.length}
            </div>
            <p className="text-[11px] text-[#D54747] mt-0.5 font-medium">Action required immediately</p>
          </button>

          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`p-4 border rounded-none text-left transition-colors ${
              activeTab === 'UPCOMING'
                ? 'bg-[#FFFFFF] border-[#168653] ring-2 ring-[#168653]/20 shadow-xs'
                : 'bg-[#FFFFFF] border-[#E5E8ED] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#718096] text-[10px] font-bold uppercase tracking-wider">
              <span>Upcoming</span>
              <Calendar size={14} className="text-[#168653]" />
            </div>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">
              {upcomingList.length}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5 font-medium">Future scheduled tasks</p>
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`p-4 border rounded-none text-left transition-colors ${
              activeTab === 'COMPLETED'
                ? 'bg-[#FFFFFF] border-[#153650] ring-2 ring-[#153650]/20 shadow-xs'
                : 'bg-[#FFFFFF] border-[#E5E8ED] hover:border-[#CBD5E1]'
            }`}
          >
            <div className="flex items-center justify-between text-[#718096] text-[10px] font-bold uppercase tracking-wider">
              <span>Completed</span>
              <CheckCircle2 size={14} className="text-[#153650]" />
            </div>
            <div className="text-2xl font-bold text-[#168653] mt-1 font-headline">
              {completedList.length}
            </div>
            <p className="text-[11px] text-[#168653] mt-0.5 font-medium">Successfully logged</p>
          </button>
        </div>

        {/* SEARCH AND TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-3.5 bg-[#FFFFFF] border-b border-[#E5E8ED] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by reminder notes or customer name..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B] transition-colors"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            </div>

            <span className="text-xs font-mono font-medium text-[#718096]">
              Showing {filtered.length} tasks in {activeTab.toLowerCase()} view
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E5E8ED] text-[10px] uppercase tracking-wider text-[#718096] bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Scheduled Date & Time</th>
                  <th className="px-4 py-3 font-semibold">Associated Customer / Lead</th>
                  <th className="px-4 py-3 font-semibold">Reminder Notes</th>
                  <th className="px-4 py-3 font-semibold">Assigned Consultant</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      <div className="w-5 h-5 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
                      Loading follow-up schedule...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#718096]">
                      No follow-up reminders found in this category.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const lead = leads.find((l) => l.id === item.leadId);
                    const assignedUser = allUsers.find((u) => u.id === item.assignedUserId);
                    const isOverdue = new Date(item.scheduledAt).getTime() < startOfToday && item.status !== 'COMPLETED';

                    return (
                      <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                          <div className={`font-bold ${isOverdue ? 'text-[#D54747]' : 'text-[#153650]'}`}>
                            {new Date(item.scheduledAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <span className="text-[10px] text-[#718096]">
                            {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {lead ? (
                            <div>
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="font-bold text-[#153650] hover:text-[#24689B] block"
                              >
                                {lead.customer?.fullName || 'Traveler'}
                              </Link>
                              <span className="text-[10px] text-[#718096] font-mono">
                                {lead.referenceId} • {lead.customer?.phone}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#A0AEC0] italic">General Reminder</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-medium text-[#2D3748] max-w-sm">
                          {item.reminderNote}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#4A5568]">
                          {assignedUser ? (
                            <span className="font-semibold text-[#153650]">{assignedUser.fullName}</span>
                          ) : (
                            <span className="text-[#A0AEC0] italic">Unassigned</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={item.status} size="sm" />
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {item.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleComplete(item.id)}
                                disabled={completingId === item.id}
                                className="px-2.5 py-1 text-xs font-bold bg-[#168653] hover:bg-[#15803D] text-[#FFFFFF] rounded-none transition-colors"
                              >
                                {completingId === item.id ? 'Saving...' : 'Mark Done'}
                              </button>
                            )}
                            {lead && (
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="px-2.5 py-1 text-xs font-bold text-[#24689B] hover:text-[#153650] hover:bg-[#F4F6F9] border border-[#E5E8ED]"
                              >
                                Lead →
                              </Link>
                            )}
                          </div>
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

