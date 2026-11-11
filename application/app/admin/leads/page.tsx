'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLeadsAction, updateLeadStageAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import { PipelineStageCode } from '@/lib/auth/types';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
import {
  LayoutGrid,
  List,
  RotateCw,
  Search,
  Filter,
  Users,
  Compass,
  Plane,
  Stamp,
  Shield,
  Phone,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  Building2,
  Calendar,
  X,
} from 'lucide-react';

const STAGES: { code: PipelineStageCode; label: string; dotColor: string }[] = [
  { code: 'REQUESTS', label: 'Fresh Requests', dotColor: '#24689B' },
  { code: 'GENERAL', label: 'General Discussions', dotColor: '#718096' },
  { code: 'PRIORITY', label: 'Priority / High Intent', dotColor: '#C58A27' },
  { code: 'CONVERTED', label: 'Converted to Booking', dotColor: '#168653' },
  { code: 'CLOSED', label: 'Closed / Lost', dotColor: '#D54747' },
];

function AdminLeadsContent() {
  const searchParams = useSearchParams();
  const { allUsers, currentUser } = useCrm();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeadsAction({
        search,
        serviceType: serviceFilter,
        stage: stageFilter,
        priority: priorityFilter,
        assignedUserId: assigneeFilter,
      });
      setLeads(data || []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [serviceFilter, stageFilter, priorityFilter, assigneeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads();
  };

  const handleStageChange = async (leadId: string, newStage: PipelineStageCode) => {
    await updateLeadStageAction(leadId, newStage, currentUser.id);
    await loadLeads();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <Breadcrumbs items={[{ label: 'Customers & CRM', href: '/admin/customers' }, { label: 'Lead Pipeline' }]} />
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#24689B] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Commercial Pipeline
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Customer Pipeline & Travel Enquiries
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Complete oversight of inbound inquiries, customer qualification, itinerary quotations, and desk routing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* View Switcher Button */}
            <button
              onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              {viewMode === 'kanban' ? <List size={14} className="text-[#24689B]" /> : <LayoutGrid size={14} className="text-[#24689B]" />}
              <span>{viewMode === 'kanban' ? 'Switch to Table View' : 'Switch to Kanban Board'}</span>
            </button>

            <button
              onClick={loadLeads}
              className="p-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-[#718096] hover:text-[#153650] rounded-none transition-colors shadow-xs"
              title="Refresh Pipeline"
            >
              <RotateCw size={14} className={loading ? 'animate-spin text-[#24689B]' : ''} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Sharp 0–2px Geometry) */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-3.5 flex flex-wrap items-center gap-3 shadow-xs">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by customer name, phone, email, or reference ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B] font-medium"
            />
            <Search size={14} className="text-[#718096] absolute left-3 top-2.5" />
          </form>

          {/* Service Dropdown */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#153650] font-semibold py-1.5 px-3 rounded-none focus:outline-none focus:border-[#24689B] cursor-pointer"
          >
            <option value="ALL">All Services</option>
            <option value="PACKAGE">Tour Packages</option>
            <option value="FLIGHT">Flight Consultations</option>
            <option value="VISA">Visa Assistance</option>
            <option value="TRAVEL_INSURANCE">Travel Insurance</option>
            <option value="HOTEL">Hotels</option>
          </select>

          {/* Stage Dropdown */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#153650] font-semibold py-1.5 px-3 rounded-none focus:outline-none focus:border-[#24689B] cursor-pointer"
          >
            <option value="ALL">All Pipeline Stages</option>
            {STAGES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#153650] font-semibold py-1.5 px-3 rounded-none focus:outline-none focus:border-[#24689B] cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Intent</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Staff Assignee Dropdown */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#153650] font-semibold py-1.5 px-3 rounded-none focus:outline-none focus:border-[#24689B] cursor-pointer"
          >
            <option value="ALL">All Staff Members</option>
            <option value="UNASSIGNED">Unassigned Leads</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.role.replace('_', ' ')})
              </option>
            ))}
          </select>

          {(search || serviceFilter !== 'ALL' || stageFilter !== 'ALL' || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setServiceFilter('ALL');
                setStageFilter('ALL');
                setPriorityFilter('ALL');
                setAssigneeFilter('ALL');
              }}
              className="text-xs font-bold text-[#D54747] hover:underline px-2 py-1 flex items-center gap-1"
            >
              <X size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* View Mode: Kanban vs Table */}
        {loading ? (
          <div className="py-24 text-center text-[#718096] bg-[#FFFFFF] border border-[#E5E8ED] rounded-none">
            <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold tracking-wide uppercase font-mono">
              Loading pipeline enquiries...
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* =========================================================================
              TABLE VIEW (SHARP 0-2PX GEOMETRY, CLEAN LIGHT THEME)
             ========================================================================= */
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                  <tr>
                    <th className="px-4 py-3">Reference ID</th>
                    <th className="px-4 py-3">Customer Profile</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Details / Route</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Assigned Staff</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#718096]">
                        No enquiries matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#153650]">
                          <Link href={`/admin/leads/${lead.id}`} className="hover:text-[#24689B] transition-colors">
                            {lead.referenceId}
                          </Link>
                          <span className="block text-[10px] text-[#718096] font-sans font-normal mt-0.5">
                            {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-[#153650]">{lead.customer?.fullName || 'Valued Traveler'}</div>
                          <div className="text-[11px] text-[#718096] font-mono mt-0.5">
                            {lead.customer?.phoneCountryCode} {lead.customer?.phoneNumber}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#153650] border border-[#CBD5E1]">
                            {lead.serviceType}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 max-w-xs truncate text-[#718096] font-medium">
                          {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                            <span className="truncate block font-semibold text-[#153650]">
                              {lead.packageDetail.packageName} ({lead.packageDetail.duration || '6N/7D'})
                            </span>
                          )}
                          {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                            <span className="truncate block flex items-center gap-1.5">
                              <span>{lead.flightDetail.originAirport.split('-')[0]} ✈ {lead.flightDetail.destinationAirport.split('-')[0]}</span>
                              {lead.flightDetail.mealPreferenceCode && lead.flightDetail.mealPreferenceCode !== 'NO_PREFERENCE' && (
                                <span className="px-1.5 py-0.2 bg-[#FFFBEB] text-[#C58A27] border border-[#FCE8C3] rounded-none text-[9px] font-bold">
                                  {lead.flightDetail.mealPreferenceCode}
                                </span>
                              )}
                              {lead.flightDetail.wheelchairAssistanceCode && lead.flightDetail.wheelchairAssistanceCode !== 'NO_ASSISTANCE' && (
                                <span className="px-1.5 py-0.2 bg-[#FEF2F2] text-[#D54747] border border-[#FCDAD7] rounded-none text-[9px] font-bold">
                                  ♿ {lead.flightDetail.wheelchairAssistanceCode}
                                </span>
                              )}
                            </span>
                          )}
                          {lead.serviceType === 'VISA' && lead.visaDetail && (
                            <span className="truncate block flex items-center gap-1.5">
                              <span>{lead.visaDetail.destinationCountry} Visa ({lead.visaDetail.visaCategory})</span>
                              {lead.visaDetail.visaType && (
                                <span className="px-1.5 py-0.2 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-none text-[9px] font-bold">
                                  {lead.visaDetail.visaType}
                                </span>
                              )}
                            </span>
                          )}
                          {lead.serviceType === 'TRAVEL_INSURANCE' && (
                            <span className="truncate block flex items-center gap-1.5">
                              <span>🛡️ {lead.insuranceDetail?.destinationCountry || 'Global'} Insurance</span>
                              {lead.insuranceDetail?.hasPreExistingDisease && (
                                <span className="px-1.5 py-0.2 bg-[#FFFBEB] text-[#C58A27] border border-[#FCE8C3] rounded-none text-[9px] font-bold">
                                  PED
                                </span>
                              )}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${
                              lead.priorityLevel === 'URGENT'
                                ? 'text-[#D54747] bg-[#FEF2F2] border border-[#FCDAD7]'
                                : lead.priorityLevel === 'HIGH'
                                ? 'text-[#C58A27] bg-[#FFFBEB] border border-[#FCE8C3]'
                                : 'text-[#718096] bg-[#F1F5F9] border border-[#E2E8F0]'
                            }`}
                          >
                            {lead.priorityLevel}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStageCode)}
                            className="text-xs bg-[#F8FAFC] text-[#153650] font-semibold rounded-none px-2 py-1 border border-[#E5E8ED] focus:outline-none focus:border-[#24689B] cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-[#718096] font-medium">
                          {lead.assigneeName || 'Unassigned'}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="text-xs font-bold text-[#24689B] hover:text-[#153650] hover:underline"
                          >
                            Review Dossier →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* =========================================================================
              KANBAN VIEW (SHARP 0-2PX GEOMETRY, CLEAN LIGHT THEME)
             ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {STAGES.map((col) => {
              const colLeads = leads.filter((l) => l.stage === col.code);

              return (
                <div
                  key={col.code}
                  className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F8FAFC]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-none shrink-0" style={{ backgroundColor: col.dotColor }} />
                      <h3 className="font-bold text-xs text-[#153650] uppercase tracking-wider font-mono truncate">
                        {col.label}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#153650] bg-[#FFFFFF] px-2 py-0.5 border border-[#E5E8ED] rounded-none">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards Scroll Area */}
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[720px] crm-scrollbar">
                    {colLeads.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#718096] border border-dashed border-[#E5E8ED] p-4 rounded-none">
                        No enquiries in this stage
                      </div>
                    ) : (
                      colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-[#FFFFFF] border border-[#E5E8ED] hover:border-[#24689B] rounded-none p-3.5 space-y-2.5 transition-all shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-none bg-[#F1F5F9] text-[#153650] border border-[#CBD5E1]">
                              {lead.serviceType}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-none ${
                                lead.priorityLevel === 'URGENT'
                                  ? 'text-[#D54747] bg-[#FEF2F2] border border-[#FCDAD7]'
                                  : lead.priorityLevel === 'HIGH'
                                  ? 'text-[#C58A27] bg-[#FFFBEB] border border-[#FCE8C3]'
                                  : 'text-[#718096] bg-[#F1F5F9] border border-[#E2E8F0]'
                              }`}
                            >
                              {lead.priorityLevel}
                            </span>
                          </div>

                          <div>
                            <Link
                              href={`/admin/leads/${lead.id}`}
                              className="font-bold text-xs text-[#153650] hover:text-[#24689B] block leading-tight truncate"
                            >
                              {lead.customer?.fullName || 'Valued Traveler'}
                            </Link>
                            <span className="text-[10px] text-[#718096] font-mono mt-0.5 block">
                              {lead.referenceId}
                            </span>
                          </div>

                          {/* Service Details Snippet */}
                          <div className="p-2 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none text-[11px] text-[#172B45] space-y-1">
                            {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                              <div className="font-semibold truncate text-[#153650]">
                                {lead.packageDetail.packageName}
                              </div>
                            )}
                            {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                              <div className="font-medium truncate flex items-center justify-between">
                                <span>{lead.flightDetail.originAirport.split('-')[0]} ✈ {lead.flightDetail.destinationAirport.split('-')[0]}</span>
                                {lead.flightDetail.mealPreferenceCode && lead.flightDetail.mealPreferenceCode !== 'NO_PREFERENCE' && (
                                  <span className="text-[9px] font-bold text-[#C58A27]">
                                    {lead.flightDetail.mealPreferenceCode}
                                  </span>
                                )}
                              </div>
                            )}
                            {lead.serviceType === 'VISA' && lead.visaDetail && (
                              <div className="font-medium truncate flex items-center justify-between">
                                <span>{lead.visaDetail.destinationCountry}</span>
                                {lead.visaDetail.visaType && (
                                  <span className="text-[9px] font-bold text-[#24689B]">
                                    {lead.visaDetail.visaType}
                                  </span>
                                )}
                              </div>
                            )}
                            {lead.serviceType === 'TRAVEL_INSURANCE' && lead.insuranceDetail && (
                              <div className="font-medium truncate flex items-center justify-between">
                                <span>{lead.insuranceDetail.destinationCountry} Insurance</span>
                                {lead.insuranceDetail.hasPreExistingDisease && (
                                  <span className="text-[9px] font-bold text-[#C58A27]">
                                    PED
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Card Footer: Assignee & Move Action */}
                          <div className="pt-2 border-t border-[#E5E8ED] flex items-center justify-between text-[11px]">
                            <span className="text-[#718096] truncate max-w-[100px]">
                              {lead.assigneeName ? lead.assigneeName.split(' ')[0] : 'Unassigned'}
                            </span>

                            <select
                              value={lead.stage}
                              onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStageCode)}
                              className="text-[10px] bg-[#FFFFFF] text-[#153650] font-bold rounded-none px-1.5 py-0.5 border border-[#CBD5E1] focus:outline-none cursor-pointer"
                            >
                              {STAGES.map((s) => (
                                <option key={s.code} value={s.code}>
                                  Move: {s.label.split(' ')[0]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-[#718096] bg-[#FFFFFF] border border-[#E5E8ED] rounded-none m-6">
          <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold tracking-wide uppercase font-mono">
            Loading pipeline...
          </p>
        </div>
      }
    >
      <AdminLeadsContent />
    </Suspense>
  );
}

