import React from 'react';
import Link from 'next/link';
import { COMPANY_CONTACT } from '@/lib/config/contact';

export const metadata = {
  title: 'Privacy Policy | Varni Holidays',
  description: 'Privacy Policy and Customer Data Protection Guidelines of Varni Holidays, Anand, Gujarat, India.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-sand pb-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ocean via-ocean-dark to-slate-900 text-sand-light pt-36 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-2">Legal & Trust</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold mb-4">Privacy Policy</h1>
          <p className="text-sand/80 text-sm max-w-xl mx-auto">
            Effective Date: November 2026 • VARNI HOLIDAYS, Anand, Gujarat, India.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="clay-card rounded-3xl p-8 sm:p-12 space-y-8 text-slate-700 text-sm leading-relaxed">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">1. Our Commitment to Your Privacy</h2>
            <p>
              At VARNI HOLIDAYS ("we", "our", or "us"), headquartered in Anand, Gujarat, we respect your privacy and are committed to safeguarding the personal data you share with us. This policy outlines how we collect, store, use, and protect your information when you interact with our website, enquire about flights, holiday packages, or engage our visa consultation services.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Contact Details:</strong> Full name, telephone/mobile number, WhatsApp contact, email address, and home/business address.
              </li>
              <li>
                <strong>Travel Preferences:</strong> Travel dates, passenger count, preferred destinations, hotel tier selections, vehicle requirements, meal preferences, and flight class preferences.
              </li>
              <li>
                <strong>Identification & Travel Documents (When Initiating Bookings or Visa Assistance):</strong> Passport copies, date of birth, nationality, previous travel history, photographs, and embassy-mandated verification documents.
              </li>
              <li>
                <strong>Technical Information:</strong> Standard server logs, IP address, browser type, and device information for security and spam prevention.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We process your personal information strictly for legitimate business and travel management purposes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Preparing accurate quotations and confirming hotel, transport, and flight reservations on your behalf.</li>
              <li>Filing visa applications and embassy appointment scheduling.</li>
              <li>Communicating itinerary updates, flight status notices, or emergency on-ground assistance via WhatsApp, telephone, or email.</li>
              <li>Internal accounting, statutory tax reporting (GST/TCS), and regulatory audit requirements in India.</li>
            </ul>
            <p className="mt-3 font-semibold text-ocean">
              We never sell, rent, or trade your personal or contact information to third-party telemarketers or advertisers.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">4. Document Security & Storage</h2>
            <p>
              Travel documents, particularly passport scans and visa supporting documents, are classified as high-sensitivity customer data. They are accessible only by authorized travel executives and compliance personnel handling your specific file. We employ industry-standard encryption protocols (TLS/HTTPS in transit and secure encrypted storage at rest).
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">5. Data Retention & Your Rights</h2>
            <p>
              We retain customer enquiry records and booking histories to facilitate repeat travel assistance, duplicate verification, and fulfill statutory Indian tax mandates. You have the right to request a copy of your personal data, request corrections, or request archiving of your inactive profile by contacting our data desk at{' '}
              <a href={COMPANY_CONTACT.email.mailto} className="text-ocean font-bold hover:underline">
                {COMPANY_CONTACT.email.primary}
              </a>.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">6. Contact Our Privacy Desk</h2>
            <p>
              If you have any questions regarding this Privacy Policy or our customer data safeguards, please write to:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-sand border border-sand-dark text-xs">
              <strong>{COMPANY_CONTACT.businessName} – Privacy & Compliance Officer</strong><br />
              {COMPANY_CONTACT.address.full}<br />
              Email: <a href={COMPANY_CONTACT.email.mailto} className="text-ocean font-bold">{COMPANY_CONTACT.email.primary}</a><br />
              Telephone: {COMPANY_CONTACT.phone.display}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

