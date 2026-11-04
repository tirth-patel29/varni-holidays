import { FlightEnquirySchema, PackageEnquirySchema, VisaEnquirySchema } from '../lib/validation/schemas';
import { validatePhoneNumber } from '../lib/validation/phone';

console.log('=== RUNNING VALIDATION & NORMALIZATION TESTS ===\n');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Phone Normalization tests
const p1 = validatePhoneNumber('+91', '98980 12345');
assert(p1.normalized === '+919898012345', `Phone 1 normalized: got ${p1.normalized}`);
assert(p1.isValid === true, 'Phone 1 is valid Indian 10-digit number');

const p2 = validatePhoneNumber('+1', '(415) 555-2671');
assert(p2.normalized === '+14155552671', `Phone 2 normalized: got ${p2.normalized}`);
assert(p2.isValid === true, 'Phone 2 is valid US 10-digit number');

const p3 = validatePhoneNumber('+91', '123');
assert(p3.isValid === false, 'Phone 3 (123) correctly flagged invalid');

// 2. Flight Enquiry Schema Validation
const validFlight = FlightEnquirySchema.safeParse({
  fullName: 'Tirth Patel',
  email: 'tirth@example.com',
  phoneCountryCode: '+91',
  phoneNumber: '9898012345',
  tripType: 'ROUND_TRIP',
  originAirport: 'AMD - Ahmedabad',
  destinationAirport: 'COK - Cochin',
  departureDate: '2026-12-01',
  returnDate: '2026-12-08',
  adultsCount: 2,
  cabinClass: 'ECONOMY',
});
assert(validFlight.success === true, 'Valid flight enquiry passes Zod validation');

const invalidFlight = FlightEnquirySchema.safeParse({
  fullName: 'T', // too short
  phoneCountryCode: '+91',
  phoneNumber: '',
  tripType: 'ROUND_TRIP',
  originAirport: '',
  destinationAirport: '',
  departureDate: '',
  adultsCount: 0,
});
assert(invalidFlight.success === false, 'Invalid flight enquiry is correctly rejected');

// 3. Package Enquiry Schema Validation
const validPackage = PackageEnquirySchema.safeParse({
  fullName: 'Neel Patel',
  email: 'neel@example.com',
  phoneCountryCode: '+91',
  phoneNumber: '9924111111',
  packageSlug: 'kerala-6n7d-winter',
  hotelTier: 'STANDARD',
  configCode: '6PAX_INNOVA',
  adultsCount: 6,
  childrenWithBedCount: 1,
  childrenNoBedCount: 0,
  includeHouseboatUpgrade: true,
});
assert(validPackage.success === true, 'Valid package enquiry passes Zod validation');

// 4. Visa Enquiry Schema Validation
const validVisa = VisaEnquirySchema.safeParse({
  fullName: 'Amit Shah',
  email: 'amit@example.com',
  phoneCountryCode: '+91',
  phoneNumber: '9825098250',
  destinationCountry: 'United Arab Emirates (Dubai)',
  visaCategory: 'TOURIST',
  applicantNationality: 'Indian',
  applicantCount: 2,
});
assert(validVisa.success === true, 'Valid visa enquiry passes Zod validation');

console.log('\n🎉 ALL VALIDATION & NORMALIZATION TESTS PASSED!\n');
