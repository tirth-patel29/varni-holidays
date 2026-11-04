"use server";

import { prisma } from "@/lib/prisma";
import { crmRepo } from "@/lib/crm/store";
import { validatePhoneNumber } from "@/lib/validation/phone";
import {
  FlightEnquirySchema,
  PackageEnquirySchema,
  VisaEnquirySchema,
} from "@/lib/validation/schemas";
import { calculateKeralaPrice } from "@/lib/pricing/kerala";
import { sendEnquiryConfirmationEmail } from "@/lib/integrations/email-service";

function generateReference(prefix: "FLT" | "PKG" | "VIS"): string {
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
        description: `Customer submitted website flight request: ${data.originAirport} → ${data.destinationAirport} (${data.tripType}) for ${data.adultsCount} Adults, ${data.childrenCount} Children.`,
      });
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

    // Server-side authoritative price calculation
    const pricingResult = calculateKeralaPrice({
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
          packageName: 'Kerala 6N/7D Winter CPAI',
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
        description: `Customer submitted website package request: ${data.hotelTier} tier, ${data.adultsCount} Adults, Quoted: ${pricingResult.totalEstimate ? `₹${pricingResult.totalEstimate.toLocaleString('en-IN')}` : 'Custom Quotation Required'}.`,
      });
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
            packageName: 'Kerala 6N/7D Winter CPAI',
            hotelTier: data.hotelTier,
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
              destinationCountry: data.destinationCountry,
              visaCategory: data.visaCategory,
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
              details: `Destination: ${data.destinationCountry} (${data.visaCategory} Visa) for ${data.applicantCount} applicants.`,
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
          destinationCountry: data.destinationCountry,
          visaCategory: data.visaCategory,
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
        description: `Customer submitted website visa request for ${data.destinationCountry} (${data.visaCategory} Visa) for ${data.applicantCount} applicants.`,
      });
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
            destinationCountry: data.destinationCountry,
            visaCategory: data.visaCategory,
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
