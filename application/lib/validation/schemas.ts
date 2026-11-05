import { z } from "zod";

export const FlightEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z
    .string({ required_error: "Please enter your email address." })
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .trim(),
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
  mealPreferenceCode: z.string().optional().default("NO_PREFERENCE"),
  mealPreferenceDescription: z.string().optional().default("No special meal preference"),
  wheelchairAssistanceCode: z.string().optional().default("NO_ASSISTANCE"),
  wheelchairAssistanceDescription: z.string().optional().default("No Assistance"),
  specialRequirements: z.string().max(500).optional(),
});

export const PackageEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z
    .string({ required_error: "Please enter your email address." })
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .trim(),
  phoneCountryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  packageSlug: z.string().default("kerala-6n7d-winter"),
  duration: z.string().default("6N/7D"),
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
  email: z
    .string({ required_error: "Please enter your email address." })
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .trim(),
  phoneCountryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  otherCountryName: z.string().optional().or(z.literal("")),
  visaCategory: z.enum(["TOURIST", "BUSINESS", "TRANSIT"]).default("TOURIST"),
  visaType: z.string().optional().or(z.literal("")),
  travelPurpose: z.string().max(300).optional(),
  applicantNationality: z.string().min(2).default("Indian"),
  residenceCountry: z.string().min(2).default("India"),
  plannedTravelDate: z.string().optional().or(z.literal("")),
  stayDurationDays: z.number().int().min(1).max(365).optional().nullable(),
  applicantCount: z.number().int().min(1).max(20).default(1),
  specialCircumstances: z.string().max(500).optional(),
}).refine((data) => {
  if (data.destinationCountry === "Other") {
    return !!data.otherCountryName && data.otherCountryName.trim().length >= 2;
  }
  return true;
}, {
  message: "Please enter the destination country name",
  path: ["otherCountryName"],
});

export const TravelInsuranceEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z
    .string({ required_error: "Please enter your email address." })
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .trim(),
  phoneCountryCode: z.string().min(1, "Country code is required").default("+91"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  travelDate: z.string().min(1, "Travel date is required"),
  destinationCountry: z.string().min(2, "Destination country is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  hasPreExistingDisease: z.boolean().default(false),
  preExistingDiseaseDetails: z.string().max(2000).optional().or(z.literal("")),
  consentGiven: z.boolean().default(false),
}).refine((data) => {
  if (data.hasPreExistingDisease) {
    return !!data.preExistingDiseaseDetails && data.preExistingDiseaseDetails.trim().length > 0;
  }
  return true;
}, {
  message: "Please specify your pre-existing disease or medical condition details",
  path: ["preExistingDiseaseDetails"],
}).refine((data) => {
  if (data.hasPreExistingDisease) {
    return data.consentGiven === true;
  }
  return true;
}, {
  message: "Explicit consent is required to process sensitive medical information",
  path: ["consentGiven"],
});

export type TravelInsuranceEnquiryData = z.infer<typeof TravelInsuranceEnquirySchema>;

export const CustomHolidayEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z
    .string({ required_error: "Please enter your email address." })
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .trim(),
  phoneCountryCode: z.string().min(1, "Country code is required").default("+91"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().min(1, "Return date is required"),
  destinations: z.string().min(2, "Please specify your destination(s)"),
  adultsCount: z.number().int().min(1, "At least 1 adult required").max(50).default(2),
  childrenCount: z.number().int().min(0).max(20).default(0),
  infantsCount: z.number().int().min(0).max(10).default(0),
  mealPlan: z.enum(["CPAI", "MAP", "APAI", "EP"]).default("CPAI"),
  hotelCategory: z.enum(["THREE_STAR", "FOUR_STAR", "FIVE_STAR", "FLEXIBLE"]).default("FOUR_STAR"),
  transferPreference: z.enum(["SHARING", "PRIVATE", "RECOMMEND"]).default("PRIVATE"),
  specialRequirements: z.string().max(1000).optional().or(z.literal("")),
  needVisa: z.boolean().default(false),
  needFlights: z.boolean().default(false),
  needInsurance: z.boolean().default(false),
}).refine((data) => {
  if (data.departureDate && data.returnDate) {
    return new Date(data.returnDate) >= new Date(data.departureDate);
  }
  return true;
}, {
  message: "Return date must be on or after departure date",
  path: ["returnDate"],
});

export type CustomHolidayEnquiryData = z.infer<typeof CustomHolidayEnquirySchema>;

export const ContactFormSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name").max(100),
  email: z
    .string({ required_error: "Please enter your email address." })
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .trim(),
  phoneCountryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  subject: z.string().min(2, "Subject is required").max(150),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
});

export const NewsletterSubscriptionSchema = z.object({
  email: z
    .string({ required_error: "Please enter your email address." })
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .trim()
    .toLowerCase(),
});
