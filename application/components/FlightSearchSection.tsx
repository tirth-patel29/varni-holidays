"use client";

import React, { useState } from "react";
import CountryPhoneInput from "./CountryPhoneInput";
import EnquirySuccessModal from "./EnquirySuccessModal";
import { safeSubmitFlightEnquiry } from "@/lib/enquirySubmitter";

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

  // Modal & Contact state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Success state
  const [successReference, setSuccessReference] = useState("");

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

    const payload = {
      fullName,
      email,
      phoneCountryCode,
      phoneNumber,
      tripType,
      originAirport: segments[0].origin,
      destinationAirport: segments[0].destination,
      departureDate: segments[0].date,
      returnDate: tripType === "ROUND_TRIP" ? returnDate : "",
      adultsCount: adults,
      childrenCount: children,
      infantsCount: infants,
      cabinClass,
      specialRequirements,
    };

    const res = await safeSubmitFlightEnquiry(payload);
    setSubmitting(false);

    if (res.success && res.referenceId) {
      setContactModalOpen(false);
      setSuccessReference(res.referenceId);
    } else {
      setErrorMessage(res.error || "Submission failed. Please verify your inputs.");
    }
  };

  return (
    <section id="flights" className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-12 scroll-mt-24">
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[36px] shadow-clay-card border border-white/80">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-6 border-b border-surface-sand-tint">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-cream-subtle text-xs font-bold text-secondary uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[16px]">flight</span>
              <span>Enquiry-Led Flight Desk</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
              Domestic & International Flight Enquiries
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Custom routings, group block fares, student baggage allowances, and NRI transfers handled by our Anand flight specialists.
            </p>
          </div>

          {/* Trip Type Tabs */}
          <div className="flex items-center gap-1 bg-surface-cream-subtle p-1 rounded-full shadow-clay-inset self-start sm:self-end">
            {(["ROUND_TRIP", "ONE_WAY", "MULTI_CITY"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTripType(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
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
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          
          {/* Segments Mapping */}
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-surface-container-low p-3 sm:p-4 rounded-2xl"
            >
              {/* Origin */}
              <div className="md:col-span-4 bg-surface-cream-subtle px-4 py-2.5 rounded-xl shadow-clay-inset flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
                  flight_takeoff
                </span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    From {tripType === "MULTI_CITY" && `#${idx + 1}`}
                  </label>
                  <input
                    type="text"
                    required
                    value={seg.origin}
                    onChange={(e) => handleSegmentChange(idx, "origin", e.target.value)}
                    placeholder="e.g. Ahmedabad (AMD)"
                    className="w-full bg-transparent text-sm font-semibold text-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="md:col-span-4 bg-surface-cream-subtle px-4 py-2.5 rounded-xl shadow-clay-inset flex items-center gap-2">
                <span className="material-symbols-outlined text-gold-deep text-[20px] shrink-0">
                  flight_land
                </span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    To {tripType === "MULTI_CITY" && `#${idx + 1}`}
                  </label>
                  <input
                    type="text"
                    required
                    value={seg.destination}
                    onChange={(e) => handleSegmentChange(idx, "destination", e.target.value)}
                    placeholder="e.g. London Heathrow (LHR)"
                    className="w-full bg-transparent text-sm font-semibold text-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Departure Date */}
              <div className={`${tripType === "ROUND_TRIP" ? "md:col-span-2" : "md:col-span-3"} bg-surface-cream-subtle px-4 py-2.5 rounded-xl shadow-clay-inset flex items-center gap-2`}>
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
                  calendar_month
                </span>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Departure
                  </label>
                  <input
                    type="date"
                    required
                    value={seg.date}
                    onChange={(e) => handleSegmentChange(idx, "date", e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Return Date (if Round Trip) */}
              {tripType === "ROUND_TRIP" && (
                <div className="md:col-span-2 bg-surface-cream-subtle px-4 py-2.5 rounded-xl shadow-clay-inset flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold-deep text-[20px] shrink-0">
                    event_repeat
                  </span>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Return
                    </label>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Multi-City Remove button */}
              {tripType === "MULTI_CITY" && (
                <div className="md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveSegment(idx)}
                    disabled={segments.length === 1}
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-error hover:bg-white disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-cream-subtle text-primary text-xs font-bold shadow-clay-inset hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Another Flight Leg</span>
            </button>
          )}

          {/* Bottom Bar: Passengers, Cabin Class & Submit */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
            
            {/* Passenger Selector Dropdown Toggle */}
            <div className="relative md:col-span-5">
              <button
                type="button"
                onClick={() => setPaxDropdownOpen(!paxDropdownOpen)}
                className="w-full h-14 bg-surface-cream-subtle px-4 rounded-2xl shadow-clay-inset flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[22px]">group</span>
                  <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Travellers & Class
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      {adults + children + infants} Travellers • {cabinClass.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  expand_more
                </span>
              </button>

              {/* Passenger Dropdown Menu */}
              {paxDropdownOpen && (
                <div className="absolute top-16 left-0 z-30 w-full sm:w-80 bg-surface-container-lowest rounded-3xl p-5 shadow-clay-floating border border-white/80 space-y-4">
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
                        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-primary">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.min(9, adults + 1))}
                        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary"
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
                        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-primary">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(Math.min(8, children + 1))}
                        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary"
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
                        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-primary">{infants}</span>
                      <button
                        type="button"
                        onClick={() => setInfants(Math.min(4, infants + 1))}
                        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary"
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
                    <select
                      value={cabinClass}
                      onChange={(e) => setCabinClass(e.target.value as any)}
                      className="w-full bg-surface-cream-subtle px-3 py-2 rounded-xl text-xs font-semibold text-primary focus:outline-none"
                    >
                      <option value="ECONOMY">Economy Class</option>
                      <option value="PREMIUM_ECONOMY">Premium Economy</option>
                      <option value="BUSINESS">Business Class</option>
                      <option value="FIRST">First Class</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaxDropdownOpen(false)}
                    className="w-full py-2 bg-primary text-white rounded-xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Explanatory Trust Note */}
            <div className="md:col-span-4 text-xs text-on-surface-variant">
              <span className="font-semibold text-primary">Zero Hidden Fees.</span> Our flight desk compares direct GDS airline deals with special Gujarati meal & baggage options.
            </div>

            {/* Action Submit Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full h-14 rounded-full bg-primary text-white font-bold text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[20px] text-tertiary-fixed-dim">
                  send
                </span>
                <span>Get Flight Options</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Contact Details Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-[32px] p-6 sm:p-8 shadow-clay-floating border border-white/80">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-surface-cream-subtle flex items-center justify-center text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                Step 2 of 2
              </span>
              <h3 className="font-headline text-xl font-bold text-primary">Where should we send flight options?</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Routing: {segments[0].origin} → {segments[0].destination} ({adults + children + infants} Pax)
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-error text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleFinalSubmit} className="space-y-4">
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
                  className="w-full h-12 bg-surface-cream-subtle px-4 rounded-2xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh@example.com"
                  className="w-full h-12 bg-surface-cream-subtle px-4 rounded-2xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset"
                />
              </div>

              <CountryPhoneInput
                countryCode={phoneCountryCode}
                phoneNumber={phoneNumber}
                onCountryCodeChange={setPhoneCountryCode}
                onPhoneNumberChange={setPhoneNumber}
                required
              />

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Special Requirements (Optional)
                </label>
                <input
                  type="text"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g. Pure Jain Meal, Extra Student Baggage, Direct Flight"
                  className="w-full h-10 bg-surface-cream-subtle px-4 rounded-xl text-xs text-primary focus:outline-none shadow-clay-inset"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-primary text-white font-bold text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50"
              >
                {submitting ? (
                  <span>Saving Enquiry...</span>
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

