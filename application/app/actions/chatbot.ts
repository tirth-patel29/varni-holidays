'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { validatePhoneNumber } from '@/lib/validation/phone';
import { createLeadRecord, UserContext } from '@/lib/crm/unified-crm-service';
import { ChatbotSubmissionPayload, ChatbotSubmissionResult } from '@/lib/chatbot/types';
import { CHATBOT_CONFIG } from '@/lib/chatbot/config';
import { PriorityLevel } from '@prisma/client';

/**
 * Sanitizes and strips HTML / unsafe tags from customer inputs
 */
function sanitizeText(input?: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Strip brackets
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validates email format strictly
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Server Action: Submits a Chatbot enquiry, performs rate limiting,
 * validates traveler details, deduplicates customer, and registers the lead in the CRM.
 */
export async function submitChatbotEnquiryAction(
  payload: ChatbotSubmissionPayload
): Promise<ChatbotSubmissionResult> {
  try {
    // 1. Client IP Resolution & Rate Limiting
    let clientIp = '127.0.0.1';
    try {
      const headersList = headers();
      const forwardedFor = headersList.get('x-forwarded-for');
      if (forwardedFor) {
        clientIp = forwardedFor.split(',')[0].trim();
      }
    } catch {
      // Fallback for environments where headers() is not available (e.g. testing)
      clientIp = '127.0.0.1';
    }

    // In test or non-web contexts, skip rate limiting or use generous limits
    if (process.env.NODE_ENV !== 'test') {
      const rateLimit = await checkRateLimit(`chatbot:ip:${clientIp}`, 15, 10 * 60); // 15 attempts per 10 mins
      if (!rateLimit.allowed) {
        return {
          success: false,
          error: `Too many submissions from your connection. Please wait ${rateLimit.retryAfterSeconds} seconds or connect directly via WhatsApp.`,
        };
      }
    }

    // 2. Input Validation
    const customer = payload.customer;
    if (!customer) {
      return { success: false, error: 'Customer contact details are missing.' };
    }

    const fullName = sanitizeText(customer.fullName);
    if (!fullName || fullName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    const phoneCountryCode = customer.phoneCountryCode || '+91';
    const rawPhone = customer.phoneNumber || '';
    const phoneValidation = validatePhoneNumber(phoneCountryCode, rawPhone);

    if (!phoneValidation.isValid) {
      return {
        success: false,
        error: phoneValidation.error || 'Please enter a valid mobile number.',
      };
    }

    let email: string | undefined = undefined;
    if (customer.email && customer.email.trim().length > 0) {
      const trimmedEmail = customer.email.trim().toLowerCase();
      if (!isValidEmail(trimmedEmail)) {
        return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
      }
      email = trimmedEmail;
    }

    const notes = sanitizeText(customer.notes);

    // 3. Format Enquiry Summary
    const summary = payload.enquirySummary || {};
    const summaryLines: string[] = [];
    for (const [key, val] of Object.entries(summary)) {
      if (val) {
        summaryLines.push(`• ${key}: ${sanitizeText(val)}`);
      }
    }

    const destination =
      summary['Destination'] ||
      summary['Sector / Route'] ||
      summary['Hotel City / Area'] ||
      summary['Visa Country'] ||
      summary['Enquiry Service'] ||
      'General Travel';

    const title = `Website Chatbot: ${payload.serviceTitle || payload.serviceCategory} - ${destination}`;

    const description = [
      `CHATBOT ENQUIRY DETAILS (${payload.serviceTitle}):`,
      ...summaryLines,
      '',
      `CLIENT CONTACT:`,
      `• Name: ${fullName}`,
      `• Mobile: ${phoneCountryCode} ${rawPhone}`,
      email ? `• Email: ${email}` : '• Email: Not provided',
      notes ? `• Special Remarks: ${notes}` : null,
      `• Channel: Website Interactive Chatbot`,
    ]
      .filter(Boolean)
      .join('\n');

    // 4. Format Conversation Transcript
    const transcript = payload.transcript || [];
    const formattedTranscript = transcript
      .map((t) => `[${t.timestamp || 'Time'}] ${t.sender.toUpperCase()}: ${sanitizeText(t.text)}`)
      .join('\n');

    const internalNotes = [
      `Automated chatbot submission captured on website.`,
      `Service: ${payload.serviceTitle}`,
      ...summaryLines,
      notes ? `Client Remarks: ${notes}` : null,
      '',
      `--- FULL CHATBOT TRANSCRIPT ---`,
      formattedTranscript || 'No transcript recorded.',
    ]
      .filter(Boolean)
      .join('\n');

    // Determine urgency from summary
    const isUrgent = Object.values(summary).some((v) =>
      typeof v === 'string' && (v.includes('Urgent') || v.includes('Within next 7 days'))
    );

    // 5. Create Lead in CRM with Deduplicated Customer
    const staff: UserContext = {
      id: '',
      fullName: 'Website Chatbot Engine',
      email: 'chatbot@varniholidays.com',
      role: 'SUPER_ADMIN',
    };

    const lead = await createLeadRecord(
      {
        title,
        description,
        serviceType: payload.serviceCategory || 'GENERAL',
        source: 'WEBSITE_CHATBOT',
        stage: 'NEW',
        priorityLevel: isUrgent ? ('HIGH' as PriorityLevel) : ('MEDIUM' as PriorityLevel),
        customerName: fullName,
        customerPhone: rawPhone,
        phoneCountryCode,
        customerEmail: email,
        destination,
        internalNotes,
        assignedUserId: 'ROUND_ROBIN', // Auto-assign via sales round-robin
      },
      staff
    );

    // Revalidate CRM inbox and leads pages so inquiry appears immediately
    try {
      revalidatePath('/admin/leads');
      revalidatePath('/admin/inbox');
      revalidatePath('/admin/enquiries');
      revalidatePath(`/admin/customers/${lead.customerId}`);
    } catch {}

    return {
      success: true,
      referenceId: lead.referenceId,
      message: CHATBOT_CONFIG.submissionConfirmation,
      customerId: lead.customerId,
      leadId: lead.id,
    };
  } catch (err: any) {
    console.error('[submitChatbotEnquiryAction error]:', err);
    return {
      success: false,
      error:
        err.message ||
        'Unable to complete submission right now. Please reach out to our Anand desk directly on WhatsApp or Call.',
    };
  }
}
