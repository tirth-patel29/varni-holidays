import { NextRequest, NextResponse } from 'next/server';
import { runFlightHoldSchedulerAction } from '@/app/actions/flight-holds';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Optional cron authorization token check
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If CRON_SECRET is configured, enforce it
    const searchSecret = request.nextUrl.searchParams.get('secret');
    if (searchSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = await runFlightHoldSchedulerAction();

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
