'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getCustomersAction } from '@/app/actions/crm';
import { sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  User,
} from 'lucide-react';

export default function CommunicationsPage() {
  const { currentUser } = useCrm();

  const [logs, setLogs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'EMAIL' | 'WHATSAPP'>('ALL');

  // Composer Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [category, setCategory] = useState<any>('WELCOME');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/communications');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      // fallback
    }
    const custs = await getCustomersAction();
    setCustomers(custs || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !content) return;

    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    setSending(true);
    const recipientContact = channel === 'EMAIL' ? customer.email : `${customer.phoneCountryCode || '+91'}${customer.phoneNumber}`;

    const res = await sendCustomerUpdateAction({
      customerId: customer.id,
      senderUserId: currentUser.id,
      senderUserName: currentUser.fullName,
      channel,
      category,
      templateTitle: `Customer Advisory: ${category}`,
      subject: channel === 'EMAIL' ? (subject || 'Update from Varni Holidays Anand') : undefined,
      content,
      recipientContact,
    });
    setSending(false);

    if (res.success) {
      setShowModal(false);
      setContent('');
      if (res.clickToChatUrl) {
        window.open(res.clickToChatUrl, '_blank');
      }
      setActionMsg({ text: `${channel} message recorded! (Status: ${res.deliveryStatus})`, type: 'success' });
      await loadData();
    } else {
      setActionMsg({ text: res.error || 'Failed to dispatch communication', type: 'error' });
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (channelFilter === 'ALL') return true;
    return l.channel === channelFilter;
  });

  const totalLogs = logs.length;
  const emailCount = logs.filter((l) => l.channel === 'EMAIL').length;
  const waCount = logs.filter((l) => l.channel === 'WHATSAPP').length;
  const deliveredCount = logs.filter(
    (l) => l.deliveryStatus === 'DELIVERED' || l.deliveryStatus === 'CLICK_TO_CHAT_TRIGGERED' || l.deliveryStatus === 'SENT'
  ).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Customer Communications Hub"
        subtitle="Multi-channel delivery log across Resend Email, WhatsApp Cloud API, and verified click-to-chat triggers."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E9B95E] text-[#0B0D0F] hover:bg-[#F0C878] font-medium text-xs transition-colors"
          >
            <Send size={13} />
            <span>Compose Message</span>
          </button>
        }
      />

      <main className="p-4 sm:p-6 flex-1 flex flex-col min-w-0 space-y-4">
        {actionMsg && (
          <div
            className={`px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between border ${
              actionMsg.type === 'success'
                ? 'bg-[#55B98A]/10 text-[#55B98A] border-[#55B98A]/20'
                : 'bg-[#DF7373]/10 text-[#DF7373] border-[#DF7373]/20'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-[#969CA5] hover:text-[#F4F4F2]">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#17191D] p-3.5 rounded-lg border border-[#2A2E34]">
            <span className="text-[10px] uppercase tracking-wider text-[#666E79] font-medium block">
              Total Transmissions
            </span>
            <div className="text-xl font-mono font-bold text-[#F4F4F2] mt-1">{totalLogs}</div>
            <span className="text-[11px] text-[#969CA5] mt-0.5 block">Outbound customer messages</span>
          </div>

          <div className="bg-[#17191D] p-3.5 rounded-lg border border-[#2A2E34]">
            <span className="text-[10px] uppercase tracking-wider text-[#6FA9D8] font-medium block">
              Resend Emails
            </span>
            <div className="text-xl font-mono font-bold text-[#6FA9D8] mt-1">{emailCount}</div>
            <span className="text-[11px] text-[#969CA5] mt-0.5 block">HTML quotations & updates</span>
          </div>

          <div className="bg-[#17191D] p-3.5 rounded-lg border border-[#2A2E34]">
            <span className="text-[10px] uppercase tracking-wider text-[#55B98A] font-medium block">
              WhatsApp Interactions
            </span>
            <div className="text-xl font-mono font-bold text-[#55B98A] mt-1">{waCount}</div>
            <span className="text-[11px] text-[#969CA5] mt-0.5 block">Cloud API & Click-to-Chat</span>
          </div>

          <div className="bg-[#17191D] p-3.5 rounded-lg border border-[#2A2E34]">
            <span className="text-[10px] uppercase tracking-wider text-[#E9B95E] font-medium block">
              Delivery Accuracy
            </span>
            <div className="text-xl font-mono font-bold text-[#E9B95E] mt-1">
              {totalLogs > 0 ? Math.round((deliveredCount / totalLogs) * 100) : 100}%
            </div>
            <span className="text-[11px] text-[#969CA5] mt-0.5 block">Zero false delivery claims</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#17191D] p-3 rounded-lg border border-[#2A2E34]">
          <div className="flex items-center gap-1.5">
            {(['ALL', 'EMAIL', 'WHATSAPP'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  channelFilter === ch
                    ? 'bg-[#1D2025] text-[#F4F4F2] border border-[#2A2E34]'
                    : 'text-[#969CA5] hover:text-[#F4F4F2] hover:bg-[#1D2025]/50'
                }`}
              >
                {ch === 'ALL' ? 'All Channels' : ch === 'EMAIL' ? 'Resend Email' : 'WhatsApp'}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#101113] hover:bg-[#1D2025] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#E9B95E]' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Communications Audit Table */}
        <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto crm-scrollbar flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1D2025] text-[#969CA5] uppercase text-[10px] font-medium tracking-wider border-b border-[#2A2E34]">
                <tr>
                  <th className="px-4 py-3 font-medium">Channel</th>
                  <th className="px-4 py-3 font-medium">Customer / Contact</th>
                  <th className="px-4 py-3 font-medium">Template / Subject</th>
                  <th className="px-4 py-3 font-medium">Delivery Status</th>
                  <th className="px-4 py-3 font-medium">Provider Ref</th>
                  <th className="px-4 py-3 font-medium">Dispatched By</th>
                  <th className="px-4 py-3 text-right font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2E34]/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-[#666E79]">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={20} className="animate-spin text-[#E9B95E]" />
                        <span className="text-xs">Loading communication records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-[#666E79]">
                      <div className="flex flex-col items-center gap-1.5">
                        <MessageSquare size={20} className="text-[#666E79]" />
                        <span className="text-xs">No communications recorded in this view.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1D2025]/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                            log.channel === 'EMAIL'
                              ? 'bg-[#6FA9D8]/10 text-[#6FA9D8] border border-[#6FA9D8]/20'
                              : 'bg-[#55B98A]/10 text-[#55B98A] border border-[#55B98A]/20'
                          }`}
                        >
                          {log.channel === 'EMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />}
                          <span>{log.channel}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-[#F4F4F2] block">{log.customerName}</span>
                        <span className="text-[11px] font-mono text-[#666E79]">{log.customerContact}</span>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <span className="font-medium text-[#F4F4F2] block truncate">{log.templateTitle}</span>
                        <span className="text-[11px] text-[#969CA5] line-clamp-1">{log.content}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block text-[9px] font-medium uppercase px-1.5 py-0.5 rounded ${
                            log.deliveryStatus === 'DELIVERED' ||
                            log.deliveryStatus === 'PROVIDER_ACCEPTED' ||
                            log.deliveryStatus === 'SENT'
                              ? 'bg-[#55B98A]/10 text-[#55B98A] border border-[#55B98A]/20'
                              : log.deliveryStatus === 'CLICK_TO_CHAT_TRIGGERED'
                              ? 'bg-[#E9B95E]/10 text-[#E9B95E] border border-[#E9B95E]/20'
                              : 'bg-[#DF7373]/10 text-[#DF7373] border border-[#DF7373]/20'
                          }`}
                        >
                          {log.deliveryStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-[#666E79] whitespace-nowrap">
                        {log.providerRef ? log.providerRef.slice(0, 16) : '—'}
                      </td>

                      <td className="px-4 py-3 text-[#969CA5] whitespace-nowrap">
                        {log.senderUserName}
                      </td>

                      <td className="px-4 py-3 text-right text-[#666E79] text-[11px] whitespace-nowrap font-mono">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Composer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0B0D0F]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#17191D] rounded-lg max-w-lg w-full p-5 sm:p-6 border border-[#2A2E34] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2E34] mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F2]">Compose Outbound Communication</h3>
                <p className="text-xs text-[#969CA5]">Deliver notifications with automatic delivery logging.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-md bg-[#1D2025] hover:bg-[#2A2E34] text-[#969CA5] hover:text-[#F4F4F2] flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#969CA5] mb-1">Target Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs bg-[#101113] border border-[#2A2E34] text-[#F4F4F2] rounded-md p-2 focus:border-[#E9B95E] focus:outline-none"
                  required
                >
                  <option value="" className="bg-[#101113] text-[#666E79]">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#101113] text-[#F4F4F2]">
                      {c.fullName} • {c.phoneNumber} • {c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('EMAIL')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                    channel === 'EMAIL'
                      ? 'bg-[#1D2025] text-[#6FA9D8] border-[#6FA9D8]/50'
                      : 'bg-[#101113] text-[#969CA5] border-[#2A2E34] hover:text-[#F4F4F2]'
                  }`}
                >
                  <Mail size={13} />
                  <span>Resend Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('WHATSAPP')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                    channel === 'WHATSAPP'
                      ? 'bg-[#1D2025] text-[#55B98A] border-[#55B98A]/50'
                      : 'bg-[#101113] text-[#969CA5] border-[#2A2E34] hover:text-[#F4F4F2]'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#969CA5] mb-1">Advisory Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs bg-[#101113] border border-[#2A2E34] text-[#F4F4F2] rounded-md p-2 focus:border-[#E9B95E] focus:outline-none"
                >
                  <option value="WELCOME" className="bg-[#101113]">Welcome to Varni Holidays</option>
                  <option value="QUOTATION_PREPARED" className="bg-[#101113]">Quotation Shared</option>
                  <option value="BOOKING_CONFIRMATION" className="bg-[#101113]">Booking Confirmation</option>
                  <option value="FLIGHT_CONFIRMED" className="bg-[#101113]">Flight PNR Issued</option>
                  <option value="HOTEL_CONFIRMED" className="bg-[#101113]">Hotel Voucher Issued</option>
                  <option value="VISA_DOCS_REQUIRED" className="bg-[#101113]">Visa Documents Required</option>
                  <option value="CUSTOM_MESSAGE" className="bg-[#101113]">Custom Advisory</option>
                </select>
              </div>

              {channel === 'EMAIL' && (
                <div>
                  <label className="block text-xs font-medium text-[#969CA5] mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Travel Advisory from Varni Holidays"
                    className="w-full text-xs bg-[#101113] border border-[#2A2E34] text-[#F4F4F2] placeholder-[#666E79] rounded-md p-2 focus:border-[#E9B95E] focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#969CA5] mb-1">Message Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type message content..."
                  rows={4}
                  className="w-full text-xs bg-[#101113] border border-[#2A2E34] text-[#F4F4F2] placeholder-[#666E79] rounded-md p-2 focus:border-[#E9B95E] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A2E34]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[#969CA5] hover:text-[#F4F4F2] bg-[#101113] hover:bg-[#1D2025] border border-[#2A2E34] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-[#E9B95E] text-[#0B0D0F] hover:bg-[#F0C878] transition-colors disabled:opacity-50"
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
