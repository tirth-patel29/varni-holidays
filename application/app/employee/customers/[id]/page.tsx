'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CrmHeader from '@/components/crm/CrmHeader';
import { getCustomerByIdAction, getLeadsAction } from '@/app/actions/crm';
import { getCustomerTimelineAction, sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  MessageSquare,
  FileText,
  BookmarkCheck,
  Send,
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  Compass,
  Plane,
  Stamp,
  ExternalLink,
} from 'lucide-react';

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
      <div className="flex-1 flex items-center justify-center p-20 text-[#969CA5] bg-[#101113]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#E9B95E] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading 360 Customer Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title={customer.fullName}
        subtitle={`Customer Identity: ${customer.id} • Registered ${new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/employee/customers"
              className="px-3 py-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] border border-[#2A2E34] text-xs font-medium text-[#F4F4F2] inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>All Customers</span>
            </Link>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-3.5 py-1.5 rounded-md bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Send size={14} />
              <span>Send Message</span>
            </button>
          </div>
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        {actionMsg && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              actionMsg.type === 'success'
                ? 'bg-[#55B98A]/10 border-[#55B98A]/30 text-[#55B98A]'
                : 'bg-[#DF7373]/10 border-[#DF7373]/30 text-[#DF7373]'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-[#969CA5] hover:text-[#F4F4F2]">
              <X size={14} />
            </button>
          </div>
        )}

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (4 cols): Profile Overview & Contact Info */}
          <div className="lg:col-span-4 space-y-5">
            {/* Customer Details Card */}
            <div className="bg-[#17191D] rounded-lg p-4 border border-[#2A2E34] space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#2A2E34]">
                <div className="w-10 h-10 rounded-md bg-[#1D2025] border border-[#2A2E34] flex items-center justify-center text-[#E9B95E] font-bold text-sm shrink-0">
                  {customer.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#F4F4F2] truncate">{customer.fullName}</h2>
                  <p className="text-[10px] text-[#666E79] font-mono">{customer.id}</p>
                </div>
              </div>

              {customer.duplicateWarning && (
                <div className="p-2.5 rounded bg-[#E8B65E]/10 border border-[#E8B65E]/20 text-[#E8B65E] text-xs">
                  <div className="flex items-center gap-1.5 font-medium mb-0.5">
                    <AlertTriangle size={13} />
                    <span>Potential Duplicate Account</span>
                  </div>
                  <p className="text-[11px] text-[#969CA5]">{customer.duplicateNotes}</p>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[#666E79] block">Phone (Normalized)</span>
                  <span className="font-mono text-[#F4F4F2]">
                    {customer.phoneCountryCode} {customer.phoneNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#666E79] block">Email</span>
                  <span className="text-[#969CA5]">{customer.email || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#666E79] block">Location</span>
                  <span className="text-[#969CA5]">{customer.city || 'Gujarat, India'}</span>
                </div>
              </div>
            </div>

            {/* Lifetime Stats */}
            <div className="bg-[#17191D] rounded-lg p-4 border border-[#2A2E34] space-y-3">
              <h3 className="text-xs font-medium text-[#F4F4F2] pb-2 border-b border-[#2A2E34]">
                Relationship Summary
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                  <span className="text-[10px] uppercase text-[#666E79] block">Enquiries</span>
                  <span className="text-lg font-semibold text-[#F4F4F2] tabular-nums">
                    {customerLeads.length}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#1D2025] border border-[#2A2E34]">
                  <span className="text-[10px] uppercase text-[#666E79] block">Timeline Events</span>
                  <span className="text-lg font-semibold text-[#55B98A] tabular-nums">
                    {timeline.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols): Interactive Timeline & Enquiries */}
          <div className="lg:col-span-8 space-y-5">
            {/* Tabs */}
            <div className="bg-[#17191D] rounded-lg p-1.5 border border-[#2A2E34] flex items-center gap-2">
              <button
                onClick={() => setActiveTab('TIMELINE')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'TIMELINE'
                    ? 'bg-[#1D2025] text-[#F4F4F2] border border-[#2A2E34]'
                    : 'text-[#969CA5] hover:text-[#F4F4F2]'
                }`}
              >
                Journey Timeline ({timeline.length})
              </button>
              <button
                onClick={() => setActiveTab('LEADS')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'LEADS'
                    ? 'bg-[#1D2025] text-[#F4F4F2] border border-[#2A2E34]'
                    : 'text-[#969CA5] hover:text-[#F4F4F2]'
                }`}
              >
                Enquiries & Leads ({customerLeads.length})
              </button>
            </div>

            {/* Active Tab Content */}
            {activeTab === 'TIMELINE' && (
              <div className="bg-[#17191D] rounded-lg p-5 border border-[#2A2E34]">
                <h3 className="text-sm font-semibold text-[#F4F4F2] mb-1">Chronological 360 Customer Journey</h3>
                <p className="text-xs text-[#969CA5] mb-5">
                  Aggregated omni-channel interactions, quotations, bookings, calls, emails, and payments
                </p>

                <div className="space-y-4">
                  {timeline.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#E9B95E] mt-1 shrink-0" />
                      <div className="min-w-0 flex-1 p-3 rounded-md bg-[#1D2025] border border-[#2A2E34]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-[#F4F4F2]">{item.title}</span>
                          <span className="text-[10px] text-[#666E79] font-mono">
                            {new Date(item.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#969CA5] mt-1">{item.description}</p>
                        <span className="text-[10px] text-[#666E79] block mt-1">By {item.actor}</span>
                      </div>
                    </div>
                  ))}

                  {timeline.length === 0 && (
                    <p className="text-xs text-[#666E79] py-8 text-center">No timeline history recorded.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'LEADS' && (
              <div className="bg-[#17191D] rounded-lg p-5 border border-[#2A2E34]">
                <h3 className="text-sm font-semibold text-[#F4F4F2] mb-1">Customer Travel Enquiries</h3>
                <p className="text-xs text-[#969CA5] mb-4">Historical and active leads submitted by this traveler</p>

                <div className="space-y-3">
                  {customerLeads.map((l) => (
                    <div key={l.id} className="p-3.5 rounded-md bg-[#1D2025] border border-[#2A2E34] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#F4F4F2] font-mono">{l.referenceId}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#17191D] text-[#969CA5] border border-[#2A2E34]">
                            {l.serviceType}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#17191D] text-[#F4F4F2] border border-[#2A2E34]">
                            {l.stage}
                          </span>
                        </div>
                        <p className="text-xs text-[#969CA5] mt-1">
                          {l.serviceType === 'PACKAGE' && l.packageDetail?.packageName}
                          {l.serviceType === 'FLIGHT' && `${l.flightDetail?.originAirport} → ${l.flightDetail?.destinationAirport}`}
                          {l.serviceType === 'VISA' && `${l.visaDetail?.destinationCountry} Visa`}
                        </p>
                      </div>

                      <Link
                        href={`/employee/leads/${l.id}`}
                        className="text-xs text-[#E9B95E] hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Lead</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  ))}

                  {customerLeads.length === 0 && (
                    <p className="text-xs text-[#666E79] py-6 text-center">No active travel enquiries found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Advisory Message Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] p-5 w-full max-w-lg space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34]">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F2]">Send Advisory to {customer.fullName}</h3>
                <p className="text-xs text-[#969CA5]">Direct outbound notification via Resend or WhatsApp</p>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="text-[#969CA5] hover:text-[#F4F4F2]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendUpdate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  >
                    <option value="EMAIL">Email (Resend API)</option>
                    <option value="WHATSAPP">WhatsApp (Click-to-Chat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Template Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                  >
                    <option value="CUSTOM_MESSAGE">Custom Advisory</option>
                    <option value="ITINERARY_UPDATE">Itinerary Update</option>
                    <option value="VOUCHER_ISSUANCE">Voucher Issuance</option>
                    <option value="PAYMENT_RECEIPT">Payment Receipt</option>
                  </select>
                </div>
              </div>

              {channel === 'EMAIL' && (
                <div>
                  <label className="block text-[10px] text-[#666E79] uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject for customer..."
                    className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-[#666E79] uppercase mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type advisory or itinerary update..."
                  className="w-full p-2 rounded bg-[#1D2025] border border-[#2A2E34] text-xs text-[#F4F4F2] focus:outline-none focus:border-[#E9B95E]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E34]">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-3 py-1.5 text-xs text-[#969CA5] hover:text-[#F4F4F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#E9B95E] text-[#101113] hover:bg-[#F0C878] transition-colors"
                >
                  {sending ? 'Dispatching...' : 'Dispatch Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
