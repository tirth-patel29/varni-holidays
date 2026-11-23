'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import {
  LucideIcon,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  Compass,
  Truck,
  FileCheck,
  Check,
  ChevronDown,
  Crown,
} from 'lucide-react';

export interface RoleOption {
  code: string;
  name: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: LucideIcon;
}

export const CANONICAL_ROLES: RoleOption[] = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Full system & security authority across all branches and modules',
    badge: 'System Security',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldAlert,
  },
  {
    code: 'ADMIN',
    name: 'Operations Administrator',
    description: 'Daily operations, staff invitations & team administration',
    badge: 'Operations Admin',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ShieldCheck,
  },
  {
    code: 'SALES_MANAGER',
    name: 'Sales Manager',
    description: 'Lead assignments & sales pipeline management authority',
    badge: 'Sales Leadership',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Briefcase,
  },
  {
    code: 'SALES_EXECUTIVE',
    name: 'Senior Travel Specialist',
    description: 'Customer management, flight hold bookings & quotations',
    badge: 'Sales & Tours',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Compass,
  },
  {
    code: 'OPERATIONS_MANAGER',
    name: 'Operations & Logistics Manager',
    description: 'Tour operations, transport, hotel coordination & logistics',
    badge: 'Tour Logistics',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Truck,
  },
  {
    code: 'OPERATIONS_EXECUTIVE',
    name: 'Operations & Visa Executive',
    description: 'Visa documentation, tour vouchers & customer support',
    badge: 'Visa & Desk',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: FileCheck,
  },
];

export interface RoleSelectorDropdownProps {
  value: string;
  onChange: (roleCode: string) => void;
  disabled?: boolean;
  label?: string;
  error?: string;
  allowedRoles?: string[];
  className?: string;
}

export function RoleSelectorDropdown({
  value,
  onChange,
  disabled = false,
  label,
  error,
  allowedRoles,
  className = '',
}: RoleSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  // Filter roles based on allowedRoles if provided
  const availableRoles = React.useMemo(() => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return CANONICAL_ROLES;
    }
    const filtered = CANONICAL_ROLES.filter((r) => allowedRoles.includes(r.code));
    // If current value is not in canonical list (e.g. OWNER), create a fallback entry
    if (allowedRoles.includes('OWNER') && !filtered.some((r) => r.code === 'OWNER')) {
      filtered.unshift({
        code: 'OWNER',
        name: 'Business Owner',
        description: 'Root system authority & enterprise governance',
        badge: 'Root Executive',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Crown,
      });
    }
    return filtered;
  }, [allowedRoles]);

  const selectedRole = availableRoles.find((r) => r.code === value) || availableRoles[0];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keep focused item visible when navigating via keyboard
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll<HTMLLIElement>('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      const idx = availableRoles.findIndex((r) => r.code === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  };

  const handleSelect = (roleCode: string) => {
    onChange(roleCode);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.stopPropagation();
        if (isOpen) {
          if (focusedIndex >= 0 && focusedIndex < availableRoles.length) {
            handleSelect(availableRoles[focusedIndex].code);
          }
        } else {
          setIsOpen(true);
          const idx = availableRoles.findIndex((r) => r.code === value);
          setFocusedIndex(idx >= 0 ? idx : 0);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev + 1 < availableRoles.length ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(availableRoles.length - 1);
        } else {
          setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : availableRoles.length - 1));
        }
        break;

      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      default:
        break;
    }
  };

  const SelectedIcon = selectedRole?.icon || ShieldCheck;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-2 bg-[#FFFFFF] border transition-all text-left flex items-center justify-between gap-2.5 focus:outline-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-[#F8FAFC] border-[#CBD5E1]'
            : isOpen
            ? 'border-[#153650] ring-1 ring-[#153650] shadow-xs'
            : error
            ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]'
            : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#153650] focus:ring-1 focus:ring-[#153650]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1 rounded-sm bg-[#F1F5F9] text-[#153650] shrink-0">
            <SelectedIcon size={15} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-xs font-bold text-[#153650] truncate">
              {selectedRole?.name || 'Select Role'}
            </span>
            {selectedRole && (
              <span
                className={`inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.5 border shrink-0 ${selectedRole.badgeColor}`}
              >
                {selectedRole.badge}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`text-[#64748B] shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#153650]' : ''
          }`}
        />
      </button>

      {/* Popover Listbox */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#FFFFFF] border border-[#CBD5E1] shadow-xl overflow-hidden animate-in fade-in-50 duration-100">
          <div className="px-3 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#64748B]">
              Canonical Staff Roles ({availableRoles.length})
            </span>
            <span className="text-[10px] text-[#94A3B8]">Use ↑↓ to navigate</span>
          </div>

          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            className="max-h-64 overflow-y-auto divide-y divide-[#F1F5F9] focus:outline-none"
          >
            {availableRoles.map((role, idx) => {
              const isSelected = role.code === value;
              const isFocused = idx === focusedIndex;
              const RoleIcon = role.icon;

              return (
                <li
                  key={role.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(role.code)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`px-3 py-2.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#153650]/5 border-l-2 border-[#153650]'
                      : isFocused
                      ? 'bg-[#F8FAFC]'
                      : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div
                    className={`p-1.5 mt-0.5 rounded-xs shrink-0 ${
                      isSelected
                        ? 'bg-[#153650] text-[#FFFFFF]'
                        : 'bg-[#F1F5F9] text-[#153650]'
                    }`}
                  >
                    <RoleIcon size={14} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-[#153650]' : 'text-[#1E293B]'
                        }`}
                      >
                        {role.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 border ${role.badgeColor}`}
                      >
                        {role.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] line-clamp-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="shrink-0 self-center text-[#153650] pl-1">
                      <Check size={16} strokeWidth={2.5} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && <p className="text-[11px] text-[#DC2626] mt-1">{error}</p>}
    </div>
  );
}

export default RoleSelectorDropdown;
