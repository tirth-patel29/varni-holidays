# Varni Holidays — External API & Services Integration Inventory

**Document Version:** 1.0.0  
**Generated Date:** November 2026  
**Audited Codebase:** Next.js 14 App Router (`application/`)

---

## 1. Overview of External Integrations

```
┌────────────────────────────────────────────────────────────────────────┐
│                      VARNI HOLIDAYS SERVER TIER                        │
│                 (Next.js 14 App Router / Server Actions)                │
└──────┬────────────────────┬─────────────────────┬────────────────┬─────┘
       │                    │                     │                │
       ▼                    ▼                     ▼                ▼
┌──────────────┐     ┌──────────────┐      ┌─────────────┐   ┌────────────┐
│    RESEND    │     │  META CLOUD  │      │   GOOGLE    │   │ POSTGRESQL │
│  EMAIL API   │     │ WHATSAPP API │      │   SHEETS    │   │  (PRISMA)  │
│              │     │  & wa.me/    │      │   API v4    │   │            │
└──────────────┘     └──────────────┘      └─────────────┘   └────────────┘
```

The Varni Holidays platform integrates with four primary external service providers:
1. **Resend Email Service:** Transactional and notification email dispatch.
2. **Meta WhatsApp Cloud API & wa.me Click-to-Chat:** Direct customer messaging and lead follow-up.
3. **Google Sheets API v4:** Real-time business reporting, lead sync, and offline backup.
4. **PostgreSQL / Neon via Prisma ORM:** Persistent multi-tenant relational data store.

---

## 2. Integration 1: Resend Email Service

### 2.1 Technical Specifications
* **Provider:** Resend Technologies Inc. (`https://resend.com`)
* **Endpoint:** `https://api.resend.com/emails`
* **Transport Protocol:** Direct REST HTTPS `POST` requests via Node.js native `fetch` (No heavy third-party SDK dependencies).
* **Code Implementation File:** `application/lib/integrations/email-service.ts`
* **Test Utility Script:** `application/scripts/test-resend.ts`
* **Authentication:** HTTP Header `Authorization: Bearer process.env.RESEND_API_KEY`
* **Sender Identity:**
  * Configured Sender: `Varni Holidays <noreply@varnitours.com>` (or custom configured via `process.env.RESEND_FROM_EMAIL`).
  * Verified Custom Domain: `varnitours.com` (configured with DKIM, SPF, and DMARC).

### 2.2 Functional Capabilities & Templates
The service encapsulates five core transactional travel workflows:

1. **Lead / Enquiry Acknowledgement (`sendLeadAcknowledgementEmail`):**
   * Triggered when a customer submits an enquiry for Flights, Packages, Visas, or Insurance.
   * Content: Branded responsive HTML receipt with enquiry ID, submitted preferences, and expected response time (< 30 minutes during business hours).
2. **Internal Admin Lead Alert (`sendAdminLeadNotificationEmail`):**
   * Dispatched immediately to `varniinternational7@gmail.com` (and configured management team).
   * Content: Customer contact card, travel dates, passenger count, meal/special assistance requirements, and direct CRM deep link.
3. **Booking Confirmation & Receipt (`sendBookingConfirmationEmail`):**
   * Dispatched upon manual or automated booking confirmation.
   * Content: Booking reference code, itinerary overview, payment breakdown, and passenger roster.
4. **Official Travel Quotation Dispatch (`sendQuotationEmail`):**
   * Triggered from CRM when a travel consultant issues a formal proposal.
   * Content: Itemized package cost breakdown, flight options, hotel tier, terms, and payment link.
5. **Newsletter Welcome (`sendNewsletterWelcomeEmail`):**
   * Dispatched to new subscribers.
   * Content: Brand introduction, popular destinations, and customer support channels.

### 2.3 Resiliency & Fallback Mode
* If `RESEND_API_KEY` is not present in the runtime environment:
  * The service logs a structured warning: `[Resend Email] API key missing; simulating delivery to <email>`.
  * Returns a simulated success payload with message ID `sim_email_<timestamp>`.
  * The frontend UI and database operations continue without interruption, ensuring zero customer downtime during development or offline testing.

---

## 3. Integration 2: Meta WhatsApp Cloud API & Click-to-Chat

### 3.1 Technical Specifications
* **Provider:** Meta Platforms, Inc. / Facebook Graph API v19.0
* **Endpoint:** `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`
* **Code Implementation File:** `application/lib/integrations/whatsapp-service.ts`
* **Authentication:** HTTP Header `Authorization: Bearer process.env.WHATSAPP_API_TOKEN`
* **Identifiers:** `process.env.WHATSAPP_PHONE_NUMBER_ID`
* **Fallback Endpoint:** `https://wa.me/${normalizedPhone}?text=${encodedText}`

### 3.2 Outbound Messaging Workflow
When a message is sent to a customer:
1. **Phone Normalization:** The utility `normalizeWhatsAppNumber` strips non-numeric characters, prepends the international dialing code (`+91` by default), and ensures E.164 compliance.
2. **Cloud API Dispatch:**
   * If `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are configured:
     * A structured `POST` is sent to Graph API v19.0.
     * Response is parsed; if Meta accepts the message, delivery status is returned as `PROVIDER_ACCEPTED` with Meta's `wamid.xxx` identifier.
     * If Meta returns an error (e.g. outside 24-hr customer service window, expired token), an error status is logged.
3. **Strict Fallback Protocol (`wa.me` Click-to-Chat):**
   * If credentials are not configured or direct dispatch is disabled, the system builds an official `wa.me` deep link.
   * **STRICT AUDIT COMPLIANCE:** The system explicitly records the status as `CLICK_TO_CHAT_TRIGGERED`. It **never** falsely reports fallback clicks as `DELIVERED` or `PROVIDER_ACCEPTED`.

### 3.3 Official Company WhatsApp Contact
* **Public Phone Number:** `+91 63570 50505` (`NEXT_PUBLIC_WHATSAPP_NUMBER: 916357050505`)
* **Company Profile:** Varni Holidays, Anand, Gujarat.
* **Direct URL:** `https://wa.me/916357050505`

---

## 4. Integration 3: Google Sheets Real-Time Sync Engine

### 4.1 Technical Specifications
* **Provider:** Google Workspace / Google Cloud Platform (Sheets API v4)
* **Code Implementation Files:**
  * `application/lib/integrations/google-sheets.ts`
  * `application/lib/crm/store.ts`
  * `application/app/actions/google-sheets.ts`
* **NPM Package:** `googleapis` v144.0.0
* **Authentication Method 1 (Primary):** Google Service Account JWT (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`)
* **Authentication Method 2 (Fallback):** Google Apps Script Webhook URL (`GOOGLE_SHEETS_WEBHOOK_URL`)
* **Target Spreadsheet ID:** `process.env.GOOGLE_SHEETS_SPREADSHEET_ID` (Default: `1fVwhzsYrZ5c8xmLSobxTXP8M1JNeqL5-ZSbnq3gZY3A`)

### 4.2 Synchronized Worksheets
The engine maintains four dedicated worksheets within the business spreadsheet:

1. **`ALL_LEADS` Sheet:**
   * Columns: `Timestamp`, `Lead ID`, `Customer Name`, `Phone`, `Email`, `Category`, `Destination`, `Travel Date`, `Passengers`, `Stage`, `Assigned Consultant`, `Notes`.
2. **`QUOTATIONS` Sheet:**
   * Columns: `Quote ID`, `Lead ID`, `Customer Name`, `Destination`, `Total Amount (INR)`, `Tax`, `Valid Until`, `Status`.
3. **`FOLLOW_UPS` Sheet:**
   * Columns: `Follow-up ID`, `Lead ID`, `Customer Name`, `Due Date`, `Staff Member`, `Reminder Notes`, `Completed Status`.
4. **`BOOKINGS` Sheet:**
   * Columns: `Booking Ref`, `Customer Name`, `Phone`, `Travel Dates`, `Total Price`, `Payment Received`, `Balance Due`, `Booking Status`.

### 4.3 Background Queue & Offline Resilience
* Writes are queued in memory and flushed asynchronously to prevent blocking user-facing HTTP threads.
* If Google API rate limits (`429 Too Many Requests`) or network disruptions occur, jobs are retained in an internal failure queue with exponential backoff retry.
* The CRM administrative dashboard provides a manual trigger (`triggerManualSyncAction`) and connection diagnostic tool (`testGoogleSheetsConnectionAction`).

---

## 5. Integration 4: PostgreSQL & Prisma ORM

### 5.1 Technical Specifications
* **Provider:** PostgreSQL (Designed for Neon Serverless PostgreSQL)
* **ORM:** Prisma Client v5.22.0 (`@prisma/client`)
* **Schema Location:** `application/prisma/schema.prisma`
* **Connection Pooling:** Supported via pgbouncer connection string in `DATABASE_URL`.
* **Direct DDL Connection:** Supported via unpooled connection string in `DIRECT_URL`.
* **Client Singleton:** `application/lib/prisma.ts` guarantees a single shared connection instance across serverless invocations.

### 5.2 Primary Schema Entities
* `Lead`: Core prospect entity holding travel requirements, channel origin, stage, and priority.
* `Customer`: Verified client profile holding lifetime booking history and contact records.
* `Booking`: Confirmed reservation record holding payment and voucher tracking.
* `Quotation`: Cost breakdown, itemized services, and terms.
* `Activity`: Comprehensive audit trail of calls, emails, WhatsApp messages, and status updates.
* `FollowUp`: Scheduled tasks assigned to travel consultants.
* `Communication`: Detailed message logs for omnichannel customer interactions.
* `User`: Staff and administrator authentication credentials and roles.

### 5.3 Hybrid Architecture: In-Memory / Local Storage Fallback
* In `application/lib/crm/store.ts`, the CRM architecture includes a complete hybrid repository (`crmRepo`).
* If PostgreSQL is temporarily unreachable or undergoing maintenance, the CRM seamlessly falls back to a durable local JSON repository (`leads.json`), preventing operational downtime.

---

## 6. Payment Gateways Status

* **Current Implementation:** Manual CRM Payment Tracking (`application/app/actions/phase3.ts`).
* Payments are recorded by travel consultants upon receipt of bank transfer, UPI, or offline payment.
* **Online Payment Gateways (Razorpay / Stripe):**
  * Not installed in `package.json`.
  * No webhook routes or payment client scripts exist.
  * Payment links can be included in quotations manually or via future gateway integration.

