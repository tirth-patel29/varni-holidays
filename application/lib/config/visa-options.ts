/**
 * Official Visa Configuration for Varni Holidays
 * Strict implementation of Batch 3 requirements
 */

export interface VisaSubtypeOption {
  code: string;
  label: string;
  defaultCategory: "TOURIST" | "BUSINESS" | "TRANSIT";
  description?: string;
}

export interface VisaCountryConfig {
  country: string;
  hasPredefinedSubtypes: boolean;
  subtypes: VisaSubtypeOption[];
}

export const VISA_CATEGORIES = [
  { code: "TOURIST", label: "Tourist / Visitor" },
  { code: "BUSINESS", label: "Business / Conference" },
  { code: "TRANSIT", label: "Transit Visa" },
] as const;

export type VisaCategoryCode = (typeof VISA_CATEGORIES)[number]["code"];

export const VISA_COUNTRIES: VisaCountryConfig[] = [
  {
    country: "Canada",
    hasPredefinedSubtypes: true,
    subtypes: [
      {
        code: "SUPER_VISA",
        label: "Super Visa",
        defaultCategory: "TOURIST",
        description: "Multi-entry visitor visa for parents & grandparents of Canadian citizens/PRs",
      },
      {
        code: "TOURIST_STANDARD",
        label: "Standard Visitor Visa (V-1)",
        defaultCategory: "TOURIST",
        description: "Temporary Resident Visa (TRV) for tourism, family visits, or short stays",
      },
    ],
  },
  {
    country: "United States (USA)",
    hasPredefinedSubtypes: true,
    subtypes: [
      {
        code: "B1_B2_VISITOR",
        label: "B1/B2 Visitor",
        defaultCategory: "TOURIST",
        description: "Combined business and tourist visitor visa for the United States",
      },
    ],
  },
  {
    country: "United Arab Emirates (Dubai)",
    hasPredefinedSubtypes: true,
    subtypes: [
      {
        code: "VISIT_1_MONTH",
        label: "Visit Visa 1 Month",
        defaultCategory: "TOURIST",
        description: "30-day tourist/visit visa for Dubai and UAE emirates",
      },
      {
        code: "VISIT_2_MONTHS",
        label: "Visit Visa 2 Months",
        defaultCategory: "TOURIST",
        description: "60-day tourist/visit visa for extended tourism or family stays",
      },
      {
        code: "TRANSIT_VISA",
        label: "Transit Visa",
        defaultCategory: "TRANSIT",
        description: "48-hour or 96-hour airport transit visa for connecting international flights",
      },
    ],
  },
  {
    country: "Singapore",
    hasPredefinedSubtypes: true,
    subtypes: [
      {
        code: "SG_30_DAYS_ME",
        label: "30-Day Multiple Entry",
        defaultCategory: "TOURIST",
        description: "Multiple-journey tourist e-visa with up to 30 days per stay",
      },
    ],
  },
  {
    country: "Australia",
    hasPredefinedSubtypes: true,
    subtypes: [
      {
        code: "AU_TOURIST_ME",
        label: "Tourist Multiple Entry",
        defaultCategory: "TOURIST",
        description: "Subclass 600 Visitor Visa for leisure, holidays, and visiting family/friends",
      },
    ],
  },
  {
    country: "Japan",
    hasPredefinedSubtypes: true,
    subtypes: [
      {
        code: "JP_TOURIST_SE",
        label: "Tourist Single Entry",
        defaultCategory: "TOURIST",
        description: "Short-term tourist visa for sightseeing and cultural travel (up to 15 or 30 days)",
      },
    ],
  },
  {
    country: "United Kingdom (UK)",
    hasPredefinedSubtypes: false,
    subtypes: [
      {
        code: "UK_STANDARD_VISITOR",
        label: "Standard Visitor Visa (6 Months / 2 Years)",
        defaultCategory: "TOURIST",
        description: "For tourism, family visits, or short business meetings",
      },
    ],
  },
  {
    country: "Schengen (Europe)",
    hasPredefinedSubtypes: false,
    subtypes: [
      {
        code: "SCHENGEN_UNIFORM",
        label: "Uniform Short-Stay Visa (Type C)",
        defaultCategory: "TOURIST",
        description: "Valid for travel across all 29 European Schengen member states",
      },
    ],
  },
  {
    country: "Other",
    hasPredefinedSubtypes: false,
    subtypes: [],
  },
];

export const VISA_DISCLAIMER =
  "Visa requirements, processing times and issuance are subject to the relevant embassy or immigration authority. Submission of an enquiry does not guarantee visa approval.";

