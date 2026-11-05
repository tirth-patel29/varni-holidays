"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { FLIGHT_MEAL_OPTIONS, FLIGHT_DISCLAIMERS, FlightMealOption } from "@/lib/config/flight-options";

interface MealPreferenceDropdownProps {
  selectedCode: string;
  onChange: (code: string, option: FlightMealOption) => void;
  className?: string;
}

export default function MealPreferenceDropdown({
  selectedCode,
  onChange,
  className = "",
}: MealPreferenceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentOption =
    FLIGHT_MEAL_OPTIONS.find((opt) => opt.code === selectedCode) || FLIGHT_MEAL_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const categories = [
    "No Preference",
    "Vegetarian / Plant-based",
    "Religious / Cultural",
    "Medical / Dietary",
  ] as const;

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <label className="block text-[11px] font-bold text-primary uppercase tracking-wider mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
          <span>In-Flight Meal Preference</span>
        </span>
        {currentOption.code !== "NO_PREFERENCE" && (
          <span className="text-[10px] text-secondary font-semibold bg-surface-cream-subtle px-2 py-0.5 rounded-full border border-secondary/20">
            {currentOption.code}
          </span>
        )}
      </label>

      {/* Custom Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full min-h-[48px] bg-surface-cream-subtle px-4 py-2.5 rounded-2xl text-left text-xs sm:text-sm font-medium text-primary shadow-clay-inset flex items-center justify-between border border-surface-sand-tint hover:bg-surface-container transition-all focus:outline-none focus:ring-2 focus:ring-secondary"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            currentOption.code !== "NO_PREFERENCE" ? "bg-secondary text-white" : "bg-surface-container text-on-surface-variant"
          }`}>
            <span className="material-symbols-outlined text-[16px]">restaurant</span>
          </div>
          <div className="min-w-0">
            <span className="block font-semibold text-primary truncate">
              {currentOption.label}
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0 transition-transform duration-200">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {/* Selected Option Description Pill (when specific meal selected) */}
      {currentOption.code !== "NO_PREFERENCE" && (
        <div className="mt-1.5 p-2.5 bg-surface-cream-subtle rounded-xl text-[11px] text-primary border border-secondary/20 flex items-start gap-2 shadow-sm">
          <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">info</span>
          <span className="leading-snug">{currentOption.description}</span>
        </div>
      )}

      {/* Custom Popover Dropdown Menu — Warm Ivory / White palette (NO BLACK MENU) */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Meal preference options"
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#FAF8F5] rounded-2xl shadow-clay-floating border border-surface-sand-tint p-3 max-h-80 overflow-y-auto space-y-3 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-sm"
        >
          {/* Search Box */}
          <div className="relative sticky top-0 z-10 bg-[#FAF8F5] pb-1">
            <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-on-surface-variant pointer-events-none">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or diet (e.g. Jain, Vegan, Halal, Gluten)..."
              className="w-full h-10 pl-9 pr-8 bg-white rounded-xl text-xs sm:text-sm text-primary placeholder:text-on-surface-variant/50 border border-surface-sand-tint focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Grouped Meal Options */}
          <div className="space-y-3">
            {categories.map((cat) => {
              const items = FLIGHT_MEAL_OPTIONS.filter((m) => {
                if (m.category !== cat) return false;
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  m.code.toLowerCase().includes(q) ||
                  m.label.toLowerCase().includes(q) ||
                  m.description.toLowerCase().includes(q)
                );
              });

              if (items.length === 0) return null;

              return (
                <div key={cat} className="space-y-1.5">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider px-1 block">
                    {cat}
                  </span>
                  <div className="space-y-1">
                    {items.map((opt) => {
                      const isSelected = opt.code === selectedCode;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onChange(opt.code, opt);
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 border ${
                            isSelected
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-white/80 hover:bg-white text-primary border-surface-sand-tint/60 hover:border-secondary/40"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-primary"}`}>
                                {opt.label}
                              </span>
                              {opt.code !== "NO_PREFERENCE" && (
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  isSelected ? "bg-white/20 text-white font-bold" : "bg-surface-cream-subtle text-secondary font-bold"
                                }`}>
                                  {opt.code}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] mt-0.5 leading-snug ${
                              isSelected ? "text-white/85" : "text-on-surface-variant"
                            }`}>
                              {opt.description}
                            </p>
                          </div>

                          <div className="shrink-0 mt-0.5">
                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full border border-surface-sand-tint flex items-center justify-center" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mandatory Airline Disclaimer */}
      <p className="text-[10px] text-on-surface-variant mt-1.5 leading-normal italic flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px] shrink-0 text-secondary">verified_user</span>
        <span>{FLIGHT_DISCLAIMERS.meal}</span>
      </p>
    </div>
  );
}

