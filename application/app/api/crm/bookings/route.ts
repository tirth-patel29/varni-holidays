import { NextResponse } from 'next/server';
import { crmRepo } from '@/lib/crm/store';

export async function GET() {
  const bookings = crmRepo.getBookings();
  return NextResponse.json({ success: true, bookings });
}

