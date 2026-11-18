'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Calendar,
  Users,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface QuotationItem {
  id: string;
  quotationReference: string;
  title: string;
  destination: string | null;
  durationDays: number | null;
  durationNights: number | null;
  adultsCount: number;
  childrenCount: number;
  totalAmountInr: any;
  basePriceAmountInr: any;
  status: string;
  validUntil: string | Date;
  inclusions: string[];
}

interface QuotationsListClientProps {
  counts: {
    all: number;
    pending: number;
    accepted: number;
    expired: number;
  };
  quotations: QuotationItem[];
}

type FilterTab = 'all' | 'pending' | 'accepted' | 'expired';

export function QuotationsListClient({ counts, quotations }: QuotationsListClientProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const now = new Date();

  const filteredQuotations = quotations.filter((q) => {
    const isValid = new Date(q.validUntil) >= now;
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return (q.status === 'SENT' || q.status === 'DRAFT') && isValid;
    if (activeTab === 'accepted') return q.status === 'ACCEPTED';
    if (activeTab === 'expired') return q.status === 'EXPIRED' || (!isValid && q.status !== 'ACCEPTED');
    return true;
  });

  const formatDate = (dateVal: string | Date) => {
    return new Date(dateVal).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysLeft = (validUntil: string | Date) => {
    const diff = Math.ceil((new Date(validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDestinationImage = (dest?: string | null) => {
    const d = (dest || '').toLowerCase();
    if (d.includes('switzerland')) return 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80';
    if (d.includes('kerala')) return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80';
    if (d.includes('dubai')) return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80';
    if (d.includes('kashmir')) return 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="space-y-4 pt-2 px-5 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Custom Proposals
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-100">
            Updated Live
          </span>
        </div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight font-sans">
          My Quotations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review official customized travel proposals, inclusions & pricing.
        </p>
      </div>

      {/* Filter Chips (Glass Pill Design) */}
      <div className="w-full overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setActiveTab('all')}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <span>All</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <span>Pending Review</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'pending' ? 'bg-white/20' : 'bg-amber-100 text-amber-700 font-bold'}`}>
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('accepted')}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'accepted'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <span>Accepted</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'accepted' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700 font-bold'}`}>
              {counts.accepted}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expired')}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'expired'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <span>Expired</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'expired' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
              {counts.expired}
            </span>
          </button>
        </div>
      </div>

      {/* Quotations List */}
      {filteredQuotations.length > 0 ? (
        <div className="space-y-4">
          {filteredQuotations.map((quote) => {
            const daysLeft = getDaysLeft(quote.validUntil);
            const isAccepted = quote.status === 'ACCEPTED';
            const isExpired = quote.status === 'EXPIRED' || daysLeft < 0;
            const destination = quote.destination || quote.title;
            const duration = quote.durationDays
              ? `${quote.durationDays}D / ${quote.durationNights || quote.durationDays - 1}N`
              : 'Custom Duration';

            return (
              <div
                key={quote.id}
                className="glass-card rounded-[28px] overflow-hidden shadow-xs border border-white/80 flex flex-col"
              >
                {/* Image Backdrop Header */}
                <div className="relative h-40 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getDestinationImage(destination)}
                    alt={destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Tags Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="backdrop-blur-md bg-white/85 text-slate-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                      #{quote.quotationReference}
                    </span>

                    {isAccepted ? (
                      <span className="backdrop-blur-md bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        Accepted
                      </span>
                    ) : isExpired ? (
                      <span className="backdrop-blur-md bg-slate-800/80 text-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                        Expired
                      </span>
                    ) : daysLeft <= 3 ? (
                      <span className="backdrop-blur-md bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs animate-pulse">
                        <Clock className="w-3 h-3" />
                        {daysLeft} days left
                      </span>
                    ) : (
                      <span className="backdrop-blur-md bg-blue-500/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Destination Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold text-white/90 uppercase tracking-wider block">
                      {duration} • {quote.adultsCount + quote.childrenCount} Guests
                    </span>
                    <h2 className="text-xl font-bold text-white drop-shadow-sm font-sans truncate mt-0.5">
                      {quote.title || destination}
                    </h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3.5">
                  {/* Validity & Status Box */}
                  <div className="flex items-center justify-between bg-slate-50/70 p-3 rounded-2xl border border-slate-100/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAccepted
                            ? 'bg-emerald-500'
                            : isExpired
                            ? 'bg-slate-400'
                            : 'bg-amber-500 animate-pulse'
                        }`}
                      />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          STATUS
                        </div>
                        <div className="font-semibold text-slate-800">
                          {isAccepted ? 'Confirmed & Approved' : isExpired ? 'Expired' : 'Awaiting Your Review'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Valid until</div>
                      <div className="font-semibold text-slate-800">{formatDate(quote.validUntil)}</div>
                    </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="flex items-baseline justify-between pt-0.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Total Package Cost
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-extrabold text-slate-900 font-sans">
                          ₹{Number(quote.totalAmountInr).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400">(Incl. Taxes)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-600">
                        ₹{Math.round(Number(quote.totalAmountInr) / (quote.adultsCount || 1)).toLocaleString('en-IN')} / person
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {quote.adultsCount} Adults {quote.childrenCount > 0 ? `+ ${quote.childrenCount} Ch` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Key Inclusions Preview */}
                  {quote.inclusions && quote.inclusions.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Key Inclusions
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {quote.inclusions.slice(0, 4).map((inc, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-blue-50/60 text-slate-700 truncate"
                          >
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate text-[11px]">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <div className="pt-1 flex items-center gap-2">
                    <Link
                      href={`/app/quotations/${quote.id}`}
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition cursor-pointer"
                    >
                      <span>Review Full Proposal</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a
                      href={`https://wa.me/916357050505?text=Hello%20Varni%20Holidays%2C%20I%20have%20a%20question%20regarding%20Quotation%20%23${quote.quotationReference}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition"
                      aria-label="WhatsApp Inquiry"
                    >
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card rounded-[28px] p-8 text-center space-y-3.5 border border-white/80 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
            <FileText className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            No {activeTab !== 'all' ? activeTab : ''} quotations found
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {activeTab === 'pending'
              ? 'You do not have any pending proposals awaiting review. All received proposals are up to date.'
              : 'Our travel designers create custom quotations based on your specific requirements.'}
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/916357050505?text=Hello%20Varni%20Holidays%2C%20I%20would%20like%20to%20request%20a%20quotation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.98] transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Request Custom Quotation</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
