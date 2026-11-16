'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import {
  getEmployeesListAction,
  inviteEmployeeAction,
  updateEmployeeRoleAction,
  toggleEmployeeStatusAction,
  getRolesAndPermissionsDataAction,
} from '@/app/actions/auth';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  Lock,
  UserCheck,
  Shield,
  Key,
  UserPlus,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
  Clock,
  Ban,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export default function StaffManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [roles, setRoles] = useState<readonly any[]>([]);
  const [permissions, setPermissions] = useState<readonly any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'invitations'>('active');

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleCode, setInviteRoleCode] = useState('SALES_EXECUTIVE');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Edit Role modal
  const [editUserModal, setEditUserModal] = useState<any | null>(null);
  const [editRoleCode, setEditRoleCode] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, rbacRes] = await Promise.all([
        getEmployeesListAction(),
        getRolesAndPermissionsDataAction(),
      ]);

      if (empRes.success) {
        setEmployees(empRes.employees || []);
        setPendingInvitations(empRes.pendingInvitations || []);
      }
      if (rbacRes.success) {
        setRoles(rbacRes.roles || []);
        setPermissions(rbacRes.permissions || []);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSubmitting(true);
    setInviteError(null);
    setInviteSuccessMessage(null);

    try {
      const res = await inviteEmployeeAction({
        fullName: inviteFullName,
        email: inviteEmail,
        roleCode: inviteRoleCode,
      });

      if (!res.success) {
        setInviteError(res.error || 'Failed to dispatch invitation.');
      } else {
        setInviteSuccessMessage(`Invitation dispatched to ${inviteEmail} via Resend. The link expires in 48 hours.`);
        setInviteFullName('');
        setInviteEmail('');
        await loadData();
      }
    } catch (err: any) {
      setInviteError(err.message || 'Invitation request failed.');
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const confirmMsg = nextStatus === 'DISABLED'
      ? `Are you sure you want to suspend ${user.fullName}? All their active sessions will be terminated immediately.`
      : `Reactivate account for ${user.fullName}?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await toggleEmployeeStatusAction(user.id, nextStatus);
      if (res.success) {
        await loadData();
      } else {
        alert(res.error || 'Failed to update status.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    setEditSubmitting(true);

    try {
      const res = await updateEmployeeRoleAction({
        targetUserId: editUserModal.id,
        newRoleCode: editRoleCode as any,
      });

      if (res.success) {
        setEditUserModal(null);
        await loadData();
      } else {
        alert(res.error || 'Failed to update role.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA] text-[#172B45]">
      <PageHeader
        title="Staff & Team Governance"
        subtitle="Owner-controlled onboarding, RBAC boundaries, and multi-factor session security across Gujarat operations"
        breadcrumbs={[
          { label: 'Settings & Security', href: '/admin/settings/security' },
          { label: 'Team Members' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInviteModalOpen(true);
                setInviteSuccessMessage(null);
                setInviteError(null);
              }}
              className="px-3.5 py-1.5 bg-[#153650] hover:bg-[#1E4565] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <UserPlus size={14} className="text-[#E9B95E]" />
              <span>Invite New Employee</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              className="p-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] text-[#718096] rounded-none"
              title="Refresh Directory"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E5E8ED] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-mono uppercase tracking-wider transition-colors ${
              activeTab === 'active'
                ? 'border-[#153650] text-[#153650]'
                : 'border-transparent text-[#718096] hover:text-[#153650]'
            }`}
          >
            <Users size={14} />
            <span>Active Staff ({employees.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-mono uppercase tracking-wider transition-colors ${
              activeTab === 'invitations'
                ? 'border-[#153650] text-[#153650]'
                : 'border-transparent text-[#718096] hover:text-[#153650]'
            }`}
          >
            <Clock size={14} />
            <span>Pending Invitations ({pendingInvitations.length})</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE STAFF TABLE */}
        {activeTab === 'active' && (
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">MFA Status</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8ED]">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-xs text-[#718096]">
                        {loading ? 'Loading team directory...' : 'No staff accounts exist yet. Use the Invite Employee button above to add team members.'}
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xs shrink-0">
                              {emp.fullName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-[#153650] block">{emp.fullName}</span>
                              <span className="text-[11px] text-[#718096]">{emp.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                            {emp.roleCode.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#64748B] font-mono text-[11px]">
                          {emp.phone || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {emp.twoFactorEnabled ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#168653] bg-[#DEF7EC] px-2 py-0.5 border border-[#BCF0DA]">
                              <ShieldCheck size={12} />
                              <span>TOTP Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5">
                              <span>Pending Setup</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold font-mono px-2 py-0.5 ${
                              emp.status === 'ACTIVE'
                                ? 'bg-[#DEF7EC] text-[#168653]'
                                : 'bg-[#FEE2E2] text-[#DC2626]'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#718096] text-[11px]">
                          {emp.lastLoginAt ? new Date(emp.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditUserModal(emp);
                              setEditRoleCode(emp.roleCode);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-[#153650] hover:bg-[#F1F5F9] border border-[#CBD5E1]"
                          >
                            Edit Role
                          </button>
                          {emp.roleCode !== 'OWNER' && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(emp)}
                              className={`px-2 py-1 text-[11px] font-semibold border ${
                                emp.status === 'ACTIVE'
                                  ? 'text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]'
                                  : 'text-[#168653] border-[#BCF0DA] hover:bg-[#DEF7EC]'
                              }`}
                            >
                              {emp.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENDING INVITATIONS TABLE */}
        {activeTab === 'invitations' && (
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                  <tr>
                    <th className="px-4 py-3">Invitee</th>
                    <th className="px-4 py-3">Assigned Role</th>
                    <th className="px-4 py-3">Dispatched Date</th>
                    <th className="px-4 py-3">Expires At</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8ED]">
                  {pendingInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-xs text-[#718096]">
                        No pending invitations. All invited staff members have completed onboarding.
                      </td>
                    </tr>
                  ) : (
                    pendingInvitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                          <span className="font-bold text-[#153650] block">{inv.fullName}</span>
                          <span className="text-[11px] text-[#718096]">{inv.email}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF]">
                            {inv.roleCode.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#64748B]">
                          {new Date(inv.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-[#64748B]">
                          {new Date(inv.expiresAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#FEF3C7] text-[#D97706]">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* INVITE EMPLOYEE MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <h2 className="text-sm font-bold text-[#153650] font-headline flex items-center gap-1.5">
                <UserPlus size={16} className="text-[#153650]" />
                <span>Invite New Employee</span>
              </h2>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-[#A0AEC0] hover:text-[#172B45]"
              >
                <X size={16} />
              </button>
            </div>

            {inviteSuccessMessage ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-10 h-10 bg-[#DEF7EC] text-[#168653] flex items-center justify-center rounded-full mx-auto">
                  <CheckCircle2 size={22} />
                </div>
                <p className="text-xs text-[#168653] font-bold leading-relaxed">
                  {inviteSuccessMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 bg-[#153650] text-[#FFFFFF] text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-3.5">
                {inviteError && (
                  <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1">
                    Employee Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    placeholder="e.g. Priyaben Shah"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="priya@varniholidays.com"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1">
                    Role & Operational Boundary
                  </label>
                  <select
                    value={inviteRoleCode}
                    onChange={(e) => setInviteRoleCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650]"
                  >
                    {roles.filter((r) => r.code !== 'OWNER').map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B]">
                  &bull; A single-use 48-hour onboarding link will be sent via Resend.<br />
                  &bull; The employee will be required to configure mandatory TOTP MFA.
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-[#718096] hover:bg-[#F1F5F9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteSubmitting}
                    className="px-4 py-2 bg-[#153650] hover:bg-[#1E4565] disabled:opacity-50 text-[#FFFFFF] text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {inviteSubmitting ? 'Dispatching...' : 'Send Secure Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editUserModal && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <h2 className="text-sm font-bold text-[#153650] font-headline">
                Modify Role: {editUserModal.fullName}
              </h2>
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="text-[#A0AEC0] hover:text-[#172B45]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1">
                  Select Role
                </label>
                <select
                  value={editRoleCode}
                  onChange={(e) => setEditRoleCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650]"
                >
                  {roles.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-3 py-2 text-xs font-semibold text-[#718096]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 bg-[#153650] text-[#FFFFFF] text-xs font-bold"
                >
                  {editSubmitting ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
