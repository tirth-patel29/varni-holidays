import React from 'react';
import Link from 'next/link';
import { COMPANY_CONTACT } from '@/lib/config/contact';

export const metadata = {
  title: 'Travel & Visa Disclaimer | Varni Holidays',
  description: 'Official Visa Assistance and Travel Advisory Disclaimer of Varni Holidays, Anand, Gujarat, India.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-sand pb-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ocean via-ocean-dark to-slate-900 text-sand-light pt-36 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-2">Legal Transparency</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold mb-4">Travel & Visa Disclaimer</h1>
          <p className="text-sand/80 text-sm max-w-xl mx-auto">
            Important regulatory disclosures regarding our advisory role, visa processing, and travel ticketing.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="clay-card rounded-3xl p-8 sm:p-12 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Prominent Alert Box */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-2xl text-amber-600 shrink-0 mt-0.5">warning</span>
              <div>
                <h3 className="font-serif text-base font-bold mb-1">Not an Embassy or Government Authority</h3>
                <p className="text-xs leading-relaxed">
                  VARNI HOLIDAYS is an independent private travel management consultancy headquartered in Anand, Gujarat. We are <strong>not</strong> an embassy, consulate, diplomatic mission, or official representative of any domestic or foreign government.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">1. Visa Advisory & Facilitation Limitations</h2>
            <ul className="list-disc pl-5 space-y-2.5">
              <li>
                <strong>Sole Discretion of Sovereign Consulates:</strong> The decision to grant, delay, or deny any tourist, business, visit, or transit visa rests exclusively and sovereignly with the respective government embassy, consulate, high commission, or immigration authority (e.g., GDRFA / ICP UAE, UKVI, US Department of State, Schengen Consulates).
              </li>
              <li>
                <strong>No Guarantee of Issuance:</strong> VARNI HOLIDAYS assists applicants with dossier preparation, document checklists, appointment booking, translation guidance, and application verification. <em>We do not and cannot guarantee visa approval under any circumstances.</em>
              </li>
              <li>
                <strong>Non-Refundable Government Fees:</strong> Embassy, consular, biometric collection, and VFS/TLS processing fees are levied directly by governments and visa application centers and are strictly non-refundable regardless of the application outcome.
              </li>
              <li>
                <strong>Processing Timelines:</strong> Published processing windows (e.g., 2–4 working days for Dubai eVisa, 15 working days for Schengen) are indicative norms provided by authorities. Delays caused by embassy administrative processing, background checks, or technical downtime are beyond our control.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">2. Flight Enquiries & Dynamic Fares</h2>
            <p className="mb-2">
              Our website provides an enquiry portal for flight tickets. In accordance with Phase 1 operational architecture:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>No live GDS transactions or speculative inventory holds are executed on the public web portal.</li>
              <li>Airline airfares, baggage rules, seat selections, and promotional fares are dynamic and subject to continuous airline inventory shifts until our ticketing desk issues confirmed PNR vouchers.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">3. External Links & Third-Party Suppliers</h2>
            <p>
              Our website may reference external third-party suppliers (e.g., airline portals, national tourism boards, hotel properties). VARNI HOLIDAYS does not operate or control these independent service providers and cannot assume liability for their private terms of service, baggage delays, or schedule modifications.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">4. Customer Verification Responsibility</h2>
            <p>
              Travellers are responsible for ensuring that their passports are valid for at least <strong>six months</strong> beyond their scheduled date of return and have sufficient blank visa pages. Travellers must also ensure adherence to destination health, vaccination, and customs regulations prior to departure.
            </p>
          </div>

          <div className="pt-4 border-t border-sand-dark">
            <p className="text-xs text-slate-500">
              For any clarification regarding this disclaimer or our travel facilitation policies, please contact our office in Anand, Gujarat at <a href={COMPANY_CONTACT.email.mailto} className="text-ocean font-bold hover:underline">{COMPANY_CONTACT.email.primary}</a> or call {COMPANY_CONTACT.phone.display}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

