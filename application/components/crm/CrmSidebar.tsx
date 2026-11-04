'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrm } from './CrmContext';
import {
  LayoutDashboard,
  Users,
  Compass,
  FileText,
  BookmarkCheck,
  Calendar,
  MessageSquare,
  Shield,
  Table,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Inbox,
  Flame,
  UserCheck,
  BadgePercent,
  Settings,
  CreditCard,
  MapPin,
} from 'lucide-react';
export default function CrmSidebar() {
  const pathname = usePathname();
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  React.useEffect(() => { if (typeof window !== 'undefined') { setCurrentStage(new URLSearchParams(window.location.search).get('stage')); } }, [pathname]);
  const { currentUser, allUsers, setCurrentUserId, isSuperAdmin, isAdmin } = useCrm();
  const [collapsed, setCollapsed] = useState(false);
  // Admin Navigation (Permission Guarded)
  const adminNav = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Leads', href: '/employee/leads', icon: Layers },
    { label: 'Customers', href: '/employee/customers', icon: Users },
    { label: 'Employees', href: '/admin/users', icon: UserCheck, requiredPermission: currentUser.canManageUsers },
    { label: 'Packages', href: '/admin/packages', icon: Compass, requiredPermission: currentUser.canApprovePricing },
    { label: 'Destinations', href: '/destinations', icon: MapPin },
    { label: 'Quotations', href: '/employee/quotations', icon: FileText },
    { label: 'Bookings', href: '/employee/bookings', icon: BookmarkCheck },
    { label: 'Payments', href: '/employee/bookings?tab=payments', icon: CreditCard },
    { label: 'Google Sheets', href: '/admin/google-sheets', icon: Table },
    { label: 'Communications', href: '/employee/communications', icon: MessageSquare },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: Shield, requiredPermission: currentUser.canViewAuditLogs },
  ].filter((item) => item.requiredPermission === undefined || item.requiredPermission === true);
  // Employee Navigation (Permission Guarded)
  const employeeNav = [
    { label: 'Overview', href: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'My Requests', href: '/employee/leads?stage=REQUESTS', icon: Inbox, stage: 'REQUESTS' },
    { label: 'General Leads', href: '/employee/leads?stage=GENERAL', icon: Layers, stage: 'GENERAL' },
    { label: 'Priority Leads', href: '/employee/leads?stage=PRIORITY', icon: Flame, stage: 'PRIORITY' },
    { label: 'Customers', href: '/employee/customers', icon: Users },
    { label: 'Follow-ups', href: '/employee/follow-ups', icon: Calendar },
    { label: 'Quotations', href: '/employee/quotations', icon: FileText },
    { label: 'Bookings', href: '/employee/bookings', icon: BookmarkCheck },
    { label: 'Communications', href: '/employee/communications', icon: MessageSquare },
    { label: 'My Performance', href: '/employee/dashboard#performance', icon: TrendingUp },
  ];
  const isNavActive = (href: string, stage?: string) => {
    if (stage) {
      return pathname === '/employee/leads' && currentStage === stage;
    }
    if (href === '/admin' && pathname === '/admin') return true;
    if (href === '/employee/dashboard' && pathname === '/employee/dashboard') return true;
    if (href.includes('?')) {
      const base = href.split('?')[0];
      return pathname === base;
    }
    if (pathname === '/employee/leads' && currentStage) return false;
    return pathname === href;
  };
  return (
    <aside
      className={`bg-[#0B0D0F] text-[#F4F4F2] flex flex-col justify-between shrink-0 min-h-screen border-r border-[#2A2E34] select-none transition-all duration-200 z-40 ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#2A2E34] flex items-center justify-between bg-[#0B0D0F]">
          <Link href={isAdmin ? '/admin' : '/employee/dashboard'} className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[#17191D] border border-[#2A2E34] flex items-center justify-center text-[#E9B95E] font-semibold text-sm shrink-0">
              V
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-xs font-semibold tracking-wider text-[#F4F4F2] block uppercase truncate">
                  Varni Holidays
                </span>
                <span className="text-[10px] text-[#969CA5] block truncate">
                  {isAdmin ? 'Admin Console' : 'Operations Desk'}
                </span>
              </div>
            )}
          </Link>
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-7 h-7 rounded-md bg-[#17191D] hover:bg-[#1D2025] text-[#969CA5] hover:text-[#F4F4F2] border border-[#2A2E34] flex items-center justify-center transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        {/* Role Switcher (Compact & Subtle) */}
        {!collapsed ? (
          <div className="px-3 py-2.5 border-b border-[#1F2329] bg-[#0E1012]">
            <div className="flex items-center justify-between mb-1 text-[10px] uppercase tracking-wider text-[#666E79]">
              <span>Active Staff Role</span>
              <span className="text-[#E9B95E] font-medium text-[9px]">{currentUser.role.replace('_', ' ')}</span>
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="w-full text-xs bg-[#17191D] text-[#F4F4F2] rounded-md px-2.5 py-1.5 border border-[#2A2E34] focus:outline-none focus:border-[#E9B95E] transition-colors cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#17191D] text-[#F4F4F2]">
                  {u.fullName} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="py-2 flex justify-center border-b border-[#1F2329]">
            <span
              title={`Active: ${currentUser.fullName} (${currentUser.role})`}
              className="w-2 h-2 rounded-full bg-[#E9B95E]"
            />
          </div>
        )}
        {/* Navigation Links Scroll Container */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 text-xs">
          {/* Admin Navigation */}
          {isAdmin && (
            <div>
              {!collapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] uppercase tracking-wider text-[#666E79] font-medium">
                  Admin Navigation
                </div>
              )}
              <div className="space-y-0.5">
                {adminNav.map((item) => {
                  const active = isNavActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
                        active
                          ? 'bg-[#1D2025] text-[#F4F4F2] font-medium border border-[#2A2E34]'
                          : 'text-[#969CA5] hover:text-[#F4F4F2] hover:bg-[#17191D]'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon size={16} className={active ? 'text-[#E9B95E]' : 'text-[#666E79]'} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {/* Employee Navigation */}
          <div>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[10px] uppercase tracking-wider text-[#666E79] font-medium">
                {isAdmin ? 'Employee Workspace' : 'My Workspace'}
              </div>
            )}
            <div className="space-y-0.5">
              {employeeNav.map((item) => {
                const active = isNavActive(item.href, item.stage);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
                      active
                        ? 'bg-[#1D2025] text-[#F4F4F2] font-medium border border-[#2A2E34]'
                        : 'text-[#969CA5] hover:text-[#F4F4F2] hover:bg-[#17191D]'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon size={16} className={active ? 'text-[#E9B95E]' : 'text-[#666E79]'} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Footer Navigation */}
      <div className="p-3 border-t border-[#2A2E34] bg-[#0B0D0F] space-y-2">
        {!collapsed && (
          <div className="flex items-center justify-between text-[11px] text-[#666E79]">
            <span>22.56°N • 72.95°E</span>
            <span className="flex items-center gap-1.5 text-[#55B98A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#55B98A]" />
              Live
            </span>
          </div>
        )}
        <Link
          href="/"
          target="_blank"
          title="Open Public Website"
          className={`flex items-center justify-center gap-2 w-full py-1.5 rounded-md text-xs font-medium text-[#969CA5] bg-[#17191D] hover:bg-[#1D2025] hover:text-[#F4F4F2] border border-[#2A2E34] transition-colors ${
            collapsed ? 'px-0' : 'px-3'
          }`}
        >
          <ExternalLink size={14} />
          {!collapsed && <span>Public Site</span>}
        </Link>
      </div>
    </aside>
  );
}
