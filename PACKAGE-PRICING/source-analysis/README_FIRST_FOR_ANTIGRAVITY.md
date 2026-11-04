# VARNI HOLIDAYS — SOURCE MATERIALS GUIDE FOR ANTIGRAVITY

**Confidential working material. Do not expose supplier/rack rates, internal margins, or source documents to public website visitors.**

## What to do first
1. Extract the client's original `travel packges ready info.zip` into this project's `source-materials/` folder, keeping the folder structure and original filenames.
2. Keep the generated `package_source_data.json`, CSV files, and this README in `docs/source-analysis/`.
3. Read this guide and the extracted JSON/CSVs before making package UI, schema, seed data, or price-calculation assumptions.
4. Trace every displayed package field to its original document and table. Preserve source filename and source row/table metadata.
5. Never invent missing itineraries, inclusions, availability, prices, ratings, or provider details. Flag missing/ambiguous content for client confirmation.

## Inventory found in uploaded archive
- 10 DOCX rate/catalogue files: paired `Ready Packages` and `Rack Rate with 15% Margin of Travel Agent` versions for most regions.
- 11 travel-package promotional flyers.
- 2 car-rental flyers.
- 22 itinerary/package route options in the catalogue indexes: Andaman (5), Karnataka & Tamil Nadu (4), Kerala (4), Tamil Nadu Temple Tours (5), Hyderabad & Srisailam (4).
- 106 itinerary × accommodation-tier combinations in the main matrices (Andaman 5×6, South India 4×5, Kerala 4×5, Temple Tours 5×4, Hyderabad 4×4), before vehicle/group-size rate variants and add-ons.

## Data already visible in the archive
- Package names, route, duration, pickup/drop locations.
- Hotel options by package tier (e.g. Standard, Deluxe, Super Deluxe, Premium, Luxury; Andaman has Budget through Luxury).
- Per-person rate matrices across vehicle type and supported group sizes (commonly 2, 4, 6, 8 and 10 pax; exact breakpoints vary by region/document).
- Extra adult / child with bed / child without bed supplements in some matrices.
- Meal supplements, houseboat supplements, day-trip add-ons, honeymoon inclusions and vehicle luggage/seating information where present.
- Seasonal validity windows and blackout dates.
- Package inclusions, exclusions, transportation rules and operational notes.

## Important price-handling rules
- Treat the `Ready Packages` and `Rack Rate with 15% Margin of Travel Agent` documents as separate rate layers. Do not merge or overwrite one with the other.
- The rack-rate label suggests a 15% travel-agent margin, but do not calculate a selling price by blindly multiplying the base rate by 1.15. Some table amounts are rounded or do not match an exact 15% calculation. Use the explicit value from the selected approved source.
- The Kerala 6N/7D promotional flyer matches rack-rate figures. That alone does not establish that every rack-rate figure is authorised for public display. Ask the client which price layer is Varni's approved customer-facing price.
- Keep supplier/base cost and customer-facing price in separate protected fields/tables/permissions. Never send supplier rates to frontend responses or public APIs.
- Do not assume a single per-person rate applies to all passenger counts. A rate row can depend on minimum pax, room count, vehicle type, hotel tier and duration.
- Do not interpolate or extrapolate for unsupported passenger counts. For unsupported party sizes, show an enquiry / request-a-quote path.
- Price calculations must retain child supplements, extra-bed status, meal supplements, houseboat and other add-ons as separate line items. Do not silently include them.
- Save a price snapshot on each enquiry/quotation/booking so later catalogue changes do not rewrite historical customer records.

## Kerala package: 6 Nights / 7 Days
The catalogue specifies: Ex-Cochin; 2N Munnar + 1N Thekkady + 1N Alleppey + 2N Kovalam/Poovar; pickup Cochin; drop Trivandrum or Cochin. Five accommodation tiers are listed. The rack-rate flyer shows customer-style per-person prices for 2, 4 and 6 pax. The detailed matrix also contains more vehicle/group-size rows, child supplements, and meal rates. See `kerala_6n7d_price_matrix.csv` and the source DOCX table.

**Duration correction:** use 6 Nights / 7 Days (6N/7D), not 6 days / 7 nights. Package duration is a fixed itinerary option. If the user wants extra nights or a bespoke route, treat that as a custom enquiry unless the client supplies a pricing rule.

## Validity and source conflicts to flag
- Several core seasonal catalogues state validity from 1 October 2026 to 31 March 2027.
- Kerala, South India and Temple Tour catalogues show a 20 December 2026–10 January 2027 rate blackout.
- Andaman shows a different blackout: 15 December 2026–10 January 2027, and includes a note limiting one booking to no more than 7 persons.
- The Hyderabad/Srisailam ready-package V6 document is for 1 October 2026–31 March 2027. Its paired file labelled `Rack Rate with 15% Margin` is still valid only 1 April–30 September 2026. Do not pair those documents as current-season prices. A current-season Hyderabad rack-rate sheet is missing from the archive.
- The archive root folder claims `7 States`, but its Rajasthan ready-packages directory is empty. No Rajasthan package catalogue was supplied in this ZIP.
- The DOCX files contain Google Docs hyperlinks for detailed itineraries. Those full day-wise itinerary documents are not embedded in the ZIP. One Temple Tour link is a relative reference to a Summer V5 DOCX not present in this archive. Ask for the linked itinerary exports or verified access before publishing day-wise itineraries.

## Website / SRS implications
- Public site is enquiry-led for Flights, Packages and Visa; the archive does not supply flight inventory APIs, visa provider APIs, or real-time booking capability. Do not build live flight search results from these package files.
- Package UI should support fixed itinerary/duration + destination + hotel tier + passenger composition + supported vehicle/group-size pricing. Show `Starting from` only when the client approves a verified public price and the qualifying pax/vehicle conditions are clear.
- Enquiry submissions should store selected package, duration, tier, pax/child composition, selected vehicle/group-rate row, displayed price and source/rate version as a snapshot.
- Employee/admin permissions must restrict supplier costs and internal margin information to authorised roles.
- The ZIP contains no customer CRM metrics such as lead counts, conversion rates, monthly sales, call outcomes or employee performance. Those are live system metrics to be generated from Varni's own database after launch, not derived from this supplier package archive.

## External itinerary links
The detailed itinerary URLs are extracted to `source_links.csv`. Check their sharing permissions and download/export the content into `source-materials/itineraries/` if the client wants day-wise itinerary content displayed.

## Generated analysis files
- `package_source_data.json`: paragraph text, every table cell, hyperlinks and image manifest from the DOCX source files.
- `package_index.csv`: package/supplement index rows with source filenames.
- `source_links.csv`: URLs/relative references embedded in the DOCX files.
- `flyer_index.csv`: supplied flyer filenames and dimensions.
- `kerala_6n7d_price_matrix.csv`: exact extracted per-person rate rows and add-on rows from both Kerala 6N/7D price versions.

## Do not start implementation based on assumptions
Before coding price logic, confirm which rate layer is public, whether prices are per person for each min-pax row, whether children count toward pax breakpoints, how extra rooms are allocated, and what to do for in-between party sizes (e.g. 3, 5, 7, 9). Confirm current Hyderabad rack rates and obtain missing Rajasthan and detailed itinerary material if those services are in scope.
