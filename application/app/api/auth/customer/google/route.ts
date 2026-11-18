import { NextRequest, NextResponse } from 'next/server';
import { verifyGoogleToken, authenticateSocialCustomer } from '@/lib/auth/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Missing idToken in request payload.' },
        { status: 400 }
      );
    }

    const profile = await verifyGoogleToken(idToken);
    const result = await authenticateSocialCustomer(profile);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[API /api/auth/customer/google Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Google authentication failed.' },
      { status: 500 }
    );
  }
}
