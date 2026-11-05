'use client';

import React, { useState } from 'react';
import CountryPhoneInput from './CountryPhoneInput';
import EnquirySuccessModal from './EnquirySuccessModal';
import { safeSubmitPackageEnquiry } from '@/lib/enquirySubmitter';
import { X, Calendar, Users, Hotel, Sparkles, Loader2 } from 'lucide-react';

export interface PackageModalInfo {
  slug: string;
  title: string;
  duration: string;
  price: string;
  route?: string;
  image?: string;
}

interface PackageEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageInfo: PackageModalInfo | null;
}

export default function PackageEnquiryModal({
  isOpen,
  onClose,
  packageInfo,
}: PackageEnquiryModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hotelTier, setHotelTier] = useState<'STANDARD' | 'DELUXE' | 'SUPER_DELUXE' | 'PREMIUM' | 'LUXURY'>('DELUXE');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenWithBedCount, setChildrenWithBedCount] = useState(0);
  const [childrenNoBedCount, setChildrenNoBedCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);
  const [preferredTravelDate, setPreferredTravelDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReference, setSuccessReference] = useState('');

  if (!isOpen || !packageInfo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    const payload = {
      fullName,
      email,
      phoneCountryCode,
      phoneNumber,
      packageSlug: packageInfo.slug || 'kerala-6n7d-winter',
      hotelTier,
      adultsCount,
      childrenWithBedCount,
      childrenNoBedCount,
      infantsCount,
      roomsCount: Math.ceil(adultsCount / 2) || 1,
      preferredTravelDate: preferredTravelDate || undefined,
      includeHouseboatUpgrade: false,
      includeMealPlan: false,
      includeAthirapillyTrip: false,
      includeKanyakumariTrip: false,
      specialRequests: specialRequests ? `[Package: ${packageInfo.title}] ${specialRequests}` : `[Package: ${packageInfo.title}]`,
    };

    const res = await safeSubmitPackageEnquiry(payload);
    setSubmitting(false);

    if (res.success && res.referenceId) {
      setSuccessReference(res.referenceId);
    } else {
      setErrorMessage(res.error || 'Failed to submit enquiry. Please verify your details.');
    }
  };

  if (successReference) {
    return (
      <EnquirySuccessModal
        isOpen={true}
        referenceId={successReference}
        serviceType="Package"
        onClose={() => {
          setSuccessReference('');
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-[32px] p-6 sm:p-8 shadow-clay-floating border border-white/80 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-surface-cream-subtle flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          title="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header with Package Summary */}
        <div className="mb-5 pb-4 border-b border-surface-sand-tint">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-amber-700" />
            <span>Tailor-Made Proposal</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-primary">
            Request Proposal: {packageInfo.title}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {packageInfo.duration} • Starting {packageInfo.price}
          </p>
          {packageInfo.route && (
            <p className="text-[11px] text-secondary font-medium mt-0.5 truncate">
              {packageInfo.route}
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-error text-xs font-medium border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Full Name */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
              Full Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Chiragbhai Patel"
              className="w-full h-11 bg-surface-cream-subtle px-4 rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset"
            />
          </div>

          {/* Email Address (Mandatory) */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
              Email Address <span className="text-error">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. chirag@example.com"
              className="w-full h-11 bg-surface-cream-subtle px-4 rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset"
            />
            <span className="text-[10px] text-on-surface-variant mt-0.5 block">
              We send your official proposal, itinerary PDF, and price breakdown here.
            </span>
          </div>

          {/* Country Phone Input */}
          <CountryPhoneInput
            countryCode={phoneCountryCode}
            phoneNumber={phoneNumber}
            onCountryCodeChange={setPhoneCountryCode}
            onPhoneNumberChange={setPhoneNumber}
            required
          />

          {/* Travel Date & Hotel Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                Preferred Travel Date
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={preferredTravelDate}
                  onChange={(e) => setPreferredTravelDate(e.target.value)}
                  className="w-full h-11 bg-surface-cream-subtle px-3 rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                Hotel Tier
              </label>
              <select
                value={hotelTier}
                onChange={(e) => setHotelTier(e.target.value as any)}
                className="w-full h-11 bg-surface-cream-subtle px-3 rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset cursor-pointer"
              >
                <option value="DELUXE">Deluxe (4-Star)</option>
                <option value="SUPER_DELUXE">Super Deluxe (4-Star Premium)</option>
                <option value="PREMIUM">Premium Resort</option>
                <option value="LUXURY">Luxury (5-Star Heritage)</option>
                <option value="STANDARD">Standard (3-Star Comfort)</option>
              </select>
            </div>
          </div>

          {/* Passenger Count Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-cream-subtle p-3 rounded-2xl shadow-clay-inset text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Adults (12+)</span>
              <select
                value={adultsCount}
                onChange={(e) => setAdultsCount(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg bg-white border border-[#E8E3D8] font-semibold text-primary"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((n) => (
                  <option key={n} value={n}>{n} Pax</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Child (With Bed)</span>
              <select
                value={childrenWithBedCount}
                onChange={(e) => setChildrenWithBedCount(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg bg-white border border-[#E8E3D8] font-semibold text-primary"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Child (No Bed)</span>
              <select
                value={childrenNoBedCount}
                onChange={(e) => setChildrenNoBedCount(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg bg-white border border-[#E8E3D8] font-semibold text-primary"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Infant (&lt;2y)</span>
              <select
                value={infantsCount}
                onChange={(e) => setInfantsCount(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg bg-white border border-[#E8E3D8] font-semibold text-primary"
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
              Custom Requirements & Preferences
            </label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Jain / Swaminarayan meals, ground floor rooms, private car chauffeur, honeymoon cake"
              className="w-full bg-surface-cream-subtle p-3 rounded-xl text-xs text-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-clay-inset resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-primary text-white font-bold text-sm clay-pill-button flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50 transition-all shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating Proposal Request...</span>
              </>
            ) : (
              <span>Submit Custom Package Request</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
