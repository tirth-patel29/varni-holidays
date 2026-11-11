# Varni Holidays — Existing Admin Feature Mapping & Migration Architecture

**Document Version:** 1.0.0  
**Generated Date:** November 2026  
**Status:** Mandatory Phase 0 Audit Document  
**Scope:** Mapping 100% of existing admin capabilities, routes, server actions, and models to the new Unified Travel Management Architecture.

---

## 1. Executive Summary & Migration Scope

The Varni Holidays Admin Panel is being completely reconstructed into an enterprise-grade Travel Business Management System with a unified 7-category information architecture. 

### Core Audit Principles:
1. **Zero Data Loss:** No database records, Prisma models, or historical logs will be deleted.
2. **Untouched Systems:** The **Employee Portal (`/employee/*`)** and the **Public Website (`/*`)** remain completely untouched.
3. **Backend Reuse:** All existing Server Actions (`app/actions/*`), API routes (`app/api/*`), and integration services (`lib/integrations/*`) are preserved and reused.
4. **No Feature Orphaned:** Every existing feature has an explicit destination in the new navigation hierarchy.

---

## 2. Comprehensive Feature Mapping Table

| Existing Route / Feature | Current Implementation | New Destination | Action | UI Status | Backend Adaptation Needed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Overview** (`/admin`) | `app/admin/page.tsx` (Light theme, mountain banner, KPI cards) | `/admin` (Overview) | **Retained & Enhanced** | Replaced with unified 4-tab workspace (Business Overview, My Tasks, Priority Inbox, Recent Activity) | Connected to `getDashboardMetricsAction`, `getLeadsAction`, `getBookingsAction` |
| **Leads & Pipeline** (`/admin/leads`) | `app/admin/leads/page.tsx` (Table & Kanban view) | `/admin/leads` (Lead Pipeline) & `/admin/enquiries` (All Enquiries) | **Split & Unified** | Replaced with sharp enterprise UI; separate dedicated All Enquiries workspace and interactive Kanban pipeline | Uses `getLeadsAction`, `updateLeadStageAction`, `assignLeadAction` |
| **Lead Detail** (`/admin/leads/[id]`) | `app/admin/leads/[id]/page.tsx` | `/admin/leads/[id]` | **Retained & Enhanced** | Replaced with modern customer dossier, tabs for activity, quotes, and communications | Uses `getLeadByIdAction`, `getLeadActivitiesAction`, communication actions |
| **Customers Directory** (`/admin/customers`) | `app/admin/customers/page.tsx` | `/admin/customers` (All Customers) | **Retained & Enhanced** | Replaced with advanced data table, search, filters, lifetime value metrics | Uses `getCustomersAction`, `getCustomerByIdAction` |
| **Customer Profile Dossier** (`/admin/customers/[id]`) | Previously redirected or in employee portal (`/employee/customers/[id]`) | `/admin/customers/[id]` | **Newly Unified in Admin** | Comprehensive unified profile (Contact, Enquiries, Bookings, Quotes, Invoices, Timeline) | Uses `getCustomerByIdAction`, `getCustomerTimelineAction`, `getBookingsAction` |
| **Bookings & Vouchers** (`/admin/bookings`) | `app/admin/bookings/page.tsx` | `/admin/bookings` (All Bookings) + Service Filters | **Retained & Expanded** | Replaced with multi-service table (Flights, Hotels, Packages, Visas, Insurance) | Uses `getBookingsAction`, `updateBookingStatusAction`, `createManualBookingAction` |
| **Booking Detail & Vouchers** | In employee portal (`/employee/bookings/[id]`) | `/admin/bookings/[id]` | **Newly Unified in Admin** | Full booking dossier, passenger roster, vouchers, payment status | Uses `getBookingDetailsAction`, `updateBookingStatusAction` |
| **Quotations** | Linked externally to `/employee/quotations` | `/admin/quotations` (Sales & Finance) | **Newly Unified in Admin** | Full quotation workspace: creation, editing, PDF generation, email/WhatsApp dispatch | Uses `getQuotationsAction`, `createQuotationAction`, `updateQuotationStatusAction` |
| **Invoices** | Sub-component inside bookings | `/admin/invoices` (Sales & Finance) | **Newly Unified in Admin** | Centralized invoice register linked to bookings and customer records | Filtered from `getBookingsAction` / payment records |
| **Payments Register** | Logged via modal dialog | `/admin/payments` (Sales & Finance) | **Newly Unified in Admin** | Comprehensive ledger: transaction ref, payment method, booking ID, amount | Uses `recordPaymentAction`, `getBookingsAction` |
| **Pending Payments** | Dispersed in booking status | `/admin/payments/pending` | **Newly Unified in Admin** | Dedicated collection list with overdue flags and customer follow-up actions | Filtered from `getBookingsAction` where `balanceAmount > 0` |
| **Revenue & Financials** | Basic metrics in overview | `/admin/finance/revenue` | **Newly Unified in Admin** | Service-wise breakdown, monthly trends, conversion value | Aggregated from `getDashboardMetricsAction` and `getBookingsAction` |
| **Follow-ups & Reminders** | Only available in employee portal (`/employee/follow-ups`) | `/admin/follow-ups` (Customers & CRM) | **Newly Unified in Admin** | 4 views: Today, Overdue, Upcoming, Completed; assigned consultant filtering | Uses `getFollowUpsAction`, `createFollowUpAction`, `completeFollowUpAction` |
| **Customer Segments** | Not isolated | `/admin/customers/segments` | **Newly Unified in Admin** | High Value, Frequent Flyers, Holiday Seekers, Corporate | Aggregated from customer booking history and spend tiers |
| **Upcoming Departures** | Dispersed in bookings | `/admin/operations/departures` | **Newly Unified in Admin** | Calendar alert list for travel departing in next 7/14/30 days, missing docs alerts | Filtered from `getBookingsAction` by `travelStartDate` |
| **Booking Calendar** | Not implemented | `/admin/operations/calendar` | **Newly Unified in Admin** | Visual monthly/weekly calendar of confirmed trips, follow-up deadlines | Aggregated from `getBookingsAction` and `getFollowUpsAction` |
| **Communication History** | In employee portal (`/employee/communications`) | `/admin/communications` | **Newly Unified in Admin** | Omnichannel timeline (WhatsApp, Email, Calls) with direction and status | Uses `getCommunicationsAction`, `sendCustomerUpdateAction` |
| **Email Records** | Raw server logs | `/admin/communications/emails` | **Newly Unified in Admin** | Resend delivery ledger, recipient, subject, delivery status, timestamp | Filtered from `getCommunicationsAction` (`channel === 'EMAIL'`) |
| **WhatsApp Records** | Click-to-chat logs | `/admin/communications/whatsapp` | **Newly Unified in Admin** | Meta Cloud API acceptance and `CLICK_TO_CHAT_TRIGGERED` logs | Filtered from `getCommunicationsAction` (`channel === 'WHATSAPP'`) |
| **Call Logs** | Part of activity timeline | `/admin/communications/calls` | **Newly Unified in Admin** | Travel consultant phone logs with duration, outcome, and notes | Filtered from `getCommunicationsAction` (`channel === 'CALL'`) |
| **Message Templates** | Hardcoded strings | `/admin/communications/templates` | **Newly Unified in Admin** | Library of approved WhatsApp templates and branded email layouts | Uses template configurations in `lib/integrations/` |
| **Newsletter Subscribers** (`/admin/subscribers`) | `app/admin/subscribers/page.tsx` | `/admin/subscribers` (Communications) | **Retained & Enhanced** | Replaced with sharp enterprise table, CSV export, unsubscribe controls | Uses `getNewsletterSubscribersAction` |
| **Reports & Analytics** | Basic KPI widgets in dashboard | `/admin/reports` (Reports & Analytics) | **Newly Unified in Admin** | Multi-tab analytics: Business Performance, Enquiry, Sales, Bookings, Revenue, Employees | Aggregated from CRM store, leads, and bookings |
| **Employee & Team Management** (`/admin/users`) | `app/admin/users/page.tsx` | `/admin/users` (Settings & Team) | **Retained & Enhanced** | Replaced with enterprise team directory, workload overview, role editor | Uses `DEFAULT_USERS`, role checks |
| **Roles & Permissions** | Hardcoded in `session.ts` | `/admin/settings/roles` | **Newly Unified in Admin** | Visual matrix of SUPER_ADMIN, TRAVEL_CONSULTANT, OPERATIONS, ACCOUNTANT permissions | Uses `DEFAULT_USERS` and role definitions |
| **Business Profile** | Static config in `contact.ts` | `/admin/settings/profile` | **Newly Unified in Admin** | Office address, official phones, WhatsApp contact, operating hours | Connects to `COMPANY_CONTACT` |
| **Tour Packages Config** (`/admin/packages`) | `app/admin/packages/page.tsx` | `/admin/packages` (Settings & Team) | **Retained & Enhanced** | Package rate cards, duration multipliers, season pricing | Uses package store / `getPackageCostsAction` |
| **Email & WhatsApp Config** | Environment variables only | `/admin/settings/email` & `/admin/settings/whatsapp` | **Newly Unified in Admin** | Verified domains, sender identity, Meta Cloud API connection status | Safe diagnostics (Zero secrets exposed) |
| **Google Sheets Sync** (`/admin/google-sheets`) | `app/admin/google-sheets/page.tsx` | `/admin/google-sheets` (Settings & Team) | **Retained & Enhanced** | Real-time connection diagnostic, manual sync trigger, retry queue | Uses `getGoogleSheetsStatusAction`, `triggerManualSyncAction` |
| **Customer Deduplication** (`/admin/deduplication`) | `app/admin/deduplication/page.tsx` | `/admin/deduplication` (Settings & Team) | **Retained & Enhanced** | Duplicate detection (by phone & email), profile merger | Uses `getPotentialDuplicatesAction`, `mergeCustomersAction` |
| **System Audit Logs** (`/admin/audit-logs`) | `app/admin/audit-logs/page.tsx` | `/admin/audit-logs` (Settings & Team) | **Retained & Enhanced** | Security audit trail, actor ID, action type, IP address, timestamp | Uses `getAuditLogsAction` |

---

## 3. Seven Navigation Categories Architecture

```
1. OVERVIEW (/admin)
   ├── Business Overview
   ├── My Tasks
   ├── Priority Inbox
   └── Recent Activity

2. CUSTOMERS & CRM
   ├── All Customers (/admin/customers)
   ├── All Enquiries (/admin/enquiries)
   ├── Lead Pipeline (/admin/leads)
   ├── Follow-ups & Reminders (/admin/follow-ups)
   ├── Customer Segments (/admin/customers/segments)
   └── Customer Activity (/admin/activity)

3. BOOKINGS & OPERATIONS
   ├── All Bookings (/admin/bookings)
   ├── Flight Bookings (/admin/bookings?service=FLIGHT)
   ├── Hotel Bookings (/admin/bookings?service=HOTEL)
   ├── Tour Package Bookings (/admin/bookings?service=PACKAGE)
   ├── Visa Applications (/admin/bookings?service=VISA)
   ├── Travel Insurance (/admin/bookings?service=INSURANCE)
   ├── Upcoming Departures (/admin/operations/departures)
   └── Booking Calendar (/admin/operations/calendar)

4. SALES & FINANCE
   ├── Quotations (/admin/quotations)
   ├── Invoices (/admin/invoices)
   ├── Payments (/admin/payments)
   ├── Pending Payments (/admin/payments/pending)
   ├── Revenue Overview (/admin/finance/revenue)
   └── Financial Transactions (/admin/finance/transactions)

5. COMMUNICATIONS
   ├── Communication History (/admin/communications)
   ├── Email Records (/admin/communications/emails)
   ├── WhatsApp Records (/admin/communications/whatsapp)
   ├── Call Logs (/admin/communications/calls)
   ├── Templates (/admin/communications/templates)
   └── Newsletter Subscribers (/admin/subscribers)

6. REPORTS & ANALYTICS
   ├── Business Performance (/admin/reports)
   ├── Enquiry Analytics (/admin/reports/enquiries)
   ├── Sales Analytics (/admin/reports/sales)
   ├── Booking Analytics (/admin/reports/bookings)
   ├── Revenue Reports (/admin/reports/revenue)
   ├── Employee Performance (/admin/reports/employees)
   └── Customer Insights (/admin/reports/customers)

7. SETTINGS & TEAM
   ├── Team Members (/admin/users)
   ├── Roles & Permissions (/admin/settings/roles)
   ├── Business Profile (/admin/settings/profile)
   ├── Service Configuration (/admin/packages)
   ├── Email Configuration (/admin/settings/email)
   ├── WhatsApp Configuration (/admin/settings/whatsapp)
   ├── Google Sheets Integration (/admin/google-sheets)
   ├── Customer Deduplication (/admin/deduplication)
   └── System Activity Logs (/admin/audit-logs)
```

---

## 4. Preservation & Compatibility Guarantees

1. **Existing Routes Preserved:** All existing routes (`/admin`, `/admin/leads`, `/admin/customers`, `/admin/bookings`, `/admin/users`, `/admin/google-sheets`, `/admin/subscribers`, `/admin/audit-logs`, `/admin/deduplication`, `/admin/packages`) are maintained with backwards-compatible URL structures.
2. **Deep-linking Preserved:** Routes like `/admin/leads/[id]` remain operational and fully styled with the unified design language.
3. **Employee Portal Untouched:** No modifications will be made to files in `application/app/employee/`.
4. **Public Website Untouched:** No modifications will be made to files in public site routes (`about`, `packages`, `hotels`, `visa`, `travel-insurance`, `contact`, etc.).

