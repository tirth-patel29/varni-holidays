'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCrm } from '@/components/crm/CrmContext';
import {
  LayoutDashboard,
  Layers,
  Users,
  BookmarkCheck,
  Compass,
  FileText,
  CreditCard,
  Plane,
  Stamp,
  Shield,
  Table,
  Mail,
  UserCheck,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  GitMerge,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  external?: boolean;
  requiredPermission?: boolean;
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { currentUser, isSuperAdmin } = useCrm();

  const navSections: { group: string; items: NavItem[] }[] = [
    {
      group: 'Operations',
      items: [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard },
        { label: 'Leads & Enquiries', href: '/admin/leads', icon: Layers },
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Bookings & Vouchers', href: '/admin/bookings', icon: BookmarkCheck },
        { label: 'Quotations', href: '/employee/quotations', icon: FileText },
      ],
    },
    {
      group: 'Travel Products',
      items: [
        { label: 'Tour Packages', href: '/admin/packages', icon: Compass },
        { label: 'Hotels Directory', href: '/hotels', icon: Building2, external: true },
        { label: 'Flight Consultation', href: '/#flights', icon: Plane, external: true },
        { label: 'Visa Assistance', href: '/visa', icon: Stamp, external: true },
        { label: 'Travel Insurance', href: '/travel-insurance', icon: Shield, external: true },
      ],
    },
    {
      group: 'Governance & Data',
      items: [
        { label: 'Staff & Roles', href: '/admin/users', icon: UserCheck, requiredPermission: currentUser.canManageUsers },
        { label: 'Customer Merge', href: '/admin/deduplication', icon: GitMerge, requiredPermission: currentUser.canMergeCustomers },
        { label: 'Google Sheets Sync', href: '/admin/google-sheets', icon: Table },
        { label: 'Newsletter Subscribers', href: '/admin/subscribers', icon: Mail },
        { label: 'System Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert, requiredPermission: currentUser.canViewAuditLogs },
      ].filter((item) => item.requiredPermission === undefined || item.requiredPermission === true),
    },
  ];

  const isItemActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#172B45] select-none border-r border-[#E5E8ED]">
      {/* Branding Header */}
      <div className="h-16 px-4 border-b border-[#E5E8ED] flex items-center justify-between shrink-0 bg-[#FFFFFF]">
        <Link
          href="/admin"
          onClick={onCloseMobile}
          className="flex items-center gap-3 min-w-0 group"
        >
          <div className="w-8 h-8 rounded-none bg-[#153650] flex items-center justify-center text-[#E9B95E] font-bold text-sm shrink-0 border border-[#153650] shadow-sm">
            V
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-xs font-bold tracking-wider text-[#153650] block uppercase truncate font-mono">
                VARNI HOLIDAYS
              </span>
              <span className="text-[10px] text-[#718096] block truncate font-medium">
                Travel Management Portal
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-6 h-6 items-center justify-center text-[#718096] hover:text-[#153650] hover:bg-[#F4F6F9] rounded-none border border-[#E5E8ED] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 crm-scrollbar">
        {navSections.map((sec) => (
          <div key={sec.group} className="space-y-1">
            {!collapsed && (
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                {sec.group}
              </div>
            )}
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const active = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-none transition-colors border-l-2 ${
                      active
                        ? 'bg-[#153650] text-[#FFFFFF] border-[#E9B95E] shadow-sm'
                        : 'text-[#172B45] hover:bg-[#F4F6F9] hover:text-[#153650] border-transparent'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      size={15}
                      className={`shrink-0 ${
                        active ? 'text-[#E9B95E]' : 'text-[#718096] group-hover:text-[#153650]'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.external && (
                      <ExternalLink size={11} className="text-[#A0AEC0] shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Subtle Mountain Landscape Decoration at Bottom */}
      <div className="p-3 border-t border-[#E5E8ED] bg-[#FAFBFD] shrink-0 relative overflow-hidden">
        {!collapsed && (
          <div className="relative z-10 mb-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#153650]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#168653] inline-block" />
                <span>Anand HQ Online</span>
              </span>
              <span className="text-[10px] text-[#718096] font-mono">v1.4</span>
            </div>
            <p className="text-[10px] text-[#718096] mt-0.5">
              {currentUser.role.replace('_', ' ')}: {currentUser.fullName}
            </p>
          </div>
        )}

        {/* Mountain Ridge Low-Contrast Landscape Graphic */}
        <div className="w-full h-8 opacity-40 overflow-hidden pointer-events-none mt-1">
          <svg
            viewBox="0 0 200 40"
            className="w-full h-full text-[#94A3B8]"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Distant mountain ridge */}
            <path
              d="M0,32 L25,18 L50,26 L80,12 L110,22 L140,8 L165,19 L200,10 L200,40 L0,40 Z"
              fill="currentColor"
              fillOpacity="0.25"
            />
            {/* Foreground mountain ridge */}
            <path
              d="M0,36 L35,26 L65,31 L95,20 L130,28 L155,16 L180,24 L200,18 L200,40 L0,40 Z"
              fill="currentColor"
              fillOpacity="0.45"
            />
            {/* Mountain peak lines */}
            <polyline
              points="0,32 25,18 50,26 80,12 110,22 140,8 165,19 200,10"
              stroke="#24689B"
              strokeWidth="0.8"
              fill="none"
              strokeOpacity="0.6"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen transition-all duration-200 z-30 ${
          collapsed ? 'w-[64px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#153650]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

