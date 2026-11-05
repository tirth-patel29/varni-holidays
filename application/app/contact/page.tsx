'use client';

import React, { useState } from 'react';
import CountryPhoneInput from '@/components/CountryPhoneInput';
import EnquirySuccessModal from '@/components/EnquirySuccessModal';
import { COMPANY_CONTACT } from '@/lib/config/contact';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    serviceInterest: 'Domestic / International Holiday Package',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    referenceId: string;
    customerName: string;
    serviceType: "Contact";
    details: Record<string, any>;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!formData.fullName.trim() || formData.fullName.length < 3) {
        throw new Error('Please enter your full name (minimum 3 characters).');
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 7) {
        throw new Error('Please enter a valid phone number.');
      }

      // Simulate contact submission / call action
      const response = await fetch('/api/packages/kerala-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelTier: 'STANDARD',
          paxCount: 2,
          travelDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        }),
      });

      // Generate a client contact reference
      const refId = `CON-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      setSuccessData({
        referenceId: refId,
        customerName: formData.fullName,
        serviceType: 'Contact',
        details: {
          'Service Needed': formData.serviceInterest,
          'Contact Phone': `${formData.phoneCountryCode} ${formData.phoneNumber}`,
          'Contact Email': formData.email || 'Not specified',
          'Preferred Office': 'Anand Headquarters, Gujarat',
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand pb-24">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-ocean via-ocean-dark to-slate-900 text-sand-light pt-36 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(233,185,94,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand-light/10 text-gold font-medium text-xs tracking-wider uppercase backdrop-blur-md mb-4 border border-sand-light/10">
            Connect With Our Anand Desk
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-6 font-semibold tracking-tight">
            We Are Here to Help Plan Your <br className="hidden sm:block" />
            <span className="italic font-normal text-gold">Next Joyful Holiday</span>
          </h1>
          <p className="text-sand/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Reach out directly for domestic & international tour packages, flight ticketing enquiries, visa consultation, or visit our office in Anand, Gujarat.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Office Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Cards */}
            <div className="clay-card rounded-3xl p-6 sm:p-8 space-y-6">
              <h2 className="font-serif text-2xl font-bold text-ocean">Headquarters & Desk</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-ocean/10 text-ocean flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-ocean text-xs uppercase tracking-wider mb-1">Office Address</h3>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      <strong>{COMPANY_CONTACT.businessName}</strong><br />
                      {COMPANY_CONTACT.address.building},<br />
                      {COMPANY_CONTACT.address.street},<br />
                      {COMPANY_CONTACT.address.city}, {COMPANY_CONTACT.address.state} {COMPANY_CONTACT.address.postalCode} ({COMPANY_CONTACT.address.landmark})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/20 text-ocean-dark flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">call</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-ocean text-xs uppercase tracking-wider mb-1">Telephone & Direct Desk</h3>
                    <p className="text-slate-600 text-xs">
                      <a href={COMPANY_CONTACT.phone.tel} className="font-bold text-ocean hover:text-gold block">
                        {COMPANY_CONTACT.phone.display}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">chat</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-ocean text-xs uppercase tracking-wider mb-1">Official WhatsApp Support</h3>
                    <p className="text-slate-600 text-xs">
                      <a
                        href={COMPANY_CONTACT.whatsapp.buildUrl("Hello Varni Holidays, I would like to enquire about a trip.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Chat on {COMPANY_CONTACT.whatsapp.display}</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-ocean text-xs uppercase tracking-wider mb-1">Email Desk</h3>
                    <p className="text-slate-600 text-xs">
                      <a href={COMPANY_CONTACT.email.mailto} className="font-semibold text-ocean hover:text-gold block">
                        {COMPANY_CONTACT.email.primary}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-ocean text-xs uppercase tracking-wider mb-1">Working Hours (IST)</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {COMPANY_CONTACT.hours.detailed}<br />
                      {COMPANY_CONTACT.hours.sunday}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map Placeholder / Card */}
            <div className="clay-card rounded-3xl p-6 bg-sand-light border border-gold/20 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-ocean uppercase tracking-wider block mb-1">Visiting Anand</span>
                <h3 className="font-serif text-lg font-bold text-ocean mb-2">Central Charotar Location</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Easily accessible from Anand Railway Station (5 mins), Express Highway junction, and Vadodara/Ahmedabad airports.
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=Anand+Gujarat+India"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ocean text-white text-xs font-bold hover:bg-ocean-dark transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">map</span>
                Open Location in Google Maps
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Consultation Form */}
          <div className="lg:col-span-7">
            <div className="clay-card rounded-3xl p-6 sm:p-10">
              <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-1">Write to Our Advisors</span>
              <h2 className="font-serif text-3xl font-bold text-ocean mb-2">Request Trip Consultation</h2>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                Fill in your travel preferences and our travel specialist in Anand will call or WhatsApp you with tailored recommendations within 2 business hours.
              </p>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-ocean mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g., Rajeshbhai Patel"
                    className="w-full px-4 py-3 rounded-xl border border-sand-dark bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ocean mb-1.5 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rajesh@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-sand-dark bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/20"
                    />
                  </div>

                  <div>
                    <CountryPhoneInput
                      countryCode={formData.phoneCountryCode}
                      phoneNumber={formData.phoneNumber}
                      onCountryCodeChange={(val) => setFormData({ ...formData, phoneCountryCode: val })}
                      onPhoneNumberChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean mb-1.5 uppercase tracking-wider">
                    Service Required
                  </label>
                  <select
                    value={formData.serviceInterest}
                    onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-sand-dark bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/20"
                  >
                    <option value="Domestic / International Holiday Package">Holiday Package (Kerala, Kashmir, Bali, Dubai, Europe...)</option>
                    <option value="Flight Enquiry & Ticketing">Flight Tickets (Domestic or International)</option>
                    <option value="Visa Assistance & Document Consultation">Visa Assistance (Dubai, Schengen, UK, US, Asia...)</option>
                    <option value="Family / Senior Citizen Custom Tour">Family Group / Senior Citizen Special Tour</option>
                    <option value="Corporate Retreat / MICE">Corporate Retreat / MICE Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ocean mb-1.5 uppercase tracking-wider">
                    Travel Details / Specific Preferences
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your tentative dates, number of travellers, hotel preferences, or any specific questions..."
                    className="w-full px-4 py-3 rounded-xl border border-sand-dark bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/20"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="clay-pill-button w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 hover:bg-ocean-dark disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                        <span>Transmitting to Anand Desk...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Travel Enquiry</span>
                        <span className="material-symbols-outlined text-base">send</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    Your contact information is strictly confidential and never shared with third-party advertisers.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {successData && (
        <EnquirySuccessModal
          isOpen={true}
          onClose={() => setSuccessData(null)}
          referenceId={successData.referenceId}
          serviceType={successData.serviceType}
        />
      )}
    </div>
  );
}

