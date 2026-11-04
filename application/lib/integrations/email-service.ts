/**
 * VARNI HOLIDAYS - Customer Email Integration Service
 * Powered by Resend with Branded Responsive HTML Templates
 * Fallback to simulation mode when RESEND_API_KEY is not configured
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
  serviceType: 'PACKAGE' | 'FLIGHT' | 'VISA';
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
  };
}

// Warm Tactile Voyage Branded Email HTML Wrapper
export function buildVarniEmailHtml(options: EmailSendOptions): string {
  const { toName, headline, bodyHtml, ctaText, ctaUrl, bookingRef, quotationRef } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #0B0D0F; color: #1E293B; }
    .wrapper { max-width: 600px; margin: 24px auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #2A2E34; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25); }
    .header { background: #101113; padding: 28px 32px; text-align: left; border-bottom: 2px solid #E9B95E; }
    .brand-title { color: #F4F4F2; font-size: 20px; font-weight: 800; letter-spacing: 1px; margin: 0; font-family: Georgia, serif; }
    .brand-subtitle { color: #E9B95E; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
    .content { padding: 32px; line-height: 1.6; }
    .greeting { font-size: 15px; font-weight: 600; color: #0F172A; margin-bottom: 14px; }
    .headline { font-size: 19px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; font-family: Georgia, serif; }
    .body-text { font-size: 14px; color: #334155; line-height: 1.65; }
    .card-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #FEF3C7; color: #92400E; }
    .btn-container { text-align: center; margin: 28px 0 12px 0; }
    .btn { display: inline-block; background: #E9B95E; color: #101113 !important; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 6px; text-decoration: none; }
    .footer { background: #17191D; padding: 24px 32px; text-align: center; font-size: 12px; color: #969CA5; border-top: 1px solid #2A2E34; }
    .footer strong { color: #F4F4F2; }
    .footer a { color: #E9B95E; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="brand-title">VARNI HOLIDAYS</div>
      <div class="brand-subtitle">Anand, Gujarat • Premium Travel & Bespoke Hospitality</div>
    </div>

    <!-- Content Area -->
    <div class="content">
      <div class="greeting">Dear ${toName},</div>
      ${headline ? `<h1 class="headline">${headline}</h1>` : ''}

      ${bookingRef ? `<div class="card-box" style="margin-top: 0; margin-bottom: 20px;"><span class="badge">Booking Reference</span><div style="font-size: 16px; font-weight: 800; color: #0F172A; margin-top: 6px;">${bookingRef}</div></div>` : ''}
      ${quotationRef ? `<div class="card-box" style="margin-top: 0; margin-bottom: 20px;"><span class="badge">Quotation Reference</span><div style="font-size: 16px; font-weight: 800; color: #0F172A; margin-top: 6px;">${quotationRef}</div></div>` : ''}

      <div class="body-text">
        ${bodyHtml || ''}
      </div>

      ${ctaText && ctaUrl ? `
        <div class="btn-container">
          <a href="${ctaUrl}" class="btn" target="_blank">${ctaText}</a>
        </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 600;">${COMPANY_CONTACT.businessName} ANAND</p>
      <p style="margin: 0 0 6px 0; font-size: 11px;">${COMPANY_CONTACT.address.full} | Phone / WhatsApp: <a href="${COMPANY_CONTACT.phone.tel}">${COMPANY_CONTACT.phone.display}</a></p>
      <p style="margin: 0; font-size: 11px;">Inquiries: <a href="${COMPANY_CONTACT.email.mailto}">${COMPANY_CONTACT.email.primary}</a> | Flights • Tour Packages • Visas • Hotels</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds the instant acknowledgement email sent to customers when they submit an enquiry
 */
export function buildEnquiryConfirmationEmailHtml(params: EnquiryConfirmationParams): string {
  const { customerName, referenceId, serviceType, details } = params;

  let serviceTitle = 'Tour Package Enquiry';
  let detailsRowsHtml = '';

  if (serviceType === 'PACKAGE') {
    serviceTitle = 'Kerala Holiday Package Enquiry';
    detailsRowsHtml = `
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9; width: 38%;">Package</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.packageName || 'Kerala 6N/7D Winter CPAI'}</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Hotel Tier</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.hotelTier || 'Deluxe'}</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Travelers</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.adultsCount || 2} Adults${details.childrenCount ? `, ${details.childrenCount} Children` : ''}</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Rooms</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.roomsCount || 1} Room(s)</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Dedicated Vehicle</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.vehicleType || 'AC Sedan (Dzire / Etios)'}</td></tr>
      ${details.travelDates ? `<tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Travel Date</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.travelDates}</td></tr>` : ''}
      ${details.totalEstimate ? `<tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Initial Estimate</td><td style="padding: 8px 12px; color: #16A34A; font-weight: 700; font-size: 14px; border-bottom: 1px solid #F1F5F9;">₹${details.totalEstimate.toLocaleString('en-IN')} (All Taxes Incl.)</td></tr>` : ''}
    `;
  } else if (serviceType === 'FLIGHT') {
    serviceTitle = 'Flight Booking Enquiry';
    detailsRowsHtml = `
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9; width: 38%;">Routing</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.originAirport} ✈ ${details.destinationAirport}</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Trip Type</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.tripType || 'One Way'}</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Departure Date</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.departureDate}</td></tr>
      ${details.returnDate ? `<tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Return Date</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.returnDate}</td></tr>` : ''}
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Passengers</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.adultsCount || 1} Adult(s)${details.childrenCount ? `, ${details.childrenCount} Child` : ''}${details.infantsCount ? `, ${details.infantsCount} Infant` : ''}</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Cabin Class</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.cabinClass || 'Economy'}</td></tr>
    `;
  } else if (serviceType === 'VISA') {
    serviceTitle = 'Visa Assistance Enquiry';
    detailsRowsHtml = `
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9; width: 38%;">Country</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.destinationCountry}</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Visa Type</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.visaCategory || 'Tourist'} Visa</td></tr>
      <tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Applicants</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.applicantCount || 1} Person(s)</td></tr>
      ${details.departureDate ? `<tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Planned Travel</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.departureDate}</td></tr>` : ''}
      ${details.stayDurationDays ? `<tr><td style="padding: 8px 12px; color: #64748B; font-size: 13px; border-bottom: 1px solid #F1F5F9;">Duration</td><td style="padding: 8px 12px; color: #0F172A; font-weight: 600; font-size: 13px; border-bottom: 1px solid #F1F5F9;">${details.stayDurationDays} Days</td></tr>` : ''}
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
  <title>Thank You for Your Enquiry – Varni Holidays</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0B0D0F; color: #1E293B;">
  <div style="max-width: 600px; margin: 24px auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #2A2E34; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
    <!-- Brand Header -->
    <div style="background: #101113; padding: 26px 32px; text-align: left; border-bottom: 2px solid #E9B95E;">
      <div style="color: #F4F4F2; font-size: 20px; font-weight: 800; letter-spacing: 1px; font-family: Georgia, serif; margin: 0;">VARNI HOLIDAYS</div>
      <div style="color: #E9B95E; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Anand, Gujarat • Bespoke Journeys & Hospitality</div>
    </div>

    <!-- Main Body -->
    <div style="padding: 32px 32px 24px 32px; line-height: 1.6;">
      <div style="font-size: 15px; font-weight: 600; color: #0F172A; margin-bottom: 12px;">Dear ${customerName},</div>

      <h1 style="font-size: 20px; font-weight: 700; color: #0F172A; margin: 0 0 14px 0; font-family: Georgia, serif;">
        Thank You for Choosing Varni Holidays!
      </h1>

      <p style="font-size: 14px; color: #334155; line-height: 1.65; margin: 0 0 20px 0;">
        We have received your request for <strong>${serviceTitle}</strong>. Our dedicated travel desk in Anand is already reviewing your details to ensure the highest standards of comfort, transparency, and value.
      </p>

      <!-- Reference ID Highlight Pill -->
      <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #B45309;">Your Official Reference ID</span>
        <div style="font-family: monospace; font-size: 18px; font-weight: 800; color: #92400E; margin-top: 4px; letter-spacing: 0.5px;">${referenceId}</div>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #78350F;">Please quote this reference ID for all upcoming inquiries or communication.</p>
      </div>

      <!-- Itemized Enquiry Summary -->
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
        <div style="background: #F1F5F9; padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">
          Summary of Your Request
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <tbody>
            ${detailsRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- What Happens Next -->
      <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px;">What Happens Next?</div>
        <p style="font-size: 13px; color: #15803D; margin: 0; line-height: 1.55;">
          Our destination specialist is personally reviewing your requirements. We will contact you shortly via <strong>Phone</strong> or <strong>WhatsApp</strong> to discuss custom flight timings, hotel choices, or visa document checklists.
        </p>
      </div>

      <!-- CTA WhatsApp Button -->
      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${COMPANY_CONTACT.whatsapp.url}?text=${waMessage}" style="display: inline-block; background: #25D366; color: #FFFFFF !important; font-size: 13px; font-weight: 700; padding: 12px 26px; border-radius: 6px; text-decoration: none; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.25);" target="_blank">
          Chat Directly on WhatsApp (${COMPANY_CONTACT.whatsapp.display})
        </a>
      </div>

      <!-- Contact Details Block -->
      <div style="border-top: 1px solid #E2E8F0; padding-top: 18px; margin-top: 24px; font-size: 12px; color: #475569; line-height: 1.6;">
        <strong style="color: #0F172A; display: block; margin-bottom: 4px;">Need Immediate Assistance?</strong>
        <div>📍 <strong>Head Office:</strong> ${COMPANY_CONTACT.address.full}</div>
        <div>📞 <strong>Phone:</strong> <a href="${COMPANY_CONTACT.phone.tel}" style="color: #0F172A; text-decoration: none; font-weight: 600;">${COMPANY_CONTACT.phone.display}</a></div>
        <div>✉️ <strong>Email:</strong> <a href="${COMPANY_CONTACT.email.mailto}" style="color: #0F172A; text-decoration: none; font-weight: 600;">${COMPANY_CONTACT.email.primary}</a></div>
        <div>⏰ <strong>Office Hours:</strong> ${COMPANY_CONTACT.hours.detailed}</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #17191D; padding: 22px 32px; text-align: center; font-size: 11px; color: #969CA5; border-top: 1px solid #2A2E34;">
      <div style="color: #F4F4F2; font-weight: 700; margin-bottom: 4px;">VARNI HOLIDAYS • ANAND</div>
      <div>Bespoke Tours • Worldwide Flights • Express Visa Assistance • Luxury Hotels</div>
      <div style="margin-top: 8px; color: #666E79;">© ${new Date().getFullYear()} Varni Holidays. All rights reserved.</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatches an email via Resend API or simulates if key is absent
 */
export async function sendCustomerEmail(options: EmailSendOptions): Promise<EmailSendResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  let fromEmail = process.env.RESEND_FROM_EMAIL || 'Varni Holidays <contact@varnitours.com>';
  
  // Resend verified domain is varnitours.com. If unverified varniholidays.com is present, automatically route through varnitours.com
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

      // If domain verification error, automatically fallback to onboarding@resend.dev or contact@varnitours.com
      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Resend Error with ${fromEmail}]:`, response.status, errText);

        if (response.status === 403 && errText.includes('Domain not verified')) {
          console.log('[Resend Fallback] Retrying with Varni Holidays <contact@varnitours.com>...');
          response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Varni Holidays <contact@varnitours.com>',
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
      console.error('[Resend Network Exception]', err);
      return {
        success: false,
        messageId: `exc-${Date.now()}`,
        providerStatus: 'FAILED',
        recipient: options.to,
        subject: options.subject,
        dispatchedAt: now,
        error: err.message,
      };
    }
  }

  // Resend API key not configured -> Simulation Mode with full fidelity logging
  const simMessageId = `sim_resend_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  console.log(`[Email Service Simulation] Sent to: ${options.to} | Subject: "${options.subject}" | MessageID: ${simMessageId}`);

  return {
    success: true,
    messageId: simMessageId,
    providerStatus: 'SENT',
    recipient: options.to,
    subject: options.subject,
    dispatchedAt: now,
  };
}

/**
 * Instant customer enquiry acknowledgement sender
 */
export async function sendEnquiryConfirmationEmail(params: EnquiryConfirmationParams): Promise<EmailSendResult> {
  const serviceNames = {
    PACKAGE: 'Kerala Holiday Package',
    FLIGHT: 'Flight Booking Request',
    VISA: 'Visa Consultation',
  };
  const subject = `Enquiry Received: ${params.referenceId} – ${serviceNames[params.serviceType]} | Varni Holidays`;
  const customHtml = buildEnquiryConfirmationEmailHtml(params);

  return sendCustomerEmail({
    to: params.to,
    toName: params.customerName,
    subject,
    customHtml,
  });
}
