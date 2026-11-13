'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCrm } from '@/components/crm/CrmContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  Clock,
  BookmarkCheck,
  Compass,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Mail,
  ShieldAlert,
  GitMerge,
  Table,
  Plane,
  Building2,
  Stamp,
  Shield,
  PhoneCall,
  Calendar,
  Send,
  UserCheck,
  Briefcase,
  DollarSign,
  TrendingUp,
  Inbox,
  Sparkles,
} from 'lucide-react';

interface NavChild {
  label: string;
  href: string;
  icon?: any;
  requiredPermission?: boolean;
}

interface NavCategory {
  id: string;
  label: string;
  icon: any;
  defaultHref: string;
  children: NavChild[];
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
  return (
    <React.Suspense fallback={null}>
      <AdminSidebarInner
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={onCloseMobile}
      />
    </React.Suspense>
  );
}

function AdminSidebarInner({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const { currentUser } = useCrm();

  const currentService = searchParams?.get('service') || null;
  const currentTab = searchParams?.get('tab') || null;

  // Master 7-Category Navigation Hierarchy
  const categories: NavCategory[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      defaultHref: '/admin',
      children: [
        { label: 'Business Overview', href: '/admin' },
        { label: 'My Tasks', href: '/admin?tab=tasks' },
        { label: 'Priority Inbox', href: '/admin?tab=inbox' },
        { label: 'Recent Activity', href: '/admin?tab=activity' },
      ],
    },
    {
      id: 'crm',
      label: 'Customers & CRM',
      icon: Users,
      defaultHref: '/admin/customers',
      children: [
        { label: 'All Customers', href: '/admin/customers' },
        { label: 'All Enquiries', href: '/admin/enquiries' },
        { label: 'Lead Pipeline', href: '/admin/leads' },
        { label: 'Follow-ups & Reminders', href: '/admin/follow-ups' },
        { label: 'Customer Segments', href: '/admin/customers/segments' },
        { label: 'Customer Activity', href: '/admin/activity' },
      ],
    },
    {
      id: 'bookings',
      label: 'Bookings & Operations',
      icon: BookmarkCheck,
      defaultHref: '/admin/bookings',
      children: [
        { label: 'All Bookings', href: '/admin/bookings' },
        { label: 'Flight Bookings', href: '/admin/bookings?service=FLIGHT' },
        { label: 'Hotel Bookings', href: '/admin/bookings?service=HOTEL' },
        { label: 'Tour Package Bookings', href: '/admin/bookings?service=PACKAGE' },
        { label: 'Visa Applications', href: '/admin/bookings?service=VISA' },
        { label: 'Travel Insurance', href: '/admin/bookings?service=INSURANCE' },
        { label: 'Upcoming Departures', href: '/admin/operations/departures' },
        { label: 'Booking Calendar', href: '/admin/operations/calendar' },
      ],
    },
    {
      id: 'sales',
      label: 'Sales & Finance',
      icon: CreditCard,
      defaultHref: '/admin/quotations',
      children: [
        { label: 'Quotations', href: '/admin/quotations' },
        { label: 'Invoices', href: '/admin/invoices' },
        { label: 'Payments', href: '/admin/payments' },
        { label: 'Pending Payments', href: '/admin/payments/pending' },
        { label: 'Revenue Overview', href: '/admin/finance/revenue' },
        { label: 'Financial Transactions', href: '/admin/finance/transactions' },
      ],
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: MessageSquare,
      defaultHref: '/admin/communications',
      children: [
        { label: 'Communication History', href: '/admin/communications' },
        { label: 'Email Records', href: '/admin/communications/emails' },
        { label: 'WhatsApp Records', href: '/admin/communications/whatsapp' },
        { label: 'Call Logs', href: '/admin/communications/calls' },
        { label: 'Templates', href: '/admin/communications/templates' },
        { label: 'Newsletter Subscribers', href: '/admin/subscribers' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      defaultHref: '/admin/reports',
      children: [
        { label: 'Business Performance', href: '/admin/reports' },
        { label: 'Enquiry Analytics', href: '/admin/reports/enquiries' },
        { label: 'Sales Analytics', href: '/admin/reports/sales' },
        { label: 'Booking Analytics', href: '/admin/reports/bookings' },
        { label: 'Revenue Reports', href: '/admin/reports/revenue' },
        { label: 'Employee Performance', href: '/admin/reports/employees' },
        { label: 'Customer Insights', href: '/admin/reports/customers' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings & Team',
      icon: Settings,
      defaultHref: '/admin/users',
      children: [
        { label: 'Team Members', href: '/admin/users', requiredPermission: currentUser.canManageUsers },
        { label: 'Roles & Permissions', href: '/admin/settings/roles' },
        { label: 'Business Profile', href: '/admin/settings/profile' },
        { label: 'Service Configuration', href: '/admin/packages' },
        { label: 'Email Configuration', href: '/admin/settings/email' },
        { label: 'WhatsApp Configuration', href: '/admin/settings/whatsapp' },
        { label: 'Google Sheets Integration', href: '/admin/google-sheets' },
        { label: 'Customer Deduplication', href: '/admin/deduplication', requiredPermission: currentUser.canMergeCustomers },
        { label: 'System Activity Logs', href: '/admin/audit-logs', requiredPermission: currentUser.canViewAuditLogs },
      ].filter((i) => i.requiredPermission === undefined || i.requiredPermission === true),
    },
  ];

  // Helper: check if a child item is active
  const isChildActive = (href: string) => {
    if (!pathname) return false;
    const [pathPart, queryPart] = href.split('?');
    if (pathPart === '/admin') {
      if (queryPart) {
        return pathname === '/admin' && currentTab === queryPart.split('=')[1];
      }
      return pathname === '/admin' && !currentTab;
    }
    if (queryPart) {
      const expectedService = queryPart.split('=')[1];
      return pathname === pathPart && currentService === expectedService;
    }
    if (currentService) return false;
    return pathname === pathPart || (pathname.startsWith && pathname.startsWith(`${pathPart}/`));
  };

  // Helper: check if any child of a category is active
  const isCategoryActive = (category: NavCategory) => {
    return category.children.some((child) => isChildActive(child.href));
  };

  // State to track expanded category IDs
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    overview: true,
  });

  // Automatically expand the category containing the active route
  useEffect(() => {
    categories.forEach((cat) => {
      if (isCategoryActive(cat)) {
        setExpandedCategories((prev) => ({ ...prev, [cat.id]: true }));
      }
    });
  }, [pathname, currentService, currentTab]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
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
          <div className="w-8 h-8 rounded-none bg-[#153650] flex items-center justify-center text-[#E9B95E] font-bold text-sm shrink-0 border border-[#153650] shadow-xs">
            V
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-xs font-bold tracking-wider text-[#153650] block uppercase truncate font-mono">
                VARNI HOLIDAYS
              </span>
              <span className="text-[10px] text-[#718096] block truncate font-medium">
                Unified Travel Management
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

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 crm-scrollbar">
        {categories.map((category) => {
          const isExpanded = !!expandedCategories[category.id];
          const hasActiveChild = isCategoryActive(category);
          const Icon = category.icon;

          if (collapsed) {
            // Compact Mode: Click navigates to defaultHref, hover tooltip
            return (
              <Link
                key={category.id}
                href={category.defaultHref}
                onClick={onCloseMobile}
                title={category.label}
                className={`flex items-center justify-center w-10 h-10 mx-auto rounded-none transition-colors ${
                  hasActiveChild
                    ? 'bg-[#153650] text-[#E9B95E]'
                    : 'text-[#667085] hover:bg-[#F4F6F9] hover:text-[#153650]'
                }`}
              >
                <Icon size={18} />
              </Link>
            );
          }

          return (
            <div key={category.id} className="space-y-0.5">
              {/* Category Parent Button with Dropdown Chevron */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors border-l-2 ${
                  hasActiveChild
                    ? 'text-[#153650] bg-[#F7F8FA] border-[#24689B]'
                    : 'text-[#667085] hover:text-[#153650] hover:bg-[#FAFBFD] border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={16}
                    className={`shrink-0 ${
                      hasActiveChild ? 'text-[#24689B]' : 'text-[#718096]'
                    }`}
                  />
                  <span className="truncate">{category.label}</span>
                </div>
                <div className="text-[#718096] shrink-0 ml-1">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              </button>

              {/* Expandable Children */}
              {isExpanded && (
                <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l border-[#E5E8ED] ml-4">
                  {category.children.map((child) => {
                    const active = isChildActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onCloseMobile}
                        className={`block px-2.5 py-1.5 text-xs font-medium rounded-none transition-colors ${
                          active
                            ? 'bg-[#153650] text-[#FFFFFF] font-semibold border-l-2 border-[#E9B95E]'
                            : 'text-[#4A5568] hover:text-[#153650] hover:bg-[#F4F6F9]'
                        }`}
                      >
                        <span className="truncate block">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mountain Landscape Graphic & Office Profile Footer */}
      <div className="p-3 border-t border-[#E5E8ED] bg-[#FAFBFD] shrink-0 relative overflow-hidden">
        {!collapsed && (
          <div className="relative z-10 mb-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#153650]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#168653] inline-block" />
                <span>Anand HQ Desk</span>
              </span>
              <span className="text-[10px] text-[#718096] font-mono">v2.0</span>
            </div>
            <p className="text-[10px] text-[#718096] mt-0.5 truncate">
              {currentUser.role.replace('_', ' ')}: {currentUser.fullName}
            </p>
          </div>
        )}

        {/* Mountain Landscape Decorative Vector */}
        <div className="w-full h-7 opacity-35 overflow-hidden pointer-events-none mt-1">
          <svg
            viewBox="0 0 200 35"
            className="w-full h-full text-[#94A3B8]"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,28 L25,14 L50,22 L80,9 L110,18 L140,6 L165,16 L200,8 L200,35 L0,35 Z"
              fill="currentColor"
              fillOpacity="0.3"
            />
            <path
              d="M0,32 L35,22 L65,27 L95,17 L130,24 L155,13 L180,20 L200,15 L200,35 L0,35 Z"
              fill="currentColor"
              fillOpacity="0.5"
            />
            <polyline
              points="0,28 25,14 50,22 80,9 110,18 140,6 165,16 200,8"
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

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#153650]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
