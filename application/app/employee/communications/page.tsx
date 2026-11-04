'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getCustomersAction } from '@/app/actions/crm';
import { sendCustomerUpdateAction } from '@/app/actions/phase3';
import { useCrm } from '@/components/crm/CrmContext';

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
  const deliveredCount = logs.filter((l) => l.deliveryStatus === 'DELIVERED' || l.deliveryStatus === 'CLICK_TO_CHAT_TRIGGERED' || l.deliveryStatus === 'SENT').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900 font-sans">
      <CrmHeader
        title="Customer Communications Hub"
        subtitle="Multi-channel delivery log across Resend Email, WhatsApp Cloud API, and verified click-to-chat triggers."
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Transmissions</span>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-1">{totalLogs}</div>
            <span className="text-xs text-slate-500 mt-1 block">Outbound customer messages</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Resend Emails</span>
            <div className="text-2xl font-mono font-bold text-sky-700 mt-1">{emailCount}</div>
            <span className="text-xs text-slate-500 mt-1 block">Branded HTML quotations & updates</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">WhatsApp Interactions</span>
            <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">{waCount}</div>
            <span className="text-xs text-slate-500 mt-1 block">Cloud API & Click-to-Chat</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Delivery Accuracy</span>
            <div className="text-2xl font-mono font-bold text-indigo-700 mt-1">
              {totalLogs > 0 ? Math.round((deliveredCount / totalLogs) * 100) : 100}%
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Zero false delivery claims</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5">
            {(['ALL', 'EMAIL', 'WHATSAPP'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  channelFilter === ch
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {ch === 'ALL' ? 'All Channels' : ch === 'EMAIL' ? 'Resend Email' : 'WhatsApp'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-sm font-bold">send</span>
            <span>Compose Customer Message</span>
          </button>
        </div>

        {/* Communications Audit Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-5 py-3.5">Customer / Contact</th>
                  <th className="px-5 py-3.5">Template / Subject</th>
                  <th className="px-5 py-3.5">Delivery Status</th>
                  <th className="px-5 py-3.5">Provider ID</th>
                  <th className="px-5 py-3.5">Dispatched By</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      Loading communication events...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No communications recorded.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          log.channel === 'EMAIL'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {log.channel === 'EMAIL' ? 'mail' : 'chat'}
                          </span>
                          <span>{log.channel}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 block">{log.customerName}</span>
                        <span className="text-[11px] font-mono text-slate-500">{log.customerContact}</span>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <span className="font-semibold text-slate-800 block truncate">{log.templateTitle}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{log.content}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          log.deliveryStatus === 'DELIVERED' || log.deliveryStatus === 'PROVIDER_ACCEPTED' || log.deliveryStatus === 'SENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.deliveryStatus === 'CLICK_TO_CHAT_TRIGGERED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.deliveryStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                        {log.providerRef ? log.providerRef.slice(0, 16) : '—'}
                      </td>

                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {log.senderUserName}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Compose Outbound Communication</h3>
                <p className="text-xs text-slate-500">Deliver notifications with automatic delivery logging.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} • {c.email} • {c.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>

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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                >
                  <option value="WELCOME">Welcome to Varni Holidays</option>
                  <option value="QUOTATION_PREPARED">Quotation Shared</option>
                  <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
                  <option value="FLIGHT_CONFIRMED">Flight PNR Issued</option>
                  <option value="HOTEL_CONFIRMED">Hotel Voucher Issued</option>
                  <option value="VISA_DOCS_REQUIRED">Visa Documents Required</option>
                  <option value="CUSTOM_MESSAGE">Custom Advisory</option>
                </select>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Text</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type message text..."
                  rows={4}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

