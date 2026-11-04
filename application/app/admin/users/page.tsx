'use client';

import React from 'react';
import CrmHeader from '@/components/crm/CrmHeader';
import { useCrm } from '@/components/crm/CrmContext';

export default function StaffManagementPage() {
  const { allUsers, currentUser, isSuperAdmin } = useCrm();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <CrmHeader
        title="Staff & Role Permissions"
        subtitle="Super Admin governance: multi-role access control and service-based operational boundaries."
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-[#E9B95E]/20 text-[#0B1E2E] font-bold text-xs border border-[#C29033]/40 flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-[#C29033]">shield_person</span>
              <span>Super Admin: Neel Patel</span>
            </span>
          </div>
        }
      />

      <main className="p-6 sm:p-8 flex-1 flex flex-col min-w-0 space-y-6">
        <div className="clay-card rounded-3xl overflow-hidden border border-[#E3DCCB] bg-white">
          <div className="p-6 border-b border-[#E3DCCB] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-[#153650] text-lg">Employee Directory & Access Matrix</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Each team member is strictly bounded to authorized services and confidential data layers.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-[#F5F2EB] px-3 py-1 rounded-full border border-[#E3DCCB]">
              {allUsers.length} Active Employees
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E5DEC9]/80 text-[#153650] uppercase text-[10px] font-black tracking-wider border-b border-[#E3DCCB]">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-5 py-4">Assigned Role</th>
                  <th className="px-5 py-4">Service Authorizations</th>
                  <th className="px-5 py-4 text-center">Supplier Net Costs</th>
                  <th className="px-5 py-4 text-center">Rate Approval</th>
                  <th className="px-5 py-4 text-center">Customer Merging</th>
                  <th className="px-5 py-4 text-center">Audit Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCCB]/60 bg-[#FBF9F5]/60">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className={`hover:bg-[#F5F2EB] transition-colors ${isCurrent ? 'bg-[#E9B95E]/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-[#E3DCCB] shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[#153650] flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-[#E9B95E] text-[#0B1E2E] uppercase shadow-xs">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-[#E9B95E] text-[#0B1E2E] shadow-xs'
                              : u.role === 'MANAGER'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-[#153650]/10 text-[#153650] border border-[#153650]/20'
                          }`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {u.servicePermissions.map((s) => (
                            <span
                              key={s}
                              className="text-[9px] font-bold px-2 py-0.5 rounded bg-white border border-[#E3DCCB] text-[#153650]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        {u.canViewSupplierCosts ? (
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-300 text-base">cancel</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {u.canApprovePricing ? (
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-300 text-base">cancel</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {u.canMergeCustomers ? (
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-300 text-base">cancel</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {u.canViewAuditLogs ? (
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-slate-300 text-base">cancel</span>
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

