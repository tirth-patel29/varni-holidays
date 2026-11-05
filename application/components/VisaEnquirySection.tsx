"use client";

import React, { useState, useEffect } from "react";
import CountryPhoneInput from "./CountryPhoneInput";
import EnquirySuccessModal from "./EnquirySuccessModal";
import { safeSubmitVisaEnquiry } from "@/lib/enquirySubmitter";
import {
  VISA_COUNTRIES,
  VISA_CATEGORIES,
  VISA_DISCLAIMER,
  VisaCategoryCode,
} from "@/lib/config/visa-options";

export default function VisaEnquirySection() {
  const [destinationCountry, setDestinationCountry] = useState("Canada");
  const [otherCountryName, setOtherCountryName] = useState("");
  const [visaCategory, setVisaCategory] = useState<VisaCategoryCode>("TOURIST");
  const [selectedSubtype, setSelectedSubtype] = useState("Super Visa");
  const [customSubtypeText, setCustomSubtypeText] = useState("");
  const [travelPurpose, setTravelPurpose] = useState("");
  const [applicantNationality, setApplicantNationality] = useState("Indian");
  const [residenceCountry, setResidenceCountry] = useState("India");
  const [plannedTravelDate, setPlannedTravelDate] = useState("2026-12-15");
  const [stayDurationDays, setStayDurationDays] = useState(30);
  const [applicantCount, setApplicantCount] = useState(2);
  const [specialCircumstances, setSpecialCircumstances] = useState("");

  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successReference, setSuccessReference] = useState("");

  // Find country config
  const currentCountryConfig = VISA_COUNTRIES.find((c) => c.country === destinationCountry);

  // When destination country changes: reset or update subtype and category
  const handleCountryChange = (countryName: string) => {
    setDestinationCountry(countryName);
    if (countryName === "Other") {
      setSelectedSubtype("");
      setCustomSubtypeText("");
      return;
    }

    const conf = VISA_COUNTRIES.find((c) => c.country === countryName);
    if (conf && conf.subtypes.length > 0) {
      const defaultSub = conf.subtypes[0];
      setSelectedSubtype(defaultSub.label);
      setCustomSubtypeText("");
      setVisaCategory(defaultSub.defaultCategory);
    } else {
      setSelectedSubtype("");
      setCustomSubtypeText("");
      setVisaCategory("TOURIST");
    }
  };

  // When subtype changes: automatically update default category if appropriate
  const handleSubtypeChange = (subtypeLabel: string) => {
    setSelectedSubtype(subtypeLabel);
    if (!currentCountryConfig) return;

    const matched = currentCountryConfig.subtypes.find((s) => s.label === subtypeLabel);
    if (matched) {
      setVisaCategory(matched.defaultCategory);
    }
  };

  const effectiveCountryName =
    destinationCountry === "Other" ? otherCountryName.trim() : destinationCountry;

  const effectiveSubtype =
    destinationCountry === "Other" || !currentCountryConfig?.hasPredefinedSubtypes
      ? (customSubtypeText.trim() || selectedSubtype)
      : selectedSubtype;

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (destinationCountry === "Other" && !otherCountryName.trim()) {
      alert("Please enter the name of your destination country.");
      return;
    }

    setContactModalOpen(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneCountryCode,
      phoneNumber: phoneNumber.trim(),
      destinationCountry,
      otherCountryName: destinationCountry === "Other" ? otherCountryName.trim() : undefined,
      visaCategory,
      visaType: effectiveSubtype || undefined,
      travelPurpose: travelPurpose.trim() || undefined,
      applicantNationality,
      residenceCountry,
      plannedTravelDate,
      stayDurationDays,
      applicantCount,
      specialCircumstances: specialCircumstances.trim() || undefined,
    };

    const res = await safeSubmitVisaEnquiry(payload);
    setSubmitting(false);

    if (res.success && res.referenceId) {
      setContactModalOpen(false);
      setSuccessReference(res.referenceId);
    } else {
      setErrorMessage(res.error || "Failed to submit visa assistance enquiry.");
    }
  };

  return (
    <section id="visa" className="w-full max-w-[1380px] mx-auto px-3 sm:px-6 md:px-8 py-8 sm:py-12 scroll-mt-24 sm:scroll-mt-28 box-border">
      <div className="w-full bg-surface-container-lowest p-4 sm:p-6 md:p-8 rounded-3xl sm:rounded-[36px] shadow-clay-card border border-white/80 box-border">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-6 border-b border-surface-sand-tint">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-cream-subtle text-xs font-bold text-secondary uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
              <span>Expert Consular Advisory</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
              Global Visa Assistance & Guidance Desk
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
              End-to-end appointment scheduling, document verification, biometric filing support, and family dossier preparation from Anand.
            </p>
          </div>

          <div className="p-3 bg-surface-cream-subtle rounded-2xl shadow-clay-inset text-xs text-on-surface-variant max-w-sm">
            <span className="font-bold text-primary block flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">verified</span>
              <span>Authorised Advisory Support</span>
            </span>
            <span className="text-[11px] mt-0.5 block leading-tight">
              Procedural guidance and official document filing for worldwide consulates and embassies.
            </span>
          </div>
        </div>

        {/* Visa Enquiry Form */}
        <form onSubmit={handleInitialSubmit} className="space-y-4 sm:space-y-5">
          {/* ROW 1: Country & Category & Subtype */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
            
            {/* 1. Destination Country */}
            <div className={`${destinationCountry === "Other" ? "md:col-span-3" : "md:col-span-4"} bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint/60`}>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Destination Country</span>
                <span className="text-secondary font-mono text-[10px]">Step 1</span>
              </label>
              <select
                value={destinationCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none cursor-pointer"
              >
                {VISA_COUNTRIES.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional "Other" Country Name Text Field */}
            {destinationCountry === "Other" && (
              <div className="md:col-span-3 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-secondary/30 animate-in fade-in duration-150">
                <label className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  Specify Country Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={otherCountryName}
                  onChange={(e) => setOtherCountryName(e.target.value)}
                  placeholder="e.g. New Zealand, Germany, Kenya..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none placeholder:text-on-surface-variant/40"
                  autoFocus
                />
              </div>
            )}

            {/* 2. Country-Specific Visa Subtype */}
            <div className={`${destinationCountry === "Other" ? "md:col-span-3" : "md:col-span-4"} bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint/60`}>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Visa Subtype / Product</span>
                <span className="text-gold-deep font-mono text-[10px]">Specific</span>
              </label>
              {currentCountryConfig && currentCountryConfig.subtypes.length > 0 ? (
                <select
                  value={selectedSubtype}
                  onChange={(e) => handleSubtypeChange(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none cursor-pointer"
                >
                  {currentCountryConfig.subtypes.map((sub) => (
                    <option key={sub.code} value={sub.label}>
                      {sub.label}
                    </option>
                  ))}
                  <option value="CUSTOM">Other / Custom Subtype</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={customSubtypeText}
                  onChange={(e) => setCustomSubtypeText(e.target.value)}
                  placeholder="e.g. Tourist E-Visa, Family Visit"
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none placeholder:text-on-surface-variant/40"
                />
              )}
            </div>

            {/* 3. Visa Category (STRICTLY 3 OPTIONS: TRANSIT, BUSINESS, TOURIST) */}
            <div className={`${destinationCountry === "Other" ? "md:col-span-3" : "md:col-span-4"} bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint/60`}>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Visa Category</span>
                <span className="text-secondary font-mono text-[10px]">Category</span>
              </label>
              <select
                value={visaCategory}
                onChange={(e) => setVisaCategory(e.target.value as VisaCategoryCode)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none cursor-pointer"
              >
                {VISA_CATEGORIES.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.label} ({cat.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtype Description Helper Box if Predefined Subtype active */}
          {currentCountryConfig && currentCountryConfig.subtypes.length > 0 && selectedSubtype !== "CUSTOM" && (
            <div className="p-3 bg-surface-cream-subtle rounded-xl text-[11px] text-primary border border-secondary/20 flex items-start gap-2 shadow-sm">
              <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">info</span>
              <div>
                <strong className="text-secondary mr-1">{selectedSubtype}:</strong>
                <span className="text-on-surface-variant">
                  {currentCountryConfig.subtypes.find((s) => s.label === selectedSubtype)?.description ||
                    "Standard consulate filing dossier."}
                </span>
              </div>
            </div>
          )}

          {/* ROW 2: Travel Date, Duration, Applicants Count */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Travel Date */}
            <div className="md:col-span-4 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint/60">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Intended Travel Date
              </label>
              <input
                type="date"
                required
                value={plannedTravelDate}
                onChange={(e) => setPlannedTravelDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none"
              />
            </div>

            {/* Stay Duration */}
            <div className="md:col-span-4 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint/60">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Stay Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={stayDurationDays}
                onChange={(e) => setStayDurationDays(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-primary focus:outline-none"
              />
            </div>

            {/* Applicants Count */}
            <div className="md:col-span-4 bg-surface-cream-subtle px-4 py-2 rounded-2xl shadow-clay-inset border border-surface-sand-tint/60 flex items-center justify-between">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Number of Applicants
                </label>
                <span className="text-xs sm:text-sm font-bold text-primary">{applicantCount} {applicantCount === 1 ? "Person" : "Persons"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setApplicantCount(Math.max(1, applicantCount - 1))}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold hover:bg-white transition-colors"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setApplicantCount(Math.min(20, applicantCount + 1))}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold hover:bg-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* ROW 3: Travel Purpose & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            <div className="md:col-span-8 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset border border-surface-sand-tint/60">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Travel Purpose / Special Notes (Optional)
              </label>
              <input
                type="text"
                value={travelPurpose}
                onChange={(e) => setTravelPurpose(e.target.value)}
                placeholder="e.g. Family holiday with parents, attending medical conference, visiting relatives..."
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-primary focus:outline-none placeholder:text-on-surface-variant/40"
              />
            </div>

            {/* Submit Action Button */}
            <div className="md:col-span-4">
              <button
                type="submit"
                className="w-full h-12 sm:h-13 rounded-full bg-primary text-white font-bold text-xs sm:text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container shadow-md active:scale-98 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                  arrow_forward
                </span>
                <span>Get Visa Checklist & Guidance</span>
              </button>
            </div>
          </div>

          {/* MANDATORY VISA DISCLAIMER */}
          <div className="p-3 rounded-2xl bg-surface-cream-subtle/80 border border-surface-sand-tint/80 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">verified_user</span>
            <p className="text-[11px] text-on-surface-variant leading-relaxed italic">
              <strong>Official Notice:</strong> {VISA_DISCLAIMER}
            </p>
          </div>
        </form>

        {/* Feature Badges */}
        <div className="mt-6 pt-6 border-t border-surface-sand-tint grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
            <span>Fast-track biometric and consular interview slot booking.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-deep text-[20px]">verified</span>
            <span>Complete bank statement, ITR, and invitation letter audits.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">groups</span>
            <span>Dedicated NRI family dossiers managed directly from Anand HQ.</span>
          </div>
        </div>
      </div>

      {/* Contact Details Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-3xl sm:rounded-[32px] p-5 sm:p-7 shadow-clay-floating border border-white/80 box-border mx-auto"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-surface-cream-subtle flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="mb-4 pr-6">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">
                <span className="material-symbols-outlined text-[14px]">contact_mail</span>
                <span>Final Step • Contact Information</span>
              </span>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-primary">
                Where should we send your visa checklist?
              </h3>
            </div>

            {/* Read-Only Visa Summary */}
            <div className="mb-4 p-3 bg-surface-container-low rounded-2xl border border-surface-sand-tint space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <span className="material-symbols-outlined text-[16px] text-secondary">flag</span>
                <span>{effectiveCountryName}</span>
                <span className="text-secondary font-mono">•</span>
                <span>{visaCategory} Visa</span>
              </div>
              {effectiveSubtype && (
                <div className="text-[11px] text-[#E9B95E] font-medium">
                  Subtype: {effectiveSubtype}
                </div>
              )}
              <div className="text-[10px] text-on-surface-variant">
                {applicantCount} {applicantCount === 1 ? "Applicant" : "Applicants"} • Planned: {plannedTravelDate} ({stayDurationDays} Days)
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-error text-xs font-medium border border-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleFinalSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ankitbhai Amin"
                  className="w-full h-11 sm:h-12 bg-surface-cream-subtle px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset border border-surface-sand-tint"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ankit@example.com"
                  className="w-full h-11 sm:h-12 bg-surface-cream-subtle px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset border border-surface-sand-tint"
                />
              </div>

              <div className="w-full min-w-0">
                <CountryPhoneInput
                  countryCode={phoneCountryCode}
                  phoneNumber={phoneNumber}
                  onCountryCodeChange={setPhoneCountryCode}
                  onPhoneNumberChange={setPhoneNumber}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 sm:h-13 py-3 rounded-full bg-primary text-white font-bold text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50 mt-1 shadow-md"
              >
                {submitting ? (
                  <span>Saving Visa Request...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                      assignment_turned_in
                    </span>
                    <span>Submit Visa Request</span>
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
        serviceType="Visa"
        title="Visa Assistance Request Received"
        message={`Your visa assistance enquiry for ${effectiveCountryName} (${visaCategory}${effectiveSubtype ? ` - ${effectiveSubtype}` : ''}) has been registered. Our Anand visa officer will contact you with the complete checklist and appointment timeline.`}
      />
    </section>
  );
}
