'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  checkBootstrapStatusAction,
  generateBootstrapTotpDataAction,
  executeBootstrapAction,
} from '@/app/actions/auth';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Key,
  Smartphone,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function BootstrapPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [bootstrapNeeded, setBootstrapNeeded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [secret, setSecret] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 63570 50505');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // TOTP states
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');

  // Recovery codes
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    async function initCheck() {
      const res = await checkBootstrapStatusAction();
      setBootstrapNeeded(Boolean(res.bootstrapNeeded));
    }
    initCheck();
  }, []);

  // Step 1 -> Step 2: Validate Credentials & Generate TOTP QR
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
    if (!secret) {
      setError('Bootstrap authorization secret is required.');
      return;
    }

    setLoading(true);
    try {
      const totpData = await generateBootstrapTotpDataAction(email);
      setTotpSecret(totpData.secret);
      setQrCodeUrl(totpData.qrCodeDataUrl);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize TOTP MFA.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Verify First Code & Create Account
  const handleCompleteBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await executeBootstrapAction({
        secret,
        fullName,
        email,
        password,
        phone,
        totpSecret,
        totpCode,
      });

      if (!res.success) {
        setError(res.error || 'Bootstrap execution failed.');
        setLoading(false);
        return;
      }

      setRecoveryCodes(res.recoveryCodes || []);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'An error occurred during account bootstrap.');
    } finally {
      setLoading(false);
    }
  };

  const copyAllRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  if (bootstrapNeeded === false) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
        <div className="bg-[#FFFFFF] p-8 border border-[#E5E8ED] max-w-md w-full text-center space-y-4 shadow-sm">
          <ShieldCheck size={36} className="text-[#168653] mx-auto" />
          <h1 className="text-lg font-bold text-[#153650]">Bootstrap Permanently Disabled</h1>
          <p className="text-xs text-[#718096] leading-relaxed">
            The initial Business Owner account has already been created. One-time bootstrap is strictly locked for security.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-block py-2.5 px-6 bg-[#153650] text-[#FFFFFF] font-bold text-xs"
            >
              Go to Staff Login &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B45] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#E9B95E]/30 selection:text-[#153650]">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="w-14 h-14 bg-[#153650] text-[#E9B95E] flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-md border border-[#153650]">
          <Sparkles size={24} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#153650] font-headline">
          INITIALIZE OWNER ACCOUNT
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#718096] font-mono">
          One-Time Secure System Bootstrap
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 border border-[#E5E8ED] shadow-sm space-y-6">
          
          {/* Progress Tracker */}
          <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-4 text-xs font-mono">
            <span className={step >= 1 ? 'font-bold text-[#153650]' : 'text-[#A0AEC0]'}>
              1. Owner Details
            </span>
            <span className="text-[#CBD5E1]">&rarr;</span>
            <span className={step >= 2 ? 'font-bold text-[#153650]' : 'text-[#A0AEC0]'}>
              2. TOTP MFA Setup
            </span>
            <span className="text-[#CBD5E1]">&rarr;</span>
            <span className={step >= 3 ? 'font-bold text-[#153650]' : 'text-[#A0AEC0]'}>
              3. Recovery Codes
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS */}
          {step === 1 && (
            <form onSubmit={handleProceedToMfa} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono">
                    Bootstrap Authorization Secret
                  </label>
                  <button
                    type="button"
                    onClick={() => setSecret('VarniOwnerBootstrap2026SecureProductionSecret!')}
                    className="text-[10px] text-[#24689B] hover:underline font-mono"
                  >
                    Use default .env secret
                  </button>
                </div>
                <div className="relative">
                  <Key size={15} className="text-[#A0AEC0] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter BOOTSTRAP_SECRET from .env"
                    className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#718096] font-mono">
                  Default from .env: <code className="bg-[#F1F5F9] px-1 py-0.5 text-[#153650]">VarniOwnerBootstrap2026SecureProductionSecret!</code>
                </p>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                  Owner Full Name
                </label>
                <div className="relative">
                  <User size={15} className="text-[#A0AEC0] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Neel Patel"
                    className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                    Official Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@varniholidays.com"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 63570 50505"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#CBD5E1] text-xs text-[#172B45] focus:outline-none focus:border-[#153650] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5">
                    Password (Min 12 Chars)
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

          {/* STEP 2: TOTP QR CODE & FIRST CODE VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleCompleteBootstrap} className="space-y-5">
              <div className="text-center space-y-3">
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  Scan this QR code with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>1Password</strong> to enroll your device.
                </p>

                {qrCodeUrl && (
                  <div className="inline-block p-3 bg-[#FFFFFF] border border-[#CBD5E1] shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="TOTP QR Code" className="w-48 h-48 mx-auto" />
                  </div>
                )}

                <div className="text-left bg-[#F8FAFC] p-3 border border-[#E2E8F0] text-xs">
                  <span className="text-[10px] font-mono text-[#718096] uppercase block font-bold mb-1">
                    Manual Base32 Secret Key (Alternative)
                  </span>
                  <code className="text-[#153650] font-mono font-bold select-all break-all text-xs">
                    {totpSecret}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#718096] font-bold font-mono mb-1.5 text-center">
                  Enter 6-Digit Code from Authenticator
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
                    <span>Verifying & Bootstrapping...</span>
                  ) : (
                    <>
                      <span>Verify & Establish Account</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: RECOVERY CODES DISPLAY */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#DEF7EC] text-[#168653] flex items-center justify-center rounded-full mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-base font-bold text-[#153650]">
                  Owner Account Successfully Initialized!
                </h2>
                <p className="text-xs text-[#718096] leading-relaxed">
                  Store these 10 emergency recovery codes in a secure password vault. Each code can be used exactly once to log in if you lose your phone.
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
                  onClick={copyAllRecoveryCodes}
                  className="w-1/2 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#153650] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#CBD5E1]"
                >
                  {copiedCodes ? <Check size={14} className="text-[#168653]" /> : <Copy size={14} />}
                  <span>{copiedCodes ? 'Copied to Clipboard!' : 'Copy All Codes'}</span>
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
