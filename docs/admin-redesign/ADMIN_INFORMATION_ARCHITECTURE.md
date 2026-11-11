# Varni Holidays — Admin Information Architecture Specification

**Document Version:** 1.0.0  
**Generated Date:** November 2026  
**Status:** Unified System Specification  
**Design System:** Warm Ivory, Sharp Geometry, Enterprise SaaS Light Theme

---

## 1. System Navigation Hierarchy

The Unified Admin Panel is structured into seven distinct primary categories, with collapsible dropdown groups and contextual active states:

```
┌────────────────────────────────────────────────────────┐
│                   ADMIN SHELL TOPBAR                   │
│ [Breadcrumbs]    [Global Search]   [+ Quick Create]  🔔 │
├───────────────┬────────────────────────────────────────┤
│ SIDEBAR (EXP) │ MAIN WORKSPACE                         │
│               │                                        │
│ 1. OVERVIEW   │  - Executive KPI Cards                 │
│               │  - Priority Action Inbox               │
│ 2. CUSTOMERS  │  - Today's Travel Schedule             │
│    & CRM      │  - Omnichannel Inquiries & Bookings    │
│               │                                        │
│ 3. BOOKINGS   │                                        │
│    & OPS      │                                        │
│               │                                        │
│ 4. SALES      │                                        │
│    & FINANCE  │                                        │
│               │                                        │
│ 5. COMMUNI-   │                                        │
│    CATIONS    │                                        │
│               │                                        │
│ 6. REPORTS    │                                        │
│    & METRICS  │                                        │
│               │                                        │
│ 7. SETTINGS   │                                        │
│    & TEAM     │                                        │
└───────────────┴────────────────────────────────────────┘
```

---

## 2. Category Specifications

### Category 1: OVERVIEW (`/admin`)
* **Primary URL:** `/admin`
* **Sub-views / Tabbed Views:**
  * `Business Overview`: High-level executive cockpit (Total Enquiries, Active Leads, Confirmed Bookings, Total Revenue, Pending Payments, Conversion Rate).
  * `My Tasks`: Tasks assigned to the currently logged-in administrator or travel consultant.
  * `Priority Inbox`: Urgent leads, overdue follow-ups, pending quotes awaiting customer approval, approaching departures.
  * `Recent Activity`: Real-time audit log of latest bookings, enquiries, and payment events.

### Category 2: CUSTOMERS & CRM
* **All Customers:** `/admin/customers` — Complete customer directory, search by name/email/phone, booking history, lifetime spend, assigned consultant.
* **All Enquiries:** `/admin/enquiries` — Unified inbound workspace supporting Flights, Hotels, Visas, Tour Packages, Custom Journeys, Insurance, and Contact forms.
* **Lead Pipeline:** `/admin/leads` — Visual Kanban board with stage columns: `NEW`, `CONTACTED`, `REQUIREMENT_COLLECTED`, `QUOTATION_SENT`, `NEGOTIATION`, `CONVERTED`, `LOST`. Also supports tabular view.
* **Follow-ups & Reminders:** `/admin/follow-ups` — Dedicated scheduling workspace with filter tabs: Today, Overdue, Upcoming, Completed.
* **Customer Segments:** `/admin/customers/segments` — Filtered cohorts (VIP/High-Value, Frequent Flyers, Package Seekers).
* **Customer Activity:** `/admin/activity` — Cross-customer interaction stream.
* **Customer Dossier:** `/admin/customers/[id]` — Unified customer profile with 10 structured sections (Contact, Enquiries, Bookings, Quotes, Invoices, Payments, Comms, Notes, Follow-ups, Assignee).

### Category 3: BOOKINGS & OPERATIONS
* **All Bookings:** `/admin/bookings` — Unified reservations table across all travel services.
* **Service-Specific Views:**
  * Flight Bookings: `/admin/bookings?service=FLIGHT`
  * Hotel Bookings: `/admin/bookings?service=HOTEL`
  * Tour Package Bookings: `/admin/bookings?service=PACKAGE`
  * Visa Applications: `/admin/bookings?service=VISA`
  * Travel Insurance: `/admin/bookings?service=INSURANCE`
* **Upcoming Departures:** `/admin/operations/departures` — Roster of travelers departing within 7, 14, and 30 days; checklist for vouchers, tickets, and payment completion.
* **Booking Calendar:** `/admin/operations/calendar` — Visual monthly, weekly, and daily itinerary calendar.

### Category 4: SALES & FINANCE
* **Quotations:** `/admin/quotations` — Travel proposal manager (create, edit, pricing breakdown, PDF export, WhatsApp sharing, email dispatch).
* **Invoices:** `/admin/invoices` — Tax invoice register generated against confirmed bookings.
* **Payments:** `/admin/payments` — Centralized transaction ledger (cash, bank transfer, UPI, card).
* **Pending Payments:** `/admin/payments/pending` — Receivables register with overdue payment flags and follow-up triggers.
* **Revenue Overview:** `/admin/finance/revenue` — Financial performance by service, month, and conversion rates.
* **Financial Transactions:** `/admin/finance/transactions` — Itemized accounting entries.

### Category 5: COMMUNICATIONS
* **Communication History:** `/admin/communications` — Unified multi-channel interaction timeline (WhatsApp, Email, Phone calls).
* **Email Records:** `/admin/communications/emails` — Delivery status log powered by Resend API.
* **WhatsApp Records:** `/admin/communications/whatsapp` — Meta Cloud API dispatches and `CLICK_TO_CHAT_TRIGGERED` logs.
* **Call Logs:** `/admin/communications/calls` — Consultant phone logs with duration, notes, and outcomes.
* **Templates:** `/admin/communications/templates` — Approved WhatsApp message templates and branded HTML email layouts.
* **Newsletter Subscribers:** `/admin/subscribers` — Marketing subscriber list with export capabilities.

### Category 6: REPORTS & ANALYTICS
* **Business Performance:** `/admin/reports` — Executive analytics cockpit.
* **Enquiry Analytics:** `/admin/reports/enquiries` — Inbound channels, lead conversion by product.
* **Sales Analytics:** `/admin/reports/sales` — Quotation-to-booking ratios, sales cycle duration.
* **Booking Analytics:** `/admin/reports/bookings` — Average group size, top destinations, seasonality.
* **Revenue Reports:** `/admin/reports/revenue` — Gross volume, net profit margins, payment mode distribution.
* **Employee Performance:** `/admin/reports/employees` — Consultant lead conversion, follow-up speed, revenue per staff member.
* **Customer Insights:** `/admin/reports/customers` — Repeat travel frequency, customer lifetime value (CLV).

### Category 7: SETTINGS & TEAM
* **Team Members:** `/admin/users` — Staff directory, role assignments, workload overview.
* **Roles & Permissions:** `/admin/settings/roles` — Granular capability matrix.
* **Business Profile:** `/admin/settings/profile` — Anand HQ address, contact numbers, official branding.
* **Service Configuration:** `/admin/packages` — Tour package catalogs and Kerala pricing rules.
* **Email Configuration:** `/admin/settings/email` — Resend domain status and default templates.
* **WhatsApp Configuration:** `/admin/settings/whatsapp` — Meta Cloud API connection health and credentials.
* **Google Sheets Integration:** `/admin/google-sheets` — Real-time bidirectional spreadsheet synchronization engine.
* **Customer Deduplication:** `/admin/deduplication` — Automated duplicate phone/email detection and merging.
* **System Activity Logs:** `/admin/audit-logs` — Immutable administrative security audit trail.

