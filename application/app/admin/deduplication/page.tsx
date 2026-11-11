'use client';

import React, { useState, useEffect } from 'react';
import { getPotentialDuplicatesAction, mergeCustomersAction } from '@/app/actions/crm';
import { useCrm } from '@/components/crm/CrmContext';
import { Breadcrumbs } from '@/components/admin/Breadcrumbs';
import {
  GitMerge,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  RotateCw,
} from 'lucide-react';

export default function DeduplicationPage() {
  const { currentUser } = useCrm();
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mergeResult, setMergeResult] = useState<string | null>(null);
  const [mergingId, setMergingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPotentialDuplicatesAction();
      setDuplicateGroups(data || []);
    } catch (err) {
      console.error('Failed to load duplicate groups:', err);
    } finally {
      setLoading(false);
    }
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
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        <Breadcrumbs items={[{ label: 'Settings & Team', href: '/admin/settings/roles' }, { label: 'Customer Deduplication' }]} />
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#24689B] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Customer Registry Integrity
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Customer Deduplication & Merging
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Admin-controlled identity resolution: merge duplicates without losing historical travel inquiries or quotations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-xs font-bold text-[#153650] rounded-none inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <RotateCw size={13} className={loading ? 'animate-spin text-[#24689B]' : 'text-[#718096]'} />
              <span>Rescan Registry</span>
            </button>
          </div>
        </div>

        {/* Governance Rules Notice */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-4 sm:p-5 shadow-xs text-xs text-[#718096] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#153650]">
            <ShieldCheck size={16} className="text-[#168653]" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Non-Destructive Merge Governance Rules
            </span>
          </div>
          <div className="space-y-1 text-xs leading-relaxed text-[#172B45]">
            <p>
              1. Customers in India frequently share mobile numbers across joint families and corporate bookings. <strong className="text-[#D54747]">Automatic merging is strictly prohibited.</strong>
            </p>
            <p>
              2. When an authorized administrator merges two profiles, the subordinate customer record is archived (never permanently erased), and all historical leads, activity timelines, and quotations are re-attributed to the primary customer profile with a permanent audit trail.
            </p>
          </div>
        </div>

        {mergeResult && (
          <div className="p-3.5 rounded-none bg-[#F0FDF4] border border-[#D1F0E0] text-[#168653] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{mergeResult}</span>
          </div>
        )}

        {/* Duplicate Groups List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-[#718096] bg-[#FFFFFF] border border-[#E5E8ED] rounded-none">
              Scanning customer registry for duplicates...
            </div>
          ) : duplicateGroups.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-10 text-center text-[#718096] space-y-2 shadow-xs">
              <CheckCircle2 size={32} className="text-[#168653] mx-auto" />
              <h3 className="text-sm font-bold text-[#153650]">No Unresolved Duplicate Records</h3>
              <p className="text-xs max-w-md mx-auto text-[#718096]">
                All customer records have unique phone identity assignments or have already been merged with preserved audit trails.
              </p>
            </div>
          ) : (
            duplicateGroups.map((group, idx) => (
              <div key={idx} className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#24689B]" />
                    <span className="text-xs text-[#718096]">
                      Shared Contact Number: <strong className="font-mono text-[#153650]">{group.primary.normalizedPhone}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#FFFBEB] text-[#C58A27] border border-[#FCE8C3]">
                    {group.matches.length + 1} Profiles Match
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Primary Record */}
                  <div className="p-4 rounded-none bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#168653] bg-[#F0FDF4] px-2 py-0.5 rounded-none border border-[#D1F0E0]">
                        Target Primary Profile
                      </span>
                      <span className="font-mono text-[10px] text-[#718096]">{group.primary.id}</span>
                    </div>
                    <div className="text-sm font-bold text-[#153650]">{group.primary.fullName}</div>
                    <div className="text-[#718096] text-[11px]">
                      Email: {group.primary.email || 'None'} • City: {group.primary.city || 'Anand'}
                    </div>
                    <div className="text-[10px] text-[#718096]">
                      Registered: {new Date(group.primary.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Subordinate Matches */}
                  <div className="space-y-3">
                    {group.matches.map((sub: any) => (
                      <div key={sub.id} className="p-4 rounded-none bg-[#FFFFFF] border border-[#E5E8ED] text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#C58A27] bg-[#FFFBEB] px-2 py-0.5 rounded-none border border-[#FCE8C3]">
                            Duplicate Candidate
                          </span>
                          <span className="font-mono text-[10px] text-[#718096]">{sub.id}</span>
                        </div>
                        <div className="font-bold text-[#153650]">{sub.fullName}</div>
                        <div className="text-[#718096] text-[11px]">
                          Email: {sub.email || 'None'} • City: {sub.city || 'Anand'}
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleMerge(group.primary.id, sub.id)}
                            disabled={mergingId === sub.id}
                            className="px-3 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <GitMerge size={13} className={mergingId === sub.id ? 'animate-spin' : ''} />
                            <span>Merge into Primary</span>
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
