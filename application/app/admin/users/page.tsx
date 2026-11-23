'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import RoleSelectorDropdown from '@/components/admin/RoleSelectorDropdown';
import {
  getEmployeesListAction,
  inviteEmployeeAction,
  resendEmployeeInvitationAction,
  revokeEmployeeInvitationAction,
  checkInvitationDeliveryStatusAction,
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
  Copy,
  Send,
  AlertTriangle,
} from 'lucide-react';

export default function StaffManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [roles, setRoles] = useState<readonly any[]>([]);
  const [permissions, setPermissions] = useState<readonly any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'invitations'>('active');

  // Action feedback states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleCode, setInviteRoleCode] = useState('SALES_EXECUTIVE');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteSuccessData, setInviteSuccessData] = useState<{
    message: string;
    email: string;
    resendEmailId?: string;
    inviteUrl?: string;
  } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Edit Role modal
  const [editUserModal, setEditUserModal] = useState<any | null>(null);
  const [editRoleCode, setEditRoleCode] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

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
    setInviteSuccessData(null);

    try {
      const res = await inviteEmployeeAction({
        fullName: inviteFullName,
        email: inviteEmail,
        roleCode: inviteRoleCode,
      });

      if (!res.success) {
        setInviteError(res.error || 'Failed to dispatch invitation.');
      } else {
        setInviteSuccessData({
          message: `Invitation successfully dispatched to ${inviteEmail} via Resend. The link is single-use and expires in 48 hours.`,
          email: inviteEmail,
          resendEmailId: res.resendEmailId,
          inviteUrl: res.inviteUrl,
        });
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

  const handleResendInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Resend a fresh invitation email to ${email}? This will invalidate any previous link.`)) return;
    setActionLoadingId(`resend-${invitationId}`);
    try {
      const res = await resendEmployeeInvitationAction(invitationId);
      if (res.success) {
        showToast(`Fresh invitation email dispatched to ${email}! Resend ID: ${res.resendEmailId || 'generated'}`, 'success');
        await loadData();
      } else {
        showToast(res.error || 'Failed to resend invitation.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Resend request failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevokeInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Revoke the invitation for ${email}? They will no longer be able to use the link to onboard.`)) return;
    setActionLoadingId(`revoke-${invitationId}`);
    try {
      const res = await revokeEmployeeInvitationAction(invitationId);
      if (res.success) {
        showToast(`Invitation for ${email} has been revoked.`, 'success');
        await loadData();
      } else {
        showToast(res.error || 'Failed to revoke invitation.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Revoke request failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckDelivery = async (invitationId: string) => {
    setActionLoadingId(`check-${invitationId}`);
    try {
      const res = await checkInvitationDeliveryStatusAction(invitationId);
      if (res.success) {
        showToast(`Updated live delivery status: ${res.deliveryStatus}`, 'success');
        await loadData();
      } else {
        showToast(res.error || 'Could not sync Resend delivery status.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Status sync failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
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
                setInviteSuccessData(null);
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

        {/* TAB 2: INVITATIONS MANAGEMENT TABLE */}
        {activeTab === 'invitations' && (
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xs overflow-hidden">
            {feedbackToast && (
              <div
                className={`p-3 text-xs font-semibold flex items-center justify-between border-b ${
                  feedbackToast.type === 'success'
                    ? 'bg-[#DEF7EC] text-[#168653] border-[#BCF0DA]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {feedbackToast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{feedbackToast.message}</span>
                </div>
                <button type="button" onClick={() => setFeedbackToast(null)} className="text-current hover:opacity-75">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-[#718096] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E8ED]">
                  <tr>
                    <th className="px-4 py-3">Invitee</th>
                    <th className="px-4 py-3">Assigned Role</th>
                    <th className="px-4 py-3">Dispatched / Expiry</th>
                    <th className="px-4 py-3">Resend Delivery Status</th>
                    <th className="px-4 py-3">Resend ID</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8ED]">
                  {pendingInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-xs text-[#718096]">
                        No invitations on record. Click <strong>&quot;Invite Employee&quot;</strong> above to dispatch staff onboarding invitations.
                      </td>
                    </tr>
                  ) : (
                    pendingInvitations.map((inv) => {
                      const isExpired = new Date(inv.expiresAt) < new Date();
                      const isActionLoading = actionLoadingId?.includes(inv.id);

                      return (
                        <tr key={inv.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-4 py-3">
                            <span className="font-bold text-[#153650] block">{inv.fullName}</span>
                            <span className="text-[11px] text-[#718096] font-mono">{inv.email}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                              {inv.roleCode.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#64748B] text-[11px]">
                            <div>Dispatched: {new Date(inv.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                            <div className={`mt-0.5 font-semibold ${isExpired ? 'text-[#DC2626]' : 'text-[#718096]'}`}>
                              {isExpired ? 'Expired' : `Expires: ${new Date(inv.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {inv.status === 'ACCEPTED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-[#DEF7EC] text-[#168653] border border-[#BCF0DA]">
                                <Check size={12} /> Accepted & Active
                              </span>
                            ) : inv.status === 'REVOKED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                                <Ban size={12} /> Revoked
                              </span>
                            ) : inv.deliveryStatus === 'DELIVERED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-[#DEF7EC] text-[#168653] border border-[#BCF0DA]">
                                <CheckCircle2 size={12} /> Delivered
                              </span>
                            ) : inv.deliveryStatus === 'FAILED' || inv.deliveryStatus === 'BOUNCED' ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                                  <AlertTriangle size={12} /> {inv.deliveryStatus}
                                </span>
                                {inv.deliveryError && (
                                  <span className="block text-[10px] text-[#DC2626] max-w-[200px] truncate mt-0.5" title={inv.deliveryError}>
                                    {inv.deliveryError}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                                <Send size={11} /> Sent via Resend
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {inv.resendEmailId ? (
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 border border-[#E2E8F0]">
                                  {inv.resendEmailId.slice(0, 12)}...
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(inv.resendEmailId, `id-${inv.id}`)}
                                  className="text-[#718096] hover:text-[#153650]"
                                  title="Copy Resend Message ID"
                                >
                                  {copiedId === `id-${inv.id}` ? <Check size={12} className="text-[#168653]" /> : <Copy size={12} />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#A0AEC0] font-mono">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {inv.resendEmailId && inv.status !== 'ACCEPTED' && (
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleCheckDelivery(inv.id)}
                                  className="p-1 text-[#24689B] hover:bg-[#EFF6FF] border border-[#BFDBFE] disabled:opacity-50"
                                  title="Check Live Delivery Status via Resend API"
                                >
                                  <RefreshCw size={12} className={actionLoadingId === `check-${inv.id}` ? 'animate-spin' : ''} />
                                </button>
                              )}

                              {inv.status !== 'ACCEPTED' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleResendInvitation(inv.id, inv.email)}
                                    className="px-2 py-1 text-[11px] font-semibold text-[#153650] hover:bg-[#F1F5F9] border border-[#CBD5E1] disabled:opacity-50"
                                  >
                                    {actionLoadingId === `resend-${inv.id}` ? 'Resending...' : 'Resend'}
                                  </button>
                                  {inv.status !== 'REVOKED' && (
                                    <button
                                      type="button"
                                      disabled={isActionLoading}
                                      onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                                      className="px-2 py-1 text-[11px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2] border border-[#FECACA] disabled:opacity-50"
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
          <div className="bg-[#FFFFFF] border border-[#E5E8ED] shadow-xl max-w-lg w-full p-6 space-y-4">
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

            {inviteSuccessData ? (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-[#DEF7EC] border border-[#BCF0DA] text-xs text-[#168653] flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Invitation Dispatched via Resend</span>
                    <span>An official onboarding invitation email was successfully delivered to <strong>{inviteSuccessData.email}</strong>.</span>
                    {inviteSuccessData.resendEmailId && (
                      <span className="block mt-1 font-mono text-[10px] text-[#0E7090]">
                        Resend Tracking ID: {inviteSuccessData.resendEmailId}
                      </span>
                    )}
                  </div>
                </div>

                {inviteSuccessData.inviteUrl && (
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <span className="text-[11px] font-bold text-[#153650] block">
                      Direct Onboarding Link (Backup / Instant Access):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={inviteSuccessData.inviteUrl}
                        className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#CBD5E1] text-[11px] font-mono text-[#1E293B]"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyText(inviteSuccessData.inviteUrl!, 'modal-link')}
                        className="px-3 py-1.5 bg-[#153650] text-[#FFFFFF] text-xs font-bold shrink-0 flex items-center gap-1"
                      >
                        {copiedId === 'modal-link' ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedId === 'modal-link' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-[#64748B]">
                      You can also share this link directly with the staff member via WhatsApp.
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setInviteModalOpen(false);
                      setInviteSuccessData(null);
                    }}
                    className="px-5 py-2 bg-[#153650] text-[#FFFFFF] text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-3.5">
                {inviteError && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>Invitation Dispatch Failed</span>
                    </div>
                    <p className="text-[11px] text-[#B91C1C] pl-6 leading-relaxed">
                      {inviteError}
                    </p>
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
                    placeholder="employee@varnitours.com"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650]"
                  />
                </div>

                <div>
                  <RoleSelectorDropdown
                    label="Role & Operational Boundary"
                    value={inviteRoleCode}
                    onChange={(newCode) => setInviteRoleCode(newCode)}
                    allowedRoles={[
                      'SUPER_ADMIN',
                      'ADMIN',
                      'SALES_MANAGER',
                      'SALES_EXECUTIVE',
                      'OPERATIONS_MANAGER',
                      'OPERATIONS_EXECUTIVE',
                    ]}
                  />
                </div>

                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B]">
                  &bull; A single-use 48-hour onboarding link will be sent via verified Resend domain.<br />
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
                <RoleSelectorDropdown
                  label="Select Role"
                  value={editRoleCode}
                  onChange={(newCode) => setEditRoleCode(newCode)}
                  allowedRoles={[
                    'SUPER_ADMIN',
                    'ADMIN',
                    'SALES_MANAGER',
                    'SALES_EXECUTIVE',
                    'OPERATIONS_MANAGER',
                    'OPERATIONS_EXECUTIVE',
                  ]}
                />
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
