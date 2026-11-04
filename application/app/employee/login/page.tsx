'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_USERS } from '@/lib/auth/session';
import { Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('neel@varniholidays.com');
  const [password, setPassword] = useState('Varni@Admin2026');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DEFAULT_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordPlain !== password) {
      setError('Invalid employee credentials. Please check password or select a quick-login profile.');
      return;
    }
    router.push('/employee/leads');
  };

  const handleQuickLogin = (u: (typeof DEFAULT_USERS)[0]) => {
    setEmail(u.email);
    setPassword(u.passwordPlain);
    router.push('/employee/leads');
  };

  return (
    <div className="min-h-screen bg-[#101113] text-[#F4F4F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-lg bg-[#17191D] border border-[#2A2E34] flex items-center justify-center text-[#E9B95E] font-semibold text-lg mx-auto mb-3 shadow-lg">
          V
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-[#F4F4F2]">
          VARNI HOLIDAYS
        </h2>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-[#969CA5] font-mono">
          Internal Operations & Travel Desk
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#17191D] rounded-xl p-6 sm:p-7 border border-[#2A2E34] shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-[#DF7373]/10 border border-[#DF7373]/20 text-[#DF7373] text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#969CA5] font-medium mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="text-[#666E79] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-[#101113] border border-[#2A2E34] text-xs text-[#F4F4F2] placeholder-[#666E79] focus:outline-none focus:border-[#E9B95E] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#969CA5] font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="text-[#666E79] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-[#101113] border border-[#2A2E34] text-xs text-[#F4F4F2] placeholder-[#666E79] focus:outline-none focus:border-[#E9B95E] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-md bg-[#E9B95E] hover:bg-[#F0C878] text-[#0B0D0F] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Sign In to Travel Desk</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-[#2A2E34] space-y-2.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#666E79] block text-center">
              Quick Role Sign-In (Demo Profiles)
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              {DEFAULT_USERS.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="p-2 rounded-md border border-[#2A2E34] bg-[#101113] hover:bg-[#1D2025] hover:border-[#383E47] text-xs text-left transition-colors flex items-center gap-2 group"
                >
                  <img
                    src={u.avatarUrl}
                    alt={u.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-[#2A2E34] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-[#F4F4F2] truncate text-[11px] group-hover:text-[#E9B95E]">
                      {u.fullName.split(' ')[0]}
                    </div>
                    <div className="text-[9px] text-[#666E79] uppercase font-mono truncate">
                      {u.role.replace('_', ' ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-1 border-t border-[#2A2E34]/50">
            <Link
              href="/"
              className="text-xs text-[#969CA5] hover:text-[#F4F4F2] inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#666E79]">
          <ShieldCheck size={12} className="text-[#55B98A]" />
          <span>Encrypted Session • Anand HQ Operations Desk</span>
        </div>
      </div>
    </div>
  );
}
