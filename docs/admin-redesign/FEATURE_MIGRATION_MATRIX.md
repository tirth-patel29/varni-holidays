# Varni Holidays — Admin Feature Migration & Verification Matrix

**Document Version:** 1.0.0  
**Generated Date:** November 2026  
**Status:** Verification Baseline

---

## 1. Migration Verification by Category

| # | Feature / Page | Source Path | New Unified Destination | Verified Server Action / API | Status |
| :- | :--- | :--- | :--- | :--- | :---: |
| **1.1** | Business Overview | `app/admin/page.tsx` | `/admin` (Tab 1) | `getDashboardMetricsAction()`, `getLeadsAction()`, `getBookingsAction()` | **Ready** |
| **1.2** | My Tasks | Dispersed in Employee | `/admin` (Tab 2) | `getFollowUpsAction()`, `getLeadsAction()` | **Ready** |
| **1.3** | Priority Inbox | Newly Unified | `/admin` (Tab 3) | Aggregated urgent leads & overdue follow-ups | **Ready** |
| **1.4** | Recent Activity | `app/admin/page.tsx` | `/admin` (Tab 4) | `getAuditLogsAction()`, recent bookings | **Ready** |
| **2.1** | All Customers | `app/admin/customers/page.tsx` | `/admin/customers` | `getCustomersAction()`, `getCustomerByIdAction()` | **Ready** |
| **2.2** | All Enquiries | New Unified Workspace | `/admin/enquiries` | `getLeadsAction()` (all types: Flight, Tour, Visa, Insurance, Contact) | **Ready** |
| **2.3** | Lead Pipeline | `app/admin/leads/page.tsx` | `/admin/leads` | `getLeadsAction()`, `updateLeadStageAction()`, `assignLeadAction()` | **Ready** |
| **2.4** | Follow-ups & Reminders | `app/employee/follow-ups/` | `/admin/follow-ups` | `getFollowUpsAction()`, `createFollowUpAction()`, `completeFollowUpAction()` | **Ready** |
| **2.5** | Customer Segments | New Unified Cohorts | `/admin/customers/segments` | Segmented from `getCustomersAction()` | **Ready** |
| **2.6** | Customer Activity | Part of Lead History | `/admin/activity` | `getLeadActivitiesAction()`, `getCustomerTimelineAction()` | **Ready** |
| **2.7** | Customer Profile Dossier| `app/employee/customers/[id]` | `/admin/customers/[id]` | `getCustomerByIdAction()`, `getCustomerTimelineAction()`, `getBookingsAction()` | **Ready** |
| **3.1** | All Bookings | `app/admin/bookings/page.tsx` | `/admin/bookings` | `getBookingsAction()`, `updateBookingStatusAction()`, `createManualBookingAction()` | **Ready** |
| **3.2** | Service-specific Bookings| Dispersed | `/admin/bookings?service=...` | `getBookingsAction()` filtered by service component | **Ready** |
| **3.3** | Upcoming Departures | New Unified View | `/admin/operations/departures` | Filtered from `getBookingsAction()` by departure date | **Ready** |
| **3.4** | Booking Calendar | New Visual Calendar | `/admin/operations/calendar` | Aggregated from `getBookingsAction()` | **Ready** |
| **4.1** | Quotations Workspace | `app/employee/quotations/` | `/admin/quotations` | `getQuotationsAction()`, `createQuotationAction()`, `updateQuotationStatusAction()` | **Ready** |
| **4.2** | Invoices | Sub-ledger in Bookings | `/admin/invoices` | Filtered invoice records from `getBookingsAction()` | **Ready** |
| **4.3** | Payments Register | Payment Modal in Bookings | `/admin/payments` | `recordPaymentAction()`, `getBookingsAction()` | **Ready** |
| **4.4** | Pending Payments | Filtered in Bookings | `/admin/payments/pending` | Filtered outstanding balances from `getBookingsAction()` | **Ready** |
| **4.5** | Revenue Overview | Partial in Overview | `/admin/finance/revenue` | Aggregated revenue totals from `getDashboardMetricsAction()` | **Ready** |
| **4.6** | Financial Transactions | Payment history | `/admin/finance/transactions`| Itemized transaction logs | **Ready** |
| **5.1** | Communication History | `app/employee/communications/` | `/admin/communications` | `getCommunicationsAction()`, `sendCustomerUpdateAction()` | **Ready** |
| **5.2** | Email Delivery Records | Resend server logs | `/admin/communications/emails`| Filtered `channel === 'EMAIL'` from communications | **Ready** |
| **5.3** | WhatsApp Delivery Log | Click-to-chat triggers | `/admin/communications/whatsapp`| Filtered `channel === 'WHATSAPP'` | **Ready** |
| **5.4** | Call Logs | Activity Timeline | `/admin/communications/calls` | Filtered `channel === 'CALL'` | **Ready** |
| **5.5** | Message Templates | Integration configs | `/admin/communications/templates`| WhatsApp & Resend registered templates | **Ready** |
| **5.6** | Newsletter Subscribers | `app/admin/subscribers/page.tsx`| `/admin/subscribers` | `getNewsletterSubscribersAction()` | **Ready** |
| **6.1** | Business Performance | Basic Dashboard Cards | `/admin/reports` | Unified business analytics cockpit | **Ready** |
| **6.2** | Enquiry Analytics | Newly Unified | `/admin/reports/enquiries` | Channel distribution and conversion rates | **Ready** |
| **6.3** | Sales & Booking Analytics| Newly Unified | `/admin/reports/sales` & `bookings`| Booking trends, destination popularity, average order value | **Ready** |
| **6.4** | Employee Performance | Basic Overview cards | `/admin/reports/employees` | Consultant conversion, response times, workload | **Ready** |
| **7.1** | Team Members | `app/admin/users/page.tsx` | `/admin/users` | `DEFAULT_USERS`, role checks | **Ready** |
| **7.2** | Roles & Permissions | Static session definitions | `/admin/settings/roles` | RBAC matrix for Admin, Consultant, Ops, Accountant | **Ready** |
| **7.3** | Business Profile | `lib/config/contact.ts` | `/admin/settings/profile` | Anand HQ office address, phones, branding | **Ready** |
| **7.4** | Service Packages Config | `app/admin/packages/page.tsx` | `/admin/packages` | `getPackageCostsAction()` | **Ready** |
| **7.5** | Email & WhatsApp Config | Environment files | `/admin/settings/email` & `whatsapp`| Service connection health (Zero secrets exposed) | **Ready** |
| **7.6** | Google Sheets Sync | `app/admin/google-sheets/page.tsx`| `/admin/google-sheets` | `getGoogleSheetsStatusAction()`, `triggerManualSyncAction()` | **Ready** |
| **7.7** | Customer Deduplication | `app/admin/deduplication/page.tsx`| `/admin/deduplication` | `getPotentialDuplicatesAction()`, `mergeCustomersAction()` | **Ready** |
| **7.8** | System Audit Logs | `app/admin/audit-logs/page.tsx` | `/admin/audit-logs` | `getAuditLogsAction()` | **Ready** |

---

## 2. Integrity Verification Commitments

1. **All Existing Deep Links Preserved:** Old bookmarks and routes continue to function.
2. **Zero Regressions on Public Site:** Public flight, package, visa, and insurance forms connect seamlessly to the unified `/admin/enquiries` and `/admin/leads`.
3. **Employee Portal Preserved:** The employee operational desks remain intact for travel consultants while super-administrators gain executive oversight across all seven categories.

