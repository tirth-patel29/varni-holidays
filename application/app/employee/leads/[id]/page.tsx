'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CrmHeader from '@/components/crm/CrmHeader';
import { useCrm } from '@/components/crm/CrmContext';
import {
  getLeadByIdAction,
  updateLeadStageAction,
  assignLeadAction,
  updateLeadPriorityAction,
  logCallActivityAction,
  logEmailActivityAction,
  recordWhatsAppClickAction,
  addGeneralNoteAction,
  createFollowUpAction,
  getQuotationsAction,
  getLeadActivitiesAction,
} from '@/app/actions/crm';
import { PipelineStageCode, PriorityLevelCode } from '@/lib/auth/types';
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  FileText,
  Mail,
  Calendar,
  AlertTriangle,
  User,
  Compass,
  Plane,
  Stamp,
  ExternalLink,
  Clock,
  Send,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const { currentUser, allUsers } = useCrm();

  const [lead, setLead] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Activity Logger Form States
  const [activeTab, setActiveTab] = useState<'CALL' | 'NOTE' | 'EMAIL' | 'FOLLOWUP'>('CALL');
  const [callDuration, setCallDuration] = useState('300');
  const [callOutcome, setCallOutcome] = useState<'CONNECTED' | 'BUSY' | 'UNANSWERED' | 'CALLBACK_REQUESTED'>('CONNECTED');
  const [callNotes, setCallNotes] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getLeadByIdAction(leadId);
    if (!data) {
      router.push('/employee/leads');
      return;
    }
    setLead(data);
    const acts = await getLeadActivitiesAction(leadId);
    setActivities(acts || []);
    const quotes = await getQuotationsAction(leadId);
    setQuotations(quotes || []);
    setLoading(false);
  };

  useEffect(() => {
    if (leadId) loadData();
  }, [leadId]);

  const handleStageChange = async (newStage: PipelineStageCode) => {
    setActionLoading(true);
    await updateLeadStageAction(leadId, newStage, `Stage updated to ${newStage} from detail view`, currentUser.id);
    await loadData();
    setActionLoading(false);
  };

  const handleAssigneeChange = async (newUserId: string) => {
    setActionLoading(true);
    await assignLeadAction(leadId, newUserId, currentUser.id);
    await loadData();
    setActionLoading(false);
  };

  const handlePriorityChange = async (newPriority: PriorityLevelCode) => {
    setActionLoading(true);
    await updateLeadPriorityAction(leadId, newPriority, currentUser.id);
    await loadData();
    setActionLoading(false);
  };

  // Activity Submissions
  const submitCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await logCallActivityAction(leadId, parseInt(callDuration, 10), callOutcome, callNotes || 'Call completed.', currentUser.id);
    setCallNotes('');
    await loadData();
    setActionLoading(false);
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await logEmailActivityAction(leadId, emailSubject, emailBody, currentUser.id);
    setEmailSubject('');
    setEmailBody('');
    await loadData();
    setActionLoading(false);
  };

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await addGeneralNoteAction(leadId, generalNote, currentUser.id);
    setGeneralNote('');
    await loadData();
    setActionLoading(false);
  };

  const submitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate) return;
    setActionLoading(true);
    await createFollowUpAction(leadId, followUpDate, followUpNote || 'Follow up with customer regarding travel requirements.', currentUser.id);
    setFollowUpDate('');
    setFollowUpNote('');
    await loadData();
    setActionLoading(false);
  };

  const handleWhatsAppClick = async () => {
    const rawDigits = lead.customer.phoneNumber.replace(/\D/g, '');
    const cleanPhone = `${lead.customer.phoneCountryCode.replace('+', '')}${rawDigits}`;
    await recordWhatsAppClickAction(lead.id, `${lead.customer.phoneCountryCode} ${lead.customer.phoneNumber}`, currentUser.id);
    const msg = encodeURIComponent(
      `Hello ${lead.customer.fullName}, greetings from Varni Holidays Anand! I am ${currentUser.fullName}. Regarding your travel enquiry (${lead.referenceId}), I am available to assist you.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    await loadData();
  };

  if (loading || !lead) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-[#969CA5] bg-[#101113]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#E9B95E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading Customer Lead Dossier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title={lead.customer.fullName}
        subtitle={`Enquiry Dossier: ${lead.referenceId} • Received ${new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/employee/leads"
              className="px-3 py-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Pipeline</span>
            </Link>
          </div>
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        {/* Top Control Bar: Stage, Priority, Assignee */}
        <div className="bg-[#17191D] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 border border-[#2A2E34]">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] text-[#666E79] uppercase tracking-wider mb-1">
                Stage
              </label>
              <select
                value={lead.stage}
                onChange={(e) => handleStageChange(e.target.value as PipelineStageCode)}
                disabled={actionLoading}
                className="py-1 px-2.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E] cursor-pointer"
              >
                <option value="REQUESTS">Requests (New)</option>
                <option value="GENERAL">General Discussions</option>
                <option value="PRIORITY">Priority Intent</option>
                <option value="CONVERTED">Converted Booking</option>
                <option value="CLOSED">Closed / Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#666E79] uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={lead.priorityLevel}
                onChange={(e) => handlePriorityChange(e.target.value as PriorityLevelCode)}
                disabled={actionLoading}
                className="py-1 px-2.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E] cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#666E79] uppercase tracking-wider mb-1">
                Specialist
              </label>
              <select
                value={lead.assignedUserId || 'UNASSIGNED'}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={actionLoading}
                className="py-1 px-2.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E] cursor-pointer"
              >
                <option value="UNASSIGNED">Unassigned</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#55B98A]/15 text-[#55B98A] border border-[#55B98A]/30 text-xs font-medium hover:bg-[#55B98A]/25 transition-colors"
            >
              <MessageSquare size={14} />
              <span>WhatsApp Traveler</span>
            </button>
            <Link
              href={`/employee/quotations?newLeadId=${lead.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E9B95E] text-[#101113] text-xs font-semibold hover:bg-[#F0C878] transition-colors"
            >
              <PlusCircle size={14} />
              <span>Create Quotation</span>
            </Link>
          </div>
        </div>

        {/* 3-Column Dossier Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Customer Profile & Trip Details (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Customer Details Card */}
            <div className="bg-[#17191D] rounded-lg p-4 border border-[#2A2E34] space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A2E34]">
                <h3 className="font-medium text-xs text-[#F4F4F2]">Customer Profile</h3>
                <Link
                  href={`/employee/customers/${lead.customer.id}`}
                  className="text-xs text-[#E9B95E] hover:underline inline-flex items-center gap-1"
                >
                  360 Profile <ExternalLink size={12} />
                </Link>
              </div>

              {lead.customer.duplicateWarning && (
                <div className="p-2.5 rounded bg-[#E8B65E]/10 border border-[#E8B65E]/20 text-[#E8B65E] text-xs">
                  <div className="flex items-center gap-1.5 font-medium mb-0.5">
                    <AlertTriangle size={13} />
                    <span>Potential Duplicate Account</span>
                  </div>
                  <p className="text-[11px] text-[#969CA5]">{lead.customer.duplicateNotes}</p>
                </div>
              )}

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[#666E79] block">Full Name</span>
                  <span className="font-medium text-[#F4F4F2]">{lead.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#666E79] block">Phone (Normalized)</span>
                  <span className="font-mono text-[#F4F4F2]">
                    {lead.customer.phoneCountryCode} {lead.customer.phoneNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#666E79] block">Email</span>
                  <span className="text-[#969CA5]">{lead.customer.email || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#666E79] block">City</span>
                  <span className="text-[#969CA5]">{lead.customer.city || 'Gujarat, India'}</span>
                </div>
              </div>
            </div>

            {/* Service-Specific Requirements */}
            <div className="bg-[#17191D] rounded-lg p-4 border border-[#2A2E34] space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A2E34]">
                <h3 className="font-medium text-xs text-[#F4F4F2]">Enquiry Requirements</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-[#1D2025] text-[#969CA5] border border-[#2A2E34]">
                  {lead.serviceType}
                </span>
              </div>

              {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                    <span className="font-medium text-[#F4F4F2] block">{lead.packageDetail.packageName}</span>
                    <span className="text-[11px] text-[#969CA5]">
                      Hotel Tier: <strong className="text-[#F4F4F2]">{lead.packageDetail.hotelTier}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Adults</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.packageDetail.adultsCount} Pax</span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Children</span>
                      <span className="font-medium text-[#F4F4F2]">
                        {lead.packageDetail.childrenWithBedCount + lead.packageDetail.childrenNoBedCount} Pax
                      </span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Rooms</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.packageDetail.roomsCount} Rooms</span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Vehicle</span>
                      <span className="font-medium text-[#F4F4F2] truncate">{lead.packageDetail.vehicleAssigned || 'Standard'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2A2E34] space-y-1 text-[11px] text-[#969CA5]">
                    <div className="flex items-center justify-between">
                      <span>Houseboat Upgrade:</span>
                      <span className="text-[#F4F4F2] font-medium">{lead.packageDetail.includeHouseboatUpgrade ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Athirapilly Day Trip:</span>
                      <span className="text-[#F4F4F2] font-medium">{lead.packageDetail.includeAthirapillyTrip ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Kanyakumari Day Trip:</span>
                      <span className="text-[#F4F4F2] font-medium">{lead.packageDetail.includeKanyakumariTrip ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs">
                    <span className="text-[10px] uppercase text-[#666E79] block">Calculated System Estimate</span>
                    <span className="text-sm font-semibold text-[#55B98A] tabular-nums">
                      {lead.packageDetail.quotedTotalPriceInr
                        ? `₹${(lead.packageDetail.quotedTotalPriceInr ?? 0).toLocaleString('en-IN')}`
                        : 'Custom Quotation Required'}
                    </span>
                  </div>
                </div>
              )}

              {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                    <span className="text-[10px] uppercase text-[#666E79] block">Flight Routing</span>
                    <div className="font-medium text-xs text-[#F4F4F2] mt-0.5">
                      {lead.flightDetail.originAirport} → {lead.flightDetail.destinationAirport}
                    </div>
                    <span className="text-[10px] text-[#969CA5] block mt-0.5">
                      {lead.flightDetail.tripType} • {lead.flightDetail.cabinClass} Class
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Departure</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.flightDetail.departureDate}</span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Return</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.flightDetail.returnDate || 'One Way'}</span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Adults</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.flightDetail.adultsCount} Pax</span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Children/Infants</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.flightDetail.childrenCount} / {lead.flightDetail.infantsCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {lead.serviceType === 'VISA' && lead.visaDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                    <span className="text-[10px] uppercase text-[#666E79] block">Visa Application</span>
                    <div className="font-medium text-xs text-[#F4F4F2] mt-0.5">
                      {lead.visaDetail.destinationCountry} Visa ({lead.visaDetail.visaCategory})
                    </div>
                    <span className="text-[10px] text-[#969CA5] block mt-0.5">
                      {lead.visaDetail.applicantCount} Applicant(s) • Nationality: {lead.visaDetail.applicantNationality}
                    </span>
                  </div>

                  <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34] text-[11px]">
                    <span className="text-[#666E79] block">Planned Travel Date</span>
                    <span className="font-medium text-[#F4F4F2]">{lead.visaDetail.plannedTravelDate || 'Tentative'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column: Activity Logger & Timeline (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Activity Logger Box */}
            <div className="bg-[#17191D] rounded-lg p-4 border border-[#2A2E34]">
              <h3 className="font-medium text-xs text-[#F4F4F2] mb-3">Record Touchpoint</h3>

              {/* Tabs */}
              <div className="flex border-b border-[#2A2E34] pb-2 gap-2 mb-3.5 text-xs">
                {(['CALL', 'NOTE', 'EMAIL', 'FOLLOWUP'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-1 px-2.5 text-xs font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-[#E9B95E] text-[#E9B95E]'
                        : 'text-[#666E79] hover:text-[#969CA5]'
                    }`}
                  >
                    {tab === 'CALL' && 'Log Call'}
                    {tab === 'NOTE' && 'Internal Note'}
                    {tab === 'EMAIL' && 'Log Email'}
                    {tab === 'FOLLOWUP' && 'Schedule Follow-up'}
                  </button>
                ))}
              </div>

              {/* Active Tab Form */}
              {activeTab === 'CALL' && (
                <form onSubmit={submitCall} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-[#666E79] uppercase mb-1">Outcome</label>
                      <select
                        value={callOutcome}
                        onChange={(e: any) => setCallOutcome(e.target.value)}
                        className="w-full p-1.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                      >
                        <option value="CONNECTED">Connected</option>
                        <option value="BUSY">Line Busy</option>
                        <option value="UNANSWERED">No Answer</option>
                        <option value="CALLBACK_REQUESTED">Callback Asked</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#666E79] uppercase mb-1">Duration (Secs)</label>
                      <input
                        type="number"
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        className="w-full p-1.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#666E79] uppercase mb-1">Discussion Notes</label>
                    <textarea
                      rows={2}
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Passenger feedback, dates, budget..."
                      className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2] placeholder-[#666E79] focus:outline-none focus:border-[#E9B95E]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium transition-colors"
                  >
                    Save Call Activity
                  </button>
                </form>
              )}

              {activeTab === 'NOTE' && (
                <form onSubmit={submitNote} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-[#666E79] uppercase mb-1">Internal Team Note</label>
                    <textarea
                      rows={3}
                      value={generalNote}
                      onChange={(e) => setGeneralNote(e.target.value)}
                      placeholder="Notes for desk teammates..."
                      className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2] placeholder-[#666E79] focus:outline-none focus:border-[#E9B95E]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium transition-colors"
                  >
                    Post Note
                  </button>
                </form>
              )}

              {activeTab === 'EMAIL' && (
                <form onSubmit={submitEmail} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-[#666E79] uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="w-full p-1.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#666E79] uppercase mb-1">Summary</label>
                    <textarea
                      rows={2}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Email summary..."
                      className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium transition-colors"
                  >
                    Log Email Dispatch
                  </button>
                </form>
              )}

              {activeTab === 'FOLLOWUP' && (
                <form onSubmit={submitFollowUp} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-[#666E79] uppercase mb-1">Follow-up Date & Time</label>
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full p-1.5 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#666E79] uppercase mb-1">Follow-up Task</label>
                    <textarea
                      rows={2}
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      placeholder="Call customer to confirm quotation..."
                      className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-1.5 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium transition-colors"
                  >
                    Schedule Task
                  </button>
                </form>
              )}
            </div>

            {/* Interaction History Timeline */}
            <div className="bg-[#17191D] rounded-lg p-4 border border-[#2A2E34] space-y-3.5">
              <h3 className="font-medium text-xs text-[#F4F4F2]">Interaction Timeline</h3>

              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E9B95E] mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-[#F4F4F2]">{act.title}</span>
                        <span className="text-[10px] text-[#666E79] font-mono">
                          {new Date(act.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#969CA5] mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-[#666E79] block mt-0.5">By {act.userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Quotations & Bookings (3 Cols) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-[#17191D] rounded-lg p-4 border border-[#2A2E34] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A2E34]">
                <h3 className="font-medium text-xs text-[#F4F4F2]">Issued Quotations</h3>
                <span className="text-[10px] font-mono text-[#969CA5]">{quotations.length}</span>
              </div>

              {quotations.map((q) => (
                <div key={q.id} className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34] space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/employee/quotations/${q.id}`}
                      className="text-xs font-mono font-medium text-[#E9B95E] hover:underline"
                    >
                      {q.quotationReference}
                    </Link>
                    <span className="text-[9px] uppercase px-1 rounded bg-[#17191D] text-[#969CA5] border border-[#2A2E34]">
                      {q.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#55B98A] tabular-nums">
                    ₹{(q.totalAmountInr ?? q.finalPayableAmountInr ?? 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[#666E79]">
                    Valid till: {new Date(q.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}

              {quotations.length === 0 && (
                <p className="text-xs text-[#666E79] py-4 text-center">No quotations generated yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
