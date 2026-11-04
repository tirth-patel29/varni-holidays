'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getPotentialDuplicatesAction, mergeCustomersAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';

export default function DeduplicationPage() {
  const { currentUser } = useCrm();
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mergeResult, setMergeResult] = useState<string | null>(null);
  const [mergingId, setMergingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getPotentialDuplicatesAction();
    setDuplicateGroups(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMerge = async (primaryId: string, subordinateId: string) => {
    setMergingId(subordinateId);
    setMergeResult(null);
    const res = await mergeCustomersAction(primaryId, subordinateId, currentUser.id);
    if (res.success) {
      setMergeResult(res.message);
      await loadData();
    } else {
      alert(res.message);
    }
    setMergingId(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <CrmHeader
        title="Customer Deduplication & Merging"
        subtitle="Admin-controlled identity resolution: merge duplicates without losing historical inquiries."
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        {/* Compliance Banner */}
        <div className="clay-card rounded-2xl p-5 bg-[#FBF9F5] border border-[#C29033]/40 text-xs text-slate-700 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#153650]">
            <span className="material-symbols-outlined text-[#C29033]">shield</span>
            <span>Non-Destructive Merge Governance Rules</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            1. Customers in India frequently share mobile numbers across joint families and corporate bookings. <strong>Automatic merging is strictly prohibited.</strong><br />
            2. When an authorized administrator merges two profiles, the subordinate customer record is archived (never permanently erased), and all historical leads, activity timelines, and quotations are re-attributed to the primary customer profile with a permanent audit trail.
          </p>
        </div>

        {mergeResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{mergeResult}</span>
          </div>
        )}

        {/* Duplicate Groups List */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Scanning customer registry for duplicates...</div>
          ) : duplicateGroups.length === 0 ? (
            <div className="clay-card rounded-3xl p-12 text-center border border-[#E3DCCB] bg-white text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
              <h4 className="font-serif text-lg font-bold text-[#153650]">No Unresolved Duplicates</h4>
              <p className="text-xs max-w-md mx-auto text-slate-600">
                All customer records have unique identity assignments or have already been merged with preserved audit trails.
              </p>
            </div>
          ) : (
            duplicateGroups.map((group, idx) => (
              <div key={idx} className="clay-card rounded-3xl p-6 border border-[#E3DCCB] bg-white space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E3DCCB] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">phone_in_talk</span>
                    <span className="text-xs font-bold text-[#153650] uppercase tracking-wider">
                      Shared Contact Number: <strong className="font-mono text-sm text-[#153650]">{group.primary.normalizedPhone}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {group.matches.length + 1} Profiles Match
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Primary Record */}
                  <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded">
                        Target Primary Profile
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">{group.primary.id}</span>
                    </div>
                    <div className="font-serif text-base font-bold text-[#153650]">{group.primary.fullName}</div>
                    <div className="text-slate-700">Email: {group.primary.email || 'None'}</div>
                    <div className="text-slate-700">City: {group.primary.city || 'Anand, Gujarat'}</div>
                    <div className="text-[10px] text-slate-500 pt-1">
                      Created: {new Date(group.primary.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Duplicate Matches */}
                  <div className="space-y-4">
                    {group.matches.map((match: any) => (
                      <div
                        key={match.id}
                        className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                            Candidate Duplicate
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{match.id}</span>
                        </div>

                        <div>
                          <div className="font-serif text-base font-bold text-[#153650]">{match.fullName}</div>
                          <div className="text-slate-700">Email: {match.email || 'None'}</div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Created: {new Date(match.createdAt).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                          <span className="text-[11px] text-slate-600 italic">
                            All leads & history will merge into {group.primary.fullName}
                          </span>
                          <button
                            onClick={() => handleMerge(group.primary.id, match.id)}
                            disabled={mergingId === match.id}
                            className="px-4 py-2 rounded-xl bg-[#153650] text-white font-bold text-xs shadow hover:bg-[#24689B] transition-colors inline-flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">call_merge</span>
                            <span>{mergingId === match.id ? 'Merging...' : 'Merge Profiles'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

