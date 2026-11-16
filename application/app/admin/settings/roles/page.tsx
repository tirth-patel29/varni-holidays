'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import { useCrm } from '@/components/crm/CrmContext';
import { getRolesAndPermissionsDataAction } from '@/app/actions/auth';
import {
  ShieldCheck,
  Check,
  X,
  Lock,
  UserCheck,
  Shield,
  Key,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function RolesPermissionsPage() {
  const { currentUser } = useCrm();
  const [roles, setRoles] = useState<readonly any[]>([]);
  const [permissions, setPermissions] = useState<readonly any[]>([]);
  const [defaultRolePermissions, setDefaultRolePermissions] = useState<Record<string, readonly string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRBAC() {
      try {
        const res = await getRolesAndPermissionsDataAction();
        if (res.success) {
          setRoles(res.roles || []);
          setPermissions(res.permissions || []);
          setDefaultRolePermissions(res.defaultRolePermissions || {});
        }
      } catch (err) {
        console.error('Failed to load RBAC data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRBAC();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Roles & Capability Permissions Matrix"
        subtitle="Role-Based Access Control (RBAC) boundaries, data visibility permissions, and administrative capabilities"
        breadcrumbs={[
          { label: 'Settings & Security', href: '/admin/settings/security' },
          { label: 'Roles & Permissions' },
        ]}
        actions={
          <span className="px-3 py-1.5 bg-[#FFFFFF] text-[#153650] text-xs font-bold border border-[#E5E8ED] rounded-none inline-flex items-center gap-2 shadow-xs">
            <ShieldCheck size={14} className="text-[#168653]" />
            <span>Server Authorization Active</span>
          </span>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((rd) => {
            const rolePerms = defaultRolePermissions[rd.code] || [];
            const isAll = rolePerms.length === permissions.length;

            return (
              <div key={rd.code} className="bg-[#FFFFFF] border border-[#E5E8ED] p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#24689B] bg-[#EFF6FF] px-2 py-0.5 border border-[#BFDBFE]">
                      {rd.code}
                    </span>
                    {rd.code === currentUser.role && (
                      <span className="text-[10px] font-bold text-[#168653] bg-[#DEF7EC] px-1.5 py-0.5">
                        Your Role
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#153650] mb-1 font-headline">
                    {rd.name}
                  </h3>
                  <p className="text-xs text-[#718096] leading-relaxed mb-4">
                    {rd.description}
                  </p>

                  <div className="space-y-1.5 border-t border-[#E5E8ED] pt-3 text-xs">
                    <span className="text-[10px] font-mono text-[#718096] uppercase block font-bold mb-2">
                      Granted Scope ({isAll ? 'Full System Access' : `${rolePerms.length} Capabilities`})
                    </span>
                    {permissions.slice(0, 8).map((p) => {
                      const granted = isAll || rolePerms.includes(p.code);
                      return (
                        <div key={p.code} className="flex justify-between items-center py-0.5">
                          <span className="text-[#4A5568] text-[11px] truncate max-w-[200px]" title={p.description}>
                            {p.code}
                          </span>
                          {granted ? (
                            <Check size={13} className="text-[#168653]" />
                          ) : (
                            <X size={13} className="text-[#CBD5E1]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E8ED] mt-4 flex items-center justify-between text-[11px] text-[#718096]">
                  <span>System Protected</span>
                  <Link href="/admin/users" className="text-[#24689B] font-bold hover:underline">
                    View Assigned Staff &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* PERMISSIONS REGISTRY TABLE */}
        <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E5E8ED] bg-[#FFFFFF]">
            <h3 className="text-sm font-bold text-[#153650] font-headline">
              Granular Permission Registry
            </h3>
            <p className="text-xs text-[#718096] mt-0.5">
              Every sensitive action is checked server-side via <code>requirePermission()</code> before execution.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                <tr>
                  <th className="px-4 py-3">Permission Identifier</th>
                  <th className="px-4 py-3">Domain Category</th>
                  <th className="px-4 py-3">Operational Boundary Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED]">
                {permissions.map((p) => (
                  <tr key={p.code} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-[#153650]">
                      {p.code}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#F1F5F9] text-[#475569]">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4A5568]">
                      {p.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
