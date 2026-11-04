'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LeadRecord, CustomerRecord } from '@/lib/crm/types';
import { PipelineStageCode, PriorityLevelCode } from '@/lib/auth/types';
import {
  updateLeadStageAction,
  assignLeadAction,
  updateLeadPriorityAction,
  recordWhatsAppClickAction,
  logCallActivityAction,
} from '@/app/actions/crm';
import { useCrm } from './CrmContext';

interface LeadWithCustomer extends LeadRecord {
  customer: CustomerRecord;
  assigneeName?: string;
}

interface PipelineKanbanProps {
  leads: LeadWithCustomer[];
  onRefresh: () => void;
}

const STAGES: Array<{ code: PipelineStageCode; label: string; dotColor: string; badgeBg: string }> = [
  { code: 'REQUESTS', label: 'Fresh Requests', dotColor: 'bg-sky-500', badgeBg: 'bg-sky-50 text-sky-700 border border-sky-200' },
  { code: 'GENERAL', label: 'General Discussions', dotColor: 'bg-amber-500', badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200' },
  { code: 'PRIORITY', label: 'Priority / High Intent', dotColor: 'bg-indigo-600', badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  { code: 'CONVERTED', label: 'Converted to Booking', dotColor: 'bg-emerald-600', badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  { code: 'CLOSED', label: 'Closed / Lost', dotColor: 'bg-slate-400', badgeBg: 'bg-slate-100 text-slate-700 border border-slate-200' },
];

export default function PipelineKanban({ leads, onRefresh }: PipelineKanbanProps) {
  const { currentUser, allUsers, hasServiceAccess } = useCrm();

  const [callModalLead, setCallModalLead] = useState<LeadWithCustomer | null>(null);
  const [callDuration, setCallDuration] = useState('300');
  const [callOutcome, setCallOutcome] = useState<'CONNECTED' | 'BUSY' | 'UNANSWERED' | 'CALLBACK_REQUESTED'>('CONNECTED');
  const [callNotes, setCallNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Quick Stage Mover
  const handleStageChange = async (leadId: string, newStage: PipelineStageCode) => {
    setLoadingAction(true);
    await updateLeadStageAction(leadId, newStage, `Moved from Kanban board by ${currentUser.fullName}`, currentUser.id);
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
      callNotes || 'Phone call concluded.',
      currentUser.id
    );
    setLoadingAction(false);
    setCallModalLead(null);
    setCallNotes('');
    onRefresh();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 select-none">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage.code);

        return (
          <div key={stage.code} className="w-80 shrink-0 flex flex-col bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80">
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor} shadow-xs`} />
                <h3 className="font-sans font-bold text-sm text-slate-800">{stage.label}</h3>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.badgeBg}`}>
                {stageLeads.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
              {stageLeads.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 text-xs font-medium text-slate-400 bg-white/50">
                  No leads in {stage.label.toLowerCase()}
                </div>
              ) : (
                stageLeads.map((lead) => {
                  return (
                    <div
                      key={lead.id}
                      className="bg-white rounded-xl p-4 transition-all hover:shadow-md border border-slate-200 flex flex-col justify-between group shadow-xs"
                    >
                      <div>
                        {/* Top Meta Row: Service + Priority + Ref */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              lead.serviceType === 'PACKAGE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : lead.serviceType === 'FLIGHT'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {lead.serviceType}
                          </span>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              lead.priorityLevel === 'URGENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : lead.priorityLevel === 'HIGH'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {lead.priorityLevel}
                          </span>
                        </div>

                        {/* Customer Name & Link */}
                        <Link
                          href={`/employee/leads/${lead.id}`}
                          className="font-serif text-base font-bold text-slate-900 hover:text-blue-600 block leading-tight truncate transition-colors"
                        >
                          {lead.customer.fullName}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono font-medium block mb-2">
                          {lead.referenceId}
                        </span>

                        {/* Service Summary Content */}
                        <div className="text-xs text-slate-700 mb-3 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                            <>
                              <div className="font-bold text-slate-900 line-clamp-1">
                                {lead.packageDetail.packageName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {lead.packageDetail.adultsCount} Adults • {lead.packageDetail.hotelTier}
                              </div>
                              <div className="font-bold text-emerald-700 text-xs">
                                {lead.packageDetail.quotedTotalPriceInr
                                  ? `₹${lead.packageDetail.quotedTotalPriceInr.toLocaleString('en-IN')}`
                                  : 'Custom Quote Required'}
                              </div>
                            </>
                          )}

                          {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                            <>
                              <div className="font-bold text-slate-900 line-clamp-1">
                                {lead.flightDetail.originAirport.split('-')[0]} ✈ {lead.flightDetail.destinationAirport.split('-')[0]}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {lead.flightDetail.tripType} • {lead.flightDetail.adultsCount} Adults ({lead.flightDetail.cabinClass})
                              </div>
                              <div className="text-[11px] text-slate-500 font-semibold">
                                Dep: {lead.flightDetail.departureDate}
                              </div>
                            </>
                          )}

                          {lead.serviceType === 'VISA' && lead.visaDetail && (
                            <>
                              <div className="font-bold text-slate-900 line-clamp-1">
                                {lead.visaDetail.destinationCountry}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {lead.visaDetail.visaCategory} • {lead.visaDetail.applicantCount} Applicants
                              </div>
                            </>
                          )}
                        </div>

                        {/* Assignee & Location */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-amber-500">person</span>
                            <span className="font-bold text-slate-700 truncate max-w-[110px]">{lead.assigneeName}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        {/* Quick WhatsApp (Click-to-chat) */}
                        <button
                          type="button"
                          onClick={() => handleWhatsAppClick(lead)}
                          title="Launch WhatsApp Web (Strict Click-to-Chat Logged)"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center font-bold shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                        </button>

                        {/* Quick Phone Call Log */}
                        <button
                          type="button"
                          onClick={() => setCallModalLead(lead)}
                          title="Log Phone Call"
                          className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors flex items-center justify-center font-bold shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">call</span>
                        </button>

                        {/* Move Stage Selector */}
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStageCode)}
                          disabled={loadingAction}
                          className="text-[10px] bg-slate-50 rounded-lg px-2 py-1 text-slate-700 font-bold border border-slate-200 hover:border-slate-400 focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.code} value={s.code}>
                              Move: {s.label.split(' ')[0]}
                            </option>
                          ))}
                        </select>

                        {/* View Details Link */}
                        <Link
                          href={`/employee/leads/${lead.id}`}
                          className="p-2 rounded-xl bg-[#153650] text-white hover:bg-[#24689B] transition-colors flex items-center justify-center shadow-sm"
                          title="Open Full Lead Dossier"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </Link>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E9B95E]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-[#C29033] uppercase tracking-wider">Log Call Activity</span>
                <h3 className="font-serif text-xl font-bold text-[#153650]">{callModalLead.customer.fullName}</h3>
                <p className="text-xs text-slate-600 font-mono font-semibold">{callModalLead.referenceId}</p>
              </div>
              <button
                onClick={() => setCallModalLead(null)}
                className="text-slate-500 hover:text-slate-800 p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCallLogSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#153650] uppercase mb-1">Call Outcome</label>
                <select
                  value={callOutcome}
                  onChange={(e: any) => setCallOutcome(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-white text-xs font-bold text-slate-800"
                >
                  <option value="CONNECTED">Connected & Spoke with Customer</option>
                  <option value="BUSY">Line Busy</option>
                  <option value="UNANSWERED">Ringing / Unanswered</option>
                  <option value="CALLBACK_REQUESTED">Customer Requested Callback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153650] uppercase mb-1">Duration (Seconds)</label>
                <input
                  type="number"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-white text-xs font-semibold text-slate-800"
                  placeholder="e.g., 300 for 5 minutes"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153650] uppercase mb-1">Discussion Summary & Next Steps</label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Key topics discussed, budget preferences, special flight or hotel requirements..."
                  className="w-full p-2.5 rounded-xl border border-[#E3DCCB] bg-white text-xs text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCallModalLead(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-[#E3DCCB] hover:bg-[#D4CCB6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#153650] hover:bg-[#0B1E2E] transition-colors shadow-md"
                >
                  Save Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
