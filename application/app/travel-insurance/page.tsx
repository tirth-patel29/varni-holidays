"use client";

import React, { useState } from "react";
import CountryPhoneInput from "@/components/CountryPhoneInput";
import EnquirySuccessModal from "@/components/EnquirySuccessModal";
import { safeSubmitTravelInsuranceEnquiry } from "@/lib/enquirySubmitter";

export default function TravelInsurancePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [travelDate, setTravelDate] = useState("2026-12-01");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("1985-05-15");
  const [hasPreExistingDisease, setHasPreExistingDisease] = useState<boolean>(false);
  const [preExistingDiseaseDetails, setPreExistingDiseaseDetails] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successReference, setSuccessReference] = useState("");

  const popularDestinations = [
    "Schengen (Europe)",
    "United States (USA)",
    "United Kingdom (UK)",
    "Canada",
    "United Arab Emirates (Dubai)",
    "Singapore",
    "Australia",
    "Japan",
    "Worldwide (Excl. USA/Canada)",
    "Worldwide (Incl. USA/Canada)",
    "Other Destination",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!destinationCountry.trim()) {
      setErrorMessage("Please select or enter your destination country.");
      return;
    }

    if (hasPreExistingDisease) {
      if (!preExistingDiseaseDetails.trim()) {
        setErrorMessage("Please describe any relevant pre-existing medical conditions or treatments.");
        return;
      }
      if (!consentGiven) {
        setErrorMessage("Consent is required to share sensitive medical disclosures with our authorised insurance advisors.");
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneCountryCode,
      phoneNumber: phoneNumber.trim(),
      travelDate,
      destinationCountry: destinationCountry.trim(),
      dateOfBirth,
      hasPreExistingDisease,
      preExistingDiseaseDetails: hasPreExistingDisease ? preExistingDiseaseDetails.trim() : "",
      consentGiven: hasPreExistingDisease ? consentGiven : false,
    };

    const res = await safeSubmitTravelInsuranceEnquiry(payload);
    setSubmitting(false);

    if (res.success && res.referenceId) {
      setSuccessReference(res.referenceId);
      // Reset form on success
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setDestinationCountry("");
      setHasPreExistingDisease(false);
      setPreExistingDiseaseDetails("");
      setConsentGiven(false);
    } else {
      setErrorMessage(res.error || "Failed to submit travel insurance enquiry. Please check your inputs.");
    }
  };

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-8 sm:py-12 box-border">
      
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-cream-subtle text-xs font-bold text-secondary uppercase tracking-wider mb-2.5">
          <span className="material-symbols-outlined text-[16px]">shield_with_heart</span>
          <span>Comprehensive Trip Protection</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight">
          Travel Insurance Enquiry
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
          Travel with greater confidence. Share your trip details with our team and we will help you explore suitable travel insurance options.
        </p>

        {/* Advisory Legal Disclaimer */}
        <div className="mt-4 p-3 rounded-2xl bg-surface-cream-subtle border border-surface-sand-tint inline-block text-[11px] text-on-surface-variant max-w-xl">
          <strong className="text-primary">Advisory Notice:</strong> This page is for insurance consultation and quote enquiries. Varni Holidays provides procedural advisory support and does not directly underwrite or issue insurance policies.
        </div>
      </div>

      {/* Main Form Card */}
      <div className="max-w-3xl mx-auto bg-surface-container-lowest p-5 sm:p-8 md:p-10 rounded-[32px] sm:rounded-[40px] shadow-clay-card border border-white/80 box-border">
        
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-surface-sand-tint">
          <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
          </div>
          <div>
            <h2 className="font-headline text-lg sm:text-xl font-bold text-primary">
              Personalized Travel Protection Request
            </h2>
            <p className="text-[11px] sm:text-xs text-on-surface-variant">
              Fill in your departure date, destination, and passenger profile for curated insurer coverage comparisons.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 mb-6 rounded-2xl bg-red-50 text-error text-xs font-medium border border-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SECTION 1: TRIP & DESTINATION DETAILS */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
              1. Trip & Insured Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Destination Country */}
              <div className="bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Destination Country <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="destination-list"
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  placeholder="e.g. United States, UK, Schengen..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none placeholder:text-on-surface-variant/40"
                />
                <datalist id="destination-list">
                  {popularDestinations.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              {/* Travel Date */}
              <div className="bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Travel Departure Date <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none"
                />
              </div>

              {/* Date of Birth (DOB) */}
              <div className="bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint sm:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Insured Date of Birth (DOB) <span className="text-error">*</span></span>
                  <span className="text-[10px] text-on-surface-variant lowercase font-normal">(required for premium tier age calculation)</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: MEDICAL & PRE-EXISTING DISEASE (PED) */}
          <div className="pt-2 space-y-3.5">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
              2. Medical Disclosure (Pre-Existing Disease)
            </h3>

            <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-sand-tint space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-xs font-bold text-primary block">
                    Do you or any covered traveler have a Pre-Existing Disease / Medical Condition (PED)? <span className="text-error">*</span>
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    e.g. Hypertension, Diabetes, Cardiac conditions, Asthma, or ongoing regular medications.
                  </span>
                </div>

                {/* Yes / No Toggle Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      setHasPreExistingDisease(false);
                      setPreExistingDiseaseDetails("");
                      setConsentGiven(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      !hasPreExistingDisease
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-cream-subtle text-on-surface-variant hover:text-primary border border-surface-sand-tint"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasPreExistingDisease(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      hasPreExistingDisease
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-surface-cream-subtle text-on-surface-variant hover:text-primary border border-surface-sand-tint"
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {/* Conditional PED Fields when Yes */}
              {hasPreExistingDisease && (
                <div className="pt-3 border-t border-surface-sand-tint/70 space-y-3 animate-in fade-in duration-200">
                  <div className="bg-surface-cream-subtle p-3 rounded-xl border border-amber-300/40">
                    <label className="block text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                      Pre-Existing Medical Details <span className="text-error">*</span>
                    </label>
                    <p className="text-[10px] text-on-surface-variant mb-2">
                      Please provide only information relevant to your travel insurance enquiry (e.g. condition name, diagnosis year, ongoing daily medication).
                    </p>
                    <textarea
                      required
                      rows={3}
                      value={preExistingDiseaseDetails}
                      onChange={(e) => setPreExistingDiseaseDetails(e.target.value)}
                      placeholder="e.g. Type-2 Diabetes controlled with oral medication since 2018; Mild Hypertension."
                      className="w-full bg-white p-3 rounded-xl text-xs text-primary placeholder:text-on-surface-variant/40 border border-surface-sand-tint focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  {/* Mandatory Explicit Consent Checkbox (Unchecked by default) */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 rounded text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] text-primary leading-snug">
                      I consent to sharing the medical information entered above with authorised Varni Holidays personnel for the purpose of handling my travel insurance enquiry.
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: CONTACT INFORMATION */}
          <div className="pt-2 space-y-3.5">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
              3. Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div className="bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint sm:col-span-2">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Full Name (Primary Insured) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Hareshbhai Shah"
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Email Address */}
              <div className="bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. haresh@example.com"
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Mobile Phone */}
              <div className="w-full min-w-0">
                <CountryPhoneInput
                  countryCode={phoneCountryCode}
                  phoneNumber={phoneNumber}
                  onCountryCodeChange={setPhoneCountryCode}
                  onPhoneNumberChange={setPhoneNumber}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-13 py-3.5 rounded-full bg-primary text-white font-bold text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50 shadow-md active:scale-98 transition-transform"
            >
              {submitting ? (
                <span>Submitting Insurance Request...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                    shield
                  </span>
                  <span>Submit Travel Insurance Enquiry</span>
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-on-surface-variant italic">
            * Medical disclosures and personal contacts are strictly protected and reviewed solely by licensed insurance specialists.
          </p>
        </form>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-clay-card border border-white/80">
          <span className="material-symbols-outlined text-secondary text-[24px] mb-2 block">emergency</span>
          <h4 className="font-headline text-base font-bold text-primary mb-1">Medical Evacuation & Hospitalization</h4>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Coverage up to $500,000 for emergency medical expenses, cashless hospital network admissions, and repatriation.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-clay-card border border-white/80">
          <span className="material-symbols-outlined text-gold-deep text-[24px] mb-2 block">luggage</span>
          <h4 className="font-headline text-base font-bold text-primary mb-1">Baggage & Trip Cancellation</h4>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Reimbursement for delayed or lost check-in luggage, missed connecting flights, and non-refundable trip cancellations.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-clay-card border border-white/80">
          <span className="material-symbols-outlined text-secondary text-[24px] mb-2 block">verified_user</span>
          <h4 className="font-headline text-base font-bold text-primary mb-1">Schengen & Embassy Approved</h4>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Policies strictly compliant with European Schengen €30,000 minimum medical coverage rules and global visa criteria.
          </p>
        </div>
      </div>

      {/* Success Modal */}
      <EnquirySuccessModal
        isOpen={!!successReference}
        onClose={() => setSuccessReference("")}
        referenceId={successReference}
        serviceType="Travel Insurance"
        title="Insurance Consultation Booked"
        message="Your travel insurance consultation request has been received. Our certified insurance desk in Anand will review suitable plans matching your trip duration and age group, and contact you with quotes."
      />
    </div>
  );
}

