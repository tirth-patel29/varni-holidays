'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCrm } from '@/components/crm/CrmContext';
import {
  getLeadByIdAction,
  updateLeadStageAction,
  assignLeadAction,
  updateLeadPriorityAction,
  logCallActivityAction,
  recordWhatsAppClickAction,
  addGeneralNoteAction,
  createFollowUpAction,
  getQuotationsAction,
  getLeadActivitiesAction,
} from '@/app/actions/crm';
import { PipelineStageCode, PriorityLevelCode } from '@/lib/auth/types';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
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
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

const STAGES: { code: PipelineStageCode; label: string }[] = [
  { code: 'REQUESTS', label: 'Fresh Requests' },
  { code: 'GENERAL', label: 'General Discussions' },
  { code: 'PRIORITY', label: 'Priority / High Intent' },
  { code: 'CONVERTED', label: 'Converted to Booking' },
  { code: 'CLOSED', label: 'Closed / Lost' },
];

const PRIORITIES: { code: PriorityLevelCode; label: string }[] = [
  { code: 'LOW', label: 'Low' },
  { code: 'MEDIUM', label: 'Medium' },
  { code: 'HIGH', label: 'High' },
  { code: 'URGENT', label: 'Urgent' },
];

export default function AdminLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const { currentUser, allUsers } = useCrm();

  const [lead, setLead] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Touchpoint logger state
  const [activeTab, setActiveTab] = useState<'CALL' | 'NOTE' | 'FOLLOWUP'>('CALL');
  const [callDuration, setCallDuration] = useState('300');
  const [callOutcome, setCallOutcome] = useState<'CONNECTED' | 'BUSY' | 'UNANSWERED' | 'CALLBACK_REQUESTED'>('CONNECTED');
  const [callNotes, setCallNotes] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await getLeadByIdAction(leadId);
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLead(data);
      const acts = await getLeadActivitiesAction(data.id || leadId);
      setActivities(acts || []);
      const quotes = await getQuotationsAction(data.id || leadId);
      setQuotations(quotes || []);
    } catch (err) {
      console.error('Failed to load lead details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) loadData();
  }, [leadId]);

  const handleStageChange = async (newStage: PipelineStageCode) => {
    setActionLoading(true);
    await updateLeadStageAction(leadId, newStage, `Stage updated to ${newStage} from Admin Dossier`, currentUser.id);
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

  const submitCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    await logCallActivityAction(leadId, parseInt(callDuration, 10), callOutcome, callNotes || 'Call completed.', currentUser.id);
    setCallNotes('');
    await loadData();
    setActionLoading(false);
  };

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalNote.trim()) return;
    setActionLoading(true);
    await addGeneralNoteAction(leadId, generalNote.trim(), currentUser.id);
    setGeneralNote('');
    await loadData();
    setActionLoading(false);
  };

  const submitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate) return;
    setActionLoading(true);
    await createFollowUpAction(leadId, followUpDate, followUpNote || 'Scheduled client contact checkpoint.', currentUser.id);
    setFollowUpNote('');
    setFollowUpDate('');
    await loadData();
    setActionLoading(false);
  };

  const triggerWhatsApp = async () => {
    if (!lead?.customer?.phoneNumber) return;
    const cleanPhone = (lead.customer.phoneCountryCode || '+91').replace('+', '') + lead.customer.phoneNumber.replace(/\D/g, '');
    await recordWhatsAppClickAction(lead.id, `${lead.customer.phoneCountryCode} ${lead.customer.phoneNumber}`, currentUser.id);
    window.open(`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(lead.customer.fullName)}%2C%20greetings%20from%20Varni%20Holidays%20Anand%20HQ%20regarding%20enquiry%20${lead.referenceId}`, '_blank');
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-[#F7F8FA]">
        <div className="text-center text-[#718096]">
          <div className="w-6 h-6 border-2 border-[#153650] border-t-transparent rounded-none animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold tracking-wide uppercase font-mono">
            Loading Customer Dossier...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !lead) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#F7F8FA] space-y-3">
        <AlertTriangle size={32} className="text-[#D54747]" />
        <h2 className="text-base font-bold text-[#153650]">Customer Dossier Not Found</h2>
        <p className="text-xs text-[#718096]">Enquiry ID or reference &ldquo;{leadId}&rdquo; does not exist in the database.</p>
        <Link href="/admin/leads" className="px-4 py-2 bg-[#153650] text-[#FFFFFF] text-xs font-bold rounded-none">
          Return to Pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <Breadcrumbs items={[{ label: 'Customers & CRM', href: '/admin/customers' }, { label: 'Lead Pipeline', href: '/admin/leads' }, { label: lead.referenceId || 'Dossier' }]} />
        
        {/* Navigation Breadcrumb & Master Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/leads"
              className="w-8 h-8 flex items-center justify-center bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-[#153650] rounded-none transition-colors shrink-0 shadow-xs"
              title="Return to Pipeline"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#153650]">{lead.referenceId}</span>
                <span className="inline-block px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#153650] border border-[#CBD5E1]">
                  {lead.serviceType}
                </span>
              </div>
              <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#153650] leading-tight truncate">
                {lead.customer?.fullName || 'Valued Traveler'}
              </h1>
            </div>
          </div>

          {/* Quick Stage, Priority & Assignee Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Stage Selector */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E5E8ED] px-2.5 py-1 rounded-none shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#718096]">Stage:</span>
              <select
                value={lead.stage}
                onChange={(e) => handleStageChange(e.target.value as PipelineStageCode)}
                disabled={actionLoading}
                className="text-xs font-bold text-[#153650] bg-transparent focus:outline-none cursor-pointer"
              >
                {STAGES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E5E8ED] px-2.5 py-1 rounded-none shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#718096]">Priority:</span>
              <select
                value={lead.priorityLevel}
                onChange={(e) => handlePriorityChange(e.target.value as PriorityLevelCode)}
                disabled={actionLoading}
                className="text-xs font-bold text-[#153650] bg-transparent focus:outline-none cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E5E8ED] px-2.5 py-1 rounded-none shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#718096]">Desk:</span>
              <select
                value={lead.assignedUserId || 'UNASSIGNED'}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={actionLoading}
                className="text-xs font-bold text-[#153650] bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="UNASSIGNED">Unassigned</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3-Column Dossier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Customer Profile & Travel Requirements (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Customer Contact Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 shadow-xs space-y-4">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#153650]">
                  Client Identity & Contact
                </span>
                <span className="text-[10px] text-[#718096] font-mono">Verified ID</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#718096] block">Full Name</span>
                  <span className="font-bold text-[#153650] text-sm block mt-0.5">{lead.customer?.fullName}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#718096] block">Contact Phone</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-bold text-[#153650]">
                      {lead.customer?.phoneCountryCode} {lead.customer?.phoneNumber}
                    </span>
                    <button
                      type="button"
                      onClick={triggerWhatsApp}
                      className="px-2 py-0.5 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#168653] border border-[#D1F0E0] rounded-none text-[10px] font-bold inline-flex items-center gap-1"
                    >
                      <MessageSquare size={11} />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#718096] block">Email Address</span>
                  <span className="font-mono text-[#172B45] block mt-0.5">
                    {lead.customer?.email || 'Not specified'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#718096] block">City & State</span>
                  <span className="text-[#172B45] block mt-0.5 font-medium">
                    {lead.customer?.city || 'Anand'}, Gujarat
                  </span>
                </div>
              </div>
            </div>

            {/* Service Requirements Dossier Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 shadow-xs space-y-4">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#153650]">
                  Travel Scope & Requirements
                </span>
                <span className="inline-block px-1.5 py-0.2 rounded-none text-[9px] font-bold uppercase bg-[#F1F5F9] text-[#153650] border border-[#CBD5E1]">
                  {lead.serviceType}
                </span>
              </div>

              {/* Package Details */}
              {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#718096]">Package Name</span>
                    <p className="font-bold text-[#153650]">{lead.packageDetail.packageName}</p>
                    <p className="text-[11px] text-[#718096]">
                      {lead.packageDetail.duration || '6N/7D'} • {lead.packageDetail.adultsCount} Adults
                    </p>
                  </div>
                  {lead.packageDetail.quotedTotalPriceInr && (
                    <div className="p-3 bg-[#F0FDF4] border border-[#D1F0E0] rounded-none flex items-center justify-between">
                      <span className="text-xs font-bold text-[#168653]">Calculated Quote:</span>
                      <span className="text-sm font-bold font-mono text-[#168653]">
                        ₹{lead.packageDetail.quotedTotalPriceInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Flight Details */}
              {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none space-y-2">
                    <div className="flex items-center justify-between font-bold text-[#153650]">
                      <span>{lead.flightDetail.originAirport}</span>
                      <Plane size={14} className="text-[#24689B]" />
                      <span>{lead.flightDetail.destinationAirport}</span>
                    </div>
                    <div className="text-[11px] text-[#718096] flex items-center justify-between">
                      <span>Trip: {lead.flightDetail.tripType}</span>
                      <span>Class: {lead.flightDetail.cabinClass}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none">
                      <span className="text-[10px] uppercase font-bold text-[#718096] block">In-flight Meal</span>
                      <span className="font-bold text-[#153650] mt-0.5 block truncate">
                        {lead.flightDetail.mealPreferenceCode || 'NO_PREFERENCE'}
                      </span>
                    </div>
                    <div className="p-2 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none">
                      <span className="text-[10px] uppercase font-bold text-[#718096] block">Assistance</span>
                      <span className="font-bold text-[#153650] mt-0.5 block truncate">
                        {lead.flightDetail.wheelchairAssistanceCode || 'NONE'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Visa Details */}
              {lead.serviceType === 'VISA' && lead.visaDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#718096]">Destination & Category</span>
                    <p className="font-bold text-[#153650] text-sm">
                      {lead.visaDetail.destinationCountry} Visa ({lead.visaDetail.visaCategory})
                    </p>
                    {lead.visaDetail.visaType && (
                      <p className="text-[11px] text-[#24689B] font-semibold">
                        Specific Subtype: {lead.visaDetail.visaType}
                      </p>
                    )}
                  </div>
                  <div className="p-2 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none text-[11px] flex justify-between">
                    <span className="text-[#718096]">Applicants:</span>
                    <span className="font-bold text-[#153650]">{lead.visaDetail.applicantCount || 1} Persons</span>
                  </div>
                </div>
              )}

              {/* Travel Insurance Details & Confidentiality Badge */}
              {lead.serviceType === 'TRAVEL_INSURANCE' && lead.insuranceDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#718096]">Destination & Travel Date</span>
                    <p className="font-bold text-[#153650] text-sm">
                      {lead.insuranceDetail.destinationCountry}
                    </p>
                    <p className="text-[11px] text-[#718096]">
                      Departure: {lead.insuranceDetail.departureDate} • DOB: {lead.insuranceDetail.dateOfBirth}
                    </p>
                  </div>

                  {lead.insuranceDetail.hasPreExistingDisease && (
                    <div className="p-3 bg-[#FEF2F2] border border-[#FCDAD7] rounded-none space-y-1.5 text-[#D54747]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] uppercase font-mono tracking-wider">
                          Declared Pre-Existing Condition
                        </span>
                        <span className="px-1.5 py-0.2 bg-[#FFFFFF] border border-[#FCDAD7] text-[#D54747] text-[9px] font-bold">
                          Confidential
                        </span>
                      </div>
                      <p className="text-xs text-[#172B45] font-medium leading-relaxed">
                        {lead.insuranceDetail.preExistingDiseaseDetails}
                      </p>
                      <span className="text-[9px] text-[#718096] block italic">
                        Access restricted to authorized insurance underwriting desk.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Column 2: Touchpoint Logger & Activity Timeline (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Record Touchpoint Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 shadow-xs space-y-4">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#153650]">
                  Record Operations Touchpoint
                </span>
                <span className="text-[10px] text-[#718096]">Audit Stamped</span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#E5E8ED]">
                <button
                  type="button"
                  onClick={() => setActiveTab('CALL')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === 'CALL'
                      ? 'border-[#24689B] text-[#153650] bg-[#F8FAFC]'
                      : 'border-transparent text-[#718096] hover:text-[#153650]'
                  }`}
                >
                  Log Phone Call
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('NOTE')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === 'NOTE'
                      ? 'border-[#24689B] text-[#153650] bg-[#F8FAFC]'
                      : 'border-transparent text-[#718096] hover:text-[#153650]'
                  }`}
                >
                  General Note
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('FOLLOWUP')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === 'FOLLOWUP'
                      ? 'border-[#24689B] text-[#153650] bg-[#F8FAFC]'
                      : 'border-transparent text-[#718096] hover:text-[#153650]'
                  }`}
                >
                  Schedule Follow-up
                </button>
              </div>

              {/* Form Tab 1: Call */}
              {activeTab === 'CALL' && (
                <form onSubmit={submitCall} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#718096] mb-1">Duration</label>
                      <select
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        className="w-full text-xs font-medium bg-[#F8FAFC] border border-[#E5E8ED] px-2 py-1.5 rounded-none"
                      >
                        <option value="60">1 Minute</option>
                        <option value="300">5 Minutes</option>
                        <option value="600">10 Minutes</option>
                        <option value="1200">20 Minutes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#718096] mb-1">Outcome</label>
                      <select
                        value={callOutcome}
                        onChange={(e) => setCallOutcome(e.target.value as any)}
                        className="w-full text-xs font-medium bg-[#F8FAFC] border border-[#E5E8ED] px-2 py-1.5 rounded-none"
                      >
                        <option value="CONNECTED">Connected / Discussed</option>
                        <option value="BUSY">Line Busy</option>
                        <option value="UNANSWERED">Ringing / Unanswered</option>
                        <option value="CALLBACK_REQUESTED">Callback Requested</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#718096] mb-1">Call Notes & Summary</label>
                    <textarea
                      rows={2}
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Discussed travel dates, hotel preferences, passenger meal requests..."
                      className="w-full text-xs bg-[#F8FAFC] border border-[#E5E8ED] p-2.5 rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors"
                    >
                      Save Call Log
                    </button>
                  </div>
                </form>
              )}

              {/* Form Tab 2: Note */}
              {activeTab === 'NOTE' && (
                <form onSubmit={submitNote} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#718096] mb-1">Internal Team Note</label>
                    <textarea
                      rows={3}
                      required
                      value={generalNote}
                      onChange={(e) => setGeneralNote(e.target.value)}
                      placeholder="Add an internal observation, dietary request, or passport renewal status..."
                      className="w-full text-xs bg-[#F8FAFC] border border-[#E5E8ED] p-2.5 rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors"
                    >
                      Save Note
                    </button>
                  </div>
                </form>
              )}

              {/* Form Tab 3: Follow-up */}
              {activeTab === 'FOLLOWUP' && (
                <form onSubmit={submitFollowUp} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#718096] mb-1">Target Checkpoint Date</label>
                    <input
                      type="date"
                      required
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full text-xs bg-[#F8FAFC] border border-[#E5E8ED] p-2 rounded-none focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#718096] mb-1">Follow-up Goal</label>
                    <input
                      type="text"
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      placeholder="e.g. Call back after client reviews Kerala hotel tiers"
                      className="w-full text-xs bg-[#F8FAFC] border border-[#E5E8ED] p-2 rounded-none focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none transition-colors"
                    >
                      Schedule Task
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Historical Activity Audit Timeline Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 shadow-xs space-y-4">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#153650]">
                  Activity Trail & Milestones
                </span>
                <span className="text-xs font-mono font-bold text-[#718096]">{activities.length} Events</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto crm-scrollbar pr-1">
                {activities.length === 0 ? (
                  <p className="text-xs text-[#718096] py-6 text-center">No recorded activity touchpoints yet.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#153650]">{act.title}</span>
                        <span className="text-[10px] font-mono text-[#718096]">
                          {new Date(act.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[#172B45] text-xs leading-relaxed">{act.description}</p>
                      <span className="text-[10px] text-[#718096] block pt-1">By {act.userName}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Column 3: Commercial Proposals & Quotations (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 shadow-xs space-y-4">
              <div className="border-b border-[#E5E8ED] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#153650]">
                  Quotations & Proposals
                </span>
                <FileText size={15} className="text-[#24689B]" />
              </div>

              {quotations.length === 0 ? (
                <div className="p-4 border border-dashed border-[#E5E8ED] text-center space-y-2 rounded-none">
                  <p className="text-xs text-[#718096]">No formal PDF quotes generated for this enquiry.</p>
                  <Link
                    href={`/employee/quotations?leadId=${lead.id}`}
                    className="inline-block px-3 py-1 bg-[#153650] text-[#FFFFFF] text-xs font-bold rounded-none hover:bg-[#24689B] transition-colors"
                  >
                    Draft Quotation
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {quotations.map((q) => (
                    <div key={q.id} className="p-3 bg-[#F8FAFC] border border-[#E5E8ED] rounded-none space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#153650]">
                        <span>{q.quotationReference}</span>
                        <span className="text-[#168653] font-mono">₹{q.totalAmountInr?.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[11px] text-[#718096]">{q.packageTitle || 'Bespoke Itinerary'}</p>
                      <Link
                        href={`/quotation/${q.quotationReference}`}
                        target="_blank"
                        className="text-xs font-bold text-[#24689B] hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        <span>View Client PDF Proposal</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 shadow-xs space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block font-mono">
                Admin Quick Links
              </span>
              <div className="space-y-1">
                <Link
                  href="/admin/leads"
                  className="block p-2 bg-[#F8FAFC] hover:bg-[#E5E8ED] text-[#153650] font-semibold transition-colors"
                >
                  ← Back to Lead Pipeline
                </Link>
                <Link
                  href="/admin/users"
                  className="block p-2 bg-[#F8FAFC] hover:bg-[#E5E8ED] text-[#153650] font-semibold transition-colors"
                >
                  Staff Workload Allocations
                </Link>
                <Link
                  href="/admin/google-sheets"
                  className="block p-2 bg-[#F8FAFC] hover:bg-[#E5E8ED] text-[#153650] font-semibold transition-colors"
                >
                  Google Sheets Live Outbox
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

