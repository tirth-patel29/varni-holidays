# Antigravity Task — Analyse Varni Holidays Source Package Materials

You are working on the Varni Holidays website + internal employee/admin CRM project. The client has supplied a large source archive named `travel packges ready info.zip`.

## Your task now: source analysis only — do not implement the website or database yet

The source archive should be extracted into this project at:

`source-materials/travel-packages/`

Keep the original directory structure and filenames. The companion analysis files should be placed in:

`docs/source-analysis/`

Read `README_FIRST_FOR_ANTIGRAVITY.md` and `package_source_data.json` first, then verify important facts against the original DOCX and flyer files.

## Required analysis

1. Recursively inspect every source file, including all DOCX files and all JPG/PNG flyers.
2. Extract every paragraph, table, table cell, package index, rate row, hotel tier, hotel name, vehicle type, pax breakpoint, room count, child supplement, meal supplement, houseboat supplement, day-trip supplement, honeymoon add-on, validity window, blackout date, inclusion, exclusion and operational note.
3. Identify each package by region, itinerary/package code, route, pickup/drop location, duration, accommodation tier and applicable price matrix.
4. Compare each `Ready Packages` rate document with its similarly named `Rack Rate with 15% Margin of Travel Agent` document. Keep them as separate rate layers. Do not assume an exact 15% calculation or silently overwrite a source price.
5. Inspect the supplied promotional flyers. Record their wording and prices, and match them to the relevant DOCX package only when the match is unambiguous.
6. Extract external itinerary hyperlinks from the DOCX files. Check whether each referenced Google Doc is accessible using the available tools or user-authorised connected account. If inaccessible, list it as a missing dependency and ask for an exported DOCX/PDF. Do not invent day-wise itineraries.
7. Identify missing, stale, inconsistent or ambiguous source material. At minimum, verify the Rajasthan folder, the Hyderabad seasonal rack-rate mismatch, the old/new validity windows, Andaman's maximum-pax note, and missing linked itinerary documents.
8. Keep a complete source-to-field trace: original filename, table index, row number and source cell/value for every price or package detail used.

## Critical commercial and data-security rules

- Never expose supplier/base rates, rack-rate margin data or internal cost values on public pages or public APIs.
- Keep supplier cost, customer selling price and margin as separately permission-controlled data. The client must approve which rate sheet is customer-facing before prices are published.
- Never derive a customer selling price by simply multiplying by 1.15. Use the approved explicit price matrix or an approved configurable markup rule.
- The package price is not a single linear function of passenger count. It can depend on itinerary, duration, hotel tier, vehicle type, minimum pax, room count, child composition and add-ons.
- Do not interpolate/extrapolate prices for unsupported passenger counts. Use a quote/enquiry path.
- Keep package duration choices fixed to the supplied itineraries. Custom extra nights or custom routes require a manual quotation unless a valid price rule is supplied.
- Store an immutable price/rate snapshot on each enquiry, quotation and booking so later catalogue updates do not change history.
- Do not invent availability, real hotel confirmation, airline inventory, visa eligibility, customer reviews, ratings, awards, company metrics or booking data.

## What the archive does NOT answer

The package archive does not provide flight API/provider access, visa-provider integrations, employee/customer CRM history, real sales/conversion statistics, employee performance metrics or WhatsApp Business credentials. These remain client decisions or future system-generated metrics. Do not claim the ZIP resolves these questions.

## Admin/employee metrics to propose (definitions only; no fabricated values)

Propose database-derived dashboard metrics such as total enquiries, enquiries by service, leads by pipeline stage, first-response time, overdue follow-ups, quotations sent/accepted, bookings confirmed, upcoming travel, payment collected/outstanding (only if payment records are implemented), conversion rate with a clearly defined denominator, and employee workload/lead outcomes. Explain the source events and formulas. Do not populate fake numbers.

## Deliverables

Create or update the following documents without changing application code:

- `docs/source-analysis/SOURCE_ANALYSIS_REPORT.md` — findings, source inventory, route catalogue, price rules, inclusions/exclusions, seasonal rules, missing data and conflicts.
- `docs/source-analysis/PACKAGE_CATALOGUE.csv` — one row per distinct itinerary, with source trace.
- `docs/source-analysis/PACKAGE_PRICE_MATRIX.csv` — one row per exact published source rate row, preserving rate layer, tier, pax, rooms, vehicle and source trace.
- `docs/source-analysis/EXTERNAL_ITINERARIES.csv` — each itinerary link, corresponding package, access status and next action.
- `docs/source-analysis/SRS_CHANGELOG.md` — precise list of which SRS requirements the archive confirms, refines, or does not answer.
- `docs/source-analysis/OPEN_CLIENT_DECISIONS.md` — unresolved questions requiring client approval.

Do not modify the approved UI design, start coding, generate migrations or seed the production database during this task. Stop after the source-analysis deliverables are prepared and reviewed.
