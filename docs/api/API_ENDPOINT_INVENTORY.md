# Varni Holidays — API Endpoint Inventory

**Document Version:** 1.0.0  
**Generated Date:** November 2026  
**Audited Codebase:** Next.js 14 App Router (`application/`)  
**Scope:** Internal HTTP Route Handlers (`app/api/`) and Server Actions (`app/actions/`)

---

## 1. Executive Summary & Inventory Matrix

| Type | Path / Function | Method | Authentication | Database Model | External Services | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Route Handler** | `/api/enquiries` | `POST` | Public | `Lead`, `Activity` | Resend, Google Sheets, WhatsApp | **Fully Implemented** |
| **Route Handler** | `/api/airports` | `GET` | Public | None (In-memory) | None | **Fully Implemented** |
| **Route Handler** | `/api/packages/kerala-price` | `POST` | Public | None (Algorithmic) | None | **Fully Implemented** |
| **Route Handler** | `/api/crm/bookings` | `GET`, `POST` | Admin Session | `Booking`, `Lead` | None | **Fully Implemented** |
| **Route Handler** | `/api/crm/communications` | `GET`, `POST` | Admin Session | `Communication`, `Lead`| Resend, WhatsApp | **Fully Implemented** |
| **Server Action** | `submitFlightEnquiry` | Server Action | Public | `Lead`, `Activity` | Resend, Google Sheets, WhatsApp | **Fully Implemented** |
| **Server Action** | `submitPackageEnquiry` | Server Action | Public | `Lead`, `Activity` | Resend, Google Sheets, WhatsApp | **Fully Implemented** |
| **Server Action** | `submitVisaEnquiry` | Server Action | Public | `Lead`, `Activity` | Resend, Google Sheets, WhatsApp | **Fully Implemented** |
| **Server Action** | `submitTravelInsuranceEnquiryAction`| Server Action | Public | `Lead`, `Activity` | Resend, Google Sheets, WhatsApp | **Fully Implemented** |
| **Server Action** | `submitContactEnquiry` | Server Action | Public | `Lead`, `Activity` | Resend, Google Sheets, WhatsApp | **Fully Implemented** |
| **Server Action** | `submitCustomHolidayEnquiry` | Server Action | Public | `Lead`, `Activity` | Resend, Google Sheets, WhatsApp | **Fully Implemented** |
| **Server Action** | `crm.ts` (18 Actions) | Server Action | Admin / Staff | `Lead`, `Customer`, `Booking`, etc. | Resend, WhatsApp | **Fully Implemented** |
| **Server Action** | `google-sheets.ts` (6 Actions) | Server Action | Admin | `GoogleSheetsSync` | Google Sheets API v4 | **Fully Implemented** |
| **Server Action** | `newsletter.ts` (2 Actions) | Server Action | Public / Admin | `NewsletterSubscriber`| Resend | **Fully Implemented** |
| **Server Action** | `phase3.ts` (3 Actions) | Server Action | Admin / Staff | `Booking`, `Payment` | Resend, Google Sheets | **Fully Implemented** |

---

## 2. HTTP Route Handlers (`application/app/api/`)

### 2.1 Public Enquiry Dispatcher

* **Path:** `/api/enquiries`
* **File:** `application/app/api/enquiries/route.ts`
* **HTTP Method:** `POST`
* **Access Level:** Public (No authentication required; protected by input sanitization and validation)
* **Purpose:** Unified public gateway for all enquiry types submitted via external forms, webhooks, or frontend components.
* **Supported Enquiry Types:**
  * `FLIGHT`
  * `PACKAGE`
  * `VISA`
  * `TRAVEL_INSURANCE`
  * `CONTACT`
  * `CUSTOM_HOLIDAY`
* **Request Payload Schema:**
  ```json
  {
    "type": "FLIGHT | PACKAGE | VISA | TRAVEL_INSURANCE | CONTACT | CUSTOM_HOLIDAY",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+919876543210",
    "destination": "Dubai, UAE",
    "travelDate": "2026-12-15",
    "passengers": 2,
    "flightDetails": {
      "tripType": "ROUND_TRIP",
      "origin": "BOM",
      "destination": "DXB",
      "departureDate": "2026-12-15",
      "returnDate": "2026-12-22",
      "adults": 2,
      "children": 0,
      "infants": 0,
      "cabinClass": "ECONOMY",
      "mealPreference": "VJML",
      "specialAssistance": "WCHR",
      "notes": "Vegetarian meal required"
    },
    "visaDetails": {
      "country": "Schengen",
      "category": "TOURIST",
      "entryType": "MULTIPLE",
      "urgency": "NORMAL",
      "travelDate": "2026-12-15",
      "notes": ""
    },
    "insuranceDetails": {
      "destination": "Worldwide",
      "tripType": "FAMILY",
      "startDate": "2026-12-15",
      "endDate": "2026-12-30",
      "travelersCount": 2,
      "travelerAges": [32, 30],
      "pedCoverage": true,
      "planTier": "GOLD"
    },
    "notes": "Custom requests or special instructions"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "leadId": "lead_1730000000000_abcde",
    "message": "Enquiry registered and dispatched successfully"
  }
  ```
* **Error Response (`400 Bad Request` / `500 Internal Error`):**
  ```json
  {
    "success": false,
    "error": "Validation failed: 'name' and 'phone' are required fields"
  }
  ```
* **Database Models Accessed:**
  * Creates or updates `Lead`
  * Records `Activity` (type: `ENQUIRY_RECEIVED`)
* **External Services Invoked:**
  * `Resend Email Service`: Sends instant customer confirmation email and admin alert email.
  * `Google Sheets Sync Engine`: Appends record to `ALL_LEADS` worksheet.
  * `WhatsApp Service`: Generates Click-to-Chat trigger or dispatches Meta Cloud API acknowledgement.
* **Consumer Components:**
  * Public Website forms (`FlightSearchSection`, `VisaEnquiryModal`, `InsuranceForm`, `CustomHolidayPlanner`, `ContactForm`).

---

### 2.2 Airport Autocomplete & Location Search

* **Path:** `/api/airports`
* **File:** `application/app/api/airports/route.ts`
* **HTTP Method:** `GET`
* **Query Parameters:**
  * `q` (string, required): Search query (e.g., `?q=delhi`, `?q=BOM`, `?q=London`). Minimum 1 character.
* **Access Level:** Public
* **Purpose:** Instant autocomplete endpoint powering origin and destination dropdowns for flight search.
* **Request Example:**
  ```http
  GET /api/airports?q=mumbai HTTP/1.1
  Host: localhost:3000
  ```
* **Response Structure (`200 OK`):**
  ```json
  [
    {
      "code": "BOM",
      "name": "Chhatrapati Shivaji Maharaj International Airport",
      "city": "Mumbai",
      "country": "India",
      "formatted": "Mumbai, India (BOM) - Chhatrapati Shivaji Maharaj Intl"
    }
  ]
  ```
* **Database Models Accessed:** None. Uses a high-performance in-memory dictionary of major domestic and international IATA hubs.
* **External Services Invoked:** None.
* **Consumer Components:**
  * `application/components/FlightSearchSection.tsx`
  * `application/components/FlightBookingModal.tsx`

---

### 2.3 Kerala Package Dynamic Pricing Engine

* **Path:** `/api/packages/kerala-price`
* **File:** `application/app/api/packages/kerala-price/route.ts`
* **HTTP Method:** `POST`
* **Access Level:** Public
* **Purpose:** Calculates real-time package pricing for Kerala flexible-duration itineraries based on business logic, duration tiers, hotel category, and season rates.
* **Request Payload Schema:**
  ```json
  {
    "packageId": "kerala-delight",
    "durationDays": 6,
    "hotelCategory": "DELUXE | PREMIUM | LUXURY",
    "travelers": 2,
    "season": "PEAK | REGULAR | OFF_PEAK"
  }
  ```
* **Response Structure (`200 OK`):**
  ```json
  {
    "success": true,
    "pricing": {
      "basePricePerPerson": 24500,
      "additionalNightPrice": 3500,
      "hotelMultiplier": 1.25,
      "totalPerPerson": 28000,
      "grandTotal": 56000,
      "taxInclusive": true,
      "currency": "INR"
    }
  }
  ```
* **Database Models Accessed:** None (Algorithmic calculation from package rate cards).
* **Consumer Components:**
  * `application/app/tours/kerala/page.tsx`
  * `application/components/KeralaPackageCalculator.tsx`

---

### 2.4 CRM Bookings Management

* **Path:** `/api/crm/bookings`
* **File:** `application/app/api/crm/bookings/route.ts`
* **HTTP Methods:** `GET`, `POST`
* **Access Level:** Admin / Staff Session
* **Purpose:** CRUD operations for travel bookings in the CRM portal.
* **GET `/api/crm/bookings`:**
  * **Query Parameters:** `status` (`CONFIRMED`, `PENDING`, `CANCELLED`), `search` (customer name or reference).
  * **Response:** Array of booking records with associated lead, customer, and payment information.
* **POST `/api/crm/bookings`:**
  * **Payload:** Customer ID, Lead ID, package/service details, total amount, initial payment, travel dates.
  * **Response:** Created booking record with reference ID (e.g. `BK-2026-1049`).
* **Database Models Accessed:** `Booking`, `Lead`, `Customer`, `Payment`.
* **External Services Invoked:** Google Sheets (`BOOKINGS` tab), Resend (confirmation email).
* **Consumer Components:**
  * `application/app/admin/bookings/page.tsx`
  * `application/components/admin/BookingForm.tsx`

---

### 2.5 CRM Communications Log

* **Path:** `/api/crm/communications`
* **File:** `application/app/api/crm/communications/route.ts`
* **HTTP Methods:** `GET`, `POST`
* **Access Level:** Admin / Staff Session
* **Purpose:** Tracks all customer communications across Email, Call, and WhatsApp.
* **GET `/api/crm/communications`:**
  * **Query Parameters:** `leadId` (optional), `channel` (`EMAIL | WHATSAPP | PHONE`).
  * **Response:** List of communication logs with timestamps, status, content, and agent ID.
* **POST `/api/crm/communications`:**
  * **Payload:**
    ```json
    {
      "leadId": "lead_123",
      "channel": "WHATSAPP | EMAIL | PHONE",
      "recipient": "+919876543210",
      "subject": "Follow-up regarding Dubai Holiday",
      "content": "Hi Jane, sharing the updated quote...",
      "metadata": { "templateId": "quote_followup_v1" }
    }
    ```
* **Database Models Accessed:** `Communication`, `Lead`, `Activity`.
* **External Services Invoked:**
  * `channel === 'EMAIL'` -> Resend API
  * `channel === 'WHATSAPP'` -> Meta WhatsApp Cloud API (or Click-to-Chat fallback)
* **Consumer Components:**
  * `application/components/admin/LeadCommunicationsTab.tsx`
  * `application/app/admin/leads/[id]/page.tsx`

---

## 3. Server Actions Inventory (`application/app/actions/`)

### 3.1 Public Enquiries (`application/app/actions/enquiries.ts`)

| Action Name | Input Parameters | Purpose | Side Effects & Integrations |
| :--- | :--- | :--- | :--- |
| `submitFlightEnquiry` | Form state / FormData / Flight payload | Processes flight search enquiries, stores meal/wheelchair requirements | Creates `Lead`, dispatches Resend confirmation, logs WhatsApp trigger, syncs to Google Sheets |
| `submitPackageEnquiry` | Package enquiry payload | Captures interest in standard or holiday packages | Creates `Lead` (category: `PACKAGE`), sends customer email, appends to Google Sheets |
| `submitVisaEnquiry` | Visa enquiry payload with custom country | Records visa assistance requests with entry & urgency specs | Creates `Lead` (category: `VISA`), dispatches Resend email, syncs to Google Sheets |
| `submitTravelInsuranceEnquiryAction` | Insurance enquiry payload | Captures insurance quotes, traveler ages, PED options | Creates `Lead` (category: `TRAVEL_INSURANCE`), sends Resend email, appends to Google Sheets |
| `submitContactEnquiry` | Contact form payload | Processes general website contact form submissions | Creates `Lead` (category: `CONTACT`), sends notification emails |
| `submitCustomHolidayEnquiry`| Custom journey planner payload | Captures detailed custom holiday planning briefs | Creates `Lead` (category: `CUSTOM_HOLIDAY`), notifies sales team |

---

### 3.2 CRM & Pipeline Management (`application/app/actions/crm.ts`)

| Action Name | Input Parameters | Purpose | Database Models Accessed |
| :--- | :--- | :--- | :--- |
| `getDashboardMetricsAction` | None | Aggregates pipeline totals, active leads, revenue, conversion rates | `Lead`, `Booking`, `Payment` |
| `getLeadsAction` | Filters (stage, search, priority, assignedTo) | Retrieves paginated and filtered lead lists for Kanban and Table views | `Lead`, `Customer` |
| `getLeadByIdAction` | `leadId: string` | Fetches complete lead record with full history, quotes, and activities | `Lead`, `Activity`, `Quotation`, `FollowUp` |
| `updateLeadStageAction` | `leadId: string, stage: LeadStage` | Transitions lead through pipeline stages (`NEW` -> `WON`/`LOST`) | `Lead`, `Activity` |
| `assignLeadAction` | `leadId: string, staffId: string` | Reassigns lead ownership to a specific travel consultant | `Lead`, `Activity` |
| `updateLeadPriorityAction` | `leadId: string, priority: Priority` | Modifies lead priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) | `Lead` |
| `logCallActivityAction` | `leadId: string, duration: number, notes: string, outcome: string` | Logs phone call summary and schedules next touchpoint | `Activity`, `Lead` |
| `logEmailActivityAction` | `leadId: string, subject: string, body: string` | Logs sent email and dispatches via Resend API | `Activity`, `Communication` |
| `recordWhatsAppClickAction` | `leadId: string, notes: string` | Logs Click-to-Chat trigger (strictly recorded as `CLICK_TO_CHAT_TRIGGERED`) | `Activity`, `Communication` |
| `addGeneralNoteAction` | `leadId: string, note: string` | Appends an internal admin note to the lead timeline | `Activity` |
| `createFollowUpAction` | `leadId: string, dueDate: string, reminderText: string` | Schedules a follow-up reminder for a staff member | `FollowUp`, `Lead` |
| `getQuotationsAction` | `leadId: string` | Retrieves all quotations generated for a customer | `Quotation` |
| `getLeadActivitiesAction` | `leadId: string` | Returns chronological timeline of all activities for a lead | `Activity` |
| `getPackageCostsAction` | `packageId: string` | Retrieves standard cost breakdown for quotation generation | Internal Package Catalog |
| `getPotentialDuplicatesAction`| `phone: string, email: string` | Checks CRM for matching phone or email to prevent duplicate leads | `Lead`, `Customer` |
| `mergeCustomersAction` | `primaryCustomerId: string, duplicateCustomerId: string` | Merges duplicate customer records, combining travel history | `Customer`, `Lead`, `Booking` |
| `getCustomersAction` | Search query, pagination | Lists registered customers with their lifetime booking value | `Customer`, `Booking` |
| `getAuditLogsAction` | Date range, staff ID | Retrieves administrative security audit logs | `AuditLog` |

---

### 3.3 Google Sheets Synchronization (`application/app/actions/google-sheets.ts`)

| Action Name | Input Parameters | Purpose | Integrations |
| :--- | :--- | :--- | :--- |
| `getGoogleSheetsStatusAction` | None | Returns connection health, last sync time, queue size, and auth mode | Google Sheets API v4 |
| `triggerManualSyncAction` | None | Triggers immediate bidirectional sync of leads and quotations | Google Sheets API v4 / Webhook |
| `retryFailedJobsAction` | None | Retries queued sync operations that failed during offline or API outages | Google Sheets API v4 |
| `testGoogleSheetsConnectionAction` | None | Performs a test read/write ping against the configured spreadsheet | Google Sheets API v4 |
| `updateGoogleSheetsSettingsAction`| `settings: GoogleSheetsConfig` | Updates spreadsheet ID or webhook URL in runtime configuration | Runtime Store / Environment |
| `disconnectGoogleSheetsAction` | None | Disables Google Sheets background sync engine | Runtime Store |

---

### 3.4 Newsletter & Marketing (`application/app/actions/newsletter.ts`)

| Action Name | Input Parameters | Purpose | Integrations |
| :--- | :--- | :--- | :--- |
| `subscribeNewsletterAction` | `email: string, source?: string` | Registers subscriber for marketing updates, discounts, and blogs | Resend (Welcome Email), `NewsletterSubscriber` |
| `getNewsletterSubscribersAction` | Pagination, search | Retrieves subscriber list for marketing team export | `NewsletterSubscriber` |

---

### 3.5 Bookings & Payments Phase 3 (`application/app/actions/phase3.ts`)

| Action Name | Input Parameters | Purpose | Database Models & Services |
| :--- | :--- | :--- | :--- |
| `createManualBookingAction` | Booking creation payload | Creates confirmed booking with itinerary and invoice details | `Booking`, `Customer`, Resend, Google Sheets |
| `updateBookingStatusAction` | `bookingId: string, status: string` | Updates status (`CONFIRMED`, `COMPLETED`, `VOUCHERED`) | `Booking`, Resend (Voucher notification) |
| `getBookingsAction` | Filters, pagination | Retrieves all customer bookings with payment statuses | `Booking`, `Payment` |

