import React from "react";
import VisaEnquirySection from "@/components/VisaEnquirySection";

export default function VisaPage() {
  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 md:px-8 py-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-cream-subtle text-xs font-bold text-secondary uppercase tracking-wider mb-2">
          <span className="material-symbols-outlined text-[16px]">assignment</span>
          <span>Consular Documentation Guidance</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-5xl font-bold text-primary">
          Global Visa Assistance Services
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
          Navigating international visa requirements can be intricate. Our dedicated visa officers in Anand guide you through documentation checklists, VFS appointments, cover letter drafting, and biometric submissions.
        </p>
      </div>

      {/* Main Visa Form */}
      <VisaEnquirySection />

      {/* 4-Step Process Grid */}
      <div className="mt-12 mb-16">
        <h3 className="font-headline text-2xl font-bold text-primary text-center mb-8">
          Our Four-Step Documentation Protocol
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Requirement Assessment",
              desc: "We analyze your travel itinerary, passport validity, and financial profile to determine the exact consular criteria.",
            },
            {
              step: "02",
              title: "Dossier Verification",
              desc: "Our Anand team meticulously checks bank statements, tax returns (ITR), sponsor letters, and invitation documents.",
            },
            {
              step: "03",
              title: "Appointment Booking",
              desc: "We schedule your biometric and interview slots at VFS, TLS, or consular centers across Ahmedabad and Mumbai.",
            },
            {
              step: "04",
              title: "Submission & Tracking",
              desc: "We monitor application progression and notify you promptly when your passport and visa decision are ready.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-surface-container-lowest p-6 rounded-3xl shadow-clay-card border border-white/80"
            >
              <span className="font-headline text-3xl font-bold text-gold-deep block mb-2">
                {s.step}
              </span>
              <h4 className="font-headline text-lg font-bold text-primary mb-2">{s.title}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

