import { NextResponse } from 'next/server';
import { crmRepo } from '@/lib/crm/store';

export async function GET() {
  const logs = crmRepo.getCommunicationLogs();
  return NextResponse.json({ success: true, logs });
}

