import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins/two-factor';
import prisma from '@/lib/prisma';
import { getAppBaseUrl } from '@/lib/config/app-url';

/**
 * Better Auth Central Configuration for Varni Holidays
 * Integrated with PostgreSQL (Neon) and Prisma ORM
 */

const APP_URL = getAppBaseUrl();
const AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'VARNI_HOLIDAYS_STRICT_ENTERPRISE_SECRET_2026_PROD';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: APP_URL,
  secret: AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    autoSignIn: false, // Do not auto sign-in before MFA verification
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days absolute lifetime
    updateAge: 60 * 60 * 24, // 24 hours refresh
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
  advanced: {
    cookiePrefix: 'varni',
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  plugins: [
    twoFactor({
      issuer: 'Varni Holidays',
      backupCodeCount: 10,
      otpOptions: {
        digits: 6,
        period: 30,
      },
    }),
  ],
  user: {
    fields: {
      name: 'fullName',
      image: 'avatarUrl',
    },
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        required: false,
        defaultValue: 'ACTIVE',
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'SALES_EXECUTIVE',
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
