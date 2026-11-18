# Varni Holidays — Existing Architecture & Codebase Audit
**Document Version:** 1.0.0  
**Date:** 17 November 2026  
**Target Architecture:** Connected Platform (Public Website + Customer PWA + Employee Portal & CRM)

---

## 1. Executive Summary

This audit assesses the current state of the Varni Holidays platform across all architectural layers: frontend, routing, backend services, Prisma/PostgreSQL database models, authentication, CRM workflows, and third-party integrations.

The platform is in an active production state with high-value operational modules already established in the Admin and CRM domains. The target state requires introducing a modern, mobile-first Customer PWA experience without disturbing existing operational records, admin RBAC, or communication integrations.

---

## 2. Technology Stack & Infrastructure

| Layer | Current Implementation | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js 14.2.35 (App Router) | ✅ Working | Optimized hybrid SSR/SSG (79 routes active) |
| **Language** | TypeScript 5.x | ✅ Working | Strict type checking active (`npx tsc --noEmit` clean) |
| **Styling** | Tailwind CSS + Lucide Icons | ✅ Working | Custom design tokens & destination theme engine |
| **Database** | PostgreSQL via Neon Serverless | ✅ Working | Pooled & direct connections via Prisma ORM 5.22.0 |
| **Auth (Staff)** | Custom Enterprise RBAC + Better Auth | ✅ Working | Single-use invitations, scrypt hashing, mandatory TOTP MFA |
| **Email** | Resend API (`varnitours.com`) | ✅ Working | Real-time delivery telemetry & verified sending domain |
| **WhatsApp** | Meta WhatsApp Cloud API | ✅ Working | Inbound webhooks, HMAC-SHA256 signature, template dispatch |
| **Sheets Sync**| Google Sheets API v4 | ✅ Working | Real-time enquiry sync to external operations spreadsheet |
| **Hosting** | Vercel Serverless | ✅ Working | Canonical domain: `https://varni-holidays.vercel.app` |

---

## 3. Module Audit & Classification

Each module is classified according to operational readiness:
- **Working**: Production-ready, fully tested.
- **Partially Implemented**: Core logic exists, needs extension or customer-facing exposure.
- **Missing**: Not yet built in the target interface.
- **Broken**: Requires immediate fix.
- **Requires Integration**: Working backend requires coupling with the Customer PWA.

### A. Public Website (`/`, `/destinations`, `/packages`, `/about`, `/contact`)
- **Homepage & Destination Showcase** (`/`): **Working**. High-fidelity destination cards, Gujarati vegetarian/Jain cuisine guarantees, office contact details.
- **Destination Immersive Theme Engine** (`/packages/[slug]`): **Working**. Custom atmospheric backgrounds, climate widgets, live tariff calculator for Kerala, Kashmir, Rajasthan, Dubai.
- **Static & Legal Pages** (`/about`, `/contact`, `/terms`, `/privacy`, `/disclaimer`): **Working**.
- **Customer Enquiry Forms**: **Working**. Dispatches leads to CRM, triggers Resend confirmation emails, syncs to Google Sheets.

### B. Employee & Admin Management Portal (`/admin`, `/employee`)
- **Admin Authentication & Onboarding** (`/admin/login`, `/admin/onboarding`, `/admin/mfa`): **Working**.
  - Single-use 48-hour invitation links.
  - Zero-exposure token hashes (SHA-256).
  - Mandatory TOTP MFA setup (Google Authenticator, Microsoft Authenticator, 1Password).
  - Rate limiting (5 attempts / 15 mins) and account lockout protection.
  - Session revocation and strict cookie management.
- **Role-Based Access Control (RBAC)** (`/admin/settings/roles`): **Working**.
  - Roles: `OWNER`, `SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SALES_EXECUTIVE`, `ACCOUNTANT`, `VISA_OFFICER`.
  - Fine-grained permission checks on every Server Action (`requirePermission`).
- **Staff Governance Directory** (`/admin/users`): **Working**.
  - Invite new staff with role assignment.
  - Live Resend delivery telemetry badge (`DELIVERED`, `SENT`, `BOUNCED`, `FAILED`).
  - Resend invitation (with token refresh) and Revoke actions.
  - Direct backup onboarding link copy for emergency WhatsApp sharing.
- **Employee Portal** (`/employee/dashboard`, `/employee/leads`, etc.): **Partially Implemented**.
  - Accessible via dedicated employee session.
  - Needs UI parity with the modern Admin light theme.

### C. CRM & Lead Lifecycle (`/admin/leads`, `/admin/enquiries`, `/admin/customers`)
- **Enquiry Routing & Ingestion**: **Working**.
  - Service types: `PACKAGE`, `FLIGHT`, `VISA`, `CUSTOM_HOLIDAY`, `TRAVEL_INSURANCE`, `GENERAL`.
  - Auto-creates `Customer` (deduplicated by phone/email) and associated `Lead`.
- **Pipeline Progression**: **Working**.
  - Stages: `REQUESTS` → `GENERAL` → `PRIORITY` → `CONVERTED` → `CLOSED`.
- **Customer Management & Deduplication** (`/admin/customers`, `/admin/deduplication`): **Working**.
  - Phone normalization (+91 / standard clean digits).
  - Detection of duplicate leads; merge subordinate customer profiles into master record.
- **Activity & Follow-ups** (`/admin/follow-ups`, `/admin/activity`): **Working**.
  - Log calls, meetings, notes, and scheduled task reminders.

### D. Quotations & Itineraries (`/admin/quotations`, `/quotation/[id]`)
- **Quotation Generator** (`/admin/quotations/create`): **Working**.
  - Hotel tier calculations (Budget 3★, Premium 4★, Luxury 5★).
  - Dynamic pricing matrix per package, vehicle type, and passenger count.
  - GST, seasonal supplements, and custom line item breakdown.
- **Customer-Facing Quotation View** (`/quotation/[id]`, `/quotation/[id]/preview`): **Working**.
  - Clean client preview and printable PDF generation (`/api/quotations/[id]/pdf`).
  - Snapshot versioning (`QuotationSnapshot`) preventing post-approval tariff tampering.

### E. Bookings, Payments & Operations (`/admin/bookings`, `/admin/payments`, `/admin/operations`)
- **Booking Records**: **Working**.
  - Linked to Customer, Lead, and Quotation.
  - Tracks total amount, balance, travel dates, passenger manifests, and hotel reservations.
- **Payment Records** (`/admin/payments`): **Partially Implemented**.
  - Records manual cash, UPI, NEFT, and card payments.
  - Live Razorpay/Cashfree payment gateway webhook integration: **Requires Integration**.
- **Departures Calendar** (`/admin/operations/calendar`, `/admin/operations/departures`): **Working**.

### F. Visa Automation & Document Wallet (`/admin/communications/visa`)
- **Visa Application Management**: **Working**.
  - Application stages: `DOCUMENTS_PENDING`, `SUBMITTED`, `EMBASSY_PROCESSING`, `APPROVED`, `REJECTED`.
  - Document checklist tracking per country (Schengen, UK, Dubai, Singapore, etc.).
- **Official Visa Email Composer**: **Working**.
  - Multi-tab email composer with template insertion, attachment preview, and Resend delivery.
- **Customer Document Upload & Wallet**: **Missing (for Customer PWA)**.
  - Documents exist in DB (`VisaDocument`), but self-serve customer uploading is not yet exposed in a PWA interface.

### G. Communications & WhatsApp Engine (`/admin/communications/whatsapp`)
- **Outbound WhatsApp Templates**: **Working**.
  - Booking confirmation, quotation dispatches, and follow-up templates.
- **Inbound WhatsApp Webhook**: **Working**.
  - Signature validation (`X-Hub-Signature-256`), lead creation, two-way messaging thread storage.
- **Live Chat Takeover**: **Working**. Staff can reply directly to WhatsApp leads from `/admin/communications/whatsapp`.

---

## 4. Target Customer PWA Interface (`/app` or `/customer`)

| Required Capability | Current Backend State | Required PWA Frontend State | Classification |
| :--- | :--- | :--- | :--- |
| **Customer Auth (Google/Apple)** | None (Staff-only Better Auth exists) | OAuth Sign-in & Session Token | **Missing** |
| **Customer Profile Management** | `Customer` model exists | Mobile profile, emergency contacts | **Requires Integration** |
| **Trip & Itinerary Tracker** | `Booking` & `PackageItineraryDay` exist | Day-by-day interactive timeline | **Requires Integration** |
| **Live Quotation Approvals** | `Quotation` & `/quotation/[id]` exist | In-app quotation accept & reject | **Requires Integration** |
| **Digital Document Wallet** | `VisaDocument` exists | Secure customer file viewer/uploader | **Requires Integration** |
| **Visa Application Tracker** | `VisaApplication` & `VisaStatusHistory` exist | Step-by-step progress steppers | **Requires Integration** |
| **Payment History & Invoices** | `PaymentRecord` exists | Payment list, receipts & pay now | **Requires Integration** |
| **Customer Support / WhatsApp** | `WhatsAppConversation` exists | Direct chat link & ticket support | **Requires Integration** |

---

## 5. Security & Isolation Assessment

1. **Customer Data Boundary**:
   - Customers must strictly authenticate into customer sessions (`customer_session`), completely separated from administrative staff sessions (`varni_session`).
   - Server-side access control: APIs and Server Actions must query records filtered by `where: { customerId: session.customerId }`.
   - Never expose internal staff notes, lead priority flags, or employee assignments to customer endpoints.
2. **Account Linking Protocol**:
   - Matching email or phone number between an inbound enquiry and an existing profile must **never** automatically bind customer portal access without cryptographic MFA verification (OTP sent via Resend email or WhatsApp OTP).

---

## 6. Audit Verdict & Architecture Next Steps

- **Core Foundation**: Extremely robust. Neon PostgreSQL schema already contains 90% of the data structures required for the Customer PWA (`Customer`, `Booking`, `Quotation`, `VisaApplication`, `VisaDocument`, `PaymentRecord`).
- **Zero Need to Rebuild**: Do not touch existing Admin CRM actions, pricing engines, or verified email templates.
- **Immediate Task**: Establish the shared design system tokens and connect the customer routes to existing backend Prisma models.
