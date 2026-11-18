import { NextRequest, NextResponse } from 'next/server';
import { revokeCustomerSession } from '@/lib/auth/customer-auth';

export async function POST(request: NextRequest) {
  try {
    await revokeCustomerSession();
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Logout failed.' },
      { status: 500 }
    );
  }
}
