# Varni Holidays — Screen-to-Route Mapping Specification
**Target Platform:** Connected Next.js 14 Application (Public Website + Customer PWA + Admin & CRM)

---

## 1. Customer PWA Route Mapping (`/app/*`)

The Customer PWA provides a personal, mobile-optimized experience for holidaymakers to view itineraries, track visas, manage payments, and explore packages.

| Screen Name | Application Route | Primary Backend Model | Key User Features |
| :--- | :--- | :--- | :--- |
| **PWA Welcome & Sign-In** | `/app/auth/login` | `Customer`, `Session` | Google OAuth, Apple Sign-in, WhatsApp OTP, Guest preview |
| **Customer Home Dashboard** | `/app` | `Customer`, `Booking`, `Lead` | Active trip banner, countdown, quick actions, recent updates |
| **Explore & Curated Destinations** | `/app/explore` | `Package`, `Destination` | Search, filter by budget/climate/Gujarati meals, destination cards |
| **Package Detail & Customizer** | `/app/packages/[slug]` | `Package`, `PackagePricingMatrix` | Day-by-day itinerary, hotel tiers, live pricing, customize trip |
| **My Trips (Active & History)** | `/app/trips` | `Booking` | Tabs: Upcoming, Active, Completed, Cancelled |
| **Trip Itinerary & Travel Desk** | `/app/trips/[id]` | `Booking`, `PackageItineraryDay` | Daily timeline, driver details, hotel vouchers, offline access |
| **Quotations & Estimates** | `/app/quotations` | `Quotation` | Review received quotations, status (Sent, Approved, Expired) |
| **Interactive Quotation Detail** | `/app/quotations/[id]` | `Quotation`, `QuotationLineItem` | Line items, hotel tier breakdown, accept quote, WhatsApp revision |
| **Document Wallet & Tickets** | `/app/wallet` | `VisaDocument`, `Booking` | E-tickets, hotel vouchers, travel insurance, passport uploads |
| **Visa Tracker & Checklist** | `/app/visa` | `VisaApplication`, `VisaStatusHistory`| Step-by-step embassy progress, required doc checklist, upload |
| **Payments & Invoices** | `/app/payments` | `PaymentRecord`, `Booking` | Transaction history, remaining balances, official receipts, pay |
| **Customer Profile & Travelers** | `/app/profile` | `Customer` | Dietary preferences (Jain/Swaminarayan), family members, logout |
| **Concierge Support & FAQ** | `/app/support` | `WhatsAppConversation` | 1-click WhatsApp Anand HQ chat, emergency helpline (+91 63570 50505) |

---

## 2. Public Website Route Mapping (Preserved)

| Page | Route | Backend Connection | Notes |
| :--- | :--- | :--- | :--- |
| **Public Homepage** | `/` | Static + CMS Packages | Preserved; links to PWA (`/app`) |
| **Destination Listing** | `/destinations` | Static + Dynamic Filters | Preserved |
| **Package Directory** | `/packages` | `Package` | Preserved; cards link to themed pages |
| **Destination Themed Detail** | `/packages/[slug]` | `Package`, `PackagePricingMatrix` | Dynamic atmospheric theme engine |
| **Public Quotation View** | `/quotation/[id]` | `Quotation`, `QuotationSnapshot` | Client PDF and web quote |
| **Informational Pages** | `/about`, `/contact`, `/terms`, `/privacy`, `/travel-insurance`, `/visa` | Static | Preserved |

---

## 3. Employee & Admin CRM Route Mapping (Preserved)

| Module | Route | Access Control |
| :--- | :--- | :--- |
| **Admin Login & TOTP** | `/admin/login`, `/admin/mfa` | Public authentication |
| **Employee Onboarding** | `/admin/onboarding` | Single-use 48hr cryptographic token |
| **Operations Dashboard** | `/admin` | Authenticated staff session |
| **Lead & Pipeline Management**| `/admin/leads`, `/admin/leads/[id]` | `leads.view`, `leads.manage` |
| **Customer Directory** | `/admin/customers`, `/admin/customers/[id]` | `customers.view`, `customers.manage` |
| **Deduplication Engine** | `/admin/deduplication` | `customers.merge` |
| **Quotation Studio** | `/admin/quotations`, `/admin/quotations/create` | `quotations.create` |
| **Booking & Manifests** | `/admin/bookings`, `/admin/bookings/[id]` | `bookings.view`, `bookings.manage` |
| **Visa Management & Email** | `/admin/communications/visa` | `visa.manage` |
| **WhatsApp Desk & Live Chat** | `/admin/communications/whatsapp` | `communications.manage` |
| **Staff & RBAC Governance** | `/admin/users`, `/admin/settings/roles` | `OWNER`, `SUPER_ADMIN` |
