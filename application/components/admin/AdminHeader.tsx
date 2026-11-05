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
} from 'lucide-react';

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
  const { currentUser, allUsers, setCurrentUserId, isSuperAdmin } = useCrm();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
    router.push(`/admin/leads?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E5E8ED] sticky top-0 z-20 shrink-0 select-none">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Mobile Toggle & Title/Search */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-[#172B45] hover:bg-[#F4F6F9] border border-[#E5E8ED] rounded-none transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu size={18} />
          </button>

          {/* Page Title or Breadcrumb (if provided) */}
          {title ? (
            <div className="min-w-0 mr-2 hidden md:block">
              <h1 className="text-base font-bold text-[#153650] truncate font-headline leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-[#718096] truncate">{subtitle}</p>
              )}
            </div>
          ) : null}

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
              placeholder="Search leads, customer names, reference IDs, bookings..."
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

        {/* Right: Actions, Anand HQ badge, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Custom Page Actions */}
          {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

          {/* Anand HQ Office Badge */}
          <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F8FA] border border-[#E5E8ED] text-xs font-semibold text-[#153650] rounded-none">
            <span className="w-2 h-2 bg-[#168653] inline-block" />
            <MapPin size={12} className="text-[#24689B]" />
            <span>Anand HQ Desk</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-9 h-9 flex items-center justify-center text-[#172B45] hover:bg-[#F4F6F9] border border-[#E5E8ED] rounded-none transition-colors"
              title="Recent Activity & Notifications"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E9B95E] rounded-none ring-2 ring-[#FFFFFF]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-1.5 w-80 bg-[#FFFFFF] border border-[#E5E8ED] shadow-xl z-50 text-xs text-[#172B45] rounded-none animate-in fade-in duration-150">
                <div className="p-3 border-b border-[#E5E8ED] flex items-center justify-between bg-[#F8FAFC]">
                  <span className="font-bold text-[#153650] uppercase tracking-wider text-[11px]">
                    System Notifications
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#153650] text-[#FFFFFF] rounded-none">
                    3 New
                  </span>
                </div>
                <div className="divide-y divide-[#E5E8ED] max-h-64 overflow-y-auto crm-scrollbar">
                  <div className="p-3 hover:bg-[#F8FAFC] transition-colors">
                    <p className="font-semibold text-[#153650] text-xs">New Flight Enquiry Received</p>
                    <p className="text-[11px] text-[#718096] mt-0.5">Suresh Patel • AMD → DXB • Round Trip</p>
                    <span className="text-[10px] text-[#A0AEC0] mt-1 block">5 minutes ago</span>
                  </div>
                  <div className="p-3 hover:bg-[#F8FAFC] transition-colors">
                    <p className="font-semibold text-[#153650] text-xs">Google Sheets Synced</p>
                    <p className="text-[11px] text-[#718096] mt-0.5">Automated two-way audit log updated successfully.</p>
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
                    View All Audit Logs →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
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

                {/* Role Switcher for Admin testing */}
                <div className="p-2 border-b border-[#E5E8ED]">
                  <span className="text-[10px] font-bold uppercase text-[#718096] px-2 block mb-1">
                    Switch Active Session
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

                {/* Actions */}
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
                    <span>Operations Desk</span>
                  </Link>
                  <Link
                    href="/employee/login"
                    className="flex items-center gap-2 px-3 py-1.5 text-[#D54747] hover:bg-[#FEF2F2] rounded-none"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

