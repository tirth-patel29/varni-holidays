'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_USERS } from '@/lib/auth/session';

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

  const handleQuickLogin = (u: typeof DEFAULT_USERS[0]) => {
    setEmail(u.email);
    setPassword(u.passwordPlain);
    router.push('/employee/leads');
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#E9B95E] to-[#C29033] flex items-center justify-center text-[#0B1E2E] shadow-lg font-serif font-black text-2xl mx-auto mb-4">
          V
        </div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#153650]">
          VARNI HOLIDAYS
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest font-black text-[#C29033]">
          Internal Travel CRM & Desk Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="clay-card rounded-3xl p-8 sm:p-10 border border-[#E3DCCB] bg-white shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#153650] uppercase mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E3DCCB] bg-[#FBF9F5] text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#153650]/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#153650] uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E3DCCB] bg-[#FBF9F5] text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#153650]/20 focus:bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#153650] hover:bg-[#0B1E2E] text-white font-bold text-sm shadow-md transition-colors"
              >
                Sign In to Travel Desk
              </button>
            </div>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-[#E3DCCB] space-y-3">
            <span className="text-[11px] uppercase font-bold text-slate-500 block text-center">
              Quick Role Sign-In (Demo Profiles)
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              {DEFAULT_USERS.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="p-2.5 rounded-xl border border-[#E3DCCB] bg-[#F5F2EB] hover:bg-[#E5DEC9] text-xs text-left transition-colors flex items-center gap-2 group"
                >
                  <img src={u.avatarUrl} alt={u.fullName} className="w-8 h-8 rounded-full object-cover border border-[#E3DCCB] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-[#153650] truncate text-[11px] group-hover:text-[#0B1E2E]">{u.fullName}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase truncate">
                      {u.role.replace('_', ' ')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-600 hover:text-[#153650] font-semibold">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

