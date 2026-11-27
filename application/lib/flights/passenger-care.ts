import { prisma } from '@/lib/prisma';
import { sendCustomerEmail } from '@/lib/integrations/email-service';
import { sendCustomerWhatsApp } from '@/lib/integrations/whatsapp-service';
import { COMPANY_CONTACT } from '@/lib/config/contact';
import { formatISTDate, formatIST24 } from '@/lib/flights/timing';

export interface TicketFlightDetails {
  passengerName: string;
  passengerEmail?: string | null;
  passengerPhone?: string | null;
  pnr: string;
  airline?: string | null;
  flightNumber?: string | null;
  origin?: string | null;
  destination?: string | null;
  departureDateTime?: Date | null;
  departureTimezone?: string | null;
  airlineTicketNumber?: string | null;
  travelRoute?: string | null;
  pdfDownloadUrl?: string | null;
  pdfAttachmentBase64?: string | null;
  pdfFileName?: string | null;
}

/**
 * Verified official airline web check-in links
 */
export const AIRLINE_CHECKIN_LINKS: Record<string, { name: string; url: string; guidance?: string }> = {
  '6E': { name: 'IndiGo', url: 'https://www.goindigo.in/web-checkin.html', guidance: 'Check-in opens 48 hours before departure for domestic flights.' },
  'AI': { name: 'Air India', url: 'https://www.airindia.com/in/en/manage/web-check-in.html', guidance: 'Check-in opens 48 hours prior to departure.' },
  'EK': { name: 'Emirates', url: 'https://www.emirates.com/english/manage-booking/online-check-in/', guidance: 'Online check-in opens 48 hours before departure.' },
  'QP': { name: 'Akasa Air', url: 'https://www.akasaair.com/check-in', guidance: 'Online check-in opens 48 hours prior to domestic departure.' },
  'SG': { name: 'SpiceJet', url: 'https://www.spicejet.com/webcheckin', guidance: 'Web check-in opens 48 hours prior to departure.' },
  'QR': { name: 'Qatar Airways', url: 'https://www.qatarairways.com/en/check-in.html', guidance: 'Online check-in opens 48 hours prior to departure.' },
  'EY': { name: 'Etihad Airways', url: 'https://www.etihad.com/en/manage/check-in', guidance: 'Check-in opens 30 hours prior to departure.' },
  'FZ': { name: 'Flydubai', url: 'https://www.flydubai.com/en/flying-with-us/check-in/online-check-in', guidance: 'Online check-in opens 48 hours before departure.' },
};

export function getAirlineCheckinInfo(airlineNameOrCode?: string | null): { name: string; url: string; guidance?: string } | null {
  if (!airlineNameOrCode) return null;
  const q = airlineNameOrCode.trim().toLowerCase();
  for (const [code, info] of Object.entries(AIRLINE_CHECKIN_LINKS)) {
    if (code.toLowerCase() === q || info.name.toLowerCase().includes(q) || q.includes(info.name.toLowerCase())) {
      return info;
    }
  }
  return null;
}

/**
 * Format departure time in IST
 */
function formatDepartureDateTime(dt?: Date | null): { date: string; time: string; full: string } {
  if (!dt) {
    return { date: 'Confirmed Date', time: 'As Scheduled', full: 'As per booking confirmation' };
  }
  const date = dt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
  const time = dt.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  });
  return { date, time: `${time} IST`, full: `${date}, ${time} IST` };
}

// ======================================================================
// 1. BRANDED TICKET CONFIRMATION HTML EMAIL
// ======================================================================
export function buildTicketConfirmationEmailHtml(details: TicketFlightDetails): string {
  const {
    passengerName,
    pnr,
    airline = 'Confirmed Airline',
    flightNumber = 'Scheduled Flight',
    origin = 'Departure City',
    destination = 'Arrival City',
    departureDateTime,
    airlineTicketNumber,
    travelRoute,
    pdfDownloadUrl,
  } = details;

  const dep = formatDepartureDateTime(departureDateTime);
  const waPrefill = encodeURIComponent(
    `Hello Varni Holidays Anand! I have an issued ticket for PNR ${pnr} (${passengerName}). Could you please assist me with my travel details?`
  );
  const waUrl = `https://wa.me/${COMPANY_CONTACT.whatsapp.canonical}?text=${waPrefill}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Your Flight Ticket is Confirmed! — PNR ${pnr} — Varni Holidays</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F8FAFC; color: #1E293B; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-padding { padding: 24px 18px !important; }
      .flight-grid { display: block !important; width: 100% !important; }
      .flight-col { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F8FAFC; color: #1E293B;">
  <center style="width: 100%; padding: 0 12px;">
    <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(21, 54, 80, 0.08);" border="0" cellspacing="0" cellpadding="0">
      
      <!-- Golden/Orange Travel Hero Banner -->
      <tr>
        <td style="background: linear-gradient(135deg, #153650 0%, #1E4565 50%, #D97706 100%); padding: 32px 32px 28px 32px; text-align: center;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <div style="background-color: #FFFFFF; border-radius: 8px; padding: 8px 20px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.15); margin-bottom: 14px;">
                  <img src="https://varni-holidays.vercel.app/logo.webp" alt="Varni Holidays" height="40" style="height: 40px; width: auto; max-width: 180px; display: block; border: 0;" />
                </div>
                <div style="color: #FEF3C7; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 6px;">
                  Official Flight Confirmation Desk
                </div>
                <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 0.3px;">
                  Your Journey Begins With Us!
                </h1>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Content Card -->
      <tr>
        <td class="content-padding" style="padding: 32px 36px 28px 36px;">
          <p style="font-size: 15px; margin: 0 0 16px 0; color: #0F172A;">
            Dear <strong>${passengerName}</strong>,
          </p>

          <p style="font-size: 14px; line-height: 1.65; color: #475569; margin: 0 0 20px 0;">
            Thank you for choosing <strong>Varni Holidays</strong>! We are pleased to confirm that your flight ticket has been successfully issued. ${
              details.pdfAttachmentBase64 ? 'Your official e-ticket is attached to this email.' : 'Please review your booking details below.'
            } Please review your travel details carefully and keep a copy accessible throughout your journey.
          </p>

          <!-- Flight Itinerary Card -->
          <table role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; margin: 0 0 24px 0; overflow: hidden;" border="0" cellspacing="0" cellpadding="0">
            
            <!-- Route Header -->
            <tr>
              <td style="background-color: #153650; padding: 14px 20px; color: #FFFFFF;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #FCD34D; font-weight: 700; display: block;">Itinerary Route</span>
                      <span style="font-size: 16px; font-weight: 800; color: #FFFFFF;">${origin} ✈ ${destination}</span>
                      ${travelRoute && travelRoute !== `${origin} - ${destination}` ? `<span style="font-size: 11px; color: #CBD5E1; display: block; margin-top: 2px;">Via ${travelRoute}</span>` : ''}
                    </td>
                    <td align="right">
                      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #FCD34D; font-weight: 700; display: block;">PNR Reference</span>
                      <span style="font-size: 16px; font-weight: 800; font-family: monospace; color: #FFFFFF; background-color: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 4px; display: inline-block;">${pnr}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Details Table -->
            <tr>
              <td style="padding: 18px 20px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="6">
                  <tr>
                    <td width="35%" style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Passenger:</td>
                    <td style="font-size: 13px; font-weight: 700; color: #0F172A;">${passengerName}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Airline:</td>
                    <td style="font-size: 13px; font-weight: 600; color: #0F172A;">${airline}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Flight Number:</td>
                    <td style="font-size: 13px; font-weight: 700; font-family: monospace; color: #D97706;">${flightNumber}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Departure Date:</td>
                    <td style="font-size: 13px; font-weight: 700; color: #153650;">${dep.date}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Departure Time:</td>
                    <td style="font-size: 13px; font-weight: 700; color: #153650;">${dep.time}</td>
                  </tr>
                  ${airlineTicketNumber ? `
                  <tr>
                    <td style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Ticket Number:</td>
                    <td style="font-size: 12px; font-family: monospace; font-weight: 700; color: #16A34A;">${airlineTicketNumber}</td>
                  </tr>` : ''}
                </table>
              </td>
            </tr>

            ${pdfDownloadUrl ? `
            <!-- Secure Download Link Bar -->
            <tr>
              <td style="background-color: #FEF3C7; border-top: 1px solid #FDE68A; padding: 12px 20px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="font-size: 12px; font-weight: 700; color: #92400E;">E-Ticket Document Ready</span>
                      <p style="font-size: 11px; color: #B45309; margin: 2px 0 0 0;">Download your confirmed ticket directly to your mobile device or print a copy.</p>
                    </td>
                    <td align="right">
                      <a href="${pdfDownloadUrl}" target="_blank" style="background-color: #D97706; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 6px; display: inline-block;">
                        Download Ticket PDF &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>` : ''}

          </table>

          <!-- Important Airport Travel Notes -->
          <div style="background-color: #F8FAFC; border-left: 4px solid #153650; padding: 14px 18px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
            <p style="font-size: 12px; font-weight: 700; color: #153650; margin: 0 0 4px 0;">Essential Travel Reminders:</p>
            <ul style="font-size: 12px; color: #475569; margin: 0; padding-left: 18px; line-height: 1.6;">
              <li>Carry a valid government-issued photo ID (Aadhaar / Passport / Driving Licence).</li>
              <li>For international travel, ensure your passport has at least 6 months validity.</li>
              <li>Report at the airport at least 2 hours prior for domestic, and 3 hours prior for international flights.</li>
            </ul>
          </div>

          <!-- WhatsApp Assistance CTA -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding: 10px 0 24px 0;">
                <a href="${waUrl}" target="_blank" style="background-color: #25D366; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 800; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);">
                  💬 Chat With Varni Holidays
                </a>
                <span style="display: block; font-size: 11px; color: #64748B; margin-top: 8px;">
                  Official Anand HQ Helpline & WhatsApp: ${COMPANY_CONTACT.phone.display}
                </span>
              </td>
            </tr>
          </table>

          <!-- Warm Closing -->
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 6px 0;">
            Thank you for choosing <strong>Varni Holidays</strong>.
          </p>
          <p style="font-size: 14px; font-weight: 700; color: #153650; margin: 0 0 16px 0;">
            Have a safe and wonderful journey!
          </p>
          <p style="font-size: 12px; color: #94A3B8; margin: 0;">
            <strong>Varni Holidays</strong><br>
            <em>Your Gateway to Joyful Holidays.</em>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 36px; text-align: center;">
          <p style="font-size: 11px; color: #64748B; margin: 0 0 6px 0; font-weight: 600;">
            Varni Holidays Private Limited • Central Operations & Ticketing Desk
          </p>
          <p style="font-size: 11px; color: #94A3B8; margin: 0; line-height: 1.4;">
            317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Anand, Gujarat 388120<br>
            Helpline: ${COMPANY_CONTACT.phone.display} • Email: contact@varnitours.com
          </p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
  `.trim();
}

// ======================================================================
// 2. BRANDED 24-HOUR DEPARTURE REMINDER HTML EMAIL
// ======================================================================
export function buildDepartureReminderEmailHtml(details: TicketFlightDetails): string {
  const {
    passengerName,
    pnr,
    airline = 'Confirmed Airline',
    flightNumber = 'Scheduled Flight',
    origin = 'Departure City',
    destination = 'Arrival City',
    departureDateTime,
    airlineTicketNumber,
    pdfDownloadUrl,
  } = details;

  const dep = formatDepartureDateTime(departureDateTime);
  const airlineCheckin = getAirlineCheckinInfo(airline);

  const waPrefill = encodeURIComponent(
    `Hello Varni Holidays! My flight ${flightNumber} (PNR: ${pnr}) is scheduled for tomorrow. Could you please confirm flight status or assist me?`
  );
  const waUrl = `https://wa.me/${COMPANY_CONTACT.whatsapp.canonical}?text=${waPrefill}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Your Flight Is Almost Here! — 24h Departure Reminder — Varni Holidays</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F8FAFC; color: #1E293B; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content-padding { padding: 24px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F8FAFC; color: #1E293B;">
  <center style="width: 100%; padding: 0 12px;">
    <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(21, 54, 80, 0.08);" border="0" cellspacing="0" cellpadding="0">
      
      <!-- Golden/Amber Departure Header Banner -->
      <tr>
        <td style="background: linear-gradient(135deg, #B45309 0%, #D97706 60%, #153650 100%); padding: 32px 32px 28px 32px; text-align: center;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <div style="background-color: #FFFFFF; border-radius: 8px; padding: 8px 20px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.15); margin-bottom: 14px;">
                  <img src="https://varni-holidays.vercel.app/logo.webp" alt="Varni Holidays" height="40" style="height: 40px; width: auto; max-width: 180px; display: block; border: 0;" />
                </div>
                <div style="color: #FEF3C7; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 6px;">
                  24-Hour Passenger Travel Care
                </div>
                <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 0.3px;">
                  Your Flight Is Almost Here!
                </h1>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Body -->
      <tr>
        <td class="content-padding" style="padding: 32px 36px 28px 36px;">
          <p style="font-size: 15px; margin: 0 0 16px 0; color: #0F172A;">
            Dear <strong>${passengerName}</strong>,
          </p>

          <p style="font-size: 14px; line-height: 1.65; color: #475569; margin: 0 0 20px 0;">
            Your flight is scheduled for tomorrow! We hope you're excited about your upcoming journey. Before heading to the airport, here are a few important things to remember.
          </p>

          <!-- Flight Snapshot -->
          <table role="presentation" width="100%" style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; margin: 0 0 24px 0; padding: 16px 20px;" border="0" cellspacing="0" cellpadding="4">
            <tr>
              <td width="35%" style="font-size: 11px; text-transform: uppercase; color: #92400E; font-weight: 700;">Routing:</td>
              <td style="font-size: 14px; font-weight: 800; color: #78350F;">${origin} ✈ ${destination}</td>
            </tr>
            <tr>
              <td style="font-size: 11px; text-transform: uppercase; color: #92400E; font-weight: 700;">Flight / Airline:</td>
              <td style="font-size: 13px; font-weight: 700; color: #78350F;">${flightNumber} (${airline})</td>
            </tr>
            <tr>
              <td style="font-size: 11px; text-transform: uppercase; color: #92400E; font-weight: 700;">Departure Date & Time:</td>
              <td style="font-size: 13px; font-weight: 800; color: #153650;">${dep.full}</td>
            </tr>
            <tr>
              <td style="font-size: 11px; text-transform: uppercase; color: #92400E; font-weight: 700;">PNR / Booking Ref:</td>
              <td style="font-size: 13px; font-family: monospace; font-weight: 800; color: #153650;">${pnr}</td>
            </tr>
          </table>

          <!-- Web Check-in Callout -->
          ${airlineCheckin ? `
          <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <span style="font-size: 11px; text-transform: uppercase; color: #1E40AF; font-weight: 700; letter-spacing: 0.5px; display: block;">Official Airline Web Check-in</span>
                  <p style="font-size: 12px; color: #1E3A8A; margin: 4px 0 0 0; line-height: 1.5;">
                    ${airlineCheckin.name} web check-in is available. ${airlineCheckin.guidance || ''}
                  </p>
                </td>
                <td align="right" style="padding-left: 12px;">
                  <a href="${airlineCheckin.url}" target="_blank" style="background-color: #1D4ED8; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; padding: 9px 18px; border-radius: 6px; display: inline-block; white-space: nowrap;">
                    Web Check-In &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </div>` : ''}

          <!-- Travel Checklist -->
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px 22px; margin-bottom: 24px;">
            <p style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #153650; margin: 0 0 12px 0;">
              ✓ Pre-Departure Checklist
            </p>
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="5">
              <tr>
                <td width="24" valign="top" style="font-size: 14px; color: #16A34A; font-weight: 700;">1.</td>
                <td style="font-size: 12px; color: #334155; line-height: 1.5;"><strong>Airline Web Check-in:</strong> Complete check-in online when available to select your preferred seats and obtain digital boarding passes.</td>
              </tr>
              <tr>
                <td valign="top" style="font-size: 14px; color: #16A34A; font-weight: 700;">2.</td>
                <td style="font-size: 12px; color: #334155; line-height: 1.5;"><strong>Valid Identification:</strong> Keep your official government ID (Aadhaar / Voter ID / Passport) ready. Ensure original physical documents are carried.</td>
              </tr>
              <tr>
                <td valign="top" style="font-size: 14px; color: #16A34A; font-weight: 700;">3.</td>
                <td style="font-size: 12px; color: #334155; line-height: 1.5;"><strong>Baggage Compliance:</strong> Verify checked and cabin baggage allowances specified on your ticket. Ensure power banks and spare batteries are packed in cabin baggage only.</td>
              </tr>
              <tr>
                <td valign="top" style="font-size: 14px; color: #16A34A; font-weight: 700;">4.</td>
                <td style="font-size: 12px; color: #334155; line-height: 1.5;"><strong>Airport Reporting Time:</strong> Allow sufficient transit time. Arrive at least <strong>2 hours prior</strong> for domestic departures and <strong>3 to 4 hours prior</strong> for international flights.</td>
              </tr>
              <tr>
                <td valign="top" style="font-size: 14px; color: #16A34A; font-weight: 700;">5.</td>
                <td style="font-size: 12px; color: #334155; line-height: 1.5;"><strong>Terminal & Flight Status:</strong> Double-check your departure terminal at the airport entrance and monitor live airline status before leaving home.</td>
              </tr>
              <tr>
                <td valign="top" style="font-size: 14px; color: #16A34A; font-weight: 700;">6.</td>
                <td style="font-size: 12px; color: #334155; line-height: 1.5;"><strong>Passport & Visa (International):</strong> Ensure passport validity of at least 6 months, relevant transit/tourist visas, and hotel vouchers are accessible.</td>
              </tr>
            </table>
          </div>

          ${pdfDownloadUrl ? `
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${pdfDownloadUrl}" target="_blank" style="background-color: #153650; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 13px; font-weight: 700; display: inline-block;">
              Download E-Ticket PDF
            </a>
          </div>` : ''}

          <!-- WhatsApp Assistance CTA -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding: 10px 0 24px 0;">
                <a href="${waUrl}" target="_blank" style="background-color: #25D366; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 800; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);">
                  💬 Need Assistance? WhatsApp Us
                </a>
                <span style="display: block; font-size: 11px; color: #64748B; margin-top: 8px;">
                  Official Varni Holidays Desk: ${COMPANY_CONTACT.phone.display}
                </span>
              </td>
            </tr>
          </table>

          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 6px 0;">
            Thank you for choosing <strong>Varni Holidays</strong>.
          </p>
          <p style="font-size: 14px; font-weight: 700; color: #153650; margin: 0 0 16px 0;">
            Have a safe, comfortable and memorable journey!
          </p>
          <p style="font-size: 12px; color: #94A3B8; margin: 0;">
            <strong>Varni Holidays</strong><br>
            <em>Your Gateway to Joyful Holidays.</em>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 36px; text-align: center;">
          <p style="font-size: 11px; color: #64748B; margin: 0 0 6px 0; font-weight: 600;">
            Varni Holidays Private Limited • Central Operations & Ticketing Desk
          </p>
          <p style="font-size: 11px; color: #94A3B8; margin: 0; line-height: 1.4;">
            317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Anand, Gujarat 388120<br>
            Helpline: ${COMPANY_CONTACT.phone.display} • Email: contact@varnitours.com
          </p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>
  `.trim();
}

// ======================================================================
// 3. WHATSAPP MESSAGE TEXT GENERATORS
// ======================================================================
export function buildTicketConfirmationWhatsAppText(details: TicketFlightDetails): string {
  const {
    passengerName,
    pnr,
    airline = 'Confirmed Airline',
    flightNumber = 'Flight',
    origin = 'Departure',
    destination = 'Arrival',
    departureDateTime,
    airlineTicketNumber,
    pdfDownloadUrl,
  } = details;

  const dep = formatDepartureDateTime(departureDateTime);

  let text = `✈️ *VARNI HOLIDAYS — FLIGHT TICKET CONFIRMATION*\n\n`;
  text += `Dear *${passengerName}*,\n\n`;
  text += `Your flight ticket has been *successfully issued*! Here are your confirmed travel details:\n\n`;
  text += `📍 *Route:* ${origin} ✈️ ${destination}\n`;
  text += `🎫 *PNR:* ${pnr}\n`;
  text += `🛫 *Flight:* ${flightNumber} (${airline})\n`;
  text += `📅 *Departure:* ${dep.full}\n`;
  if (airlineTicketNumber) {
    text += `🎟️ *Ticket #:* ${airlineTicketNumber}\n`;
  }
  if (pdfDownloadUrl) {
    text += `\n📥 *Download E-Ticket PDF:* ${pdfDownloadUrl}\n`;
  }
  text += `\n⚠️ *Important Notice:* Please carry your valid original government ID / Passport and report at the airport 2-3 hours prior to departure.\n\n`;
  text += `For any assistance, reply directly to this chat or call our Anand HQ Helpline at *${COMPANY_CONTACT.phone.display}*.\n\n`;
  text += `_Have a safe and wonderful journey!_\n*Varni Holidays* — _Your Gateway to Joyful Holidays._`;

  return text;
}

export function buildDepartureReminderWhatsAppText(details: TicketFlightDetails): string {
  const {
    passengerName,
    pnr,
    airline = 'Confirmed Airline',
    flightNumber = 'Flight',
    origin = 'Departure',
    destination = 'Arrival',
    departureDateTime,
    pdfDownloadUrl,
  } = details;

  const dep = formatDepartureDateTime(departureDateTime);
  const airlineCheckin = getAirlineCheckinInfo(airline);

  let text = `🔔 *VARNI HOLIDAYS — 24-HOUR DEPARTURE REMINDER*\n\n`;
  text += `Dear *${passengerName}*,\n\n`;
  text += `Your flight is scheduled for *tomorrow*! We hope you are excited about your journey.\n\n`;
  text += `📍 *Route:* ${origin} ✈️ ${destination}\n`;
  text += `🎫 *PNR:* ${pnr}\n`;
  text += `🛫 *Flight:* ${flightNumber} (${airline})\n`;
  text += `⏰ *Departure:* ${dep.full}\n\n`;

  if (airlineCheckin) {
    text += `📲 *Airline Web Check-in:* ${airlineCheckin.url}\n\n`;
  }

  text += `📋 *Quick Pre-Departure Checklist:*\n`;
  text += `1. Complete airline web check-in online.\n`;
  text += `2. Keep physical original ID / Passport & Visa ready.\n`;
  text += `3. Verify departure terminal & baggage allowances.\n`;
  text += `4. Reach airport 2 hrs (domestic) / 3-4 hrs (international) prior.\n\n`;

  if (pdfDownloadUrl) {
    text += `📥 *E-Ticket PDF:* ${pdfDownloadUrl}\n\n`;
  }

  text += `Need assistance? Contact our 24x7 Anand Desk at *${COMPANY_CONTACT.phone.display}*.\n\n`;
  text += `_Wishing you a smooth and pleasant journey!_\n*Varni Holidays*`;

  return text;
}

// ======================================================================
// 4. DISPATCH CONTROLLERS WITH INDEPENDENT TRACKING
// ======================================================================

/**
 * Dispatches ticket confirmation via Email and/or WhatsApp
 * Ensures independent failure isolation and creates PassengerNotification records
 */
export async function dispatchTicketConfirmation(params: {
  flightHoldId: string;
  customerId?: string | null;
  details: TicketFlightDetails;
  sendEmail: boolean;
  sendWhatsApp: boolean;
}): Promise<{
  emailDispatched: boolean;
  whatsAppDispatched: boolean;
  emailError?: string;
  whatsAppError?: string;
}> {
  const { flightHoldId, customerId, details, sendEmail, sendWhatsApp } = params;
  let emailDispatched = false;
  let whatsAppDispatched = false;
  let emailError: string | undefined;
  let whatsAppError: string | undefined;

  // 1. Email Dispatch
  if (sendEmail && details.passengerEmail && details.passengerEmail.includes('@')) {
    try {
      const emailHtml = buildTicketConfirmationEmailHtml(details);
      const attachments = details.pdfAttachmentBase64 && details.pdfFileName
        ? [{ filename: details.pdfFileName, content: details.pdfAttachmentBase64 }]
        : undefined;

      const emailResult = await sendCustomerEmail({
        to: details.passengerEmail.trim().toLowerCase(),
        toName: details.passengerName,
        subject: `Your Flight Ticket is Confirmed! — PNR: ${details.pnr} — Varni Holidays`,
        customHtml: emailHtml,
        attachments,
      });

      emailDispatched = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error || 'Resend API rejected email dispatch';
      }

      // Record in PassengerNotification
      await prisma.passengerNotification.create({
        data: {
          flightHoldId,
          customerId: customerId || null,
          type: 'TICKET_CONFIRMATION',
          channel: 'EMAIL',
          recipientEmail: details.passengerEmail.trim().toLowerCase(),
          recipientPhone: details.passengerPhone || null,
          recipientName: details.passengerName,
          status: emailResult.success ? 'SENT' : 'FAILED',
          scheduledFor: new Date(),
          sentAt: emailResult.success ? new Date() : null,
          failedAt: emailResult.success ? null : new Date(),
          failureReason: emailError || null,
          providerName: 'RESEND',
          providerMessageId: emailResult.messageId || null,
          metadata: {
            pnr: details.pnr,
            hasPdfAttachment: Boolean(attachments && attachments.length > 0),
          },
        },
      });
    } catch (err: any) {
      console.error('[dispatchTicketConfirmation Email Error]:', err);
      emailError = err.message || 'Exception during email dispatch';
      await prisma.passengerNotification.create({
        data: {
          flightHoldId,
          customerId: customerId || null,
          type: 'TICKET_CONFIRMATION',
          channel: 'EMAIL',
          recipientEmail: details.passengerEmail.trim().toLowerCase(),
          recipientPhone: details.passengerPhone || null,
          recipientName: details.passengerName,
          status: 'FAILED',
          scheduledFor: new Date(),
          failedAt: new Date(),
          failureReason: emailError,
          providerName: 'RESEND',
        },
      }).catch(() => {});
    }
  }

  // 2. WhatsApp Dispatch
  if (sendWhatsApp && details.passengerPhone && details.passengerPhone.trim().length >= 7) {
    try {
      const waText = buildTicketConfirmationWhatsAppText(details);
      const waResult = await sendCustomerWhatsApp({
        phoneNumber: details.passengerPhone,
        recipientName: details.passengerName,
        category: 'FLIGHT_CONFIRMED',
        messageText: waText,
      });

      whatsAppDispatched = waResult.success;
      if (!waResult.success) {
        whatsAppError = waResult.error || 'WhatsApp API dispatch failed';
      }

      await prisma.passengerNotification.create({
        data: {
          flightHoldId,
          customerId: customerId || null,
          type: 'TICKET_CONFIRMATION',
          channel: 'WHATSAPP',
          recipientEmail: details.passengerEmail || null,
          recipientPhone: details.passengerPhone,
          recipientName: details.passengerName,
          status: waResult.success ? (waResult.deliveryStatus === 'PROVIDER_ACCEPTED' ? 'SENT' : 'DELIVERED') : 'FAILED',
          scheduledFor: new Date(),
          sentAt: waResult.success ? new Date() : null,
          failedAt: waResult.success ? null : new Date(),
          failureReason: whatsAppError || null,
          providerName: waResult.deliveryStatus === 'CLICK_TO_CHAT_TRIGGERED' ? 'CLICK_TO_CHAT' : 'META_WHATSAPP',
          providerMessageId: waResult.messageId || null,
          metadata: {
            pnr: details.pnr,
            clickToChatUrl: waResult.clickToChatUrl || null,
          },
        },
      });
    } catch (err: any) {
      console.error('[dispatchTicketConfirmation WhatsApp Error]:', err);
      whatsAppError = err.message || 'Exception during WhatsApp dispatch';
      await prisma.passengerNotification.create({
        data: {
          flightHoldId,
          customerId: customerId || null,
          type: 'TICKET_CONFIRMATION',
          channel: 'WHATSAPP',
          recipientEmail: details.passengerEmail || null,
          recipientPhone: details.passengerPhone,
          recipientName: details.passengerName,
          status: 'FAILED',
          scheduledFor: new Date(),
          failedAt: new Date(),
          failureReason: whatsAppError,
          providerName: 'META_WHATSAPP',
        },
      }).catch(() => {});
    }
  }

  return {
    emailDispatched,
    whatsAppDispatched,
    emailError,
    whatsAppError,
  };
}

/**
 * Schedules a 24-hour passenger departure reminder
 */
export async function schedule24HourDepartureReminder(params: {
  flightHoldId: string;
  customerId?: string | null;
  passengerName: string;
  passengerEmail?: string | null;
  passengerPhone?: string | null;
  departureDateTime: Date;
}): Promise<{
  scheduled: boolean;
  scheduledFor?: Date;
  reason?: string;
}> {
  const { flightHoldId, customerId, passengerName, passengerEmail, passengerPhone, departureDateTime } = params;

  const now = new Date();
  const reminderTime = new Date(departureDateTime.getTime() - 24 * 60 * 60 * 1000);

  // If departure is already less than 24 hours away or in the past
  if (reminderTime.getTime() <= now.getTime()) {
    console.log(`[Departure Reminder]: Flight departs at ${departureDateTime.toISOString()}, less than 24 hours away. Skipping advance 24h reminder.`);
    return {
      scheduled: false,
      reason: 'Departure is less than 24 hours away or in the past. Advance 24-hour reminder not scheduled.',
    };
  }

  // Dismiss / Cancel any existing pending 24h departure reminders for this hold
  await prisma.passengerNotification.updateMany({
    where: {
      flightHoldId,
      type: 'DEPARTURE_REMINDER_24H',
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
      failureReason: 'Rescheduled by new ticket issuance or update',
    },
  });

  // Schedule Email reminder if email present
  if (passengerEmail && passengerEmail.includes('@')) {
    await prisma.passengerNotification.create({
      data: {
        flightHoldId,
        customerId: customerId || null,
        type: 'DEPARTURE_REMINDER_24H',
        channel: 'EMAIL',
        recipientEmail: passengerEmail.trim().toLowerCase(),
        recipientPhone: passengerPhone || null,
        recipientName: passengerName,
        status: 'PENDING',
        scheduledFor: reminderTime,
        providerName: 'RESEND',
      },
    });
  }

  // Schedule WhatsApp reminder if phone present
  if (passengerPhone && passengerPhone.trim().length >= 7) {
    await prisma.passengerNotification.create({
      data: {
        flightHoldId,
        customerId: customerId || null,
        type: 'DEPARTURE_REMINDER_24H',
        channel: 'WHATSAPP',
        recipientEmail: passengerEmail || null,
        recipientPhone: passengerPhone,
        recipientName: passengerName,
        status: 'PENDING',
        scheduledFor: reminderTime,
        providerName: 'META_WHATSAPP',
      },
    });
  }

  return {
    scheduled: true,
    scheduledFor: reminderTime,
  };
}
