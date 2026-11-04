"use client";

import React, { useState, useMemo } from "react";
import CountryPhoneInput from "./CountryPhoneInput";
import EnquirySuccessModal from "./EnquirySuccessModal";
import {
  HOTEL_TIERS,
  VEHICLE_PAX_OPTIONS,
  calculateKeralaPrice,
} from "@/lib/pricing/kerala";
import { safeSubmitPackageEnquiry } from "@/lib/enquirySubmitter";

export default function DynamicPricingCalculator() {
  const [selectedTier, setSelectedTier] = useState<"STANDARD" | "DELUXE" | "SUPER_DELUXE" | "PREMIUM" | "LUXURY">("DELUXE");
  const [selectedConfigCode, setSelectedConfigCode] = useState<string>("2PAX_SEDAN");
  const [isCustomPax, setIsCustomPax] = useState(false);
  const [customPaxCount, setCustomPaxCount] = useState(3);

  // Supplements state
  const [childrenWithBed, setChildrenWithBed] = useState(0);
  const [childrenNoBed, setChildrenNoBed] = useState(0);
  const [houseboatUpgrade, setHouseboatUpgrade] = useState(false);
  const [mealPlan, setMealPlan] = useState(false);
  const [athirapillyTrip, setAthirapillyTrip] = useState(false);
  const [kanyakumariTrip, setKanyakumariTrip] = useState(false);

  // Enquiry Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredDate, setPreferredDate] = useState("2026-11-15");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successReference, setSuccessReference] = useState("");

  const activeConfig = VEHICLE_PAX_OPTIONS.find((c) => c.code === selectedConfigCode);

  // Compute live price
  const calculationResult = useMemo(() => {
    if (isCustomPax) {
      return calculateKeralaPrice({
        hotelTier: selectedTier,
        adultsCount: customPaxCount,
        childrenWithBedCount: childrenWithBed,
        childrenNoBedCount: childrenNoBed,
        includeHouseboatUpgrade: houseboatUpgrade,
        includeMealPlan: mealPlan,
        includeAthirapillyTrip: athirapillyTrip,
        includeKanyakumariTrip: kanyakumariTrip,
      });
    }

    return calculateKeralaPrice({
      hotelTier: selectedTier,
      configCode: selectedConfigCode,
      adultsCount: activeConfig ? activeConfig.paxCount : 2,
      childrenWithBedCount: childrenWithBed,
      childrenNoBedCount: childrenNoBed,
      includeHouseboatUpgrade: houseboatUpgrade,
      includeMealPlan: mealPlan,
      includeAthirapillyTrip: athirapillyTrip,
      includeKanyakumariTrip: kanyakumariTrip,
    });
  }, [
    selectedTier,
    selectedConfigCode,
    isCustomPax,
    customPaxCount,
    activeConfig,
    childrenWithBed,
    childrenNoBed,
    houseboatUpgrade,
    mealPlan,
    athirapillyTrip,
    kanyakumariTrip,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const payload = {
      fullName,
      email,
      phoneCountryCode,
      phoneNumber,
      packageSlug: "kerala-6n7d-winter",
      hotelTier: selectedTier,
      configCode: isCustomPax ? undefined : selectedConfigCode,
      adultsCount: isCustomPax ? customPaxCount : activeConfig?.paxCount || 2,
      childrenWithBedCount: childrenWithBed,
      childrenNoBedCount: childrenNoBed,
      roomsCount: calculationResult.roomCount,
      preferredTravelDate: preferredDate,
      includeHouseboatUpgrade: houseboatUpgrade,
      includeMealPlan: mealPlan,
      includeAthirapillyTrip: athirapillyTrip,
      includeKanyakumariTrip: kanyakumariTrip,
      specialRequests,
    };

    const res = await safeSubmitPackageEnquiry(payload);
    setSubmitting(false);

    if (res.success && res.referenceId) {
      setSuccessReference(res.referenceId);
    } else {
      setErrorMessage(res.error || "Failed to submit enquiry.");
    }
  };

  const currentHotels = HOTEL_TIERS[selectedTier].hotels;

  return (
    <div className="w-full bg-surface-container-low p-6 sm:p-8 rounded-[36px] shadow-clay-card border border-white/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Interactive Dynamic Selectors (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Tag */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-cream-subtle text-xs font-bold text-secondary uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[16px]">calculate</span>
              <span>Dynamic Matrix Engine</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-primary">
              Configure Your Kerala 6N/7D Package
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Select accommodation standard, group vehicle allocation, and custom excursion add-ons.
            </p>
          </div>

          {/* Step 1: Accommodation Standard / Hotel Tier */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              1. Select Hotel Category (5 Tiers)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.values(HOTEL_TIERS).map((tier) => (
                <button
                  key={tier.code}
                  type="button"
                  onClick={() => setSelectedTier(tier.code)}
                  className={`p-3 rounded-2xl text-left transition-all border ${
                    selectedTier === tier.code
                      ? "bg-primary text-white shadow-clay-button border-primary"
                      : "bg-surface-cream-subtle text-primary hover:bg-surface-container border-transparent shadow-clay-inset"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{tier.name}</span>
                    {tier.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        selectedTier === tier.code ? "bg-gold-deep text-white" : "bg-gold-light text-primary"
                      }`}>
                        ★
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] block mt-1 line-clamp-1 ${
                    selectedTier === tier.code ? "text-surface-sand-tint" : "text-on-surface-variant"
                  }`}>
                    {tier.tagline}
                  </span>
                </button>
              ))}
            </div>

            {/* Display Hotels for Selected Tier */}
            <div className="mt-3 p-3.5 bg-surface-container rounded-2xl shadow-clay-inset text-xs text-on-surface-variant">
              <span className="font-bold text-primary block mb-1">
                Included Hotels for {HOTEL_TIERS[selectedTier].name} Category:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div><span className="font-semibold text-secondary">2N Munnar:</span> {currentHotels.munnar}</div>
                <div><span className="font-semibold text-secondary">1N Thekkady:</span> {currentHotels.thekkady}</div>
                <div><span className="font-semibold text-secondary">1N Alleppey:</span> {currentHotels.alleppey}</div>
                <div><span className="font-semibold text-secondary">2N Kovalam:</span> {currentHotels.kovalam}</div>
              </div>
            </div>
          </div>

          {/* Step 2: Passenger & Vehicle Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-primary uppercase tracking-wider">
                2. Group Size & Dedicated Vehicle
              </label>
              <button
                type="button"
                onClick={() => setIsCustomPax(!isCustomPax)}
                className="text-xs text-secondary font-semibold hover:underline"
              >
                {isCustomPax ? "Switch to Standard Matrices" : "Custom / Odd Party Size?"}
              </button>
            </div>

            {!isCustomPax ? (
              <div className="space-y-2">
                {VEHICLE_PAX_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setSelectedConfigCode(opt.code)}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between border ${
                      selectedConfigCode === opt.code
                        ? "bg-surface-container-lowest border-secondary shadow-md ring-1 ring-secondary"
                        : "bg-surface-cream-subtle border-transparent shadow-clay-inset hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedConfigCode === opt.code ? "bg-secondary text-white" : "bg-surface-container text-primary"
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {opt.vehicleType.includes("Sedan") ? "directions_car" : "airport_shuttle"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-primary block">{opt.label}</span>
                        <span className="text-[11px] text-on-surface-variant">{opt.description}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-secondary block">
                        ₹{calculateKeralaPrice({ hotelTier: selectedTier, configCode: opt.code, adultsCount: opt.paxCount }).unitPricePerAdult?.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">/ person</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-surface-container rounded-2xl shadow-clay-inset space-y-3">
                <span className="text-xs font-bold text-primary block">
                  Select Custom Number of Adult Travellers
                </span>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={customPaxCount}
                    onChange={(e) => setCustomPaxCount(parseInt(e.target.value, 10))}
                    className="flex-1 accent-primary cursor-pointer"
                  />
                  <span className="w-16 px-3 py-1.5 bg-surface-container-lowest rounded-xl text-center text-sm font-bold text-primary shadow-clay-card">
                    {customPaxCount} Pax
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant italic">
                  Note: For non-standard group sizes (e.g. 3, 5, 7, 9 persons), vehicle capacity and extra beds require a tailor-made quotation.
                </p>
              </div>
            )}
          </div>

          {/* Step 3: Children & Bed Options */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              3. Child Policy (5 Nights Munnar/Thekkady/Kovalam)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-surface-cream-subtle p-3 rounded-2xl shadow-clay-inset flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary block">Child With Bed (CWB)</span>
                  <span className="text-[10px] text-on-surface-variant">Age 5-11 yrs with extra rollaway</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChildrenWithBed(Math.max(0, childrenWithBed - 1))}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-xs font-bold">{childrenWithBed}</span>
                  <button
                    type="button"
                    onClick={() => setChildrenWithBed(childrenWithBed + 1)}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-surface-cream-subtle p-3 rounded-2xl shadow-clay-inset flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary block">Child No Bed (CNB)</span>
                  <span className="text-[10px] text-on-surface-variant">Age 2-4 yrs sharing parent bed</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChildrenNoBed(Math.max(0, childrenNoBed - 1))}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-xs font-bold">{childrenNoBed}</span>
                  <button
                    type="button"
                    onClick={() => setChildrenNoBed(childrenNoBed + 1)}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Optional Add-ons & Excursions */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              4. Optional Supplements & Sightseeing
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-cream-subtle shadow-clay-inset cursor-pointer">
                <input
                  type="checkbox"
                  checked={houseboatUpgrade}
                  onChange={(e) => setHouseboatUpgrade(e.target.checked)}
                  className="rounded accent-primary"
                />
                <span className="text-xs font-medium text-primary">
                  Alleppey Houseboat Night (+Lunch/Dinner)
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-cream-subtle shadow-clay-inset cursor-pointer">
                <input
                  type="checkbox"
                  checked={mealPlan}
                  onChange={(e) => setMealPlan(e.target.checked)}
                  className="rounded accent-primary"
                />
                <span className="text-xs font-medium text-primary">
                  Dinner Meal Plan (MAP All Days)
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-cream-subtle shadow-clay-inset cursor-pointer">
                <input
                  type="checkbox"
                  checked={athirapillyTrip}
                  onChange={(e) => setAthirapillyTrip(e.target.checked)}
                  className="rounded accent-primary"
                />
                <span className="text-xs font-medium text-primary">
                  Athirapilly Waterfalls Day Excursion
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-cream-subtle shadow-clay-inset cursor-pointer">
                <input
                  type="checkbox"
                  checked={kanyakumariTrip}
                  onChange={(e) => setKanyakumariTrip(e.target.checked)}
                  className="rounded accent-primary"
                />
                <span className="text-xs font-medium text-primary">
                  Kanyakumari Sunrise Day Excursion
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Summary & Enquiry Box (5 Cols) */}
        <div className="lg:col-span-5 sticky top-28 bg-surface-container-lowest p-6 rounded-[32px] shadow-clay-card border border-white/80 space-y-5">
          
          {/* Price Header */}
          <div className="pb-4 border-b border-surface-sand-tint">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
              Estimated Tour Price
            </span>
            
            {calculationResult.pricingStatus === "EXACT_MATCH" ? (
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="font-headline text-3xl font-bold text-primary">
                    ₹{calculationResult.totalEstimate?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-on-surface-variant block mt-0.5">
                    (₹{calculationResult.unitPricePerAdult?.toLocaleString("en-IN")} per adult • All Taxes Included)
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-primary text-[10px] font-bold shadow-sm">
                  CPAI Breakfast
                </span>
              </div>
            ) : (
              <div className="mt-1 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="font-headline text-xl font-bold text-amber-900 block">
                  Tailor-Made Quotation Required
                </span>
                <span className="text-xs text-amber-800">
                  Custom group sizes require dedicated vehicle allocation and rooming.
                </span>
              </div>
            )}
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-cream-subtle p-2.5 rounded-xl shadow-clay-inset">
              <span className="text-[10px] text-on-surface-variant block font-bold">Duration</span>
              <span className="font-bold text-primary">6 Nights / 7 Days</span>
            </div>
            <div className="bg-surface-cream-subtle p-2.5 rounded-xl shadow-clay-inset">
              <span className="text-[10px] text-on-surface-variant block font-bold">Standard</span>
              <span className="font-bold text-primary">{HOTEL_TIERS[selectedTier].name}</span>
            </div>
          </div>

          {/* Enquiry Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">
              Request Confirmed Proposal
            </span>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 text-error text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name (e.g. Nileshbhai Shah)"
                className="w-full h-11 bg-surface-cream-subtle px-4 rounded-xl text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset"
              />
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address (Optional)"
                className="w-full h-11 bg-surface-cream-subtle px-4 rounded-xl text-xs font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset"
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
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Preferred Travel Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full h-11 bg-surface-cream-subtle px-4 rounded-xl text-xs font-medium text-primary focus:outline-none shadow-clay-inset"
              />
            </div>

            <div>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Special Notes: Jain Meals, Pickup at Cochin Railway, etc."
                className="w-full h-10 bg-surface-cream-subtle px-4 rounded-xl text-xs text-primary focus:outline-none shadow-clay-inset"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-primary text-white font-bold text-xs sm:text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50"
            >
              {submitting ? (
                <span>Generating Proposal...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                    send
                  </span>
                  <span>
                    {calculationResult.pricingStatus === "EXACT_MATCH"
                      ? "Lock This Estimate & Enquire"
                      : "Request Tailor-Made Quotation"}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Anand Office Direct WhatsApp */}
          <div className="pt-2 border-t border-surface-sand-tint text-center">
            <a
              href="https://wa.me/919898000000?text=Hi%20Varni%20Holidays,%20I%20am%20inquiring%20about%20Kerala%206N7D%20Tour"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-secondary font-bold inline-flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-[16px] text-gold-deep">chat</span>
              <span>Prefer instant discussion? Chat directly on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <EnquirySuccessModal
        isOpen={!!successReference}
        onClose={() => setSuccessReference("")}
        referenceId={successReference}
        serviceType="Package"
        title="Kerala Package Enquiry Received"
        message={
          calculationResult.pricingStatus === "EXACT_MATCH"
            ? `Your package enquiry has been placed in our priority queue with your estimated price of ₹${calculationResult.totalEstimate?.toLocaleString("en-IN")}. A Kerala coordinator from our Anand office will connect with you on WhatsApp with your day-wise itinerary proposal.`
            : `Your custom itinerary request has been submitted. Our Anand tour desk will review your party size and prepare a tailored vehicle and rooming quote.`
        }
      />
    </div>
  );
}

