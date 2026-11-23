'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import {
  getFollowUpsDashboardAction,
  completeFollowUpAction,
  rescheduleFollowUpAction,
  cancelFollowUpAction,
  createFollowUpAction,
  getUnifiedLeadsAction,
} from '@/app/actions/crm-unified';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RotateCw,
  Plus,
  Search,
  User,
  ArrowRight,
  Filter,
  Check,
  X,
  Phone,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Tag,
} from 'lucide-react';

export default function FollowUpsWorkspacePage() {
  const { currentUser, allUsers } = useCrm();
  const [data, setData] = useState<{
    overdue: any[];
    today: any[];
    upcoming: any[];
    completed: any[];
    counts: { overdue: number; today: number; upcoming: number; completed: number };
  }>({
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
    counts: { overdue: 0, today: 0, upcoming: 0, completed: 0 },
  });
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED'>('TODAY');
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    leadId: '',
    dueDate: '',
    title: '',
    notes: '',
    priority: 'MEDIUM',
    assignedUserId: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Reschedule Modal
  const [rescheduleItem, setRescheduleItem] = useState<any | null>(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Cancel Modal
  const [cancelItem, setCancelItem] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Complete
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, lRes] = await Promise.all([
        getFollowUpsDashboardAction({ userId: userFilter }),
        getUnifiedLeadsAction({}),
      ]);

      if (fRes.success && fRes.data) {
        setData(fRes.data);
      }
      if (lRes.success && lRes.data) {
        setLeads(lRes.data);
      }
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userFilter]);

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await completeFollowUpAction(id);
      await loadData();
    } catch (err) {
      console.error('Failed to complete follow up:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await createFollowUpAction({
        leadId: createForm.leadId,
        dueDate: createForm.dueDate,
        title: createForm.title,
        notes: createForm.notes,
        priority: createForm.priority as any,
        assignedUserId: createForm.assignedUserId || undefined,
      });

      if (res.success) {
        setShowCreateModal(false);
        setCreateForm({
          leadId: '',
          dueDate: '',
          title: '',
          notes: '',
          priority: 'MEDIUM',
          assignedUserId: '',
        });
        await loadData();
      } else {
        setCreateError(res.error || 'Failed to create follow-up task');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Error creating task');
    } finally {
      setCreating(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleItem || !newDueDate) return;
    setRescheduling(true);
    try {
      await rescheduleFollowUpAction(rescheduleItem.id, newDueDate, rescheduleReason);
      setRescheduleItem(null);
      setNewDueDate('');
      setRescheduleReason('');
      await loadData();
    } catch (err) {
      console.error('Failed to reschedule:', err);
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelItem || !cancelReason.trim()) return;
    setCancelling(true);
    try {
      await cancelFollowUpAction(cancelItem.id, cancelReason);
      setCancelItem(null);
      setCancelReason('');
      await loadData();
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setCancelling(false);
    }
  };

  const currentList =
    activeTab === 'TODAY'
      ? data.today
      : activeTab === 'OVERDUE'
      ? data.overdue
      : activeTab === 'UPCOMING'
      ? data.upcoming
      : data.completed;

  const filtered = currentList.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const title = (f.title || '').toLowerCase();
    const notes = (f.notes || '').toLowerCase();
    const customer = (f.customer?.fullName || f.lead?.customer?.fullName || '').toLowerCase();
    const phone = (f.customer?.phoneNumber || f.lead?.customer?.phoneNumber || '').toLowerCase();
    const ref = (f.lead?.referenceId || '').toLowerCase();
    return title.includes(q) || notes.includes(q) || customer.includes(q) || phone.includes(q) || ref.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Follow-ups & Client Reminder Tasks"
        subtitle="Operational action queue for lead conversions, pending customer responses, quotation check-ins, and scheduled calls"
        breadcrumbs={[
          { label: 'Customers & CRM', href: '/admin/customers' },
          { label: 'Follow-ups & Tasks' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 bg-[#153650] hover:bg-[#24689B] text-white text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Schedule Follow-Up</span>
            </button>
            <button
              onClick={loadData}
              className="p-1.5 bg-white hover:bg-slate-50 border border-[#E5E8ED] text-slate-600 rounded-none transition-colors cursor-pointer"
              title="Refresh Tasks"
            >
              <RotateCw size={14} className={loading ? 'animate-spin text-[#24689B]' : ''} />
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-4 max-w-7xl mx-auto w-full">
        {/* Metric Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('TODAY')}
            className={`p-3.5 text-left border rounded-none transition-all cursor-pointer ${
              activeTab === 'TODAY'
                ? 'bg-white border-[#24689B] shadow-sm'
                : 'bg-white border-[#E5E8ED] hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Today's Tasks</span>
              <Clock size={15} className="text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{data.counts.today}</div>
            <span className="text-[11px] text-slate-400">Scheduled for today</span>
          </button>

          <button
            onClick={() => setActiveTab('OVERDUE')}
            className={`p-3.5 text-left border rounded-none transition-all cursor-pointer ${
              activeTab === 'OVERDUE'
                ? 'bg-rose-50/50 border-rose-500 shadow-sm'
                : 'bg-white border-[#E5E8ED] hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Overdue</span>
              <AlertTriangle size={15} className="text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-1 font-headline">{data.counts.overdue}</div>
            <span className="text-[11px] text-rose-600 font-semibold">Immediate attention</span>
          </button>

          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`p-3.5 text-left border rounded-none transition-all cursor-pointer ${
              activeTab === 'UPCOMING'
                ? 'bg-white border-[#24689B] shadow-sm'
                : 'bg-white border-[#E5E8ED] hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Upcoming</span>
              <Calendar size={15} className="text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-[#153650] mt-1 font-headline">{data.counts.upcoming}</div>
            <span className="text-[11px] text-slate-400">Future scheduled check-ins</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`p-3.5 text-left border rounded-none transition-all cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-white border-[#24689B] shadow-sm'
                : 'bg-white border-[#E5E8ED] hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed</span>
              <CheckCircle2 size={15} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1 font-headline">{data.counts.completed}</div>
            <span className="text-[11px] text-slate-400">Archived actions</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#E5E8ED] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={13} className="text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer, note, phone, or lead reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E8ED] rounded-none focus:outline-none focus:border-[#24689B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Assignee:</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="text-xs bg-[#F8FAFC] border border-[#E5E8ED] text-slate-700 font-semibold py-1.5 px-2.5 rounded-none focus:outline-none"
            >
              <option value="ALL">All Assignees</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task List Table */}
        <div className="bg-white border border-[#E5E8ED] overflow-x-auto shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFBFD] border-b border-[#E5E8ED] text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="p-3">Status</th>
                <th className="p-3">Scheduled Date & Time</th>
                <th className="p-3">Client & Lead</th>
                <th className="p-3">Task Title & Notes</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8ED]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading follow-up tasks...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <CheckCircle2 size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">No follow-ups in this queue</p>
                    <p className="text-[11px] mt-0.5">All scheduled tasks have been handled or cleared.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const client = item.customer || item.lead?.customer;
                  const isDone = item.status === 'COMPLETED';
                  const isOverdue =
                    !isDone && new Date(item.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${isOverdue ? 'bg-rose-50/20' : ''}`}
                    >
                      <td className="p-3">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {isDone ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-[#153650]">
                          {new Date(item.dueDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-[#153650]">
                          {client?.fullName ? (
                            <Link
                              href={`/admin/customers/${client.id}`}
                              className="hover:text-[#24689B] hover:underline"
                            >
                              {client.fullName}
                            </Link>
                          ) : (
                            'Client'
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <Phone size={10} />
                          <span>{client?.phoneNumber || 'No phone'}</span>
                        </div>
                        {item.lead && (
                          <Link
                            href={`/admin/leads/${item.lead.id}`}
                            className="text-[10px] font-bold text-[#24689B] hover:underline block mt-0.5"
                          >
                            {item.lead.referenceId} ({item.lead.stage})
                          </Link>
                        )}
                      </td>

                      <td className="p-3 max-w-sm">
                        <div className="font-bold text-slate-800">{item.title}</div>
                        <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{item.notes || '—'}</div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider ${
                            item.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800'
                              : item.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.priority || 'MEDIUM'}
                        </span>
                      </td>

                      <td className="p-3 text-slate-700 font-medium">{item.user?.fullName || 'Assigned Agent'}</td>

                      <td className="p-3 text-right">
                        {!isDone && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleComplete(item.id)}
                              disabled={completingId === item.id}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-none inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={12} />
                              <span>Done</span>
                            </button>

                            <button
                              onClick={() => {
                                setRescheduleItem(item);
                                setNewDueDate(
                                  new Date(Date.now() + 86400000).toISOString().slice(0, 16)
                                );
                                setRescheduleReason('');
                              }}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-none cursor-pointer"
                            >
                              Reschedule
                            </button>

                            <button
                              onClick={() => {
                                setCancelItem(item);
                                setCancelReason('');
                              }}
                              className="px-2 py-1 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-none cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-[#153650]">Schedule Client Follow-Up</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 text-xs text-rose-700">{createError}</div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Active Lead *</label>
                <select
                  required
                  value={createForm.leadId}
                  onChange={(e) => setCreateForm({ ...createForm, leadId: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                >
                  <option value="">-- Choose Lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.referenceId} - {l.customer?.fullName} ({l.serviceType} / {l.stage})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call client regarding Dubai visa requirements"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Action Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or specifics to verify during conversation..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Employee</label>
                <select
                  value={createForm.assignedUserId}
                  onChange={(e) => setCreateForm({ ...createForm, assignedUserId: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                >
                  <option value="">Default to Lead Assignee / Self</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-[#153650] hover:bg-[#24689B] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Saving Task...' : 'Schedule Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-[#153650] mb-2">Reschedule Follow-Up Task</h3>
            <p className="text-xs text-slate-600 mb-4">Task: {rescheduleItem.title}</p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reschedule Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested callback tomorrow at 4pm"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRescheduleItem(null)}
                  className="px-4 py-1.5 border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-4 py-1.5 bg-[#153650] hover:bg-[#24689B] text-white text-xs font-bold cursor-pointer"
                >
                  {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-rose-700 mb-2">Cancel Follow-Up Task</h3>
            <p className="text-xs text-slate-600 mb-4">Task: {cancelItem.title}</p>

            <form onSubmit={handleCancelSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cancellation Reason *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Customer cancelled travel plans or already answered via WhatsApp..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-none focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCancelItem(null)}
                  className="px-4 py-1.5 border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Keep Task
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
