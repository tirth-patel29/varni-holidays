'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { Plane, MapPin, X, Loader2 } from 'lucide-react';

export interface AirportItem {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  type: string;
}

interface AirportAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string; // e.g. "AMD" or "Ahmedabad (AMD)"
  onChange: (value: string, item?: AirportItem) => void;
  excludeIata?: string;
  required?: boolean;
  error?: string;
  id?: string;
}

export default function AirportAutocomplete({
  label,
  placeholder = 'City or 3-letter Airport Code (e.g. AMD, BOM, DEL)',
  value,
  onChange,
  excludeIata,
  required = false,
  error,
  id,
}: AirportAutocompleteProps) {
  const autoId = useId();
  const inputId = id || autoId;

  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AirportItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [sameAirportWarning, setSameAirportWarning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch airport suggestions with debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    // If query already matches the selected value exactly (e.g. "Ahmedabad (AMD)"), don't re-query
    if (trimmed === value) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          let filtered: AirportItem[] = data.airports || [];
          setResults(filtered);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('Failed to fetch airport suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, value]);

  const handleSelect = (item: AirportItem) => {
    if (excludeIata && item.iata.toUpperCase() === excludeIata.toUpperCase()) {
      setSameAirportWarning(true);
      setTimeout(() => setSameAirportWarning(false), 3000);
      return;
    }

    const displayStr = `${item.city} (${item.iata})`;
    setQuery(displayStr);
    onChange(item.iata, item);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, search: string) => {
    if (!search || !text) return text;
    const cleanSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${cleanSearch})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={i} className="bg-amber-100 text-amber-900 font-semibold rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#153650] mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 text-[#969CA5] pointer-events-none">
          <Plane size={15} className="rotate-45" />
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSameAirportWarning(false);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={`w-full pl-9 pr-9 py-2.5 bg-white border rounded-lg text-xs md:text-sm text-[#153650] placeholder:text-[#969CA5] transition-all focus:outline-none focus:ring-2 focus:ring-[#E9B95E]/50 focus:border-[#E9B95E] ${
            error ? 'border-red-500' : 'border-[#E8E3D8]'
          }`}
        />

        <div className="absolute right-3 flex items-center gap-1">
          {loading && <Loader2 size={14} className="animate-spin text-[#969CA5]" />}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#969CA5] hover:text-[#153650] transition-colors p-0.5"
              title="Clear airport"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {sameAirportWarning && (
        <div className="mt-1 text-[11px] text-red-600 font-medium">
          Source and destination airports cannot be the same.
        </div>
      )}

      {error && !sameAirportWarning && (
        <div className="mt-1 text-[11px] text-red-600">{error}</div>
      )}

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E8E3D8] rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in-50 duration-150">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#969CA5]">
              No commercial airports found matching &ldquo;<span className="font-semibold text-[#153650]">{query}</span>&rdquo;.
            </div>
          ) : (
            <ul className="divide-y divide-[#F1EEE5]">
              {results.map((item, index) => {
                const isExcluded = excludeIata && item.iata.toUpperCase() === excludeIata.toUpperCase();
                const isSelected = selectedIndex === index;

                return (
                  <li
                    key={`${item.iata}-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!isExcluded) handleSelect(item);
                    }}
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isExcluded
                        ? 'opacity-40 cursor-not-allowed bg-slate-50'
                        : isSelected
                        ? 'bg-[#F8F6F0]'
                        : 'hover:bg-[#F8F6F0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-md bg-[#F1EEE5] text-[#153650] flex items-center justify-center shrink-0">
                        <MapPin size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#153650] truncate">
                          {highlightMatch(item.city, query)}
                          <span className="text-[11px] font-normal text-[#969CA5] ml-1.5 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#969CA5] truncate">
                          {item.country} • {item.icao || item.iata}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {item.iata}
                      </span>
                      {isExcluded && (
                        <span className="text-[10px] text-red-500 font-medium">Selected as origin</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

