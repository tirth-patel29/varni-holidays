# VARNI HOLIDAYS – RESEND EMAIL INTEGRATION & CONFIGURATION GUIDE
**Service Provider:** Resend Technologies Inc. (`api.resend.com`)  
**Sender Identity:** `Varni Holidays <noreply@varniholidays.com>`  
**Status:** **API ACTIVE & VERIFIED** (Live Dispatch Proof: `01a1a663-4a1a-71ea-a439-a67f07230e7d`)  
**Date:** November 4, 2026  

---

## 1. Executive Summary & Live Proof

The Varni Holidays Travel Management Platform integrates directly with the **Resend REST API** to dispatch transactional traveler notifications, booking vouchers, payment receipts, and itinerary updates.

### Live API Verification Result
During Phase 4 release verification, the API key was tested against Resend's production endpoint:
```text
POST https://api.resend.com/emails
Authorization: Bearer re_***
Recipient: 24dce100@charusat.edu.in
HTTP Status: 200 OK
Response Message ID: 01a1a663-4a1a-71ea-a439-a67f07230e7d
```
This confirms that the API key provided in `.env` is authentic, authorized, and communicating with Resend servers.

---

## 2. Configuration Settings in `.env`

The following environment variables govern email delivery:
```env
# Resend API Key (Masked for security)
RESEND_API_KEY="re_icZsqJ2f_************************"

# Official From Address
RESEND_FROM_EMAIL="Varni Holidays <noreply@varniholidays.com>"

# Primary Support & Office Contact
OFFICE_EMAIL="varniinternational7@gmail.com"
OFFICE_PHONE="+91 63570 50505"
OFFICE_WHATSAPP="916357050505"
```

---

## 3. Custom Domain Verification Walkthrough

When dispatching from `noreply@varniholidays.com`, Resend requires domain ownership verification to guarantee high inbox deliverability and prevent spam flagging.

### Step 1: Add Domain in Resend Console
1. Log in to [https://resend.com/domains](https://resend.com/domains) using the registered account (`24dce100@charusat.edu.in`).
2. Click **Add Domain** and enter:
   ```text
   varniholidays.com
   ```
3. Select your primary region (e.g. `ap-southeast-1` or `us-east-1`).

### Step 2: Add DNS Records to Your Domain Registrar (Cloudflare, GoDaddy, Namecheap)
Add the DNS records generated in the Resend dashboard:

| Record Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :---: |
| **TXT (DKIM)** | `resend._domainkey.varniholidays.com` | `k=rsa; p=MIGfMA0GCSqGSIb3DQE...` *(from Resend)* | Auto / 3600 |
| **TXT (SPF)** | `varniholidays.com` | `v=spf1 include:resend.com ~all` | Auto / 3600 |
| **MX (Feedback)** | `bounces.varniholidays.com` | `feedback-smtp.resend.com` (Priority: 10) | Auto / 3600 |
| **TXT (DMARC)** | `_dmarc.varniholidays.com` | `v=DMARC1; p=none; rua=mailto:dmarc@varniholidays.com` | Auto / 3600 |

### Step 3: Verify Status
Click **Verify Records** in Resend. Once verified (typically 5 to 30 minutes), all outgoing customer communications will seamlessly deliver with SPF and DKIM pass headers.

---

## 4. Operational Fallback & Development Handling

To ensure continuous system reliability:
1. **Verified Domain Active:** Outgoing emails dispatch directly from `Varni Holidays <noreply@varniholidays.com>` to any customer email worldwide.
2. **Sandbox / Pre-DNS State:** In testing environments, emails can be dispatched to the verified account owner (`24dce100@charusat.edu.in`) using `onboarding@resend.dev`.
3. **Simulation Mode Fallback:** If network connectivity to Resend fails or an invalid email is provided, the service logs the rendered HTML to the server console and creates a `SIMULATED` audit record without crashing the CRM UI or blocking agent actions.

---

## 5. Branded Email Templates

The email service uses the **Warm Tactile Voyage** design template:
- Responsive 640px email card container with rounded corners and subtle drop shadows.
- Official Varni Holidays deep navy header (`#0F172A`) with golden accent bar (`#E9B95E`).
- Clear typographic hierarchy: Playfair Display headings, readable body copy, and golden action buttons.
- Personalized booking reference, quotation breakdown, itinerary milestones, and Anand HQ contact footer.

