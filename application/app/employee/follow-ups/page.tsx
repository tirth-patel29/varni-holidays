'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
import { getFollowUpsAction, completeFollowUpAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  User,
  Filter,
  Check,
} from 'lucide-react';

export default function FollowUpsPage() {
  const { currentUser } = useCrm();
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'ALL'>('PENDING');

  const loadData = async () => {
    setLoading(true);
    const data = await getFollowUpsAction({ status: statusFilter });
    setFollowUps(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleComplete = async (id: string) => {
    await completeFollowUpAction(id);
    await loadData();
  };

  const overdueCount = followUps.filter(
    (f) => f.status === 'PENDING' && new Date(f.scheduledAt).getTime() < Date.now()
  ).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Follow-Up Schedule & Reminders"
        subtitle="Ensure zero lead leakage with scheduled phone consultations and customer check-ins."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                statusFilter === 'PENDING'
                  ? 'bg-[#E9B95E] text-[#0B0D0F] border-[#E9B95E]'
                  : 'bg-[#17191D] text-[#969CA5] border-[#2A2E34] hover:text-[#F4F4F2]'
              }`}
            >
              <Filter size={13} />
              <span>{statusFilter === 'PENDING' ? 'Pending Only' : 'All Follow-ups'}</span>
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-md bg-[#17191D] hover:bg-[#1D2025] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] text-xs transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#E9B95E]' : ''} />
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 flex-1 flex flex-col min-w-0 space-y-4">
        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#17191D] rounded-lg p-3.5 border border-[#2A2E34] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#666E79] font-medium block">
                Total Listed
              </span>
              <span className="text-xl font-mono font-bold text-[#F4F4F2]">{followUps.length}</span>
            </div>
            <Calendar size={18} className="text-[#969CA5]" />
          </div>

          <div className="bg-[#17191D] rounded-lg p-3.5 border border-[#2A2E34] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#666E79] font-medium block">
                Pending Actions
              </span>
              <span className="text-xl font-mono font-bold text-[#E9B95E]">
                {followUps.filter((f) => f.status === 'PENDING').length}
              </span>
            </div>
            <Clock size={18} className="text-[#E9B95E]" />
          </div>

          <div
            className={`rounded-lg p-3.5 border flex items-center justify-between ${
              overdueCount > 0
                ? 'bg-[#DF7373]/10 border-[#DF7373]/30 text-[#DF7373]'
                : 'bg-[#17191D] border-[#2A2E34] text-[#55B98A]'
            }`}
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#666E79] font-medium block">
                Overdue Reminders
              </span>
              <span className="text-xl font-mono font-bold">{overdueCount}</span>
            </div>
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Reminders List */}
        <div className="bg-[#17191D] rounded-lg border border-[#2A2E34] overflow-hidden flex-1 flex flex-col">
          <div className="p-3.5 border-b border-[#2A2E34] bg-[#1D2025] flex items-center justify-between">
            <h3 className="font-medium text-xs text-[#F4F4F2] flex items-center gap-2">
              <Calendar size={14} className="text-[#E9B95E]" />
              Scheduled Consultations & Reminders
            </h3>
            <span className="text-[10px] font-mono text-[#969CA5] px-2 py-0.5 rounded bg-[#101113] border border-[#2A2E34]">
              {followUps.length} records
            </span>
          </div>

          <div className="p-3 sm:p-4 overflow-y-auto crm-scrollbar flex-1 space-y-2.5">
            {loading ? (
              <div className="py-16 text-center text-[#666E79] flex flex-col items-center gap-2">
                <RefreshCw size={20} className="animate-spin text-[#E9B95E]" />
                <span className="text-xs">Loading follow-up schedule...</span>
              </div>
            ) : followUps.length === 0 ? (
              <div className="py-16 text-center text-[#666E79] flex flex-col items-center gap-2">
                <CheckCircle2 size={24} className="text-[#55B98A]" />
                <span className="text-xs font-medium text-[#F4F4F2]">All follow-ups completed</span>
                <span className="text-[11px] text-[#666E79]">Zero lead leakage. Good work!</span>
              </div>
            ) : (
              followUps.map((f) => {
                const isOverdue =
                  new Date(f.scheduledAt).getTime() < Date.now() && f.status === 'PENDING';

                return (
                  <div
                    key={f.id}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isOverdue
                        ? 'bg-[#DF7373]/5 border-[#DF7373]/30'
                        : f.status === 'COMPLETED'
                        ? 'bg-[#101113]/60 border-[#2A2E34]/50 opacity-60'
                        : 'bg-[#1D2025] border-[#2A2E34] hover:border-[#383E47]'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide ${
                            isOverdue
                              ? 'bg-[#DF7373]/15 text-[#DF7373] border border-[#DF7373]/30'
                              : f.status === 'COMPLETED'
                              ? 'bg-[#2A2E34] text-[#969CA5]'
                              : 'bg-[#E9B95E]/15 text-[#E9B95E] border border-[#E9B95E]/30'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : f.status}
                        </span>

                        <span className="font-mono text-xs text-[#E9B95E] font-medium">
                          {f.leadRef}
                        </span>
                        <span className="text-[#666E79]">•</span>
                        <span className="text-xs font-medium text-[#F4F4F2] truncate">
                          {f.customerName}
                        </span>
                      </div>

                      <p className="text-xs text-[#969CA5] leading-relaxed">
                        {f.note}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[#666E79] flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className={isOverdue ? 'text-[#DF7373]' : 'text-[#E9B95E]'} />
                          <span className={isOverdue ? 'text-[#DF7373] font-medium' : 'text-[#969CA5]'}>
                            {new Date(f.scheduledAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 text-[#666E79]">
                          <User size={12} />
                          Assigned: {f.userName || 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {f.status === 'PENDING' && (
                        <button
                          onClick={() => handleComplete(f.id)}
                          className="px-2.5 py-1.5 rounded-md bg-[#55B98A]/15 text-[#55B98A] hover:bg-[#55B98A] hover:text-[#0B0D0F] border border-[#55B98A]/30 text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <Check size={13} />
                          <span>Mark Done</span>
                        </button>
                      )}

                      <Link
                        href={`/employee/leads/${f.leadId}`}
                        className="px-2.5 py-1.5 rounded-md bg-[#101113] hover:bg-[#1D2025] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] text-xs font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <span>Open Lead</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
