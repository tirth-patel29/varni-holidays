import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | Varni Holidays',
  description: 'Terms and Conditions governing holiday packages, flight reservations, and travel advisory services by Varni Holidays, Anand, Gujarat.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-sand pb-24">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ocean via-ocean-dark to-slate-900 text-sand-light pt-36 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-2">Service Agreement</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-bold mb-4">Terms & Conditions</h1>
          <p className="text-sand/80 text-sm max-w-xl mx-auto">
            Effective Date: November 2026 • VARNI HOLIDAYS, Anand, Gujarat, India.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="clay-card rounded-3xl p-8 sm:p-12 space-y-8 text-slate-700 text-sm leading-relaxed">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">1. Scope of Services</h2>
            <p>
              VARNI HOLIDAYS operates as a licensed travel management and advisory consultancy. Our services include the curation of domestic and international holiday tour packages, flight reservation assistance, hotel bookings, airport transfers, travel insurance facilitation, and visa document consultation.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">2. Quotations & Pricing Integrity</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Website Quotations:</strong> Prices computed via our online dynamic pricing calculator (including the Kerala 6N/7D package) reflect authentic supplier contracts and published rack rates for specified passenger configurations and vehicle matrices.
              </li>
              <li>
                <strong>Subject to Room Availability:</strong> A website calculation or employee quotation does not constitute a guaranteed room block or flight ticket until an official deposit is received and confirmed in writing.
              </li>
              <li>
                <strong>Peak Season Surcharges:</strong> For Kerala and regional holiday destinations, mandatory peak season surcharges and compulsory gala dinner supplements apply between <strong>20th December and 10th January</strong> annually.
              </li>
              <li>
                <strong>Custom Configurations:</strong> Parties with odd numbers of passengers (e.g., 3, 5, 7, 9 travellers) or requiring custom hotel tiers require a custom quotation prepared by our operations team.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">3. Booking Confirmation & Payment Stages</h2>
            <p className="mb-2">Bookings proceed through structured stages to ensure total operational accuracy:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li><strong>Enquiry & Quotation:</strong> Itinerary review and formal quotation issuance.</li>
              <li><strong>Booking Deposit:</strong> Standard 30% to 50% advance payment required to initiate hotel and vehicle reservations.</li>
              <li><strong>Confirmation Voucher:</strong> Official booking voucher issued upon supplier acceptance.</li>
              <li><strong>Final Balance:</strong> Full payment must be cleared at least 15 days prior to travel departure.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">4. Airline Ticketing & Carriage</h2>
            <p>
              Air travel services are governed exclusively by the Conditions of Carriage of the respective operating airline. Varni Holidays serves as a ticketing intermediary. Schedule changes, flight cancellations, luggage loss, and airport security procedures remain under the direct authority of the operating airline and aviation authorities.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">5. Hotel & Vehicle Policies</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Standard hotel check-in time is 14:00 hrs and check-out is 11:00 hrs (subject to individual property rules). Early check-in or late check-out is subject to room availability and hotel surcharges.</li>
              <li>Chauffeur-driven vehicles provided in our packages are reserved for the contracted itinerary and transfers. Off-itinerary excursions or night-time deviations outside normal operating hours may incur additional kilometre/driver allowances payable locally.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">6. Cancellation & Refunds</h2>
            <p>
              Cancellation penalties depend upon supplier contractual policies (airline non-refundable fares, seasonal hotel cancellation cutoffs, and administrative processing fees). Exact cancellation schedules are detailed on each formal Quotation Voucher prior to payment collection.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-ocean mb-3">7. Jurisdiction</h2>
            <p>
              Any legal dispute, claim, or difference arising out of services provided by VARNI HOLIDAYS shall be subject exclusively to the competent courts of <strong>Anand, Gujarat, India</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

