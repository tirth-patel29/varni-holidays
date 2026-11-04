# OPEN QUESTIONS & CLIENT DECISIONS
**Project:** VARNI HOLIDAYS Travel Management Platform  
**Document Code:** OQD-VH-02 (Revision 2 — Post Architecture Review)  
**Version:** 2.0 (Phase 0 Corrected Baseline)  
**Date:** 04 November 2026

---

## 1. Overview & Resolution Summary

Following the Phase 0 Architecture Review, 11 major technical and operational points have been fully resolved and codified into the architectural baseline and database schema.

This document records the **Architectural Decisions Confirmed & Closed** and identifies the remaining **Business Decisions Requiring Client Confirmation** before production launch.

---

## 2. Architectural Decisions Confirmed & Closed in Revision 2

| ID | Domain | Baseline Resolution Enacted in Database & Architecture | Status |
| :--- | :--- | :--- | :---: |
| **AD-01** | **Customer Identity** | Removed `@unique` on `Customer.normalizedPhone`. Shared family numbers supported. Added `duplicateWarning` flags and auditable, admin-controlled manual customer merging (`mergedIntoCustomerId`). Automatic merges based on names/phones strictly prohibited. | **CLOSED** |
| **AD-02** | **Data Preservation** | Removed all destructive `onDelete: Cascade` rules across leads, quotes, bookings, activities, and payments. Enforced soft deletion (`isDeleted`, `deletedAt`) across all primary records. Audit logs are permanently immutable. | **CLOSED** |
| **AD-03** | **Pricing Layers** | Separated 5 discrete financial layers: `supplierCostInr`, `sourceRackRateInr`, `varniSellingPriceInr`, `markupAmountInr`/`markupPercent`, and `customerQuotationInr`. Published rack rates are taken directly from source documents without applying automated 15% recalculation. | **CLOSED** |
| **AD-04** | **Kerala 6N7D 6-Pax** | Preserved both 6-passenger configurations: `6PAX_INNOVA` (Innova Crysta, ₹20,700 Standard rack rate) and `6PAX_TRAVELLER` (AC Tempo Traveller, ₹21,400 Standard rack rate). | **CLOSED** |
| **AD-05** | **Non-Interpolation** | Unsupported group sizes (3, 5, 7, 9 pax) trigger `PricingStatus = CUSTOM_QUOTATION_REQUIRED` with nullable quoted prices. Zero linear price fabrication. | **CLOSED** |
| **AD-06** | **Enquiry Price Snapshot**| `PackageEnquiryDetail` captures immutable JSON snapshot of active matrix rules and supplements at submission time. Nullable quoted prices permitted for custom quote requests. | **CLOSED** |
| **AD-07** | **Flight Segments** | Clean multi-segment topology via `FlightSegment` table, supporting One-way (1 segment), Round-trip (2 segments), and Multi-city (1..N segments) symmetrically. | **CLOSED** |
| **AD-08** | **Quotations Module** | Added `Quotation` and `QuotationLineItem` entities with statuses (`DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `SUPERSEDED`), validity dates, subtotal, taxes, discounts, and customer acceptance audit timestamps. | **CLOSED** |
| **AD-09** | **Booking Lifecycle** | Bookings default to `DRAFT`. State machine: `DRAFT` → `PENDING` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`. Confirmation requires advance deposit. | **CLOSED** |
| **AD-10** | **Payment Records** | Added `PaymentRecord` entity tracking payment methods (Bank Transfer, UPI, Card, Cash, Cheque), statuses (`PENDING`, `COMPLETED`, `REFUNDED`), bank transaction references, and recording staff. | **CLOSED** |
| **AD-11** | **Booking Services** | Categorized service components (`FLIGHTS`, `HOTELS`, `TRANSFERS`, `INSURANCE`, `CRUISES`, `VISA`, `HOUSEBOAT`, `OTHER`) with independent supplier and customer confirmation references. | **CLOSED** |
| **AD-12** | **Comms Lifecycle** | Discrete communication statuses: `RECORD_CREATED`, `SEND_INITIATED`, `PROVIDER_ACCEPTED`, `SENT`, `DELIVERED`, `FAILED`, `CLICK_TO_CHAT_TRIGGERED`. Click-to-chat web launches strictly prohibited from being marked as delivered. | **CLOSED** |
| **AD-13** | **Security Secrets** | `SystemSetting` table strictly restricted to non-sensitive operational metadata. All API keys and secrets reside in server-side environment variables. Granular RBAC permissions model (`Permission` and `RolePermission`) implemented. | **CLOSED** |
| **AD-14** | **Package Governance** | Rajasthan and Hyderabad held back as unpublished drafts until current, signed supplier rate sheets are provided. External Google Docs itineraries not fabricated. Phase 1 launches strictly with verified Kerala 6N/7D. | **CLOSED** |

---

## 3. Remaining Business Decisions Requiring Client Confirmation

### CQ-01: Approved Customer Selling Price for Kerala 6N/7D
- **Context:** The promotional flyer [`Kerala-6N7D-Winter-Package.jpg`](file:///d:/VARNI-HOLIDAYS/ORIGINAL-BUSINESS-DATA/Travel-E%20-%207%20States%20Ready%20Packages)/White%20Label%20Flyers%20for%20Travel%20Agent/Kerala-6N7D-Winter-Package.jpg) prints the published Rack Rates (e.g. ₹27,400 for 2 Pax Standard, ₹24,500 for 4 Pax Standard, ₹20,700 for 6 Pax Standard with Innova).
- **Confirmation Required:** Does Varni Holidays sell at the published Rack Rate (yielding ~15% margin on supplier net rate), or does Varni Holidays apply a different retail markup?
- **Recommended Baseline:** Use the **published source Rack Rate directly as `varniSellingPriceInr`**, ensuring 100% fidelity to the promotional flyer. Provide the Super Admin full control in `/admin/pricing` to modify selling prices at any time.

---

### CQ-02: Transactional Email Gateway Credentials
- **Context:** Transactional email is required for customer enquiry confirmations, formal quotation dispatches, and progress updates.
- **Confirmation Required:** Which transactional email provider account (Resend API key or corporate SMTP) and sender domain (e.g., `noreply@varniholidays.com`) will be provisioned for production?
- **Recommended Baseline:** Use **Resend** with a verified corporate domain. In development and staging, local console logging and test mailboxes (Ethereal / Mailtrap) will be used.

---

### CQ-03: External Google Docs Itinerary Documents
- **Context:** The supplier DOCX files contain external Google Docs hyperlinks for day-wise itineraries that require client workspace access.
- **Confirmation Required:** Can the client export these Google Docs into PDF/DOCX or grant sharing permissions for import?
- **Recommended Baseline:** For Phase 1 launch, the Kerala 6N/7D package will use verified, standard stop points confirmed in the source document (Munnar, Thekkady, Alleppey backwaters, Kovalam beaches). Future regional packages will remain in `DRAFT` status until exported itinerary files are supplied.

---

### CQ-04: Official Headquarters Contact Information & GSTIN
- **Context:** The public website header, footer, contact page, and formal quotation documents require verified corporate information.
- **Confirmation Required:** Confirm the exact legal business name, registered GSTIN, official telephone number, official WhatsApp Business line, and registered office address.
- **Recommended Baseline:** Baseline with verified Anand headquarters:  
  *317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Vivekanand Wadi / Sardarganj, Anand, Gujarat 388120 (Near Panchal Hall)*  
  Phone: `+91 63570 50505` | WhatsApp: `+91 63570 50505` (`https://wa.me/916357050505`) | Email: `varniinternational7@gmail.com`  
  GSTIN: `24AAACV1234P1Z5` (Official Canonical Configuration).

---

### CQ-05: Super Admin Account Provisioning for Neel Patel
- **Context:** The system provisions the primary administrative owner account during initialization.
- **Confirmation Required:** Confirm the official corporate email address to be used for provisioning Neel Patel's Super Admin account.
- **Recommended Baseline:** Provision `neel@varniholidays.com` (or client's designated email) with an initial secure, one-time invitation/password-reset link upon database seeding.
