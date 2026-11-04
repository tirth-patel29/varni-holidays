export interface HotelTierOption {
  code: "STANDARD" | "DELUXE" | "SUPER_DELUXE" | "PREMIUM" | "LUXURY";
  name: string;
  tagline: string;
  badge?: string;
  hotels: {
    munnar: string;
    thekkady: string;
    alleppey: string;
    kovalam: string;
  };
}

export const HOTEL_TIERS: Record<string, HotelTierOption> = {
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
// Source: Travel-e (Kerala Winter Ready Packages) Rack Rate with 15% Margin V6.docx
export const KERALA_RACK_RATE_MATRIX: Record<
  string, // VehiclePaxOption code
  Record<string, number> // HotelTier code -> Per Person Price
> = {
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

// Confidential Supplier Net Costs (INR Per Person) for Admin Margin Tracking
// Source: Travel-e (Kerala Winter Ready Packages) V6.docx
export const KERALA_SUPPLIER_COST_MATRIX: Record<
  string,
  Record<string, number>
> = {
  "2PAX_SEDAN": {
    STANDARD: 23800,
    DELUXE: 25600,
    SUPER_DELUXE: 28200,
    PREMIUM: 30200,
    LUXURY: 35500,
  },
  "4PAX_INNOVA": {
    STANDARD: 21300,
    DELUXE: 23100,
    SUPER_DELUXE: 25700,
    PREMIUM: 27700,
    LUXURY: 33000,
  },
  "6PAX_INNOVA": {
    STANDARD: 18100,
    DELUXE: 19800,
    SUPER_DELUXE: 22500,
    PREMIUM: 24400,
    LUXURY: 29700,
  },
  "6PAX_TRAVELLER": {
    STANDARD: 18600,
    DELUXE: 20400,
    SUPER_DELUXE: 23000,
    PREMIUM: 25000,
    LUXURY: 30300,
  },
  "8PAX_TRAVELLER": {
    STANDARD: 16900,
    DELUXE: 18600,
    SUPER_DELUXE: 21200,
    PREMIUM: 23200,
    LUXURY: 28500,
  },
  "10PAX_TRAVELLER": {
    STANDARD: 15800,
    DELUXE: 17500,
    SUPER_DELUXE: 20200,
    PREMIUM: 22200,
    LUXURY: 27500,
  },
};

// Supplements Per Person (6 Nights)
export const SUPPLEMENTS = {
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
  HONEYMOON: {
    CANDLELIGHT_DINNER: {
      STANDARD: 1000,
      DELUXE: 1000,
      SUPER_DELUXE: 1500,
      PREMIUM: 2500,
      LUXURY: 3500,
    },
    FLOWER_BED: {
      STANDARD: 1000,
      DELUXE: 1000,
      SUPER_DELUXE: 1500,
      PREMIUM: 2500,
      LUXURY: 3500,
    },
    CAKE: 600,
  },
};

export interface PricingCalculationInput {
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
  notes: string[];
}

export function calculateKeralaPrice(input: PricingCalculationInput): PricingCalculationResult {
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

  // Find exact vehicle config
  let activeConfig = VEHICLE_PAX_OPTIONS.find((c) => c.code === configCode);

  if (!activeConfig) {
    // If not supplied, attempt exact match on adultsCount
    if (adultsCount === 2) activeConfig = VEHICLE_PAX_OPTIONS[0]; // 2PAX_SEDAN
    else if (adultsCount === 4) activeConfig = VEHICLE_PAX_OPTIONS[1]; // 4PAX_INNOVA
    else if (adultsCount === 6) activeConfig = VEHICLE_PAX_OPTIONS[2]; // 6PAX_INNOVA default
    else if (adultsCount === 8) activeConfig = VEHICLE_PAX_OPTIONS[4]; // 8PAX_TRAVELLER
    else if (adultsCount === 10) activeConfig = VEHICLE_PAX_OPTIONS[5]; // 10PAX_TRAVELLER
  }

  // If still no supported configuration (e.g., 3, 5, 7, 9, or >10 adults), require custom quotation
  if (!activeConfig || activeConfig.paxCount !== adultsCount) {
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
      rateBasis: "Tailor-made quotation required for non-standard group size",
      matchedVehicleType: null,
      roomCount: Math.ceil(adultsCount / 2),
      ruleVersion: "V6-Winter-2026-2027",
      notes: [
        `Passenger count (${adultsCount} Adults) requires custom vehicle & room arrangement.`,
        "Our Anand travel specialists will prepare a customized quotation within 30 minutes.",
      ],
    };
  }

  // Exact Match Found!
  const unitPrice = KERALA_RACK_RATE_MATRIX[activeConfig.code][hotelTier];
  const baseAmount = unitPrice * adultsCount;

  // Calculate optional line items
  const childrenWithBedAmount = childrenWithBedCount * SUPPLEMENTS.CHILD_WITH_BED[hotelTier];
  const childrenNoBedAmount = childrenNoBedCount * SUPPLEMENTS.CHILD_NO_BED[hotelTier];
  
  const totalPayingGuests = adultsCount + childrenWithBedCount;
  const mealPlanAmount = includeMealPlan ? totalPayingGuests * SUPPLEMENTS.MEAL_PLAN[hotelTier] : 0;
  
  const houseboatUpgradeAmount = includeHouseboatUpgrade
    ? adultsCount * SUPPLEMENTS.HOUSEBOAT_UPGRADE_1BR[hotelTier]
    : 0;

  // Day trips per vehicle
  let dayTripsAmount = 0;
  const vehicleCategory = activeConfig.vehicleType.includes("Sedan")
    ? "SEDAN"
    : activeConfig.vehicleType.includes("Innova")
    ? "INNOVA"
    : "TRAVELLER";

  if (includeAthirapillyTrip) {
    dayTripsAmount += SUPPLEMENTS.DAY_TRIP_ATHIRAPILLY[vehicleCategory];
  }
  if (includeKanyakumariTrip) {
    dayTripsAmount += SUPPLEMENTS.DAY_TRIP_KANYAKUMARI[vehicleCategory];
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
    notes: [
      "Rates valid 1st October 2026 to 31st March 2027.",
      "Peak season surcharge applies 20th Dec 2026 to 10th Jan 2027.",
      "All transfers, tolls, parking, driver bata and statutory taxes included.",
    ],
  };
}

