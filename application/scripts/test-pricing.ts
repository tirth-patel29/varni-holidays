import { calculateKeralaPrice } from '../lib/pricing/kerala';

console.log('=== RUNNING DETERMINISTIC KERALA PRICING ENGINE TESTS ===\n');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// Test 1: 2 Pax Sedan Standard
const r1 = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 2,
});
assert(r1.pricingStatus === 'EXACT_MATCH', 'Test 1: Status is EXACT_MATCH');
assert(r1.unitPricePerAdult === 27400, `Test 1: 2 Pax Sedan unit price is 27400 (got ${r1.unitPricePerAdult})`);
assert(r1.totalEstimate === 54800, `Test 1: Total is 54800 (got ${r1.totalEstimate})`);
assert(r1.matchedVehicleType?.includes('Sedan') ?? false, 'Test 1: Vehicle is Sedan');

// Test 2: 4 Pax Innova Standard
const r2 = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 4,
});
assert(r2.pricingStatus === 'EXACT_MATCH', 'Test 2: Status is EXACT_MATCH');
assert(r2.unitPricePerAdult === 24500, `Test 2: 4 Pax Innova unit price is 24500 (got ${r2.unitPricePerAdult})`);
assert(r2.matchedVehicleType?.includes('Innova') ?? false, 'Test 2: Vehicle is Innova');

// Test 3: 6 Pax Innova Standard (Option A: 6PAX_INNOVA)
const r3a = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 6,
  configCode: '6PAX_INNOVA',
});
assert(r3a.pricingStatus === 'EXACT_MATCH', 'Test 3a: Status is EXACT_MATCH');
assert(r3a.unitPricePerAdult === 20700, `Test 3a: 6 Pax Innova unit price is 20700 (got ${r3a.unitPricePerAdult})`);
assert(r3a.totalEstimate === 124200, `Test 3a: 6 Pax Innova total is 124200 (got ${r3a.totalEstimate})`);

// Test 4: 6 Pax Traveller Standard (Option B: 6PAX_TRAVELLER)
const r3b = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 6,
  configCode: '6PAX_TRAVELLER',
});
assert(r3b.pricingStatus === 'EXACT_MATCH', 'Test 3b: Status is EXACT_MATCH');
assert(r3b.unitPricePerAdult === 21400, `Test 3b: 6 Pax Traveller unit price is 21400 (got ${r3b.unitPricePerAdult})`);
assert(r3b.totalEstimate === 128400, `Test 3b: 6 Pax Traveller total is 128400 (got ${r3b.totalEstimate})`);

// Test 5: 8 Pax Traveller Standard
const r4 = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 8,
});
assert(r4.pricingStatus === 'EXACT_MATCH', 'Test 4: Status is EXACT_MATCH');
assert(r4.unitPricePerAdult === 19400, `Test 4: 8 Pax unit price is 19400 (got ${r4.unitPricePerAdult})`);
assert(r4.totalEstimate === 155200, `Test 4: 8 Pax total is 155200 (got ${r4.totalEstimate})`);

// Test 6: 10 Pax Traveller Standard
const r5 = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 10,
});
assert(r5.pricingStatus === 'EXACT_MATCH', 'Test 5: Status is EXACT_MATCH');
assert(r5.unitPricePerAdult === 18200, `Test 5: 10 Pax unit price is 18200 (got ${r5.unitPricePerAdult})`);
assert(r5.totalEstimate === 182000, `Test 5: 10 Pax total is 182000 (got ${r5.totalEstimate})`);

// Test 7: Non-standard 5 Pax (Must NOT interpolate - Phase 0 requirement)
const r6 = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 5,
});
assert(r6.pricingStatus === 'CUSTOM_QUOTATION_REQUIRED', 'Test 6: 5 Pax requires CUSTOM_QUOTATION_REQUIRED');
assert(r6.totalEstimate === null, 'Test 6: Total is null (no interpolation)');

// Test 8: Child With Bed (CWB) and Child No Bed (CNB)
const r8 = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 2,
  childrenWithBedCount: 1,
  childrenNoBedCount: 1,
});
assert(r8.childrenWithBedAmount === 5400, `Test 8: CWB is 5400 (got ${r8.childrenWithBedAmount})`);
assert(r8.childrenNoBedAmount === 3400, `Test 8: CNB is 3400 (got ${r8.childrenNoBedAmount})`);
assert(r8.totalEstimate === 54800 + 5400 + 3400, `Test 8: Combined total is 63600 (got ${r8.totalEstimate})`);

// Test 9: Houseboat Upgrade for 2 Pax
const r9 = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 2,
  includeHouseboatUpgrade: true,
});
assert(r9.houseboatUpgradeAmount === 6800, `Test 9: Houseboat upgrade is 6800 (got ${r9.houseboatUpgradeAmount})`);
assert(r9.totalEstimate === 54800 + 6800, `Test 9: Total with houseboat is 61600 (got ${r9.totalEstimate})`);

// Test 10: Day Trips (Athirapilly + Kanyakumari for Sedan)
const r10 = calculateKeralaPrice({
  hotelTier: 'STANDARD',
  adultsCount: 2,
  includeAthirapillyTrip: true,
  includeKanyakumariTrip: true,
});
assert(r10.dayTripsAmount === 4000 + 4500, `Test 10: Day trips amount is 8500 (got ${r10.dayTripsAmount})`);
assert(r10.totalEstimate === 54800 + 8500, `Test 10: Total with day trips is 63300 (got ${r10.totalEstimate})`);

console.log('\n🎉 ALL 10 DETERMINISTIC PRICING ENGINE TESTS PASSED!\n');
