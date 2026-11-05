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
  const [notFound, setNotFound] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setNotFound(false);
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

    let detailsSummary = '';
    if (lead.serviceType === 'PACKAGE' && lead.packageDetail) {
      detailsSummary = ` regarding your Kerala holiday enquiry for "${lead.packageDetail.packageName}" (${lead.packageDetail.adultsCount} Adults, ${lead.packageDetail.hotelTier} tier, Total Estimate: ₹${(lead.packageDetail.quotedTotalPriceInr ?? 0).toLocaleString('en-IN')})`;
    } else if (lead.serviceType === 'FLIGHT' && lead.flightDetail) {
      detailsSummary = ` regarding your flight enquiry (${lead.flightDetail.originAirport} ✈ ${lead.flightDetail.destinationAirport}, ${lead.flightDetail.adultsCount} Adults)`;
    } else if (lead.serviceType === 'VISA' && lead.visaDetail) {
      detailsSummary = ` regarding your ${lead.visaDetail.destinationCountry} ${lead.visaDetail.visaCategory} visa assistance application`;
    }

    const msg = encodeURIComponent(
      `Hello ${lead.customer.fullName}, greetings from Varni Holidays Anand! I am ${currentUser.fullName}${detailsSummary}. Reference: ${lead.referenceId}. How may I assist you with your travel confirmation today?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-[#969CA5] bg-[#101113]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#E9B95E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading Customer Lead Dossier...</span>
        </div>
      </div>
    );
  }

  if (notFound || !lead) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#969CA5] bg-[#101113]">
        <div className="max-w-md w-full bg-[#17191D] border border-[#2A2E34] rounded-xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#DF7373]/10 text-[#DF7373] flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F4F4F2]">Lead Record Not Found</h2>
            <p className="text-xs text-[#969CA5] mt-1">
              Could not locate dossier for reference: <span className="font-mono text-[#E9B95E]">{leadId}</span>. It may have been archived or is still indexing.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-md bg-[#1D2025] hover:bg-[#2A2E34] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2] transition-colors"
            >
              Retry Loading
            </button>
            <Link
              href="/employee/leads"
              className="px-4 py-2 rounded-md bg-[#E9B95E] hover:bg-[#F0C878] text-xs font-semibold text-[#101113] transition-colors"
            >
              Back to Pipeline
            </Link>
          </div>
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
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#F4F4F2] block">{lead.packageDetail.packageName}</span>
                      <span className="px-2 py-0.5 rounded bg-[#2A2E34] text-[10px] text-[#E9B95E] font-bold">
                        {lead.packageDetail.duration || (lead.packageDetail.packageName.includes('5N/6D') ? '5N / 6D' : '6N / 7D')}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#969CA5] block mt-1">
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
                      <span className="text-[#666E79] block">Transport</span>
                      <span className="font-medium text-[#F4F4F2] truncate">{lead.packageDetail.vehicleAssigned || 'Standard Vehicle'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2A2E34] space-y-1 text-[11px] text-[#969CA5]">
                    <div className="flex items-center justify-between">
                      <span>Meal Plan:</span>
                      <span className="text-[#F4F4F2] font-medium">
                        {lead.packageDetail.includeMealPlan ? 'CPAI + Dinner (MAP)' : 'CPAI (Breakfast Included)'}
                      </span>
                    </div>
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
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase text-[#666E79]">Pricing Status</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        lead.packageDetail.pricingStatus === 'EXACT_MATCH'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      }`}>
                        {lead.packageDetail.pricingStatus === 'EXACT_MATCH' ? 'EXACT MATCH' : 'CUSTOM QUOTATION'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#55B98A] tabular-nums block">
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

                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34] space-y-2 text-[11px]">
                    <div>
                      <span className="text-[#666E79] block text-[10px] uppercase">Meal Preference</span>
                      <span className="font-medium text-[#E9B95E] flex items-center gap-1.5 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">restaurant</span>
                        <span>
                          {lead.flightDetail.mealPreferenceCode && lead.flightDetail.mealPreferenceCode !== 'NO_PREFERENCE'
                            ? `${lead.flightDetail.mealPreferenceCode} — ${lead.flightDetail.mealPreferenceDescription || lead.flightDetail.mealPreferenceCode}`
                            : 'No special meal preference'}
                        </span>
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#2A2E34]">
                      <span className="text-[#666E79] block text-[10px] uppercase">Wheelchair / Special Assistance</span>
                      <span className={`font-medium flex items-center gap-1.5 mt-0.5 ${
                        lead.flightDetail.wheelchairAssistanceCode && lead.flightDetail.wheelchairAssistanceCode !== 'NO_ASSISTANCE' && lead.flightDetail.wheelchairAssistanceCode !== 'NONE'
                          ? 'text-[#DF7373]'
                          : 'text-[#969CA5]'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">accessible</span>
                        <span>
                          {lead.flightDetail.wheelchairAssistanceCode && lead.flightDetail.wheelchairAssistanceCode !== 'NO_ASSISTANCE' && lead.flightDetail.wheelchairAssistanceCode !== 'NONE'
                            ? `${lead.flightDetail.wheelchairAssistanceCode} — ${lead.flightDetail.wheelchairAssistanceDescription || 'Wheelchair Required'}`
                            : 'No Assistance Required'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {lead.serviceType === 'VISA' && lead.visaDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                    <span className="text-[10px] uppercase text-[#666E79] block">Visa Application</span>
                    <div className="font-medium text-xs text-[#F4F4F2] mt-0.5">
                      {lead.visaDetail.destinationCountry === 'OTHER' || lead.visaDetail.destinationCountry === 'Other'
                        ? (lead.visaDetail.otherCountryName || 'Other Country')
                        : lead.visaDetail.destinationCountry} Visa ({lead.visaDetail.visaCategory})
                    </div>
                    {lead.visaDetail.visaType && (
                      <div className="text-[11px] text-[#E9B95E] font-medium mt-0.5">
                        Specific Type: {lead.visaDetail.visaType}
                      </div>
                    )}
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

              {lead.serviceType === 'CUSTOM_HOLIDAY' && lead.customHolidayDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                    <span className="text-[10px] uppercase text-[#666E79] block">Custom Holiday Plan</span>
                    <div className="font-medium text-xs text-[#F4F4F2] mt-0.5 flex items-center gap-1.5">
                      <Compass size={13} className="text-[#E9B95E]" />
                      <span>{lead.customHolidayDetail.destinations}</span>
                    </div>
                    <div className="text-[10px] text-[#969CA5] mt-1">
                      {lead.customHolidayDetail.adultsCount} Adults • {lead.customHolidayDetail.childrenCount} Children • {lead.customHolidayDetail.infantsCount} Infants
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Departure</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.customHolidayDetail.departureDate}</span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Return</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.customHolidayDetail.returnDate}</span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Meal Plan</span>
                      <span className="font-medium text-[#E9B95E]">{lead.customHolidayDetail.mealPlan}</span>
                    </div>
                    <div className="bg-[#1D2025] p-2 rounded border border-[#2A2E34]">
                      <span className="text-[#666E79] block">Hotel Tier</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.customHolidayDetail.hotelCategory.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#666E79]">Transfer Preference:</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.customHolidayDetail.transferType}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {lead.customHolidayDetail.needFlights && <span className="px-1.5 py-0.5 rounded bg-[#17191D] border border-[#2A2E34] text-[10px] text-[#969CA5]">✈ Flights</span>}
                      {lead.customHolidayDetail.needVisa && <span className="px-1.5 py-0.5 rounded bg-[#17191D] border border-[#2A2E34] text-[10px] text-[#969CA5]">🛂 Visa</span>}
                      {lead.customHolidayDetail.needInsurance && <span className="px-1.5 py-0.5 rounded bg-[#17191D] border border-[#2A2E34] text-[10px] text-[#969CA5]">🛡 Insurance</span>}
                    </div>
                  </div>

                  {lead.customHolidayDetail.specialRequirements && (
                    <div className="p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-[11px]">
                      <span className="text-[#666E79] block text-[10px] uppercase">Special Requests</span>
                      <p className="text-[#969CA5] mt-0.5">{lead.customHolidayDetail.specialRequirements}</p>
                    </div>
                  )}
                </div>
              )}

              {lead.serviceType === 'TRAVEL_INSURANCE' && lead.insuranceDetail && (
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                    <span className="text-[10px] uppercase text-[#666E79] block">Travel Insurance Policy</span>
                    <div className="font-medium text-xs text-[#F4F4F2] mt-0.5">
                      Destination: {lead.insuranceDetail.destinationCountry}
                    </div>
                    <div className="text-[11px] text-[#969CA5] mt-0.5">
                      Travel Date: {lead.insuranceDetail.departureDate}
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34] space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-[#666E79] block text-[10px] uppercase">Insured DOB</span>
                      <span className="font-medium text-[#F4F4F2]">{lead.insuranceDetail.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-[#666E79] block text-[10px] uppercase">Pre-Existing Disease (PED)</span>
                      <span className={`font-semibold ${lead.insuranceDetail.hasPreExistingDisease ? 'text-[#DF7373]' : 'text-[#55B98A]'}`}>
                        {lead.insuranceDetail.hasPreExistingDisease ? 'Yes - Declared' : 'No PED Reported'}
                      </span>
                    </div>
                    {lead.insuranceDetail.hasPreExistingDisease && lead.insuranceDetail.preExistingDiseaseDetails && (
                      <div className="p-2.5 rounded bg-[#DF7373]/10 border border-[#DF7373]/20 text-[#DF7373] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[10px] uppercase">Declared Conditions:</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800/40 font-mono">
                            Confidential Medical Disclosure
                          </span>
                        </div>
                        <p className="text-[11px] text-[#F4F4F2] mt-0.5 font-medium">{lead.insuranceDetail.preExistingDiseaseDetails}</p>
                        <span className="text-[9px] text-[#969CA5] block">Restricted to authorised insurance desk & policy underwriting.</span>
                      </div>
                    )}
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
                <div key={q.id} className="p-3 rounded-lg bg-[#1D2025] border border-[#2A2E34] space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/quotation/${q.quotationNumber || q.quotationReference || q.id}`}
                      target="_blank"
                      className="text-xs font-mono font-bold text-[#E9B95E] hover:underline flex items-center gap-1"
                    >
                      <span>{q.quotationNumber || q.quotationReference}</span>
                      <ExternalLink size={11} />
                    </Link>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#17191D] text-[#969CA5] border border-[#2A2E34] font-medium">
                      {q.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#F4F4F2] font-medium line-clamp-1">
                    {q.title || 'Tour Proposal'}
                  </div>
                  <div className="text-sm font-bold text-[#55B98A] tabular-nums">
                    ₹{(q.totalAmountInr ?? q.finalPayableAmountInr ?? 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[#666E79]">
                    Valid till: {new Date(q.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  <div className="pt-2 border-t border-[#2A2E34]/80 flex flex-col gap-1.5">
                    <a
                      href={`/quotation/${q.quotationNumber || q.quotationReference || q.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-2.5 rounded bg-[#2A2E34] hover:bg-[#32373E] text-[#F4F4F2] text-[11px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText size={12} className="text-[#E9B95E]" />
                      <span>Open / Print PDF Template</span>
                    </a>
                    <button
                      onClick={() => {
                        const rawPhone = (lead.customer.phoneCountryCode || '+91') + lead.customer.phoneNumber;
                        const cleanPhone = rawPhone.replace(/\D/g, '');
                        const quoteRef = q.quotationNumber || q.quotationReference || q.id;
                        const quoteUrl = `${window.location.origin}/quotation/${quoteRef}`;
                        const totalFormatted = (q.totalAmountInr ?? q.finalPayableAmountInr ?? 0).toLocaleString('en-IN');
                        const text = encodeURIComponent(
                          `Namaste ${lead.customer.fullName} Ji 🙏\n\nGreetings from Varni Holidays Anand!\n\nHere is your official travel proposal & quotation for *${q.title || 'Your Journey'}*:\n\n📋 *Quotation Ref:* ${quoteRef}\n💰 *Total Investment:* ₹${totalFormatted} (All Taxes Included)\n📅 *Validity:* ${new Date(q.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n📄 *View & Print Official Quotation / PDF:* \n${quoteUrl}\n\nPlease review the itemized itinerary and inclusions. Feel free to reply here to confirm your reservations or ask any questions!\n\nWarm Regards,\n*Varni Holidays Anand*\n📞 +91 63570 50505\n🌐 317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Anand`
                        );
                        window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
                      }}
                      className="w-full py-1.5 px-2.5 rounded bg-[#25D366] hover:bg-[#20ba59] text-[#101113] text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <MessageSquare size={12} />
                      <span>Send Quotation via WhatsApp</span>
                    </button>
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
