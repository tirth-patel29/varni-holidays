'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithPasswordAction } from '@/app/actions/auth';
import { Lock, Mail, ArrowRight, Shield, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithPasswordAction({ email, password });
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (res.requiresMfa) {
        router.push('/admin/mfa');
      } else {
        router.push(nextPath);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign-in.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B45] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#E9B95E]/30 selection:text-[#153650]">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-md border border-[#153650]">
          V
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#153650] font-headline">
          VARNI HOLIDAYS
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#718096] font-mono">
          Enterprise Administrative Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 border border-[#E5E8ED] shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="text-[#A0AEC0] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@varniholidays.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] placeholder-[#94A3B8] focus:outline-none focus:border-[#153650] focus:ring-1 focus:ring-[#153650] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[11px] text-[#24689B] hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="text-[#A0AEC0] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] placeholder-[#94A3B8] focus:outline-none focus:border-[#153650] focus:ring-1 focus:ring-[#153650] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#153650] hover:bg-[#1E4565] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Sign In & Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Protocols Notice */}
          <div className="pt-4 border-t border-[#E5E8ED] flex items-center justify-between text-[11px] text-[#718096]">
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-[#168653]" />
              <span>Mandatory TOTP MFA Active</span>
            </div>
            <span className="font-mono text-[10px]">Anand Desk v2.4</span>
          </div>
        </div>

        {/* Public Website Return */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#718096] hover:text-[#153650] transition-colors inline-flex items-center gap-1"
          >
            <span>&larr; Return to Varni Holidays Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
