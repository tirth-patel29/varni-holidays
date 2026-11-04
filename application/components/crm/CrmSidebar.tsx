'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrm } from './CrmContext';

export default function CrmSidebar() {
  const pathname = usePathname();
  const { currentUser, allUsers, setCurrentUserId, isSuperAdmin, isAdmin } = useCrm();

  const mainNav = [
    { label: 'Pipeline / Leads', href: '/employee/leads', icon: 'view_kanban', badge: 'Active' },
    { label: 'CRM Dashboard', href: '/employee/dashboard', icon: 'insights' },
    { label: 'Customer Directory', href: '/employee/customers', icon: 'contacts' },
    { label: 'Follow-Ups', href: '/employee/follow-ups', icon: 'calendar_month' },
    { label: 'Quotations Desk', href: '/employee/quotations', icon: 'receipt_long' },
    { label: 'Bookings Desk', href: '/employee/bookings', icon: 'airplane_ticket' },
    { label: 'Communications', href: '/employee/communications', icon: 'mark_chat_read' },
  ];

  const adminNav = [
    { label: 'Staff & Roles', href: '/admin/users', icon: 'badge' },
    { label: 'Google Sheets Live Sync', href: '/admin/google-sheets', icon: 'table_chart' },
    { label: 'Deduplication Center', href: '/admin/deduplication', icon: 'merge_type' },
    { label: 'Rate & Cost Governance', href: '/admin/packages', icon: 'attach_money' },
    { label: 'System Audit Logs', href: '/admin/audit-logs', icon: 'security' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800 select-none shadow-xl">
      <div>
        {/* Brand Logo & Portal Tag */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70">
          <Link href="/employee/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md font-serif font-black text-xl">
              V
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-white block leading-tight">
                VARNI HOLIDAYS
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-0.5 block">
                Travel CRM & Operations
              </span>
            </div>
          </Link>

          {/* Quick Role Switcher for Verification */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1 tracking-wider">
              Active Session (Role Switcher)
            </label>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="w-full text-xs bg-slate-900 text-white rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.fullName} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 overflow-hidden shrink-0">
            <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
            <span className="inline-block text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
            Operations & Leads
          </span>
          {mainNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && !active && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="p-3 pt-2 border-t border-slate-800 space-y-1">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Super Admin Controls
              </span>
              <span className="material-symbols-outlined text-[15px] text-amber-400">shield_person</span>
            </div>
            {adminNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-slate-800 space-y-2.5 bg-slate-950/70">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Desk: Anand, Gujarat</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
        >
          <span className="material-symbols-outlined text-[16px]">public</span>
          <span>View Public Website</span>
        </Link>
      </div>
    </aside>
  );
}
