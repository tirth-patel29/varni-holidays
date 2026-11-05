// Kerala Ready Packages (October 2026 to March 2027)
// Direct Verified Extraction from:
// - Travel-e (Kerala Winter Ready Packages) Rack Rate with 15% Margin of Travel Agent V6.docx
// - Travel-e (Kerala Winter Ready Packages) V6.docx

export type KeralaDuration = "5N6D" | "6N7D";

export interface KeralaDurationOption {
  code: KeralaDuration;
  label: string;
  nights: number;
  days: number;
  tagline: string;
  routeTitle: string;
  routeStays: string;
}

export const KERALA_DURATION_OPTIONS: KeralaDurationOption[] = [
  {
    code: "5N6D",
    label: "5 Nights / 6 Days",
    nights: 5,
    days: 6,
    tagline: "Cochin, Munnar Hills, Thekkady & Alleppey Backwaters",
    routeTitle: "Package 01 | 5N/6D Ex-Cochin",
    routeStays: "1N Cochin + 2N Munnar + 1N Thekkady + 1N Alleppey",
  },
  {
    code: "6N7D",
    label: "6 Nights / 7 Days",
    nights: 6,
    days: 7,
    tagline: "Munnar Hills, Thekkady, Alleppey & Kovalam Beach",
    routeTitle: "Package 02 | 6N/7D Grand Tour",
    routeStays: "2N Munnar + 1N Thekkady + 1N Alleppey + 2N Kovalam / Poovar",
  },
];

export interface HotelTierOption {
  code: "STANDARD" | "DELUXE" | "SUPER_DELUXE" | "PREMIUM" | "LUXURY";
  name: string;
  tagline: string;
  badge?: string;
  hotels: {
    cochin?: string;
    munnar: string;
    thekkady: string;
    alleppey: string;
    kovalam?: string;
  };
}

// 6N/7D Hotels (Table 2 in Source DOCX)
export const HOTEL_TIERS_6N7D: Record<string, HotelTierOption> = {
  STANDARD: {
    code: "STANDARD",
    name: "Standard",
    tagline: "Comfortable 3-star selected leisure properties",
    hotels: {
      munnar: "Las Palms / Similar",
      thekkady: "The Patio / Similar",
      alleppey: "Pagoda Resort / Similar",
      kovalam: "Jasmine Palace / Similar",
    },
  },
  DELUXE: {
    code: "DELUXE",
    name: "Deluxe",
    tagline: "Premium handpicked 3-star deluxe resorts",
    badge: "Popular Value",
    hotels: {
      munnar: "The Arbour Resort / Similar",
      thekkady: "Hotel Peppervine / Similar",
      alleppey: "Arcadia Regency / Similar",
      kovalam: "Samudra Theeram Resort / Similar",
    },
  },
  SUPER_DELUXE: {
    code: "SUPER_DELUXE",
    name: "Super Deluxe",
    tagline: "Spacious scenic 4-star leisure stays",
    hotels: {
      munnar: "Misty Lake Resort / Similar",
      thekkady: "Silver Crest / Similar",
      alleppey: "Haveli Backwaters / Similar",
      kovalam: "Abad Harmonia / Similar",
    },
  },
  PREMIUM: {
    code: "PREMIUM",
    name: "Premium",
    tagline: "Boutique 4-star superior experiential retreats",
    badge: "Signature Choice",
    hotels: {
      munnar: "Munnar Queen / Similar",
      thekkady: "Spices Lap Resort / Similar",
      alleppey: "Warmth Lake Haven / Similar",
      kovalam: "Isola De Coco / Similar",
    },
  },
  LUXURY: {
    code: "LUXURY",
    name: "Luxury",
    tagline: "Uncompromised 5-star premier heritage resorts",
    badge: "Ultra Luxury",
    hotels: {
      munnar: "Haze & Kites / Similar",
      thekkady: "WGH Poetree / Similar",
      alleppey: "World Backwaters / Similar",
      kovalam: "Uday Samudra Beach Resort / Similar",
    },
  },
};

// 5N/6D Hotels (Table 1 in Source DOCX)
export const HOTEL_TIERS_5N6D: Record<string, HotelTierOption> = {
  STANDARD: {
    code: "STANDARD",
    name: "Standard",
    tagline: "Comfortable 3-star selected leisure properties",
    hotels: {
      cochin: "Hotel Sealord / Similar",
      munnar: "Las Palms / Similar",
      thekkady: "The Patio / Similar",
      alleppey: "Pagoda Resort / Similar",
    },
  },
  DELUXE: {
    code: "DELUXE",
    name: "Deluxe",
    tagline: "Premium handpicked 3-star deluxe resorts",
    badge: "Popular Value",
    hotels: {
      cochin: "Hotel Sealord / Similar",
      munnar: "The Arbour Resort / Similar",
      thekkady: "Hotel Peppervine / Similar",
      alleppey: "Arcadia Regency / Similar",
    },
  },
  SUPER_DELUXE: {
    code: "SUPER_DELUXE",
    name: "Super Deluxe",
    tagline: "Spacious scenic 4-star leisure stays",
    hotels: {
      cochin: "Yuvarani Residency / Similar",
      munnar: "Misty Lake Resort / Similar",
      thekkady: "Silver Crest / Similar",
      alleppey: "Haveli Backwaters / Similar",
    },
  },
  PREMIUM: {
    code: "PREMIUM",
    name: "Premium",
    tagline: "Boutique 4-star superior experiential retreats",
    badge: "Signature Choice",
    hotels: {
      cochin: "Marine Inn / Similar",
      munnar: "Munnar Queen / Similar",
      thekkady: "Spices Lap Resort / Similar",
      alleppey: "Warmth Lake Haven / Similar",
    },
  },
  LUXURY: {
    code: "LUXURY",
    name: "Luxury",
    tagline: "Uncompromised 5-star premier heritage resorts",
    badge: "Ultra Luxury",
    hotels: {
      cochin: "Hotel Airlink Castle / Similar",
      munnar: "Haze & Kites / Similar",
      thekkady: "WGH Poetree / Similar",
      alleppey: "World Backwaters / Similar",
    },
  },
};

// Backward-compatible alias
export const HOTEL_TIERS = HOTEL_TIERS_6N7D;

export interface VehiclePaxOption {
  code: "2PAX_SEDAN" | "4PAX_INNOVA" | "6PAX_INNOVA" | "6PAX_TRAVELLER" | "8PAX_TRAVELLER" | "10PAX_TRAVELLER";
  paxCount: number;
  roomsCount: number;
  vehicleType: string;
  label: string;
  description: string;
}

export const VEHICLE_PAX_OPTIONS: VehiclePaxOption[] = [
  {
    code: "2PAX_SEDAN",
    paxCount: 2,
    roomsCount: 1,
    vehicleType: "AC Sedan (Dzire / Etios)",
    label: "2 Persons (1 Room) • Private AC Sedan",
    description: "Ideal for couples & honeymooners. 3 Large Bags max.",
  },
  {
    code: "4PAX_INNOVA",
    paxCount: 4,
    roomsCount: 2,
    vehicleType: "AC Innova Crysta",
    label: "4 Persons (2 Rooms) • Private Innova Crysta",
    description: "Spacious family comfort with 4-5 luggage bags.",
  },
  {
    code: "6PAX_INNOVA",
    paxCount: 6,
    roomsCount: 3,
    vehicleType: "AC Innova Crysta",
    label: "6 Persons (3 Rooms) • Innova Crysta",
    description: "Max vehicle seating capacity (6 adults). Compact luggage.",
  },
  {
    code: "6PAX_TRAVELLER",
    paxCount: 6,
    roomsCount: 3,
    vehicleType: "12-Seater AC Tempo Traveller",
    label: "6 Persons (3 Rooms) • AC Tempo Traveller",
    description: "Extra luxury legroom with pushback seats & high luggage capacity.",
  },
  {
    code: "8PAX_TRAVELLER",
    paxCount: 8,
    roomsCount: 4,
    vehicleType: "12-Seater AC Tempo Traveller",
    label: "8 Persons (4 Rooms) • 12-Seater AC Traveller",
    description: "Spacious group travel with dedicated luggage carrier.",
  },
  {
    code: "10PAX_TRAVELLER",
    paxCount: 10,
    roomsCount: 5,
    vehicleType: "12-Seater AC Tempo Traveller",
    label: "10 Persons (5 Rooms) • 12-Seater AC Traveller",
    description: "Grand family entourage with complete disposal 8am-8pm.",
  },
];

// Exact Published Source Rack Rates (INR Per Person CPAI Breakfast & Taxes Included)
// Source: Travel-e (Kerala Winter Ready Packages) Rack Rate with 15% Margin V6.docx Table 2 (6N/7D)
export const KERALA_6N7D_RACK_RATE_MATRIX: Record<string, Record<string, number>> = {
  "2PAX_SEDAN": {
    STANDARD: 27400,
    DELUXE: 29400,
    SUPER_DELUXE: 32400,
    PREMIUM: 34700,
    LUXURY: 40800,
  },
  "4PAX_INNOVA": {
    STANDARD: 24500,
    DELUXE: 26500,
    SUPER_DELUXE: 29600,
    PREMIUM: 31800,
    LUXURY: 37900,
  },
  "6PAX_INNOVA": {
    STANDARD: 20700,
    DELUXE: 22800,
    SUPER_DELUXE: 25800,
    PREMIUM: 28100,
    LUXURY: 34200,
  },
  "6PAX_TRAVELLER": {
    STANDARD: 21400,
    DELUXE: 23400,
    SUPER_DELUXE: 26500,
    PREMIUM: 28700,
    LUXURY: 34800,
  },
  "8PAX_TRAVELLER": {
    STANDARD: 19400,
    DELUXE: 21400,
    SUPER_DELUXE: 24400,
    PREMIUM: 26700,
    LUXURY: 32800,
  },
  "10PAX_TRAVELLER": {
    STANDARD: 18200,
    DELUXE: 20200,
    SUPER_DELUXE: 23200,
    PREMIUM: 25500,
    LUXURY: 31600,
  },
};

// Exact Published Source Rack Rates (INR Per Person CPAI Breakfast & Taxes Included)
// Source: Travel-e (Kerala Winter Ready Packages) Rack Rate with 15% Margin V6.docx Table 1 (5N/6D)
export const KERALA_5N6D_RACK_RATE_MATRIX: Record<string, Record<string, number>> = {
  "2PAX_SEDAN": {
    STANDARD: 19300,
    DELUXE: 20800,
    SUPER_DELUXE: 22800,
    PREMIUM: 25700,
    LUXURY: 29400,
  },
  "4PAX_INNOVA": {
    STANDARD: 17300,
    DELUXE: 18900,
    SUPER_DELUXE: 20900,
    PREMIUM: 23800,
    LUXURY: 27400,
  },
  "6PAX_INNOVA": {
    STANDARD: 14700,
    DELUXE: 16300,
    SUPER_DELUXE: 18300,
    PREMIUM: 21200,
    LUXURY: 24900,
  },
  "6PAX_TRAVELLER": {
    STANDARD: 15400,
    DELUXE: 17000,
    SUPER_DELUXE: 19000,
    PREMIUM: 21900,
    LUXURY: 25500,
  },
  "8PAX_TRAVELLER": {
    STANDARD: 13900,
    DELUXE: 15500,
    SUPER_DELUXE: 17500,
    PREMIUM: 20400,
    LUXURY: 24100,
  },
  "10PAX_TRAVELLER": {
    STANDARD: 13100,
    DELUXE: 14700,
    SUPER_DELUXE: 16600,
    PREMIUM: 19500,
    LUXURY: 23200,
  },
};

// Backward-compatible alias
export const KERALA_RACK_RATE_MATRIX = KERALA_6N7D_RACK_RATE_MATRIX;

// Supplements for 6N/7D (Table 2 in Source DOCX)
export const SUPPLEMENTS_6N7D = {
  EXTRA_ADULT_BED: {
    STANDARD: 7500,
    DELUXE: 9800,
    SUPER_DELUXE: 9700,
    PREMIUM: 12300,
    LUXURY: 16700,
  },
  CHILD_WITH_BED: {
    STANDARD: 5400,
    DELUXE: 7500,
    SUPER_DELUXE: 7500,
    PREMIUM: 8400,
    LUXURY: 11600,
  },
  CHILD_NO_BED: {
    STANDARD: 3400,
    DELUXE: 5600,
    SUPER_DELUXE: 4900,
    PREMIUM: 7700,
    LUXURY: 7700,
  },
  MEAL_PLAN: {
    STANDARD: 3800,
    DELUXE: 5200,
    SUPER_DELUXE: 5700,
    PREMIUM: 6200,
    LUXURY: 9700,
  },
  HOUSEBOAT_UPGRADE_1BR: {
    STANDARD: 3400, // Deluxe boat
    DELUXE: 3250,   // Deluxe boat
    SUPER_DELUXE: 3250, // Deluxe boat
    PREMIUM: 5250,  // Premium boat
    LUXURY: 4750,   // Premium boat
  },
  DAY_TRIP_ATHIRAPILLY: {
    SEDAN: 4000,
    INNOVA: 5000,
    TRAVELLER: 6000,
  },
  DAY_TRIP_KANYAKUMARI: {
    SEDAN: 4500,
    INNOVA: 5500,
    TRAVELLER: 6500,
  },
};

// Supplements for 5N/6D (Table 1 in Source DOCX)
export const SUPPLEMENTS_5N6D = {
  EXTRA_ADULT_BED: {
    STANDARD: 6300,
    DELUXE: 7100,
    SUPER_DELUXE: 7400,
    PREMIUM: 9200,
    LUXURY: 12000,
  },
  CHILD_WITH_BED: {
    STANDARD: 5800,
    DELUXE: 6300,
    SUPER_DELUXE: 6200,
    PREMIUM: 6500,
    LUXURY: 8900,
  },
  CHILD_NO_BED: {
    STANDARD: 3800,
    DELUXE: 4300,
    SUPER_DELUXE: 3600,
    PREMIUM: 5700,
    LUXURY: 5900,
  },
  MEAL_PLAN: {
    STANDARD: 3500,
    DELUXE: 3900,
    SUPER_DELUXE: 4500,
    PREMIUM: 4900,
    LUXURY: 7200,
  },
  HOUSEBOAT_UPGRADE_1BR: {
    STANDARD: 3400, // Deluxe boat
    DELUXE: 3250,   // Deluxe boat
    SUPER_DELUXE: 3250, // Deluxe boat
    PREMIUM: 5250,  // Premium boat
    LUXURY: 4750,   // Premium boat
  },
  DAY_TRIP_ATHIRAPILLY: {
    SEDAN: 4000,
    INNOVA: 5000,
    TRAVELLER: 6000,
  },
  DAY_TRIP_KANYAKUMARI: {
    SEDAN: 0,
    INNOVA: 0,
    TRAVELLER: 0,
  },
};

// Backward-compatible alias
export const SUPPLEMENTS = SUPPLEMENTS_6N7D;

// Verified Day-Wise Itineraries from DOCX Source
export const KERALA_ITINERARIES: Record<KeralaDuration, Array<{
  day: string;
  title: string;
  route: string;
  desc: string;
  stay: string;
  meals: string;
}>> = {
  "5N6D": [
    {
      day: "Day 1",
      title: "Arrival in Cochin & Historic Port Exploration",
      route: "Cochin Arrival & Local Sightseeing",
      desc: "Welcome to God's Own Country! On arrival at Cochin Airport (COK) or Ernakulam Railway Station, meet your dedicated chauffeur. Board your private vehicle and transfer to your hotel. In the afternoon, explore Fort Kochi, St. Francis Church, Santa Cruz Basilica, the famous Chinese Fishing Nets, and Mattancherry Dutch Palace. In the evening, enjoy a sunset view along Marine Drive. Overnight in Cochin.",
      stay: "Cochin",
      meals: "Welcome Drink & Breakfast (CPAI)",
    },
    {
      day: "Day 2",
      title: "Cochin to Munnar & Cheeyappara Waterfalls",
      route: "Cochin to Munnar (130 Kms / approx. 4 hrs)",
      desc: "After breakfast, check out and drive towards misty Munnar. En route, stop at Cheeyappara and Valara Waterfalls amidst rolling rubber and spice plantations. Arrive in Munnar, check in at your selected resort, and enjoy a restful evening breathing the refreshing mountain air.",
      stay: "Munnar",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 3",
      title: "Munnar Tea Trails & Eravikulam National Park",
      route: "Munnar Local Sightseeing",
      desc: "After breakfast, depart for full-day Munnar sightseeing. Visit Eravikulam National Park (Rajamalai), home to the endangered Nilgiri Tahr mountain goat. Proceed to Mattupetty Dam, Echo Point, and picturesque Kundala Lake tea estates. Later, visit Tata Tea Museum and Floriculture Rose Garden. Overnight in Munnar.",
      stay: "Munnar",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 4",
      title: "Munnar to Thekkady & Periyar Spice Trails",
      route: "Munnar to Thekkady (90 Kms / approx. 3 hrs)",
      desc: "Enjoy breakfast overlooking misty peaks, check out and drive to Thekkady (Periyar). Arrive and check into your resort. In the afternoon, embark on an escorted Spice Plantation Walk to discover cardamom, cinnamon, pepper, and cloves. Optional evening boat safari on Periyar Lake or Kathakali performance. Overnight in Thekkady.",
      stay: "Thekkady",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 5",
      title: "Thekkady to Alleppey Venetian Backwaters",
      route: "Thekkady to Alleppey (140 Kms / approx. 4 hrs)",
      desc: "After breakfast, descend towards Alleppey. Check in at your backwater resort (or private luxury Houseboat if selected). Cruise along emerald canals, observe village life, and witness serene backwater paddy fields. Enjoy sunset reflecting across Vembanad Lake. Traditional Kerala evening dinner served.",
      stay: "Alleppey",
      meals: "Breakfast (or Full Board if Houseboat chosen)",
    },
    {
      day: "Day 6",
      title: "Alleppey to Cochin Departure",
      route: "Alleppey to Cochin Airport (85 Kms / approx. 2.5 hrs)",
      desc: "Savor your final breakfast in the backwaters. Check out and transfer by private sanitized vehicle to Cochin Airport (COK) or Ernakulam Railway Station for your onward journey with joyful memories.",
      stay: "Departure",
      meals: "Breakfast",
    },
  ],
  "6N7D": [
    {
      day: "Day 1",
      title: "Arrival in Cochin & Scenic Drive to Munnar",
      route: "Cochin to Munnar (130 Kms / approx. 4 hrs)",
      desc: "Welcome to God's Own Country! On arrival at Cochin Airport (COK) or Ernakulam Railway Station, meet your professional chauffeur. Board your private sanitized vehicle and begin the picturesque hill journey towards Munnar. En route, stop at the mesmerizing Cheeyappara and Valara Waterfalls amidst rolling rubber and spice plantations. Arrive in Munnar, check in at your selected resort, and enjoy a restful evening breathing the refreshing mountain air.",
      stay: "Munnar",
      meals: "Welcome Drink & Breakfast (CPAI)",
    },
    {
      day: "Day 2",
      title: "Munnar Tea Hills & Eravikulam Wildlife Exploration",
      route: "Munnar Local Sightseeing",
      desc: "After breakfast, depart for full-day Munnar sightseeing. Visit Eravikulam National Park (Rajamalai), home to the endangered Nilgiri Tahr mountain goat. Proceed to the scenic Mattupetty Dam for speedboating against backdrop hills, test your voice at Echo Point, and take stunning photographs amidst Kundala Lake tea estates. Later, visit the Tata Tea Museum and Floriculture Rose Garden. Return to resort for overnight stay.",
      stay: "Munnar",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 3",
      title: "Munnar to Thekkady & Periyar Spice Trails",
      route: "Munnar to Thekkady (90 Kms / approx. 3 hrs)",
      desc: "Enjoy breakfast overlooking misty peaks, check out and drive to Thekkady (Periyar). Arrive and check into your resort. In the afternoon, embark on an escorted Spice Plantation Walk to discover cardamom, cinnamon, pepper, and cloves. Optional evening activities include boating on Periyar Lake inside the wildlife sanctuary to spot wild elephants, or witnessing traditional Kalaripayattu martial arts and Kathakali cultural shows.",
      stay: "Thekkady",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 4",
      title: "Thekkady to Alleppey Venetian Backwaters",
      route: "Thekkady to Alleppey (140 Kms / approx. 4 hrs)",
      desc: "After breakfast, descend toward Alleppey, the famed Venice of the East. Check in at your backwater resort (or private luxury Houseboat if selected). Cruise along emerald palm-fringed canals, observe village life along the banks, and witness serene backwater paddy fields. Enjoy sunset reflecting across Vembanad Lake. Traditional Kerala evening dinner served.",
      stay: "Alleppey",
      meals: "Breakfast (or Full Board if Houseboat chosen)",
    },
    {
      day: "Day 5",
      title: "Alleppey to Kovalam & Poovar Island Coastal Excursion",
      route: "Alleppey to Kovalam / Poovar (160 Kms / approx. 4.5 hrs)",
      desc: "After breakfast, drive south to Kovalam, Kerala's premier seaside sanctuary. Check into your beachside resort. Later, visit Poovar Island where tranquil backwaters, rivers, and the Arabian Sea converge into golden sandbanks (boat cruise available). Relax along the crescent curves of Lighthouse Beach and Hawah Beach. Enjoy an evening stroll along seaside promenade cafes.",
      stay: "Kovalam / Poovar",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 6",
      title: "Trivandrum Cultural Heritage & Padmanabhaswamy Temple",
      route: "Kovalam / Trivandrum Excursion",
      desc: "Morning dedicated to Trivandrum cultural exploration. Seek sacred blessings at the historic Shree Padmanabhaswamy Temple (strict traditional dress code applies). Visit the 19th-century Napier Museum, Sri Chitra Art Gallery, and Kuthiramalika Palace. Afternoon at leisure on Kovalam beach with optional rejuvenating Ayurvedic herbal therapies. Overnight in Kovalam.",
      stay: "Kovalam",
      meals: "Breakfast (CPAI)",
    },
    {
      day: "Day 7",
      title: "Departure from Trivandrum / Cochin Airport",
      route: "Transfer to Airport / Railway Station",
      desc: "Savor your final breakfast overlooking the Arabian Sea. Depending on your flight schedule, check out from the resort and transfer with your private chauffeur to Trivandrum International Airport (TRV) or Cochin Airport (COK). Board your flight home with joyful memories of your Kerala journey with Varni Holidays.",
      stay: "Departure",
      meals: "Breakfast",
    },
  ],
};

export interface PricingCalculationInput {
  duration?: KeralaDuration | string;
  hotelTier: "STANDARD" | "DELUXE" | "SUPER_DELUXE" | "PREMIUM" | "LUXURY";
  configCode?: string;
  adultsCount: number;
  childrenWithBedCount?: number;
  childrenNoBedCount?: number;
  infantsCount?: number;
  includeHouseboatUpgrade?: boolean;
  includeMealPlan?: boolean;
  includeAthirapillyTrip?: boolean;
  includeKanyakumariTrip?: boolean;
}

export interface PricingCalculationResult {
  pricingStatus: "EXACT_MATCH" | "CUSTOM_QUOTATION_REQUIRED";
  unitPricePerAdult: number | null;
  totalEstimate: number | null;
  baseAmount: number | null;
  extraAdultsAmount: number;
  childrenWithBedAmount: number;
  childrenNoBedAmount: number;
  mealPlanAmount: number;
  houseboatUpgradeAmount: number;
  dayTripsAmount: number;
  currency: "INR";
  rateBasis: string;
  matchedVehicleType: string | null;
  roomCount: number;
  ruleVersion: string;
  duration: KeralaDuration;
  notes: string[];
}

export function calculateKeralaPrice(input: PricingCalculationInput): PricingCalculationResult {
  const duration: KeralaDuration = (input.duration === "5N6D" || input.duration === "5 Nights / 6 Days") ? "5N6D" : "6N7D";
  
  const {
    hotelTier,
    configCode,
    adultsCount,
    childrenWithBedCount = 0,
    childrenNoBedCount = 0,
    includeHouseboatUpgrade = false,
    includeMealPlan = false,
    includeAthirapillyTrip = false,
    includeKanyakumariTrip = false,
  } = input;

  const rateMatrix = duration === "5N6D" ? KERALA_5N6D_RACK_RATE_MATRIX : KERALA_6N7D_RACK_RATE_MATRIX;
  const supplements = duration === "5N6D" ? SUPPLEMENTS_5N6D : SUPPLEMENTS_6N7D;

  // Find exact vehicle config
  let activeConfig = VEHICLE_PAX_OPTIONS.find((c) => c.code === configCode);

  if (!activeConfig) {
    if (adultsCount === 2) activeConfig = VEHICLE_PAX_OPTIONS[0]; // 2PAX_SEDAN
    else if (adultsCount === 4) activeConfig = VEHICLE_PAX_OPTIONS[1]; // 4PAX_INNOVA
    else if (adultsCount === 6) activeConfig = VEHICLE_PAX_OPTIONS[2]; // 6PAX_INNOVA default
    else if (adultsCount === 8) activeConfig = VEHICLE_PAX_OPTIONS[4]; // 8PAX_TRAVELLER
    else if (adultsCount === 10) activeConfig = VEHICLE_PAX_OPTIONS[5]; // 10PAX_TRAVELLER
  }

  // If unsupported passenger configuration or group size (e.g. 3, 5, 7, 9 or >10 adults)
  if (!activeConfig || activeConfig.paxCount !== adultsCount || !rateMatrix[activeConfig.code]) {
    return {
      pricingStatus: "CUSTOM_QUOTATION_REQUIRED",
      unitPricePerAdult: null,
      totalEstimate: null,
      baseAmount: null,
      extraAdultsAmount: 0,
      childrenWithBedAmount: 0,
      childrenNoBedAmount: 0,
      mealPlanAmount: 0,
      houseboatUpgradeAmount: 0,
      dayTripsAmount: 0,
      currency: "INR",
      rateBasis: `Tailor-made quotation required for ${duration === '5N6D' ? '5N/6D' : '6N/7D'} non-standard group size`,
      matchedVehicleType: null,
      roomCount: Math.ceil(adultsCount / 2),
      ruleVersion: "V6-Winter-2026-2027",
      duration,
      notes: [
        `Passenger count (${adultsCount} Adults) requires custom vehicle & room arrangement.`,
        "Our Anand travel specialists will prepare a customized quotation within 30 minutes.",
      ],
    };
  }

  // Exact Match Found!
  const unitPrice = rateMatrix[activeConfig.code][hotelTier];
  const baseAmount = unitPrice * adultsCount;

  // Calculate optional line items
  const childrenWithBedAmount = childrenWithBedCount * supplements.CHILD_WITH_BED[hotelTier];
  const childrenNoBedAmount = childrenNoBedCount * supplements.CHILD_NO_BED[hotelTier];
  
  const totalPayingGuests = adultsCount + childrenWithBedCount;
  const mealPlanAmount = includeMealPlan ? totalPayingGuests * supplements.MEAL_PLAN[hotelTier] : 0;
  
  const houseboatUpgradeAmount = includeHouseboatUpgrade
    ? adultsCount * supplements.HOUSEBOAT_UPGRADE_1BR[hotelTier]
    : 0;

  // Day trips per vehicle
  let dayTripsAmount = 0;
  const vehicleCategory = activeConfig.vehicleType.includes("Sedan")
    ? "SEDAN"
    : activeConfig.vehicleType.includes("Innova")
    ? "INNOVA"
    : "TRAVELLER";

  if (includeAthirapillyTrip) {
    dayTripsAmount += supplements.DAY_TRIP_ATHIRAPILLY[vehicleCategory];
  }
  // Kanyakumari is only applicable on 6N/7D (from Kovalam)
  if (duration === "6N7D" && includeKanyakumariTrip) {
    dayTripsAmount += supplements.DAY_TRIP_KANYAKUMARI[vehicleCategory];
  }

  const totalEstimate =
    baseAmount +
    childrenWithBedAmount +
    childrenNoBedAmount +
    mealPlanAmount +
    houseboatUpgradeAmount +
    dayTripsAmount;

  return {
    pricingStatus: "EXACT_MATCH",
    unitPricePerAdult: unitPrice,
    totalEstimate,
    baseAmount,
    extraAdultsAmount: 0,
    childrenWithBedAmount,
    childrenNoBedAmount,
    mealPlanAmount,
    houseboatUpgradeAmount,
    dayTripsAmount,
    currency: "INR",
    rateBasis: `Per Person Twin Sharing CPAI (${activeConfig.vehicleType}) - All Taxes Included`,
    matchedVehicleType: activeConfig.vehicleType,
    roomCount: activeConfig.roomsCount,
    ruleVersion: "V6-Winter-2026-2027",
    duration,
    notes: [
      "Rates valid 1st October 2026 to 31st March 2027.",
      "Peak season surcharge applies 20th Dec 2026 to 10th Jan 2027.",
      "All transfers, tolls, parking, driver bata and statutory taxes included.",
    ],
  };
}
