"use client";

import React, { useState } from "react";
import CountryPhoneInput from "./CountryPhoneInput";
import EnquirySuccessModal from "./EnquirySuccessModal";
import AirportAutocomplete from "./AirportAutocomplete";
import MealPreferenceDropdown from "./MealPreferenceDropdown";
import WheelchairDropdown from "./WheelchairDropdown";
import { safeSubmitFlightEnquiry } from "@/lib/enquirySubmitter";
import {
  FLIGHT_MEAL_OPTIONS,
  WHEELCHAIR_OPTIONS,
} from "@/lib/config/flight-options";

function extractIata(str: string): string {
  if (!str) return "";
  const match = str.match(/\(([A-Z]{3})\)/i);
  if (match) return match[1].toUpperCase();
  if (str.trim().length === 3) return str.trim().toUpperCase();
  return "";
}

interface FlightSegmentInput {
  origin: string;
  destination: string;
  date: string;
}

export default function FlightSearchSection() {
  const [tripType, setTripType] = useState<"ROUND_TRIP" | "ONE_WAY" | "MULTI_CITY">("ROUND_TRIP");
  
  // Segment state
  const [segments, setSegments] = useState<FlightSegmentInput[]>([
    { origin: "Ahmedabad (AMD)", destination: "Dubai (DXB)", date: "2026-11-20" },
  ]);
  const [returnDate, setReturnDate] = useState("2026-11-28");

  // Passenger state
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState<"ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST">("ECONOMY");
  const [paxDropdownOpen, setPaxDropdownOpen] = useState(false);

  // Main Section Passenger Preferences
  const [selectedMealCode, setSelectedMealCode] = useState("NO_PREFERENCE");
  const [selectedWheelchairCode, setSelectedWheelchairCode] = useState("NO_ASSISTANCE");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Contact Modal state (ONLY 3 fields)
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Success state
  const [successReference, setSuccessReference] = useState("");

  const totalPassengers = adults + children + infants;

  const handleAddSegment = () => {
    if (segments.length < 5) {
      setSegments([...segments, { origin: "", destination: "", date: "" }]);
    }
  };

  const handleRemoveSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const handleSegmentChange = (index: number, field: keyof FlightSegmentInput, val: string) => {
    const updated = [...segments];
    updated[index][field] = val;
    setSegments(updated);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate origin and destination differ
    if (segments[0].origin.trim().toLowerCase() === segments[0].destination.trim().toLowerCase()) {
      alert("Origin and destination must be different airports.");
      return;
    }

    if (tripType === "ROUND_TRIP" && returnDate && returnDate < segments[0].date) {
      alert("Return date cannot be earlier than departure date.");
      return;
    }

    setContactModalOpen(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const mealOpt =
      FLIGHT_MEAL_OPTIONS.find((m) => m.code === selectedMealCode) || FLIGHT_MEAL_OPTIONS[0];
    const wcOpt =
      WHEELCHAIR_OPTIONS.find((w) => w.code === selectedWheelchairCode) || WHEELCHAIR_OPTIONS[0];

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneCountryCode,
      phoneNumber: phoneNumber.trim(),
      tripType,
      originAirport: segments[0].origin,
      destinationAirport: segments[0].destination,
      departureDate: segments[0].date,
      returnDate: tripType === "ROUND_TRIP" ? returnDate : "",
      adultsCount: adults,
      childrenCount: children,
      infantsCount: infants,
      cabinClass,
      mealPreferenceCode: mealOpt.code,
      mealPreferenceDescription: mealOpt.label,
      wheelchairAssistanceCode: wcOpt.code,
      wheelchairAssistanceDescription: wcOpt.label,
      specialRequirements: specialRequirements.trim(),
    };

    const res = await safeSubmitFlightEnquiry(payload);
    setSubmitting(false);

    if (res.success && res.referenceId) {
      setContactModalOpen(false);
      setSuccessReference(res.referenceId);
    } else {
      setErrorMessage(res.error || "Submission failed. Please verify your contact details.");
    }
  };

  const activeMeal = FLIGHT_MEAL_OPTIONS.find((m) => m.code === selectedMealCode);
  const activeWheelchair = WHEELCHAIR_OPTIONS.find((w) => w.code === selectedWheelchairCode);

  return (
    <section id="flights" className="w-full max-w-[1380px] mx-auto px-3 sm:px-6 md:px-8 py-6 sm:py-10 scroll-mt-24 sm:scroll-mt-28 box-border">
      <div className="w-full bg-surface-container-lowest p-4 sm:p-6 md:p-8 rounded-3xl sm:rounded-[36px] shadow-clay-card border border-white/80 box-border">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 pb-4 sm:pb-6 border-b border-surface-sand-tint">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-cream-subtle text-[11px] sm:text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
              <span className="material-symbols-outlined text-[15px]">flight</span>
              <span>Enquiry-Led Flight Desk</span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-tight">
              Domestic & International Flight Enquiries
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
              Custom routings, group block fares, student baggage allowances, and NRI transfers handled by our Anand flight specialists.
            </p>
          </div>

          {/* Trip Type Tabs - Responsive 3-col on Mobile, pill group on Desktop */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 bg-surface-cream-subtle p-1 rounded-full shadow-clay-inset shrink-0 mt-1 sm:mt-0">
            {(["ROUND_TRIP", "ONE_WAY", "MULTI_CITY"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTripType(type)}
                className={`py-2 px-2 sm:px-4 rounded-full text-[11px] sm:text-xs font-bold transition-all text-center truncate ${
                  tripType === type
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {type === "ROUND_TRIP" ? "Round Trip" : type === "ONE_WAY" ? "One Way" : "Multi City"}
              </button>
            ))}
          </div>
        </div>

        {/* Flight Search Form */}
        <form onSubmit={handleInitialSubmit} className="space-y-4 sm:space-y-6">
          
          {/* BLOCK 1: ROUTE & DATES */}
          <div className="space-y-3">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-surface-container-low p-3.5 sm:p-4 rounded-2xl border border-surface-sand-tint/60"
              >
                {/* Origin */}
                <div className="w-full md:col-span-4 bg-surface-cream-subtle px-3.5 py-2.5 rounded-xl shadow-clay-inset border border-surface-sand-tint/50">
                  <AirportAutocomplete
                    label={`From (Origin) ${tripType === "MULTI_CITY" ? `#${idx + 1}` : ""}`}
                    placeholder="City or code (e.g. AMD, BOM)"
                    value={seg.origin}
                    onChange={(val, item) => handleSegmentChange(idx, "origin", item ? `${item.city} (${item.iata})` : val)}
                    excludeIata={extractIata(seg.destination)}
                    required
                  />
                </div>

                {/* Destination */}
                <div className="w-full md:col-span-4 bg-surface-cream-subtle px-3.5 py-2.5 rounded-xl shadow-clay-inset border border-surface-sand-tint/50">
                  <AirportAutocomplete
                    label={`To (Destination) ${tripType === "MULTI_CITY" ? `#${idx + 1}` : ""}`}
                    placeholder="City or code (e.g. DXB, LHR)"
                    value={seg.destination}
                    onChange={(val, item) => handleSegmentChange(idx, "destination", item ? `${item.city} (${item.iata})` : val)}
                    excludeIata={extractIata(seg.origin)}
                    required
                  />
                </div>

                {/* Dates Container: On Mobile, side-by-side 2 cols; on Desktop, grid cols */}
                <div className={`w-full ${tripType === "ROUND_TRIP" ? "md:col-span-4 grid grid-cols-2 gap-2 sm:gap-3" : "md:col-span-4"}`}>
                  {/* Departure Date */}
                  <div className="bg-surface-cream-subtle px-3 py-2 rounded-xl shadow-clay-inset border border-surface-sand-tint/50 flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-secondary text-[18px] sm:text-[20px] shrink-0">
                      calendar_month
                    </span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider truncate">
                        Departure
                      </label>
                      <input
                        type="date"
                        required
                        value={seg.date}
                        onChange={(e) => handleSegmentChange(idx, "date", e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-primary focus:outline-none min-w-0"
                      />
                    </div>
                  </div>

                  {/* Return Date (if Round Trip) */}
                  {tripType === "ROUND_TRIP" && (
                    <div className="bg-surface-cream-subtle px-3 py-2 rounded-xl shadow-clay-inset border border-surface-sand-tint/50 flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-gold-deep text-[18px] sm:text-[20px] shrink-0">
                        event_repeat
                      </span>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider truncate">
                          Return
                        </label>
                        <input
                          type="date"
                          required
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full bg-transparent text-xs font-semibold text-primary focus:outline-none min-w-0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Multi-City Remove button */}
                {tripType === "MULTI_CITY" && (
                  <div className="md:col-span-12 flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveSegment(idx)}
                      disabled={segments.length === 1}
                      className="h-8 px-3 rounded-full bg-surface-container flex items-center gap-1 text-xs text-error hover:bg-white disabled:opacity-30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Remove Leg</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Flight Segment Button (for Multi-City) */}
            {tripType === "MULTI_CITY" && segments.length < 5 && (
              <button
                type="button"
                onClick={handleAddSegment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-cream-subtle text-primary text-xs font-bold shadow-clay-inset hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Another Flight Leg</span>
              </button>
            )}

            {/* Travellers & Cabin Class Selector */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
              <div className="relative w-full md:col-span-6">
                <button
                  type="button"
                  onClick={() => setPaxDropdownOpen(!paxDropdownOpen)}
                  className="w-full min-h-[50px] sm:h-14 bg-surface-cream-subtle px-4 rounded-2xl shadow-clay-inset flex items-center justify-between text-left border border-surface-sand-tint hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">group</span>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Travellers & Class
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-primary truncate block">
                        {totalPassengers} Travellers • {cabinClass.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0">
                    {paxDropdownOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {/* Passenger Dropdown Menu */}
                {paxDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 right-0 sm:right-auto sm:w-80 z-40 bg-[#FAF8F5] rounded-3xl p-4 sm:p-5 shadow-clay-floating border border-surface-sand-tint space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-primary block">Adults</span>
                        <span className="text-[10px] text-on-surface-variant">Age 12+ years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary hover:bg-white"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-primary">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(9, adults + 1))}
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary hover:bg-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-primary block">Children</span>
                        <span className="text-[10px] text-on-surface-variant">Age 2-11 years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary hover:bg-white"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-primary">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(8, children + 1))}
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary hover:bg-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-primary block">Infants</span>
                        <span className="text-[10px] text-on-surface-variant">Under 2 years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInfants(Math.max(0, infants - 1))}
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary hover:bg-white"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-primary">{infants}</span>
                        <button
                          type="button"
                          onClick={() => setInfants(Math.min(4, infants + 1))}
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary hover:bg-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Cabin Class Selection */}
                    <div className="pt-2 border-t border-surface-sand-tint">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Cabin Class
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"] as const).map((cls) => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => setCabinClass(cls)}
                            className={`py-2 px-2.5 rounded-xl text-[11px] font-bold text-center transition-colors ${
                              cabinClass === cls
                                ? "bg-primary text-white shadow-sm"
                                : "bg-white text-primary border border-surface-sand-tint hover:bg-surface-cream-subtle"
                            }`}
                          >
                            {cls.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaxDropdownOpen(false)}
                      className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Trust Guarantee Note */}
              <div className="w-full md:col-span-6 text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">verified</span>
                <span className="leading-snug">
                  <strong className="text-primary font-semibold">Zero Hidden Fare Charges.</strong> Direct airline GDS deals, student allowances & family block rates.
                </span>
              </div>
            </div>
          </div>

          {/* BLOCK 2: PASSENGER SPECIAL PREFERENCES */}
          <div className="w-full bg-surface-container-low p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-surface-sand-tint/70 space-y-4 box-border">
            <div className="flex items-center gap-2 pb-2 border-b border-surface-sand-tint/60">
              <span className="material-symbols-outlined text-secondary text-[20px]">room_service</span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-primary">Passenger Special Preferences</h3>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant">
                  Select airline meal requirements and wheelchair support before requesting options.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {/* 1. Meal Preference Dropdown (Custom Component - No Black Menu) */}
              <div className="w-full min-w-0">
                <MealPreferenceDropdown
                  selectedCode={selectedMealCode}
                  onChange={(code) => setSelectedMealCode(code)}
                />
              </div>

              {/* 2. Wheelchair Assistance Dropdown (Custom Component - No Black Menu) */}
              <div className="w-full min-w-0">
                <WheelchairDropdown
                  selectedCode={selectedWheelchairCode}
                  onChange={(code) => setSelectedWheelchairCode(code)}
                />
              </div>
            </div>

            {/* 3. Additional Travel Notes */}
            <div className="w-full">
              <label className="block text-[11px] font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-secondary">edit_note</span>
                <span>Additional Routing / Baggage Notes (Optional)</span>
              </label>
              <input
                type="text"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. Student 40kg baggage allowance, Bassinet seat for infant, Direct flight only..."
                className="w-full h-11 bg-surface-cream-subtle px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm text-primary placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset border border-surface-sand-tint"
              />
            </div>
          </div>

          {/* BLOCK 3: ACTION SUBMIT BAR */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-1">
            <div className="text-[11px] sm:text-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-gold-deep text-[18px] sm:text-[20px] shrink-0">support_agent</span>
              <span>Need complex multi-city or NRI family bookings? You can also consult directly on WhatsApp.</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 h-12 sm:h-14 rounded-full bg-primary text-white font-bold text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container shrink-0 transition-transform active:scale-98 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-tertiary-fixed-dim">
                send
              </span>
              <span>Get Flight Options</span>
            </button>
          </div>
        </form>
      </div>

      {/* FINAL CONTACT DETAILS MODAL (ONLY 3 FIELDS) */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-3xl sm:rounded-[32px] p-5 sm:p-7 shadow-clay-floating border border-white/80 box-border mx-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-surface-cream-subtle flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Modal Header */}
            <div className="mb-4 pr-6">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">
                <span className="material-symbols-outlined text-[14px]">contact_mail</span>
                <span>Final Step • Contact Details</span>
              </span>
              <h3 id="contact-modal-title" className="font-headline text-lg sm:text-xl font-bold text-primary">
                Where should we send your flight options?
              </h3>
            </div>

            {/* Compact Read-Only Flight Summary Underneath */}
            <div className="mb-4 p-3 bg-surface-container-low rounded-2xl border border-surface-sand-tint space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary truncate">
                <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">flight_takeoff</span>
                <span className="truncate">{segments[0].origin}</span>
                <span className="text-secondary font-mono shrink-0">✈</span>
                <span className="truncate">{segments[0].destination}</span>
              </div>
              <div className="text-[11px] text-on-surface-variant flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>{totalPassengers} {totalPassengers === 1 ? "Passenger" : "Passengers"}</span>
                <span>•</span>
                <span>{cabinClass.replace("_", " ")}</span>
                <span>•</span>
                <span>{tripType === "ROUND_TRIP" ? "Round Trip" : tripType === "ONE_WAY" ? "One Way" : "Multi City"}</span>
              </div>
              {(activeMeal?.code !== "NO_PREFERENCE" || activeWheelchair?.code !== "NO_ASSISTANCE") && (
                <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
                  {activeMeal && activeMeal.code !== "NO_PREFERENCE" && (
                    <span className="bg-surface-cream-subtle text-secondary px-2 py-0.5 rounded-full font-semibold border border-secondary/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">restaurant</span>
                      <span>{activeMeal.code}</span>
                    </span>
                  )}
                  {activeWheelchair && activeWheelchair.code !== "NO_ASSISTANCE" && (
                    <span className="bg-surface-cream-subtle text-secondary px-2 py-0.5 rounded-full font-semibold border border-secondary/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">accessible</span>
                      <span>{activeWheelchair.code}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-error text-xs font-medium border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* 3-Field Contact Form */}
            <form onSubmit={handleFinalSubmit} className="space-y-3.5">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajeshbhai Patel"
                  className="w-full h-11 sm:h-12 bg-surface-cream-subtle px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset border border-surface-sand-tint"
                />
              </div>

              {/* Field 2: Email Address */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh@example.com"
                  className="w-full h-11 sm:h-12 bg-surface-cream-subtle px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset border border-surface-sand-tint"
                />
              </div>

              {/* Field 3: Phone / WhatsApp Number */}
              <div className="w-full min-w-0">
                <CountryPhoneInput
                  countryCode={phoneCountryCode}
                  phoneNumber={phoneNumber}
                  onCountryCodeChange={setPhoneCountryCode}
                  onPhoneNumberChange={setPhoneNumber}
                  required
                />
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 sm:h-13 py-3 rounded-full bg-primary text-white font-bold text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50 mt-1 shadow-md"
              >
                {submitting ? (
                  <span>Submitting Flight Request...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                      check_circle
                    </span>
                    <span>Submit Flight Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <EnquirySuccessModal
        isOpen={!!successReference}
        onClose={() => setSuccessReference("")}
        referenceId={successReference}
        serviceType="Flight"
        title="Flight Consultation Booked"
        message="Your flight routing has been placed in our priority queue. A flight coordinator from our Anand office will contact you with the best available fare options."
      />
    </section>
  );
}
