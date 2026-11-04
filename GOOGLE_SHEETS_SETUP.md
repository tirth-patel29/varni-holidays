# GOOGLE SHEETS LIVE BUSINESS REPORTING SETUP GUIDE
**Project:** VARNI HOLIDAYS Travel Management Platform  
**Target Executive:** Neel Patel (Proprietor & Super Admin)  
**Document Code:** GS-SETUP-VH-01  
**Date:** 04 November 2026  

---

## 1. Overview

This document provides step-by-step instructions for provisioning the Google Cloud Service Account and configuring the company-controlled Google Sheet for Varni Holidays.

Follow these instructions to connect the live Google Sheets API. If credentials are not yet configured, the system automatically runs in **Development Simulation Mode**, maintaining an internal mirror so desk operations and testing are never blocked.

---

## 2. Google Cloud Platform (GCP) Setup

### Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Set **Project Name** to: `Varni-Holidays-CRM`.
4. Click **Create**.

### Step 2: Enable the Google Sheets API
1. In the GCP Console navigation menu, go to **APIs & Services** > **Library**.
2. Search for **Google Sheets API**.
3. Click **Google Sheets API** and click **Enable**.

### Step 3: Create a Dedicated Backend Service Account
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **Service Account**.
3. Set **Service account name** to: `varni-sheets-sync`.
4. Set **Service account ID** to: `varni-sheets-sync@varni-holidays-crm.iam.gserviceaccount.com`.
5. Description: `Backend synchronization identity for Varni Holidays Live Business Reporting`.
6. Click **Create and Continue**, then click **Done**.

### Step 4: Generate and Download Service Account Private Key
1. Under **Credentials** > **Service Accounts**, click on the newly created service account `varni-sheets-sync`.
2. Click on the **Keys** tab.
3. Click **Add Key** > **Create new key**.
4. Select **JSON** format and click **Create**.
5. Save the downloaded JSON key file securely. You will need `client_email` and `private_key` from this file.

> [!CAUTION]
> **Never commit your service account JSON file to Git.** It contains sensitive private keys that grant write access to your company's Google Cloud resources.

---

## 3. Google Sheets Workbook Setup & Permissions

### Step 1: Create the Company Spreadsheet
1. Log into Google Drive using the company executive Google account.
2. Create a new Google Spreadsheet named:  
   `VARNI HOLIDAYS - Executive Business Reporting`
3. Copy the **Spreadsheet ID** from the browser URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
   Example: If the URL is `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`, the Spreadsheet ID is `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`.

### Step 2: Share Spreadsheet with the Service Account (Editor)
1. Click the **Share** button in the top right corner of the Google Sheet.
2. Add the service account email (e.g. `varni-sheets-sync@varni-holidays-crm.iam.gserviceaccount.com`).
3. Set its role to **Editor**.
4. Uncheck "Notify people" and click **Share**.

### Step 3: Share Spreadsheet with Neel Patel (Viewer Only)
1. In the **Share** dialog, add Neel Patel's email address (`neel@varniholidays.com`).
2. Set his role strictly to **Viewer**.
3. Under sharing settings (gear icon), uncheck:
   - "Editors can change permissions and share"
   - "Viewers and commenters can see the option to download, print, and copy" (optional, recommended for confidentiality).
4. Click **Done**.

> [!IMPORTANT]
> Setting Neel Patel as **Viewer** guarantees that operational figures cannot be inadvertently edited or deleted in the spreadsheet, maintaining PostgreSQL as the sole system of record.

---

## 4. Server Environment Configuration (`.env`)

Add the following environment variables to your `application/.env` file:

```bash
# ------------------------------------------------------------------
# GOOGLE SHEETS LIVE BUSINESS REPORTING (PHASE 2.1)
# ------------------------------------------------------------------

# Target Google Spreadsheet ID
GOOGLE_SHEETS_SPREADSHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

# Service Account Email Address
GOOGLE_SERVICE_ACCOUNT_EMAIL="varni-sheets-sync@varni-holidays-crm.iam.gserviceaccount.com"

# Service Account Private Key (Include the BEGIN/END lines; replace newlines with \n)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3...\n-----END PRIVATE KEY-----\n"
```

---

## 5. Verification & Testing

1. Log into the Varni CRM Desk as Super Admin:
   - URL: `/employee/login`
   - Email: `neel@varniholidays.com`
   - Password: `Varni@Admin2026`
2. Navigate to **Google Sheets Live Sync** in the left sidebar under *Super Admin Controls* (`/admin/google-sheets`).
3. Verify that the **Sync Status** displays `CONNECTED`.
4. Click **Test Connection** to confirm communication with Google Sheets API.
5. Click **Sync Now** to push all current database leads, follow-ups, bookings, and executive summary metrics.
6. Click **Open Business Google Sheet** to view the live workbook in Google Sheets.
7. Verify all four tabs:
   - `ALL_LEADS`
   - `FOLLOW_UPS`
   - `BOOKINGS`
   - `BUSINESS_SUMMARY`

