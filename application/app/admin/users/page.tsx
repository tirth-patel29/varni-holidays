'use client';

import React from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  Lock,
} from 'lucide-react';

export default function StaffManagementPage() {
  const { allUsers, currentUser } = useCrm();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#101113] text-[#F4F4F2]">
      <CrmHeader
        title="Staff & Role Governance"
        subtitle="Super Admin access controls and service-based operational boundaries."
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-[#1D2025] text-[#E9B95E] text-xs font-medium border border-[#2A2E34] inline-flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Super Admin Active</span>
            </span>
          </div>
        }
      />

      <main className="p-6 flex-1 flex flex-col min-w-0 space-y-5 max-w-7xl">
        <div className="rounded-lg overflow-hidden border border-[#2A2E34] bg-[#17191D]">
          <div className="p-4 border-b border-[#2A2E34] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F4F4F2]">Employee Directory & Permission Matrix</h2>
              <p className="text-xs text-[#969CA5]">
                Each staff member is restricted to designated services and confidential data layers
              </p>
            </div>
            <span className="text-xs font-mono text-[#969CA5] bg-[#1D2025] px-2.5 py-1 rounded border border-[#2A2E34]">
              {allUsers.length} Staff Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101113] text-[#666E79] uppercase text-[10px] font-medium tracking-wider border-b border-[#2A2E34]">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Service Scope</th>
                  <th className="px-4 py-3 text-center">Supplier Net Costs</th>
                  <th className="px-4 py-3 text-center">Rate Approval</th>
                  <th className="px-4 py-3 text-center">Customer Merging</th>
                  <th className="px-4 py-3 text-center">Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2329] text-[#969CA5]">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className={`hover:bg-[#1D2025]/60 transition-colors ${isCurrent ? 'bg-[#1D2025]/30' : ''}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-[#1D2025] border border-[#2A2E34] flex items-center justify-center text-[#E9B95E] font-bold text-xs shrink-0">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-[#F4F4F2] flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1 rounded bg-[#E9B95E]/10 text-[#E9B95E] border border-[#E9B95E]/20">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#666E79]">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-[#1D2025] text-[#F4F4F2] border border-[#2A2E34]">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.servicePermissions.map((s) => (
                            <span
                              key={s}
                              className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#1D2025] border border-[#2A2E34] text-[#969CA5]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {u.canViewSupplierCosts ? (
                          <span className="inline-flex items-center justify-center text-[#55B98A]">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[#666E79]">
                            <Lock size={12} />
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {u.canApprovePricing ? (
                          <span className="inline-flex items-center justify-center text-[#55B98A]">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[#666E79]">
                            <X size={13} />
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {u.canMergeCustomers ? (
                          <span className="inline-flex items-center justify-center text-[#55B98A]">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[#666E79]">
                            <X size={13} />
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {u.canViewAuditLogs ? (
                          <span className="inline-flex items-center justify-center text-[#55B98A]">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[#666E79]">
                            <X size={13} />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
