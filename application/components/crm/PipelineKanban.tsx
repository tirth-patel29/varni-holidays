'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LeadRecord, CustomerRecord } from '@/lib/crm/types';
import { PipelineStageCode } from '@/lib/auth/types';
import {
  updateLeadStageAction,
  recordWhatsAppClickAction,
  logCallActivityAction,
} from '@/app/actions/crm';
import { useCrm } from './CrmContext';
import {
  MessageSquare,
  Phone,
  Calendar,
  Compass,
  Plane,
  Stamp,
  User,
  ArrowRight,
  Clock,
  X,
} from 'lucide-react';

interface LeadWithCustomer extends LeadRecord {
  customer: CustomerRecord;
  assigneeName?: string;
}

interface PipelineKanbanProps {
  leads: LeadWithCustomer[];
  onRefresh: () => void;
}

const STAGES: Array<{ code: PipelineStageCode; label: string; dotColor: string }> = [
  { code: 'REQUESTS', label: 'Requests', dotColor: 'bg-[#6FA9D8]' },
  { code: 'GENERAL', label: 'General', dotColor: 'bg-[#969CA5]' },
  { code: 'PRIORITY', label: 'Priority', dotColor: 'bg-[#E9B95E]' },
  { code: 'CONVERTED', label: 'Converted', dotColor: 'bg-[#55B98A]' },
  { code: 'CLOSED', label: 'Lost / Closed', dotColor: 'bg-[#666E79]' },
];

export default function PipelineKanban({ leads, onRefresh }: PipelineKanbanProps) {
  const { currentUser } = useCrm();

  const [callModalLead, setCallModalLead] = useState<LeadWithCustomer | null>(null);
  const [callDuration, setCallDuration] = useState('300');
  const [callOutcome, setCallOutcome] = useState<'CONNECTED' | 'BUSY' | 'UNANSWERED' | 'CALLBACK_REQUESTED'>('CONNECTED');
  const [callNotes, setCallNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Quick Stage Mover
  const handleStageChange = async (leadId: string, newStage: PipelineStageCode) => {
    setLoadingAction(true);
    await updateLeadStageAction(leadId, newStage, `Moved via Kanban by ${currentUser.fullName}`, currentUser.id);
    setLoadingAction(false);
    onRefresh();
  };

  // Strictly compliant WhatsApp Click-to-Chat trigger
  const handleWhatsAppClick = async (lead: LeadWithCustomer) => {
    const rawDigits = lead.customer.phoneNumber.replace(/\D/g, '');
    const cleanPhone = `${lead.customer.phoneCountryCode.replace('+', '')}${rawDigits}`;
    
    // Log click event first: strictly marked CLICK_TO_CHAT_TRIGGERED
    await recordWhatsAppClickAction(lead.id, `${lead.customer.phoneCountryCode} ${lead.customer.phoneNumber}`, currentUser.id);
    
    // Open WhatsApp Web
    const message = encodeURIComponent(
      `Hello ${lead.customer.fullName}, greetings from Varni Holidays Anand! I am ${currentUser.fullName}. Regarding your enquiry (${lead.referenceId}), how may I assist you today?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    onRefresh();
  };

  // Call Logger Submit
  const handleCallLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callModalLead) return;

    setLoadingAction(true);
    await logCallActivityAction(
      callModalLead.id,
      parseInt(callDuration, 10),
      callOutcome,
      callNotes || 'Phone consultation concluded.',
      currentUser.id
    );
    setLoadingAction(false);
    setCallModalLead(null);
    setCallNotes('');
    onRefresh();
  };

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-4 select-none crm-scrollbar">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage.code);

        return (
          <div
            key={stage.code}
            className="w-72 shrink-0 flex flex-col bg-[#17191D] rounded-lg p-3 border border-[#2A2E34]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-2.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                <h3 className="font-medium text-xs text-[#F4F4F2]">{stage.label}</h3>
              </div>
              <span className="text-[10px] font-mono text-[#969CA5] px-1.5 py-0.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                {stageLeads.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-0.5 crm-scrollbar">
              {stageLeads.length === 0 ? (
                <div className="p-6 text-center rounded-md border border-dashed border-[#2A2E34] text-xs text-[#666E79]">
                  No leads in {stage.label.toLowerCase()}
                </div>
              ) : (
                stageLeads.map((lead) => {
                  return (
                    <div
                      key={lead.id}
                      className="bg-[#1D2025] rounded-md p-3.5 border border-[#2A2E34] hover:border-[#383E47] transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Meta: Service & Priority */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#17191D] text-[#969CA5] border border-[#2A2E34]">
                            {lead.serviceType}
                          </span>

                          <span
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded uppercase ${
                              lead.priorityLevel === 'URGENT'
                                ? 'text-[#DF7373] bg-[#DF7373]/10 border border-[#DF7373]/20'
                                : lead.priorityLevel === 'HIGH'
                                ? 'text-[#E8B65E] bg-[#E8B65E]/10 border border-[#E8B65E]/20'
                                : 'text-[#969CA5] bg-[#17191D]'
                            }`}
                          >
                            {lead.priorityLevel}
                          </span>
                        </div>

                        {/* Customer Name */}
                        <Link
                          href={`/employee/leads/${lead.id}`}
                          className="text-xs font-semibold text-[#F4F4F2] hover:text-[#E9B95E] transition-colors block leading-tight truncate"
                        >
                          {lead.customer?.fullName}
                        </Link>
                        <span className="text-[10px] text-[#666E79] font-mono block mb-2">
                          {lead.referenceId}
                        </span>

                        {/* Destination / Service Summary */}
                        <div className="text-xs text-[#969CA5] mb-3 p-2 rounded bg-[#17191D] border border-[#2A2E34]/80 space-y-1">
                          {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                            <>
                              <div className="text-[#F4F4F2] font-medium text-[11px] truncate flex items-center gap-1.5">
                                <Compass size={12} className="text-[#E9B95E] shrink-0" />
                                {lead.packageDetail.packageName}
                              </div>
                              <div className="text-[10px] text-[#969CA5]">
                                {lead.packageDetail.adultsCount} Adults • {lead.packageDetail.hotelTier}
                              </div>
                              <div className="text-[11px] font-semibold text-[#55B98A] tabular-nums">
                                {lead.packageDetail.quotedTotalPriceInr
                                  ? `₹${(lead.packageDetail?.quotedTotalPriceInr ?? 0).toLocaleString('en-IN')}`
                                  : 'Custom Quote'}
                              </div>
                            </>
                          )}

                          {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                            <>
                              <div className="text-[#F4F4F2] font-medium text-[11px] truncate flex items-center gap-1.5">
                                <Plane size={12} className="text-[#6FA9D8] shrink-0" />
                                {lead.flightDetail.originAirport.split('-')[0]} ✈ {lead.flightDetail.destinationAirport.split('-')[0]}
                              </div>
                              <div className="text-[10px] text-[#969CA5]">
                                {lead.flightDetail.tripType} • {lead.flightDetail.adultsCount} Pax
                              </div>
                              <div className="text-[10px] text-[#666E79]">
                                Dep: {lead.flightDetail.departureDate}
                              </div>
                            </>
                          )}

                          {lead.serviceType === 'VISA' && lead.visaDetail && (
                            <>
                              <div className="text-[#F4F4F2] font-medium text-[11px] truncate flex items-center gap-1.5">
                                <Stamp size={12} className="text-[#55B98A] shrink-0" />
                                {lead.visaDetail.destinationCountry} Visa
                              </div>
                              <div className="text-[10px] text-[#969CA5]">
                                {lead.visaDetail.visaCategory} • {lead.visaDetail.applicantCount} Applicants
                              </div>
                            </>
                          )}
                        </div>

                        {/* Assignee & Dates */}
                        <div className="flex items-center justify-between text-[10px] text-[#666E79] mb-2.5">
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <User size={11} />
                            {lead.assigneeName || 'Unassigned'}
                          </span>
                          <span className="font-mono">
                            {new Date(lead.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-[#2A2E34] flex items-center justify-between gap-1.5">
                        {/* Quick Communication Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleWhatsAppClick(lead)}
                            title="Open WhatsApp Web"
                            className="p-1 rounded bg-[#17191D] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#55B98A] border border-[#2A2E34] transition-colors"
                          >
                            <MessageSquare size={13} />
                          </button>
                          <button
                            onClick={() => setCallModalLead(lead)}
                            title="Log Phone Call"
                            className="p-1 rounded bg-[#17191D] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#6FA9D8] border border-[#2A2E34] transition-colors"
                          >
                            <Phone size={13} />
                          </button>
                        </div>

                        {/* Stage Selector */}
                        <div className="flex-1 max-w-[110px]">
                          <select
                            value={lead.stage}
                            onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStageCode)}
                            disabled={loadingAction}
                            className="w-full text-[10px] bg-[#17191D] text-[#969CA5] hover:text-[#F4F4F2] rounded px-1.5 py-1 border border-[#2A2E34] focus:outline-none transition-colors cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.label}
                              </option>
                            ))}
                          </select>
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

      {/* Call Logger Modal */}
      {callModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] p-5 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F2]">Log Phone Consultation</h3>
                <p className="text-xs text-[#969CA5]">
                  Customer: {callModalLead.customer.fullName} ({callModalLead.referenceId})
                </p>
              </div>
              <button
                onClick={() => setCallModalLead(null)}
                className="text-[#969CA5] hover:text-[#F4F4F2] p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCallLogSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#969CA5] mb-1">Call Duration (seconds)</label>
                <input
                  type="number"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                  className="w-full text-xs bg-[#1D2025] text-[#F4F4F2] rounded-md px-3 py-2 border border-[#2A2E34] focus:outline-none focus:border-[#E9B95E]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-[#969CA5] mb-1">Call Outcome</label>
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value as any)}
                  className="w-full text-xs bg-[#1D2025] text-[#F4F4F2] rounded-md px-3 py-2 border border-[#2A2E34] focus:outline-none focus:border-[#E9B95E]"
                >
                  <option value="CONNECTED">Connected & Discussed</option>
                  <option value="CALLBACK_REQUESTED">Callback Requested</option>
                  <option value="BUSY">Line Busy / Rejected</option>
                  <option value="UNANSWERED">Unanswered / Switched Off</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#969CA5] mb-1">Discussion Notes</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  rows={3}
                  placeholder="Record key passenger preferences, budget, departure expectations..."
                  className="w-full text-xs bg-[#1D2025] text-[#F4F4F2] rounded-md px-3 py-2 border border-[#2A2E34] focus:outline-none focus:border-[#E9B95E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E34]">
                <button
                  type="button"
                  onClick={() => setCallModalLead(null)}
                  className="px-3 py-1.5 text-xs text-[#969CA5] hover:text-[#F4F4F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#E9B95E] text-[#101113] hover:bg-[#F0C878] transition-colors"
                >
                  {loadingAction ? 'Saving...' : 'Save Activity Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
