'use client';

import React from 'react';
import FlightHoldsDashboard from '@/components/admin/flights/FlightHoldsDashboard';

export default function FlightHoldQueuePage() {
  return <FlightHoldsDashboard initialTab="HOLD_QUEUE" />;
}
