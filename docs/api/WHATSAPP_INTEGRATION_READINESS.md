# Varni Holidays — WhatsApp Integration Readiness & Technical Specification

**Document Version:** 1.0.0  
**Generated Date:** November 2026  
**Audited Codebase:** Next.js 14 App Router (`application/`)

---

## 1. Executive Summary & Readiness Score

| Component / Capability | Implementation Status | Readiness Score | Notes |
| :--- | :--- | :---: | :--- |
| **Outbound Cloud API Dispatch** | Implemented | 90% | Fully coded in `application/lib/integrations/whatsapp-service.ts`. Needs Meta credentials. |
| **`wa.me` Click-to-Chat Fallback** | Implemented | 100% | Generates normalized URLs, logs `CLICK_TO_CHAT_TRIGGERED`. |
| **Phone Number Normalization** | Implemented | 100% | Strips non-digits, applies `+91` E.164 standard. |
| **Inbound Webhook Endpoint** | **Not Implemented** | 0% | Endpoint `/api/webhooks/whatsapp` must be created. |
| **Webhook Handshake (`GET`)** | **Not Implemented** | 0% | Verification logic for `hub.challenge` must be built. |
| **Signature Validation (`HMAC`)** | **Not Implemented** | 0% | SHA-256 validation of `X-Hub-Signature-256` required. |
| **Conversational State Machine** | **Not Implemented** | 0% | Dialog flow / Session tracking must be implemented. |
| **CRM Lead Ingestion Bridge** | **Not Implemented** | 0% | Bridge to convert WhatsApp conversations into `Lead` records. |
| **Human Agent Handover** | **Not Implemented** | 0% | Escalation logic to assign WhatsApp chat to travel consultant. |
| **Interactive UI (Buttons/Lists)**| **Not Implemented** | 0% | Meta interactive quick replies and list messages needed. |

**Overall Two-Way Chatbot Readiness: 35%** (Outbound foundation in place; inbound webhook and chatbot engine pending implementation).

---

## 2. Currently Implemented Foundation

### 2.1 Outbound Service Adapter
Located in `application/lib/integrations/whatsapp-service.ts`:
* **Function `sendCustomerWhatsApp`:**
  * Checks for `process.env.WHATSAPP_API_TOKEN` and `process.env.WHATSAPP_PHONE_NUMBER_ID`.
  * If present, issues a `POST` request to `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`.
  * Tracks and returns delivery states: `PROVIDER_ACCEPTED` or `FAILED`.
* **Click-to-Chat Fallback:**
  * If credentials are not present, generates an encoded `https://wa.me/` link.
  * **Strict Audit Compliance:** The system explicitly records the delivery status as `CLICK_TO_CHAT_TRIGGERED`. It never fakes delivery.
* **Company Contact Integration:**
  * Uses the verified company contact number `+91 63570 50505` (`NEXT_PUBLIC_WHATSAPP_NUMBER="916357050505"`).
  * Accessible on all public website pages and footer CTAs.

---

## 3. Gap Analysis: What Must Be Built for the WhatsApp Chatbot

### 3.1 Inbound Webhook Handler (`/api/webhooks/whatsapp/route.ts`)
Meta requires an HTTP endpoint capable of handling two distinct requests:

#### A. Webhook Verification Handshake (`GET`)
When registering the webhook in Meta App Dashboard:
* Meta sends a `GET` request with query parameters:
  * `hub.mode`: Expected to be `'subscribe'`.
  * `hub.verify_token`: Must match `process.env.WHATSAPP_VERIFY_TOKEN`.
  * `hub.challenge`: An arbitrary verification string from Meta.
* **Action Required:** The route must validate the verify token and respond with `hub.challenge` as plain text HTTP 200.

#### B. Event Notification Ingestion (`POST`)
When a customer sends a message or a message delivery status changes:
* Meta sends a `POST` request containing a JSON payload.
* **Security Validation:** Must compute HMAC SHA-256 over raw payload body using `process.env.WHATSAPP_APP_SECRET` and verify against header `x-hub-signature-256`.
* **Action Required:**
  * Immediately return HTTP `200 OK` to Meta within 3 seconds.
  * Parse incoming message objects (`entry[].changes[].value.messages[]`).
  * Filter out status receipts (`sent`, `delivered`, `read`) vs incoming user text/interactive replies.

### 3.2 Conversational State Machine (Session Manager)
WhatsApp does not maintain session state; each message is an isolated event. A conversational state engine must track customer progression:

```
[Customer Says "Hi"]
         │
         ▼
[State: GREETING & MENU]
   - Button 1: "Explore Tour Packages"
   - Button 2: "Flight Inquiry"
   - Button 3: "Visa Assistance"
   - Button 4: "Talk to Travel Agent"
         │
         ├── User selects "Tour Packages" ──► [State: DESTINATION_SELECTION]
         │                                         │ (Kerala, Dubai, Bali, Europe)
         │                                         ▼
         │                                    [State: DATES_AND_PAX]
         │                                         │
         │                                         ▼
         │                                    [State: CONTACT_COLLECTION]
         │                                         │
         │                                         ▼
         │                                    [State: LEAD_QUALIFIED]
         │                                         │ (Creates Lead in CRM)
         │
         └── User selects "Talk to Agent" ──► [State: HUMAN_HANDOVER]
                                                   (Notifies CRM Consultant)
```

### 3.3 CRM Lead Generation Bridge
Once a user provides their travel preferences:
1. The chatbot extracts:
   * Customer Name (from WhatsApp profile or asked in chat)
   * Phone Number (from sender's WhatsApp ID `from`)
   * Travel Service (`FLIGHT`, `PACKAGE`, `VISA`, etc.)
   * Travel Dates & Passenger Count
2. Invokes CRM lead creation (`createLead` in Prisma / CRM store).
3. Automatically triggers:
   * Confirmation message on WhatsApp: *"Thank you! Our senior travel expert has received your request and will contact you shortly."*
   * Internal alert email to `varniinternational7@gmail.com`.
   * Google Sheets sync to `ALL_LEADS`.

### 3.4 24-Hour Customer Care Window & Message Templates
* **Meta Policy Rule:** Businesses have a **24-hour window** from the customer's last incoming message to reply with free-form text.
* **Outside the 24-Hour Window:** Messages can **ONLY** be sent using pre-approved **Meta Message Templates** (e.g. `booking_update`, `quote_ready`, `payment_reminder`).
* Any outbound notification initiated after 24 hours must use approved template payloads.

---

## 4. Meta Developer Setup Guide (Step-by-Step)

To activate the WhatsApp Cloud API integration:

### Step 1: Meta Developer Account & App Creation
1. Log in to [Meta for Developers](https://developers.facebook.com/).
2. Click **My Apps** -> **Create App**.
3. Select App Type: **Business**.
4. Set Display Name: `Varni Holidays Platform`.
5. Associate with the official Meta Business Account for Varni Holidays.

### Step 2: Add WhatsApp Product
1. In the App Dashboard, locate **WhatsApp** and click **Set Up**.
2. Navigate to **WhatsApp** -> **API Setup**.
3. Meta assigns a test phone number and temporary token.
4. Add your personal WhatsApp number to the test recipient whitelist to test immediately.

### Step 3: Configure Permanent System User Token
1. Open [Meta Business Manager](https://business.facebook.com/settings).
2. Go to **Users** -> **System Users**.
3. Click **Add** -> Name: `Varni WhatsApp Bot System User` -> Role: **Admin**.
4. Click **Generate New Token**:
   * Select App: `Varni Holidays Platform`.
   * Token Expiration: **Never (Permanent)**.
   * Permissions Required:
     * `whatsapp_business_messaging`
     * `whatsapp_business_management`
5. Copy the generated token and save as `WHATSAPP_API_TOKEN` in `.env.local`.

### Step 4: Register Business Phone Number & Retrieve IDs
1. Under **WhatsApp** -> **Configuration** -> **Phone Numbers**, register the official company number: `+91 63570 50505`.
2. Complete SMS or Voice verification.
3. Note the **Phone Number ID** (save as `WHATSAPP_PHONE_NUMBER_ID`).
4. Note the **WhatsApp Business Account ID** (save as `WHATSAPP_BUSINESS_ACCOUNT_ID`).

### Step 5: Webhook Registration
1. In Meta App Dashboard, navigate to **WhatsApp** -> **Configuration** -> **Webhook**.
2. Click **Edit**:
   * **Callback URL:** `https://varnitours.com/api/webhooks/whatsapp` (or ngrok URL for local dev).
   * **Verify Token:** The string configured in `WHATSAPP_VERIFY_TOKEN`.
3. Click **Verify and Save**.
4. Under **Webhook Fields**, click **Subscribe** to:
   * `messages` (Incoming messages and button interactions).
   * `message_template_status_update` (Template approval alerts).

