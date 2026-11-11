'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCrm } from '@/components/crm/CrmContext';
import {
  Search,
  Bell,
  MapPin,
  Menu,
  ChevronDown,
  User,
  Shield,
  LogOut,
  ExternalLink,
  Layers,
  Users,
  Compass,
  X,
  Plus,
  BookmarkCheck,
  CreditCard,
  Clock,
  Sparkles,
} from 'lucide-react';
import QuickActionModal, { QuickActionType } from './QuickActionModal';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onToggleMobileMenu?: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  actions,
  onToggleMobileMenu,
}: AdminHeaderProps) {
  const router = useRouter();
  const { currentUser, allUsers, setCurrentUserId } = useCrm();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [quickActionInitial, setQuickActionInitial] = useState<QuickActionType>('enquiry');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/enquiries?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const openQuickAction = (type: QuickActionType = 'enquiry') => {
    setQuickActionInitial(type);
    setQuickActionOpen(true);
  };

  return (
    <>
      <header className="bg-[#FFFFFF] border-b border-[#E5E8ED] sticky top-0 z-20 shrink-0 select-none">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Mobile Toggle & Search */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-[#172B45] hover:bg-[#F4F6F9] border border-[#E5E8ED] rounded-none transition-colors"
              aria-label="Open mobile navigation"
            >
              <Menu size={18} />
            </button>

            {/* Optional Title in Header */}
            {title && (
              <div className="min-w-0 mr-2 hidden md:block">
                <h1 className="text-base font-bold text-[#153650] truncate font-headline leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[11px] text-[#718096] truncate">{subtitle}</p>
                )}
              </div>
            )}

            {/* Global Search Bar (Sharp 0–3px Geometry) */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-1 max-w-md hidden sm:block"
            >
              <Search
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  searchFocused ? 'text-[#24689B]' : 'text-[#718096]'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search customers, enquiries, reference IDs, bookings..."
                className="w-full h-9 pl-9 pr-8 text-xs bg-[#F7F8FA] border border-[#E5E8ED] text-[#172B45] placeholder-[#718096] rounded-none focus:outline-none focus:bg-[#FFFFFF] focus:border-[#24689B] transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#172B45]"
                >
                  <X size={12} />
                </button>
              )}
            </form>
          </div>

          {/* Right: Quick Action, Badge, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Custom Page Actions */}
            {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

            {/* GLOBAL QUICK ACTION BUTTON (PHASE 3) */}
            <button
              type="button"
              onClick={() => openQuickAction('enquiry')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none shadow-xs transition-colors"
              title="Create new enquiry, booking, payment or follow-up"
            >
              <Plus size={14} className="text-[#E9B95E]" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {/* Anand HQ Office Badge */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F8FA] border border-[#E5E8ED] text-xs font-semibold text-[#153650] rounded-none">
              <span className="w-2 h-2 bg-[#168653] inline-block" />
              <MapPin size={12} className="text-[#24689B]" />
              <span>Anand HQ</span>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifMenuRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-9 h-9 flex items-center justify-center text-[#172B45] hover:bg-[#F4F6F9] border border-[#E5E8ED] rounded-none transition-colors"
                title="Recent System Alerts"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E9B95E] rounded-none ring-2 ring-[#FFFFFF]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-1.5 w-80 bg-[#FFFFFF] border border-[#E5E8ED] shadow-xl z-50 text-xs text-[#172B45] rounded-none animate-in fade-in duration-150">
                  <div className="p-3 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F8FAFC]">
                    <span className="font-bold text-[#153650] uppercase tracking-wider text-[11px]">
                      Operational Notifications
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#153650] text-[#FFFFFF] rounded-none">
                      Active
                    </span>
                  </div>
                  <div className="divide-y divide-[#E5E8ED] max-h-64 overflow-y-auto crm-scrollbar">
                    <div className="p-3 hover:bg-[#F8FAFC] transition-colors">
                      <p className="font-semibold text-[#153650] text-xs">New Flight Enquiry Logged</p>
                      <p className="text-[11px] text-[#718096] mt-0.5">Suresh Patel • AMD → DXB • Round Trip</p>
                      <span className="text-[10px] text-[#A0AEC0] mt-1 block">5 minutes ago</span>
                    </div>
                    <div className="p-3 hover:bg-[#F8FAFC] transition-colors">
                      <p className="font-semibold text-[#153650] text-xs">Google Sheets Reconciled</p>
                      <p className="text-[11px] text-[#718096] mt-0.5">Two-way audit worksheet updated.</p>
                      <span className="text-[10px] text-[#A0AEC0] mt-1 block">22 minutes ago</span>
                    </div>
                    <div className="p-3 hover:bg-[#F8FAFC] transition-colors">
                      <p className="font-semibold text-[#153650] text-xs">Booking Confirmed</p>
                      <p className="text-[11px] text-[#718096] mt-0.5">Bhavik Joshi • Kerala 6N/7D Luxury • ₹76,700</p>
                      <span className="text-[10px] text-[#A0AEC0] mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                  <div className="p-2 border-t border-[#E5E8ED] text-center bg-[#F8FAFC]">
                    <Link
                      href="/admin/audit-logs"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] font-bold text-[#24689B] hover:text-[#153650]"
                    >
                      View All Activity Logs →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F4F6F9] border border-[#E5E8ED] rounded-none transition-colors"
                aria-label="User profile options"
              >
                <div className="w-6 h-6 bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xs rounded-none border border-[#153650]">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-xs font-bold text-[#153650] block leading-tight truncate max-w-[120px]">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-[#718096] uppercase font-mono tracking-wider block">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown size={14} className="text-[#718096]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-[#FFFFFF] border border-[#E5E8ED] shadow-xl z-50 text-xs text-[#172B45] rounded-none animate-in fade-in duration-150">
                  <div className="p-3 border-b border-[#E5E8ED] bg-[#F8FAFC]">
                    <p className="font-bold text-[#153650] text-xs">{currentUser.fullName}</p>
                    <p className="text-[11px] text-[#718096]">{currentUser.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#153650] text-[#E9B95E] text-[10px] font-mono font-bold uppercase rounded-none">
                      {currentUser.role}
                    </span>
                  </div>

                  {/* Switch Active Session */}
                  <div className="p-2 border-b border-[#E5E8ED]">
                    <span className="text-[10px] font-bold uppercase text-[#718096] px-2 block mb-1">
                      Active Consultant Session
                    </span>
                    <div className="space-y-0.5">
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setCurrentUserId(u.id);
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-xs flex items-center justify-between rounded-none hover:bg-[#F4F6F9] ${
                            u.id === currentUser.id ? 'font-bold text-[#24689B]' : 'text-[#172B45]'
                          }`}
                        >
                          <span className="truncate">{u.fullName}</span>
                          <span className="text-[10px] font-mono text-[#718096]">{u.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="p-1 space-y-0.5">
                    <Link
                      href="/"
                      target="_blank"
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F4F6F9] text-[#172B45] rounded-none"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <ExternalLink size={14} className="text-[#718096]" />
                      <span>View Public Website</span>
                    </Link>
                    <Link
                      href="/employee/dashboard"
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F4F6F9] text-[#172B45] rounded-none"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Layers size={14} className="text-[#718096]" />
                      <span>Employee Desk</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Global Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        initialAction={quickActionInitial}
      />
    </>
  );
}
