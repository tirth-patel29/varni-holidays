'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';
import { formatIST24, getIST24Parts, parseIST24ToDate } from '@/lib/flights/timing';

export interface DateTimePicker24Props {
  label?: string;
  value?: string; // ISO string or timestamp
  onChange?: (isoString: string) => void;
  // Backward compatibility props:
  dateValue?: string;
  hourValue?: string;
  minValue?: string;
  onLegacyChange?: (date: string, hour: string, minute: string) => void;
  required?: boolean;
  minDate?: string;
  helperText?: string;
  idPrefix?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DateTimePicker24({
  label,
  value,
  onChange,
  dateValue,
  hourValue,
  minValue,
  onLegacyChange,
  required = false,
  minDate,
  helperText,
  idPrefix = 'dt24',
  placeholder = 'DD/MM/YYYY, HH:mm',
  disabled = false,
}: DateTimePicker24Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Compute initial Date object in IST
  const getInitialDate = (): Date => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    if (dateValue) {
      try {
        return parseIST24ToDate(dateValue, hourValue || '00', minValue || '00');
      } catch {}
    }
    return new Date();
  };

  const [internalDate, setInternalDate] = useState<Date>(getInitialDate);
  const [textInput, setTextInput] = useState<string>('');

  // Calendar navigation state (year & month index 0-11 in IST)
  const [viewYear, setViewYear] = useState<number>(internalDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(internalDate.getMonth());

  // Time state (00-23 and 00-59)
  const [hour, setHour] = useState<string>('00');
  const [minute, setMinute] = useState<string>('00');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update Popover Floating Coordinates
  const updatePosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const popoverHeight = 315;
    const popoverWidth = 264;
    const margin = 6;

    // Determine vertical placement based on viewport space
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = 0;
    if (spaceBelow >= popoverHeight + margin) {
      // Enough room below
      top = rect.bottom + margin;
    } else if (spaceAbove >= popoverHeight + margin) {
      // Open above
      top = rect.top - popoverHeight - margin;
    } else {
      // Fit within viewport bounds
      top = Math.max(margin, Math.min(window.innerHeight - popoverHeight - margin, rect.bottom + margin));
    }

    // Determine horizontal placement (align with input left, stay within screen)
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - popoverWidth - margin);
    }
    if (left < margin) {
      left = margin;
    }

    setCoords({ top, left });
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
  };

  // Sync state when external value changes
  useEffect(() => {
    let d: Date;
    if (value) {
      const parsed = new Date(value);
      d = !isNaN(parsed.getTime()) ? parsed : new Date();
    } else if (dateValue) {
      try {
        d = parseIST24ToDate(dateValue, hourValue || '00', minValue || '00');
      } catch {
        d = new Date();
      }
    } else {
      return;
    }

    setInternalDate(d);
    const parts = getIST24Parts(d);
    setTextInput(parts.formatted);
    setHour(parts.hourStr);
    setMinute(parts.minStr);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value, dateValue, hourValue, minValue]);

  // Handle outside click & viewport resize/scroll
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isOpen) {
        updatePosition();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Parse direct user typed string e.g. "24/11/2026, 23:26" or "24/11/2026 23:26"
  const parseManualInput = (str: string): Date | null => {
    const trimmed = str.trim();
    if (!trimmed) return null;

    const match = trimmed.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})[,\s]+(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const h = parseInt(match[4], 10);
    const m = parseInt(match[5], 10);

    if (day < 1 || day > 31 || month < 1 || month > 12 || h < 0 || h > 23 || m < 0 || m > 59) {
      return null;
    }

    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      return parseIST24ToDate(dStr, h, m);
    } catch {
      return null;
    }
  };

  const emitChange = (d: Date) => {
    setInternalDate(d);
    const parts = getIST24Parts(d);
    setTextInput(parts.formatted);
    setHour(parts.hourStr);
    setMinute(parts.minStr);

    if (onChange) {
      onChange(d.toISOString());
    }
    if (onLegacyChange) {
      onLegacyChange(parts.dateStr, parts.hourStr, parts.minStr);
    }
  };

  // Direct text edit in input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTextInput(val);

    const parsed = parseManualInput(val);
    if (parsed) {
      emitChange(parsed);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  };

  const handleInputBlur = () => {
    const parsed = parseManualInput(textInput);
    if (parsed) {
      emitChange(parsed);
    } else if (internalDate) {
      setTextInput(formatIST24(internalDate));
    }
  };

  // Select day in calendar
  const handleSelectDay = (day: number) => {
    const dStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      const newDate = parseIST24ToDate(dStr, hour, minute);
      emitChange(newDate);
    } catch (err) {
      console.error(err);
    }
  };

  // Change hour (00-23)
  const handleHourChange = (newHour: string) => {
    const cleanH = newHour.padStart(2, '0');
    setHour(cleanH);
    const parts = getIST24Parts(internalDate);
    try {
      const newDate = parseIST24ToDate(parts.dateStr, cleanH, minute);
      emitChange(newDate);
    } catch {}
  };

  // Change minute (00-59)
  const handleMinuteChange = (newMin: string) => {
    const cleanM = newMin.padStart(2, '0');
    setMinute(cleanM);
    const parts = getIST24Parts(internalDate);
    try {
      const newDate = parseIST24ToDate(parts.dateStr, hour, cleanM);
      emitChange(newDate);
    } catch {}
  };

  // Quick action: Set Now
  const handleSetNow = () => {
    const now = new Date();
    emitChange(now);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  // Quick action: +24 Hours (convenient for hold deadlines)
  const handleAdd24Hours = () => {
    const base = internalDate || new Date();
    const plus24 = new Date(base.getTime() + 24 * 60 * 60 * 1000);
    emitChange(plus24);
    setViewYear(plus24.getFullYear());
    setViewMonth(plus24.getMonth());
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectedParts = getIST24Parts(internalDate);
  const selectedDay = internalDate ? parseInt(selectedParts.formatted.split('/')[0], 10) : null;
  const isSelectedMonth = internalDate && internalDate.getFullYear() === viewYear && internalDate.getMonth() === viewMonth;

  // Generate 24-hr options
  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // Popover panel rendered via React Portal directly into document.body
  // This guarantees it is NEVER clipped by parent modal or overflow-y-auto containers!
  const popoverContent = isOpen && mounted ? (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 99999,
        backgroundColor: '#ffffff',
      }}
      className="border border-slate-200 rounded-xl shadow-2xl p-3 w-[264px] text-slate-800 animate-in fade-in-50 zoom-in-95 duration-100 select-none"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <span key={d} className="text-[10px] font-bold text-slate-400">
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {/* Leading days from previous month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <span
            key={`prev-${i}`}
            className="h-6 flex items-center justify-center text-[10px] text-slate-300 select-none"
          >
            {daysInPrevMonth - firstDayOfWeek + i + 1}
          </span>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected = isSelectedMonth && selectedDay === day;
          return (
            <button
              key={`curr-${day}`}
              type="button"
              onClick={() => handleSelectDay(day)}
              className={`h-6 w-6 mx-auto flex items-center justify-center text-[11px] rounded-md transition-all font-medium cursor-pointer ${
                isSelected
                  ? 'bg-[#153650] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* 24-Hour Time Selector (White background, Black text explicitly enforced) */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Time (24-hr IST)
          </span>
          <div className="flex items-center gap-1">
            <select
              value={hour}
              onChange={(e) => handleHourChange(e.target.value)}
              style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
              className="px-1.5 py-0.5 border border-slate-300 rounded text-xs font-mono font-bold bg-white text-slate-900 focus:ring-1 focus:ring-[#153650] focus:outline-none cursor-pointer"
              title="Hour (00 - 23)"
            >
              {hoursList.map((h) => (
                <option
                  key={h}
                  value={h}
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  className="bg-white text-slate-900"
                >
                  {h}
                </option>
              ))}
            </select>
            <span className="text-xs font-bold text-slate-400">:</span>
            <select
              value={minute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
              className="px-1.5 py-0.5 border border-slate-300 rounded text-xs font-mono font-bold bg-white text-slate-900 focus:ring-1 focus:ring-[#153650] focus:outline-none cursor-pointer"
              title="Minute (00 - 59)"
            >
              {minutesList.map((m) => (
                <option
                  key={m}
                  value={m}
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                  className="bg-white text-slate-900"
                >
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Actions & Done Button */}
        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSetNow}
              className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              Now
            </button>
            <button
              type="button"
              onClick={handleAdd24Hours}
              className="px-2 py-0.5 text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
            >
              +24h
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#153650] hover:bg-[#0E2537] text-white text-[11px] font-bold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-3 h-3" />
            Done
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={`${idPrefix}-input`}
          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
        >
          {label}
        </label>
      )}

      {/* Single Compact Rectangular Input */}
      <div className="relative">
        <input
          ref={inputRef}
          id={`${idPrefix}-input`}
          type="text"
          required={required}
          disabled={disabled}
          value={textInput}
          placeholder={placeholder}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={handleOpen}
          className="w-full h-[34px] px-3 py-1.5 pr-8 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-[#153650] focus:border-[#153650] focus:outline-none transition-all cursor-pointer bg-white"
        />
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
          tabIndex={-1}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-500 mt-1">{helperText}</p>
      )}

      {/* Portal Popover */}
      {mounted && typeof document !== 'undefined' && popoverContent ? createPortal(popoverContent, document.body) : null}
    </div>
  );
}
