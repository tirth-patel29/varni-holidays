'use client';

import React from 'react';
import PageHeader from '@/components/admin/PageHeader';
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
      <PageHeader
        title="Staff & Team Directory"
        subtitle="Super Admin governance, role-based capability boundaries, and confidential data visibility across Gujarat desks"
        breadcrumbs={[
          { label: 'Settings & Team', href: '/admin/users' },
          { label: 'Team Members' },
        ]}
        actions={
          <span className="px-3 py-1.5 bg-[#FFFFFF] text-[#153650] text-xs font-bold border border-[#E5E8ED] rounded-none inline-flex items-center gap-2 shadow-xs">
            <ShieldCheck size={14} className="text-[#168653]" />
            <span>Super Admin Protocol Active</span>
          </span>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
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
                        isCurrent ? 'bg-[#FAFBFD]' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#153650]">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#153650]">{u.fullName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold font-mono bg-[#153650] text-[#FFFFFF] rounded-none">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#718096] font-mono block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-[#153650] text-[#E9B95E] border border-[#153650]'
                              : u.role === 'ADMIN'
                              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                              : u.role === 'ACCOUNTANT'
                              ? 'bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]'
                              : 'bg-[#F1F5F9] text-[#153650] border border-[#CBD5E1]'
                          }`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.servicePermissions.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#E5E8ED] text-[10px] font-mono font-medium text-[#4A5568]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.canViewSupplierCosts ? (
                          <Check size={14} className="text-[#168653] mx-auto" />
                        ) : (
                          <X size={14} className="text-[#CBD5E1] mx-auto" />
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.canApprovePricing ? (
                          <Check size={14} className="text-[#168653] mx-auto" />
                        ) : (
                          <X size={14} className="text-[#CBD5E1] mx-auto" />
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.canMergeCustomers ? (
                          <Check size={14} className="text-[#168653] mx-auto" />
                        ) : (
                          <X size={14} className="text-[#CBD5E1] mx-auto" />
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.canViewAuditLogs ? (
                          <Check size={14} className="text-[#168653] mx-auto" />
                        ) : (
                          <X size={14} className="text-[#CBD5E1] mx-auto" />
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
