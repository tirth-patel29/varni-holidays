'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { requestPasswordResetAction } from '@/app/actions/auth';
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await requestPasswordResetAction(email);
      setLoading(false);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch password reset email.');
      setLoading(false);
    }
  };

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
          RESET PASSWORD
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#718096] font-mono">
          Administrative Security Service
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 border border-[#E5E8ED] shadow-sm space-y-6">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-[#DEF7EC] text-[#168653] flex items-center justify-center rounded-full mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-sm font-bold text-[#153650]">Reset Link Dispatched</h2>
              <p className="text-xs text-[#718096] leading-relaxed">
                If an administrative account exists for <strong>{email}</strong>, a single-use password recovery link has been sent via Resend. The link will expire in 60 minutes.
              </p>
              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="w-full py-2.5 bg-[#153650] text-[#FFFFFF] font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#4A5568] leading-relaxed bg-[#F8FAFC] p-3 border border-[#E2E8F0]">
                Enter your staff email address. If verified, you will receive a secure token to establish a new password.
              </p>

              {error && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                    Registered Staff Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="text-[#A0AEC0] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@varniholidays.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
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
                      <span>Dispatching Link...</span>
                    ) : (
                      <>
                        <span>Send Recovery Email</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-[#E5E8ED] text-center">
                <Link
                  href="/admin/login"
                  className="text-xs text-[#718096] hover:text-[#153650] transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
