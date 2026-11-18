'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { actionGoogleSignIn, actionAppleSignIn } from '@/app/actions/customer-auth';

export function SocialAuthSheet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/app';

  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Handle Continue with Google
   */
  const handleGoogleClick = async () => {
    try {
      setLoadingProvider('google');
      setErrorMessage(null);

      // In production with Google Identity Services configured:
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!googleClientId) {
        throw new Error('Google Sign-In configuration is currently being provisioned for this domain. Please contact Varni Holidays.');
      }

      let idTokenToVerify = '';

      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        // Trigger Google Identity Services One-Tap or Popup
        idTokenToVerify = await new Promise((resolve, reject) => {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: any) => {
              if (response?.credential) {
                resolve(response.credential);
              } else {
                reject(new Error('Google authentication cancelled.'));
              }
            },
          });
          (window as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              reject(new Error('Google One-Tap was not displayed or was dismissed.'));
            }
          });
        });
      } else {
        throw new Error('Google Identity Services SDK is loading. Please refresh and try again.');
      }

      // Execute real server-side validation and session creation
      const result = await actionGoogleSignIn(idTokenToVerify);

      if (!result.success) {
        throw new Error(result.error || 'Google authentication failed.');
      }

      // Navigate to destination
      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      console.error('[Google Sign-In Error]:', err);
      setErrorMessage(err.message || 'Unable to sign in with Google. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  /**
   * Handle Continue with Apple
   */
  const handleAppleClick = async () => {
    try {
      setLoadingProvider('apple');
      setErrorMessage(null);

      // In production with AppleJS configured:
      const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

      if (!appleClientId) {
        throw new Error('Sign in with Apple configuration is currently being provisioned for this domain. Please contact Varni Holidays.');
      }

      let identityToken = '';
      let userPayload: any = undefined;

      if (typeof window !== 'undefined' && (window as any).AppleID) {
        // Trigger Apple ID Web SDK
        const data = await (window as any).AppleID.auth.signIn();
        identityToken = data?.authorization?.id_token;
        userPayload = data?.user;
      } else {
        throw new Error('AppleID Web SDK is loading. Please refresh and try again.');
      }

      // Execute real server-side validation and session creation
      const result = await actionAppleSignIn(identityToken, userPayload);

      if (!result.success) {
        throw new Error(result.error || 'Apple authentication failed.');
      }

      // Navigate to destination
      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      console.error('[Apple Sign-In Error]:', err);
      setErrorMessage(err.message || 'Unable to sign in with Apple. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="w-full">
      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Social Authentication Action Buttons (Google & Apple ONLY) */}
      <div className="w-full space-y-3.5" data-purpose="auth-action-buttons">
        {/* 1. Continue with Apple (Matching Stitch Screen Exactly) */}
        <button
          type="button"
          onClick={handleAppleClick}
          disabled={loadingProvider !== null}
          className="w-full h-[52px] px-5 rounded-[22px] frosted-glass-btn hover:bg-white/80 text-slate-900 flex items-center justify-center space-x-3 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-sm"
        >
          {loadingProvider === 'apple' ? (
            <Loader2 className="w-5 h-5 animate-spin text-black" />
          ) : (
            <svg className="w-5 h-5 fill-current text-black -mt-0.5 shrink-0" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.42-6.53-10.12-11.75-21.72-15.66-34.82-3.91-13.1-5.87-25.13-5.87-36.1 0-14.42 3.69-26.39 11.07-35.91 7.38-9.52 16.48-14.38 27.29-14.58 4.79 0 10.1 1.25 15.93 3.75 5.83 2.5 9.74 3.78 11.74 3.84 1.52 0 5.48-1.29 11.88-3.87 6.4-2.57 11.83-3.73 16.29-3.48 12.07.76 21.72 5.17 28.96 13.23-10.55 6.41-15.72 15.34-15.5 26.78.22 8.91 3.58 16.32 10.1 22.24 6.51 5.92 14.16 9.3 22.95 10.13-2.17 6.42-4.78 12.76-7.83 19.03zM119.22 31.84c0-7.72 2.77-15 8.32-21.84 5.54-6.84 12.39-10.74 20.53-11.7 1.09 7.72-1.42 14.99-7.51 21.81-6.1 6.82-13.21 11.06-21.34 11.73z" />
            </svg>
          )}
          <span className="text-[15px] font-semibold text-[#0E283F]">Continue with Apple</span>
        </button>

        {/* 2. Continue with Google (Matching Stitch Screen Exactly) */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loadingProvider !== null}
          className="w-full h-[52px] px-5 rounded-[22px] frosted-glass-btn hover:bg-white/80 text-slate-900 flex items-center justify-center space-x-3 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-sm"
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" fill="#4285F4" />
              <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.34 7.34 24 12 24z" fill="#34A853" />
              <path d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z" fill="#FBBC05" />
              <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.66 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z" fill="#EA4335" />
            </svg>
          )}
          <span className="text-[15px] font-semibold text-[#0E283F]">Continue with Google</span>
        </button>
      </div>

      {/* Footer Terms & Policies */}
      <footer className="w-full mt-7 text-center text-[12px] text-slate-500 font-normal leading-relaxed px-2">
        By continuing, you agree to our<br />
        <Link className="text-[#1A6EB4] underline font-medium hover:text-sky-700" href="/terms">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link className="text-[#1A6EB4] underline font-medium hover:text-sky-700" href="/privacy">
          Privacy Policy
        </Link>.
      </footer>
    </div>
  );
}
