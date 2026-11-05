"use client";

import React from "react";
import { COMPANY_CONTACT } from "@/lib/config/contact";

interface EnquirySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  customerName?: string;
  title?: string;
  message?: string;
  serviceType: "Flight" | "Package" | "Visa" | "Contact" | "Hotel" | "Custom Holiday" | "Travel Insurance";
}

export default function EnquirySuccessModal({
  isOpen,
  onClose,
  referenceId,
  customerName,
  title = "Enquiry Submitted Successfully",
  message,
  serviceType,
}: EnquirySuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-[32px] p-6 sm:p-8 shadow-clay-floating border border-white/80">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-surface-cream-subtle flex items-center justify-center text-gold-deep mx-auto mb-4 shadow-clay-card">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>

        {/* Title & Ref */}
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-1">
            Varni Holidays Reference
          </span>
          <h3 className="font-headline text-2xl font-bold text-primary mb-2">{title}</h3>
          
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-surface-cream-subtle shadow-clay-inset font-mono text-sm font-bold text-primary">
            <span>{referenceId}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referenceId);
                alert("Reference copied to clipboard!");
              }}
              title="Copy Reference"
              className="text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
            </button>
          </div>
        </div>

        {/* Informative Explanation */}
        <div className="bg-surface-cream-subtle p-4 rounded-2xl mb-6 text-xs text-on-surface-variant space-y-2 leading-relaxed">
          <p>
            {message ||
              `Thank you for reaching out to Varni Holidays. Your ${serviceType} consultation request has been assigned to our Anand headquarters travel team.`}
          </p>
          <div className="pt-2 border-t border-surface-sand-tint flex items-center gap-2 text-primary font-semibold">
            <span className="material-symbols-outlined text-secondary text-[16px]">support_agent</span>
            <span>A dedicated specialist will connect with you on phone/WhatsApp within 30 minutes.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full bg-primary text-white text-sm font-bold clay-pill-button hover:bg-primary-container"
          >
            Close & Continue Browsing
          </button>
          <a
            href={COMPANY_CONTACT.whatsapp.buildUrl(`Hello Varni Holidays, my enquiry reference is ${referenceId}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 rounded-full bg-surface-container text-primary text-sm font-bold clay-pill-secondary flex items-center justify-center gap-2 text-center"
          >
            <span className="material-symbols-outlined text-gold-deep text-[18px]">chat</span>
            <span>Connect on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

