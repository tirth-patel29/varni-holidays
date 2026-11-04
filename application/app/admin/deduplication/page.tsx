'use client';

import React, { useState, useEffect } from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { getPotentialDuplicatesAction, mergeCustomersAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Merge,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
} from 'lucide-react';

export default function DeduplicationPage() {
  const { currentUser } = useCrm();
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mergeResult, setMergeResult] = useState<string | null>(null);
  const [mergingId, setMergingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getPotentialDuplicatesAction();
    setDuplicateGroups(data || []);
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Customer Deduplication & Merging"
        subtitle="Admin-controlled identity resolution: merge duplicates without losing historical inquiries."
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        {/* Compliance Banner */}
        <div className="rounded-lg p-4 bg-[#17191D] border border-[#2A2E34] text-xs text-[#969CA5] space-y-1.5">
          <div className="flex items-center gap-2 font-medium text-[#F4F4F2]">
            <ShieldCheck size={16} className="text-[#E9B95E]" />
            <span>Non-Destructive Merge Governance Rules</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            1. Customers in India frequently share mobile numbers across joint families and corporate bookings. <strong>Automatic merging is strictly prohibited.</strong><br />
            2. When an authorized administrator merges two profiles, the subordinate customer record is archived (never permanently erased), and all historical leads, activity timelines, and quotations are re-attributed to the primary customer profile with a permanent audit trail.
          </p>
        </div>

        {mergeResult && (
          <div className="p-3 rounded-lg bg-[#55B98A]/10 border border-[#55B98A]/30 text-[#55B98A] text-xs flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{mergeResult}</span>
          </div>
        )}

        {/* Duplicate Groups List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-[#969CA5]">Scanning customer registry for duplicates...</div>
          ) : duplicateGroups.length === 0 ? (
            <div className="rounded-lg p-10 text-center border border-[#2A2E34] bg-[#17191D] text-[#969CA5] space-y-2">
              <CheckCircle2 size={32} className="text-[#55B98A] mx-auto" />
              <h3 className="text-sm font-semibold text-[#F4F4F2]">No Unresolved Duplicate Records</h3>
              <p className="text-xs max-w-md mx-auto text-[#666E79]">
                All customer records have unique identity assignments or have already been merged with preserved audit trails.
              </p>
            </div>
          ) : (
            duplicateGroups.map((group, idx) => (
              <div key={idx} className="rounded-lg p-5 border border-[#2A2E34] bg-[#17191D] space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A2E34] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#E8B65E]" />
                    <span className="text-xs text-[#969CA5]">
                      Shared Contact Number: <strong className="font-mono text-[#F4F4F2]">{group.primary.normalizedPhone}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#E8B65E]/10 text-[#E8B65E] border border-[#E8B65E]/20">
                    {group.matches.length + 1} Profiles Match
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Primary Record */}
                  <div className="p-4 rounded-md bg-[#1D2025] border border-[#2A2E34] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-medium text-[#55B98A] bg-[#55B98A]/10 px-1.5 py-0.5 rounded border border-[#55B98A]/20">
                        Target Primary Profile
                      </span>
                      <span className="font-mono text-[10px] text-[#666E79]">{group.primary.id}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#F4F4F2]">{group.primary.fullName}</div>
                    <div className="text-[#969CA5] text-[11px]">
                      Email: {group.primary.email || 'None'} • City: {group.primary.city}
                    </div>
                    <div className="text-[10px] text-[#666E79]">
                      Registered: {new Date(group.primary.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Subordinate Matches */}
                  <div className="space-y-3">
                    {group.matches.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-md bg-[#1D2025] border border-[#2A2E34] text-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-medium text-[#DF7373] bg-[#DF7373]/10 px-1.5 py-0.5 rounded border border-[#DF7373]/20">
                            Subordinate Duplicate Candidate
                          </span>
                          <span className="font-mono text-[10px] text-[#666E79]">{sub.id}</span>
                        </div>
                        <div className="text-sm font-semibold text-[#F4F4F2]">{sub.fullName}</div>
                        <div className="text-[#969CA5] text-[11px]">
                          Email: {sub.email || 'None'} • City: {sub.city}
                        </div>
                        <button
                          onClick={() => handleMerge(group.primary.id, sub.id)}
                          disabled={mergingId === sub.id}
                          className="w-full py-1.5 rounded bg-[#E9B95E] hover:bg-[#F0C878] text-[#101113] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Merge size={13} />
                          <span>{mergingId === sub.id ? 'Merging...' : `Merge Into ${group.primary.fullName}`}</span>
                        </button>
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
