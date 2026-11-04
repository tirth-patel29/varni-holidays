# REQUIREMENTS TRACEABILITY MATRIX (RTM)
**Project:** VARNI HOLIDAYS Travel Management Platform  
**Document Code:** RTM-VH-02 (Revision 2 — Post Architecture Review)  
**Version:** 2.0 (Phase 0 Corrected Baseline)  
**Date:** 04 November 2026

---

## 1. Overview & Legend

This Requirements Traceability Matrix connects every functional requirement, non-functional constraint, and architectural standard from the SRS Draft (`Varni_Holidays_Phase_1_SRS_Draft.pdf`), the Google Stitch design tokens, the Phase 0 forensic data audit, and the Architecture Review corrections to its specific implementation phase and verification method.

### Status Indicators
- `[CONFIRMED]`: Requirement fully specified with approved business rules and technical design.
- `[PENDING CLIENT CONFIRMATION]`: Core requirement established, awaiting business confirmation on specific operational details.
- `[EXCLUDED (PHASE 2)]`: Explicitly deferred to post-Phase 1 releases.

---

## 2. Public Website & UI Architecture

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **REQ-UI-01** | SRS Sec 4.1, Stitch DESIGN.md | Implement Warm Tactile Voyage theme: Primary Navy (`#153650`), Secondary Blue (`#24689B`), Warm Gold (`#E9B95E`), Warm Ivory (`#F8F6F0`), and Cream (`#F1EEE5`). | Global Styles / Tailwind Config | 1 | `[CONFIRMED]` | Visual regression against Stitch palette tokens; zero pure black text. |
| **REQ-UI-02** | SRS Sec 4.1 | Claymorphic surface styling with multi-angle diffuse shadows and 16px/32px/40px organic rounded corners and pill buttons. | Custom CSS / Tailwind Components | 1 | `[CONFIRMED]` | Component inspection of shadow tokens (`inset 2px 2px 4px`, etc.). |
| **REQ-UI-03** | SRS Sec 4.1 | Typography pairing: Playfair Display for editorial headings; Plus Jakarta Sans for body and UI elements. | Next.js Font Optimization (`next/font`) | 1 | `[CONFIRMED]` | Zero FOIT/CLS; font weights correctly mapped across headings and body. |
| **REQ-UI-04** | SRS Sec 4.2 | Public sitemap implementation: Home, Destinations, Tour Packages, Our Services, About Us, Contact Us, and Legal. | Next.js App Router Pages | 1 | `[CONFIRMED]` | All routes functional with appropriate metadata and OpenGraph tags. |
| **REQ-UI-05** | SRS Sec 4.3 | Homepage primary service journey tri-split: Flights, Tour Packages, and Visa Assistance prominent above the fold. | `app/(public)/page.tsx` | 1 | `[CONFIRMED]` | Three primary services accessible within 1 click from hero section. |
| **REQ-UI-06** | SRS Sec 12 | Responsive support for Desktop (1440px), Laptop (1280px), Tablet (768px), and Mobile (390px). | Layout Containers | 1 | `[CONFIRMED]` | Verified layout integrity across standard device viewports without horizontal scroll. |

---

## 3. Flight Enquiry Engine (Enquiry-Led)

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **FR-FLT-01** | SRS Sec 5.1 | Support trip types: One-way, Round-trip, and Multi-city. Routing modeled cleanly via `FlightSegment` records. | `FlightSearchForm.tsx` | 1 | `[CONFIRMED]` | Form enforces valid segment sequence (origin, destination, departure date). |
| **FR-FLT-02** | SRS Sec 5.1 | Departure and return date picker. Return date mandatory for round-trip, must be on or after departure date. | `FlightSearchForm.tsx` | 1 | `[CONFIRMED]` | Client and server validation prevents invalid or past date submission. |
| **FR-FLT-03** | SRS Sec 5.1 | Passenger counter broken down by Adults, Children (2–11 yrs), and Infants (<2 yrs). Minimum 1 adult required. Cabin class selector. | `FlightPassengerSelector.tsx` | 1 | `[CONFIRMED]` | Total passengers validated; cabin class stored with request. |
| **FR-FLT-04** | SRS Sec 5.1 | Form submit triggers contact details modal: Full Name, Email, Country Code, and Mobile Number. | `FlightContactModal.tsx` | 1 | `[CONFIRMED]` | Modal opens smoothly with search context preserved in memory. |
| **FR-FLT-05** | SRS Sec 5.1 | Country-aware phone number validation. International country calling code selector; avoids hard-coded 10-digit limits. | `CountryPhoneInput.tsx` | 1 | `[CONFIRMED]` | Validates Indian (+91 10-digit) and international phone number lengths. |
| **FR-FLT-06** | SRS Sec 5.1, AT-01 | Server-side validation via Zod; persist search criteria and customer info to database; generate unique reference `FLT-YYYYMMDD-XXXX`. | `actions/flight-enquiry.ts` | 1 | `[CONFIRMED]` | Flight enquiry record created in `Requests` stage; transaction rollback on failure. |
| **FR-FLT-07** | SRS Sec 5.1 | Display confirmation modal with reference number and manual consultation expectation. No fake live flight results. | `EnquirySuccessModal.tsx` | 1 | `[CONFIRMED]` | Reference shown; zero fabricated live airlines or prices rendered. |
| **FR-FLT-08** | SRS Sec 5.1, AT-07 | Trigger notification to assigned Flights Agent queue and optional customer confirmation email. | `services/notification.ts` | 1 | `[CONFIRMED]` | Lead appears in Employee CRM under Flights filter immediately. |

---

## 4. Tour Packages & Dynamic Pricing Engine

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **FR-PKG-01** | SRS Sec 5.2 | Browse published packages with destination, duration, budget, and travel style filters. | `app/(public)/packages/page.tsx` | 1 | `[CONFIRMED]` | Only packages with status `PUBLISHED` render on public site. |
| **FR-PKG-02** | SRS Sec 5.2 | Package detail page: editorial gallery, overview, day-wise itinerary, inclusions, exclusions, and vehicle specs. | `app/(public)/packages/[slug]/page.tsx` | 1 | `[CONFIRMED]` | Full package content rendered from database, matching Stitch visual cards. |
| **FR-PKG-03** | SRS Sec 5.2, Sec 8.1 | Interactive price calculator supporting passenger configurations (2, 4, 6, 8, 10 pax) and hotel tiers (Standard to Luxury). | `PackagePricingCalculator.tsx` | 1 | `[CONFIRMED]` | State updates instantly upon changing pax or hotel tier selections. |
| **FR-PKG-04** | SRS Sec 5.2, Sec 8.1 | Preserve both 6-passenger configurations for Kerala 6N/7D (`6PAX_INNOVA` vs. `6PAX_TRAVELLER`). | Pricing Engine | 1 | `[CONFIRMED]` | Both vehicle choices selectable with correct distinct pricing. |
| **FR-PKG-05** | SRS Sec 5.2, Sec 8.3 | Unsupported passenger counts (3, 5, 7, 9 pax) set `PricingStatus = CUSTOM_QUOTATION_REQUIRED` with nullable price. | `PackagePricingCalculator.tsx` | 1 | `[CONFIRMED]` | Form submits bespoke quotation request without fabricated linear pricing. |
| **FR-PKG-06** | SRS Sec 5.2.1 | Baseline Kerala 6N/7D demonstration package seeded with exact published source rack rates. No 15% universal recomputation. | `prisma/seed.ts` | 1 | `[CONFIRMED]` | Exact values match source DOCX table across all 5 tiers and vehicles. |
| **FR-PKG-07** | SRS Sec 5.2, AT-04 | Save immutable price snapshot with package enquiry: selected tier, pax, vehicle, unit price, total estimate, and rule version. | `actions/package-enquiry.ts` | 1 | `[CONFIRMED]` | Modifying package price in admin does not alter price saved on historical lead. |
| **FR-PKG-08** | SRS Sec 7.3 | Multi-layer price matrix management in Admin Portal: separate supplier cost, source rack rate, selling price, and markup. | `app/admin/packages/` | 2 | `[CONFIRMED]` | Super Admin can edit rates and view pricing audit history. |

---

## 5. Visa Assistance Module

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **FR-VIS-01** | SRS Sec 5.3 | Visa assistance landing page explaining support process and capturing destination country and visa category. | `app/(public)/visa/page.tsx` | 1 | `[CONFIRMED]` | Destination country and visa category (Tourist, Business, Student, etc.) selectable. |
| **FR-VIS-02** | SRS Sec 5.3 | Capture travel purpose, applicant nationality, current country of residence, planned travel date, and applicant count. | `VisaEnquiryForm.tsx` | 1 | `[CONFIRMED]` | All required travel context fields collected and validated via Zod. |
| **FR-VIS-03** | SRS Sec 5.3 | Capture customer contact info (Name, Email, Country Code, Mobile Number, and optional travel notes). | `VisaEnquiryForm.tsx` | 1 | `[CONFIRMED]` | Form submits securely; generates unique reference `VIS-YYYYMMDD-XXXX`. |
| **FR-VIS-04** | SRS Sec 5.3 | Legal disclaimer: Company provides visa application assistance and guidance; explicitly does not guarantee or issue visas. | `VisaEnquiryForm.tsx` | 1 | `[CONFIRMED]` | Prominent disclaimer rendered on form and in confirmation notification. |
| **FR-VIS-05** | SRS Sec 5.3, AT-06 | Zero sensitive passport/financial document uploads in Phase 1; document workflows initiated manually post-consultation. | Security Control | 1 | `[CONFIRMED]` | No file upload inputs exposed on public visa form. |

---

## 6. Employee CRM & Customer Identity

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **FR-CRM-01** | SRS Sec 3.1, Sec 7.2 | Granular Role-Based Access Control (RBAC): Super Admin, Flights Agent, Packages Agent, Visa Agent with discrete permissions. | `lib/auth/rbac.ts` | 2 | `[CONFIRMED]` | Server-side permission check blocks agents from unassigned service queues. |
| **FR-CRM-02** | SRS Sec 6.2 | 4-Stage Lead Pipeline: **Requests → General → Priority → Converted/Booked** (plus **Closed** terminal state). | `app/employee/pipeline/` | 2 | `[CONFIRMED]` | Leads transition between stages with mandatory actor timestamp and reason. |
| **FR-CRM-03** | SRS Sec 6.2 | Pipeline rule enforcement: Priority is a qualification state, not a sale. Converted/Booked requires explicit booking details. | `actions/lead-stage.ts` | 2 | `[CONFIRMED]` | Cannot mark Converted without entering or confirming booking reference/details. |
| **FR-CRM-04** | SRS Sec 6.3 | Comprehensive lead detail view: original enquiry context, customer profile, activity timeline, and quick action toolbar. | `app/employee/leads/[id]/` | 2 | `[CONFIRMED]` | Displays all original flight/package/visa search parameters immutably. |
| **FR-CRM-05** | SRS Sec 6.4 | Customer identity model without unique phone constraint: shared phone indexing, duplicate detection, and warning flags. | `services/customer-dedup.ts` | 2 | `[CONFIRMED]` | Shared family numbers supported; potential duplicates flagged for review. |
| **FR-CRM-06** | SRS Sec 6.4 | Audited Admin Merging: Super Admin can merge duplicate customer profiles with complete historical preservation. | `actions/admin-customer.ts` | 2 | `[CONFIRMED]` | Subordinate customer archived (`isDeleted = true`); leads and history preserved. |
| **FR-CRM-07** | SRS Sec 6.5 | Contact and activity logging: record phone calls (outcome, duration, note), emails, WhatsApp interactions, and internal notes. | `LeadActivityTimeline.tsx` | 2 | `[CONFIRMED]` | Every employee interaction logged with timestamp, actor, and outcome. |
| **FR-CRM-08** | SRS Sec 6.5 | Follow-up scheduler: set follow-up date and reminder alerts for active enquiries. | `FollowUpScheduler.tsx` | 2 | `[CONFIRMED]` | Overdue and upcoming follow-ups flagged in employee dashboard. |

---

## 7. Quotations & Proposal Management

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **FR-QTO-01** | Review Sec 6 | Generate formal Quotation (`VH-QUO-YYYYMM-XXXX`) from active lead with subtotal, taxes, discounts, and total amount. | `QuotationComposer.tsx` | 2 | `[CONFIRMED]` | Quotation created with unique reference and validity date. |
| **FR-QTO-02** | Review Sec 6 | Quotation line items distinguishing confidential supplier unit costs from customer billable amounts. | `QuotationLineItems.tsx` | 2 | `[CONFIRMED]` | Line items compute subtotal correctly; supplier costs hidden from client view. |
| **FR-QTO-03** | Review Sec 6 | Quotation lifecycle tracking: `DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `SUPERSEDED`. | `actions/quotation.ts` | 2 | `[CONFIRMED]` | Quotation status transitions logged with timestamp and actor. |
| **FR-QTO-04** | Review Sec 6 | Save immutable pricing snapshot in quotation record upon dispatch. | `actions/quotation.ts` | 2 | `[CONFIRMED]` | Future package price edits do not alter historical quotation amounts. |

---

## 8. Bookings & Payment Records

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **FR-BKG-01** | Review Sec 7 | Booking lifecycle state machine: `DRAFT` → `PENDING` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`. | `actions/booking.ts` | 3 | `[CONFIRMED]` | New bookings default to `DRAFT`. Confirmation requires advance payment. |
| **FR-BKG-02** | Review Sec 7 | Structured booking service components across Flights, Hotels, Transfers, Insurance, Cruises, and Houseboats. | `BookingServices.tsx` | 3 | `[CONFIRMED]` | Component statuses tracked independently with supplier and customer references. |
| **FR-PAY-01** | Review Sec 7 | PaymentRecord tracking: record payments with method (Bank Transfer, UPI, Card, Cash, Cheque) and status (`PENDING`, `COMPLETED`, `REFUNDED`). | `PaymentRecorder.tsx` | 3 | `[CONFIRMED]` | Payment logged with bank transaction reference and recording staff actor. |
| **FR-PAY-02** | Review Sec 7 | 50% advance booking deposit enforcement before marking booking `CONFIRMED`. | `actions/booking-confirm.ts` | 3 | `[CONFIRMED]` | System enforces advance payment threshold prior to status confirmation. |

---

## 9. Customer Progress Updates & Communication

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **FR-COM-01** | SRS Sec 6.6 | Customer update composer: send transparent operational progress updates (e.g. "Hotel reservation requested", "Itinerary ready"). | `CustomerUpdateComposer.tsx` | 3 | `[CONFIRMED]` | Form enforces selecting approved update category and channel. |
| **FR-COM-02** | SRS Sec 6.6 | Trust requirement: Status cannot state "Confirmed/Booked" until verified by staff. Must use "Requested" or "Pending Confirmation". | `services/update-validator.ts` | 3 | `[CONFIRMED]` | System blocks sending "Confirmed" template unless verification flag is checked. |
| **FR-COM-03** | Review Sec 9 | Discrete communication lifecycle: `RECORD_CREATED`, `SEND_INITIATED`, `PROVIDER_ACCEPTED`, `SENT`, `DELIVERED`, `FAILED`, `CLICK_TO_CHAT_TRIGGERED`. | `CustomerUpdate` Table | 3 | `[CONFIRMED]` | All dispatch timestamps recorded distinctly. |
| **FR-COM-04** | Review Sec 9 | Click-to-chat integrity: WhatsApp Web clicks recorded as `CLICK_TO_CHAT_TRIGGERED`, strictly prohibited from being marked as `DELIVERED`. | `services/whatsapp.ts` | 3 | `[CONFIRMED]` | Click-to-chat events isolated from delivery analytics. |
| **FR-COM-05** | SRS Sec 10.1, 10.2 | Transactional email integration via Resend/SMTP: send lead confirmations, quotation summaries, and progress updates. | `services/email-service.ts` | 3 | `[CONFIRMED]` | Emails delivered with tracked delivery status, recipient, and message ID. |

---

## 10. Security & Non-Functional Requirements

| Req ID | SRS Reference | Description | Target Module | Phase | Status | Verification Criteria |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **NFR-SEC-01** | SRS Sec 11.1 | Server-side authentication and session security. HTTP-only, secure, SameSite=Strict session cookies. | `lib/auth/session.ts` | 1 | `[CONFIRMED]` | Cookies cannot be accessed via `document.cookie`; expired sessions rejected. |
| **NFR-SEC-02** | SRS Sec 11.1 | Secure password hashing using bcrypt (cost 12) or Argon2id. No plaintext passwords stored. | `lib/auth/password.ts` | 1 | `[CONFIRMED]` | Passwords hashed prior to database insert; rainbow table resistant. |
| **NFR-SEC-03** | SRS Sec 11.2 | Parameterized database queries via Prisma ORM. Zero raw string SQL concatenation. | Prisma Client | 1 | `[CONFIRMED]` | Immune to SQL injection vulnerabilities. |
| **NFR-SEC-04** | SRS Sec 11.2 | Input validation and sanitization using Zod schemas on all server actions and API routes. | Validation Schemas | 1 | `[CONFIRMED]` | Malformed or malicious payloads rejected with field-level 400 errors. |
| **NFR-SEC-05** | SRS Sec 11.2 | Rate limiting on public enquiry submission endpoints to prevent spam and denial-of-service abuse. | `middleware.ts` | 1 | `[CONFIRMED]` | Exceeding 10 submissions per IP per 5 minutes triggers HTTP 429. |
| **NFR-SEC-06** | SRS Sec 11.3 | Security audit logging: record employee sign-ins, role modifications, lead reassignments, price edits, and customer merges. | `AuditLog` Table | 1 | `[CONFIRMED]` | Audit records immutable; cannot be modified or deleted by staff. |
| **NFR-SEC-07** | Review Sec 10 | Zero API secret keys stored in `SystemSetting` table. Managed exclusively via server environment variables. | `env.mjs` / Config | 1 | `[CONFIRMED]` | SystemSetting table restricted to public operational metadata. |
| **NFR-SEC-08** | Review Sec 2 | Elimination of destructive cascade deletions. Soft-deletion flags (`isDeleted`, `deletedAt`) applied across core entities. | Prisma Models | 1 | `[CONFIRMED]` | Cascade deletion restricted; historical records permanently preserved. |
| **NFR-SEC-09** | SRS Sec 12 | Performance & Core Web Vitals: Largest Contentful Paint (LCP) < 2.5s, First Input Delay (FID) < 100ms, CLS < 0.1. | Next.js Engine | 1 | `[CONFIRMED]` | Validated via Google Lighthouse and Next.js bundle analyzer. |
