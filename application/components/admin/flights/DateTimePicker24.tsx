'use client';

import React from 'react';
import { Clock, Calendar } from 'lucide-react';

interface DateTimePicker24Props {
  label: string;
  dateValue: string; // YYYY-MM-DD
  hourValue: string; // 00 to 23
  minValue: string;  // 00 to 59
  onChange: (date: string, hour: string, minute: string) => void;
  required?: boolean;
  minDate?: string;
  helperText?: string;
  idPrefix?: string;
}

export default function DateTimePicker24({
  label,
  dateValue,
  hourValue,
  minValue,
  onChange,
  required = false,
  minDate,
  helperText,
  idPrefix = 'dt24',
}: DateTimePicker24Props) {
  // Format for live IST preview
  const formatDisplay = () => {
    if (!dateValue) return '—';
    const parts = dateValue.split('-');
    if (parts.length !== 3) return '—';
    const [y, m, d] = parts;
    const h = (hourValue || '00').padStart(2, '0');
    const min = (minValue || '00').padStart(2, '0');
    return `${d}/${m}/${y}, ${h}:${min}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`${idPrefix}-date`}
          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
        >
          {label}
        </label>
        {dateValue && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            {formatDisplay()} (IST 24-hr)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        {/* Date Selector */}
        <div className="sm:col-span-6 relative">
          <input
            id={`${idPrefix}-date`}
            type="date"
            required={required}
            min={minDate}
            value={dateValue}
            onChange={(e) => onChange(e.target.value, hourValue, minValue)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#153650] focus:outline-none"
          />
        </div>

        {/* 24-Hour Selector (00 - 23) - NO AM/PM */}
        <div className="sm:col-span-3">
          <div className="relative">
            <select
              id={`${idPrefix}-hour`}
              value={hourValue.padStart(2, '0')}
              onChange={(e) => onChange(dateValue, e.target.value, minValue)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 bg-white focus:ring-2 focus:ring-[#153650] focus:outline-none cursor-pointer"
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h} hrs
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Minute Selector (00 - 59) */}
        <div className="sm:col-span-3">
          <div className="relative">
            <select
              id={`${idPrefix}-min`}
              value={minValue.padStart(2, '0')}
              onChange={(e) => onChange(dateValue, hourValue, e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 bg-white focus:ring-2 focus:ring-[#153650] focus:outline-none cursor-pointer"
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-500 mt-0.5">{helperText}</p>
      )}
    </div>
  );
}
