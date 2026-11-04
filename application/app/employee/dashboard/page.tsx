'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
import { getDashboardMetricsAction, getLeadsAction, getFollowUpsAction, completeFollowUpAction } from '@/app/actions/crm';
import { getGoogleSheetsStatusAction } from '@/app/actions/google-sheets';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Inbox,
  Flame,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Phone,
  Table,
  UserCheck,
  Compass,
  Plane,
  Stamp,
  ExternalLink,
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const { currentUser, isSuperAdmin } = useCrm();
  const [metrics, setMetrics] = useState<any>(null);
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [sheetsStatus, setSheetsStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [metricsData, allLeads, allFollowUps, sheets] = await Promise.all([
      getDashboardMetricsAction(),
      getLeadsAction(),
      getFollowUpsAction(),
      getGoogleSheetsStatusAction(),
    ]);

    setMetrics(metricsData);
    setSheetsStatus(sheets);

    // If super admin, show all active leads; if specialist, prioritize assigned leads
    const assigned = allLeads?.filter((l: any) =>
      isSuperAdmin ? !l.isDeleted : l.assignedUserId === currentUser.id && !l.isDeleted
    ) || [];
    setMyLeads(assigned);

    setFollowUps(allFollowUps || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const handleCompleteFollowUp = async (id: string) => {
    await completeFollowUpAction(id);
    loadData();
  };

  // Determine urgency
  const urgentLead = myLeads.find((l) => l.priorityLevel === 'URGENT' || l.stage === 'REQUESTS') || myLeads[0];
  const pendingFollowUpsList = followUps.filter((f) => f.status === 'PENDING');
  const overdueFollowUpsCount = pendingFollowUpsList.filter((f) => new Date(f.dueAt) < new Date()).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Employee Workspace"
        subtitle={`Welcome, ${currentUser.fullName} (${currentUser.role.replace('_', ' ')}). Anand Desk.`}
        actions={
          <div className="flex items-center gap-2">
            {sheetsStatus?.config?.spreadsheetUrl && (
              <a
                href={sheetsStatus.config.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                title="Open Live Business Sheet"
              >
                <Table size={14} className="text-[#55B98A]" />
                <span className="hidden sm:inline">Business Sheet</span>
              </a>
            )}
            <Link
              href="/employee/leads"
              className="px-3 py-1.5 rounded-md bg-[#1D2025] hover:bg-[#2A2E34] text-[#E9B95E] border border-[#2A2E34] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Pipeline Kanban</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl">
        {loading || !metrics ? (
          <div className="py-24 text-center text-[#969CA5]">
            <div className="w-6 h-6 border-2 border-[#E9B95E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium tracking-wide">Loading workspace desk...</p>
          </div>
        ) : (
          <>
            {/* Top Workspace Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Assigned Leads */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Assigned</span>
                  <UserCheck size={14} className="text-[#666E79]" />
                </div>
                <div className="text-2xl font-semibold text-[#F4F4F2] mt-1 tabular-nums">
                  {myLeads.length}
                </div>
                <div className="text-[10px] text-[#666E79] mt-1 truncate">
                  Active in your queue
                </div>
              </div>

              {/* New Requests */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>New Requests</span>
                  <Inbox size={14} className="text-[#6FA9D8]" />
                </div>
                <div className="text-2xl font-semibold text-[#F4F4F2] mt-1 tabular-nums">
                  {metrics.requestsCount}
                </div>
                <div className="text-[10px] text-[#6FA9D8] mt-1 truncate">
                  Need first response
                </div>
              </div>

              {/* Priority Leads */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Priority Leads</span>
                  <Flame size={14} className="text-[#E9B95E]" />
                </div>
                <div className="text-2xl font-semibold text-[#E9B95E] mt-1 tabular-nums">
                  {metrics.priorityCount}
                </div>
                <div className="text-[10px] text-[#666E79] mt-1 truncate">
                  High travel readiness
                </div>
              </div>

              {/* Today's Follow-ups */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Follow-ups</span>
                  <Calendar size={14} className="text-[#969CA5]" />
                </div>
                <div className="text-2xl font-semibold text-[#F4F4F2] mt-1 tabular-nums">
                  {pendingFollowUpsList.length}
                </div>
                <div className="text-[10px] text-[#666E79] mt-1 truncate">
                  Tasks pending
                </div>
              </div>

              {/* Overdue Follow-ups */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Overdue</span>
                  <AlertTriangle size={14} className={overdueFollowUpsCount > 0 ? 'text-[#DF7373]' : 'text-[#666E79]'} />
                </div>
                <div
                  className={`text-2xl font-semibold mt-1 tabular-nums ${
                    overdueFollowUpsCount > 0 ? 'text-[#DF7373]' : 'text-[#F4F4F2]'
                  }`}
                >
                  {overdueFollowUpsCount}
                </div>
                <div
                  className={`text-[10px] mt-1 truncate ${
                    overdueFollowUpsCount > 0 ? 'text-[#DF7373]' : 'text-[#666E79]'
                  }`}
                >
                  {overdueFollowUpsCount > 0 ? 'Action required' : 'Zero backlog'}
                </div>
              </div>

              {/* My Conversion Rate */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-3.5">
                <div className="flex items-center justify-between text-[#969CA5] text-[11px] font-medium">
                  <span>Conversion</span>
                  <TrendingUp size={14} className="text-[#55B98A]" />
                </div>
                <div className="text-2xl font-semibold text-[#55B98A] mt-1 tabular-nums">
                  {metrics.conversionRate}%
                </div>
                <div className="text-[10px] text-[#55B98A] mt-1 truncate">
                  {metrics.convertedCount} won bookings
                </div>
              </div>
            </div>

            {/* Action Banner: Customer Needs Attention Next */}
            {urgentLead && (
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#E9B95E]/10 border border-[#E9B95E]/20 text-[#E9B95E] flex items-center justify-center shrink-0 mt-0.5">
                    <Flame size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F4F4F2]">
                        Customer Needs Immediate Attention
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E9B95E]/10 text-[#E9B95E] border border-[#E9B95E]/20 font-medium">
                        {urgentLead.priorityLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#969CA5] mt-1">
                      <span className="text-[#F4F4F2] font-medium">{urgentLead.customer?.fullName}</span> • Ref:{' '}
                      <span className="font-mono">{urgentLead.referenceId}</span> ({urgentLead.serviceType}) —{' '}
                      {urgentLead.serviceType === 'PACKAGE' && (urgentLead.packageDetail?.packageName || 'Kerala 6N/7D')}
                      {urgentLead.serviceType === 'FLIGHT' && 'Direct Flight Consultation'}
                      {urgentLead.serviceType === 'VISA' && 'Tourist Visa Assistance'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    href={`/employee/leads/${urgentLead.id}`}
                    className="px-3 py-1.5 rounded-md bg-[#1D2025] hover:bg-[#2A2E34] text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium transition-colors"
                  >
                    Open Lead
                  </Link>
                  <Link
                    href={`/employee/customers/${urgentLead.customerId}`}
                    className="px-3 py-1.5 rounded-md bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] text-xs font-semibold transition-colors"
                  >
                    Contact Customer
                  </Link>
                </div>
              </div>
            )}

            {/* Split Section: My Assigned Leads & Follow-ups Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* My Queue (2 Columns) */}
              <div className="lg:col-span-2 bg-[#17191D] border border-[#2A2E34] rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#F4F4F2]">My Assigned Active Leads</h2>
                    <p className="text-xs text-[#969CA5]">Inbound passenger requirements in your operational queue</p>
                  </div>
                  <Link
                    href="/employee/leads"
                    className="text-xs text-[#E9B95E] hover:underline inline-flex items-center gap-1"
                  >
                    Kanban View <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#2A2E34] text-[11px] uppercase tracking-wider text-[#666E79]">
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Stage</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2329]">
                      {myLeads.slice(0, 5).map((lead) => (
                        <tr key={lead.id} className="hover:bg-[#1D2025]/50 transition-colors">
                          <td className="py-3 px-3">
                            <Link
                              href={`/employee/leads/${lead.id}`}
                              className="font-medium text-[#F4F4F2] hover:text-[#E9B95E] transition-colors block"
                            >
                              {lead.customer?.fullName}
                            </Link>
                            <span className="text-[10px] text-[#666E79] font-mono">{lead.referenceId}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#1D2025] text-[#969CA5] border border-[#2A2E34]">
                              {lead.serviceType}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                lead.priorityLevel === 'URGENT'
                                  ? 'text-[#DF7373] bg-[#DF7373]/10 border border-[#DF7373]/20'
                                  : lead.priorityLevel === 'HIGH'
                                  ? 'text-[#E8B65E] bg-[#E8B65E]/10 border border-[#E8B65E]/20'
                                  : 'text-[#969CA5] bg-[#1D2025]'
                              }`}
                            >
                              {lead.priorityLevel}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#1D2025] text-[#F4F4F2] border border-[#2A2E34]">
                              {lead.stage}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/employee/leads/${lead.id}`}
                              className="text-[#E9B95E] hover:underline text-xs"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scheduled Follow-ups (1 Column) */}
              <div className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[#F4F4F2]">Follow-up Tasks</h2>
                      <p className="text-xs text-[#969CA5]">Scheduled phone calls & reminders</p>
                    </div>
                    <Link
                      href="/employee/follow-ups"
                      className="text-xs text-[#E9B95E] hover:underline"
                    >
                      All Tasks
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {pendingFollowUpsList.slice(0, 4).map((f) => {
                      const isOverdue = new Date(f.dueAt) < new Date();
                      return (
                        <div
                          key={f.id}
                          className="p-3 rounded-md bg-[#1D2025] border border-[#2A2E34] flex items-start justify-between gap-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#F4F4F2] truncate">{f.customerName}</p>
                            <p className="text-[11px] text-[#969CA5] line-clamp-1 mt-0.5">{f.notes}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={`text-[10px] font-mono font-medium ${
                                  isOverdue ? 'text-[#DF7373]' : 'text-[#969CA5]'
                                }`}
                              >
                                Due: {new Date(f.dueAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOverdue && (
                                <span className="text-[9px] px-1 rounded bg-[#DF7373]/10 text-[#DF7373]">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCompleteFollowUp(f.id)}
                            title="Mark completed"
                            className="p-1 rounded bg-[#17191D] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#55B98A] border border-[#2A2E34] transition-colors shrink-0"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                    {pendingFollowUpsList.length === 0 && (
                      <p className="text-xs text-[#666E79] py-6 text-center">
                        All follow-ups completed for today.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2A2E34] text-[11px] text-[#666E79] flex items-center justify-between">
                  <span>Anand Desk Staff</span>
                  <span className="text-[#55B98A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#55B98A]" />
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Summary Section */}
            <div id="performance" className="bg-[#17191D] border border-[#2A2E34] rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#F4F4F2]">My Performance & Productivity</h2>
                  <p className="text-xs text-[#969CA5]">Service milestones achieved during current operating cycle</p>
                </div>
                <span className="text-xs text-[#666E79] font-mono">Cycle: Nov 2026</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-md bg-[#1D2025] border border-[#2A2E34]">
                  <span className="text-[11px] text-[#969CA5] block">Response Speed</span>
                  <span className="text-lg font-semibold text-[#F4F4F2] mt-0.5 block tabular-nums">
                    &lt; 15 mins
                  </span>
                  <span className="text-[10px] text-[#55B98A]">Standard: &lt; 30 mins</span>
                </div>

                <div className="p-3.5 rounded-md bg-[#1D2025] border border-[#2A2E34]">
                  <span className="text-[11px] text-[#969CA5] block">Conversion Efficiency</span>
                  <span className="text-lg font-semibold text-[#E9B95E] mt-0.5 block tabular-nums">
                    {metrics.conversionRate}%
                  </span>
                  <span className="text-[10px] text-[#969CA5]">Above branch benchmark</span>
                </div>

                <div className="p-3.5 rounded-md bg-[#1D2025] border border-[#2A2E34]">
                  <span className="text-[11px] text-[#969CA5] block">Completed Follow-ups</span>
                  <span className="text-lg font-semibold text-[#55B98A] mt-0.5 block tabular-nums">
                    {followUps.filter((f) => f.status === 'COMPLETED').length} Tasks
                  </span>
                  <span className="text-[10px] text-[#55B98A]">100% resolution</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
