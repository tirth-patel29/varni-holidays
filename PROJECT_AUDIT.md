# PROJECT AUDIT: VARNI HOLIDAYS TRAVEL MANAGEMENT PLATFORM
**Document Control:** Phase 0 Discovery & Workspace Audit  
**Date:** 04 November 2026  
**Status:** Complete  
**Target Brand:** VARNI HOLIDAYS — *Your Gateway to Joyful Holidays* (Anand, Gujarat, India)  
**Primary Administrator:** Neel Patel (Designated Super Admin)

---

## 1. Executive Summary

This project audit represents an exhaustive technical, business, and design inspection of the complete `VARNI-HOLIDAYS` repository. The objective is to establish an unshakeable foundation for developing a production-ready, highly secure, customer-facing travel website and integrated internal Travel CRM for Varni Holidays.

The audit covers:
1. **User Interface References (`/01-UI-REFERENCE/` & `/UI-REFERENCE/`):** Full Google Stitch export of the *Warm Tactile Voyage* design system, including HTML, Tailwind CSS tokens, component hierarchy, claymorphic styling, and responsive breakpoints.
2. **Requirements Specifications (`/02-SRS-DOCUMENTATION/` & `/SRS-DOCUMENTATION/`):** Analysis of the 16-page `Varni_Holidays_Phase_1_SRS_Draft.pdf`, mapping all functional/non-functional requirements, user roles, security rules, and out-of-scope boundaries.
3. **Package Pricing & Source Documents (`/03-PACKAGE-PRICING/` & `/04-ORIGINAL-BUSINESS-DATA/`):** Forensic analysis of 10 DOCX supplier rate catalogues, 11 package flyers, 2 car rental flyers, and pre-extracted analysis matrices (`package_source_data.json`, `kerala_6n7d_price_matrix.csv`, etc.).
4. **Technical & Application Prerequisites (`/05-TECHNICAL-DOCUMENTATION/` & `/application/`):** Runtime environment verification (Node.js v24.15.0), directory structure, and modern full-stack Next.js/Prisma/PostgreSQL architecture readiness.

---

## 2. Directory & Workspace Inventory

| Directory Path | Present | File Count | Content Description | Audit Assessment |
| :--- | :---: | :---: | :--- | :--- |
| `d:\VARNI-HOLIDAYS\UI-REFERENCE\` | Yes | 9 files | Google Stitch export: `DESIGN.md`, `code.html` & `screen.png` for Home, Destinations, Tour Packages, Package Details. | **Complete & Verified.** High-fidelity reference for the *Warm Tactile Voyage* theme. |
| `d:\VARNI-HOLIDAYS\SRS-DOCUMENTATION\` | Yes | 1 file | `Varni_Holidays_Phase_1_SRS_Draft.pdf` (16 pages, OCR/rendered). | **Complete & Verified.** Contains baseline scope, RBAC, pipeline stages, pricing approaches, and acceptance tests. |
| `d:\VARNI-HOLIDAYS\PACKAGE-PRICING\source-analysis\` | Yes | 8 files | `package_source_data.json`, `kerala_6n7d_price_matrix.csv`, `package_index.csv`, `flyer_index.csv`, `source_links.csv`, markdown guides. | **Complete & Highly Valuable.** Pre-parsed text and table cells from raw DOCX catalogues. |
| `d:\VARNI-HOLIDAYS\ORIGINAL-BUSINESS-DATA\` | Yes | 15 files | Paired DOCX catalogues for South India & Temple Tours, 11 promotional flyers, 2 car rental flyers. | **Analyzed.** Contains raw supplier assets. Identifies missing Rajasthan and seasonal mismatches. |
| `d:\VARNI-HOLIDAYS\PROJECT-GUIDELINES\` | Yes | 0 files | Reserved directory for project guidelines. | Currently empty. Guidelines incorporated into root documentation. |
| `d:\VARNI-HOLIDAYS\TECHNICAL-DOCUMENTATION\` | Yes | 0 files | Reserved directory for technical specifications. | Architecture and design specifications baselined in this phase. |
| `d:\VARNI-HOLIDAYS\application\` | Yes | 0 files | Target directory for Next.js application codebase. | Clean slate ready for Phase 1 initialization. |

---

## 3. UI Reference Analysis: "Warm Tactile Voyage"

The Stitch design export defines an aesthetic tailored for luxury leisure travel with Gujarati hospitality cues. It intentionally avoids digital minimalism, harsh corporate borders, and stark `#000000` blacks.

### 3.1 Design Tokens & Color Palette
- **Primary Navy (`#153650` / `#002037`):** Represents heritage, nautical voyage, and grounding elegance. Used for all high-contrast typography, primary navigation frames, and primary CTA buttons.
- **Secondary Ocean Blue (`#246B9B` / `#186393`):** Evokes azure coastal waters. Used for active tabs, category filter pills, subtle icon accents, and interactive focus states (`rgba(36, 107, 155, 0.18)`).
- **Tertiary Warm Gold (`#E9B95E` / `#C29033` / `#F7E5BD`):** Radiates bespoke warmth, celebratory sunrise, and premium curation. Used for star ratings, "Save ₹X" badges, exclusive price tags, and micro-interaction highlights.
- **Neutral Ivory (`#F8F6F0` / `#FBF9F3`):** Canvas background replacing stark white with natural linen warmth.
- **Surface Cream Subtle (`#F1EEE5`):** Recessed container background for input controls, inner cards, and timeline tracks.
- **Ocean Mist Soft (`#E4EEF5`):** Atmospheric ambient backdrop glows.

### 3.2 Typography & Hierarchy
- **Headings (Editorial Serif):** `Playfair Display` (Weights: 500, 600, 700). Applied to display heroes (56px/68px), section headliners (40px/50px), package names, and destination titles.
- **Body & UI (Humanist Sans):** `Plus Jakarta Sans` (Weights: 400, 500, 600, 700). Applied to navigation, itinerary day-by-day copy, input fields, pricing badges, and CRM tabular views.

### 3.3 Tactile Claymorphism & Elevation System
The visual signature relies on multi-directional ambient light and pillowed diffusion:
1. **Clay Raised Base (Cards & Containers):**  
   `box-shadow: 8px 16px 28px rgba(21,54,80,0.06), -6px -6px 16px rgba(255,255,255,0.8);`  
   `border-radius: 2rem (32px)` to `2.5rem (40px)`.
2. **Clay Recessed Base (Search Bars, Inputs, Inactive Controls):**  
   `box-shadow: inset 2px 2px 5px rgba(21,54,80,0.06), inset -2px -2px 5px rgba(255,255,255,0.8);`  
   `background-color: #F1EEE5;`
3. **Pill Geometries:** All action buttons, filter tags, status badges, and search bars use `rounded-full` (`border-radius: 9999px`).

### 3.4 Screen Inventory & Responsive Behavior
- `home_varni_holidays`: Floating brand header, hero with layered ambient glows, organic framed artwork card, tactile search widget, curated destinations carousel, featured tour packages, "Why Choose Us" trust grid, testimonial slider, custom trip CTA, and comprehensive footer.
- `destinations_varni_holidays`: Destination filter tabs (All, Europe, Asia, Domestic, Tropical), destination card grid with pill price tags, departure city badges (AMD/BOM), and direct enquiry triggers.
- `tour_packages_varni_holidays`: Category filters, pricing sliders, package grid featuring itinerary teasers, inclusion badges, day-wise modal preview, and quick enquiry modal.
- `package_details_varni_holidays`: Editorial hero banner, photo gallery, climate widget, curated highlights bento grid, day-wise accordion itinerary, hotel tier tabs, sticky interactive booking calculator card, and Anand headquarters contact card.

---

## 4. SRS Requirements & Business Rules Summary

The Software Requirements Specification (Phase 1 Draft v0.1) outlines a strict boundary between an enquiry-driven travel platform and an automated online booking engine:

### 4.1 Scope Boundaries
- **IN SCOPE (Phase 1):**
  - High-performance, SEO-friendly public website.
  - Enquiry capture for **Flights**, **Tour Packages**, and **Visa Assistance**.
  - Dynamic Tour Package pricing engine driven by backend matrices.
  - Initial verified Kerala 6N/7D package.
  - Role-based internal CRM portal (`/employee`) with **Requests → General → Priority → Converted/Booked / Closed** pipeline.
  - Customer profile deduplication and complete interaction history.
  - Super Admin portal (`/admin`) for full lifecycle control of users, roles, packages, price matrices, leads, and audit logs.
  - Progress update composer supporting verified status notifications.
- **EXPLICITLY OUT OF SCOPE (Phase 1):**
  - Live GDS/airline booking APIs, live fare rules, automated ticket issuance.
  - Live third-party hotel inventory or automated bed-bank booking.
  - Automated embassy/visa submission portals.
  - Automated conversational WhatsApp AI bots (scheduled for Phase 2).
  - Online payment gateway integration, automatic invoicing, or refunds.
  - Long-term storage of passport scans, national IDs, or sensitive financial data.

---

## 5. Technical Environment & Architecture Audit

1. **Host Environment:** Windows OS, PowerShell shell.
2. **Runtime:** Node.js `v24.15.0` active and verified.
3. **Target Technology Stack:**
   - **Framework:** Next.js (App Router, Server Components & Server Actions).
   - **Language:** TypeScript (strict mode enabled).
   - **Styling:** Tailwind CSS with custom Warm Tactile Voyage token configuration.
   - **Database & ORM:** PostgreSQL with Prisma ORM.
   - **Authentication:** Secure session cookies (HTTP-only, SameSite=Strict) with bcrypt/Argon2 password hashing.
   - **Security:** Server-side RBAC, Zod schema validation, CSRF protection, rate limiting, and parameterised queries.

---

## 6. Critical Findings & Data Discrepancies

Forensic examination of the source materials revealed several key facts that prevent naive coding:

1. **Duration Clarity on Kerala Package:** The initial prompt mentioned "6 day 7 night", whereas all underlying supplier documents and flyers unambiguously define **6 Nights / 7 Days (6N/7D CPAI)** (Ex-Cochin: 2N Munnar + 1N Thekkady + 1N Alleppey + 2N Kovalam/Poovar).
2. **Supplier Rate vs. Rack Rate Layering:**
   - The archive provides two distinct DOCX versions: `Ready Packages` (supplier base cost) and `Rack Rate with 15% Margin of Travel Agent`.
   - The rack rate is **not** a blind `cost * 1.15`. Values are rounded to neat increments (e.g., ₹23,800 + 15% = ₹27,370 → rounded to ₹27,400).
   - The promotional flyer `Kerala-6N7D-Winter-Package.jpg` advertises the rack rate figures (₹27,400 for 2 pax, ₹24,500 for 4 pax, ₹20,700 for 6 pax).
   - *Architecture Mandate:* The database must store both `supplier_cost` and `customer_price` with `margin_percent`, strictly isolating supplier costs from public API responses.
3. **Multi-Dimensional Pricing Matrix:** Package rates vary by hotel tier (Standard, Deluxe, Super Deluxe, Premium, Luxury), passenger count (2, 4, 6, 8, 10 pax), room count (1 to 5 rooms), and vehicle allocation (AC Sedan vs. Innova Crysta vs. AC Tempo Traveller). A simplistic linear formula `price * pax` is invalid.
4. **Seasonal Validity & Blackout Dates:**
   - Kerala winter catalogue validity: **1 October 2026 to 31 March 2027**.
   - Blackout window: **20 December 2026 to 10 January 2027** (peak holiday surcharge).
5. **External Itinerary Hyperlinks:** The day-wise itineraries in the DOCX files point to external Google Docs links rather than embedded text. The Kerala 6N/7D day-wise structure must be established using verified standard itineraries for Munnar-Thekkady-Alleppey-Kovalam.
6. **Missing Regional Data in Archive:**
   - The `RAJASTHAN Ready Packages` folder is completely empty.
   - The Hyderabad paired rack-rate document is outdated (valid summer 2026), while the ready-package document is winter 2026-2027.
   - *Resolution:* Only publish packages that have verified, current rate matrices. Phase 1 launches with Kerala 6N/7D.

