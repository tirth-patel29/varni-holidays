'use client';

import React, { useState } from 'react';
import { useDestinationTheme } from '@/lib/themes/DestinationThemeProvider';
import { TourPackageCatalogueItem } from '@/lib/quotations/catalogue';
import DynamicPricingCalculator from '@/components/DynamicPricingCalculator';
import CountryPhoneInput from '@/components/CountryPhoneInput';
import EnquirySuccessModal from '@/components/EnquirySuccessModal';
import { submitCustomHolidayEnquiryAction } from '@/app/actions/enquiries';

interface DestinationPricingSectionProps {
  packageItem: TourPackageCatalogueItem;
  currentDuration?: '5N6D' | '6N7D';
  onDurationChange?: (dur: '5N6D' | '6N7D') => void;
}

export default function DestinationPricingSection({
  packageItem,
  currentDuration = '6N7D',
  onDurationChange,
}: DestinationPricingSectionProps) {
  const theme = useDestinationTheme();

  // If this is the flagship Kerala package with the specialized calculation matrix, render DynamicPricingCalculator
  const isKerala = theme.id === 'kerala' || packageItem.slug === 'kerala-6n7d-winter';

  // State for destination calculator
  const hotelTiers = packageItem.hotelTiersAvailable.length > 0
    ? packageItem.hotelTiersAvailable
    : ['Deluxe (3-Star)', 'Super Deluxe (4-Star)', 'Luxury Heritage (5-Star)'];

  const vehicleOptions = packageItem.vehicleTypesAvailable.length > 0
    ? packageItem.vehicleTypesAvailable
    : ['AC Sedan (2-3 Pax)', 'AC Innova Crysta (4-6 Pax)', 'AC Tempo Traveller (7-12 Pax)'];

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReference, setSuccessReference] = useState('');

  // Calculate dynamic estimated tariff per adult
  const basePrice = packageItem.defaultPriceInr || 24500;
  // Tier multipliers: Standard (1.0), Deluxe (1.18), Luxury (1.45)
  const tierMultiplier = 1 + selectedTierIndex * 0.18;
  // Group discount factor: larger groups have lower per-person vehicle cost
  const paxDiscountFactor = adultsCount >= 6 ? 0.82 : adultsCount >= 4 ? 0.90 : 1.0;
  const estimatedPerAdult = Math.round((basePrice * tierMultiplier * paxDiscountFactor) / 100) * 100;
  const totalEstimate = estimatedPerAdult * adultsCount + Math.round(estimatedPerAdult * 0.5) * childrenCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const payload = {
        fullName,
        email,
        phoneCountryCode,
        phoneNumber,
        destinations: `${packageItem.title} (${theme.name})`,
        departureDate: departureDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        returnDate: departureDate || new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
        adultsCount,
        childrenCount,
        budgetPerPerson: `₹${estimatedPerAdult.toLocaleString('en-IN')}`,
        hotelCategory: hotelTiers[selectedTierIndex] || 'Deluxe',
        specialRequirements: `Selected Vehicle: ${vehicleOptions[selectedVehicleIndex]}. Est Total: ₹${totalEstimate.toLocaleString('en-IN')}. ${specialNotes ? 'Notes: ' + specialNotes : ''}`,
      };

      const res = await submitCustomHolidayEnquiryAction(payload);
      if (res.success && res.referenceId) {
        setSuccessReference(res.referenceId);
      } else {
        setErrorMessage(res.error || 'Failed to submit proposal request.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission error. Please connect via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="pricing-calculator" className="scroll-mt-24 mb-16">
      <div className="mb-6">
        <span
          className="text-xs font-bold uppercase tracking-widest block mb-1"
          style={{ color: theme.colors.primary }}
        >
          {theme.name} Package Cost Calculator
        </span>
        <h2
          className="font-headline text-2xl sm:text-3xl font-bold"
          style={{ color: theme.colors.textPrimary }}
        >
          Instant Estimate & Direct Consultation Request
        </h2>
        <p
          className="text-xs sm:text-sm mt-1"
          style={{ color: theme.colors.textSecondary }}
        >
          Configure your group size, accommodation tier, and dedicated chauffeur logistics below.
        </p>
      </div>

      {isKerala ? (
        <DynamicPricingCalculator
          initialDuration={currentDuration}
          onDurationChange={onDurationChange}
        />
      ) : (
        <div
          className="w-full p-6 sm:p-8 rounded-[2.5rem] transition-all"
          style={{
            backgroundColor: theme.colors.surfaceCard,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.05)',
            backdropFilter: theme.cards.glassmorphism ? 'blur(12px)' : 'none',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Selectors (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Header Badge */}
              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                  style={{
                    backgroundColor: theme.colors.badgeBg,
                    color: theme.colors.primary,
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">{theme.decorative.icon}</span>
                  <span>{theme.decorative.sealLabel}</span>
                </div>
                <h3
                  className="font-headline text-xl sm:text-2xl font-bold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Configure Your {theme.name} Experience
                </h3>
              </div>

              {/* 1. Hotel Tier */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  1. Select Accommodation Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {hotelTiers.map((tier, idx) => {
                    const isSelected = selectedTierIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTierIndex(idx)}
                        className={`p-3.5 rounded-2xl text-left transition-all border ${
                          isSelected
                            ? 'shadow-sm ring-2'
                            : 'hover:bg-black/5'
                        }`}
                        style={{
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceMuted,
                          color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        }}
                      >
                        <span className="text-xs font-bold block">{tier}</span>
                        <span className={`text-[10px] block mt-1 ${isSelected ? 'text-white/80' : 'opacity-70'}`}>
                          {idx === 0 ? 'Selected 3-Star properties' : idx === 1 ? '4-Star Premium Resorts' : '5-Star Heritage / Stays'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Group Size */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  2. Travellers Configuration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-3.5 rounded-2xl flex items-center justify-between border"
                    style={{
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <div>
                      <span className="text-xs font-bold block" style={{ color: theme.colors.textPrimary }}>
                        Adults (12y+)
                      </span>
                      <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>
                        Full fare travellers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                        className="w-7 h-7 rounded-full bg-white text-slate-800 flex items-center justify-center font-bold shadow-xs hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-xs font-bold" style={{ color: theme.colors.textPrimary }}>
                        {adultsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdultsCount(adultsCount + 1)}
                        className="w-7 h-7 rounded-full bg-white text-slate-800 flex items-center justify-center font-bold shadow-xs hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div
                    className="p-3.5 rounded-2xl flex items-center justify-between border"
                    style={{
                      backgroundColor: theme.colors.surfaceMuted,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <div>
                      <span className="text-xs font-bold block" style={{ color: theme.colors.textPrimary }}>
                        Children (2-11y)
                      </span>
                      <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>
                        With extra bed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-7 h-7 rounded-full bg-white text-slate-800 flex items-center justify-center font-bold shadow-xs hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-xs font-bold" style={{ color: theme.colors.textPrimary }}>
                        {childrenCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setChildrenCount(childrenCount + 1)}
                        className="w-7 h-7 rounded-full bg-white text-slate-800 flex items-center justify-center font-bold shadow-xs hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Dedicated Vehicle */}
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  3. Dedicated Vehicle Allocation
                </label>
                <div className="space-y-2">
                  {vehicleOptions.map((veh, idx) => {
                    const isSelected = selectedVehicleIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVehicleIndex(idx)}
                        className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between border ${
                          isSelected ? 'shadow-sm ring-2' : 'hover:bg-black/5'
                        }`}
                        style={{
                          backgroundColor: isSelected ? theme.colors.surfaceElevated : theme.colors.surfaceMuted,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceCard,
                              color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                            }}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {veh.includes('Sedan') ? 'directions_car' : 'airport_shuttle'}
                            </span>
                          </div>
                          <span className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>
                            {veh}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: theme.colors.secondary }}>
                          Included
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Summary & Booking Box (5 Cols) */}
            <div
              className="lg:col-span-5 sticky top-28 p-6 rounded-[2rem] space-y-5 border transition-all"
              style={{
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
              }}
            >
              {/* Estimated Price */}
              <div className="pb-4 border-b" style={{ borderColor: theme.colors.borderSubtle }}>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: theme.colors.textMuted }}
                >
                  Calculated Tariff Snapshot ({packageItem.durationNights}N / {packageItem.durationDays}D)
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <span
                      className="font-headline text-3xl font-bold"
                      style={{ color: theme.colors.primary }}
                    >
                      ₹{totalEstimate.toLocaleString('en-IN')}
                    </span>
                    <span
                      className="text-xs block mt-0.5"
                      style={{ color: theme.colors.textMuted }}
                    >
                      (₹{estimatedPerAdult.toLocaleString('en-IN')} per adult • CPAI / MAP Included)
                    </span>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs text-white"
                    style={{ backgroundColor: theme.colors.secondary }}
                  >
                    All Taxes Included
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider block"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Lock Rate & Request Formal Proposal
                </span>

                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200">
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
                    className="w-full h-11 bg-white px-4 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 shadow-xs"
                    style={{ borderColor: theme.colors.border }}
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address (e.g. nilesh@example.com)"
                    className="w-full h-11 bg-white px-4 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 shadow-xs"
                    style={{ borderColor: theme.colors.border }}
                  />
                </div>

                <div>
                  <CountryPhoneInput
                    countryCode={phoneCountryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={setPhoneCountryCode}
                    onPhoneNumberChange={setPhoneNumber}
                    required
                  />
                </div>

                <div>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full h-10 bg-white px-3 rounded-xl text-xs border focus:outline-none shadow-xs"
                    style={{ borderColor: theme.colors.border }}
                  />
                </div>

                <div>
                  <textarea
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    rows={2}
                    placeholder="Special requests (e.g. Jain food, senior citizen assistance, extra room)..."
                    className="w-full bg-white p-3 rounded-xl text-xs border focus:outline-none shadow-xs"
                    style={{ borderColor: theme.colors.border }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {submitting ? (
                    <span>Locking Rate Proposal...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      <span>Lock Rate & Request Proposal</span>
                    </>
                  )}
                </button>
              </form>

              {/* Trust Guarantees */}
              <div
                className="pt-2 border-t space-y-1.5 text-[11px]"
                style={{
                  borderColor: theme.colors.borderSubtle,
                  color: theme.colors.textMuted,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: theme.colors.primary }}>
                    verified
                  </span>
                  <span>100% Published Verified Rate Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: theme.colors.primary }}>
                    restaurant
                  </span>
                  <span>Jain & Swaminarayan Dining Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: theme.colors.primary }}>
                    support_agent
                  </span>
                  <span>Anand Travel Desk WhatsApp: +91 63570 50505</span>
                </div>
              </div>
            </div>
          </div>

          <EnquirySuccessModal
            isOpen={!!successReference}
            onClose={() => setSuccessReference('')}
            referenceId={successReference}
            customerName={fullName}
            serviceType="Package"
            title={`${theme.name} Holiday Enquiry Confirmed`}
            message={`Your enquiry for ${packageItem.title} (${hotelTiers[selectedTierIndex]}) has been received. Our Anand destination specialist will connect with you via WhatsApp/Phone within 30 minutes.`}
          />
        </div>
      )}
    </section>
  );
}

