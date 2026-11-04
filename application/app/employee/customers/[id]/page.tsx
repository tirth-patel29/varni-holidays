'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CrmHeader from '@/components/crm/CrmHeader';
import { getCustomerByIdAction, getLeadsAction } from '@/app/actions/crm';
import { getCustomerTimelineAction, sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useCrm();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [customerLeads, setCustomerLeads] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'LEADS'>('TIMELINE');

  // Fast Update Composer State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [category, setCategory] = useState<any>('CUSTOM_MESSAGE');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [cust, leads, tl] = await Promise.all([
      getCustomerByIdAction(customerId),
      getLeadsAction(),
      getCustomerTimelineAction(customerId),
    ]);

    if (!cust) {
      router.push('/employee/customers');
      return;
    }

    setCustomer(cust);
    setCustomerLeads((leads || []).filter((l: any) => l.customerId === customerId));
    setTimeline(tl.timeline || []);
    setLoading(false);
  };

  useEffect(() => {
    if (customerId) loadData();
  }, [customerId]);

  const handleSendUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !content) return;

    setSending(true);
    const recipientContact = channel === 'EMAIL' ? customer.email : `${customer.phoneCountryCode || '+91'}${customer.phoneNumber}`;

    const res = await sendCustomerUpdateAction({
      customerId: customer.id,
      senderUserId: currentUser.id,
      senderUserName: currentUser.fullName,
      channel,
      category,
      templateTitle: `Customer Advisory: ${customer.fullName}`,
      subject: channel === 'EMAIL' ? (subject || `Update from Varni Holidays - ${customer.fullName}`) : undefined,
      content,
      recipientContact,
    });
    setSending(false);

    if (res.success) {
      setShowUpdateModal(false);
      setContent('');
      if (res.clickToChatUrl) {
        window.open(res.clickToChatUrl, '_blank');
      }
      setActionMsg({ text: `Message dispatched via ${channel}! (Status: ${res.deliveryStatus})`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to dispatch message', type: 'error' });
    }
  };

  if (loading || !customer) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-slate-800 bg-slate-50 min-h-screen">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-sm text-slate-600">Loading Customer 360 Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900 font-sans">
      <CrmHeader
        title={customer.fullName}
        subtitle={`Customer 360 Record • Registered ${new Date(customer.createdAt).toLocaleDateString('en-IN')}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              <span>Send Message</span>
            </button>
            <Link
              href="/employee/customers"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Directory</span>
            </Link>
          </div>
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {actionMsg && (
          <div className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-slate-500 hover:text-slate-800">×</button>
          </div>
        )}

        {/* Duplicate Warning */}
        {customer.duplicateWarning && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-700 text-2xl">warning</span>
              <div>
                <h4 className="font-bold text-amber-950 text-xs">Potential Duplicate Profile Detected</h4>
                <p className="text-[11px] text-amber-900 font-medium">{customer.duplicateNotes}</p>
              </div>
            </div>
            <Link
              href="/admin/deduplication"
              className="px-3 py-1.5 rounded-lg bg-amber-800 text-white font-bold text-xs shadow-xs hover:bg-amber-900 transition-colors whitespace-nowrap"
            >
              Deduplication Center
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Identity Snapshot */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-slate-900 flex items-center justify-center font-serif text-2xl font-bold border border-amber-400/30">
                {customer.fullName.charAt(0)}
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">{customer.fullName}</h3>
                <span className="text-xs text-slate-500 font-semibold">{customer.city || 'Anand, Gujarat'}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Normalized Phone (E.164)</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{customer.normalizedPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
                  <span className="text-slate-700 font-medium">{customer.email || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Inquiries</span>
                  <span className="font-bold text-slate-800">{customerLeads.length} Registered Leads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer 360 Tabs */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Tab Header */}
              <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100">
                <button
                  onClick={() => setActiveTab('TIMELINE')}
                  className={`pb-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'TIMELINE'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Customer 360 Journey Timeline ({timeline.length})
                </button>
                <button
                  onClick={() => setActiveTab('LEADS')}
                  className={`pb-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'LEADS'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active & Historical Leads ({customerLeads.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'TIMELINE' ? (
                  timeline.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No interactions recorded in the timeline yet.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {timeline.map((event) => {
                        let dotColor = 'bg-slate-400';
                        if (event.type === 'BOOKING') dotColor = 'bg-emerald-500';
                        else if (event.type === 'PAYMENT') dotColor = 'bg-emerald-600';
                        else if (event.type === 'QUOTATION') dotColor = 'bg-indigo-500';
                        else if (event.type === 'SERVICE') dotColor = 'bg-purple-500';
                        else if (event.type === 'COMMUNICATION') dotColor = 'bg-teal-500';
                        else if (event.type === 'LEAD') dotColor = 'bg-sky-500';
                        else if (event.type === 'ACTIVITY') dotColor = 'bg-amber-500';

                        return (
                          <div key={event.id} className="relative group">
                            {/* Marker */}
                            <span className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ${dotColor} ring-4 ring-white`} />

                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                    {event.type}
                                  </span>
                                  <h4 className="font-bold text-xs text-slate-900">{event.title}</h4>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(event.timestamp).toLocaleString('en-IN')}
                                </span>
                              </div>

                              {event.subtitle && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {event.subtitle}
                                </p>
                              )}

                              {event.actor && (
                                <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                                  Handled by: {event.actor}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    {customerLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{lead.referenceId}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                              {lead.serviceType}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium">
                            {lead.serviceType === 'PACKAGE' && lead.packageDetail?.packageName}
                            {lead.serviceType === 'FLIGHT' && `${lead.flightDetail?.originAirport} ✈ ${lead.flightDetail?.destinationAirport}`}
                            {lead.serviceType === 'VISA' && `${lead.visaDetail?.destinationCountry} (${lead.visaDetail?.visaCategory})`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                            {lead.stage}
                          </span>
                          <Link
                            href={`/employee/leads/${lead.id}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                          >
                            Open Lead
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Message Composer Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Send Customer Update</h3>
                <p className="text-xs text-slate-500">Dispatch message to {customer.fullName}</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendUpdate} className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('EMAIL')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    channel === 'EMAIL'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Resend Email
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('WHATSAPP')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    channel === 'WHATSAPP'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  WhatsApp Business
                </button>
              </div>

              {channel === 'EMAIL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Travel Advisory from Varni Holidays"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs disabled:opacity-50"
                >
                  {sending ? 'Dispatching...' : `Send via ${channel}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
