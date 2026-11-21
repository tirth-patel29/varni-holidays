/**
 * Flight Hold Timing & Urgency Calculation Utilities
 * Timezone: Asia/Kolkata (IST)
 */

export interface FlightHoldRemainingTime {
  milliseconds: number;
  isExpired: boolean;
  isUrgent: boolean; // <= 10 hours
  formatted: string;
  hoursRemaining: number;
}

export function calculateRemainingTime(holdTill: Date | string): FlightHoldRemainingTime {
  const now = new Date().getTime();
  const target = new Date(holdTill).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return {
      milliseconds: 0,
      isExpired: true,
      isUrgent: false,
      formatted: 'Expired',
      hoursRemaining: 0,
    };
  }

  const hoursRemaining = diff / (1000 * 60 * 60);
  const isUrgent = hoursRemaining <= 10;

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formatted = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    formatted = `${days}d ${remHours}h left`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m left`;
  } else {
    formatted = `${minutes}m left`;
  }

  return {
    milliseconds: diff,
    isExpired: false,
    isUrgent,
    formatted,
    hoursRemaining,
  };
}
