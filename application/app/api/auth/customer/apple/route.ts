import { NextRequest, NextResponse } from 'next/server';
import { verifyAppleToken, authenticateSocialCustomer } from '@/lib/auth/customer-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identityToken, user } = body;

    if (!identityToken) {
      return NextResponse.json(
        { success: false, error: 'Missing identityToken in request payload.' },
        { status: 400 }
      );
    }

    const profile = await verifyAppleToken(identityToken, user);
    const result = await authenticateSocialCustomer(profile);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[API /api/auth/customer/apple Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Apple authentication failed.' },
      { status: 500 }
    );
  }
}
