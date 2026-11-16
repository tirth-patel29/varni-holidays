'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyTotpAction, verifyRecoveryCodeAction } from '@/app/actions/auth';
import { ShieldCheck, Key, ArrowRight, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export default function MfaVerificationPage() {
  const router = useRouter();

  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRecoveryMode) {
        const res = await verifyRecoveryCodeAction({ recoveryCode });
        if (!res.success) {
          setError(res.error || 'Invalid recovery code.');
          setLoading(false);
          return;
        }
        router.push(res.redirectUrl || '/admin');
      } else {
        const res = await verifyTotpAction({ code: totpCode });
        if (!res.success) {
          setError(res.error || 'Invalid 6-digit code.');
          setLoading(false);
          return;
        }
        router.push(res.redirectUrl || '/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B45] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#E9B95E]/30 selection:text-[#153650]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-md border border-[#153650]">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#153650] font-headline">
          {isRecoveryMode ? 'EMERGENCY RECOVERY' : 'TWO-FACTOR VERIFICATION'}
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#718096] font-mono">
          {isRecoveryMode ? 'Enter Single-Use Backup Code' : 'Authenticator App Required'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 border border-[#E5E8ED] shadow-sm space-y-6">
          
          <div className="text-xs text-[#4A5568] leading-relaxed bg-[#F8FAFC] p-3.5 border border-[#E2E8F0]">
            {isRecoveryMode ? (
              <span>
                Enter one of your 10 stored backup recovery codes (e.g. <code>ABCD-1234-EFGH</code>). Using this code will immediately invalidate it.
              </span>
            ) : (
              <span>
                Open your authenticator app (Google Authenticator, Microsoft Authenticator, 1Password) and enter the 6-digit code for <strong>Varni Holidays</strong>.
              </span>
            )}
          </div>

          {error && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyTotp} className="space-y-4">
            {!isRecoveryMode ? (
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5 text-center">
                  6-Digit Security Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  required
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-extrabold py-3 bg-[#FFFFFF] border-2 border-[#153650] text-[#153650] focus:outline-none focus:ring-2 focus:ring-[#E9B95E] transition-all"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                  Backup Recovery Code
                </label>
                <div className="relative">
                  <Key size={15} className="text-[#A0AEC0] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full pl-9 pr-3 py-2 uppercase font-mono tracking-wider bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || (!isRecoveryMode && totpCode.length !== 6)}
                className="w-full py-2.5 bg-[#153650] hover:bg-[#1E4565] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <span>Verifying Token...</span>
                ) : (
                  <>
                    <span>Confirm & Authorize Session</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle between TOTP & Recovery Code */}
          <div className="pt-4 border-t border-[#E5E8ED] text-center">
            <button
              type="button"
              onClick={() => {
                setIsRecoveryMode(!isRecoveryMode);
                setError(null);
              }}
              className="text-xs text-[#24689B] hover:underline font-semibold"
            >
              {isRecoveryMode
                ? '← Switch back to standard Authenticator code'
                : 'Lost access to device? Use emergency recovery code'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/admin/login"
            className="text-xs text-[#718096] hover:text-[#153650] transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Return to Staff Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
