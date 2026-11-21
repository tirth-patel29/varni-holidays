'use client';

import React from 'react';
import FlightHoldsDashboard from '@/components/admin/flights/FlightHoldsDashboard';

export default function FlightCancelledPage() {
  return <FlightHoldsDashboard initialTab="CANCELLED" />;
}
