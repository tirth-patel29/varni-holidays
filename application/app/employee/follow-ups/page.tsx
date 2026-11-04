'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CrmHeader from '@/components/crm/CrmHeader';
import { getFollowUpsAction, completeFollowUpAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';

export default function FollowUpsPage() {
  const { currentUser } = useCrm();
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

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

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FBF9F5]">
      <CrmHeader
        title="Follow-Up Schedule & Reminders"
        subtitle="Ensure zero lead leakage with scheduled phone and consultation follow-ups."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors shadow-sm ${
                statusFilter === 'PENDING'
                  ? 'bg-[#E9B95E] text-[#0B1E2E] border-[#E9B95E]'
                  : 'bg-white text-slate-800 border-[#E3DCCB] hover:bg-[#F5F2EB]'
              }`}
            >
              {statusFilter === 'PENDING' ? 'Showing Pending Only' : 'Showing All'}
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-white border border-[#E3DCCB] text-[#153650] hover:bg-[#F5F2EB] transition-colors shadow-sm flex items-center justify-center"
              title="Refresh"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-[#E3DCCB] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3DCCB] pb-3">
            <h3 className="font-serif font-bold text-[#153650] text-lg">Scheduled Reminders</h3>
            <span className="text-xs font-bold text-[#153650] bg-[#F5F2EB] px-2.5 py-1 rounded-full">{followUps.length} Reminders</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-semibold">Loading reminders...</div>
          ) : followUps.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-medium">
              No follow-ups currently due. Great job maintaining customer contact!
            </div>
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => {
                const isOverdue = new Date(f.scheduledAt).getTime() < Date.now() && f.status === 'PENDING';

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isOverdue
                        ? 'bg-rose-50/90 border-rose-300'
                        : f.status === 'COMPLETED'
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-[#F5F2EB]/70 border-[#E3DCCB]'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : f.status === 'COMPLETED'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-[#F7E5BD] text-[#453000] border border-[#E9B95E]'
                          }`}
                        >
                          {isOverdue ? 'Overdue Reminder' : f.status}
                        </span>

                        <span className="font-mono font-bold text-[#153650] text-xs">{f.leadRef}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-800 text-xs">{f.customerName}</span>
                      </div>

                      <p className="text-xs text-slate-800 font-medium leading-relaxed">{f.note}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-[#C29033]">schedule</span>
                          <span>{new Date(f.scheduledAt).toLocaleString('en-IN')}</span>
                        </span>
                        <span>Assigned: {f.userName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {f.status === 'PENDING' && (
                        <button
                          onClick={() => handleComplete(f.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">done</span>
                          <span>Mark Done</span>
                        </button>
                      )}

                      <Link
                        href={`/employee/leads/${f.leadId}`}
                        className="px-3.5 py-2 rounded-xl bg-[#153650] text-white font-bold text-xs hover:bg-[#24689B] transition-colors inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Open Lead</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
