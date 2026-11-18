import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Folder,
  Globe,
  CreditCard,
  Headphones,
  Shield,
  FileCheck,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getAuthenticatedCustomer } from '@/lib/auth/customer-auth';
import { actionCustomerLogout } from '@/app/actions/customer-auth';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const customer = await getAuthenticatedCustomer();

  const fullName = customer?.fullName || 'Traveler';
  const email = customer?.email || 'traveler@varniholidays.com';
  const avatarUrl =
    customer?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  const provider = customer?.accounts?.[0]?.provider;

  return (
    <div className="space-y-4 pt-2 px-5 pb-6">
      {/* Profile Header Card */}
      <div className="glass-card rounded-[28px] p-5 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Avatar */}
        <div className="relative w-20 h-20 rounded-full p-1 glass-pill shadow-md mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${fullName} Avatar`}
            className="w-full h-full object-cover rounded-full"
            src={avatarUrl}
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
            ✓
          </div>
        </div>

        {/* Identity Details */}
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
          {fullName}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{email}</p>
        {provider && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Connected via {provider === 'google' ? 'Google' : 'Apple'}
          </span>
        )}

        {/* Member Tier Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Varni Signature Traveler</span>
        </div>
      </div>

      {/* Account Navigation Groups */}
      <div className="space-y-3">
        {/* Travel Hub Group */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
          <Link
            href="/app/quotations"
            className="flex items-center justify-between p-3.5 hover:bg-white/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">My Quotations</p>
                <p className="text-[11px] text-slate-400">View estimates, accept or request revision</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/app/wallet"
            className="flex items-center justify-between p-3.5 hover:bg-white/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Folder className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Document Wallet</p>
                <p className="text-[11px] text-slate-400">Passports, flight tickets & hotel vouchers</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/app/visa"
            className="flex items-center justify-between p-3.5 hover:bg-white/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Globe className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Visa Applications</p>
                <p className="text-[11px] text-slate-400">Live embassy tracking & status</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/app/payments"
            className="flex items-center justify-between p-3.5 hover:bg-white/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Payments & Invoices</p>
                <p className="text-[11px] text-slate-400">Tax receipts, deposits & outstanding balances</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Support & Legal Group */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
          <Link
            href="/app/support"
            className="flex items-center justify-between p-3.5 hover:bg-white/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Headphones className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">24/7 Concierge Support</p>
                <p className="text-[11px] text-slate-400">Direct WhatsApp desk & emergency hotline</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/terms"
            className="flex items-center justify-between p-3.5 hover:bg-white/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <FileCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Terms of Service</p>
                <p className="text-[11px] text-slate-400">Booking terms & cancellation policy</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/privacy"
            className="flex items-center justify-between p-3.5 hover:bg-white/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Privacy & Data Security</p>
                <p className="text-[11px] text-slate-400">Data encryption and passport storage policy</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Real Server Action Sign Out */}
        <form action={actionCustomerLogout}>
          <button
            type="submit"
            className="w-full glass-card rounded-2xl p-3.5 hover:bg-red-50/50 flex items-center justify-center gap-2 text-rose-600 font-semibold text-xs transition border border-rose-100 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Customer Account</span>
          </button>
        </form>
      </div>

      {/* App Version Info & Official Brand */}
      <div className="flex flex-col items-center justify-center text-center text-[10px] text-slate-400 pt-3 pb-2">
        <Image
          src="/logo.webp"
          alt="Varni Holidays"
          width={120}
          height={65}
          className="h-6 w-auto object-contain opacity-75 mb-1.5"
        />
        <p>Varni Holidays Travel Companion PWA • v2.4.0</p>
        <p className="mt-0.5">317 Narayan Empire, Anand, Gujarat</p>
      </div>
    </div>
  );
}
