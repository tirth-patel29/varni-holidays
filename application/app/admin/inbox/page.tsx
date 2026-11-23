'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import {
  getInboxConversationsAction,
  getInboxConversationDetailAction,
  sendInboxReplyAction,
  updateInboxStatusAction,
  assignInboxConversationAction,
  addInboxInternalNoteAction,
  createManualEnquiryAction,
  updateLeadStageAction,
  findCustomerDuplicatesAction,
} from '@/app/actions/crm-unified';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Inbox,
  Search,
  Filter,
  RotateCw,
  MessageSquare,
  Send,
  Phone,
  Mail,
  User,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Instagram,
  Facebook,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Tag,
  Calendar,
  Sparkles,
  Paperclip,
  Check,
  CheckCheck,
  Eye,
  Info,
  X,
  Building2,
  Plane,
  Compass,
} from 'lucide-react';

const CHANNELS = [
  { id: 'ALL', label: 'All Channels', icon: Inbox },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'WEBSITE', label: 'Website', icon: Globe, color: 'text-sky-600 bg-sky-50' },
  { id: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-rose-600 bg-rose-50' },
  { id: 'FACEBOOK', label: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-50' },
  { id: 'PHONE_CALL', label: 'Phone Call', icon: Phone, color: 'text-amber-600 bg-amber-50' },
  { id: 'WALK_IN', label: 'Walk-in', icon: User, color: 'text-purple-600 bg-purple-50' },
];

const STATUSES = ['ALL', 'NEW', 'OPEN', 'PENDING', 'RESOLVED'];

export default function UnifiedInboxPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Unified Inbox...</div>}>
      <UnifiedInboxContent />
    </Suspense>
  );
}

function UnifiedInboxContent() {
  const searchParams = useSearchParams();
  const initialChannel = searchParams.get('channel') || 'ALL';
  const { allUsers, currentUser } = useCrm();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [channelFilter, setChannelFilter] = useState<string>(initialChannel);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('ALL');

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Internal Note state
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Manual Enquiry Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    channel: 'PHONE_CALL',
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    subject: '',
    details: '',
    priority: 'MEDIUM',
    serviceType: 'FLIGHT',
    origin: '',
    destination: '',
    budgetInr: '',
  });
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [manualError, setManualError] = useState<string | null>(null);
  const [creatingManual, setCreatingManual] = useState(false);

  // Lead Loss Modal
  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [selectedLossReason, setSelectedLossReason] = useState('Price too high');
  const [lossNotes, setLossNotes] = useState('');

  const loadList = async () => {
    setLoadingList(true);
    try {
      const res = await getInboxConversationsAction({
        channel: channelFilter,
        status: statusFilter,
        search: searchQuery,
        assignedUserId: assignedFilter,
      });
      if (res.success && res.data) {
        setConversations(res.data);
        if (!selectedId && res.data.length > 0) {
          setSelectedId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const loadDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await getInboxConversationDetailAction(id);
      if (res.success && res.data) {
        setActiveConversation(res.data);
      }
    } catch (err) {
      console.error('Failed to load detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [channelFilter, statusFilter, assignedFilter]);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    } else {
      setActiveConversation(null);
    }
  }, [selectedId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !replyText.trim()) return;
    setSendingReply(true);
    setReplyError(null);
    try {
      const res = await sendInboxReplyAction(selectedId, replyText);
      if (res.success) {
        setReplyText('');
        await loadDetail(selectedId);
        await loadList();
      } else {
        setReplyError(res.error || 'Failed to dispatch reply');
      }
    } catch (err: any) {
      setReplyError(err.message || 'Error dispatching message');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    if (!selectedId) return;
    await updateInboxStatusAction(selectedId, newStatus);
    await loadDetail(selectedId);
    await loadList();
  };

  const handleAssigneeChange = async (newUserId: string) => {
    if (!selectedId) return;
    await assignInboxConversationAction(selectedId, newUserId === 'UNASSIGNED' ? null : newUserId);
    await loadDetail(selectedId);
    await loadList();
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await addInboxInternalNoteAction(selectedId, noteText);
      if (res.success) {
        setNoteText('');
        await loadDetail(selectedId);
      }
    } finally {
      setAddingNote(false);
    }
  };

  const handleLeadStageChange = async (newStage: any) => {
    if (!activeConversation?.lead?.id) return;
    if (newStage === 'LOST') {
      setLossModalOpen(true);
      return;
    }
    await updateLeadStageAction(activeConversation.lead.id, newStage);
    await loadDetail(selectedId!);
  };

  const handleConfirmLost = async () => {
    if (!activeConversation?.lead?.id) return;
    await updateLeadStageAction(
      activeConversation.lead.id,
      'LOST',
      selectedLossReason,
      lossNotes
    );
    setLossModalOpen(false);
    setLossNotes('');
    await loadDetail(selectedId!);
  };

  // Real-time duplicate check when creating manual enquiry
  const handlePhoneChange = async (phone: string) => {
    setManualForm((prev) => ({ ...prev, senderPhone: phone }));
    if (phone.replace(/\D/g, '').length >= 7) {
      const dups = await findCustomerDuplicatesAction(phone, manualForm.senderEmail);
      if (dups.success && dups.data) {
        setDuplicateMatches(dups.data);
      }
    } else {
      setDuplicateMatches([]);
    }
  };

  const handleCreateManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingManual(true);
    setManualError(null);
    try {
      const res = await createManualEnquiryAction({
        channel: manualForm.channel as any,
        senderName: manualForm.senderName,
        senderPhone: manualForm.senderPhone,
        senderEmail: manualForm.senderEmail || undefined,
        subject: manualForm.subject,
        details: manualForm.details,
        priority: manualForm.priority as any,
        serviceType: manualForm.serviceType,
        origin: manualForm.origin || undefined,
        destination: manualForm.destination || undefined,
        budgetInr: manualForm.budgetInr ? parseFloat(manualForm.budgetInr) : undefined,
      });

      if (res.success) {
        setShowManualModal(false);
        setManualForm({
          channel: 'PHONE_CALL',
          senderName: '',
          senderPhone: '',
          senderEmail: '',
          subject: '',
          details: '',
          priority: 'MEDIUM',
          serviceType: 'FLIGHT',
          origin: '',
          destination: '',
          budgetInr: '',
        });
        setDuplicateMatches([]);
        await loadList();
      } else {
        setManualError(res.error || 'Failed to record enquiry');
      }
    } catch (err: any) {
      setManualError(err.message || 'Failed to submit enquiry');
    } finally {
      setCreatingManual(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45] h-screen overflow-hidden">
      <PageHeader
        title="Unified Enquiry Inbox"
        subtitle="Multi-channel incoming enquiries across Website, WhatsApp Cloud API, Instagram, Facebook, Calls, and Walk-ins"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'Unified Inbox' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualModal(true)}
              className="px-3.5 py-1.5 bg-[#153650] hover:bg-[#24689B] text-white text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Log Manual Enquiry</span>
            </button>
            <button
              onClick={loadList}
              className="p-1.5 bg-white hover:bg-slate-50 border border-[#E5E8ED] text-[#153650] rounded-none transition-colors"
              title="Refresh"
            >
              <RotateCw size={14} className={loadingList ? 'animate-spin text-[#24689B]' : ''} />
            </button>
          </div>
        }
      />

      {/* 3-Column Layout: Left (Filters & List), Center (Chat Conversation), Right (Customer 360 & Lead Details) */}
      <div className="flex-1 flex min-w-0 overflow-hidden border-t border-[#E5E8ED]">
        {/* Left Column: Inbox List */}
        <div className="w-80 md:w-96 flex flex-col border-r border-[#E5E8ED] bg-white shrink-0">
          {/* Channel Tabs */}
          <div className="p-3 border-b border-[#E5E8ED] space-y-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const active = channelFilter === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setChannelFilter(ch.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap rounded-none transition-colors cursor-pointer inline-flex items-center gap-1 border ${
                      active
                        ? 'bg-[#153650] text-white border-[#153650]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search and Status Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sender, phone, text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadList()}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#F7F8FA] border border-slate-200 rounded-none focus:outline-none focus:border-[#24689B]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 px-2 py-1.5 rounded-none font-semibold text-slate-700 focus:outline-none"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === 'ALL' ? 'All Status' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F1F3F5]">
            {loadingList ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No conversations found</p>
                <p className="text-[11px] text-slate-400 mt-1">Try resetting your channel or search filters</p>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = c.id === selectedId;
                const channelMeta = CHANNELS.find((ch) => ch.id === c.channel) || CHANNELS[0];
                const Icon = channelMeta.icon;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-3.5 transition-colors cursor-pointer border-l-2 ${
                      isSelected
                        ? 'bg-sky-50/50 border-[#24689B]'
                        : 'bg-white hover:bg-[#F9FAFB] border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`p-1 rounded-xs ${channelMeta.color || 'bg-slate-100 text-slate-600'}`}>
                          <Icon size={12} />
                        </span>
                        <span className="text-xs font-bold text-[#153650] truncate">{c.senderName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-1">{c.subject || 'Enquiry'}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.lastMessageSnippet || 'No messages'}</p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/60">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider ${
                            c.status === 'NEW'
                              ? 'bg-rose-100 text-rose-800'
                              : c.status === 'OPEN'
                              ? 'bg-sky-100 text-sky-800'
                              : c.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.status}
                        </span>
                        {c.lead?.stage && (
                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5">
                            {c.lead.stage}
                          </span>
                        )}
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="w-4 h-4 bg-[#24689B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Conversation Thread & Reply */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] min-w-0">
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 bg-white border-b border-[#E5E8ED] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#153650] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {activeConversation.senderName?.slice(0, 2) || 'VN'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[#153650] truncate">{activeConversation.senderName}</h2>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 font-mono">
                        {activeConversation.channel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{activeConversation.senderIdentity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={activeConversation.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-none font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="NEW">NEW</option>
                    <option value="OPEN">OPEN</option>
                    <option value="PENDING">PENDING</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>

                  {/* Assignee Dropdown */}
                  <select
                    value={activeConversation.assignedUserId || 'UNASSIGNED'}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-none font-medium text-slate-700 cursor-pointer"
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

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {activeConversation.channel === 'WHATSAPP' && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-none flex items-start gap-2">
                    <Info size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <span className="font-bold">Official Meta WhatsApp Cloud API Active:</span> Responses are
                      dispatched directly to the traveler's WhatsApp account within the official 24-hour service window.
                    </div>
                  </div>
                )}

                {activeConversation.messages?.map((m: any) => {
                  const isOutbound = m.direction === 'OUTBOUND';
                  return (
                    <div key={m.id} className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-md p-3.5 rounded-none text-xs leading-relaxed shadow-2xs ${
                          isOutbound
                            ? 'bg-[#153650] text-white'
                            : 'bg-white border border-[#E5E8ED] text-slate-800'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-75 mb-1 flex items-center justify-between gap-3">
                          <span>{m.senderName}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.content}</p>

                        {isOutbound && (
                          <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-75">
                            {m.status === 'READ' ? (
                              <CheckCheck size={12} className="text-sky-300" />
                            ) : m.status === 'DELIVERED' ? (
                              <CheckCheck size={12} />
                            ) : (
                              <Check size={12} />
                            )}
                            <span className="capitalize">{m.status?.toLowerCase() || 'sent'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <div className="p-3 bg-white border-t border-[#E5E8ED]">
                {replyError && (
                  <div className="p-2 mb-2 bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center justify-between">
                    <span>{replyError}</span>
                    <button onClick={() => setReplyError(null)}>
                      <X size={12} />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder={`Reply to ${activeConversation.senderName} via ${activeConversation.channel}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-slate-200 rounded-none focus:outline-none focus:border-[#24689B] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>Quick replies:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setReplyText(
                            `Hello ${activeConversation.senderName}, thank you for contacting Varni Holidays! How can our travel specialists assist with your plans today?`
                          )
                        }
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] cursor-pointer"
                      >
                        Greeting
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReplyText(
                            `We have received your enquiry and our executive is reviewing flight availability and hotel options for you now.`
                          )
                        }
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] cursor-pointer"
                      >
                        Reviewing
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingReply || !replyText.trim()}
                      className="px-4 py-1.5 bg-[#153650] hover:bg-[#24689B] disabled:opacity-50 text-white text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send size={12} />
                      <span>{sendingReply ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare size={48} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Select a Conversation</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Choose an incoming enquiry from the list on the left to review message history, reply via WhatsApp, or
                manage customer dossiers.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Customer Dossier & Lead Pipeline Actions */}
        {activeConversation && (
          <div className="w-80 lg:w-96 border-l border-[#E5E8ED] bg-white overflow-y-auto p-4 space-y-4 shrink-0">
            {/* Customer 360 Card */}
            <div className="bg-[#F7F8FA] border border-[#E5E8ED] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                  Customer Identity
                </span>
                {activeConversation.customerId && (
                  <Link
                    href={`/admin/customers/${activeConversation.customerId}`}
                    className="text-[11px] font-bold text-[#24689B] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Full 360° Profile</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#153650]">{activeConversation.senderName}</h4>
                <p className="text-xs text-slate-600 font-mono mt-0.5">{activeConversation.senderIdentity}</p>
                {activeConversation.customer?.email && (
                  <p className="text-xs text-slate-500 mt-0.5">{activeConversation.customer.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-center">
                <div className="bg-white p-2 border border-slate-200/60">
                  <div className="text-xs font-bold text-[#153650]">
                    {activeConversation.customer?.bookings?.length || 0}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">Bookings</div>
                </div>
                <div className="bg-white p-2 border border-slate-200/60">
                  <div className="text-xs font-bold text-[#153650]">
                    {activeConversation.customer?.flightHolds?.length || 0}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">Flight Holds</div>
                </div>
              </div>
            </div>

            {/* Associated Lead Card */}
            {activeConversation.lead && (
              <div className="border border-[#E5E8ED] p-3.5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                    Commercial Lead
                  </span>
                  <Link
                    href={`/admin/leads/${activeConversation.lead.id}`}
                    className="text-[11px] font-bold text-[#24689B] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{activeConversation.lead.referenceId}</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pipeline Stage:</span>
                    <select
                      value={activeConversation.lead.stage}
                      onChange={(e) => handleLeadStageChange(e.target.value)}
                      className="text-xs font-bold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-none cursor-pointer text-[#153650]"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="QUOTED">QUOTED</option>
                      <option value="NEGOTIATION">NEGOTIATION</option>
                      <option value="WON">WON</option>
                      <option value="LOST">LOST</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Priority:</span>
                    <span className="font-bold text-slate-700">{activeConversation.lead.priorityLevel}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Internal Staff Notes */}
            <div className="border border-[#E5E8ED] p-3.5 space-y-3 bg-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                Internal Staff Remarks
              </span>

              <form onSubmit={handleAddInternalNote} className="space-y-2">
                <input
                  type="text"
                  placeholder="Add private note for team..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-2 text-xs bg-[#F7F8FA] border border-slate-200 rounded-none focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-none cursor-pointer"
                >
                  {addingNote ? 'Saving...' : 'Add Note'}
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-slate-100 max-h-48 overflow-y-auto">
                {Array.isArray(activeConversation.internalNotes) && activeConversation.internalNotes.length > 0 ? (
                  activeConversation.internalNotes.map((n: any) => (
                    <div key={n.id} className="p-2 bg-slate-50 border border-slate-200/60 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold text-slate-700">{n.authorName}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600">{n.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-2">No internal remarks yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Enquiry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-[#153650]">Log New Manual Enquiry</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            {manualError && (
              <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 text-xs text-rose-700">{manualError}</div>
            )}

            <form onSubmit={handleCreateManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enquiry Channel</label>
                  <select
                    value={manualForm.channel}
                    onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  >
                    <option value="PHONE_CALL">Telephone Call</option>
                    <option value="WALK_IN">Walk-in Customer</option>
                    <option value="INSTAGRAM">Instagram Direct</option>
                    <option value="FACEBOOK">Facebook Messenger</option>
                    <option value="WEBSITE">Website Form</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={manualForm.serviceType}
                    onChange={(e) => setManualForm({ ...manualForm, serviceType: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  >
                    <option value="FLIGHT">Flight Booking</option>
                    <option value="PACKAGE">Tour Package</option>
                    <option value="VISA">Visa Assistance</option>
                    <option value="CUSTOM_HOLIDAY">Custom Holiday</option>
                    <option value="GENERAL">General Travel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Traveler / Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={manualForm.senderName}
                    onChange={(e) => setManualForm({ ...manualForm, senderName: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9898012345"
                    value={manualForm.senderPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  />
                </div>
              </div>

              {/* Duplicate Detection Alert */}
              {duplicateMatches.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle size={14} />
                    <span>Existing Customer Profile Detected</span>
                  </div>
                  <p className="text-[11px]">
                    Found existing record for <b>{duplicateMatches[0].fullName}</b> ({duplicateMatches[0].phoneNumber}).
                    This enquiry will link seamlessly to their existing customer identity.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="customer@gmail.com"
                    value={manualForm.senderEmail}
                    onChange={(e) => setManualForm({ ...manualForm, senderEmail: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Budget (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={manualForm.budgetInr}
                    onChange={(e) => setManualForm({ ...manualForm, budgetInr: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin City / Airport</label>
                  <input
                    type="text"
                    placeholder="e.g. BOM / Ahmedabad"
                    value={manualForm.origin}
                    onChange={(e) => setManualForm({ ...manualForm, origin: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination City / Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Dubai, UAE"
                    value={manualForm.destination}
                    onChange={(e) => setManualForm({ ...manualForm, destination: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enquiry Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Family trip to Dubai 5N/6D with flight tickets"
                  value={manualForm.subject}
                  onChange={(e) => setManualForm({ ...manualForm, subject: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details & Special Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Customer requirements, preferred travel dates, passenger count, special notes..."
                  value={manualForm.details}
                  onChange={(e) => setManualForm({ ...manualForm, details: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingManual}
                  className="px-5 py-2 bg-[#153650] hover:bg-[#24689B] text-white text-xs font-bold disabled:opacity-50"
                >
                  {creatingManual ? 'Saving Enquiry...' : 'Record Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loss Reason Modal */}
      {lossModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-rose-700 mb-2">Mark Lead as LOST</h3>
            <p className="text-xs text-slate-600 mb-4">
              Please specify the primary reason why this lead was lost. This data ensures accurate commercial conversion
              analytics.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Loss *</label>
                <select
                  value={selectedLossReason}
                  onChange={(e) => setSelectedLossReason(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Price too high">Price too high</option>
                  <option value="Customer booked elsewhere">Customer booked elsewhere</option>
                  <option value="No response">No response / Unreachable</option>
                  <option value="Travel cancelled">Travel cancelled</option>
                  <option value="Schedule unavailable">Schedule unavailable</option>
                  <option value="Payment issue">Payment issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context on why the deal was closed as lost..."
                  value={lossNotes}
                  onChange={(e) => setLossNotes(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setLossModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLost}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Lead as Lost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
