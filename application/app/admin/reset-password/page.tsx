'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { completePasswordResetAction } from '@/app/actions/auth';
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await completePasswordResetAction(token, password);
      setLoading(false);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/login');
        }, 2500);
      } else {
        setError(res.error || 'Failed to update password. Link may be expired.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during password update.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
        <div className="bg-[#FFFFFF] p-8 border border-[#E5E8ED] max-w-md w-full text-center space-y-4">
          <AlertCircle size={32} className="text-[#DC2626] mx-auto" />
          <h1 className="text-base font-bold text-[#153650]">Missing Reset Token</h1>
          <p className="text-xs text-[#718096]">
            No valid security token was found in the link. Please request a new password reset link.
          </p>
          <Link
            href="/admin/forgot-password"
            className="inline-block py-2 px-4 bg-[#153650] text-[#FFFFFF] font-bold text-xs"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B45] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#E9B95E]/30 selection:text-[#153650]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <Link href="/" className="inline-block mb-3" aria-label="Varni Holidays">
          <Image
            src="/logo.webp"
            alt="Varni Holidays"
            width={220}
            height={120}
            priority
            className="h-12 w-auto object-contain mx-auto"
          />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[#153650] font-headline">
          NEW STAFF PASSWORD
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#718096] font-mono">
          Minimum 12 Characters Required
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 border border-[#E5E8ED] shadow-sm space-y-6">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-[#DEF7EC] text-[#168653] flex items-center justify-center rounded-full mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-sm font-bold text-[#153650]">Password Successfully Updated</h2>
              <p className="text-xs text-[#718096] leading-relaxed">
                All prior sessions have been revoked. Redirecting you to the staff sign-in page...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                    New Password (Min 12 Characters)
                  </label>
                  <div className="relative">
                    <Lock size={15} className="text-[#A0AEC0] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="text-[#A0AEC0] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
                  <span className="font-bold block text-[#153650]">Password Requirements:</span>
                  <div>&bull; At least 12 characters</div>
                  <div>&bull; Include uppercase, lowercase, number, and special character (!@#$%^&*)</div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#153650] hover:bg-[#1E4565] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {loading ? (
                      <span>Updating Password...</span>
                    ) : (
                      <>
                        <span>Save & Complete Reset</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
