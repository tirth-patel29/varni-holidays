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

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const { currentUser, allUsers, isSuperAdmin } = useCrm();

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
    setActivities(acts);
    const quotes = await getQuotationsAction(leadId);
    setQuotations(quotes);
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
      <div className="flex-1 flex items-center justify-center p-20 text-[#153650]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-3xl text-[#C29033]">progress_activity</span>
          <span className="font-bold text-base">Loading Customer Lead Dossier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FBF9F5]">
      <CrmHeader
        title={lead.customer.fullName}
        subtitle={`Enquiry Dossier: ${lead.referenceId} • Received ${new Date(lead.createdAt).toLocaleString('en-IN')}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/employee/leads"
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E3DCCB] text-xs font-bold text-[#153650] hover:bg-[#F5F2EB] transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Pipeline</span>
            </Link>
          </div>
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {/* Top Control Bar: Stage, Priority, Assignee */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-[#E3DCCB] shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Pipeline Stage
              </label>
              <select
                value={lead.stage}
                onChange={(e) => handleStageChange(e.target.value as PipelineStageCode)}
                disabled={actionLoading}
                className="py-2 px-3 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs font-bold text-[#153650] focus:outline-none focus:ring-2 focus:ring-[#153650]/20"
              >
                <option value="REQUESTS">REQUESTS (New)</option>
                <option value="GENERAL">GENERAL (In Discussion)</option>
                <option value="PRIORITY">PRIORITY (High Intent)</option>
                <option value="CONVERTED">CONVERTED (Won)</option>
                <option value="CLOSED">CLOSED (Lost/Archived)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={lead.priorityLevel}
                onChange={(e) => handlePriorityChange(e.target.value as PriorityLevelCode)}
                disabled={actionLoading}
                className="py-2 px-3 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Assigned Specialist
              </label>
              <select
                value={lead.assignedUserId || 'UNASSIGNED'}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={actionLoading}
                className="py-2 px-3 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs font-bold text-slate-800 focus:outline-none"
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Launch WhatsApp Web</span>
            </button>
          </div>
        </div>

        {/* 3-Column Dossier Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customer Profile & Requirements (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Customer Details Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-[#153650] text-base">Customer Details</h3>
                <Link
                  href={`/employee/customers/${lead.customer.id}`}
                  className="text-xs font-bold text-[#24689B] hover:underline"
                >
                  View 360 Profile
                </Link>
              </div>

              {lead.customer.duplicateWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span>Potential Duplicate Account</span>
                  </div>
                  <p className="text-[11px] leading-tight font-medium">{lead.customer.duplicateNotes}</p>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Full Name</span>
                  <span className="font-bold text-[#153650] text-sm">{lead.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Phone (E.164 Normalized)</span>
                  <span className="font-mono font-bold text-[#153650] text-sm">
                    {lead.customer.phoneCountryCode} {lead.customer.phoneNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Email Address</span>
                  <span className="text-slate-700 font-semibold">{lead.customer.email || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Location</span>
                  <span className="text-slate-700 font-semibold">{lead.customer.city || 'Gujarat, India'}</span>
                </div>
              </div>
            </div>

            {/* Service-Specific Requirements */}
            <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-[#153650] text-base">Trip Requirements</h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#153650] text-white">
                  {lead.serviceType}
                </span>
              </div>

              {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3.5 rounded-xl bg-[#F5F2EB] border border-[#E3DCCB]">
                    <span className="font-bold text-[#153650] block text-sm">{lead.packageDetail.packageName}</span>
                    <span className="text-[11px] text-slate-600 font-semibold">
                      Hotel Tier: <strong>{lead.packageDetail.hotelTier}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Adults</span>
                      <span className="font-bold text-[#153650] text-xs">{lead.packageDetail.adultsCount} Pax</span>
                    </div>
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Children</span>
                      <span className="font-bold text-[#153650] text-xs">
                        {lead.packageDetail.childrenWithBedCount + lead.packageDetail.childrenNoBedCount} Pax
                      </span>
                    </div>
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Rooms</span>
                      <span className="font-bold text-[#153650] text-xs">{lead.packageDetail.roomsCount} Rooms</span>
                    </div>
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Vehicle</span>
                      <span className="font-bold text-[#153650] text-xs truncate">{lead.packageDetail.vehicleAssigned || 'Standard'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E3DCCB] space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Houseboat Upgrade:</span>
                      <span className="font-bold text-[#153650]">{lead.packageDetail.includeHouseboatUpgrade ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Athirapilly Day Trip:</span>
                      <span className="font-bold text-[#153650]">{lead.packageDetail.includeAthirapillyTrip ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Kanyakumari Day Trip:</span>
                      <span className="font-bold text-[#153650]">{lead.packageDetail.includeKanyakumariTrip ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider block text-emerald-800">Calculated Estimate</span>
                    <span className="font-serif text-lg font-bold">
                      {lead.packageDetail.quotedTotalPriceInr
                        ? `₹${lead.packageDetail.quotedTotalPriceInr.toLocaleString('en-IN')}`
                        : 'Custom Quotation Required'}
                    </span>
                  </div>
                </div>
              )}

              {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-300">
                    <span className="text-[10px] uppercase font-black text-sky-900 block">Flight Routing</span>
                    <div className="font-bold text-sm text-[#153650] mt-1">
                      {lead.flightDetail.originAirport} <br />
                      ✈ {lead.flightDetail.destinationAirport}
                    </div>
                    <span className="text-[11px] text-sky-800 font-bold block mt-1">
                      {lead.flightDetail.tripType} • {lead.flightDetail.cabinClass} Class
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Departure Date</span>
                      <span className="font-bold text-[#153650]">{lead.flightDetail.departureDate}</span>
                    </div>
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Return Date</span>
                      <span className="font-bold text-[#153650]">{lead.flightDetail.returnDate || 'One Way'}</span>
                    </div>
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Adults</span>
                      <span className="font-bold text-[#153650]">{lead.flightDetail.adultsCount} Pax</span>
                    </div>
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Children / Infants</span>
                      <span className="font-bold text-[#153650]">{lead.flightDetail.childrenCount} / {lead.flightDetail.infantsCount}</span>
                    </div>
                  </div>

                  {lead.flightDetail.specialRequirements && (
                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-[#E3DCCB] text-[11px]">
                      <span className="text-slate-500 block text-[10px] uppercase font-black">Preferences</span>
                      <p className="mt-0.5 text-slate-800 font-medium">{lead.flightDetail.specialRequirements}</p>
                    </div>
                  )}
                </div>
              )}

              {lead.serviceType === 'VISA' && lead.visaDetail && (
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-300">
                    <span className="text-[10px] uppercase font-black text-purple-900 block">Visa Application</span>
                    <div className="font-bold text-sm text-[#153650] mt-1">
                      {lead.visaDetail.destinationCountry}
                    </div>
                    <span className="text-[11px] text-purple-800 font-bold block mt-1">
                      {lead.visaDetail.visaCategory} Visa • {lead.visaDetail.applicantCount} Applicant(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Nationality</span>
                      <span className="font-bold text-[#153650]">{lead.visaDetail.applicantNationality}</span>
                    </div>
                    <div className="bg-[#FBF9F5] p-2.5 rounded-xl border border-[#E3DCCB]">
                      <span className="text-slate-500 font-semibold block">Planned Travel</span>
                      <span className="font-bold text-[#153650]">{lead.visaDetail.plannedTravelDate || 'Tentative'}</span>
                    </div>
                  </div>

                  {lead.visaDetail.travelPurpose && (
                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-[#E3DCCB] text-[11px]">
                      <span className="text-slate-500 block text-[10px] uppercase font-black">Purpose</span>
                      <p className="mt-0.5 text-slate-800 font-medium">{lead.visaDetail.travelPurpose}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Middle Column: Activity Logger & Chronological Timeline (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Activity Logger Box */}
            <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm">
              <h3 className="font-serif font-bold text-[#153650] text-base mb-3">Record Interaction</h3>

              {/* Tabs */}
              <div className="flex border-b border-[#E3DCCB] pb-2 gap-2 mb-4 overflow-x-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('CALL')}
                  className={`pb-1.5 px-3 border-b-2 font-bold transition-colors ${
                    activeTab === 'CALL' ? 'border-[#153650] text-[#153650]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Log Call
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('NOTE')}
                  className={`pb-1.5 px-3 border-b-2 font-bold transition-colors ${
                    activeTab === 'NOTE' ? 'border-[#153650] text-[#153650]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Internal Note
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('EMAIL')}
                  className={`pb-1.5 px-3 border-b-2 font-bold transition-colors ${
                    activeTab === 'EMAIL' ? 'border-[#153650] text-[#153650]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Log Email
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('FOLLOWUP')}
                  className={`pb-1.5 px-3 border-b-2 font-bold transition-colors ${
                    activeTab === 'FOLLOWUP' ? 'border-[#153650] text-[#153650]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Follow-Up
                </button>
              </div>

              {/* Active Tab Form */}
              {activeTab === 'CALL' && (
                <form onSubmit={submitCall} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Outcome</label>
                      <select
                        value={callOutcome}
                        onChange={(e: any) => setCallOutcome(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs font-bold text-slate-800"
                      >
                        <option value="CONNECTED">Connected</option>
                        <option value="BUSY">Line Busy</option>
                        <option value="UNANSWERED">No Answer</option>
                        <option value="CALLBACK_REQUESTED">Callback Asked</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Duration (Secs)</label>
                      <input
                        type="number"
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Discussion Notes</label>
                    <textarea
                      rows={3}
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Spoke with customer about itinerary adjustments..."
                      className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs text-slate-800"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-[#153650] text-white text-xs font-bold shadow hover:bg-[#0B1E2E] transition-colors"
                  >
                    Save Call Log
                  </button>
                </form>
              )}

              {activeTab === 'NOTE' && (
                <form onSubmit={submitNote} className="space-y-3.5">
                  <textarea
                    rows={4}
                    value={generalNote}
                    onChange={(e) => setGeneralNote(e.target.value)}
                    placeholder="Enter confidential internal note, supervisor comment, or booking instruction..."
                    className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs text-slate-800"
                    required
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-[#153650] text-white text-xs font-bold shadow hover:bg-[#0B1E2E] transition-colors"
                  >
                    Save Internal Note
                  </button>
                </form>
              )}

              {activeTab === 'EMAIL' && (
                <form onSubmit={submitEmail} className="space-y-3.5">
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject line..."
                    className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs font-bold text-slate-800"
                    required
                  />
                  <textarea
                    rows={3}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Summary of email dispatched..."
                    className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs text-slate-800"
                    required
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-[#153650] text-white text-xs font-bold shadow hover:bg-[#0B1E2E] transition-colors"
                  >
                    Log Sent Email
                  </button>
                </form>
              )}

              {activeTab === 'FOLLOWUP' && (
                <form onSubmit={submitFollowUp} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Follow-up Date & Time</label>
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs font-bold text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Reminder Note</label>
                    <textarea
                      rows={2}
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      placeholder="e.g. Call regarding quotation review and booking deposit..."
                      className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] text-xs text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-[#E9B95E] text-[#0B1E2E] text-xs font-black shadow hover:bg-[#C29033] hover:text-white transition-colors"
                  >
                    Schedule Reminder
                  </button>
                </form>
              )}
            </div>

            {/* Interaction History Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-[#153650] text-base">Interaction Timeline</h3>
                <span className="text-[11px] font-bold text-slate-500 bg-[#F5F2EB] px-2 py-0.5 rounded-full">{activities.length} Entries</span>
              </div>

              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-[#F5F2EB]/80 border border-[#E3DCCB] flex items-start gap-3 text-xs"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        act.type === 'CALL'
                          ? 'bg-sky-100 text-sky-900 border border-sky-300'
                          : act.type === 'WHATSAPP_CLICK'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : act.type === 'STAGE_CHANGE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {act.type === 'CALL'
                          ? 'call'
                          : act.type === 'WHATSAPP_CLICK'
                          ? 'chat'
                          : act.type === 'STAGE_CHANGE'
                          ? 'published_with_changes'
                          : act.type === 'ASSIGNMENT'
                          ? 'person_add'
                          : 'notes'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[#153650] text-xs">{act.title}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {new Date(act.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed font-medium">{act.description}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                        <span className="font-semibold">By {act.userName}</span>
                        <span>{new Date(act.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Quotations & Bookings (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quotations Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#E3DCCB] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-[#153650] text-base">Formal Quotations</h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">{quotations.length}</span>
              </div>

              {quotations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-medium bg-[#F5F2EB] rounded-xl border border-[#E3DCCB]">
                  No quotation generated yet.
                </div>
              ) : (
                quotations.map((q) => (
                  <div key={q.id} className="p-3.5 rounded-xl bg-[#F5F2EB] border border-[#E3DCCB] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#153650]">{q.quotationNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {q.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs">{q.title}</div>
                    <div className="text-sm font-serif font-bold text-emerald-800">
                      ₹{q.totalAmountInr.toLocaleString('en-IN')}
                    </div>
                    {isSuperAdmin && q.supplierNetCostInr && (
                      <div className="text-[10px] text-slate-500 font-semibold border-t border-[#E3DCCB] pt-1">
                        Supplier Net: ₹{q.supplierNetCostInr.toLocaleString('en-IN')} (Margin: ₹{(q.totalAmountInr - q.supplierNetCostInr).toLocaleString('en-IN')})
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Action Guide */}
            <div className="bg-white rounded-2xl p-6 border border-[#E9B95E] text-xs text-slate-700 space-y-2 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#C29033] block">
                Standard Operational Protocol
              </span>
              <p className="leading-relaxed font-medium">
                1. Call customer within 30 minutes of web submission.<br />
                2. Verify passenger counts, room configurations, and travel dates.<br />
                3. Update stage from <strong>REQUESTS</strong> to <strong>GENERAL</strong> upon first contact.<br />
                4. For high-budget or confirmed interest, promote to <strong>PRIORITY</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
