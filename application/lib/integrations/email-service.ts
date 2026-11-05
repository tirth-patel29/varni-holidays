/**
 * VARNI HOLIDAYS - Customer Email Integration Service
 * Powered by Resend with Branded Responsive LIGHT HTML Templates
 * Color Palette:
 * - Outer Background: #F8F6F0
 * - Content Card: #FFFFFF
 * - Heading: #153650
 * - Body Text: #35475C
 * - Accent Gold: #E9B95E
 * - Secondary Background: #F1EEE5
 * - Subtle Borders: #E8E3D8
 */

import { UpdateCategory } from '../crm/types';
import { COMPANY_CONTACT } from '../config/contact';

export interface EmailSendOptions {
  to: string;
  toName: string;
  subject: string;
  category?: UpdateCategory;
  headline?: string;
  bodyHtml?: string;
  customHtml?: string;
  ctaText?: string;
  ctaUrl?: string;
  bookingRef?: string;
  quotationRef?: string;
  metadata?: Record<string, any>;
}

export interface EmailSendResult {
  success: boolean;
  messageId: string;
  providerStatus: 'PROVIDER_ACCEPTED' | 'SENT' | 'SIMULATED' | 'FAILED';
  recipient: string;
  subject: string;
  dispatchedAt: string;
  error?: string;
}

export interface EnquiryConfirmationParams {
  to: string;
  customerName: string;
  referenceId: string;
  serviceType: 'PACKAGE' | 'FLIGHT' | 'VISA' | 'CONTACT';
  details: {
    packageName?: string;
    hotelTier?: string;
    travelDates?: string;
    adultsCount?: number;
    childrenCount?: number;
    infantsCount?: number;
    roomsCount?: number;
    vehicleType?: string;
    totalEstimate?: number;
    originAirport?: string;
    destinationAirport?: string;
    tripType?: string;
    departureDate?: string;
    returnDate?: string | null;
    cabinClass?: string;
    destinationCountry?: string;
    visaCategory?: string;
    applicantCount?: number;
    stayDurationDays?: number | null;
    specialRequirements?: string | null;
    subject?: string;
    message?: string;
  };
}

/**
 * Standard Light-Themed Branded Email HTML Wrapper
 */
export function buildVarniEmailHtml(options: EmailSendOptions): string {
  const { toName, headline, bodyHtml, ctaText, ctaUrl, bookingRef, quotationRef } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${options.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #F8F6F0; color: #35475C; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    .email-container { max-width: 600px; width: 100%; margin: 30px auto; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; border: 1px solid #E8E3D8; box-shadow: 0 4px 20px rgba(21, 54, 80, 0.06); }
    .header-table { width: 100%; background-color: #FFFFFF; border-bottom: 2px solid #E9B95E; }
    .content-table { width: 100%; padding: 32px 32px 24px 32px; }
    .footer-table { width: 100%; background-color: #F1EEE5; border-top: 1px solid #E8E3D8; padding: 24px 32px; text-align: center; }
    @media only screen and (max-width: 620px) {
      .email-container { margin: 0 auto !important; border-radius: 0 !important; border: none !important; }
      .content-table { padding: 24px 18px !important; }
      .footer-table { padding: 20px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F0; color: #35475C;">
  <center style="width: 100%; background-color: #F8F6F0; padding: 20px 0;">
    <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; border: 1px solid #E8E3D8;">
      
      <!-- Brand Header -->
      <table class="header-table" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FFFFFF; border-bottom: 2px solid #E9B95E;">
        <tr>
          <td style="padding: 26px 32px;">
            <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #153650; margin: 0;">VARNI HOLIDAYS</div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #C28B2B; margin-top: 3px;">Anand, Gujarat • Bespoke Journeys & Hospitality</div>
          </td>
        </tr>
      </table>

      <!-- Main Content -->
      <table class="content-table" cellpadding="0" cellspacing="0" style="width: 100%; padding: 32px 32px 24px 32px;">
        <tr>
          <td style="font-size: 14px; line-height: 1.65; color: #35475C;">
            <div style="font-size: 15px; font-weight: 600; color: #153650; margin-bottom: 14px;">Dear ${toName},</div>
            
            ${headline ? `<h1 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #153650; margin: 0 0 16px 0; line-height: 1.35;">${headline}</h1>` : ''}

            ${bookingRef ? `
              <div style="background-color: #F1EEE5; border-left: 4px solid #E9B95E; border-radius: 0 8px 8px 0; padding: 12px 18px; margin-bottom: 20px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #C28B2B;">Booking Reference</span>
                <div style="font-family: monospace; font-size: 17px; font-weight: 800; color: #153650; margin-top: 2px;">${bookingRef}</div>
              </div>
            ` : ''}

            ${quotationRef ? `
              <div style="background-color: #F1EEE5; border-left: 4px solid #E9B95E; border-radius: 0 8px 8px 0; padding: 12px 18px; margin-bottom: 20px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #C28B2B;">Official Proposal Reference</span>
                <div style="font-family: monospace; font-size: 17px; font-weight: 800; color: #153650; margin-top: 2px;">${quotationRef}</div>
              </div>
            ` : ''}

            <div style="font-size: 14px; color: #35475C; line-height: 1.65;">
              ${bodyHtml || ''}
            </div>

            ${ctaText && ctaUrl ? `
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #153650; color: #FFFFFF !important; font-size: 13px; font-weight: 700; padding: 13px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(21, 54, 80, 0.15);">
                  ${ctaText}
                </a>
              </div>
            ` : ''}
          </td>
        </tr>
      </table>

      <!-- Branded Footer -->
      <table class="footer-table" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F1EEE5; border-top: 1px solid #E8E3D8; padding: 22px 32px; text-align: center;">
        <tr>
          <td style="font-size: 11px; color: #666E79; line-height: 1.6;">
            <div style="font-weight: 700; color: #153650; margin-bottom: 4px; font-size: 12px;">VARNI HOLIDAYS • ANAND HEADQUARTERS</div>
            <div>${COMPANY_CONTACT.address.full}</div>
            <div style="margin-top: 4px;">
              Phone: <a href="${COMPANY_CONTACT.phone.tel}" style="color: #153650; font-weight: 600; text-decoration: none;">${COMPANY_CONTACT.phone.display}</a> | 
              Email: <a href="${COMPANY_CONTACT.email.mailto}" style="color: #153650; font-weight: 600; text-decoration: none;">${COMPANY_CONTACT.email.primary}</a>
            </div>
            <div style="margin-top: 8px; color: #969CA5; font-size: 10px;">© ${new Date().getFullYear()} Varni Holidays. All rights reserved.</div>
          </td>
        </tr>
      </table>

    </div>
  </center>
</body>
</html>
  `.trim();
}

/**
 * Builds the instant acknowledgement email sent to customers when they submit an enquiry
 * Uses strict Light Theme palette (No pure black sections).
 */
export function buildEnquiryConfirmationEmailHtml(params: EnquiryConfirmationParams): string {
  const { customerName, referenceId, serviceType, details } = params;

  let serviceTitle = 'Tour Package Enquiry';
  let detailsRowsHtml = '';

  if (serviceType === 'PACKAGE') {
    serviceTitle = 'Kerala Holiday Package Enquiry';
    detailsRowsHtml = `
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8; width: 38%;">Package</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.packageName || 'Kerala 6N/7D Winter CPAI'}</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Hotel Tier</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.hotelTier || 'Deluxe'}</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Travelers</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.adultsCount || 2} Adults${details.childrenCount ? `, ${details.childrenCount} Children` : ''}</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Rooms</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.roomsCount || 1} Room(s)</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Dedicated Vehicle</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.vehicleType || 'AC Sedan (Dzire / Etios)'}</td></tr>
      ${details.travelDates ? `<tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Travel Date</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.travelDates}</td></tr>` : ''}
      ${details.totalEstimate ? `<tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Initial Estimate</td><td style="padding: 9px 12px; color: #16A34A; font-weight: 700; font-size: 14px; border-bottom: 1px solid #E8E3D8;">₹${details.totalEstimate.toLocaleString('en-IN')} (All Taxes Incl.)</td></tr>` : ''}
    `;
  } else if (serviceType === 'FLIGHT') {
    serviceTitle = 'Flight Booking Enquiry';
    detailsRowsHtml = `
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8; width: 38%;">Routing</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.originAirport} ✈ ${details.destinationAirport}</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Trip Type</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.tripType || 'One Way'}</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Departure Date</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.departureDate}</td></tr>
      ${details.returnDate ? `<tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Return Date</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.returnDate}</td></tr>` : ''}
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Passengers</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.adultsCount || 1} Adult(s)${details.childrenCount ? `, ${details.childrenCount} Child` : ''}${details.infantsCount ? `, ${details.infantsCount} Infant` : ''}</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Cabin Class</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.cabinClass || 'Economy'}</td></tr>
    `;
  } else if (serviceType === 'VISA') {
    serviceTitle = 'Visa Assistance Enquiry';
    detailsRowsHtml = `
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8; width: 38%;">Country</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.destinationCountry}</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Visa Type</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.visaCategory || 'Tourist'} Visa</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Applicants</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.applicantCount || 1} Person(s)</td></tr>
      ${details.departureDate ? `<tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Planned Travel</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.departureDate}</td></tr>` : ''}
      ${details.stayDurationDays ? `<tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Duration</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.stayDurationDays} Days</td></tr>` : ''}
    `;
  } else if (serviceType === 'CONTACT') {
    serviceTitle = 'General Enquiry / Office Consultation';
    detailsRowsHtml = `
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8; width: 38%;">Subject</td><td style="padding: 9px 12px; color: #153650; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.subject || 'Travel Enquiry'}</td></tr>
      <tr><td style="padding: 9px 12px; color: #666E79; font-size: 13px; border-bottom: 1px solid #E8E3D8;">Message</td><td style="padding: 9px 12px; color: #153650; font-size: 13px; border-bottom: 1px solid #E8E3D8;">${details.message || 'Consultation request'}</td></tr>
    `;
  }

  const waMessage = encodeURIComponent(
    `Hello Varni Holidays Anand! I submitted an enquiry for ${serviceTitle}. My Reference ID is ${referenceId}. Could you please assist me with the status and next steps?`
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Thank You for Your Enquiry – Varni Holidays</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F8F6F0; color: #35475C; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 600px; width: 100%; margin: 30px auto; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; border: 1px solid #E8E3D8; box-shadow: 0 4px 20px rgba(21, 54, 80, 0.06); }
    .content-table { width: 100%; padding: 32px 32px 24px 32px; }
    .footer-table { width: 100%; background-color: #F1EEE5; border-top: 1px solid #E8E3D8; padding: 22px 32px; text-align: center; }
    @media only screen and (max-width: 620px) {
      .email-container { margin: 0 auto !important; border-radius: 0 !important; border: none !important; }
      .content-table { padding: 24px 18px !important; }
      .footer-table { padding: 20px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F0; color: #35475C;">
  <center style="width: 100%; background-color: #F8F6F0; padding: 20px 0;">
    <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; border: 1px solid #E8E3D8;">
      
      <!-- Brand Header (Light Theme) -->
      <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FFFFFF; border-bottom: 2px solid #E9B95E;">
        <tr>
          <td style="padding: 26px 32px;">
            <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #153650; margin: 0;">VARNI HOLIDAYS</div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #C28B2B; margin-top: 3px;">Anand, Gujarat • Bespoke Journeys & Hospitality</div>
          </td>
        </tr>
      </table>

      <!-- Main Body -->
      <table class="content-table" cellpadding="0" cellspacing="0" style="width: 100%; padding: 32px 32px 24px 32px;">
        <tr>
          <td style="font-size: 14px; line-height: 1.65; color: #35475C;">
            <div style="font-size: 15px; font-weight: 600; color: #153650; margin-bottom: 12px;">Dear ${customerName},</div>

            <h1 style="font-family: Georgia, serif; font-size: 21px; font-weight: 700; color: #153650; margin: 0 0 14px 0; line-height: 1.35;">
              Thank You for Choosing Varni Holidays!
            </h1>

            <p style="margin: 0 0 20px 0; font-size: 14px; color: #35475C; line-height: 1.65;">
              We have received your enquiry for <strong>${serviceTitle}</strong>. Our dedicated travel desk in Anand is already reviewing your details to ensure the highest standards of comfort, transparency, and value.
            </p>

            <!-- Reference ID Highlight Pill -->
            <div style="background-color: #F1EEE5; border: 1px solid #E8E3D8; border-left: 4px solid #E9B95E; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
              <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #C28B2B;">Your Official Reference ID</span>
              <div style="font-family: monospace; font-size: 18px; font-weight: 800; color: #153650; margin-top: 4px; letter-spacing: 0.5px;">${referenceId}</div>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #666E79;">Please quote this reference ID for all upcoming inquiries or communication.</p>
            </div>

            <!-- Itemized Summary Table -->
            <div style="background-color: #FFFFFF; border: 1px solid #E8E3D8; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
              <div style="background-color: #F1EEE5; padding: 10px 14px; font-size: 12px; font-weight: 700; color: #153650; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E8E3D8;">
                Summary of Your Request
              </div>
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <tbody>
                  ${detailsRowsHtml}
                </tbody>
              </table>
            </div>

            <!-- What Happens Next -->
            <div style="background-color: #F4FAF7; border: 1px solid #D1EAD9; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
              <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px;">What Happens Next?</div>
              <p style="font-size: 13px; color: #2D6A4F; margin: 0; line-height: 1.55;">
                Our destination specialist is personally reviewing your requirements. We will contact you shortly via <strong>Phone</strong> or <strong>WhatsApp</strong> to discuss custom flight timings, hotel choices, or visa document checklists.
              </p>
            </div>

            <!-- CTA WhatsApp Button -->
            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="${COMPANY_CONTACT.whatsapp.url}?text=${waMessage}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF !important; font-size: 13px; font-weight: 700; padding: 13px 26px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);">
                Chat Directly on WhatsApp (${COMPANY_CONTACT.whatsapp.display})
              </a>
            </div>

            <!-- Contact Details Block -->
            <div style="border-top: 1px solid #E8E3D8; padding-top: 18px; margin-top: 24px; font-size: 12px; color: #666E79; line-height: 1.6;">
              <strong style="color: #153650; display: block; margin-bottom: 4px;">Need Immediate Assistance?</strong>
              <div>📍 <strong>Head Office:</strong> ${COMPANY_CONTACT.address.full}</div>
              <div>📞 <strong>Phone:</strong> <a href="${COMPANY_CONTACT.phone.tel}" style="color: #153650; text-decoration: none; font-weight: 600;">${COMPANY_CONTACT.phone.display}</a></div>
              <div>✉️ <strong>Email:</strong> <a href="${COMPANY_CONTACT.email.mailto}" style="color: #153650; text-decoration: none; font-weight: 600;">${COMPANY_CONTACT.email.primary}</a></div>
              <div>⏰ <strong>Office Hours:</strong> ${COMPANY_CONTACT.hours.detailed}</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Footer (Light Theme) -->
      <table class="footer-table" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F1EEE5; border-top: 1px solid #E8E3D8; padding: 22px 32px; text-align: center;">
        <tr>
          <td style="font-size: 11px; color: #666E79; line-height: 1.6;">
            <div style="font-weight: 700; color: #153650; margin-bottom: 4px;">VARNI HOLIDAYS • ANAND</div>
            <div>Bespoke Tours • Worldwide Flights • Express Visa Assistance • Luxury Hotels</div>
            <div style="margin-top: 8px; color: #969CA5; font-size: 10px;">© ${new Date().getFullYear()} Varni Holidays. All rights reserved.</div>
          </td>
        </tr>
      </table>

    </div>
  </center>
</body>
</html>
  `.trim();
}

/**
 * Newsletter Welcome Email Template (Light Theme)
 */
export function buildNewsletterWelcomeEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Welcome to Varni Travel Gazette!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F8F6F0; color: #35475C; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 600px; width: 100%; margin: 30px auto; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; border: 1px solid #E8E3D8; box-shadow: 0 4px 20px rgba(21, 54, 80, 0.06); }
    .content-table { width: 100%; padding: 32px 32px 24px 32px; }
    .footer-table { width: 100%; background-color: #F1EEE5; border-top: 1px solid #E8E3D8; padding: 22px 32px; text-align: center; }
    @media only screen and (max-width: 620px) {
      .email-container { margin: 0 auto !important; border-radius: 0 !important; border: none !important; }
      .content-table { padding: 24px 18px !important; }
      .footer-table { padding: 20px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F0; color: #35475C;">
  <center style="width: 100%; background-color: #F8F6F0; padding: 20px 0;">
    <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; border: 1px solid #E8E3D8;">
      
      <!-- Brand Header -->
      <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #FFFFFF; border-bottom: 2px solid #E9B95E;">
        <tr>
          <td style="padding: 26px 32px;">
            <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #153650; margin: 0;">VARNI HOLIDAYS</div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #C28B2B; margin-top: 3px;">Varni Travel Gazette • Anand, Gujarat</div>
          </td>
        </tr>
      </table>

      <!-- Main Body -->
      <table class="content-table" cellpadding="0" cellspacing="0" style="width: 100%; padding: 32px 32px 24px 32px;">
        <tr>
          <td style="font-size: 14px; line-height: 1.65; color: #35475C;">
            <div style="font-size: 15px; font-weight: 600; color: #153650; margin-bottom: 12px;">Namaste Traveler,</div>

            <h1 style="font-family: Georgia, serif; font-size: 21px; font-weight: 700; color: #153650; margin: 0 0 14px 0; line-height: 1.35;">
              Welcome to Varni Travel Gazette!
            </h1>

            <p style="margin: 0 0 16px 0; font-size: 14px; color: #35475C; line-height: 1.65;">
              Thank you for subscribing with <strong>${email}</strong>. You are now officially on our VIP dispatch list for handpicked travel experiences, seasonal flight bargains, and curated domestic & international packages.
            </p>

            <!-- Highlights Box -->
            <div style="background-color: #F1EEE5; border: 1px solid #E8E3D8; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <div style="font-size: 13px; font-weight: 700; color: #153650; margin-bottom: 8px;">What to Expect in Your Inbox:</div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #35475C; line-height: 1.7;">
                <li>Exclusive Kerala & South India private tour departures</li>
                <li>Group block fares on UK, USA, Dubai, & Singapore flights</li>
                <li>Express visa regulation alerts & student travel checklists</li>
                <li>Personalized festive vacation ideas from our Anand specialists</li>
              </ul>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 13px; color: #666E79;">
              Have an upcoming travel plan in mind? You can always reach our Anand headquarters directly for immediate assistance.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 26px 0 16px 0;">
              <a href="https://varni-holidays.vercel.app/packages" target="_blank" style="display: inline-block; background-color: #153650; color: #FFFFFF !important; font-size: 13px; font-weight: 700; padding: 13px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(21, 54, 80, 0.15);">
                Explore Trending Packages
              </a>
            </div>
          </td>
        </tr>
      </table>

      <!-- Footer -->
      <table class="footer-table" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F1EEE5; border-top: 1px solid #E8E3D8; padding: 22px 32px; text-align: center;">
        <tr>
          <td style="font-size: 11px; color: #666E79; line-height: 1.6;">
            <div style="font-weight: 700; color: #153650; margin-bottom: 4px;">VARNI HOLIDAYS • ANAND</div>
            <div>${COMPANY_CONTACT.address.full}</div>
            <div style="margin-top: 4px;">
              Phone: <a href="${COMPANY_CONTACT.phone.tel}" style="color: #153650; text-decoration: none; font-weight: 600;">${COMPANY_CONTACT.phone.display}</a> | 
              Email: <a href="${COMPANY_CONTACT.email.mailto}" style="color: #153650; text-decoration: none; font-weight: 600;">${COMPANY_CONTACT.email.primary}</a>
            </div>
            <div style="margin-top: 8px; color: #969CA5; font-size: 10px;">© ${new Date().getFullYear()} Varni Holidays. All rights reserved.</div>
          </td>
        </tr>
      </table>

    </div>
  </center>
</body>
</html>
  `.trim();
}

/**
 * Helper to dispatch instant acknowledgement email to customer
 */
export async function sendEnquiryConfirmationEmail(params: EnquiryConfirmationParams): Promise<EmailSendResult> {
  const serviceNames: Record<string, string> = {
    PACKAGE: 'Kerala Holiday Package Enquiry',
    FLIGHT: 'Flight Booking Enquiry',
    VISA: 'Visa Assistance Enquiry',
    CONTACT: 'Consultation Enquiry',
  };
  const serviceName = serviceNames[params.serviceType] || 'Travel Enquiry';

  return sendCustomerEmail({
    to: params.to,
    toName: params.customerName,
    subject: `Enquiry Received (${params.referenceId}) – ${serviceName} | Varni Holidays`,
    customHtml: buildEnquiryConfirmationEmailHtml(params),
  });
}

/**
 * Dispatches an email via Resend API or simulates if key is absent
 * Gracefully handles domain verification 403 errors by falling back to onboarding@resend.dev
 */
export async function sendCustomerEmail(options: EmailSendOptions): Promise<EmailSendResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  let fromEmail = process.env.RESEND_FROM_EMAIL || 'Varni Holidays <contact@varnitours.com>';

  // Resend verified domain is varnitours.com.
  // Until varniholidays.com DNS records are added, automatically use verified varnitours.com to prevent 403 Forbidden errors
  if (fromEmail.includes('@varniholidays.com')) {
    fromEmail = fromEmail.replace('@varniholidays.com', '@varnitours.com');
  }

  const now = new Date().toISOString();
  const renderedHtml = options.customHtml || buildVarniEmailHtml(options);

  // If live Resend API key is present, invoke Resend REST endpoint
  if (resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      let response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          reply_to: COMPANY_CONTACT.email.primary,
          to: [options.to],
          subject: options.subject,
          html: renderedHtml,
        }),
      });

      // If domain verification error (403), automatically fallback to verified onboarding@resend.dev
      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Resend Error with ${fromEmail}]:`, response.status, errText);

        if (response.status === 403 && (errText.includes('Domain not verified') || errText.includes('domain'))) {
          console.log('[Resend Fallback] Retrying with Varni Holidays <onboarding@resend.dev>...');
          response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Varni Holidays <onboarding@resend.dev>',
              reply_to: COMPANY_CONTACT.email.primary,
              to: [options.to],
              subject: options.subject,
              html: renderedHtml,
            }),
          });
        }

        if (!response.ok) {
          const finalErr = await response.text();
          console.error('[Resend Final Error]', response.status, finalErr);
          return {
            success: false,
            messageId: `err-${Date.now()}`,
            providerStatus: 'FAILED',
            recipient: options.to,
            subject: options.subject,
            dispatchedAt: now,
            error: `Resend error: ${response.statusText} (${finalErr})`,
          };
        }
      }

      const resData = await response.json();
      console.log(`[Resend Success] Email dispatched to ${options.to} (ID: ${resData.id})`);
      return {
        success: true,
        messageId: resData.id || `msg-${Date.now()}`,
        providerStatus: 'PROVIDER_ACCEPTED',
        recipient: options.to,
        subject: options.subject,
        dispatchedAt: now,
      };
    } catch (err: any) {
      console.error('[Resend Exception]', err);
      return {
        success: false,
        messageId: `err-${Date.now()}`,
        providerStatus: 'FAILED',
        recipient: options.to,
        subject: options.subject,
        dispatchedAt: now,
        error: err.message || 'Unknown network error during email dispatch',
      };
    }
  }

  // Fallback simulation when no live Resend API key is configured
  console.log(`[Email Simulation] Dispatching to ${options.to}: "${options.subject}"`);
  return {
    success: true,
    messageId: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    providerStatus: 'SIMULATED',
    recipient: options.to,
    subject: options.subject,
    dispatchedAt: now,
  };
}
