'use client';

import React from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { useCrm } from '@/components/crm/CrmContext';
import {
  ShieldCheck,
  Check,
  X,
  Lock,
  UserCheck,
  Shield,
  Key,
} from 'lucide-react';

export default function RolesPermissionsPage() {
  const { currentUser } = useCrm();

  const roleDefinitions = [
    {
      role: 'SUPER_ADMIN',
      title: 'Executive Super Administrator',
      description: 'Unrestricted full access across all modules, rate governance, financial ledgers, user management, and security audit logs.',
      permissions: {
        allLeads: true,
        userMgmt: true,
        customerMerge: true,
        confidentialRates: true,
        packageCosts: true,
        auditLogs: true,
        sendQuotes: true,
        recordPayments: true,
        integrations: true,
      },
    },
    {
      role: 'ADMIN',
      title: 'Operations Administrator',
      description: 'Manages operational workflows, customer dossiers, bookings, quotations, and staff assignments.',
      permissions: {
        allLeads: true,
        userMgmt: false,
        customerMerge: true,
        confidentialRates: true,
        packageCosts: true,
        auditLogs: true,
        sendQuotes: true,
        recordPayments: true,
        integrations: false,
      },
    },
    {
      role: 'TRAVEL_CONSULTANT',
      title: 'Senior Travel Specialist',
      description: 'Handles client enquiries, custom holiday planning, quotations dispatch, follow-up calls, and customer updates.',
      permissions: {
        allLeads: true,
        userMgmt: false,
        customerMerge: false,
        confidentialRates: false,
        packageCosts: false,
        auditLogs: false,
        sendQuotes: true,
        recordPayments: false,
        integrations: false,
      },
    },
    {
      role: 'OPERATIONS',
      title: 'Ticketing & Operations Desk',
      description: 'Manages flight ticketing, PNR generation, hotel voucher issuance, and visa embassy submissions.',
      permissions: {
        allLeads: true,
        userMgmt: false,
        customerMerge: false,
        confidentialRates: false,
        packageCosts: false,
        auditLogs: false,
        sendQuotes: false,
        recordPayments: false,
        integrations: false,
      },
    },
    {
      role: 'ACCOUNTANT',
      title: 'Finance & Accounts',
      description: 'Financial ledger reconciliations, invoice auditing, payment recording, and tax compliance.',
      permissions: {
        allLeads: false,
        userMgmt: false,
        customerMerge: false,
        confidentialRates: true,
        packageCosts: false,
        auditLogs: true,
        sendQuotes: false,
        recordPayments: true,
        integrations: false,
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Roles & Capability Permissions Matrix"
        subtitle="Role-Based Access Control (RBAC) boundaries, data visibility permissions, and administrative capabilities"
        breadcrumbs={[
          { label: 'Settings & Team', href: '/admin/users' },
          { label: 'Roles & Permissions' },
        ]}
        actions={
          <span className="px-3 py-1.5 bg-[#FFFFFF] text-[#153650] text-xs font-bold border border-[#E5E8ED] rounded-none inline-flex items-center gap-2 shadow-xs">
            <ShieldCheck size={14} className="text-[#168653]" />
            <span>Server Authorization Active</span>
          </span>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleDefinitions.map((rd) => (
            <div key={rd.role} className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#24689B] bg-[#EFF6FF] px-2 py-0.5 border border-[#BFDBFE]">
                    {rd.role}
                  </span>
                  {rd.role === currentUser.role && (
                    <span className="text-[10px] font-bold text-[#168653] bg-[#DEF7EC] px-1.5 py-0.5">
                      Your Role
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#153650] mb-1 font-headline">
                  {rd.title}
                </h3>
                <p className="text-xs text-[#718096] leading-relaxed mb-4">
                  {rd.description}
                </p>

                <div className="space-y-2 border-t border-[#E5E8ED] pt-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5568]">Enquiry Pipeline</span>
                    {rd.permissions.allLeads ? <Check size={14} className="text-[#168653]" /> : <X size={14} className="text-[#CBD5E1]" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5568]">Manage Team Accounts</span>
                    {rd.permissions.userMgmt ? <Check size={14} className="text-[#168653]" /> : <X size={14} className="text-[#CBD5E1]" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5568]">Merge Customer Profiles</span>
                    {rd.permissions.customerMerge ? <Check size={14} className="text-[#168653]" /> : <X size={14} className="text-[#CBD5E1]" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5568]">Confidential Net Rates</span>
                    {rd.permissions.confidentialRates ? <Check size={14} className="text-[#168653]" /> : <X size={14} className="text-[#CBD5E1]" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5568]">System Audit Logs</span>
                    {rd.permissions.auditLogs ? <Check size={14} className="text-[#168653]" /> : <X size={14} className="text-[#CBD5E1]" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5568]">Dispatch Quotations</span>
                    {rd.permissions.sendQuotes ? <Check size={14} className="text-[#168653]" /> : <X size={14} className="text-[#CBD5E1]" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5568]">Record Payments</span>
                    {rd.permissions.recordPayments ? <Check size={14} className="text-[#168653]" /> : <X size={14} className="text-[#CBD5E1]" />}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A5568]">System Integrations</span>
                    {rd.permissions.integrations ? <Check size={14} className="text-[#168653]" /> : <X size={14} className="text-[#CBD5E1]" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

