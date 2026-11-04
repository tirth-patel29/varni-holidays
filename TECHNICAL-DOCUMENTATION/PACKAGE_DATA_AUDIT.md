# PACKAGE DATA & PRICING AUDIT: VARNI HOLIDAYS
**Project:** VARNI HOLIDAYS Travel Management Platform  
**Document Code:** PDA-VH-02 (Revision 2 — Post Architecture Review)  
**Version:** 2.0 (Phase 0 Forensic Audit & Data Governance)  
**Date:** 04 November 2026  
**Confidentiality:** HIGH — Contains Proprietary B2B Supplier Rates & Agent Margins. *Never expose supplier costs to public users or unauthorized roles.*

---

## 1. Executive Summary & Source Inventory

This document provides a forensic audit of all physical rate catalogues, promotional flyers, and vehicle matrices supplied in the project archive (`Travel-E - 7 States Ready Packages)`).

### Inventory Summary
- **10 DOCX Rate Catalogues:** 5 pairs of `Ready Packages` (supplier base cost) and `Rack Rate with 15% Margin of Travel Agent`.
- **11 Travel Package Flyers:** JPG promotional white-label flyers for travel agents.
- **2 Car Rental Documents:** JPG fleet specs and rental rates.
- **22 Regional Tour Itineraries:** Distributed across Andaman (5), Karnataka & Tamil Nadu (4), Kerala (4), Tamil Nadu Temple Tours (5), and Hyderabad & Srisailam (4).
- **106 Unique Itinerary × Hotel Tier Combinations** across all regions.

---

## 2. In-Depth Focus: Kerala 6 Nights / 7 Days (Flagship Package)

### 2.1 Route, Geography & Duration
- **Itinerary Code:** Kerala Package 02 — 6 Nights / 7 Days CPAI (Ex-Cochin).
- **Night Halt Sequence:** 2 Nights Munnar + 1 Night Thekkady + 1 Night Alleppey + 2 Nights Kovalam/Poovar.
- **Transit Routing:** Pickup: Cochin Airport/Railway Station (`COK`); Drop: Trivandrum (`TRV`) or Cochin (`COK`).
- **Food Plan:** CPAI (Continental Plan All Inclusive — Room with Breakfast included; taxes included).
- **Source Catalogue References:**
  - *Supplier Base File:* `Travel-E - 7 States Ready Packages)/KERALA Ready Packages/October 2026 to March 2027/Travel-e (Kerala Winter Ready Packages) V6.docx` (Table 2)
  - *Rack Rate File:* `Travel-E - 7 States Ready Packages)/KERALA Ready Packages/October 2026 to March 2027/Ready Packages with 15_ Margin of Travel Agent/Travel-e (Kerala Winter Ready Packages) Rack Rate with 15_ Margin of Travel Agent) V6.docx` (Table 2)
  - *Promotional Flyer:* `Travel-E - 7 States Ready Packages)/White Label Flyers for Travel Agent/Kerala-6N7D-Winter-Package.jpg`

### 2.2 Approved Accommodation Tiers & Verified Hotel Names

| Night Halt | Package 1: Standard | Package 2: Deluxe | Package 3: Super Deluxe | Package 4: Premium | Package 5: Luxury |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2N Munnar** | Las Palms / Similar | The Arbour Resort / Similar | Misty Lake Resort / Similar | Munnar Queen / Similar | Haze & Kites / Similar |
| **1N Thekkady** | The Patio / Similar | Hotel Peppervine / Similar | Silver Crest / Similar | Spices Lap Resort / Similar | WGH Poetree / Similar |
| **1N Alleppey** | Pagoda Resort / Similar | Arcadia Regency / Similar | Haveli Backwaters / Similar | Warmth Lake Haven / Similar | World Backwaters / Similar |
| **2N Kovalam / Poovar** | Jasmine Palace / Similar | Samudra Theeram Resort / Similar | Abad Harmonia / Similar | Isola De Coco / Similar | Uday Samudra Beach Resort / Similar |

*Hotel Note:* AC is standard in Alleppey and Kovalam. Munnar and Thekkady are hill stations; hotels are non-AC by default. AC supplements (if requested) are payable directly at the hotel.

---

### 2.3 Mathematical Pricing Analysis: Preserving Both 6-Pax Configurations & Discrete Price Layers

The underlying DOCX catalogues contain two explicit rate layers. In accordance with the Architecture Review, **all source rack rates are taken directly from the published source catalogue without applying a universal 15% recalculation**.

Furthermore, **both 6-passenger configurations (Innova Crysta vs. AC Tempo Traveller) are preserved distinctly**:

#### Per-Person Rates (All figures in INR, CPAI Breakfast & Taxes Included)

| Configuration Code | Vehicle Type | Pax / Rooms | Hotel Tier | Supplier Base (`ready_rate`) | Published Source Rack Rate (`rack_rate`) | Markup Amount | Markup % | Flyer Published Rate |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **2PAX_SEDAN** | AC Sedan | 2 Pax (1 Rm) | Standard | ₹23,800 | **₹27,400** | ₹3,600 | 15.13% | ₹27,400 |
| | | | Deluxe | ₹25,600 | **₹29,400** | ₹3,800 | 14.84% | ₹29,400 |
| | | | Super Deluxe | ₹28,200 | **₹32,400** | ₹4,200 | 14.89% | ₹32,400 |
| | | | Premium | ₹30,200 | **₹34,700** | ₹4,500 | 14.90% | ₹34,700 |
| | | | Luxury | ₹35,500 | **₹40,800** | ₹5,300 | 14.93% | ₹40,800 |
| **4PAX_INNOVA** | Innova Crysta | 4 Pax (2 Rm) | Standard | ₹21,300 | **₹24,500** | ₹3,200 | 15.02% | ₹24,500 |
| | | | Deluxe | ₹23,100 | **₹26,500** | ₹3,400 | 14.72% | ₹26,500 |
| | | | Super Deluxe | ₹25,700 | **₹29,600** | ₹3,900 | 15.18% | ₹29,600 |
| | | | Premium | ₹27,700 | **₹31,800** | ₹4,100 | 14.80% | ₹31,800 |
| | | | Luxury | ₹33,000 | **₹37,900** | ₹4,900 | 14.85% | ₹37,900 |
| **6PAX_INNOVA** | Innova Crysta | 6 Pax (3 Rm) | Standard | ₹18,100 | **₹20,700** | ₹2,600 | 14.36% | ₹20,700 |
| | | | Deluxe | ₹19,800 | **₹22,800** | ₹3,000 | 15.15% | ₹22,800 |
| | | | Super Deluxe | ₹22,500 | **₹25,800** | ₹3,300 | 14.67% | ₹25,800 |
| | | | Premium | ₹24,400 | **₹28,100** | ₹3,700 | 15.16% | ₹28,100 |
| | | | Luxury | ₹29,700 | **₹34,200** | ₹4,500 | 15.15% | ₹34,200 |
| **6PAX_TRAVELLER** | AC Tempo Traveller | 6 Pax (3 Rm) | Standard | ₹18,600 | **₹21,400** | ₹2,800 | 15.05% | *N/A (Flyer shows Innova)* |
| | | | Deluxe | ₹20,400 | **₹23,400** | ₹3,000 | 14.71% | *N/A* |
| | | | Super Deluxe | ₹23,000 | **₹26,500** | ₹3,500 | 15.22% | *N/A* |
| | | | Premium | ₹25,000 | **₹28,700** | ₹3,700 | 14.80% | *N/A* |
| | | | Luxury | ₹30,300 | **₹34,800** | ₹4,500 | 14.85% | *N/A* |
| **8PAX_TRAVELLER** | AC Tempo Traveller | 8 Pax (4 Rm) | Standard | ₹16,900 | **₹19,400** | ₹2,500 | 14.79% | *N/A* |
| | | | Deluxe | ₹18,600 | **₹21,400** | ₹2,800 | 15.05% | *N/A* |
| | | | Super Deluxe | ₹21,200 | **₹24,400** | ₹3,200 | 15.09% | *N/A* |
| | | | Premium | ₹23,200 | **₹26,700** | ₹3,500 | 15.09% | *N/A* |
| | | | Luxury | ₹28,500 | **₹32,800** | ₹4,300 | 15.09% | *N/A* |
| **10PAX_TRAVELLER**| AC Tempo Traveller | 10 Pax (5 Rm)| Standard | ₹15,800 | **₹18,200** | ₹2,400 | 15.19% | *N/A* |
| | | | Deluxe | ₹17,500 | **₹20,200** | ₹2,700 | 15.43% | *N/A* |
| | | | Super Deluxe | ₹20,200 | **₹23,200** | ₹3,000 | 14.85% | *N/A* |
| | | | Premium | ₹22,200 | **₹25,500** | ₹3,300 | 14.86% | *N/A* |
| | | | Luxury | ₹27,500 | **₹31,600** | ₹4,100 | 14.91% | *N/A* |

---

### 2.4 Supplements, Add-Ons & Individual Line Items

The system stores and computes these add-ons as distinct line items:

#### A. Extra Bed & Child Supplements (Per Person Rate for 6 Nights)

| Supplement Type | Hotel Tier | Supplier Cost | Published Source Rack Rate | Markup Amount |
| :--- | :--- | :---: | :---: | :---: |
| **Extra Adult with Bed** | Standard | ₹6,500 | **₹7,500** | ₹1,000 |
| | Deluxe | ₹8,600 | **₹9,800** | ₹1,200 |
| | Super Deluxe | ₹9,000 | **₹9,700** | ₹700 |
| | Premium | ₹10,700 | **₹12,300** | ₹1,600 |
| | Luxury | ₹14,500 | **₹16,700** | ₹2,200 |
| **Child with Bed (CWB)** | Standard | ₹5,400 | **₹5,400** | ₹0 |
| | Deluxe | ₹6,500 | **₹7,500** | ₹1,000 |
| | Super Deluxe | ₹6,500 | **₹7,500** | ₹1,000 |
| | Premium | ₹7,300 | **₹8,400** | ₹1,100 |
| | Luxury | ₹10,000 | **₹11,600** | ₹1,600 |
| **Child Without Bed (CNB)** | Standard | ₹3,400 | **₹3,400** | ₹0 |
| | Deluxe | ₹4,800 | **₹5,600** | ₹800 |
| | Super Deluxe | ₹4,700 | **₹4,900** | ₹200 |
| | Premium | ₹6,700 | **₹7,700** | ₹1,000 |
| | Luxury | ₹7,000 | **₹7,700** | ₹700 |
| **Per Person Meal Supplement (MAP/AP)** | Standard | ₹3,800 | **₹3,800** | ₹0 |
| | Deluxe | ₹4,500 | **₹5,200** | ₹700 |
| | Super Deluxe | ₹5,000 | **₹5,700** | ₹700 |
| | Premium | ₹5,400 | **₹6,200** | ₹800 |
| | Luxury | ₹8,500 | **₹9,700** | ₹1,200 |

#### B. Houseboat Upgrade Supplement in Alleppey (Per Person, Replaces Hotel Night)
- **1 Bedroom Deluxe Boat:** Standard: +₹3,400/pax; Deluxe & Super Deluxe: +₹3,250/pax.
- **1 Bedroom Premium Boat:** Premium: +₹5,250/pax; Luxury: +₹4,750/pax.
- *Houseboat Inclusions:* Check-in 1:00 PM, Check-out 9:00 AM; includes traditional Kerala Lunch, Dinner, and Breakfast. Cruising ceases at 6:00 PM per government law. Deluxe boat AC operates 8:30 PM to 6:00 AM; Premium/Luxury AC operates full time. AC only in bedrooms.

#### C. Optional Day Trip Supplements (Per Vehicle)
- **Athirapilly Waterfalls Day Trip (Ex-Cochin):**
  - AC Sedan: ₹4,000/vehicle
  - AC Innova Crysta: ₹5,000/vehicle
  - 12-Seater AC Tempo Traveller: ₹6,000/vehicle
- **Kanyakumari Day Trip (Ex-Kovalam):**
  - AC Sedan: ₹4,500/vehicle
  - AC Innova Crysta: ₹5,500/vehicle
  - 12-Seater AC Tempo Traveller: ₹6,500/vehicle

#### D. Honeymoon Inclusions (Per Couple)
- **Candlelight Dinner:** Standard/Deluxe: ₹1,000; Super Deluxe: ₹1,500; Premium: ₹2,500; Luxury: ₹3,500.
- **Bed Decoration (Flower Bed):** Standard/Deluxe: ₹1,000; Super Deluxe: ₹1,500; Premium: ₹2,500; Luxury: ₹3,500.
- **Honeymoon Cake:** ₹600 across all tiers.

---

### 2.5 Operational Vehicle Guidelines & Capacities

| Vehicle Type | Max Seating Capacity | Luggage Capacity | Operational Rules |
| :--- | :---: | :---: | :--- |
| **AC Sedan** (Dzire / Etios) | 3 Adults + 1 Driver | 3 Large Bags (15 kg each) | No luggage roof carrier. AC turned off on hill inclines/ghats. |
| **AC Innova Crysta** | 6 Adults + 1 Driver | 4-5 Medium Bags | Luggage carrier subject to state rules. Disposable from 8:00 AM to 8:00 PM. |
| **AC Tempo Traveller** | 12 Adults + 1 Driver | 10-12 Medium Bags | Roof carrier available. Driver Bata extra for usage past 8:00 PM. |

---

### 2.6 Validity & Critical Commercial Restrictions
- **Seasonal Validity:** 1 October 2026 to 31 March 2027.
- **Peak Blackout Dates:** **20 December 2026 to 10 January 2027** (Mandatory custom quotation due to peak hotel surcharges and mandatory Christmas/New Year gala dinners).
- **Payment & Advance Rule:** 50% advance booking deposit required before cut-off date; 100% balance cleared prior to arrival/vehicle dispatch.

---

## 3. Data Governance Status of Other Regional Packages

| Region | Catalogues Found | Rate Layers | Governance Status & Implementation Boundary |
| :--- | :---: | :---: | :--- |
| **Kerala (Flagship)** | 2 DOCX + Flyer | Ready & Rack (15%) | **APPROVED FOR PHASE 1 LAUNCH.** Exact pricing matrix seeded for 6N/7D. |
| **Andaman** | 2 DOCX files | Ready & Rack (15%) | **STAGED (PHASE 2).** 5 itineraries (4N5D to 6N7D). Blackout: 15 Dec 2026 to 10 Jan 2027. Note: Single booking max 7 persons. Verify ferry ticket inclusions before publishing. |
| **Karnataka & Tamil Nadu** | 2 DOCX files | Ready & Rack (15%) | **STAGED (PHASE 2).** 4 itineraries (5N6D to 8N9D) covering Mysore, Ooty, Coorg, Wayanad, Kodaikanal. Same winter validity and blackout as Kerala. |
| **Tamil Nadu Temple Tours** | 2 DOCX files | Ready & Rack (15%) | **STAGED (PHASE 2).** 5 itineraries (2N3D to 7N8D) covering Madurai, Rameshwaram, Kanyakumari, Trichy, Tanjore, Chennai. |
| **Hyderabad & Srisailam** | 2 DOCX files | **Mismatched Seasons** | **HELD BACK / UNPUBLISHED.** `Ready Packages V6` is Winter (Oct 2026–Mar 2027), but paired `Rack Rate V5` is outdated Summer (Apr–Sep 2026). Strictly held back until current winter rack rate document is supplied. |
| **Rajasthan** | **0 files** | **None** | **HELD BACK / UNPUBLISHED.** Directory is empty. Zero supplier catalogues supplied. Strictly held back until source materials are provided. |

---

## 4. External Itinerary Hyperlinks Audit & Policy

The DOCX files contain external Google Docs hyperlinks for day-wise itineraries:
- None of these external Google Docs links are accessible without authenticated client workspace permissions.
- **Strict Compliance Directive:** The engineering team will **NEVER invent or fabricate day-wise itineraries** from unaccessed external documents.
- For Phase 1 launch, the Kerala 6N/7D package will use verified regional travel stop points directly confirmed in the source document:
  - Day 1: Arrival Cochin (`COK`) → Drive to Munnar (Cheeyappara & Valara Waterfalls)
  - Day 2: Munnar Sightseeing (Tea Gardens, Mattupetty Dam, Echo Point, Eravikulam National Park)
  - Day 3: Munnar to Thekkady (Periyar Wildlife Sanctuary, Spice Plantations)
  - Day 4: Thekkady to Alleppey (Backwaters cruise / Houseboat check-in)
  - Day 5: Alleppey to Kovalam (Lighthouse Beach, Hawah Beach, Poovar Island backwaters)
  - Day 6: Kovalam / Trivandrum Sightseeing (Padmanabhaswamy Temple, Napier Museum)
  - Day 7: Kovalam to Trivandrum (`TRV`) or Cochin (`COK`) Airport Drop
- All future packages remain in `DRAFT` status until full day-wise itineraries are supplied via verified PDF or DOCX exports.
