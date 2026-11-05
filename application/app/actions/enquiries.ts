"use server";

import { prisma } from "@/lib/prisma";
import { crmRepo } from "@/lib/crm/store";
import { validatePhoneNumber } from "@/lib/validation/phone";
import {
  FlightEnquirySchema,
  PackageEnquirySchema,
  VisaEnquirySchema,
  CustomHolidayEnquirySchema,
  TravelInsuranceEnquirySchema,
} from "@/lib/validation/schemas";
import { calculateKeralaPrice } from "@/lib/pricing/kerala";
import { sendEnquiryConfirmationEmail } from "@/lib/integrations/email-service";
import { processSyncQueueAction } from "@/app/actions/google-sheets";

function generateReference(prefix: "FLT" | "PKG" | "VIS" | "HOL" | "INS"): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

export interface EnquirySubmissionResult {
  success: boolean;
  referenceId?: string;
  error?: string;
  message?: string;
}

// ----------------------------------------------------
// 1. FLIGHT ENQUIRY SUBMISSION
// ----------------------------------------------------
export async function submitFlightEnquiry(formData: unknown): Promise<EnquirySubmissionResult> {
  try {
    const parsed = FlightEnquirySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const data = parsed.data;
    const phoneValidation = validatePhoneNumber(data.phoneCountryCode, data.phoneNumber);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      return { success: false, error: phoneValidation.error || "Invalid phone number." };
    }

    const referenceId = generateReference("FLT");

    let dbCustomer: any = null;
    let dbCreatedLead: any = null;

    // Optional Prisma sync
    try {
      dbCustomer = await prisma.customer.findFirst({
        where: { normalizedPhone: phoneValidation.normalized },
      });

      if (!dbCustomer) {
        dbCustomer = await prisma.customer.create({
          data: {
            fullName: data.fullName,
            email: data.email || null,
            phoneCountryCode: data.phoneCountryCode,
            phoneNumber: data.phoneNumber,
            normalizedPhone: phoneValidation.normalized,
            normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
          },
        });
      }

      dbCreatedLead = await prisma.lead.create({
        data: {
          referenceId,
          serviceType: "FLIGHT",
          stage: "REQUESTS",
          priorityLevel: "MEDIUM",
          source: "WEBSITE_FLIGHT_FORM",
          customerId: dbCustomer.id,
          flightDetail: {
            create: {
              tripType: data.tripType,
              adultsCount: data.adultsCount,
              childrenCount: data.childrenCount,
              infantsCount: data.infantsCount,
              cabinClass: data.cabinClass,
              mealPreferenceCode: data.mealPreferenceCode || "NO_PREFERENCE",
              mealPreferenceDescription: data.mealPreferenceDescription || "No special meal preference",
              wheelchairAssistanceCode: data.wheelchairAssistanceCode || "NO_ASSISTANCE",
              wheelchairAssistanceDescription: data.wheelchairAssistanceDescription || "No Assistance",
              specialRequirements: data.specialRequirements || null,
              segments: {
                create: [
                  {
                    segmentOrder: 1,
                    originAirport: data.originAirport,
                    destinationAirport: data.destinationAirport,
                    departureDate: new Date(data.departureDate),
                  },
                  ...(data.tripType === "ROUND_TRIP" && data.returnDate
                    ? [
                        {
                          segmentOrder: 2,
                          originAirport: data.destinationAirport,
                          destinationAirport: data.originAirport,
                          departureDate: new Date(data.returnDate),
                        },
                      ]
                    : []),
                ],
              },
            },
          },
          activities: {
            create: {
              userId: 'usr-neel-patel-superadmin',
              activityType: "INTERNAL_NOTE",
              summary: "Flight Enquiry received via website",
              details: `Route: ${data.originAirport} → ${data.destinationAirport} (${data.tripType}). Passengers: ${data.adultsCount} Adults, ${data.childrenCount} Children, ${data.infantsCount} Infants.`,
            },
          },
        },
      });
    } catch (dbError) {
      console.warn("Prisma storage skipped (offline dev fallback):", dbError);
    }

    // Direct CRM Store Synchronization
    try {
      let cust = crmRepo.findCustomerByPhoneOrEmail(phoneValidation.normalized, data.email);
      if (!cust) {
        cust = crmRepo.saveCustomer({
          id: dbCustomer?.id || `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          fullName: data.fullName,
          email: data.email || null,
          phoneCountryCode: data.phoneCountryCode,
          phoneNumber: data.phoneNumber,
          normalizedPhone: phoneValidation.normalized,
          normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
          duplicateWarning: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (data.fullName.trim().toLowerCase() !== cust.fullName.trim().toLowerCase()) {
        cust.duplicateWarning = true;
        cust.duplicateNotes = `Name discrepancy: previous "${cust.fullName}", new "${data.fullName}"`;
        crmRepo.saveCustomer(cust);
      }

      const newLead = crmRepo.saveLead({
        id: dbCreatedLead?.id || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        referenceId,
        serviceType: 'FLIGHT',
        stage: 'REQUESTS',
        priorityLevel: 'MEDIUM',
        source: 'WEBSITE_FLIGHT_FORM',
        customerId: cust.id,
        assignedUserId: 'usr-priya-sharma-flights',
        flightDetail: {
          tripType: data.tripType,
          originAirport: data.originAirport,
          destinationAirport: data.destinationAirport,
          departureDate: data.departureDate,
          returnDate: data.returnDate || null,
          adultsCount: data.adultsCount,
          childrenCount: data.childrenCount,
          infantsCount: data.infantsCount,
          cabinClass: data.cabinClass,
          mealPreferenceCode: data.mealPreferenceCode || "NO_PREFERENCE",
          mealPreferenceDescription: data.mealPreferenceDescription || "No special meal preference",
          wheelchairAssistanceCode: data.wheelchairAssistanceCode || "NO_ASSISTANCE",
          wheelchairAssistanceDescription: data.wheelchairAssistanceDescription || "No Assistance",
          specialRequirements: data.specialRequirements,
        },
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      crmRepo.addActivity({
        leadId: newLead.id,
        userId: 'usr-priya-sharma-flights',
        userName: 'System Dispatcher',
        type: 'NOTE',
        title: 'New Flight Enquiry Received',
        description: `Customer submitted website flight request: ${data.originAirport} → ${data.destinationAirport} (${data.tripType}) for ${data.adultsCount} Adults. Meal: ${data.mealPreferenceDescription || 'None'}. Wheelchair: ${data.wheelchairAssistanceDescription || 'None'}.`,
      });

      // Trigger instant background sync to Google Sheets
      processSyncQueueAction().catch((e) => console.warn('Flight Sheets sync err:', e));
    } catch (crmErr) {
      console.warn("CRM store sync failed:", crmErr);
    }

    // Automated instant customer acknowledgement email via Resend
    if (data.email) {
      try {
        await sendEnquiryConfirmationEmail({
          to: data.email,
          customerName: data.fullName,
          referenceId,
          serviceType: 'FLIGHT',
          details: {
            originAirport: data.originAirport,
            destinationAirport: data.destinationAirport,
            tripType: data.tripType,
            departureDate: data.departureDate,
            returnDate: data.returnDate,
            adultsCount: data.adultsCount,
            childrenCount: data.childrenCount,
            infantsCount: data.infantsCount,
            cabinClass: data.cabinClass,
            mealPreference: data.mealPreferenceDescription,
            wheelchairAssistance: data.wheelchairAssistanceDescription,
            specialRequirements: data.specialRequirements,
          },
        });
      } catch (emailErr) {
        console.warn('[Enquiry Confirmation Email Warning]:', emailErr);
      }
    }

    return {
      success: true,
      referenceId,
      message: "Flight enquiry submitted successfully! A Varni Holidays flight specialist will contact you shortly.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit flight enquiry." };
  }
}

// ----------------------------------------------------
// 2. TOUR PACKAGE ENQUIRY SUBMISSION
// ----------------------------------------------------
export async function submitPackageEnquiry(formData: unknown): Promise<EnquirySubmissionResult> {
  try {
    const parsed = PackageEnquirySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const data = parsed.data;
    const phoneValidation = validatePhoneNumber(data.phoneCountryCode, data.phoneNumber);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      return { success: false, error: phoneValidation.error || "Invalid phone number." };
    }

    const referenceId = generateReference("PKG");

    const duration = data.duration === '5N6D' ? '5N6D' : '6N7D';
    const durationLabel = duration === '5N6D' ? '5 Nights / 6 Days' : '6 Nights / 7 Days';
    const packageName = `Kerala ${durationLabel} Winter CPAI`;

    // Server-side authoritative price calculation
    const pricingResult = calculateKeralaPrice({
      duration,
      hotelTier: data.hotelTier,
      configCode: data.configCode,
      adultsCount: data.adultsCount,
      childrenWithBedCount: data.childrenWithBedCount,
      childrenNoBedCount: data.childrenNoBedCount,
      infantsCount: data.infantsCount,
      includeHouseboatUpgrade: data.includeHouseboatUpgrade,
      includeMealPlan: data.includeMealPlan,
      includeAthirapillyTrip: data.includeAthirapillyTrip,
      includeKanyakumariTrip: data.includeKanyakumariTrip,
    });

    let dbCustomer: any = null;
    let dbCreatedLead: any = null;

    try {
      dbCustomer = await prisma.customer.findFirst({
        where: { normalizedPhone: phoneValidation.normalized },
      });

      if (!dbCustomer) {
        dbCustomer = await prisma.customer.create({
          data: {
            fullName: data.fullName,
            email: data.email || null,
            phoneCountryCode: data.phoneCountryCode,
            phoneNumber: data.phoneNumber,
            normalizedPhone: phoneValidation.normalized,
            normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
          },
        });
      }

      let pkg = await prisma.package.findUnique({
        where: { slug: data.packageSlug },
      });

      if (!pkg) {
        pkg = await prisma.package.create({
          data: {
            slug: data.packageSlug,
            title: "Kerala 6N/7D Winter CPAI",
            destination: "Kerala, India",
            region: "South India",
            durationDays: 7,
            durationNights: 6,
            pickupLocation: "Cochin (COK)",
            dropLocation: "Trivandrum (TRV) / Cochin (COK)",
            overview: "Munnar, Thekkady, Alleppey, Kovalam Winter CPAI",
            heroImageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
            inclusions: [],
            exclusions: [],
            importantNotes: [],
          },
        });
      }

      dbCreatedLead = await prisma.lead.create({
        data: {
          referenceId,
          serviceType: "PACKAGE",
          stage: "REQUESTS",
          priorityLevel: "HIGH",
          source: "WEBSITE_PACKAGE_PAGE",
          customerId: dbCustomer.id,
          packageDetail: {
            create: {
              packageId: pkg.id,
              pricingStatus: pricingResult.pricingStatus,
              preferredTravelDate: data.preferredTravelDate ? new Date(data.preferredTravelDate) : null,
              adultsCount: data.adultsCount,
              childrenWithBedCount: data.childrenWithBedCount,
              childrenNoBedCount: data.childrenNoBedCount,
              infantsCount: data.infantsCount,
              roomsCount: pricingResult.roomCount,
              vehicleType: pricingResult.matchedVehicleType,
              quotedUnitPriceInr: pricingResult.unitPricePerAdult,
              quotedTotalPriceInr: pricingResult.totalEstimate,
              currency: "INR",
              rateBasis: pricingResult.rateBasis,
              priceSnapshotJson: JSON.parse(JSON.stringify(pricingResult)),
              specialRequests: data.specialRequests || null,
            },
          },
          activities: {
            create: {
              userId: 'usr-neel-patel-superadmin',
              activityType: "INTERNAL_NOTE",
              summary: "Package Enquiry submitted",
              details: `Package: ${pkg.title} (${data.hotelTier}). Estimate: ₹${pricingResult.totalEstimate ? pricingResult.totalEstimate.toLocaleString("en-IN") : "Custom Quote Required"}.`,
            },
          },
        },
      });
    } catch (dbError) {
      console.warn("Prisma storage skipped (offline dev fallback):", dbError);
    }

    // Direct CRM Store Synchronization
    try {
      let cust = crmRepo.findCustomerByPhoneOrEmail(phoneValidation.normalized, data.email);
      if (!cust) {
        cust = crmRepo.saveCustomer({
          id: dbCustomer?.id || `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          fullName: data.fullName,
          email: data.email || null,
          phoneCountryCode: data.phoneCountryCode,
          phoneNumber: data.phoneNumber,
          normalizedPhone: phoneValidation.normalized,
          normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
          duplicateWarning: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (data.fullName.trim().toLowerCase() !== cust.fullName.trim().toLowerCase()) {
        cust.duplicateWarning = true;
        cust.duplicateNotes = `Name discrepancy: previous "${cust.fullName}", new "${data.fullName}"`;
        crmRepo.saveCustomer(cust);
      }

      const newLead = crmRepo.saveLead({
        id: dbCreatedLead?.id || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        referenceId,
        serviceType: 'PACKAGE',
        stage: 'REQUESTS',
        priorityLevel: 'HIGH',
        source: 'WEBSITE_PACKAGE_PAGE',
        customerId: cust.id,
        assignedUserId: 'usr-harshil-desai-packages',
        packageDetail: {
          packageSlug: data.packageSlug,
          packageName,
          duration: durationLabel,
          hotelTier: data.hotelTier,
          configCode: data.configCode,
          adultsCount: data.adultsCount,
          childrenWithBedCount: data.childrenWithBedCount,
          childrenNoBedCount: data.childrenNoBedCount,
          roomsCount: pricingResult.roomCount,
          preferredTravelDate: data.preferredTravelDate || null,
          includeHouseboatUpgrade: data.includeHouseboatUpgrade,
          includeMealPlan: data.includeMealPlan,
          includeAthirapillyTrip: data.includeAthirapillyTrip,
          includeKanyakumariTrip: data.includeKanyakumariTrip,
          pricingStatus: pricingResult.pricingStatus,
          quotedUnitPriceInr: pricingResult.unitPricePerAdult,
          quotedTotalPriceInr: pricingResult.totalEstimate,
          vehicleAssigned: pricingResult.matchedVehicleType,
        },
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      crmRepo.addActivity({
        leadId: newLead.id,
        userId: 'usr-harshil-desai-packages',
        userName: 'System Dispatcher',
        type: 'NOTE',
        title: 'New Kerala Package Enquiry Received',
        description: `Customer submitted website package request for ${packageName}: ${data.hotelTier} tier, ${data.adultsCount} Adults, Quoted: ${pricingResult.totalEstimate ? `₹${pricingResult.totalEstimate.toLocaleString('en-IN')}` : 'Custom Quotation Required'}.`,
      });

      // Trigger instant background sync to Google Sheets
      processSyncQueueAction().catch((e) => console.warn('Package Sheets sync err:', e));
    } catch (crmErr) {
      console.warn("CRM store sync failed:", crmErr);
    }

    // Automated instant customer acknowledgement email via Resend
    if (data.email) {
      try {
        await sendEnquiryConfirmationEmail({
          to: data.email,
          customerName: data.fullName,
          referenceId,
          serviceType: 'PACKAGE',
          details: {
            packageName,
            hotelTier: data.hotelTier,
            duration: durationLabel,
            travelDates: data.preferredTravelDate || undefined,
            adultsCount: data.adultsCount,
            childrenCount: (data.childrenWithBedCount || 0) + (data.childrenNoBedCount || 0),
            infantsCount: data.infantsCount,
            roomsCount: pricingResult.roomCount,
            vehicleType: pricingResult.matchedVehicleType || undefined,
            totalEstimate: pricingResult.totalEstimate || undefined,
            specialRequirements: data.specialRequests,
          },
        });
      } catch (emailErr) {
        console.warn('[Enquiry Confirmation Email Warning]:', emailErr);
      }
    }

    return {
      success: true,
      referenceId,
      message:
        pricingResult.pricingStatus === "EXACT_MATCH"
          ? `Package enquiry submitted! Reference: ${referenceId}. Total Estimate: ₹${pricingResult.totalEstimate?.toLocaleString("en-IN")}. Our tour coordinator will connect with you on WhatsApp.`
          : `Custom proposal request submitted! Reference: ${referenceId}. Our Kerala tour specialists will prepare your tailor-made itinerary and quotation shortly.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit package enquiry." };
  }
}

// ----------------------------------------------------
// 3. VISA ASSISTANCE ENQUIRY SUBMISSION
// ----------------------------------------------------
export async function submitVisaEnquiry(formData: unknown): Promise<EnquirySubmissionResult> {
  try {
    const parsed = VisaEnquirySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const data = parsed.data;
    const phoneValidation = validatePhoneNumber(data.phoneCountryCode, data.phoneNumber);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      return { success: false, error: phoneValidation.error || "Invalid phone number." };
    }

    const referenceId = generateReference("VIS");

    const effectiveCountry =
      data.destinationCountry === "Other" && data.otherCountryName
        ? data.otherCountryName.trim()
        : data.destinationCountry;

    let dbCustomer: any = null;
    let dbCreatedLead: any = null;

    try {
      dbCustomer = await prisma.customer.findFirst({
        where: { normalizedPhone: phoneValidation.normalized },
      });

      if (!dbCustomer) {
        dbCustomer = await prisma.customer.create({
          data: {
            fullName: data.fullName,
            email: data.email || null,
            phoneCountryCode: data.phoneCountryCode,
            phoneNumber: data.phoneNumber,
            normalizedPhone: phoneValidation.normalized,
            normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
          },
        });
      }

      dbCreatedLead = await prisma.lead.create({
        data: {
          referenceId,
          serviceType: "VISA",
          stage: "REQUESTS",
          priorityLevel: "MEDIUM",
          source: "WEBSITE_VISA_PAGE",
          customerId: dbCustomer.id,
          visaDetail: {
            create: {
              destinationCountry: effectiveCountry,
              otherCountryName: data.destinationCountry === "Other" ? data.otherCountryName : null,
              visaCategory: data.visaCategory,
              visaType: data.visaType || null,
              travelPurpose: data.travelPurpose || null,
              applicantNationality: data.applicantNationality,
              residenceCountry: data.residenceCountry,
              plannedTravelDate: data.plannedTravelDate ? new Date(data.plannedTravelDate) : null,
              stayDurationDays: data.stayDurationDays || null,
              applicantCount: data.applicantCount,
              specialCircumstances: data.specialCircumstances || null,
            },
          },
          activities: {
            create: {
              userId: 'usr-neel-patel-superadmin',
              activityType: "INTERNAL_NOTE",
              summary: "Visa Assistance Request received",
              details: `Destination: ${effectiveCountry} (${data.visaCategory} Visa${data.visaType ? ` - ${data.visaType}` : ''}) for ${data.applicantCount} applicants.`,
            },
          },
        },
      });
    } catch (dbError) {
      console.warn("Prisma storage skipped (offline dev fallback):", dbError);
    }

    // Direct CRM Store Synchronization
    try {
      let cust = crmRepo.findCustomerByPhoneOrEmail(phoneValidation.normalized, data.email);
      if (!cust) {
        cust = crmRepo.saveCustomer({
          id: dbCustomer?.id || `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          fullName: data.fullName,
          email: data.email || null,
          phoneCountryCode: data.phoneCountryCode,
          phoneNumber: data.phoneNumber,
          normalizedPhone: phoneValidation.normalized,
          normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
          duplicateWarning: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (data.fullName.trim().toLowerCase() !== cust.fullName.trim().toLowerCase()) {
        cust.duplicateWarning = true;
        cust.duplicateNotes = `Name discrepancy: previous "${cust.fullName}", new "${data.fullName}"`;
        crmRepo.saveCustomer(cust);
      }

      const newLead = crmRepo.saveLead({
        id: dbCreatedLead?.id || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        referenceId,
        serviceType: 'VISA',
        stage: 'REQUESTS',
        priorityLevel: 'HIGH',
        source: 'WEBSITE_VISA_PORTAL',
        customerId: cust.id,
        assignedUserId: 'usr-ananya-joshi-visa',
        visaDetail: {
          destinationCountry: effectiveCountry,
          otherCountryName: data.destinationCountry === "Other" ? data.otherCountryName : undefined,
          visaCategory: data.visaCategory,
          visaType: data.visaType || undefined,
          travelPurpose: data.travelPurpose,
          applicantNationality: data.applicantNationality,
          residenceCountry: data.residenceCountry,
          plannedTravelDate: data.plannedTravelDate || null,
          stayDurationDays: data.stayDurationDays,
          applicantCount: data.applicantCount,
          specialCircumstances: data.specialCircumstances,
        },
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      crmRepo.addActivity({
        leadId: newLead.id,
        userId: 'usr-ananya-joshi-visa',
        userName: 'System Dispatcher',
        type: 'NOTE',
        title: 'New Visa Consultation Request Received',
        description: `Customer submitted website visa request for ${effectiveCountry} (${data.visaCategory} Visa${data.visaType ? ` - ${data.visaType}` : ''}) for ${data.applicantCount} applicants.`,
      });

      // Trigger instant background sync to Google Sheets
      processSyncQueueAction().catch((e) => console.warn('Visa Sheets sync err:', e));
    } catch (crmErr) {
      console.warn("CRM store sync failed:", crmErr);
    }

    // Automated instant customer acknowledgement email via Resend
    if (data.email) {
      try {
        await sendEnquiryConfirmationEmail({
          to: data.email,
          customerName: data.fullName,
          referenceId,
          serviceType: 'VISA',
          details: {
            destinationCountry: effectiveCountry,
            visaCategory: data.visaCategory,
            packageName: data.visaType || undefined,
            applicantCount: data.applicantCount,
            departureDate: data.plannedTravelDate || undefined,
            stayDurationDays: data.stayDurationDays,
            specialRequirements: data.specialCircumstances,
          },
        });
      } catch (emailErr) {
        console.warn('[Enquiry Confirmation Email Warning]:', emailErr);
      }
    }

    return {
      success: true,
      referenceId,
      message: `Visa assistance request received! Reference: ${referenceId}. Our visa documentation team will contact you to guide you through required documentation.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit visa enquiry." };
  }
}

// ----------------------------------------------------
// 4. CUSTOM HOLIDAY PLANNER ENQUIRY SUBMISSION
// ----------------------------------------------------
export async function submitCustomHolidayEnquiryAction(formData: unknown): Promise<EnquirySubmissionResult> {
  try {
    const parsed = CustomHolidayEnquirySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const data = parsed.data;
    const phoneValidation = validatePhoneNumber(data.phoneCountryCode, data.phoneNumber);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      return {
        success: false,
        error: phoneValidation.error || "Please provide a valid contact telephone number.",
      };
    }

    const referenceId = generateReference("HOL");

    // 1. Prisma Storage (Neon PostgreSQL)
    let dbCreatedLead: any = null;
    let dbCustomer: any = null;

    try {
      dbCustomer = await prisma.customer.findFirst({
        where: { normalizedPhone: phoneValidation.normalized },
      });

      if (!dbCustomer) {
        dbCustomer = await prisma.customer.create({
          data: {
            fullName: data.fullName,
            email: data.email || null,
            phoneCountryCode: data.phoneCountryCode,
            phoneNumber: data.phoneNumber,
            normalizedPhone: phoneValidation.normalized,
            normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
            city: "Gujarat, India",
          },
        });
      } else if (data.email && !dbCustomer.email) {
        dbCustomer = await prisma.customer.update({
          where: { id: dbCustomer.id },
          data: {
            email: data.email,
            normalizedEmail: data.email.toLowerCase().trim(),
          },
        });
      }

      dbCreatedLead = await prisma.lead.create({
        data: {
          referenceId,
          serviceType: "CUSTOM_HOLIDAY",
          stage: "REQUESTS",
          priorityLevel: "HIGH",
          source: "WEBSITE_CUSTOM_PLANNER",
          customerId: dbCustomer.id,
          assignedUserId: "usr-harshil-desai-packages",
          customHolidayDetail: {
            create: {
              departureDate: new Date(data.departureDate),
              returnDate: new Date(data.returnDate),
              destinations: data.destinations,
              adultsCount: data.adultsCount,
              childrenCount: data.childrenCount,
              infantsCount: data.infantsCount,
              mealPlan: data.mealPlan,
              hotelCategory: data.hotelCategory,
              transferPreference: data.transferPreference,
              specialRequirements: data.specialRequirements || null,
              visaAssistanceRequired: Boolean(data.needVisa),
              flightAssistanceRequired: Boolean(data.needFlights),
              travelInsuranceRequired: Boolean(data.needInsurance),
            },
          },
          activities: {
            create: {
              userId: "usr-harshil-desai-packages",
              activityType: "INTERNAL_NOTE",
              summary: "Custom Holiday Itinerary Request Received",
              details: `Destination: ${data.destinations}. Dates: ${data.departureDate} to ${data.returnDate}. Pax: ${data.adultsCount} Adults, ${data.childrenCount} Children, ${data.infantsCount} Infants. Plan: ${data.mealPlan}, ${data.hotelCategory}.`,
            },
          },
        },
      });
    } catch (dbError) {
      console.warn("Prisma storage skipped (offline dev fallback):", dbError);
    }

    // 2. Direct CRM Store Synchronization
    try {
      let cust = crmRepo.findCustomerByPhoneOrEmail(phoneValidation.normalized, data.email);
      if (!cust) {
        cust = crmRepo.saveCustomer({
          id: dbCustomer?.id || `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          fullName: data.fullName,
          email: data.email || null,
          phoneCountryCode: data.phoneCountryCode,
          phoneNumber: data.phoneNumber,
          normalizedPhone: phoneValidation.normalized,
          normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
          duplicateWarning: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const newLead = crmRepo.saveLead({
        id: dbCreatedLead?.id || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        referenceId,
        serviceType: 'CUSTOM_HOLIDAY',
        stage: 'REQUESTS',
        priorityLevel: 'HIGH',
        source: 'WEBSITE_CUSTOM_PLANNER',
        customerId: cust.id,
        assignedUserId: 'usr-harshil-desai-packages',
        customHolidayDetail: {
          departureDate: data.departureDate,
          returnDate: data.returnDate,
          destinations: data.destinations,
          adultsCount: data.adultsCount,
          childrenCount: data.childrenCount,
          infantsCount: data.infantsCount,
          mealPlan: data.mealPlan,
          hotelCategory: data.hotelCategory,
          transferType: data.transferPreference,
          specialRequirements: data.specialRequirements || null,
          needVisa: Boolean(data.needVisa),
          needFlights: Boolean(data.needFlights),
          needInsurance: Boolean(data.needInsurance),
        },
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      crmRepo.addActivity({
        leadId: newLead.id,
        userId: 'usr-harshil-desai-packages',
        userName: 'Harshil Desai',
        type: 'NOTE',
        title: 'Custom Journey Request Logged',
        description: `Customer submitted bespoke request for ${data.destinations}.`,
      });

      processSyncQueueAction().catch((syncErr) => {
        console.warn('Sync queue trigger failed non-fatally:', syncErr);
      });
    } catch (crmErr) {
      console.warn("CRM store sync failed:", crmErr);
    }

    // 3. Automated acknowledgement email via Resend
    if (data.email) {
      try {
        await sendEnquiryConfirmationEmail({
          to: data.email,
          customerName: data.fullName,
          referenceId,
          serviceType: 'CUSTOM_HOLIDAY',
          details: {
            packageName: `Custom Tour: ${data.destinations}`,
            hotelTier: data.hotelCategory.replace('_', ' '),
            travelDates: `${data.departureDate} to ${data.returnDate}`,
            adultsCount: data.adultsCount,
            childrenCount: data.childrenCount,
            infantsCount: data.infantsCount,
            specialRequirements: data.specialRequirements,
          },
        });
      } catch (emailErr) {
        console.warn('[Enquiry Confirmation Email Warning]:', emailErr);
      }
    }

    return {
      success: true,
      referenceId,
      message: `Your custom journey inquiry has been received! Reference: ${referenceId}. Our holiday curation specialist (Harshil Desai) will prepare an itemized itinerary and connect with you on WhatsApp.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit custom holiday enquiry." };
  }
}

// ----------------------------------------------------
// 5. TRAVEL INSURANCE ENQUIRY SUBMISSION (BATCH 3)
// ----------------------------------------------------
export async function submitTravelInsuranceEnquiryAction(formData: unknown): Promise<EnquirySubmissionResult> {
  try {
    const parsed = TravelInsuranceEnquirySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message || "Validation failed" };
    }

    const data = parsed.data;
    const phoneValidation = validatePhoneNumber(data.phoneCountryCode, data.phoneNumber);
    if (!phoneValidation.isValid || !phoneValidation.normalized) {
      return {
        success: false,
        error: phoneValidation.error || "Please provide a valid contact telephone number.",
      };
    }

    const referenceId = generateReference("INS");

    let dbCustomer: any = null;
    let dbCreatedLead: any = null;

    try {
      dbCustomer = await prisma.customer.findFirst({
        where: { normalizedPhone: phoneValidation.normalized },
      });

      if (!dbCustomer) {
        dbCustomer = await prisma.customer.create({
          data: {
            fullName: data.fullName,
            email: data.email || null,
            phoneCountryCode: data.phoneCountryCode,
            phoneNumber: data.phoneNumber,
            normalizedPhone: phoneValidation.normalized,
            normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
            city: "Gujarat, India",
          },
        });
      } else if (data.email && !dbCustomer.email) {
        dbCustomer = await prisma.customer.update({
          where: { id: dbCustomer.id },
          data: {
            email: data.email,
            normalizedEmail: data.email.toLowerCase().trim(),
          },
        });
      }

      dbCreatedLead = await prisma.lead.create({
        data: {
          referenceId,
          serviceType: "TRAVEL_INSURANCE",
          stage: "REQUESTS",
          priorityLevel: "MEDIUM",
          source: "WEBSITE_TRAVEL_INSURANCE",
          customerId: dbCustomer.id,
          assignedUserId: "usr-neel-patel-superadmin",
          insuranceDetail: {
            create: {
              travelDate: new Date(data.travelDate),
              destinationCountry: data.destinationCountry,
              dateOfBirth: new Date(data.dateOfBirth),
              hasPreExistingDisease: Boolean(data.hasPreExistingDisease),
              preExistingDiseaseDetails: data.hasPreExistingDisease && data.consentGiven ? data.preExistingDiseaseDetails : null,
              consentGiven: Boolean(data.consentGiven),
            },
          },
          activities: {
            create: {
              userId: "usr-neel-patel-superadmin",
              activityType: "INTERNAL_NOTE",
              summary: "Travel Insurance Consultation Request Received",
              // SENSITIVITY SAFEGUARD: Do not log raw medical condition details in generic activity logs
              details: `Destination: ${data.destinationCountry}. Departure: ${data.travelDate}. Medical Disclosure: ${
                data.hasPreExistingDisease ? "Pre-existing condition declared with consent (Details restricted to authorized insurance desk)" : "No pre-existing conditions reported"
              }.`,
            },
          },
        },
      });
    } catch (dbError) {
      console.warn("Prisma storage skipped (offline dev fallback):", dbError);
    }

    // Direct CRM Store Synchronization
    try {
      let cust = crmRepo.findCustomerByPhoneOrEmail(phoneValidation.normalized, data.email);
      if (!cust) {
        cust = crmRepo.saveCustomer({
          id: dbCustomer?.id || `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          fullName: data.fullName,
          email: data.email || null,
          phoneCountryCode: data.phoneCountryCode,
          phoneNumber: data.phoneNumber,
          normalizedPhone: phoneValidation.normalized,
          normalizedEmail: data.email ? data.email.toLowerCase().trim() : null,
          duplicateWarning: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const newLead = crmRepo.saveLead({
        id: dbCreatedLead?.id || `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        referenceId,
        serviceType: 'TRAVEL_INSURANCE',
        stage: 'REQUESTS',
        priorityLevel: 'HIGH',
        source: 'WEBSITE_TRAVEL_INSURANCE',
        customerId: cust.id,
        assignedUserId: 'usr-neel-patel-superadmin',
        insuranceDetail: {
          departureDate: data.travelDate,
          destinationCountry: data.destinationCountry,
          dateOfBirth: data.dateOfBirth,
          hasPreExistingDisease: Boolean(data.hasPreExistingDisease),
          preExistingDiseaseDetails: data.hasPreExistingDisease && data.consentGiven ? data.preExistingDiseaseDetails : null,
          consentGiven: Boolean(data.consentGiven),
        },
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      crmRepo.addActivity({
        leadId: newLead.id,
        userId: 'usr-neel-patel-superadmin',
        userName: 'Neel Patel',
        type: 'NOTE',
        title: 'Travel Insurance Enquiry Received',
        // SENSITIVITY SAFEGUARD: Clean log without raw medical disclosure
        description: `Customer submitted travel insurance request for ${data.destinationCountry} departing on ${data.travelDate}. PED declared: ${data.hasPreExistingDisease ? 'Yes (Restricted Access)' : 'No'}.`,
      });

      // Synchronize non-sensitive lead data to Google Sheets (Sheets sync NEVER sends PED details)
      processSyncQueueAction().catch((syncErr) => {
        console.warn('Sync queue trigger failed non-fatally:', syncErr);
      });
    } catch (crmErr) {
      console.warn("CRM store sync failed:", crmErr);
    }

    // Automated customer acknowledgement email via Resend
    // PRIVACY SAFEGUARD: Never include DOB, PED response, or PED details in confirmation emails!
    if (data.email) {
      try {
        await sendEnquiryConfirmationEmail({
          to: data.email,
          customerName: data.fullName,
          referenceId,
          serviceType: 'TRAVEL_INSURANCE',
          details: {
            destinationCountry: data.destinationCountry,
            travelDates: data.travelDate,
          },
        });
      } catch (emailErr) {
        console.warn('[Enquiry Confirmation Email Warning]:', emailErr);
      }
    }

    return {
      success: true,
      referenceId,
      message: `Your travel insurance consultation request has been received! Reference: ${referenceId}. Our insurance advisory desk will review suitable coverage options and contact you shortly.`,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit travel insurance enquiry." };
  }
}
