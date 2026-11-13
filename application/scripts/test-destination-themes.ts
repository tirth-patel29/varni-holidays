/**
 * VARNI HOLIDAYS — Destination Theme Engine Comprehensive Verification Suite
 * Tests all 12 scenarios requested in the specification.
 */

import { DESTINATION_THEMES, resolveDestinationTheme } from '../lib/themes/registry';
import { TOUR_PACKAGES_CATALOGUE } from '../lib/quotations/catalogue';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
  }
}

console.log('\n======================================================');
console.log('VARNI HOLIDAYS — DESTINATION THEME ENGINE TEST SUITE');
console.log('======================================================\n');

// 1. KERALA THEME VERIFICATION
console.log('--- 1. Testing Kerala Theme ---');
const kerala = DESTINATION_THEMES.kerala;
assert(kerala.id === 'kerala', 'Kerala destination ID is kerala');
assert(kerala.colors.primary === '#0D4A36', 'Kerala primary color is deep tropical green (#0D4A36)');
assert(kerala.colors.accent === '#168653', 'Kerala accent is emerald (#168653)');
assert(kerala.colors.surface === '#F9F8F5', 'Kerala surface is warm coconut ivory (#F9F8F5)');
assert(kerala.ambientEffects.type === 'tropical-mist', 'Kerala ambient effect is tropical-mist');
assert(kerala.decorative.motif === 'leaf', 'Kerala decorative motif is leaf');
assert(kerala.hero.atmosphereTag.includes('Munnar'), 'Kerala hero includes Munnar Tea Hills atmosphere');

// 2. KASHMIR THEME VERIFICATION
console.log('\n--- 2. Testing Kashmir Theme ---');
const kashmir = DESTINATION_THEMES.kashmir;
assert(kashmir.id === 'kashmir', 'Kashmir destination ID is kashmir');
assert(kashmir.colors.primary === '#0B2545', 'Kashmir primary color is glacier navy (#0B2545)');
assert(kashmir.colors.secondary === '#38BDF8', 'Kashmir secondary color is ice blue (#38BDF8)');
assert(kashmir.ambientEffects.type === 'snowfall', 'Kashmir ambient effect is snowfall');
assert(kashmir.ambientEffects.particleCount >= 30, 'Kashmir particle count is sufficient for realistic snowfall (>=30)');
assert(kashmir.decorative.motif === 'snowflake', 'Kashmir decorative motif is snowflake');
assert(kashmir.cards.glassmorphism === true, 'Kashmir cards feature frosted glassmorphism');
assert(kashmir.hero.atmosphereTag.includes('Gulmarg'), 'Kashmir hero atmosphere includes Gulmarg Snow Peaks');

// 3. FUTURE PRESETS VERIFICATION
console.log('\n--- 3. Testing Future Destination Presets ---');
const rajasthan = DESTINATION_THEMES.rajasthan;
assert(rajasthan.id === 'rajasthan', 'Rajasthan preset registered');
assert(rajasthan.colors.primary === '#7C2D12', 'Rajasthan royal terracotta palette');
assert(rajasthan.ambientEffects.type === 'desert-dust', 'Rajasthan desert dust ambient effect');

const goa = DESTINATION_THEMES.goa;
assert(goa.id === 'goa', 'Goa preset registered');
assert(goa.colors.primary === '#0D9488', 'Goa ocean teal palette');
assert(goa.ambientEffects.type === 'ocean-breeze', 'Goa ocean breeze ambient effect');

const himachal = DESTINATION_THEMES.himachal;
assert(himachal.id === 'himachal', 'Himachal preset registered');
assert(himachal.colors.primary === '#1B4332', 'Himachal alpine pine green palette');

const dubai = DESTINATION_THEMES.dubai;
assert(dubai.id === 'dubai', 'Dubai preset registered');
assert(dubai.colors.secondary === '#B45309', 'Dubai desert gold secondary palette');

// 4. RESOLVER & STRING ROUTING LOGIC
console.log('\n--- 4. Testing Theme Resolver & Normalization ---');
assert(resolveDestinationTheme('kerala').id === 'kerala', 'Resolves "kerala"');
assert(resolveDestinationTheme('Kerala (Munnar, Thekkady, Alleppey)').id === 'kerala', 'Resolves complex Kerala string');
assert(resolveDestinationTheme('kashmir').id === 'kashmir', 'Resolves "kashmir"');
assert(resolveDestinationTheme('Kashmir, India').id === 'kashmir', 'Resolves "Kashmir, India"');
assert(resolveDestinationTheme('Gulmarg Snow Escape').id === 'kashmir', 'Resolves keyword "Gulmarg" to Kashmir');
assert(resolveDestinationTheme('Dal Lake Shikara Tour').id === 'kashmir', 'Resolves keyword "Dal Lake" to Kashmir');
assert(resolveDestinationTheme('Royal Rajasthan').id === 'rajasthan', 'Resolves keyword "Rajasthan"');
assert(resolveDestinationTheme('Goa Beach Holiday').id === 'goa', 'Resolves keyword "Goa"');
assert(resolveDestinationTheme('Dubai Luxury').id === 'dubai', 'Resolves keyword "Dubai"');
assert(resolveDestinationTheme(null).id === 'kerala', 'Null safely defaults to Kerala fallback');
assert(resolveDestinationTheme('unknown-space-tour').id === 'kerala', 'Unknown safely defaults to default');

// 5. PACKAGE CATALOGUE INTEGRATION
console.log('\n--- 5. Testing Package Catalogue Integration ---');
const keralaPkg = TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === 'kerala-6n7d-winter');
assert(!!keralaPkg, 'Kerala 6N7D package exists in catalogue');
assert(resolveDestinationTheme(keralaPkg?.destination).id === 'kerala', 'Kerala package maps to Kerala theme');

const kashmirPkg = TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === 'kashmir-valley-5n6d');
assert(!!kashmirPkg, 'Kashmir 5N6D package exists in catalogue');
assert(resolveDestinationTheme(kashmirPkg?.destination).id === 'kashmir', 'Kashmir package maps to Kashmir theme');
assert((kashmirPkg?.itineraryDays.length || 0) >= 5, 'Kashmir package has full 5N6D day-wise itinerary');
assert(kashmirPkg?.inclusions.some((i) => i.includes('Houseboat')) === true, 'Kashmir inclusions contain Houseboat stay');
assert(kashmirPkg?.inclusions.some((i) => i.includes('Shikara')) === true, 'Kashmir inclusions contain Shikara ride');

const rajasthanPkg = TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === 'rajasthan-royal-7n8d');
assert(!!rajasthanPkg, 'Rajasthan 7N8D package exists in catalogue');
assert(resolveDestinationTheme(rajasthanPkg?.destination).id === 'rajasthan', 'Rajasthan package maps to Rajasthan theme');

// 6. ACCESSIBILITY & REDUCED MOTION SAFEGUARDS
console.log('\n--- 6. Testing Accessibility & Reduced Motion Safeguards ---');
assert(!!kashmir.ambientEffects.reducedMotionFallback, 'Kashmir provides reducedMotionFallback');
assert(!!kerala.ambientEffects.reducedMotionFallback, 'Kerala provides reducedMotionFallback');
assert(kashmir.ambientEffects.reducedMotionFallback.includes('radial-gradient'), 'Reduced motion fallback is a gentle static gradient');

console.log('\n======================================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
