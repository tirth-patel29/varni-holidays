"use client";

import React, { useState } from "react";
import CountryPhoneInput from "./CountryPhoneInput";
import EnquirySuccessModal from "./EnquirySuccessModal";
import { submitVisaEnquiry } from "@/app/actions/enquiries";

export default function VisaEnquirySection() {
  const [destinationCountry, setDestinationCountry] = useState("Schengen (Europe)");
  const [visaCategory, setVisaCategory] = useState<"TOURIST" | "BUSINESS" | "STUDENT" | "WORK" | "TRANSIT" | "OTHER">("TOURIST");
  const [travelPurpose, setTravelPurpose] = useState("");
  const [applicantNationality, setApplicantNationality] = useState("Indian");
  const [residenceCountry, setResidenceCountry] = useState("India");
  const [plannedTravelDate, setPlannedTravelDate] = useState("2026-12-10");
  const [stayDurationDays, setStayDurationDays] = useState(15);
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

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      destinationCountry,
      visaCategory,
      travelPurpose,
      applicantNationality,
      residenceCountry,
      plannedTravelDate,
      stayDurationDays,
      applicantCount,
      specialCircumstances,
    };

    const res = await submitVisaEnquiry(payload);
    setSubmitting(false);

    if (res.success && res.referenceId) {
      setContactModalOpen(false);
      setSuccessReference(res.referenceId);
    } else {
      setErrorMessage(res.error || "Failed to submit visa assistance enquiry.");
    }
  };

  const popularCountries = [
    "Schengen (Europe)",
    "United Kingdom (UK)",
    "United States (USA)",
    "Canada",
    "United Arab Emirates (Dubai)",
    "Singapore",
    "Australia",
    "Japan",
    "Turkey",
    "Thailand",
  ];

  return (
    <section id="visa" className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-12 scroll-mt-24">
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[36px] shadow-clay-card border border-white/80">
        
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
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              End-to-end appointment scheduling, document verification, biometric filing support, and family dossier preparation.
            </p>
          </div>

          <div className="p-3 bg-surface-cream-subtle rounded-2xl shadow-clay-inset text-xs text-on-surface-variant max-w-xs">
            <span className="font-bold text-primary block">Official Disclaimer:</span>
            <span>Varni Holidays provides procedural guidance and documentation assistance; we explicitly do not issue or approve visas.</span>
          </div>
        </div>

        {/* Visa Enquiry Form */}
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Country Selector */}
            <div className="md:col-span-4 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                Destination Country
              </label>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-primary focus:outline-none cursor-pointer"
              >
                {popularCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Visa Category */}
            <div className="md:col-span-3 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                Visa Category
              </label>
              <select
                value={visaCategory}
                onChange={(e) => setVisaCategory(e.target.value as any)}
                className="w-full bg-transparent text-sm font-semibold text-primary focus:outline-none cursor-pointer"
              >
                <option value="TOURIST">Tourist / Leisure</option>
                <option value="BUSINESS">Business / Conference</option>
                <option value="STUDENT">Student Visa</option>
                <option value="WORK">Work / Employment</option>
                <option value="TRANSIT">Transit Visa</option>
                <option value="OTHER">Family / Visitor</option>
              </select>
            </div>

            {/* Travel Date */}
            <div className="md:col-span-3 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                Intended Travel Date
              </label>
              <input
                type="date"
                required
                value={plannedTravelDate}
                onChange={(e) => setPlannedTravelDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-primary focus:outline-none"
              />
            </div>

            {/* Applicants Count */}
            <div className="md:col-span-2 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset flex items-center justify-between">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Applicants
                </label>
                <span className="text-xs font-bold text-primary">{applicantCount} Persons</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setApplicantCount(Math.max(1, applicantCount - 1))}
                  className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setApplicantCount(applicantCount + 1)}
                  className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Details: Duration & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-3 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                Stay Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={stayDurationDays}
                onChange={(e) => setStayDurationDays(parseInt(e.target.value, 10))}
                className="w-full bg-transparent text-sm font-semibold text-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-6 bg-surface-cream-subtle px-4 py-2.5 rounded-2xl shadow-clay-inset">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                Purpose / Travel Notes (Optional)
              </label>
              <input
                type="text"
                value={travelPurpose}
                onChange={(e) => setTravelPurpose(e.target.value)}
                placeholder="e.g. Europe vacation with family, attending university seminar, etc."
                className="w-full bg-transparent text-xs font-medium text-primary focus:outline-none"
              />
            </div>

            {/* Next Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full h-12 rounded-full bg-primary text-white font-bold text-xs sm:text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                  arrow_forward
                </span>
                <span>Get Visa Checklist</span>
              </button>
            </div>
          </div>
        </form>

        {/* Feature Badges */}
        <div className="mt-6 pt-6 border-t border-surface-sand-tint grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
            <span>Fast-track appointment booking assistance for VFS & Consulates.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-deep text-[20px]">verified</span>
            <span>Comprehensive financial document & cover letter verification.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">groups</span>
            <span>NRI family group dossiers handled directly from our Anand office.</span>
          </div>
        </div>
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
              <h3 className="font-headline text-xl font-bold text-primary">Your Contact Information</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                For {destinationCountry} ({visaCategory} Visa) • {applicantCount} Applicants
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
                  placeholder="e.g. Ankitbhai Amin"
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
                  placeholder="e.g. ankit@example.com"
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-primary text-white font-bold text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50"
              >
                {submitting ? (
                  <span>Saving Request...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                      assignment_turned_in
                    </span>
                    <span>Submit Visa Assistance Request</span>
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
        message={`Your visa assistance enquiry for ${destinationCountry} has been recorded in our system. Our visa documentation officer in Anand will connect with you with the exact document requirements and fee schedule.`}
      />
    </section>
  );
}

