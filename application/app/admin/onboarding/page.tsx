'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  verifyInvitationAction,
  generateOnboardingTotpDataAction,
  acceptInvitationAction,
} from '@/app/actions/auth';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Key,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function EmployeeOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteData, setInviteData] = useState<{
    email: string;
    fullName: string;
    roleCode: string;
  } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+91 ');

  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('Missing invitation token.');
        setVerifyingToken(false);
        return;
      }

      try {
        const res = await verifyInvitationAction(token);
        if (res.valid && res.invitation) {
          setInviteData({
            email: res.invitation.email,
            fullName: res.invitation.fullName,
            roleCode: res.invitation.roleCode,
          });
        } else {
          setError(res.error || 'Invitation is invalid or has expired.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify invitation.');
      } finally {
        setVerifyingToken(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleProceedToMfa = async (e: React.FormEvent) => {
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
      if (!inviteData) throw new Error('Invitation data missing.');
      const totpData = await generateOnboardingTotpDataAction(inviteData.email);
      setTotpSecret(totpData.secret);
      setQrCodeUrl(totpData.qrCodeDataUrl);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to setup TOTP MFA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await acceptInvitationAction({
        token,
        password,
        phone,
        totpSecret,
        totpCode,
      });

      if (!res.success) {
        setError(res.error || 'Onboarding failed.');
        setLoading(false);
        return;
      }

      setRecoveryCodes(res.recoveryCodes || []);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to complete account activation.');
    } finally {
      setLoading(false);
    }
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
        <div className="bg-[#FFFFFF] p-8 border border-[#E5E8ED] max-w-md w-full text-center space-y-3">
          <p className="text-xs font-mono font-bold text-[#153650]">Verifying Invitation Token...</p>
        </div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
        <div className="bg-[#FFFFFF] p-8 border border-[#E5E8ED] max-w-md w-full text-center space-y-4">
          <AlertCircle size={32} className="text-[#DC2626] mx-auto" />
          <h1 className="text-base font-bold text-[#153650]">Invitation Invalid</h1>
          <p className="text-xs text-[#718096] leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-block py-2.5 px-6 bg-[#153650] text-[#FFFFFF] font-bold text-xs"
            >
              Go to Staff Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B45] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#E9B95E]/30 selection:text-[#153650]">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center flex flex-col items-center">
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
          STAFF ONBOARDING
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#718096] font-mono">
          Activate Your Varni Holidays Account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 border border-[#E5E8ED] shadow-sm space-y-6">
          
          {/* Invited User Summary Badge */}
          {inviteData && (
            <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-[#153650] block">{inviteData.fullName}</span>
                <span className="text-[#64748B] text-[11px]">{inviteData.email}</span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-[#153650] text-[#E9B95E] px-2.5 py-1">
                {inviteData.roleCode.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: PASSWORD & PHONE */}
          {step === 1 && (
            <form onSubmit={handleProceedToMfa} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                  Mobile / WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98251 12345"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                  Create Password (Min 12 Characters)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                />
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
                <span className="font-bold block text-[#153650]">Security Requirements:</span>
                <div>&bull; At least 12 characters</div>
                <div>&bull; Upper and lowercase letters, digit, and special character</div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#153650] hover:bg-[#1E4565] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {loading ? (
                    <span>Generating Security Keys...</span>
                  ) : (
                    <>
                      <span>Next: Mandatory TOTP Setup</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: TOTP MFA ENROLLMENT */}
          {step === 2 && (
            <form onSubmit={handleCompleteOnboarding} className="space-y-5">
              <div className="text-center space-y-3">
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  Scan this QR code with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>1Password</strong> on your phone.
                </p>

                {qrCodeUrl && (
                  <div className="inline-block p-3 bg-[#FFFFFF] border border-[#CBD5E1] shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="TOTP QR Code" className="w-48 h-48 mx-auto" />
                  </div>
                )}

                <div className="text-left bg-[#F8FAFC] p-3 border border-[#E2E8F0] text-xs">
                  <span className="text-[10px] font-mono text-[#718096] uppercase block font-bold mb-1">
                    Manual Secret Key
                  </span>
                  <code className="text-[#153650] font-mono font-bold select-all break-all text-xs">
                    {totpSecret}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5 text-center">
                  Enter 6-Digit Code to Verify
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

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] font-bold text-xs"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-2/3 py-2.5 bg-[#153650] hover:bg-[#1E4565] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {loading ? (
                    <span>Activating Account...</span>
                  ) : (
                    <>
                      <span>Activate Account</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: RECOVERY CODES */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#DEF7EC] text-[#168653] flex items-center justify-center rounded-full mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-base font-bold text-[#153650]">Account Successfully Activated!</h2>
                <p className="text-xs text-[#718096] leading-relaxed">
                  Save these 10 one-time recovery codes in a secure location. They allow you to access your account if your authenticator device is lost.
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 font-mono text-xs text-[#153650] grid grid-cols-2 gap-2 text-center">
                {recoveryCodes.map((code, idx) => (
                  <div key={idx} className="p-1.5 bg-[#FFFFFF] border border-[#E2E8F0] font-bold">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={copyAllCodes}
                  className="w-1/2 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#153650] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#CBD5E1]"
                >
                  {copiedCodes ? <Check size={14} className="text-[#168653]" /> : <Copy size={14} />}
                  <span>{copiedCodes ? 'Copied!' : 'Copy All Codes'}</span>
                </button>
                <Link
                  href="/admin/login"
                  className="w-1/2 py-2.5 bg-[#153650] hover:bg-[#1E4565] text-[#FFFFFF] font-bold text-xs flex items-center justify-center gap-1.5 text-center shadow-xs"
                >
                  <span>Proceed to Login</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
