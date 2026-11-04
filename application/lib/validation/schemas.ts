import { z } from "zod";

export const FlightEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phoneCountryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"]),
  originAirport: z.string().min(2, "Origin airport/city is required"),
  destinationAirport: z.string().min(2, "Destination airport/city is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().optional().or(z.literal("")),
  adultsCount: z.number().int().min(1, "At least 1 adult passenger required").max(9),
  childrenCount: z.number().int().min(0).max(9).default(0),
  infantsCount: z.number().int().min(0).max(4).default(0),
  cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).default("ECONOMY"),
  specialRequirements: z.string().max(500).optional(),
});

export const PackageEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phoneCountryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  packageSlug: z.string().default("kerala-6n7d-winter"),
  hotelTier: z.enum(["STANDARD", "DELUXE", "SUPER_DELUXE", "PREMIUM", "LUXURY"]).default("DELUXE"),
  configCode: z.string().optional(),
  adultsCount: z.number().int().min(1).max(20).default(2),
  childrenWithBedCount: z.number().int().min(0).max(10).default(0),
  childrenNoBedCount: z.number().int().min(0).max(10).default(0),
  infantsCount: z.number().int().min(0).max(5).default(0),
  roomsCount: z.number().int().min(1).max(10).default(1),
  preferredTravelDate: z.string().optional().or(z.literal("")),
  includeHouseboatUpgrade: z.boolean().default(false),
  includeMealPlan: z.boolean().default(false),
  includeAthirapillyTrip: z.boolean().default(false),
  includeKanyakumariTrip: z.boolean().default(false),
  specialRequests: z.string().max(500).optional(),
});

export const VisaEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phoneCountryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  destinationCountry: z.string().min(2, "Destination country is required"),
  visaCategory: z.enum(["TOURIST", "BUSINESS", "STUDENT", "WORK", "TRANSIT", "OTHER"]).default("TOURIST"),
  travelPurpose: z.string().max(300).optional(),
  applicantNationality: z.string().min(2).default("Indian"),
  residenceCountry: z.string().min(2).default("India"),
  plannedTravelDate: z.string().optional().or(z.literal("")),
  stayDurationDays: z.number().int().min(1).max(365).optional().nullable(),
  applicantCount: z.number().int().min(1).max(20).default(1),
  specialCircumstances: z.string().max(500).optional(),
});

