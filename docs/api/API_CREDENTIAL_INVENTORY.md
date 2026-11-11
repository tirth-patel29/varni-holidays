# Varni Holidays — Environment Credential & Secret Audit

**Document Version:** 1.0.0  
**Generated Date:** November 2026  
**Audited Codebase:** Next.js 14 App Router (`application/`)  
**Security Status:** STRICT PROTOCOL APPLIED — NO LIVE CREDENTIALS, TOKENS, OR SECRETS ARE STORED IN OR EXPOSED BY THIS DOCUMENTATION.

---

## 1. Credential Audit Matrix

| Environment Variable | Category | Required Status | Default / Placeholder Pattern | Code Location / Usage | Security Handling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Database | **Required** (Production) | `postgresql://user:pass@ep-pooler.region.neon.tech/neondb?sslmode=require&pgbouncer=true` | `application/lib/prisma.ts` | Server-only. Must never be exposed to browser or client bundles. |
| `DIRECT_URL` | Database | Optional | `postgresql://user:pass@ep-direct.region.neon.tech/neondb?sslmode=require` | `application/prisma/schema.prisma` | Server-only. Used exclusively by Prisma CLI for schema migrations. |
| `RESEND_API_KEY` | Email Service | **Required** (Emails) | `re_[a-zA-Z0-9]{24,}` | `application/lib/integrations/email-service.ts` | Server-only. If omitted, system enters simulated email mode. |
| `RESEND_FROM_EMAIL` | Email Service | Optional | `Varni Holidays <noreply@varnitours.com>` | `application/lib/integrations/email-service.ts` | Server-only. Must be from a verified domain on Resend. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Sheets API | Optional (Recommended) | `varni-sheets-sync@varni-holidays-crm.iam.gserviceaccount.com` | `application/lib/integrations/google-sheets.ts` | Server-only. Google Cloud IAM Service Account email. |
| `GOOGLE_PRIVATE_KEY` | Sheets API | Optional (Recommended) | `-----BEGIN PRIVATE KEY-----\nMIIEvgI...==\n-----END PRIVATE KEY-----\n` | `application/lib/integrations/google-sheets.ts` | Server-only. Multi-line RSA private key. Must escape newline chars (`\n`). |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Sheets API | Optional | `1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A` | `application/lib/integrations/google-sheets.ts` | Server-only. ID found in target Google Sheets URL. |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Sheets API | Optional (Fallback) | `https://script.google.com/macros/s/AKfycb.../exec` | `application/lib/integrations/google-sheets.ts` | Server-only. Alternative sync endpoint via Google Apps Script. |
| `WHATSAPP_API_TOKEN` | WhatsApp API | Optional (Outbound API) | `EAAX...` (Meta System User Permanent Token) | `application/lib/integrations/whatsapp-service.ts` | Server-only. Bearer token for Meta Graph API v19.0. |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp API | Optional (Outbound API) | `109876543210987` (15-digit Meta ID) | `application/lib/integrations/whatsapp-service.ts` | Server-only. WhatsApp Business Phone Number ID in Meta Manager. |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp API | Optional (Future Bot) | `109876543210988` (15-digit WABA ID) | Future WhatsApp webhook & template management | Server-only. Meta WhatsApp Business Account ID. |
| `WHATSAPP_VERIFY_TOKEN` | WhatsApp API | Optional (Future Bot) | Custom alphanumeric secret string (e.g. `varni_webhook_verification_token_2026`) | Future WhatsApp Webhook verification route | Server-only. Verified during Meta Webhook handshake (`hub.challenge`). |
| `WHATSAPP_APP_SECRET` | WhatsApp API | Optional (Future Bot) | `32-character hexadecimal string` | Future WhatsApp Webhook HMAC-SHA256 signature verification | Server-only. Meta App Secret used to validate `X-Hub-Signature-256`. |
| `NEXT_PUBLIC_APP_URL` | App Runtime | Optional | `http://localhost:3000` / `https://varnitours.com` | `application/lib/config/contact.ts` | Publicly accessible in client and server bundles. |
| `NEXT_PUBLIC_OFFICE_PHONE` | Public Contact | Optional | `+91 63570 50505` | `application/lib/config/contact.ts` | Public display on header, contact page, and footer. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`| Public Contact | Optional | `916357050505` | `application/lib/config/contact.ts` | Public target for `wa.me` Click-to-Chat buttons. |
| `NEXT_PUBLIC_OFFICE_EMAIL` | Public Contact | Optional | `varniinternational7@gmail.com` | `application/lib/config/contact.ts` | Public display email. |
| `NEXT_PUBLIC_OFFICE_ADDRESS` | Public Contact | Optional | `317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Anand, Gujarat 388120` | `application/lib/config/contact.ts` | Public display address. |

---

## 2. Security Analysis & Environment Verification Protocols

### 2.1 Principle of Least Privilege & Zero Secrets in Client Bundles
* All sensitive credentials (`DATABASE_URL`, `RESEND_API_KEY`, `GOOGLE_PRIVATE_KEY`, `WHATSAPP_API_TOKEN`) lack the `NEXT_PUBLIC_` prefix, preventing Next.js from bundling them into client-side JavaScript.
* In Next.js 14 App Router, Server Actions and Route Handlers execute exclusively in the Node.js server environment, ensuring API keys are never exposed in browser Network DevTools.

### 2.2 Domain Verification Rules (Resend)
* Resend requires SPF, DKIM, and MX/TXT records configured for `varnitours.com`.
* In `application/lib/integrations/email-service.ts`, the default sender `Varni Holidays <noreply@varnitours.com>` guarantees high inbox delivery rates and prevents spoofing flags.

### 2.3 Meta WhatsApp Cloud API Token Lifecycle
* **Developer User Tokens vs. System User Tokens:**
  * Meta Developer temporary tokens expire in 24 hours.
  * For production, an **Admin System User** must be created in Meta Business Manager (`business.facebook.com`), assigned the `whatsapp_business_messaging` and `whatsapp_business_management` permissions, and generated with **Permanent (Never Expire)** duration.
  * This permanent token is stored securely as `WHATSAPP_API_TOKEN`.

### 2.4 Google Service Account Security
* The Google Service Account private key (`GOOGLE_PRIVATE_KEY`) contains standard RSA PEM headers.
* When storing in Vercel or `.env.local`, all literal line breaks must be formatted as `\n`. The integration code handles this safely:
  ```typescript
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  ```
* The Google Sheet must be shared explicitly with the Service Account email (`GOOGLE_SERVICE_ACCOUNT_EMAIL`) with **Editor** permissions.

---

## 3. Checklist for Environment Configuration

When deploying Varni Holidays to a new environment (Development, Staging, or Production):

- [ ] Copy `.env.example` to `.env.local` (Never commit `.env.local` to git).
- [ ] Configure `DATABASE_URL` with your PostgreSQL / Neon database connection string.
- [ ] Add `RESEND_API_KEY` obtained from Resend Dashboard -> API Keys.
- [ ] Add `RESEND_FROM_EMAIL="Varni Holidays <noreply@varnitours.com>"`.
- [ ] Share Google Spreadsheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL` and set `GOOGLE_SHEETS_SPREADSHEET_ID`.
- [ ] Add `GOOGLE_PRIVATE_KEY` with escaped `\n` characters.
- [ ] Configure `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` from Meta Developer Portal.
- [ ] Run `npm run build` or `pnpm build` to verify environment variable syntax and bundle safety.

