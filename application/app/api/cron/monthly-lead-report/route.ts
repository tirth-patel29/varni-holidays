import { NextRequest, NextResponse } from 'next/server';
import { generateAndSendMonthlyLeadReport } from '@/lib/reports/monthly-lead-report';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // CRON Authorization check
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const searchSecret = request.nextUrl.searchParams.get('secret');
    if (searchSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const force = request.nextUrl.searchParams.get('force') === 'true';

  try {
    const result = await generateAndSendMonthlyLeadReport({ force });

    if (!result.success && !result.skippedDuplicate) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[Monthly Report Cron Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
