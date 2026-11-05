"use client";

import React, { useState, useRef, useEffect } from "react";
import { COUNTRY_CODES, CountryCode } from "@/lib/validation/phone";

interface CountryPhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  error?: string;
  required?: boolean;
  hideLabel?: boolean;
}

export default function CountryPhoneInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  error,
  required = true,
  hideLabel = false,
}: CountryPhoneInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCountry =
    COUNTRY_CODES.find((c) => c.dialCode === countryCode) || COUNTRY_CODES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="flex flex-col gap-1 w-full min-w-0">
      {!hideLabel && (
        <label className="block text-xs font-bold text-primary uppercase tracking-wider">
          Mobile / WhatsApp Number {required && <span className="text-error">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center gap-2 w-full min-w-0" ref={dropdownRef}>
        {/* Country Selector Button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="h-12 px-3 bg-surface-container rounded-2xl flex items-center gap-1.5 shadow-clay-inset text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          >
            <span>{selectedCountry.flag}</span>
            <span>{selectedCountry.dialCode}</span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              {dropdownOpen ? "expand_less" : "expand_more"}
            </span>
          </button>

          {/* Country Code Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute top-14 left-0 z-50 w-64 max-h-60 overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-clay-floating border border-surface-sand-tint p-2"
              role="listbox"
            >
              {COUNTRY_CODES.map((country) => (
                <button
                  key={`${country.code}-${country.dialCode}`}
                  type="button"
                  onClick={() => {
                    onCountryCodeChange(country.dialCode);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between hover:bg-surface-cream-subtle transition-colors ${
                    country.dialCode === countryCode ? "bg-surface-cream-subtle font-bold text-primary" : "text-on-surface"
                  }`}
                  role="option"
                  aria-selected={country.dialCode === countryCode}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{country.flag}</span>
                    <span className="truncate">{country.name}</span>
                  </span>
                  <span className="text-on-surface-variant font-mono shrink-0 ml-2">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* National Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder={selectedCountry.example}
          required={required}
          className="flex-1 min-w-0 w-full h-12 bg-surface-cream-subtle px-4 rounded-2xl text-primary text-sm font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset"
        />
      </div>

      {error && <span className="text-xs text-error font-medium mt-0.5">{error}</span>}
      <span className="text-[11px] text-on-surface-variant">
        Country-aware validation ({selectedCountry.minDigits} digits for {selectedCountry.name}). Never shared with third parties.
      </span>
    </div>
  );
}

