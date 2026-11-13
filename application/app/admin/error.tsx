'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw, LayoutDashboard, Home, ArrowLeft } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin portal captured error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F7F8FA]">
      <div className="max-w-lg w-full bg-[#FFFFFF] border border-[#E5E8ED] shadow-sm p-6 sm:p-8 rounded-none text-center">
        <div className="w-12 h-12 bg-[#FEF2F2] border border-[#FCDAD7] text-[#D54747] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#718096] block mb-1">
          Admin Portal Diagnostic
        </span>
        <h2 className="text-xl font-bold text-[#153650] font-headline mb-2">
          Unable to Load Admin Module
        </h2>
        <p className="text-xs text-[#718096] mb-6 leading-relaxed">
          A client-side initialization anomaly occurred while rendering this section. Your CRM session and data are secure in PostgreSQL.
        </p>

        {error?.message && (
          <div className="mb-6 p-3 bg-[#F8FAFC] border border-[#E5E8ED] text-left text-[11px] font-mono text-[#D54747] break-words max-h-32 overflow-y-auto">
            {error.message}
            {error.digest && (
              <div className="mt-1 text-[10px] text-[#A0AEC0]">
                Digest: {error.digest}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2 bg-[#153650] hover:bg-[#24689B] text-[#FFFFFF] text-xs font-bold rounded-none inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCw size={13} />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-4 py-2 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#153650] border border-[#E5E8ED] text-xs font-bold rounded-none inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCw size={13} />
            <span>Reload Page</span>
          </button>

          <Link
            href="/admin"
            className="w-full sm:w-auto px-4 py-2 bg-[#FFFFFF] hover:bg-[#F4F6F9] text-[#718096] hover:text-[#153650] border border-[#E5E8ED] text-xs font-bold rounded-none inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <LayoutDashboard size={13} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

