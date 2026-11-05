'use client';

import React from 'react';
import Link from 'next/link';
import { LeadRecord, CustomerRecord } from '@/lib/crm/types';
import { PipelineStageCode } from '@/lib/auth/types';
import { updateLeadStageAction, recordWhatsAppClickAction } from '@/app/actions/crm';
import { useCrm } from './CrmContext';
import { MessageSquare, ArrowUpRight } from 'lucide-react';

interface LeadWithCustomer extends LeadRecord {
  customer: CustomerRecord;
  assigneeName?: string;
}

interface LeadTableViewProps {
  leads: LeadWithCustomer[];
  onRefresh: () => void;
}

const STAGES: Array<{ code: PipelineStageCode; label: string }> = [
  { code: 'REQUESTS', label: 'Requests' },
  { code: 'GENERAL', label: 'General' },
  { code: 'PRIORITY', label: 'Priority' },
  { code: 'CONVERTED', label: 'Converted' },
  { code: 'CLOSED', label: 'Closed' },
];

export default function LeadTableView({ leads, onRefresh }: LeadTableViewProps) {
  const { currentUser } = useCrm();

  const handleStageChange = async (leadId: string, newStage: PipelineStageCode) => {
    await updateLeadStageAction(leadId, newStage, `Stage updated from table by ${currentUser.fullName}`, currentUser.id);
    onRefresh();
  };

  const handleWhatsApp = async (lead: LeadWithCustomer) => {
    const rawDigits = lead.customer.phoneNumber.replace(/\D/g, '');
    const cleanPhone = `${lead.customer.phoneCountryCode.replace('+', '')}${rawDigits}`;
    await recordWhatsAppClickAction(lead.id, `${lead.customer.phoneCountryCode} ${lead.customer.phoneNumber}`, currentUser.id);
    window.open(`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(lead.customer.fullName)}%2C%20regarding%20your%20Varni%20Holidays%20enquiry%20${lead.referenceId}`, '_blank');
    onRefresh();
  };

  return (
    <div className="bg-[#17191D] rounded-lg overflow-hidden border border-[#2A2E34]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#101113] text-[#666E79] uppercase text-[10px] font-medium tracking-wider border-b border-[#2A2E34]">
            <tr>
              <th className="px-4 py-3">Reference ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Details / Route</th>
              <th className="px-4 py-3">Quoted Amount</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2329] text-[#969CA5]">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#666E79]">
                  No matching customer enquiries found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#1D2025]/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-[#F4F4F2] whitespace-nowrap">
                    <Link href={`/employee/leads/${lead.referenceId || lead.id}`} className="hover:text-[#E9B95E] transition-colors">
                      {lead.referenceId}
                    </Link>
                    <span className="block text-[10px] text-[#666E79] font-sans">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-[#F4F4F2]">{lead.customer.fullName}</div>
                    <div className="text-[11px] text-[#666E79] font-mono">
                      {lead.customer.phoneCountryCode} {lead.customer.phoneNumber}
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-block text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-[#1D2025] text-[#969CA5] border border-[#2A2E34]">
                      {lead.serviceType}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-xs truncate text-[#F4F4F2]">
                    {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                      <span className="truncate block font-medium">
                        {lead.packageDetail.packageName} ({lead.packageDetail.duration || '6N/7D'} • {lead.packageDetail.adultsCount} Pax)
                      </span>
                    )}
                    {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                      <span className="truncate block font-medium flex items-center gap-1.5">
                        <span>{lead.flightDetail.originAirport.split('-')[0]} ✈ {lead.flightDetail.destinationAirport.split('-')[0]} ({lead.flightDetail.tripType})</span>
                        {lead.flightDetail.mealPreferenceCode && lead.flightDetail.mealPreferenceCode !== 'NO_PREFERENCE' && (
                          <span className="px-1 bg-[#E9B95E]/20 text-[#E9B95E] rounded text-[9px] font-bold">
                            {lead.flightDetail.mealPreferenceCode}
                          </span>
                        )}
                        {lead.flightDetail.wheelchairAssistanceCode && lead.flightDetail.wheelchairAssistanceCode !== 'NO_ASSISTANCE' && (
                          <span className="px-1 bg-red-950/60 text-red-400 rounded text-[9px] font-bold">
                            ♿ {lead.flightDetail.wheelchairAssistanceCode}
                          </span>
                        )}
                      </span>
                    )}
                    {lead.serviceType === 'VISA' && lead.visaDetail && (
                      <span className="truncate block font-medium flex items-center gap-1.5">
                        <span>
                          {lead.visaDetail.destinationCountry === 'OTHER' || lead.visaDetail.destinationCountry === 'Other'
                            ? (lead.visaDetail.otherCountryName || 'Other Country')
                            : lead.visaDetail.destinationCountry} Visa ({lead.visaDetail.visaCategory})
                        </span>
                        {lead.visaDetail.visaType && (
                          <span className="px-1.5 py-0.5 bg-[#24689B]/20 text-[#60A5FA] border border-[#24689B]/30 rounded text-[9px] font-medium">
                            {lead.visaDetail.visaType}
                          </span>
                        )}
                      </span>
                    )}
                    {lead.serviceType === 'TRAVEL_INSURANCE' && (
                      <span className="truncate block font-medium flex items-center gap-1.5">
                        <span>🛡️ {lead.insuranceDetail?.destinationCountry || 'International'} Travel Insurance</span>
                        {lead.insuranceDetail?.hasPreExistingDisease && (
                          <span className="px-1.5 py-0.2 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded text-[9px] font-bold">
                            PED
                          </span>
                        )}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap font-mono tabular-nums">
                    {lead.serviceType === 'PACKAGE' && lead.packageDetail?.quotedTotalPriceInr ? (
                      <span className="font-semibold text-[#55B98A]">
                        ₹{(lead.packageDetail?.quotedTotalPriceInr ?? 0).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-[#666E79]">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        lead.priorityLevel === 'URGENT'
                          ? 'text-[#DF7373] bg-[#DF7373]/10 border border-[#DF7373]/20'
                          : lead.priorityLevel === 'HIGH'
                          ? 'text-[#E8B65E] bg-[#E8B65E]/10 border border-[#E8B65E]/20'
                          : 'text-[#969CA5] bg-[#1D2025]'
                      }`}
                    >
                      {lead.priorityLevel}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={lead.stage}
                      onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStageCode)}
                      className="text-[11px] bg-[#1D2025] text-[#F4F4F2] rounded px-2 py-1 border border-[#2A2E34] focus:outline-none cursor-pointer"
                    >
                      {STAGES.map((s) => (
                        <option key={s.code} value={s.code} className="bg-[#17191D]">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-[#969CA5]">
                    {lead.assigneeName || 'Unassigned'}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleWhatsApp(lead)}
                        title="Contact on WhatsApp"
                        className="p-1 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#55B98A] border border-[#2A2E34] transition-colors"
                      >
                        <MessageSquare size={13} />
                      </button>
                      <Link
                        href={`/employee/leads/${lead.referenceId || lead.id}`}
                        className="p-1 rounded bg-[#1D2025] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#E9B95E] border border-[#2A2E34] transition-colors"
                        title="Review Details"
                      >
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
