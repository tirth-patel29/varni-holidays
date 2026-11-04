'use client';
import React, { useState, useEffect } from 'react';
import { Suspense } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import PipelineKanban from '@/components/crm/PipelineKanban';
import LeadTableView from '@/components/crm/LeadTableView';
import { getLeadsAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import {
  LayoutGrid,
  List,
  RotateCw,
  Search,
  Filter,
} from 'lucide-react';
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
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('stage')) setStageFilter(sp.get('stage') as string);
    }
  }, []);
  const loadLeads = async () => {
    setLoading(true);
    const data = await getLeadsAction({
      search,
      serviceType: serviceFilter,
      stage: stageFilter,
      priority: priorityFilter,
      assignedUserId: assigneeFilter,
    });
    setLeads(data || []);
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Customer Pipeline & Enquiries"
        subtitle="Operational triage, qualification, and stage management across travel services."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2] transition-colors"
            >
              {viewMode === 'kanban' ? <List size={14} /> : <LayoutGrid size={14} />}
              <span>{viewMode === 'kanban' ? 'Table View' : 'Kanban Board'}</span>
            </button>
            <button
              onClick={loadLeads}
              className="p-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] border border-[#2A2E34] text-[#969CA5] hover:text-[#F4F4F2] transition-colors"
              title="Refresh Pipeline"
            >
              <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />
      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5">
        {/* Filter Controls Bar */}
        <div className="bg-[#17191D] rounded-lg p-3 flex flex-wrap items-center gap-3 border border-[#2A2E34]">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, email, or ref (FLT/PKG/VIS)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#2A2E34] bg-[#1D2025] text-xs text-[#F4F4F2] placeholder-[#666E79] focus:outline-none focus:border-[#E9B95E] transition-colors"
            />
            <Search size={14} className="text-[#666E79] absolute left-2.5 top-2.5" />
          </form>
          {/* Service Dropdown */}
          <div className="w-36">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-md border border-[#2A2E34] bg-[#1D2025] text-xs text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E] cursor-pointer"
            >
              <option value="ALL">All Services</option>
              <option value="PACKAGE">Tour Packages</option>
              <option value="FLIGHT">Flights</option>
              <option value="VISA">Visa Desk</option>
            </select>
          </div>
          {/* Stage Dropdown */}
          <div className="w-36">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-md border border-[#2A2E34] bg-[#1D2025] text-xs text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E] cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              <option value="REQUESTS">Fresh Requests</option>
              <option value="GENERAL">General</option>
              <option value="PRIORITY">Priority Intent</option>
              <option value="CONVERTED">Converted</option>
              <option value="CLOSED">Lost / Closed</option>
            </select>
          </div>
          {/* Priority Dropdown */}
          <div className="w-32">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-md border border-[#2A2E34] bg-[#1D2025] text-xs text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E] cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          {/* Specialist Assignee Dropdown */}
          <div className="w-40">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-md border border-[#2A2E34] bg-[#1D2025] text-xs text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E] cursor-pointer"
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
        {/* Content Area: Kanban Board or Table View */}
        {loading ? (
          <div className="py-24 text-center text-[#969CA5]">
            <div className="w-6 h-6 border-2 border-[#E9B95E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Filtering pipeline records...</p>
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
