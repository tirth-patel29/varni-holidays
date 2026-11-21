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

/**
 * Format date-time in standard 24-hour IST format:
 * DD/MM/YYYY, HH:mm (Example: 24/11/2026, 23:26)
 */
export function formatIST24(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(d);
}

/**
 * Format date only in IST format:
 * DD/MM/YYYY (Example: 24/11/2026)
 */
export function formatISTDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return formatter.format(d);
}

/**
 * Format time only in 24-hour IST format:
 * HH:mm (Example: 23:26)
 */
export function formatISTTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(d);
}

/**
 * Split an existing or current Date into Date (YYYY-MM-DD), Hour (00-23), Minute (00-59) in IST
 */
export function getIST24Parts(input?: Date | string | null): {
  dateStr: string; // YYYY-MM-DD
  hourStr: string; // 00-23
  minStr: string;  // 00-59
  formatted: string; // DD/MM/YYYY, HH:mm
} {
  const d = input ? (typeof input === 'string' ? new Date(input) : input) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(validDate);
  const m: Record<string, string> = {};
  parts.forEach((p) => (m[p.type] = p.value));

  const dateStr = `${m.year}-${m.month}-${m.day}`;
  const hourStr = m.hour || '00';
  const minStr = m.minute || '00';
  const formatted = `${m.day}/${m.month}/${m.year}, ${hourStr}:${minStr}`;

  return { dateStr, hourStr, minStr, formatted };
}

/**
 * Combine Date (YYYY-MM-DD) and 24-hour time (HH, mm) into a valid UTC Date
 * using fixed Asia/Kolkata offset (+05:30)
 */
export function parseIST24ToDate(
  dateStr: string,
  hourStr: string | number,
  minStr: string | number
): Date {
  const h = typeof hourStr === 'number' ? hourStr : parseInt(String(hourStr).trim(), 10);
  const m = typeof minStr === 'number' ? minStr : parseInt(String(minStr).trim(), 10);

  if (isNaN(h) || h < 0 || h > 23) {
    throw new Error('Hour must be between 00 and 23');
  }
  if (isNaN(m) || m < 0 || m > 59) {
    throw new Error('Minute must be between 00 and 59');
  }
  if (!dateStr || !dateStr.includes('-')) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const hPadded = String(h).padStart(2, '0');
  const mPadded = String(m).padStart(2, '0');
  const isoString = `${dateStr.trim()}T${hPadded}:${mPadded}:00+05:30`;
  const d = new Date(isoString);

  if (isNaN(d.getTime())) {
    throw new Error('Invalid combined date and time');
  }

  return d;
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
