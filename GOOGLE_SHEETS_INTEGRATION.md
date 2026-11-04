# GOOGLE SHEETS LIVE BUSINESS REPORTING INTEGRATION SPECIFICATION
**Project:** VARNI HOLIDAYS Travel Management Platform  
**Document Code:** GS-INT-VH-01  
**Milestone:** Phase 2.1  
**Target Executive:** Neel Patel (Proprietor & Super Admin)  
**Date:** 04 November 2026  

---

## 1. Executive Summary & Core Business Rule

This integration fulfills Neel Patel's specific management requirement:
> **"Neel Patel wants to VIEW business information in Google Sheets. He does not want to manage or edit CRM records through Google Sheets."**

### Core Principles
1. **PostgreSQL as the Sole Source of Truth:** The database maintains exclusive authority over customer records, leads, pipeline stages, quotations, and bookings.
2. **Strictly One-Way Synchronization:** Data flows exclusively in one direction:
   $$\text{PostgreSQL} \xrightarrow{\text{Atomic Outbox}} \text{Background Sync Worker} \xrightarrow{\text{Google Sheets API v4}} \text{Executive Workbook}$$
3. **Zero Inbound Mutations:** The application never reads or imports edits made to the Google Sheets workbook.
4. **Viewer-Only Access for Neel Patel:** Neel Patel (`neel@varniholidays.com`) is provisioned with Google Sheets `Viewer` permissions. The dedicated backend service account holds `Editor` permissions to push data.
5. **Operational Outage Isolation:** If Google Sheets API experiences an outage, rate limit, or network failure, all CRM operations and customer submissions continue without interruption. The transactional outbox safely retains jobs for automatic retry.

---

## 2. Workbook Architecture (4 Dedicated Tabs)

The integration synchronizes one Google Sheets workbook containing four distinct reporting tabs:

```
[Varni Holidays Executive Reporting Workbook]
├── 1. ALL_LEADS          (Operational Customer Inquiries)
├── 2. FOLLOW_UPS         (Customer Callback & Task Tracking)
├── 3. BOOKINGS           (Verified Converted Bookings)
└── 4. BUSINESS_SUMMARY   (Derived Funnel & Performance KPIs)
```

---

### Tab 1: ALL_LEADS
Contains one row per customer enquiry. Existing rows are updated idempotently by matching **Lead ID** in Column A.

| Column Index | Column Header | Data Source & Transformation | Example |
| :---: | :--- | :--- | :--- |
| **A** | `Lead ID` | Stable Unique Lead Reference | `PKG-20261104-1213` |
| **B** | `Enquiry Date` | Submission date formatted in IST (`DD/MM/YYYY`) | `04/11/2026` |
| **C** | `Customer Name` | Primary contact name | `Chirag Patel` |
| **D** | `Phone Number` | Normalized E.164 phone string | `+919825012345` |
| **E** | `Email` | Customer email or `'N/A'` | `chirag.patel@charotar.in` |
| **F** | `Service Category` | `FLIGHT`, `PACKAGE`, or `VISA` | `PACKAGE` |
| **G** | `Destination / Package`| Destination summary or package title | `Kerala 6N/7D Winter CPAI` |
| **H** | `Travel Date` | Requested departure or travel month | `2026-12-15` |
| **I** | `Lead Stage` | Active stage: `REQUESTS`, `GENERAL`, `PRIORITY`, `CONVERTED`, `CLOSED` | `PRIORITY` |
| **J** | `Priority` | Urgency tier: `LOW`, `MEDIUM`, `HIGH`, `URGENT` | `HIGH` |
| **K** | `Assigned Employee` | Assigned specialist or `'Unassigned'` | `Harshil Desai` |
| **L** | `Last Contacted Date` | Date of last call, note, or WhatsApp click | `04/11/2026` |
| **M** | `Next Follow-Up` | Date of scheduled upcoming reminder or `'None Scheduled'` | `05/11/2026` |
| **N** | `Updated Timestamp` | ISO timestamp of last database record modification | `2026-11-04T09:30:00.000Z` |

---

### Tab 2: FOLLOW_UPS
Maintains an auditable log of customer callback appointments and follow-up activities.

| Column Index | Column Header | Description | Example |
| :---: | :--- | :--- | :--- |
| **A** | `Follow-up ID` | Stable unique follow-up identifier | `flw-1730713000-101` |
| **B** | `Lead ID` | Related Lead Reference | `PKG-20261104-1213` |
| **C** | `Customer` | Full customer name | `Chirag Patel` |
| **D** | `Assigned Employee`| Staff member responsible for execution | `Harshil Desai` |
| **E** | `Due Date` | Target scheduled timestamp (IST) | `05/11/2026, 11:30 AM` |
| **F** | `Follow-up Status` | `PENDING`, `COMPLETED`, or `CANCELLED` | `PENDING` |
| **G** | `Completion Timestamp`| Verified execution time or `'Pending'` | `Pending` |

---

### Tab 3: BOOKINGS
Maintains verified booking records. Only actual confirmed bookings appear here.

| Column Index | Column Header | Description | Example |
| :---: | :--- | :--- | :--- |
| **A** | `Booking Reference` | Permanent booking code | `VH-BKG-202611-0001` |
| **B** | `Customer` | Customer name | `Bhavik Joshi` |
| **C** | `Service Category` | `FLIGHT`, `PACKAGE`, or `VISA` | `PACKAGE` |
| **D** | `Related Lead ID` | Attributed lead reference | `PKG-20261028-4914` |
| **E** | `Assigned Employee`| Booking manager | `Harshil Desai` |
| **F** | `Travel Dates` | Date span string | `10/12/2026 to 16/12/2026` |
| **G** | `Booking Status` | `DRAFT`, `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED` | `CONFIRMED` |
| **H** | `Booking Creation Date`| Booking creation timestamp | `03/11/2026` |

---

### Tab 4: BUSINESS_SUMMARY
An executive dashboard rendered directly in Google Sheets displaying verified calculations derived from the PostgreSQL database.

#### Layout & Metrics Breakdown
1. **Executive Header:** Business name, Proprietor name, Data mode (`PostgreSQL Live Outbox Sync`), and Report generation timestamp.
2. **Section 1: Pipeline Funnel Metrics:**
   - *Total Enquiries Received:* Count of all non-deleted leads.
   - *Flight Enquiries:* Count of leads where `serviceType = FLIGHT`.
   - *Package Tour Enquiries:* Count of leads where `serviceType = PACKAGE`.
   - *Visa Assistance Enquiries:* Count of leads where `serviceType = VISA`.
   - *Stage Breakdown:* Real-time counts for `REQUESTS`, `GENERAL`, `PRIORITY`, `CONVERTED`, and `CLOSED`.
3. **Section 2: Operational & Client Health:**
   - *Pending Client Follow-Ups:* Follow-ups with status `PENDING`.
   - *Overdue Follow-Ups:* Follow-ups with status `PENDING` where `scheduledAt < now`.
   - *Confirmed Bookings:* Count of bookings with status `CONFIRMED`.
4. **Section 3: Employee Performance Matrix:**
   - Tabulates each team member (Neel Patel, Harshil Desai, Priya Sharma, Ananya Joshi) with Active Leads count, Converted Leads count, and Conversion Rate ($\%$).
5. **Section 4: Service Conversion Efficiency:**
   - Tabulates conversion rates across Flight Enquiries, Package Holidays, and Visa Assistance.
6. **Section 5: Data Governance & Integrity:**
   - Explicitly codifies data flow, viewer privilege for Neel Patel, and confirmation of confidential data exclusion.

> [!IMPORTANT]
> **Strict Revenue Reporting Rule:** Estimated package prices and quotation amounts are **NEVER** reported as actual revenue. Only confirmed bookings with verified advance deposits reflect financial commitment.

---

## 3. Transactional Outbox Pattern & Sync Mechanism

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Travel Desk Agent
    participant CRM as Next.js Server Action
    participant DB as PostgreSQL Database
    participant Outbox as Sync Outbox Queue
    participant Worker as Background Sync Engine
    participant Sheets as Google Sheets API v4

    Agent->>CRM: Update Lead Stage / Assign Staff
    activate CRM
    CRM->>DB: UPDATE leads SET stage = 'PRIORITY'
    CRM->>Outbox: INSERT INTO sync_outbox (status = 'PENDING')
    Note over DB,Outbox: Committed in the same atomic transaction
    CRM-->>Agent: Action Completed (Success)
    deactivate CRM

    loop Near-Real-Time Queue Poller
        Worker->>Outbox: SELECT * FROM sync_outbox WHERE status = 'PENDING'
        alt Online & Connected
            Worker->>Sheets: spreadsheets.values.update (Idempotent Row Upsert)
            Sheets-->>Worker: HTTP 200 OK
            Worker->>Outbox: UPDATE sync_outbox SET status = 'COMPLETED'
        else Google API Outage / Network Drop
            Sheets-->>Worker: HTTP 503 / Timeout
            Worker->>Outbox: UPDATE sync_outbox SET status = 'FAILED', retryCount + 1
            Note over Worker,Outbox: Job preserved for automatic retry; CRM unaffected
        end
    end
```

### Event Triggers
The transactional outbox captures the following discrete lifecycle events:
- `LEAD_CREATED`: New enquiry submitted via website or entered at desk.
- `LEAD_UPDATED`: Customer details or itinerary notes modified.
- `STAGE_CHANGED`: Lead transitioned across pipeline stages (`Requests → General → Priority → Converted/Closed`).
- `ASSIGNMENT_CHANGED`: Lead reassigned to a different travel specialist.
- `FOLLOW_UP_CREATED`: Callback reminder scheduled.
- `FOLLOW_UP_UPDATED`: Follow-up completed or cancelled.
- `BOOKING_CREATED`: Formal booking created.
- `BOOKING_STATUS_CHANGED`: Advance payment verified and booking confirmed.
- `RECONCILIATION_FULL`: Triggered via admin "Sync Now" button to reconcile all 4 tabs simultaneously.

---

## 4. Strict Security & Confidentiality Boundary

In accordance with Section 6 of the business mandate, the sync engine runs a mandatory sanitization pass before constructing any Google Sheets payload.

### Strictly Excluded Fields (Never Transferred to Google Sheets)
- **Customer Passport Details:** Passport numbers, expiry dates, and document image uploads.
- **Visa Documentation:** Bank statements, employment letters, and identity cards.
- **Date of Birth:** Customer DOB and age details.
- **Confidential Supplier Net Costs:** Contracted B2B vehicle rates and hotel net rates.
- **Agency Profit Margins:** Gross markup percentages and internal pricing formulas.
- **Payment Credentials:** Bank account numbers, card credentials, and raw gateway tokens.

---

## 5. Super Admin Governance Console (`/admin/google-sheets`)

Located within the internal portal and accessible exclusively to Neel Patel (Super Admin):
- **Live Sync Status:** Shows `CONNECTED` with pulsating health indicator or `DISCONNECTED`.
- **Open Business Google Sheet:** Direct action button launching the configured workbook in a new tab.
- **Spreadsheet ID Configuration:** In-line editor allowing Neel to point the sync engine to any company-owned spreadsheet.
- **Sync Now:** Forces an immediate reconciliation of all 4 tabs and drains the outbox queue.
- **Test Connection:** Validates Google Cloud service account authentication and spreadsheet write permissions.
- **Retry Failed Jobs:** Immediately resets failed outbox items back to `PENDING` with retry backoff.
- **Outbox Queue Table:** Real-time log of the last 20 sync operations displaying Job ID, Event Type, Target Tab, Entity ID, Status (`COMPLETED`, `PENDING`, `FAILED`), and Execution Timestamps.

