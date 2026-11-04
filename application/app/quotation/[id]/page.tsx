'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getQuotationDetailsAction } from '@/app/actions/phase3';
import {
  Printer,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Building,
  Phone,
  Calendar,
  Check,
  X,
  Compass,
} from 'lucide-react';

export default function PublicQuotationViewPage() {
  const params = useParams();
  const quotationId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!quotationId) return;
      setLoading(true);
      const res = await getQuotationDetailsAction(quotationId);
      if (res.success) {
        setData(res);
      } else {
        setError(res.error || 'Quotation not found');
      }
      setLoading(false);
    }
    load();
  }, [quotationId]);

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmWhatsApp = () => {
    if (!data?.quotation) return;
    const q = data.quotation;
    const msg = encodeURIComponent(
      `Hello Varni Holidays Anand! I have reviewed quotation ${q.quotationNumber} for "${q.title}" (Total: ₹${(q.totalAmountInr ?? 0).toLocaleString('en-IN')}). I would like to proceed with the booking confirmation. Please guide me with next steps!`
    );
    window.open(`https://wa.me/919825012345?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-slate-300">
        <div className="flex items-center gap-3 text-sm font-medium">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading Official Quotation...</span>
        </div>
      </div>
    );
  }

  if (error || !data?.quotation) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-800">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <X size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Quotation Not Found</h2>
          <p className="text-xs text-slate-600">The requested proposal could not be retrieved or has expired.</p>
          <a
            href="/"
            className="inline-block px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold"
          >
            Visit Varni Holidays
          </a>
        </div>
      </div>
    );
  }

  const q = data.quotation;
  const c = data.customer;
  const lineItems = data.lineItems || q.lineItems || [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-6 md:py-10 px-4 flex flex-col items-center">
      <style jsx global>{`
        @media print {
          body, html {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Floating Action Header for Mobile & Desktop */}
      <div className="no-print w-full max-w-4xl mb-4 bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm font-serif">
            V
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">Varni Holidays Proposal</span>
            <span className="text-[11px] text-slate-300 font-mono">{q.quotationNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <Printer size={13} className="text-amber-400" />
            <span>Save / Print PDF</span>
          </button>
          <button
            onClick={handleConfirmWhatsApp}
            className="px-4 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-xs font-bold text-slate-950 inline-flex items-center gap-1.5 transition-all shadow-md"
          >
            <MessageSquare size={14} />
            <span>Confirm on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LUXURY A4 QUOTATION SHEET                                      */}
      {/* ============================================================== */}
      <div className="print-card w-full max-w-4xl bg-white rounded-xl shadow-xl p-8 md:p-12 border border-slate-200 space-y-7">
        
        {/* Header & Letterhead */}
        <div className="pb-6 border-b-2 border-slate-950 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-serif font-black tracking-tight text-slate-950 uppercase">
                Varni Holidays
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Official Travel Proposal
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Station Road, Anand, Gujarat 388001</p>
            <p className="text-xs text-slate-500">Phone: +91 98250 12345 • Email: contact@varniholidays.com • GSTIN: 24AAACV1234P1Z5</p>
          </div>

          <div className="md:text-right">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block">Proposal Reference</span>
            <span className="text-base font-mono font-bold text-slate-950 block">{q.quotationNumber}</span>
            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
              <div>Issue Date: <strong className="text-slate-800">{new Date(q.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
              <div>Valid Until: <strong className="text-amber-800">{new Date(q.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
            </div>
          </div>
        </div>

        {/* Guest & Trip Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
              Prepared Exclusively For
            </span>
            <div className="text-sm font-bold text-slate-950">{c?.fullName || 'Valued Guest'}</div>
            <div className="text-slate-700 font-mono mt-0.5 font-medium">{c?.phoneCountryCode || '+91'} {c?.phoneNumber}</div>
            <div className="text-slate-600">{c?.email || 'Direct Traveler'}</div>
            <div className="text-slate-500 mt-0.5">{c?.city || 'Anand, Gujarat'}</div>
          </div>

          <div className="md:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
              Tour Package & Specialist
            </span>
            <div className="text-sm font-bold text-slate-950">{q.title}</div>
            <div className="text-slate-600 mt-0.5">Specialist: <strong className="text-slate-800">{q.createdByName || 'Neel Patel'}</strong></div>
            <div className="text-slate-500">Concierge Desk: Varni Holidays Anand HQ</div>
          </div>
        </div>

        {/* Itemized Services Breakdown Table */}
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-700 mb-2">Service Inclusions & Accommodation</h3>
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Service & Accommodation Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lineItems.map((li: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono text-slate-500">{li.itemOrder || idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{li.description}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-medium text-slate-600">{li.serviceCategory}</td>
                    <td className="py-3 px-3 text-center tabular-nums font-medium text-slate-800">{li.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      ₹{(li.unitPriceInr ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-950 tabular-nums">
                      ₹{(li.totalPriceInr ?? 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Totals Breakdown */}
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <ShieldCheck size={16} />
              <span>All Taxes & Government Surcharges Included</span>
            </div>
            <p className="text-[11px] text-slate-500">Covers private transfers, accommodation, meal plan as booked, tolls & driver allowances.</p>
          </div>

          <div className="w-full md:w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono tabular-nums">₹{(q.subtotalInr || q.totalAmountInr || 0).toLocaleString('en-IN')}</span>
            </div>
            {q.discountInr > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Discount:</span>
                <span className="font-mono tabular-nums">-₹{q.discountInr.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST (5%):</span>
              <span className="font-mono tabular-nums">Included</span>
            </div>
            <div className="pt-2 border-t border-slate-300 flex justify-between text-base font-bold text-slate-950">
              <span>Total Payable:</span>
              <span className="font-mono text-emerald-700 tabular-nums">₹{(q.totalAmountInr ?? 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-200">
            <span className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider block mb-2">
              ✓ What is Included in this Package
            </span>
            <ul className="space-y-1 text-slate-700">
              {(q.inclusions && q.inclusions.length > 0
                ? q.inclusions
                : [
                    'Hotel / Resort accommodation with breakfast as specified',
                    'Dedicated Private AC Vehicle with courteous chauffeur',
                    'Pickup and drop transfers from Airport / Railway Station',
                    'All interstate tolls, parking, and driver daily allowances',
                  ]
              ).map((inc: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-lg border border-rose-200">
            <span className="font-bold text-rose-950 uppercase text-[10px] tracking-wider block mb-2">
              ✗ What is Excluded
            </span>
            <ul className="space-y-1 text-slate-700">
              {(q.exclusions && q.exclusions.length > 0
                ? q.exclusions
                : [
                    'Airfare / Train tickets (unless booked separately)',
                    'Personal expenses (laundry, room service, alcoholic beverages)',
                    'Monument entrance tickets & optional adventure activities',
                    'Any service not explicitly mentioned in inclusions',
                  ]
              ).map((exc: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span>{exc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bank & Payment Details */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
            <CreditCard size={14} className="text-amber-700" />
            <span>Official Bank Transfer Details (Varni Holidays)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-700 font-medium">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Bank Name</span>
              <span className="font-bold text-slate-900">HDFC Bank Ltd.</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Beneficiary Name</span>
              <span className="font-bold text-slate-900">Varni Holidays</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Current Account No.</span>
              <span className="font-mono font-bold text-slate-900">50200012345678</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">IFSC Code & Branch</span>
              <span className="font-mono font-bold text-slate-900">HDFC0001234 (Anand Branch)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>UPI ID: <strong className="font-mono text-slate-900">varniholidays@okaxis</strong></span>
            <span>Schedule: 50% advance to confirm, balance 7 days prior to travel.</span>
          </div>
        </div>

        {/* Terms */}
        {q.terms && (
          <div className="text-xs text-slate-600 bg-slate-50/50 p-3.5 rounded border border-slate-200">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Booking Policy & Cancellation Terms
            </span>
            <p className="leading-relaxed">{q.terms}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">Thank you for choosing Varni Holidays!</p>
            <p className="text-[11px] text-slate-500">For inquiries or modifications, call +91 98250 12345.</p>
          </div>

          <div className="text-right">
            <div className="h-10 border-b border-dashed border-slate-400 w-44 ml-auto mb-1"></div>
            <span className="font-bold text-slate-900 block">Authorized Signatory</span>
            <span className="text-[10px] text-slate-500 uppercase">Varni Holidays Anand Desk</span>
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action for Mobile */}
      <div className="no-print mt-6 flex items-center gap-3">
        <button
          onClick={handleConfirmWhatsApp}
          className="px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-sm font-bold text-slate-950 inline-flex items-center gap-2 shadow-xl transition-all"
        >
          <MessageSquare size={16} />
          <span>Confirm Booking on WhatsApp</span>
        </button>
      </div>

    </div>
  );
}
