'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Globally redirect legacy employee login to the centralized Enterprise Auth portal
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      <div className="text-center space-y-2">
        <p className="text-xs font-mono font-bold text-[#153650]">Redirecting to Enterprise Staff Login...</p>
      </div>
    </div>
  );
}
