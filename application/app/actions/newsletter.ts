'use server';

import { prisma } from '@/lib/prisma';
import { NewsletterSubscriptionSchema } from '@/lib/validation/schemas';
import { sendCustomerEmail, buildNewsletterWelcomeEmailHtml } from '@/lib/integrations/email-service';

export interface NewsletterResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
  error?: string;
}

export async function subscribeNewsletterAction(emailInput: unknown): Promise<NewsletterResult> {
  try {
    const rawEmail = typeof emailInput === 'string' ? emailInput : (emailInput as any)?.email;
    const parsed = NewsletterSubscriptionSchema.safeParse({ email: rawEmail });

    if (!parsed.success) {
      const err = parsed.error.errors[0]?.message || 'Please enter a valid email address.';
      return { success: false, message: err, error: err };
    }

    const email = parsed.data.email;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    try {
      const existing = await prisma.newsletterSubscription.findUnique({
        where: { normalizedEmail },
      });

      if (existing) {
        if (existing.status === 'SUBSCRIBED') {
          return {
            success: true,
            alreadySubscribed: true,
            message: "You are already subscribed to Varni Travel Gazette!",
          };
        } else {
          // Reactivate subscription
          await prisma.newsletterSubscription.update({
            where: { id: existing.id },
            data: {
              status: 'SUBSCRIBED',
              consentAt: new Date(),
              unsubscribedAt: null,
            },
          });
        }
      } else {
        // Create new record
        await prisma.newsletterSubscription.create({
          data: {
            email,
            normalizedEmail,
            status: 'SUBSCRIBED',
            source: 'WEBSITE_FOOTER',
            consentAt: new Date(),
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma newsletter storage skipped (fallback active):', dbErr);
    }

    // Dispatch branded Light Theme Welcome Email via Resend (with automatic onboarding@resend.dev retry fallback)
    try {
      await sendCustomerEmail({
        to: email,
        toName: 'Valued Traveler',
        subject: 'Welcome to Varni Travel Gazette! – Exclusive Travel Insights & Offers',
        customHtml: buildNewsletterWelcomeEmailHtml(email),
      });
    } catch (mailErr) {
      console.warn('Welcome email dispatch warning:', mailErr);
    }

    return {
      success: true,
      message: "Thank you for subscribing to Varni Travel Gazette! You're on the list to receive our curated travel updates and seasonal offers.",
    };
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return {
      success: false,
      message: 'Failed to process subscription. Please try again.',
      error: error.message || 'Unknown error',
    };
  }
}

export async function getNewsletterSubscribersAction() {
  try {
    const subscribers = await prisma.newsletterSubscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      status: s.status,
      source: s.source,
      consentAt: s.consentAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('Error fetching subscribers:', err);
    return [];
  }
}
