'use client';

import React from 'react';
import Link from 'next/link';
import { LeadRecord, CustomerRecord } from '@/lib/crm/types';
import { PipelineStageCode, PriorityLevelCode } from '@/lib/auth/types';
import { updateLeadStageAction, recordWhatsAppClickAction } from '@/app/actions/crm';
import { useCrm } from './CrmContext';

interface LeadWithCustomer extends LeadRecord {
  customer: CustomerRecord;
  assigneeName?: string;
}

interface LeadTableViewProps {
  leads: LeadWithCustomer[];
  onRefresh: () => void;
}

export default function LeadTableView({ leads, onRefresh }: LeadTableViewProps) {
  const { currentUser } = useCrm();

  const handleStageChange = async (leadId: string, newStage: PipelineStageCode) => {
    await updateLeadStageAction(leadId, newStage, `Stage updated from table view by ${currentUser.fullName}`, currentUser.id);
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
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-5 py-4">Reference ID</th>
              <th className="px-4 py-4">Customer</th>
              <th className="px-4 py-4">Service</th>
              <th className="px-4 py-4">Summary / Requirements</th>
              <th className="px-4 py-4">Quoted Amount</th>
              <th className="px-4 py-4">Stage</th>
              <th className="px-4 py-4">Priority</th>
              <th className="px-4 py-4">Assignee</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No matching enquiries found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <Link href={`/employee/leads/${lead.id}`} className="hover:text-blue-600 transition-colors">
                      {lead.referenceId}
                    </Link>
                    <span className="block text-[10px] text-slate-400 font-sans mt-0.5 font-medium">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{lead.customer.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono font-medium">
                      {lead.customer.phoneCountryCode} {lead.customer.phoneNumber}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md ${
                        lead.serviceType === 'PACKAGE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : lead.serviceType === 'FLIGHT'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {lead.serviceType}
                    </span>
                  </td>

                  <td className="px-4 py-4 max-w-xs">
                    {lead.serviceType === 'PACKAGE' && lead.packageDetail && (
                      <span className="truncate block font-medium text-slate-800">
                        {lead.packageDetail.packageName} ({lead.packageDetail.adultsCount} Pax, {lead.packageDetail.hotelTier})
                      </span>
                    )}
                    {lead.serviceType === 'FLIGHT' && lead.flightDetail && (
                      <span className="truncate block font-medium text-slate-800">
                        {lead.flightDetail.originAirport.split('-')[0]} ✈ {lead.flightDetail.destinationAirport.split('-')[0]} ({lead.flightDetail.tripType})
                      </span>
                    )}
                    {lead.serviceType === 'VISA' && lead.visaDetail && (
                      <span className="truncate block font-medium text-slate-800">
                        {lead.visaDetail.destinationCountry} ({lead.visaDetail.visaCategory} Visa)
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap font-serif font-bold text-emerald-700">
                    {lead.packageDetail?.quotedTotalPriceInr
                      ? `₹${lead.packageDetail.quotedTotalPriceInr.toLocaleString('en-IN')}`
                      : lead.serviceType === 'PACKAGE'
                      ? 'Custom Quote'
                      : '—'}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={lead.stage}
                      onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStageCode)}
                      className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border focus:outline-none ${
                        lead.stage === 'CONVERTED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : lead.stage === 'PRIORITY'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : lead.stage === 'REQUESTS'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="REQUESTS">REQUESTS</option>
                      <option value="GENERAL">GENERAL</option>
                      <option value="PRIORITY">PRIORITY</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        lead.priorityLevel === 'URGENT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : lead.priorityLevel === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {lead.priorityLevel}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium">
                    {lead.assigneeName}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => handleWhatsApp(lead)}
                      title="Launch WhatsApp Web (Click-to-chat logged)"
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors inline-flex items-center justify-center font-bold"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </button>
                    <Link
                      href={`/employee/leads/${lead.id}`}
                      className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors inline-flex items-center justify-center font-bold"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
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
