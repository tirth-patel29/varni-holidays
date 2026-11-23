'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getUnifiedLeadsAction,
  updateLeadStageAction,
  assignLeadAction,
  convertLeadToBookingAction,
} from '@/app/actions/crm-unified';
import { useCrm } from '@/components/crm/CrmContext';
import { PipelineStage, PriorityLevel } from '@prisma/client';
import PageHeader from '@/components/admin/PageHeader';
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
  Plus,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Tag,
  DollarSign,
  TrendingUp,
  UserCheck,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

const PIPELINE_STAGES: {
  code: string;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  { code: 'NEW', label: '1. New Enquiries', dotColor: '#24689B', badgeBg: 'bg-sky-50', badgeText: 'text-sky-800' },
  { code: 'CONTACTED', label: '2. Contacted', dotColor: '#718096', badgeBg: 'bg-slate-100', badgeText: 'text-slate-800' },
  { code: 'QUOTED', label: '3. Quoted', dotColor: '#C58A27', badgeBg: 'bg-amber-50', badgeText: 'text-amber-800' },
  { code: 'NEGOTIATION', label: '4. Negotiation', dotColor: '#805AD5', badgeBg: 'bg-purple-50', badgeText: 'text-purple-800' },
  { code: 'WON', label: '5. Won / Converted', dotColor: '#168653', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-800' },
  { code: 'LOST', label: '6. Lost / Closed', dotColor: '#D54747', badgeBg: 'bg-rose-50', badgeText: 'text-rose-800' },
];

const SOURCES = [
  'ALL',
  'WEBSITE',
  'WHATSAPP',
  'INSTAGRAM',
  'FACEBOOK',
  'GOOGLE',
  'REFERRAL',
  'WALK_IN',
  'TELEPHONE',
  'OTHER',
];

const LOSS_REASONS = [
  'Price too high',
  'Customer booked elsewhere',
  'No response',
  'Travel cancelled',
  'Schedule unavailable',
  'Payment issue',
  'Other',
];

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Pipeline...</div>}>
      <AdminLeadsContent />
    </Suspense>
  );
}

function AdminLeadsContent() {
  const searchParams = useSearchParams();
  const { allUsers, currentUser } = useCrm();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || 'ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Drag-and-drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Modals
  const [lossModalLead, setLossModalLead] = useState<any | null>(null);
  const [selectedLossReason, setSelectedLossReason] = useState('Price too high');
  const [lossRemarks, setLossRemarks] = useState('');

  const [wonModalLead, setWonModalLead] = useState<any | null>(null);
  const [wonForm, setWonForm] = useState({
    serviceType: 'FLIGHT',
    travelDestination: '',
    totalAmountInr: '',
    travelDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    passengerCount: '1',
    remarks: '',
  });
  const [wonConverting, setWonConverting] = useState(false);
  const [wonError, setWonError] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await getUnifiedLeadsAction({
        search,
        stage: stageFilter,
        source: sourceFilter,
        priority: priorityFilter,
        serviceType: serviceFilter,
        assignedUserId: assigneeFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (res.success && res.data) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [stageFilter, sourceFilter, priorityFilter, serviceFilter, assigneeFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads();
  };

  // Stage transition handler with validation
  const triggerStageTransition = async (lead: any, targetStage: string) => {
    if (targetStage === 'LOST') {
      setLossModalLead(lead);
      setSelectedLossReason('Price too high');
      setLossRemarks('');
      return;
    }

    if (targetStage === 'WON') {
      setWonModalLead(lead);
      setWonForm({
        serviceType: lead.serviceType || 'FLIGHT',
        travelDestination: lead.destination || lead.origin || 'Custom Holiday',
        totalAmountInr: lead.expectedValueInr ? String(lead.expectedValueInr) : lead.estimatedBudgetInr ? String(lead.estimatedBudgetInr) : '25000',
        travelDate: lead.travelStartDate ? new Date(lead.travelStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        returnDate: lead.travelEndDate ? new Date(lead.travelEndDate).toISOString().split('T')[0] : '',
        passengerCount: String(lead.passengerCount || 1),
        remarks: `Converted from Lead ${lead.referenceId}`,
      });
      setWonError(null);
      return;
    }

    await updateLeadStageAction(lead.id, targetStage as any);
    await loadLeads();
  };

  const handleConfirmLost = async () => {
    if (!lossModalLead) return;
    await updateLeadStageAction(
      lossModalLead.id,
      'LOST',
      selectedLossReason,
      lossRemarks
    );
    setLossModalLead(null);
    await loadLeads();
  };

  const handleConfirmWonBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wonModalLead) return;
    setWonConverting(true);
    setWonError(null);
    try {
      const res = await convertLeadToBookingAction(wonModalLead.id, {
        serviceType: wonForm.serviceType,
        travelDestination: wonForm.travelDestination,
        totalAmountInr: parseFloat(wonForm.totalAmountInr) || 0,
        travelDate: wonForm.travelDate,
        returnDate: wonForm.returnDate || undefined,
        passengerCount: parseInt(wonForm.passengerCount) || 1,
        remarks: wonForm.remarks,
      });

      if (res.success) {
        setWonModalLead(null);
        await loadLeads();
      } else {
        setWonError(res.error || 'Conversion failed');
      }
    } catch (err: any) {
      setWonError(err.message || 'Error converting lead to booking');
    } finally {
      setWonConverting(false);
    }
  };

  const handleAssigneeChange = async (leadId: string, newUserId: string) => {
    await assignLeadAction(leadId, newUserId === 'UNASSIGNED' ? null : newUserId);
    await loadLeads();
  };

  // Map lead stage to column
  const getStageColumn = (stage: string) => {
    if (['NEW', 'REQUESTS'].includes(stage)) return 'NEW';
    if (['CONTACTED', 'GENERAL'].includes(stage)) return 'CONTACTED';
    if (['QUOTED', 'PRIORITY'].includes(stage)) return 'QUOTED';
    if (stage === 'NEGOTIATION') return 'NEGOTIATION';
    if (['WON', 'CONVERTED'].includes(stage)) return 'WON';
    if (['LOST', 'CLOSED'].includes(stage)) return 'LOST';
    return 'NEW';
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      await triggerStageTransition(lead, targetStage);
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Commercial Lead Pipeline & Deals"
        subtitle="End-to-end sales pipeline tracking from New Enquiry to Won Bookings with stage governance, loss audits, and team assignments"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'Lead Pipeline' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/inbox"
              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare size={13} className="text-[#24689B]" />
              <span>Unified Inbox</span>
            </Link>

            <button
              onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              {viewMode === 'kanban' ? <List size={13} className="text-[#24689B]" /> : <LayoutGrid size={13} className="text-[#24689B]" />}
              <span>{viewMode === 'kanban' ? 'Table View' : 'Kanban Board'}</span>
            </button>

            <button
              onClick={loadLeads}
              className="p-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-[#718096] hover:text-[#153650] rounded-none transition-colors shadow-xs cursor-pointer"
              title="Refresh Pipeline"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : ''} />
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-4 max-w-7xl mx-auto w-full">
        {/* Filter Controls Bar */}
        <div className="bg-white border border-[#E5E8ED] p-3.5 flex flex-wrap items-center gap-3 shadow-xs">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, phone, route, reference..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-[#172B45] rounded-none focus:outline-none focus:bg-white focus:border-[#24689B]"
            />
            <Search size={13} className="text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-slate-700 font-semibold py-1.5 px-2.5 rounded-none focus:outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="NEW">1. New Enquiries</option>
            <option value="CONTACTED">2. Contacted</option>
            <option value="QUOTED">3. Quoted</option>
            <option value="NEGOTIATION">4. Negotiation</option>
            <option value="WON">5. Won</option>
            <option value="LOST">6. Lost</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-slate-700 font-semibold py-1.5 px-2.5 rounded-none focus:outline-none"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Sources' : s}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-slate-700 font-semibold py-1.5 px-2.5 rounded-none focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Employee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-slate-700 font-semibold py-1.5 px-2.5 rounded-none focus:outline-none"
          >
            <option value="ALL">All Team Members</option>
            <option value="UNASSIGNED">Unassigned</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>

          {/* Reset button */}
          {(search || stageFilter !== 'ALL' || sourceFilter !== 'ALL' || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStageFilter('ALL');
                setSourceFilter('ALL');
                setPriorityFilter('ALL');
                setAssigneeFilter('ALL');
              }}
              className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Kanban Board View */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
            {PIPELINE_STAGES.map((col) => {
              const colLeads = leads.filter((l) => getStageColumn(l.stage) === col.code);

              return (
                <div
                  key={col.code}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.code)}
                  className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none flex flex-col min-h-[550px] shadow-2xs"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#E5E8ED] bg-[#FAFBFD] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dotColor }} />
                      <span className="text-xs font-bold text-[#153650]">{col.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#718096] bg-[#E5E8ED]/60 px-1.5 py-0.5 rounded-xs">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[720px]">
                    {colLeads.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200">
                        Drop deals here
                      </div>
                    ) : (
                      colLeads.map((lead) => {
                        return (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            className="bg-white border border-[#E5E8ED] hover:border-[#24689B] p-3 rounded-none shadow-2xs transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
                          >
                            {/* Card Top: Ref & Priority */}
                            <div className="flex items-center justify-between gap-2">
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="text-[11px] font-mono font-bold text-[#24689B] hover:underline"
                              >
                                {lead.referenceId}
                              </Link>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider ${
                                  lead.priorityLevel === 'URGENT'
                                    ? 'bg-rose-100 text-rose-800'
                                    : lead.priorityLevel === 'HIGH'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {lead.priorityLevel}
                              </span>
                            </div>

                            {/* Customer info */}
                            <div>
                              <Link
                                href={`/admin/customers/${lead.customerId}`}
                                className="text-xs font-bold text-[#153650] hover:text-[#24689B] line-clamp-1"
                              >
                                {lead.customer?.fullName}
                              </Link>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone size={10} />
                                <span>{lead.customer?.phoneNumber}</span>
                              </div>
                            </div>

                            {/* Title / Route */}
                            {(lead.origin || lead.destination || lead.title) && (
                              <div className="text-[11px] text-slate-700 font-medium bg-slate-50 p-1.5 border border-slate-100 line-clamp-2">
                                {lead.title || `${lead.origin || ''} → ${lead.destination || ''}`}
                              </div>
                            )}

                            {/* Value / Budget */}
                            {(lead.expectedValueInr || lead.estimatedBudgetInr) && (
                              <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <span>₹{(lead.expectedValueInr || lead.estimatedBudgetInr).toLocaleString('en-IN')}</span>
                              </div>
                            )}

                            {/* Loss Reason display if lost */}
                            {col.code === 'LOST' && lead.lossReason && (
                              <div className="text-[10px] bg-rose-50 border border-rose-200 text-rose-800 p-1 rounded-xs">
                                <span className="font-bold">Loss: </span>
                                {lead.lossReason}
                              </div>
                            )}

                            {/* Card Footer: Assignee & Next Follow-Up */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                              <select
                                value={lead.assignedUserId || 'UNASSIGNED'}
                                onChange={(e) => handleAssigneeChange(lead.id, e.target.value)}
                                className="bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none cursor-pointer max-w-[120px] truncate"
                              >
                                <option value="UNASSIGNED">Unassigned</option>
                                {allUsers.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.fullName}
                                  </option>
                                ))}
                              </select>

                              {/* Stage Quick Actions Menu */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {col.code !== 'WON' && (
                                  <button
                                    onClick={() => triggerStageTransition(lead, 'WON')}
                                    className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xs cursor-pointer"
                                    title="Mark Won & Convert to Booking"
                                  >
                                    <Check size={11} />
                                  </button>
                                )}
                                {col.code !== 'LOST' && (
                                  <button
                                    onClick={() => triggerStageTransition(lead, 'LOST')}
                                    className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xs cursor-pointer"
                                    title="Mark Lost"
                                  >
                                    <X size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white border border-[#E5E8ED] overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFBFD] border-b border-[#E5E8ED] text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Service / Route</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Budget / Value</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Assigned To</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED]">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No leads matching selected criteria.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#24689B]">
                        <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                          {lead.referenceId}
                        </Link>
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/admin/customers/${lead.customerId}`}
                          className="font-bold text-[#153650] hover:text-[#24689B]"
                        >
                          {lead.customer?.fullName}
                        </Link>
                        <div className="text-[11px] text-slate-500 font-mono">{lead.customer?.phoneNumber}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-700">{lead.serviceType}</div>
                        <div className="text-[11px] text-slate-500">
                          {lead.origin && lead.destination ? `${lead.origin} → ${lead.destination}` : lead.title || 'General'}
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={lead.stage}
                          onChange={(e) => triggerStageTransition(lead, e.target.value)}
                          className="text-xs font-bold bg-slate-50 border border-slate-200 px-2 py-1 rounded-none cursor-pointer"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUOTED">QUOTED</option>
                          <option value="NEGOTIATION">NEGOTIATION</option>
                          <option value="WON">WON</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider ${
                            lead.priorityLevel === 'URGENT'
                              ? 'bg-rose-100 text-rose-800'
                              : lead.priorityLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {lead.priorityLevel}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-700">
                        {lead.expectedValueInr || lead.estimatedBudgetInr
                          ? `₹${(lead.expectedValueInr || lead.estimatedBudgetInr).toLocaleString('en-IN')}`
                          : '—'}
                      </td>
                      <td className="p-3 text-[11px] font-mono text-slate-500">{lead.source}</td>
                      <td className="p-3">
                        <select
                          value={lead.assignedUserId || 'UNASSIGNED'}
                          onChange={(e) => handleAssigneeChange(lead.id, e.target.value)}
                          className="text-xs bg-transparent border-0 focus:outline-none cursor-pointer"
                        >
                          <option value="UNASSIGNED">Unassigned</option>
                          {allUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.fullName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Loss Reason Modal */}
      {lossModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-rose-700 mb-2">Mark Lead as LOST ({lossModalLead.referenceId})</h3>
            <p className="text-xs text-slate-600 mb-4">
              Select the mandatory loss classification reason. This information feeds the sales loss analytics.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loss Reason *</label>
                <select
                  value={selectedLossReason}
                  onChange={(e) => setSelectedLossReason(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none font-semibold text-slate-800 focus:outline-none"
                >
                  {LOSS_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loss Remarks / Competitor Detail</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Quoted ₹45,000; customer found direct airline fare at ₹41,000..."
                  value={lossRemarks}
                  onChange={(e) => setLossRemarks(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setLossModalLead(null)}
                  className="px-4 py-1.5 border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLost}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Lead as Lost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert Won Lead to Booking Modal */}
      {wonModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-[#153650] mb-1">
              Convert Lead {wonModalLead.referenceId} to Confirmed Booking
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Client: <b>{wonModalLead.customer?.fullName}</b> ({wonModalLead.customer?.phoneNumber}). Converts deal to WON
              and generates a booking record without creating duplicate customer entries.
            </p>

            {wonError && (
              <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 text-xs text-rose-700">{wonError}</div>
            )}

            <form onSubmit={handleConfirmWonBooking} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={wonForm.serviceType}
                    onChange={(e) => setWonForm({ ...wonForm, serviceType: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none"
                  >
                    <option value="FLIGHT">Flight Booking</option>
                    <option value="PACKAGE">Tour Package</option>
                    <option value="VISA">Visa Application</option>
                    <option value="HOTEL">Hotel Reservation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination / Route *</label>
                  <input
                    type="text"
                    required
                    value={wonForm.travelDestination}
                    onChange={(e) => setWonForm({ ...wonForm, travelDestination: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Agreed Value (INR) *</label>
                  <input
                    type="number"
                    required
                    value={wonForm.totalAmountInr}
                    onChange={(e) => setWonForm({ ...wonForm, totalAmountInr: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Passenger Count</label>
                  <input
                    type="number"
                    value={wonForm.passengerCount}
                    onChange={(e) => setWonForm({ ...wonForm, passengerCount: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={wonForm.travelDate}
                    onChange={(e) => setWonForm({ ...wonForm, travelDate: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Return Date</label>
                  <input
                    type="date"
                    value={wonForm.returnDate}
                    onChange={(e) => setWonForm({ ...wonForm, returnDate: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Booking Notes / Terms</label>
                <textarea
                  rows={2}
                  value={wonForm.remarks}
                  onChange={(e) => setWonForm({ ...wonForm, remarks: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setWonModalLead(null)}
                  className="px-4 py-2 border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={wonConverting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {wonConverting ? 'Converting...' : 'Confirm Won & Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
