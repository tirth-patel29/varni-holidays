export interface FlightMealOption {
  code: string;
  label: string;
  description: string;
  category: "No Preference" | "Vegetarian / Plant-based" | "Religious / Cultural" | "Medical / Dietary";
}

export const FLIGHT_MEAL_OPTIONS: FlightMealOption[] = [
  // No Preference
  {
    code: "NO_PREFERENCE",
    label: "No special meal preference",
    description: "Standard in-flight meal service served by airline",
    category: "No Preference",
  },

  // Vegetarian / Plant-based
  {
    code: "VJML",
    label: "VJML — Jain Meal",
    description: "Strict vegetarian meal prepared without onions, garlic, potatoes, or root vegetables",
    category: "Vegetarian / Plant-based",
  },
  {
    code: "VGML",
    label: "VGML — Vegan Meal",
    description: "Strictly plant-based meal free from all animal products, meat, dairy, eggs, and honey",
    category: "Vegetarian / Plant-based",
  },
  {
    code: "VLML",
    label: "VLML — Lacto-Ovo Vegetarian Meal",
    description: "Vegetarian meal containing dairy and egg products; free of meat and seafood",
    category: "Vegetarian / Plant-based",
  },
  {
    code: "AVML",
    label: "AVML — Asian Vegetarian Meal",
    description: "Spiced Indian-style vegetarian meal prepared with traditional aromatic spices and dairy",
    category: "Vegetarian / Plant-based",
  },

  // Religious / Cultural
  {
    code: "MOML",
    label: "MOML — Muslim / Halal Meal",
    description: "Certified Halal meal prepared in accordance with Islamic dietary law; zero pork or alcohol",
    category: "Religious / Cultural",
  },
  {
    code: "KSML",
    label: "KSML — Kosher Meal",
    description: "Certified Kosher meal prepared under strict rabbinical supervision",
    category: "Religious / Cultural",
  },
  {
    code: "HNML",
    label: "HNML — Hindu Meal",
    description: "Non-vegetarian meal prepared according to Hindu customs; strictly free of beef and pork",
    category: "Religious / Cultural",
  },

  // Medical / Dietary
  {
    code: "GFML",
    label: "GFML — Gluten-Free Meal",
    description: "Eliminates wheat, rye, barley, and oat gluten ingredients for gluten intolerance or celiac",
    category: "Medical / Dietary",
  },
  {
    code: "DBML",
    label: "DBML — Diabetic Meal",
    description: "High-fiber meal low in refined sugars and balanced complex carbohydrates",
    category: "Medical / Dietary",
  },
  {
    code: "NFML",
    label: "NFML — Nut-Free Meal",
    description: "Strictly prepared without peanuts, tree nuts, or trace nut oils",
    category: "Medical / Dietary",
  },
  {
    code: "NLML",
    label: "NLML — Non-Lactose Meal",
    description: "Free from milk, milk solids, dairy caseins, and lactose derivatives",
    category: "Medical / Dietary",
  },
];

export interface WheelchairOption {
  code: string;
  label: string;
  description: string;
}

export const WHEELCHAIR_OPTIONS: WheelchairOption[] = [
  {
    code: "NO_ASSISTANCE",
    label: "No Assistance",
    description: "Passenger moves independently without airport assistance",
  },
  {
    code: "WCHR",
    label: "WCHR — Wheelchair to Ramp",
    description: "Passenger can generally climb stairs and walk to their seat but needs wheelchair assistance for longer distances.",
  },
  {
    code: "WCHC",
    label: "WCHC — Wheelchair to Cabin Seat",
    description: "Passenger requires assistance all the way to the aircraft cabin seat and cannot walk independently to the seat.",
  },
];

export const FLIGHT_DISCLAIMERS = {
  meal: "Meal preferences are subject to airline availability and confirmation. Special dietary or allergy-related requirements cannot be guaranteed by the airline.",
  wheelchair: "Wheelchair assistance is subject to airline confirmation.",
};

export function getFlightMealDescription(code: string): string {
  const match = FLIGHT_MEAL_OPTIONS.find((m) => m.code === code);
  return match ? match.label : code;
}

export function getWheelchairDescription(code: string): string {
  const match = WHEELCHAIR_OPTIONS.find((w) => w.code === code);
  return match ? match.description : code;
}

