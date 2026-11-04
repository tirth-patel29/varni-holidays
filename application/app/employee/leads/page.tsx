'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import PipelineKanban from '@/components/crm/PipelineKanban';
import LeadTableView from '@/components/crm/LeadTableView';
import { getLeadsAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';

export default function LeadsPage() {
  const { allUsers } = useCrm();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');

  const loadLeads = async () => {
    setLoading(true);
    const data = await getLeadsAction({
      search,
      serviceType: serviceFilter,
      stage: stageFilter,
      priority: priorityFilter,
      assignedUserId: assigneeFilter,
    });
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, [serviceFilter, stageFilter, priorityFilter, assigneeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FBF9F5]">
      <CrmHeader
        title="Customer Pipeline & Enquiries"
        subtitle="Manage fresh website requests, triage passenger requirements, and convert quotations."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E3DCCB] text-xs font-bold text-[#153650] hover:bg-[#F5F2EB] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">
                {viewMode === 'kanban' ? 'table_rows' : 'view_kanban'}
              </span>
              <span>{viewMode === 'kanban' ? 'Table View' : 'Kanban Board'}</span>
            </button>
            <button
              onClick={loadLeads}
              className="p-2 rounded-xl bg-white border border-[#E3DCCB] text-[#153650] hover:bg-[#F5F2EB] transition-colors shadow-sm flex items-center justify-center"
              title="Refresh Pipeline"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 flex flex-wrap items-center gap-3 border border-slate-200 shadow-xs">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, email, or ref (FLT/PKG/VIS)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white"
            />
            <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5">
              search
            </span>
          </form>

          {/* Service Dropdown */}
          <div className="w-40">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Services</option>
              <option value="PACKAGE">Tour Packages</option>
              <option value="FLIGHT">Flights</option>
              <option value="VISA">Visa Assistance</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="w-36">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Assignee Dropdown */}
          <div className="w-44">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Specialists</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pipeline Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-[#153650]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-2xl text-[#C29033]">progress_activity</span>
              <span className="font-bold text-sm">Loading Pipeline Enquiries...</span>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          <PipelineKanban leads={leads} onRefresh={loadLeads} />
        ) : (
          <LeadTableView leads={leads} onRefresh={loadLeads} />
        )}
      </main>
    </div>
  );
}
