'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Users,
  Coins,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { actionAcceptQuotation } from '@/app/actions/customer-quotations';

interface QuotationAcceptClientProps {
  quotation: any;
}

export function QuotationAcceptClient({ quotation }: QuotationAcceptClientProps) {
  const router = useRouter();
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const destination = quotation.destination || quotation.title;
  const isAlreadyAccepted = quotation.status === 'ACCEPTED';

  const handleAccept = async () => {
    if (!agreedTerms && !isAlreadyAccepted) {
      setErrorMessage('Please acknowledge and agree to the travel terms and conditions.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await actionAcceptQuotation(quotation.id);

      if (!res.success) {
        throw new Error(res.error || 'Failed to accept quotation.');
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while accepting quotation.');
    } finally {
      setLoading(false);
    }
  };

  if (success || isAlreadyAccepted) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F4F8FC] p-5 pt-20 justify-center items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md animate-bounce">
          <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Proposal Approved
          </span>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            Congratulations!
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Quotation #{quotation.quotationReference} for {destination} has been confirmed. Your dedicated travel manager at Varni Holidays Anand HQ is now processing your hotel and flight reservations.
          </p>
        </div>

        <div className="w-full max-w-sm glass-card rounded-2xl p-4 border border-white/80 shadow-xs text-left space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Agreed Amount:</span>
            <span className="font-bold text-slate-900">
              ₹{Number(quotation.totalAmountInr).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Destination:</span>
            <span className="font-bold text-slate-900">{destination}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Operations Desk:</span>
            <span className="font-bold text-emerald-600">Assigned & Active</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col w-full max-w-sm gap-2">
          <Link
            href="/app/trips"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition cursor-pointer"
          >
            <span>Go to My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/app"
            className="w-full py-3 bg-white/80 border border-slate-200 hover:bg-white text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center transition active:scale-[0.98]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F8FC] pb-28">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-white/70 backdrop-blur-xl shadow-xs border-b border-slate-100">
        <div className="h-16 px-4 flex items-center gap-2">
          <Link
            href={`/app/quotations/${quotation.id}`}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100/70 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">
              Accept Quotation
            </h1>
            <p className="text-[11px] text-slate-500">#{quotation.quotationReference}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 px-5 space-y-4">
        {/* Proposal Summary Card */}
        <div className="glass-card rounded-[28px] p-5 shadow-xs border border-white/80 space-y-3">
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <FileCheck2 className="w-4 h-4" />
            <span>Final Proposal Approval</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            {quotation.title || destination}
          </h2>

          <div className="p-3 rounded-2xl bg-slate-50 flex items-baseline justify-between border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Proposal Value
              </span>
              <div className="text-xl font-extrabold text-blue-600 mt-0.5">
                ₹{Number(quotation.totalAmountInr).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="text-[10px] text-slate-400 block">Pax Count</span>
              <span className="font-semibold text-slate-800">
                {quotation.adultsCount} Adults {quotation.childrenCount > 0 ? `+ ${quotation.childrenCount} Ch` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Legal & Travel Terms Checklist */}
        <div className="glass-card rounded-2xl p-4 shadow-xs border border-white/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Important Travel Guidelines
          </h3>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Passport must be valid for at least 6 months from the intended date of departure.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Standard cancellation policies apply once airline tickets and hotel reservations are ticketed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Pure vegetarian and Jain meal requests are coordinated with our culinary partners on tour.
              </span>
            </li>
          </ul>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800">
                I agree to the travel terms, quotation inclusions, and booking guidelines.
              </span>
            </label>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </main>

      {/* Floating Bottom Confirm Button */}
      <div className="fixed bottom-3 inset-x-0 px-4 z-40 max-w-md mx-auto">
        <div className="rounded-2xl bg-white/90 backdrop-blur-2xl p-2 shadow-[0_12px_36px_rgba(21,96,158,0.22)] border border-white">
          <button
            type="button"
            onClick={handleAccept}
            disabled={loading || !agreedTerms}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Acceptance...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Accept Proposal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
