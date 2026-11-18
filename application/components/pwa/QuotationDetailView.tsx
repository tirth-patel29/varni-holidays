'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  X,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Hotel,
  Compass,
} from 'lucide-react';
import { actionRequestRevision } from '@/app/actions/customer-quotations';

interface QuotationDetailViewProps {
  quotation: any;
}

export function QuotationDetailView({ quotation }: QuotationDetailViewProps) {
  const router = useRouter();
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const now = new Date();
  const isAccepted = quotation.status === 'ACCEPTED';
  const isExpired = quotation.status === 'EXPIRED' || new Date(quotation.validUntil) < now;
  const destination = quotation.destination || quotation.title;

  const formatDate = (dateVal: string | Date) => {
    return new Date(dateVal).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;

    try {
      setSubmittingRevision(true);
      setRevisionMessage(null);

      const res = await actionRequestRevision(quotation.id, revisionNotes);

      if (!res.success) {
        throw new Error(res.error || 'Failed to submit revision request.');
      }

      setRevisionMessage({ text: res.message || 'Revision request submitted.' });
      setRevisionNotes('');
      setTimeout(() => {
        setShowRevisionModal(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setRevisionMessage({ text: err.message || 'Error submitting request.', isError: true });
    } finally {
      setSubmittingRevision(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F8FC] pb-32">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-white/70 backdrop-blur-xl shadow-xs border-b border-slate-100">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/app/quotations"
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100/70 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Quotation Details
              </h1>
              <p className="text-[11px] text-slate-500">#{quotation.quotationReference}</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isAccepted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : isExpired
                ? 'bg-slate-100 text-slate-600'
                : 'bg-amber-50 text-amber-700 border border-amber-200/60'
            }`}
          >
            {isAccepted ? 'Accepted' : isExpired ? 'Expired' : 'Awaiting Review'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 px-5 space-y-4">
        {/* Hero Proposal Overview Card */}
        <div className="glass-card rounded-[28px] p-5 shadow-xs border border-white/80 space-y-3">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Custom Travel Proposal
          </span>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            {quotation.title || destination}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100/80">
            {quotation.durationDays && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {quotation.durationDays} Days / {quotation.durationNights || quotation.durationDays - 1} Nights
              </span>
            )}

            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              {quotation.adultsCount} Adults {quotation.childrenCount > 0 ? `+ ${quotation.childrenCount} Ch` : ''}
            </span>

            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Valid until {formatDate(quotation.validUntil)}
            </span>
          </div>
        </div>

        {/* Pricing Transparency Breakdown */}
        <div className="glass-card rounded-2xl p-4 shadow-xs border border-white/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Price Breakdown</h3>
            <span className="text-[11px] font-semibold text-slate-400">Official GST Invoice</span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100/80">
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-600">Base Package Cost</span>
              <span className="font-semibold text-slate-900">
                ₹{Number(quotation.basePriceAmountInr).toLocaleString('en-IN')}
              </span>
            </div>

            {Number(quotation.transportAmountInr) > 0 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-600">Transport & Vehicle</span>
                <span className="font-semibold text-slate-900">
                  ₹{Number(quotation.transportAmountInr).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {Number(quotation.extraChargesAmountInr) > 0 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-600">Additional Services / Activities</span>
                <span className="font-semibold text-slate-900">
                  ₹{Number(quotation.extraChargesAmountInr).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {Number(quotation.discountAmountInr) > 0 && (
              <div className="flex items-center justify-between pt-2 text-emerald-600">
                <span>Special Courtesy Discount</span>
                <span className="font-semibold">
                  -₹{Number(quotation.discountAmountInr).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-600">GST ({Number(quotation.taxPercent)}%)</span>
              <span className="font-semibold text-slate-900">
                ₹{Number(quotation.taxAmountInr).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="font-bold text-slate-900">Total Payable in INR</span>
              <span className="font-extrabold text-blue-600 text-base">
                ₹{Number(quotation.totalAmountInr).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 gap-3">
          {/* Inclusions */}
          <div className="glass-card rounded-2xl p-4 shadow-xs border border-white/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What is Included</span>
            </div>
            {quotation.inclusions && quotation.inclusions.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-700">
                {quotation.inclusions.map((inc: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">All standard inclusions specified in detailed contract.</p>
            )}
          </div>

          {/* Exclusions */}
          <div className="glass-card rounded-2xl p-4 shadow-xs border border-white/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <X className="w-4 h-4 text-slate-400" />
              <span>What is Excluded</span>
            </div>
            {quotation.exclusions && quotation.exclusions.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-500">
                {quotation.exclusions.map((exc: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Personal expenses, optional activities, laundry, minibar.</p>
            )}
          </div>
        </div>

        {/* Customer / Revision Notes if any */}
        {quotation.customerNotes && (
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-1">
            <span className="font-bold text-amber-800">Your Revision Requests & Notes:</span>
            <p className="text-amber-900 whitespace-pre-wrap leading-relaxed">{quotation.customerNotes}</p>
          </div>
        )}
      </main>

      {/* Floating Bottom Decision Action Bar */}
      <div className="fixed bottom-3 inset-x-0 px-4 z-40 max-w-md mx-auto">
        <div className="rounded-2xl bg-white/90 backdrop-blur-2xl p-2 shadow-[0_12px_36px_rgba(21,96,158,0.22)] border border-white flex items-center gap-2">
          {isAccepted ? (
            <div className="flex-1 py-2.5 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Quotation Approved • Booking in Process</span>
            </div>
          ) : isExpired ? (
            <div className="flex-1 py-2.5 px-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold text-center">
              Quotation Expired. Please request a new quote.
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowRevisionModal(true)}
                className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition active:scale-[0.98] cursor-pointer"
              >
                Request Revision
              </button>

              <Link
                href={`/app/quotations/${quotation.id}/accept`}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition cursor-pointer"
              >
                <span>Accept Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          <a
            href={`https://wa.me/916357050505?text=Hello%20Varni%20Holidays%2C%20regarding%20Quotation%20%23${quotation.quotationReference}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 transition"
            aria-label="WhatsApp Advisor"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-white/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Request Quotation Revision</h3>
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tell your travel manager what you would like adjusted (e.g. upgraded hotel category, changed flight dates, added excursions, meal preferences).
            </p>

            <form onSubmit={handleRevisionSubmit} className="space-y-3">
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="e.g. Please change hotel to 5-star Lake View in Lucerne and add private airport pickup..."
                rows={4}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />

              {revisionMessage && (
                <div
                  className={`p-2.5 rounded-xl text-xs ${
                    revisionMessage.isError
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {revisionMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRevision || !revisionNotes.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition cursor-pointer"
                >
                  {submittingRevision ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
