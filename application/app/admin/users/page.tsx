'use client';

import React from 'react';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  Lock,
  UserCheck,
  Shield,
  Key,
} from 'lucide-react';

export default function StaffManagementPage() {
  const { allUsers, currentUser } = useCrm();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E8ED]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 bg-[#24689B] inline-block" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718096] font-bold">
                Governance & Staff Directory
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#153650] leading-tight">
              Staff & Role Access Governance
            </h1>
            <p className="text-xs text-[#718096] mt-1">
              Super Admin access controls, role-based boundaries, and confidential data visibility across Gujarat desks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <span className="px-3 py-1.5 bg-[#FFFFFF] text-[#153650] text-xs font-bold border border-[#E5E8ED] rounded-none inline-flex items-center gap-2 shadow-xs">
              <ShieldCheck size={14} className="text-[#168653]" />
              <span>Super Admin Protocol Active</span>
            </span>
          </div>
        </div>

        {/* Directory & Permission Matrix Table */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] rounded-none shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF]">
            <div>
              <h2 className="text-sm font-bold text-[#153650] uppercase tracking-wider font-mono">
                Employee Directory & Access Scope
              </h2>
              <p className="text-xs text-[#718096] mt-0.5">
                Each team member is strictly bounded to designated travel services and administrative privileges
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#153650] bg-[#F1F5F9] px-3 py-1 rounded-none border border-[#CBD5E1] self-start sm:self-auto">
              {allUsers.length} Staff Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Service Scope</th>
                  <th className="px-4 py-3 text-center">Net Costs</th>
                  <th className="px-4 py-3 text-center">Rate Approval</th>
                  <th className="px-4 py-3 text-center">Merge Customers</th>
                  <th className="px-4 py-3 text-center">Audit Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED] text-[#172B45]">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        isCurrent ? 'bg-[#F0FDF4]/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-none bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#153650]">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#153650] flex items-center gap-1.5 leading-tight">
                              <span>{u.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-none bg-[#153650] text-[#E9B95E] font-bold font-mono">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#718096] font-mono mt-0.5 block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#F1F5F9] text-[#153650] border border-[#CBD5E1]">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {u.servicePermissions.map((s) => (
                            <span
                              key={s}
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-none bg-[#FFFFFF] border border-[#E2E8F0] text-[#24689B]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.canViewSupplierCosts ? (
                          <span className="inline-flex items-center justify-center text-[#168653]" title="Permitted">
                            <Check size={15} strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[#94A3B8]" title="Restricted">
                            <Lock size={13} />
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.canApprovePricing ? (
                          <span className="inline-flex items-center justify-center text-[#168653]" title="Permitted">
                            <Check size={15} strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[#CBD5E1]" title="No">
                            <X size={14} />
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.canMergeCustomers ? (
                          <span className="inline-flex items-center justify-center text-[#168653]" title="Permitted">
                            <Check size={15} strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[#CBD5E1]" title="No">
                            <X size={14} />
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.canViewAuditLogs ? (
                          <span className="inline-flex items-center justify-center text-[#168653]" title="Permitted">
                            <Check size={15} strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-[#CBD5E1]" title="No">
                            <X size={14} />
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
