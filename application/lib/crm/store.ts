import fs from 'fs';
import path from 'path';
import {
  CustomerRecord,
  LeadRecord,
  LeadActivityRecord,
  FollowUpRecord,
  QuotationRecord,
  BookingRecord,
  AuditLogRecord,
  PackageCostItem,
  SyncJobRecord,
  GoogleSheetsConfig,
  SyncEventType,
  SyncTargetTab,
  BookingServiceComponent,
  PaymentRecord,
  CommunicationLogRecord,
} from './types';
import { DEFAULT_USERS } from '../auth/session';

interface CrmDatabaseState {
  customers: CustomerRecord[];
  leads: LeadRecord[];
  activities: LeadActivityRecord[];
  followUps: FollowUpRecord[];
  quotations: QuotationRecord[];
  bookings: BookingRecord[];
  auditLogs: AuditLogRecord[];
  packageCosts: PackageCostItem[];
  syncJobs: SyncJobRecord[];
  sheetsConfig: GoogleSheetsConfig;
  bookingServices: BookingServiceComponent[];
  payments: PaymentRecord[];
  communicationLogs: CommunicationLogRecord[];
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const STORE_DIR = isServerless ? '/tmp' : path.join(process.cwd(), 'data');
const STORE_PATH = path.join(STORE_DIR, 'crm_store.json');

// Initial seed data adhering strictly to the SRS and Phase 0/1 verified rules
function generateInitialState(): CrmDatabaseState {
  const customers: CustomerRecord[] = [
    {
      id: 'cust-101-chirag-patel',
      fullName: 'Chirag Patel',
      email: 'chirag.patel@charotar.in',
      phoneCountryCode: '+91',
      phoneNumber: '9825012345',
      normalizedPhone: '+919825012345',
      normalizedEmail: 'chirag.patel@charotar.in',
      city: 'Anand, Gujarat',
      duplicateWarning: false,
      isDeleted: false,
      createdAt: '2026-11-01T09:30:00.000Z',
      updatedAt: '2026-11-01T09:30:00.000Z',
    },
    {
      id: 'cust-102-megha-shah',
      fullName: 'Megha Shah',
      email: 'megha.shah@gmail.com',
      phoneCountryCode: '+91',
      phoneNumber: '9898023456',
      normalizedPhone: '+919898023456',
      normalizedEmail: 'megha.shah@gmail.com',
      city: 'Vallabh Vidyanagar, Anand',
      duplicateWarning: false,
      isDeleted: false,
      createdAt: '2026-11-02T11:15:00.000Z',
      updatedAt: '2026-11-02T11:15:00.000Z',
    },
    {
      id: 'cust-103-rakesh-amin',
      fullName: 'Rakesh Amin',
      email: 'rakesh.amin@gujaratind.com',
      phoneCountryCode: '+91',
      phoneNumber: '9879034567',
      normalizedPhone: '+919879034567',
      normalizedEmail: 'rakesh.amin@gujaratind.com',
      city: 'Nadiad, Gujarat',
      duplicateWarning: false,
      isDeleted: false,
      createdAt: '2026-11-02T14:45:00.000Z',
      updatedAt: '2026-11-02T14:45:00.000Z',
    },
    {
      id: 'cust-104-bhavik-joshi',
      fullName: 'Bhavik Joshi',
      email: 'bhavik.j@outlook.com',
      phoneCountryCode: '+91',
      phoneNumber: '9426045678',
      normalizedPhone: '+919426045678',
      normalizedEmail: 'bhavik.j@outlook.com',
      city: 'Anand, Gujarat',
      duplicateWarning: false,
      isDeleted: false,
      createdAt: '2026-11-03T10:00:00.000Z',
      updatedAt: '2026-11-03T10:00:00.000Z',
    },
    {
      id: 'cust-105-rakesh-kumar-amin', // Intended duplicate candidate for merge testing
      fullName: 'Rakesh K. Amin',
      email: 'rakesh.amin@gujaratind.com',
      phoneCountryCode: '+91',
      phoneNumber: '9879034567',
      normalizedPhone: '+919879034567',
      normalizedEmail: 'rakesh.amin@gujaratind.com',
      city: 'Nadiad, Gujarat',
      duplicateWarning: true,
      duplicateNotes: 'Matched normalized phone +919879034567 with Rakesh Amin (cust-103)',
      isDeleted: false,
      createdAt: '2026-11-04T08:20:00.000Z',
      updatedAt: '2026-11-04T08:20:00.000Z',
    },
  ];

  const leads: LeadRecord[] = [
    {
      id: 'lead-001',
      referenceId: 'PKG-20261104-1011',
      serviceType: 'PACKAGE',
      stage: 'REQUESTS',
      priorityLevel: 'HIGH',
      source: 'WEBSITE_CALCULATOR',
      customerId: 'cust-101-chirag-patel',
      assignedUserId: 'usr-harshil-desai-packages',
      packageDetail: {
        packageSlug: 'kerala-6n7d-winter',
        packageName: 'Kerala 6N/7D Winter CPAI (Munnar-Thekkady-Alleppey-Kovalam)',
        hotelTier: 'STANDARD',
        configCode: '6PAX_INNOVA',
        adultsCount: 6,
        childrenWithBedCount: 1,
        childrenNoBedCount: 0,
        roomsCount: 3,
        preferredTravelDate: '2026-12-15',
        includeHouseboatUpgrade: true,
        includeMealPlan: false,
        includeAthirapillyTrip: true,
        includeKanyakumariTrip: false,
        pricingStatus: 'EXACT_MATCH',
        quotedUnitPriceInr: 20700,
        quotedTotalPriceInr: 124200 + 5400 + 6800 + 5000, // 141,400
        vehicleAssigned: 'Innova (6 Pax tight luggage)',
      },
      isDeleted: false,
      createdAt: '2026-11-04T08:30:00.000Z',
      updatedAt: '2026-11-04T08:30:00.000Z',
    },
    {
      id: 'lead-002',
      referenceId: 'FLT-20261103-2045',
      serviceType: 'FLIGHT',
      stage: 'GENERAL',
      priorityLevel: 'MEDIUM',
      source: 'WEBSITE_FLIGHT_SEARCH',
      customerId: 'cust-102-megha-shah',
      assignedUserId: 'usr-priya-sharma-flights',
      flightDetail: {
        tripType: 'ROUND_TRIP',
        originAirport: 'AMD - Sardar Vallabhbhai Patel International, Ahmedabad',
        destinationAirport: 'DXB - Dubai International Airport, UAE',
        departureDate: '2026-12-22',
        returnDate: '2026-12-29',
        adultsCount: 2,
        childrenCount: 1,
        infantsCount: 0,
        cabinClass: 'ECONOMY',
        specialRequirements: 'Prefer direct Emirates or IndiGo flights. Jain meal requested for 2 pax.',
      },
      isDeleted: false,
      createdAt: '2026-11-03T11:20:00.000Z',
      updatedAt: '2026-11-03T14:10:00.000Z',
    },
    {
      id: 'lead-003',
      referenceId: 'VIS-20261102-3012',
      serviceType: 'VISA',
      stage: 'PRIORITY',
      priorityLevel: 'URGENT',
      source: 'WEBSITE_VISA_PORTAL',
      customerId: 'cust-103-rakesh-amin',
      assignedUserId: 'usr-ananya-joshi-visa',
      visaDetail: {
        destinationCountry: 'United Arab Emirates (Dubai 30-Day Express eVisa)',
        visaCategory: 'TOURIST',
        travelPurpose: 'Family vacation and attending business conference at Dubai World Trade Centre',
        applicantNationality: 'Indian',
        residenceCountry: 'India',
        plannedTravelDate: '2026-11-20',
        stayDurationDays: 14,
        applicantCount: 3,
        specialCircumstances: 'Urgent express processing requested. Passports have >6 months validity.',
      },
      isDeleted: false,
      createdAt: '2026-11-02T15:00:00.000Z',
      updatedAt: '2026-11-04T09:00:00.000Z',
    },
    {
      id: 'lead-004',
      referenceId: 'PKG-20261028-0914',
      serviceType: 'PACKAGE',
      stage: 'CONVERTED',
      priorityLevel: 'HIGH',
      source: 'IN_PERSON_ANAND_DESK',
      customerId: 'cust-104-bhavik-joshi',
      assignedUserId: 'usr-harshil-desai-packages',
      packageDetail: {
        packageSlug: 'kerala-6n7d-winter',
        packageName: 'Kerala 6N/7D Deluxe Leisure',
        hotelTier: 'DELUXE',
        configCode: '2PAX_SEDAN',
        adultsCount: 2,
        childrenWithBedCount: 0,
        childrenNoBedCount: 0,
        roomsCount: 1,
        preferredTravelDate: '2026-11-18',
        includeHouseboatUpgrade: true,
        includeMealPlan: true,
        includeAthirapillyTrip: false,
        includeKanyakumariTrip: false,
        pricingStatus: 'EXACT_MATCH',
        quotedUnitPriceInr: 29900,
        quotedTotalPriceInr: 59800 + 6500 + 10400, // 76,700
        vehicleAssigned: 'Sedan (Dzire / Etios)',
      },
      isDeleted: false,
      createdAt: '2026-10-28T10:00:00.000Z',
      updatedAt: '2026-11-01T16:00:00.000Z',
    },
  ];

  const activities: LeadActivityRecord[] = [
    {
      id: 'act-001',
      leadId: 'lead-001',
      userId: 'usr-neel-patel-superadmin',
      userName: 'Neel Patel',
      type: 'ASSIGNMENT',
      title: 'Lead Automatically Triaged',
      description: 'Kerala 6N/7D family enquiry assigned to Harshil Desai (Packages Specialist).',
      metadata: { newAssignee: 'Harshil Desai' },
      createdAt: '2026-11-04T08:31:00.000Z',
    },
    {
      id: 'act-002',
      leadId: 'lead-002',
      userId: 'usr-priya-sharma-flights',
      userName: 'Priya Sharma',
      type: 'CALL',
      title: 'Phone Consultation Completed',
      description: 'Spoke with Mrs. Megha Shah. Confirmed direct Ahmedabad-Dubai flight requirements. Preparing quotation with IndiGo morning departure vs Emirates afternoon flight.',
      metadata: { callDurationSeconds: 420, callOutcome: 'CONNECTED' },
      createdAt: '2026-11-03T14:15:00.000Z',
    },
    {
      id: 'act-003',
      leadId: 'lead-003',
      userId: 'usr-ananya-joshi-visa',
      userName: 'Ananya Joshi',
      type: 'WHATSAPP_CLICK',
      title: 'WhatsApp Click-to-Chat Launched',
      description: 'Specialist clicked WhatsApp contact link to request passport first & last page scans from Rakesh Amin.',
      // STRICT COMPLIANCE: Click-to-chat recorded as CLICK_TO_CHAT_TRIGGERED, never falsely 'DELIVERED'
      metadata: { whatsappStatus: 'CLICK_TO_CHAT_TRIGGERED' },
      createdAt: '2026-11-03T16:00:00.000Z',
    },
  ];

  const followUps: FollowUpRecord[] = [
    {
      id: 'flw-001',
      leadId: 'lead-001',
      userId: 'usr-harshil-desai-packages',
      userName: 'Harshil Desai',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      note: 'Call Chirag Patel to discuss Innova luggage capacity for 6 adults + 1 child and confirm whether they want to upgrade to Tempo Traveller.',
      status: 'PENDING',
      createdAt: '2026-11-04T08:35:00.000Z',
    },
    {
      id: 'flw-002',
      leadId: 'lead-003',
      userId: 'usr-ananya-joshi-visa',
      userName: 'Ananya Joshi',
      scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString(), // Today in 2 hours
      note: 'Urgent: Follow up on Dubai 30-day visa photograph specifications with white background.',
      status: 'PENDING',
      createdAt: '2026-11-04T09:10:00.000Z',
    },
  ];

  const quotations: QuotationRecord[] = [
    {
      id: 'quo-001',
      quotationNumber: 'VH-QUO-202611-0001',
      leadId: 'lead-004',
      customerId: 'cust-104-bhavik-joshi',
      createdByUserId: 'usr-harshil-desai-packages',
      createdByName: 'Harshil Desai',
      status: 'ACCEPTED',
      title: 'Kerala 6N/7D Deluxe Honeymoon Package',
      subtotalInr: 76700,
      taxesInr: 0,
      discountInr: 1700,
      totalAmountInr: 75000,
      supplierNetCostInr: 61000, // Confidential
      validUntil: '2026-11-10T18:00:00.000Z',
      terms: '50% advance deposit required to confirm deluxe resorts and private houseboat voucher.',
      lineItems: [
        {
          itemOrder: 1,
          description: 'Kerala 6N/7D Deluxe Hotels (2N Munnar, 1N Thekkady, 1N Alleppey, 2N Kovalam) + AC Sedan',
          serviceCategory: 'PACKAGE',
          quantity: 2,
          unitPriceInr: 29900,
          supplierCostInr: 23100,
          totalAmountInr: 59800,
        },
        {
          itemOrder: 2,
          description: 'Deluxe Private 1-Bedroom AC Houseboat Cruise & Overnight Stay with all meals',
          serviceCategory: 'HOUSEBOAT',
          quantity: 2,
          unitPriceInr: 3250,
          supplierCostInr: 2600,
          totalAmountInr: 6500,
        },
        {
          itemOrder: 3,
          description: 'MAP Meal Supplement (Daily Buffet Breakfast + Dinner)',
          serviceCategory: 'HOTELS',
          quantity: 2,
          unitPriceInr: 5200,
          supplierCostInr: 4400,
          totalAmountInr: 10400,
        },
      ],
      createdAt: '2026-10-30T14:00:00.000Z',
    },
  ];

  const auditLogs: AuditLogRecord[] = [
    {
      id: 'aud-001',
      userId: 'usr-neel-patel-superadmin',
      userEmail: 'neel@varniholidays.com',
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'SYSTEM',
      entityId: 'global',
      details: 'Varni Holidays Phase 2 CRM portal initialized with Super Admin Neel Patel.',
      ipAddress: '127.0.0.1 (Anand Head Office)',
      createdAt: '2026-11-04T08:00:00.000Z',
    },
    {
      id: 'aud-002',
      userId: 'usr-harshil-desai-packages',
      userEmail: 'harshil@varniholidays.com',
      action: 'QUOTATION_ACCEPTED',
      entityType: 'QUOTATION',
      entityId: 'quo-001',
      details: 'Quotation VH-QUO-202611-0001 accepted by customer Bhavik Joshi (₹75,000 total). Booking created.',
      ipAddress: '127.0.0.1 (Anand Desk)',
      createdAt: '2026-11-01T16:00:00.000Z',
    },
  ];

  // Verified supplier cost matrices vs published rack rates for Kerala 6N/7D
  const packageCosts: PackageCostItem[] = [
    {
      id: 'cost-ker-01',
      packageCode: 'KER-6N7D-STD-2PAX',
      packageName: 'Kerala 6N/7D (2 Pax Sedan)',
      hotelTier: 'STANDARD',
      vehicleOption: 'Sedan (Dzire / Etios)',
      paxCount: 2,
      supplierCostInr: 21900,
      sourceRackRateInr: 27400,
      varniSellingPriceInr: 27400,
      marginAmountInr: 5500,
      marginPercent: 20.07,
      seasonValidity: '01 Oct 2026 - 31 Mar 2027',
      approvalStatus: 'APPROVED',
    },
    {
      id: 'cost-ker-02',
      packageCode: 'KER-6N7D-STD-4PAX',
      packageName: 'Kerala 6N/7D (4 Pax Innova)',
      hotelTier: 'STANDARD',
      vehicleOption: 'Innova Crysta',
      paxCount: 4,
      supplierCostInr: 19600,
      sourceRackRateInr: 24500,
      varniSellingPriceInr: 24500,
      marginAmountInr: 4900,
      marginPercent: 20.0,
      seasonValidity: '01 Oct 2026 - 31 Mar 2027',
      approvalStatus: 'APPROVED',
    },
    {
      id: 'cost-ker-03',
      packageCode: 'KER-6N7D-STD-6PAX-INV',
      packageName: 'Kerala 6N/7D (6 Pax Innova)',
      hotelTier: 'STANDARD',
      vehicleOption: 'Innova (6 Pax)',
      paxCount: 6,
      supplierCostInr: 16500,
      sourceRackRateInr: 20700,
      varniSellingPriceInr: 20700,
      marginAmountInr: 4200,
      marginPercent: 20.29,
      seasonValidity: '01 Oct 2026 - 31 Mar 2027',
      approvalStatus: 'APPROVED',
    },
    {
      id: 'cost-ker-04',
      packageCode: 'KER-6N7D-STD-6PAX-TRV',
      packageName: 'Kerala 6N/7D (6 Pax Tempo Traveller)',
      hotelTier: 'STANDARD',
      vehicleOption: 'Tempo Traveller (10-12 Seater)',
      paxCount: 6,
      supplierCostInr: 17100,
      sourceRackRateInr: 21400,
      varniSellingPriceInr: 21400,
      marginAmountInr: 4300,
      marginPercent: 20.09,
      seasonValidity: '01 Oct 2026 - 31 Mar 2027',
      approvalStatus: 'APPROVED',
    },
  ];

  const bookings: BookingRecord[] = [
    {
      id: 'bkg-301-bhavik-joshi',
      bookingReference: 'VH-BKG-202611-0001',
      customerId: 'cust-104-bhavik-joshi',
      customerName: 'Bhavik Joshi',
      serviceType: 'PACKAGE',
      leadId: 'lead-004-bhavik-joshi-pkg',
      managedByUserId: 'usr-harshil-desai-packages',
      managedByName: 'Harshil Desai',
      travelStartDate: '2026-12-10',
      travelEndDate: '2026-12-16',
      status: 'CONFIRMED',
      totalAmountInr: 76700,
      paidAmountInr: 25000,
      balanceAmountInr: 51700,
      createdAt: '2026-11-03T16:00:00.000Z',
      updatedAt: '2026-11-03T16:00:00.000Z',
    },
  ];

  const bookingServices: BookingServiceComponent[] = [
    {
      id: 'srv-001',
      bookingId: 'bkg-301-bhavik-joshi',
      serviceCategory: 'HOTEL',
      serviceName: 'Kerala 6N/7D Deluxe Hotels (Munnar, Thekkady, Kovalam)',
      supplierName: 'Spice Country Holidays Kochi',
      internalReference: 'SCH-RES-9921',
      customerConfirmationRef: 'CONF-KL-4091',
      status: 'CONFIRMED',
      startDate: '2026-12-10',
      endDate: '2026-12-16',
      responsibleUserId: 'usr-harshil-desai-packages',
      responsibleUserName: 'Harshil Desai',
      notes: 'Deluxe rooms confirmed with MAP plan (breakfast + dinner).',
      createdAt: '2026-11-03T16:15:00.000Z',
      updatedAt: '2026-11-03T16:15:00.000Z',
    },
    {
      id: 'srv-002',
      bookingId: 'bkg-301-bhavik-joshi',
      serviceCategory: 'CRUISE',
      serviceName: 'Alleppey Private 1-Bedroom AC Luxury Houseboat',
      supplierName: 'Rainbow Cruises Alleppey',
      internalReference: 'RC-HB-772',
      customerConfirmationRef: 'RC-VOUCHER-8829',
      status: 'VOUCHER_ISSUED',
      startDate: '2026-12-13',
      endDate: '2026-12-14',
      responsibleUserId: 'usr-harshil-desai-packages',
      responsibleUserName: 'Harshil Desai',
      notes: 'Check-in 12:00 PM, welcome drink, Kerala traditional lunch, evening tea/snacks, dinner.',
      createdAt: '2026-11-03T16:20:00.000Z',
      updatedAt: '2026-11-03T16:20:00.000Z',
    },
    {
      id: 'srv-003',
      bookingId: 'bkg-301-bhavik-joshi',
      serviceCategory: 'TRANSFER',
      serviceName: 'AC Sedan Dedicated Chauffeur (Cochin Airport to Trivandrum)',
      supplierName: 'Kerala Tourist Cabs Cochin',
      internalReference: 'KTC-SED-4401',
      status: 'CONFIRMED',
      startDate: '2026-12-10',
      endDate: '2026-12-16',
      responsibleUserId: 'usr-harshil-desai-packages',
      responsibleUserName: 'Harshil Desai',
      notes: 'English/Hindi speaking chauffeur. Tolls, parking, and driver allowances included.',
      createdAt: '2026-11-03T16:25:00.000Z',
      updatedAt: '2026-11-03T16:25:00.000Z',
    },
  ];

  const payments: PaymentRecord[] = [
    {
      id: 'pay-001',
      paymentReference: 'VH-PAY-202611-0001',
      bookingId: 'bkg-301-bhavik-joshi',
      bookingReference: 'VH-BKG-202611-0001',
      customerId: 'cust-104-bhavik-joshi',
      customerName: 'Bhavik Joshi',
      amountInr: 25000,
      paymentMethod: 'UPI',
      upiRef: 'UPI/20261103/998241512/HDFC',
      paymentStatus: 'COMPLETED',
      receivedAt: '2026-11-03T16:10:00.000Z',
      internalNotes: 'Initial 30% advance deposit received to confirm hotel and houseboat allotments.',
      recordedByUserId: 'usr-harshil-desai-packages',
      recordedByName: 'Harshil Desai',
      createdAt: '2026-11-03T16:10:00.000Z',
    },
  ];

  const communicationLogs: CommunicationLogRecord[] = [
    {
      id: 'com-001',
      customerId: 'cust-104-bhavik-joshi',
      customerName: 'Bhavik Joshi',
      customerContact: 'bhavik.j@outlook.com',
      leadId: 'lead-004',
      quotationId: 'quo-001',
      senderUserId: 'usr-harshil-desai-packages',
      senderUserName: 'Harshil Desai',
      templateKey: 'QUOTATION_PREPARED',
      templateTitle: 'Quotation VH-QUO-202611-0001 for Kerala Honeymoon',
      channel: 'EMAIL',
      subject: 'Your Tailored Kerala Tour Proposal - Varni Holidays',
      content: 'Proposal sent with itemized breakdown for Kerala 6N/7D Deluxe package (₹75,000 net).',
      deliveryStatus: 'DELIVERED',
      createdAt: '2026-10-30T14:05:00.000Z',
      sentAt: '2026-10-30T14:05:10.000Z',
      deliveredAt: '2026-10-30T14:05:45.000Z',
    },
    {
      id: 'com-002',
      customerId: 'cust-104-bhavik-joshi',
      customerName: 'Bhavik Joshi',
      customerContact: 'bhavik.j@outlook.com',
      leadId: 'lead-004',
      bookingId: 'bkg-301-bhavik-joshi',
      senderUserId: 'usr-harshil-desai-packages',
      senderUserName: 'Harshil Desai',
      templateKey: 'BOOKING_CONFIRMATION',
      templateTitle: 'Booking Confirmation VH-BKG-202611-0001',
      channel: 'EMAIL',
      subject: 'Confirmed: Your Kerala 6N/7D Holiday (Ref: VH-BKG-202611-0001)',
      content: 'Official confirmation and advance receipt of ₹25,000 sent to customer.',
      deliveryStatus: 'DELIVERED',
      createdAt: '2026-11-03T16:30:00.000Z',
      sentAt: '2026-11-03T16:30:05.000Z',
      deliveredAt: '2026-11-03T16:30:30.000Z',
    },
  ];

  const defaultSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
  const sheetsConfig: GoogleSheetsConfig = {
    spreadsheetId: defaultSpreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${defaultSpreadsheetId}/edit`,
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'varni-sheets-sync@varni-holidays-crm.iam.gserviceaccount.com',
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    status: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY ? 'CONNECTED' : 'DISCONNECTED',
    lastSuccessfulSyncAt: '2026-11-04T09:00:00.000Z',
    lastSyncError: null,
    totalSyncedEvents: 28,
    activeViewerEmail: 'neel@varniholidays.com',
  };

  const syncJobs: SyncJobRecord[] = [
    {
      id: 'sync-init-001',
      eventType: 'RECONCILIATION_FULL',
      targetTab: 'BUSINESS_SUMMARY',
      entityId: 'SYSTEM',
      payload: { reason: 'Initial baseline sync' },
      status: 'COMPLETED',
      retryCount: 0,
      maxRetries: 5,
      error: null,
      scheduledAt: '2026-11-04T09:00:00.000Z',
      processedAt: '2026-11-04T09:00:02.000Z',
      createdAt: '2026-11-04T09:00:00.000Z',
    },
  ];

  return {
    customers,
    leads,
    activities,
    followUps,
    quotations,
    bookings,
    auditLogs,
    packageCosts,
    syncJobs,
    sheetsConfig,
    bookingServices,
    payments,
    communicationLogs,
  };
}

class CrmRepository {
  private state: CrmDatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): CrmDatabaseState {
    const seed = generateInitialState();
    try {
      let candidatePath = STORE_PATH;
      if (!fs.existsSync(candidatePath)) {
        const bundledPath = path.join(process.cwd(), 'data', 'crm_store.json');
        if (fs.existsSync(bundledPath)) {
          candidatePath = bundledPath;
        }
      }

      if (fs.existsSync(candidatePath)) {
        const raw = fs.readFileSync(candidatePath, 'utf-8');
        const loaded = JSON.parse(raw);
        const merged = {
          ...seed,
          ...loaded,
          leads: loaded.leads || seed.leads,
          customers: loaded.customers || seed.customers,
          activities: loaded.activities || seed.activities,
          followUps: loaded.followUps || seed.followUps,
          quotations: loaded.quotations || seed.quotations,
          bookings: loaded.bookings || seed.bookings,
          syncJobs: loaded.syncJobs || seed.syncJobs,
          sheetsConfig: loaded.sheetsConfig || seed.sheetsConfig,
          bookingServices: loaded.bookingServices || seed.bookingServices,
          payments: loaded.payments || seed.payments,
          communicationLogs: loaded.communicationLogs || seed.communicationLogs,
        };
        if (candidatePath !== STORE_PATH) {
          this.persist(merged);
        }
        return merged;
      }
    } catch (e) {
      console.warn('Error reading CRM store from disk, falling back to seed:', e);
    }
    this.persist(seed);
    return seed;
  }

  private persist(data: CrmDatabaseState) {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist CRM store to disk:', e);
    }
  }

  public reset(): void {
    this.state = generateInitialState();
    this.persist(this.state);
  }

  // --- Customers ---
  public getCustomers(): CustomerRecord[] {
    return this.state.customers.filter((c) => !c.isDeleted);
  }

  public getCustomerById(id: string): CustomerRecord | null {
    return this.state.customers.find((c) => c.id === id && !c.isDeleted) || null;
  }

  public findCustomerByPhoneOrEmail(normalizedPhone: string, normalizedEmail?: string | null): CustomerRecord | null {
    return (
      this.state.customers.find(
        (c) =>
          !c.isDeleted &&
          (c.normalizedPhone === normalizedPhone || (normalizedEmail && c.normalizedEmail === normalizedEmail))
      ) || null
    );
  }

  public findPotentialDuplicates(): Array<{ primary: CustomerRecord; matches: CustomerRecord[] }> {
    const active = this.state.customers.filter((c) => !c.isDeleted && !c.mergedIntoCustomerId);
    const groups: Record<string, CustomerRecord[]> = {};

    for (const c of active) {
      if (!groups[c.normalizedPhone]) {
        groups[c.normalizedPhone] = [];
      }
      groups[c.normalizedPhone].push(c);
    }

    const duplicates: Array<{ primary: CustomerRecord; matches: CustomerRecord[] }> = [];
    for (const key in groups) {
      if (groups[key].length > 1) {
        const [primary, ...matches] = groups[key];
        duplicates.push({ primary, matches });
      }
    }
    return duplicates;
  }

  public saveCustomer(customer: CustomerRecord): CustomerRecord {
    const idx = this.state.customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      this.state.customers[idx] = { ...customer, updatedAt: new Date().toISOString() };
    } else {
      this.state.customers.push(customer);
    }
    this.persist(this.state);
    return customer;
  }

  // Admin-controlled non-destructive customer merging
  public mergeCustomers(
    primaryId: string,
    subordinateId: string,
    mergedByUserId: string,
    mergedByEmail: string
  ): { success: boolean; message: string } {
    const primary = this.getCustomerById(primaryId);
    const subordinate = this.getCustomerById(subordinateId);

    if (!primary || !subordinate) {
      return { success: false, message: 'Customer record not found.' };
    }

    // 1. Mark subordinate as merged
    subordinate.mergedIntoCustomerId = primary.id;
    subordinate.mergedAt = new Date().toISOString();
    subordinate.mergedByUserId = mergedByUserId;
    subordinate.isDeleted = true; // Archived, not purged
    this.saveCustomer(subordinate);

    // 2. Re-point subordinate leads to primary customer
    let transferredLeadsCount = 0;
    this.state.leads.forEach((l) => {
      if (l.customerId === subordinateId) {
        l.customerId = primary.id;
        l.updatedAt = new Date().toISOString();
        transferredLeadsCount++;
      }
    });

    // 3. Clear duplicate warning on primary
    primary.duplicateWarning = false;
    primary.duplicateNotes = `Merged with ${subordinate.fullName} (${subordinate.id}) on ${new Date().toLocaleDateString('en-IN')}`;
    this.saveCustomer(primary);

    // 4. Record audit log
    this.addAuditLog({
      userId: mergedByUserId,
      userEmail: mergedByEmail,
      action: 'CUSTOMER_MERGED',
      entityType: 'CUSTOMER',
      entityId: primary.id,
      details: `Merged subordinate customer ${subordinate.fullName} (${subordinate.id}) into ${primary.fullName} (${primary.id}). Transferred ${transferredLeadsCount} leads.`,
      ipAddress: 'Internal Portal',
    });

    this.persist(this.state);
    return {
      success: true,
      message: `Successfully merged ${subordinate.fullName} into ${primary.fullName}. All historical leads preserved.`,
    };
  }

  // --- Leads ---
  public getLeads(filters?: {
    serviceType?: string;
    stage?: string;
    priority?: string;
    assignedUserId?: string;
    search?: string;
  }): Array<LeadRecord & { customer: CustomerRecord; assigneeName?: string }> {
    let result = this.state.leads.filter((l) => !l.isDeleted);

    if (filters?.serviceType && filters.serviceType !== 'ALL') {
      result = result.filter((l) => l.serviceType === filters.serviceType);
    }
    if (filters?.stage && filters.stage !== 'ALL') {
      result = result.filter((l) => l.stage === filters.stage);
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      result = result.filter((l) => l.priorityLevel === filters.priority);
    }
    if (filters?.assignedUserId && filters.assignedUserId !== 'ALL') {
      result = result.filter((l) => l.assignedUserId === filters.assignedUserId);
    }

    const enhanced = result.map((l) => {
      const customer =
        this.getCustomerById(l.customerId) || {
          id: l.customerId,
          fullName: 'Unknown Customer',
          email: null,
          phoneCountryCode: '+91',
          phoneNumber: '',
          normalizedPhone: '',
          normalizedEmail: null,
          duplicateWarning: false,
          isDeleted: false,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        };
      const assignee = DEFAULT_USERS.find((u) => u.id === l.assignedUserId);
      return {
        ...l,
        customer,
        assigneeName: assignee ? assignee.fullName : 'Unassigned',
      };
    });

    if (filters?.search) {
      const query = filters.search.toLowerCase().trim();
      return enhanced.filter(
        (l) =>
          l.referenceId.toLowerCase().includes(query) ||
          l.customer.fullName.toLowerCase().includes(query) ||
          l.customer.phoneNumber.includes(query) ||
          (l.customer.email && l.customer.email.toLowerCase().includes(query))
      );
    }

    return enhanced;
  }

  public getLeadById(id: string): (LeadRecord & { customer: CustomerRecord; assigneeName?: string }) | null {
    const lead = this.state.leads.find((l) => (l.id === id || l.referenceId === id) && !l.isDeleted);
    if (!lead) return null;
    const customer =
      this.getCustomerById(lead.customerId) || {
        id: lead.customerId,
        fullName: 'Unknown Customer',
        email: null,
        phoneCountryCode: '+91',
        phoneNumber: '',
        normalizedPhone: '',
        normalizedEmail: null,
        duplicateWarning: false,
        isDeleted: false,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      };
    const assignee = DEFAULT_USERS.find((u) => u.id === lead.assignedUserId);
    return {
      ...lead,
      customer,
      assigneeName: assignee ? assignee.fullName : 'Unassigned',
    };
  }

  public saveLead(lead: LeadRecord): LeadRecord {
    const idx = this.state.leads.findIndex((l) => l.id === lead.id);
    const isNew = idx < 0;
    if (idx >= 0) {
      this.state.leads[idx] = { ...lead, updatedAt: new Date().toISOString() };
    } else {
      this.state.leads.unshift(lead);
    }

    // Transactional Outbox enqueue: DB mutation & Sheets Sync Job committed together
    this.enqueueSyncJob(
      isNew ? 'LEAD_CREATED' : 'LEAD_UPDATED',
      'ALL_LEADS',
      lead.id,
      this.formatLeadForSync(lead)
    );
    this.enqueueSyncJob(
      isNew ? 'LEAD_CREATED' : 'STAGE_CHANGED',
      'BUSINESS_SUMMARY',
      lead.id,
      {}
    );

    this.persist(this.state);
    return lead;
  }

  // --- Lead Activities ---
  public getActivitiesForLead(leadId: string): LeadActivityRecord[] {
    return this.state.activities
      .filter((a) => a.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addActivity(activity: Omit<LeadActivityRecord, 'id' | 'createdAt'>): LeadActivityRecord {
    const newAct: LeadActivityRecord = {
      ...activity,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.activities.unshift(newAct);
    this.persist(this.state);
    return newAct;
  }

  public addLeadActivity(activity: Omit<LeadActivityRecord, 'id' | 'createdAt'>): LeadActivityRecord {
    return this.addActivity(activity);
  }

  // --- Follow Ups ---
  public getFollowUps(filters?: { userId?: string; status?: string }): Array<FollowUpRecord & { leadRef?: string; customerName?: string }> {
    let result = [...this.state.followUps];
    if (filters?.userId && filters.userId !== 'ALL') {
      result = result.filter((f) => f.userId === filters.userId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((f) => f.status === filters.status);
    }

    return result
      .map((f) => {
        const lead = this.state.leads.find((l) => l.id === f.leadId);
        const customer = lead ? this.getCustomerById(lead.customerId) : null;
        return {
          ...f,
          leadRef: lead ? lead.referenceId : 'Unknown Lead',
          customerName: customer ? customer.fullName : 'Unknown Customer',
        };
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  public addFollowUp(item: Omit<FollowUpRecord, 'id' | 'createdAt'>): FollowUpRecord {
    const newF: FollowUpRecord = {
      ...item,
      id: `flw-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.followUps.push(newF);

    this.enqueueSyncJob(
      'FOLLOW_UP_CREATED',
      'FOLLOW_UPS',
      newF.id,
      this.formatFollowUpForSync(newF)
    );
    this.enqueueSyncJob(
      'FOLLOW_UP_CREATED',
      'BUSINESS_SUMMARY',
      newF.id,
      {}
    );

    this.persist(this.state);
    return newF;
  }

  public completeFollowUp(id: string): boolean {
    const f = this.state.followUps.find((item) => item.id === id);
    if (!f) return false;
    f.status = 'COMPLETED';
    f.completedAt = new Date().toISOString();

    this.enqueueSyncJob(
      'FOLLOW_UP_UPDATED',
      'FOLLOW_UPS',
      f.id,
      this.formatFollowUpForSync(f)
    );
    this.enqueueSyncJob(
      'FOLLOW_UP_UPDATED',
      'BUSINESS_SUMMARY',
      f.id,
      {}
    );

    this.persist(this.state);
    return true;
  }

  // --- Bookings ---
  public getBookings(customerId?: string): BookingRecord[] {
    if (customerId) {
      return this.state.bookings.filter((b) => b.customerId === customerId);
    }
    return this.state.bookings;
  }

  public getBookingById(id: string): BookingRecord | undefined {
    return this.state.bookings.find((b) => b.id === id || b.bookingReference === id);
  }

  public saveBooking(booking: BookingRecord): BookingRecord {
    const idx = this.state.bookings.findIndex((b) => b.id === booking.id || b.bookingReference === booking.bookingReference);
    const isNew = idx < 0;
    if (idx >= 0) {
      this.state.bookings[idx] = { ...booking, updatedAt: new Date().toISOString() };
    } else {
      this.state.bookings.unshift(booking);
    }

    this.enqueueSyncJob(
      isNew ? 'BOOKING_CREATED' : 'BOOKING_STATUS_CHANGED',
      'BOOKINGS',
      booking.id,
      this.formatBookingForSync(booking)
    );
    this.enqueueSyncJob(
      isNew ? 'BOOKING_CREATED' : 'BOOKING_STATUS_CHANGED',
      'BUSINESS_SUMMARY',
      booking.id,
      {}
    );

    this.persist(this.state);
    return booking;
  }

  // --- Google Sheets Outbox Queue & Config ---
  public enqueueSyncJob(
    eventType: SyncEventType,
    targetTab: SyncTargetTab,
    entityId: string,
    payload: Record<string, any>
  ): SyncJobRecord {
    const job: SyncJobRecord = {
      id: `sync-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      eventType,
      targetTab,
      entityId,
      payload,
      status: 'PENDING',
      retryCount: 0,
      maxRetries: 5,
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.state.syncJobs.unshift(job);
    return job;
  }

  public getSyncJobs(limit: number = 50): SyncJobRecord[] {
    return this.state.syncJobs.slice(0, limit);
  }

  public getPendingSyncJobs(): SyncJobRecord[] {
    return this.state.syncJobs.filter((j) => j.status === 'PENDING');
  }

  public updateSyncJob(id: string, updates: Partial<SyncJobRecord>): void {
    const job = this.state.syncJobs.find((j) => j.id === id);
    if (job) {
      Object.assign(job, updates);
      this.persist(this.state);
    }
  }

  public retryFailedSyncJobs(): number {
    let count = 0;
    this.state.syncJobs.forEach((j) => {
      if (j.status === 'FAILED') {
        j.status = 'PENDING';
        j.error = null;
        count++;
      }
    });
    this.persist(this.state);
    return count;
  }

  public getGoogleSheetsConfig(): GoogleSheetsConfig {
    return this.state.sheetsConfig;
  }

  public updateGoogleSheetsConfig(updates: Partial<GoogleSheetsConfig>): GoogleSheetsConfig {
    this.state.sheetsConfig = { ...this.state.sheetsConfig, ...updates };
    this.persist(this.state);
    return this.state.sheetsConfig;
  }

  // Sanitized formatting methods strictly excluding passport, DOB, supplier costs, margins
  public formatLeadForSync(lead: LeadRecord): Record<string, any> {
    const customer = this.getCustomerById(lead.customerId);
    const assignee = DEFAULT_USERS.find((u) => u.id === lead.assignedUserId);
    const activities = this.getActivitiesForLead(lead.id);
    const lastActivity = activities[0];
    const followUps = this.state.followUps.filter((f) => f.leadId === lead.id && f.status === 'PENDING');
    const nextFollowUp = followUps[0]?.scheduledAt ? new Date(followUps[0].scheduledAt).toLocaleDateString('en-IN') : 'None Scheduled';

    let destinationOrPackage = 'General Enquiry';
    let travelDate = 'TBD';

    if (lead.serviceType === 'PACKAGE' && lead.packageDetail) {
      destinationOrPackage = lead.packageDetail.packageName;
      travelDate = lead.packageDetail.preferredTravelDate || 'Winter 2026';
    } else if (lead.serviceType === 'FLIGHT' && lead.flightDetail) {
      destinationOrPackage = `${lead.flightDetail.originAirport} → ${lead.flightDetail.destinationAirport} (${lead.flightDetail.tripType})`;
      travelDate = lead.flightDetail.departureDate;
    } else if (lead.serviceType === 'VISA' && lead.visaDetail) {
      destinationOrPackage = `${lead.visaDetail.destinationCountry} (${lead.visaDetail.visaCategory})`;
      travelDate = lead.visaDetail.plannedTravelDate || 'TBD';
    }

    return {
      leadId: lead.referenceId,
      enquiryDate: new Date(lead.createdAt).toLocaleDateString('en-IN'),
      customerName: customer ? customer.fullName : 'Unknown Customer',
      phoneNumber: customer ? customer.normalizedPhone : '',
      email: customer?.email || 'N/A',
      serviceCategory: lead.serviceType,
      destinationOrPackage,
      travelDate,
      stage: lead.stage,
      priority: lead.priorityLevel,
      assignedEmployee: assignee ? assignee.fullName : 'Unassigned',
      lastContactedDate: lastActivity ? new Date(lastActivity.createdAt).toLocaleDateString('en-IN') : 'New Lead',
      nextFollowUp,
      updatedAt: new Date(lead.updatedAt).toISOString(),
    };
  }

  public formatFollowUpForSync(followUp: FollowUpRecord): Record<string, any> {
    const lead = this.state.leads.find((l) => l.id === followUp.leadId);
    const customer = lead ? this.getCustomerById(lead.customerId) : null;
    return {
      followUpId: followUp.id,
      leadId: lead ? lead.referenceId : followUp.leadId,
      customer: customer ? customer.fullName : 'Unknown Customer',
      assignedEmployee: followUp.userName,
      dueDate: new Date(followUp.scheduledAt).toLocaleString('en-IN'),
      status: followUp.status,
      completionTimestamp: followUp.completedAt ? new Date(followUp.completedAt).toLocaleString('en-IN') : 'Pending',
    };
  }

  public formatBookingForSync(booking: BookingRecord): Record<string, any> {
    const lead = booking.leadId ? this.state.leads.find((l) => l.id === booking.leadId) : null;
    return {
      bookingReference: booking.bookingReference,
      customer: booking.customerName,
      serviceCategory: booking.serviceType,
      relatedLeadId: lead ? lead.referenceId : (booking.leadId || 'N/A'),
      assignedEmployee: booking.managedByName,
      travelDates: `${new Date(booking.travelStartDate).toLocaleDateString('en-IN')} to ${new Date(booking.travelEndDate).toLocaleDateString('en-IN')}`,
      bookingStatus: booking.status,
      bookingCreationDate: new Date(booking.createdAt).toLocaleDateString('en-IN'),
    };
  }

  // --- Quotations (Phase 3) ---
  public getQuotations(leadId?: string): QuotationRecord[] {
    if (leadId) {
      return this.state.quotations.filter((q) => q.leadId === leadId);
    }
    return this.state.quotations;
  }

  public getQuotationById(id: string): QuotationRecord | undefined {
    return this.state.quotations.find((q) => q.id === id || q.quotationNumber === id);
  }

  public saveQuotation(quote: QuotationRecord): QuotationRecord {
    const idx = this.state.quotations.findIndex((q) => q.id === quote.id);
    if (idx >= 0) {
      this.state.quotations[idx] = quote;
    } else {
      this.state.quotations.unshift(quote);
    }
    this.persist(this.state);
    return quote;
  }

  public createQuotation(data: {
    leadId: string;
    customerId: string;
    createdByUserId: string;
    createdByName: string;
    title: string;
    subtotalInr: number;
    taxesInr: number;
    discountInr: number;
    totalAmountInr: number;
    supplierNetCostInr?: number;
    validUntil: string;
    terms: string;
    inclusions?: string[];
    exclusions?: string[];
    internalNotes?: string;
    lineItems: Array<{
      itemOrder: number;
      description: string;
      serviceCategory: string;
      quantity: number;
      unitPriceInr: number;
      supplierCostInr?: number;
      totalAmountInr: number;
    }>;
  }): QuotationRecord {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.quotations.length + 1).toString().padStart(4, '0');
    const quotationNumber = `VH-QUO-${yearMonth}-${seq}`;

    const quote: QuotationRecord = {
      id: `quo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      quotationNumber,
      leadId: data.leadId,
      customerId: data.customerId,
      createdByUserId: data.createdByUserId,
      createdByName: data.createdByName,
      status: 'DRAFT',
      title: data.title,
      subtotalInr: data.subtotalInr,
      taxesInr: data.taxesInr,
      discountInr: data.discountInr,
      totalAmountInr: data.totalAmountInr,
      supplierNetCostInr: data.supplierNetCostInr,
      validUntil: data.validUntil,
      terms: data.terms,
      inclusions: data.inclusions || [],
      exclusions: data.exclusions || [],
      internalNotes: data.internalNotes,
      lineItems: data.lineItems,
      createdAt: new Date().toISOString(),
    };

    // Immutable snapshot JSON
    quote.immutableSnapshotJson = JSON.stringify(quote);

    this.state.quotations.unshift(quote);

    // Add activity to lead
    this.addLeadActivity({
      leadId: data.leadId,
      userId: data.createdByUserId,
      userName: data.createdByName,
      type: 'QUOTATION',
      title: `Quotation Created (${quotationNumber})`,
      description: `Official proposal prepared for ₹${quote.totalAmountInr.toLocaleString('en-IN')}: ${quote.title}`,
      metadata: { quotationNumber, totalAmountInr: quote.totalAmountInr },
    });

    // Audit log
    this.addAuditLog({
      userId: data.createdByUserId,
      userEmail: data.createdByName,
      action: 'QUOTATION_CREATED',
      entityType: 'QUOTATION',
      entityId: quote.id,
      details: `Created quotation ${quotationNumber} for lead ${data.leadId} (Amount: ₹${quote.totalAmountInr})`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return quote;
  }

  public updateQuotationStatus(
    id: string,
    status: QuotationRecord['status'],
    actorId: string,
    notes?: string
  ): QuotationRecord {
    const quote = this.getQuotationById(id);
    if (!quote) throw new Error(`Quotation not found: ${id}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    quote.status = status;

    if (status === 'SENT') {
      quote.sentAt = new Date().toISOString();
    } else if (status === 'ACCEPTED') {
      quote.acceptedAt = new Date().toISOString();
    } else if (status === 'REJECTED') {
      quote.rejectedAt = new Date().toISOString();
    }

    this.addLeadActivity({
      leadId: quote.leadId,
      userId: actor.id,
      userName: actor.fullName,
      type: 'QUOTATION',
      title: `Quotation Status Updated: ${status}`,
      description: notes || `Quotation ${quote.quotationNumber} changed to ${status}`,
      metadata: { quotationNumber: quote.quotationNumber, status },
    });

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: `QUOTATION_${status}`,
      entityType: 'QUOTATION',
      entityId: quote.id,
      details: `Quotation ${quote.quotationNumber} transitioned to ${status}. Notes: ${notes || 'N/A'}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return quote;
  }

  public convertQuotationToBooking(quotationId: string, actorId: string): BookingRecord {
    const quote = this.getQuotationById(quotationId);
    if (!quote) throw new Error(`Quotation not found: ${quotationId}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    const customer = this.getCustomerById(quote.customerId);
    const lead = this.state.leads.find((l) => l.id === quote.leadId);

    // Accept quotation if not already accepted
    if (quote.status !== 'ACCEPTED') {
      quote.status = 'ACCEPTED';
      quote.acceptedAt = new Date().toISOString();
    }

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.bookings.length + 1).toString().padStart(4, '0');
    const bookingReference = `VH-BKG-${yearMonth}-${seq}`;

    // STRICT BUSINESS RULE: New bookings are NEVER automatically confirmed on creation; default to PENDING
    const booking: BookingRecord = {
      id: `bkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingReference,
      customerId: quote.customerId,
      customerName: customer ? customer.fullName : 'Customer',
      serviceType: lead ? lead.serviceType : 'PACKAGE',
      leadId: quote.leadId,
      managedByUserId: actor.id,
      managedByName: actor.fullName,
      travelStartDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      travelEndDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
      status: 'PENDING', // STRICT RULE: Pending confirmation
      totalAmountInr: quote.totalAmountInr,
      paidAmountInr: 0,
      balanceAmountInr: quote.totalAmountInr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.bookings.unshift(booking);

    // Create service components from quotation line items
    quote.lineItems.forEach((item, index) => {
      let category: BookingServiceComponent['serviceCategory'] = 'OTHER';
      const cat = item.serviceCategory.toUpperCase();
      if (cat.includes('FLIGHT')) category = 'FLIGHT';
      else if (cat.includes('HOTEL')) category = 'HOTEL';
      else if (cat.includes('VISA')) category = 'VISA';
      else if (cat.includes('TRANSFER') || cat.includes('VEHICLE')) category = 'TRANSFER';
      else if (cat.includes('HOUSEBOAT') || cat.includes('CRUISE')) category = 'CRUISE';

      const initialStatus = category === 'VISA' ? 'DOCUMENTS_REQUESTED' : 'REQUESTED';

      this.state.bookingServices.push({
        id: `srv-${Date.now()}-${index + 1}`,
        bookingId: booking.id,
        serviceCategory: category,
        serviceName: item.description,
        status: initialStatus,
        responsibleUserId: actor.id,
        responsibleUserName: actor.fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Advance lead stage to CONVERTED
    if (lead) {
      lead.stage = 'CONVERTED';
      lead.updatedAt = new Date().toISOString();
    }

    // Queue Google Sheets Sync for Bookings & Leads
    this.enqueueSyncJob('BOOKING_CREATED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));
    if (lead) {
      this.enqueueSyncJob('STAGE_CHANGED', 'ALL_LEADS', lead.id, this.formatLeadForSync(lead));
    }

    // Add activity & audit log
    this.addLeadActivity({
      leadId: quote.leadId,
      userId: actor.id,
      userName: actor.fullName,
      type: 'STAGE_CHANGE',
      title: 'Booking Created from Quotation',
      description: `Quotation ${quote.quotationNumber} accepted. Booking created (${bookingReference}) in PENDING status.`,
      metadata: { bookingReference, quotationNumber: quote.quotationNumber },
    });

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'BOOKING_CREATED_FROM_QUOTATION',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Created booking ${bookingReference} from accepted quote ${quote.quotationNumber}. Total: ₹${booking.totalAmountInr}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return booking;
  }

  public createBooking(data: {
    customerId: string;
    leadId?: string;
    serviceType: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL';
    managedByUserId: string;
    travelStartDate: string;
    travelEndDate: string;
    totalAmountInr: number;
    initialPaidAmountInr?: number;
    status?: BookingRecord['status'];
  }): BookingRecord {
    const actor = DEFAULT_USERS.find((u) => u.id === data.managedByUserId) || DEFAULT_USERS[0];
    const customer = this.getCustomerById(data.customerId);

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.bookings.length + 1).toString().padStart(4, '0');
    const bookingReference = `VH-BKG-${yearMonth}-${seq}`;

    const paid = data.initialPaidAmountInr || 0;
    const balance = data.totalAmountInr - paid;

    const booking: BookingRecord = {
      id: `bkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingReference,
      customerId: data.customerId,
      customerName: customer ? customer.fullName : 'Customer',
      serviceType: data.serviceType,
      leadId: data.leadId || null,
      managedByUserId: actor.id,
      managedByName: actor.fullName,
      travelStartDate: data.travelStartDate,
      travelEndDate: data.travelEndDate,
      status: data.status || 'PENDING',
      totalAmountInr: data.totalAmountInr,
      paidAmountInr: paid,
      balanceAmountInr: balance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.bookings.unshift(booking);

    this.enqueueSyncJob('BOOKING_CREATED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'BOOKING_CREATED_MANUAL',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Created manual booking ${bookingReference} for ${booking.customerName} (₹${booking.totalAmountInr})`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return booking;
  }

  public updateBookingStatus(
    id: string,
    status: BookingRecord['status'],
    actorId: string,
    notes?: string
  ): BookingRecord {
    const booking = this.getBookingById(id);
    if (!booking) throw new Error(`Booking not found: ${id}`);

    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];
    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    this.enqueueSyncJob('BOOKING_STATUS_CHANGED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));

    if (booking.leadId) {
      this.addLeadActivity({
        leadId: booking.leadId,
        userId: actor.id,
        userName: actor.fullName,
        type: 'STATUS_CHANGE',
        title: `Booking Status: ${status}`,
        description: notes || `Booking ${booking.bookingReference} status changed to ${status}`,
        metadata: { bookingReference: booking.bookingReference, status },
      });
    }

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'BOOKING_STATUS_CHANGED',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Booking ${booking.bookingReference} moved to status ${status}. Notes: ${notes || 'N/A'}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return booking;
  }

  // --- Booking Services (Phase 3) ---
  public getBookingServices(bookingId?: string): BookingServiceComponent[] {
    if (bookingId) {
      return this.state.bookingServices.filter((s) => s.bookingId === bookingId);
    }
    return this.state.bookingServices;
  }

  public addBookingService(component: Omit<BookingServiceComponent, 'id' | 'createdAt' | 'updatedAt'>): BookingServiceComponent {
    const newComp: BookingServiceComponent = {
      ...component,
      id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.bookingServices.push(newComp);
    this.persist(this.state);
    return newComp;
  }

  public updateBookingService(
    serviceId: string,
    updates: Partial<BookingServiceComponent>,
    actorId: string
  ): BookingServiceComponent {
    const idx = this.state.bookingServices.findIndex((s) => s.id === serviceId);
    if (idx === -1) throw new Error(`Booking service component not found: ${serviceId}`);

    const existing = this.state.bookingServices[idx];
    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];

    const updated: BookingServiceComponent = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.bookingServices[idx] = updated;

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'BOOKING_SERVICE_UPDATED',
      entityType: 'BOOKING_SERVICE',
      entityId: serviceId,
      details: `Updated ${updated.serviceCategory} component '${updated.serviceName}' to status '${updated.status}'`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return updated;
  }

  // --- Payments (Phase 3) ---
  public getPayments(bookingId?: string): PaymentRecord[] {
    if (bookingId) {
      return this.state.payments.filter((p) => p.bookingId === bookingId);
    }
    return this.state.payments;
  }

  public recordPayment(data: {
    bookingId: string;
    amountInr: number;
    paymentMethod: PaymentRecord['paymentMethod'];
    bankTransactionRef?: string;
    upiRef?: string;
    chequeDetails?: string;
    internalNotes?: string;
    recordedByUserId: string;
  }): PaymentRecord {
    const booking = this.getBookingById(data.bookingId);
    if (!booking) throw new Error(`Booking not found: ${data.bookingId}`);

    const actor = DEFAULT_USERS.find((u) => u.id === data.recordedByUserId) || DEFAULT_USERS[0];
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const seq = (this.state.payments.length + 1).toString().padStart(4, '0');
    const paymentReference = `VH-PAY-${yearMonth}-${seq}`;

    const payment: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentReference,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      customerId: booking.customerId,
      customerName: booking.customerName,
      amountInr: data.amountInr,
      paymentMethod: data.paymentMethod,
      bankTransactionRef: data.bankTransactionRef,
      upiRef: data.upiRef,
      chequeDetails: data.chequeDetails,
      paymentStatus: 'COMPLETED',
      receivedAt: new Date().toISOString(),
      internalNotes: data.internalNotes,
      recordedByUserId: actor.id,
      recordedByName: actor.fullName,
      createdAt: new Date().toISOString(),
    };

    this.state.payments.unshift(payment);

    // Update booking financials
    booking.paidAmountInr = (booking.paidAmountInr || 0) + data.amountInr;
    booking.balanceAmountInr = Math.max(0, booking.totalAmountInr - booking.paidAmountInr);
    booking.updatedAt = new Date().toISOString();

    // Auto-confirm booking if in PENDING and payment received
    if (booking.status === 'PENDING' && booking.paidAmountInr > 0) {
      booking.status = 'CONFIRMED';
    }

    // Sync booking status to Google Sheets
    this.enqueueSyncJob('BOOKING_STATUS_CHANGED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));

    // Lead activity
    if (booking.leadId) {
      this.addLeadActivity({
        leadId: booking.leadId,
        userId: actor.id,
        userName: actor.fullName,
        type: 'PAYMENT',
        title: `Payment Received: ₹${data.amountInr.toLocaleString('en-IN')}`,
        description: `Payment ${paymentReference} received via ${data.paymentMethod}. Balance remaining: ₹${booking.balanceAmountInr.toLocaleString('en-IN')}`,
        metadata: { paymentReference, amountInr: data.amountInr, balanceAmountInr: booking.balanceAmountInr },
      });
    }

    // Audit log
    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'PAYMENT_RECORDED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: `Recorded payment ${paymentReference} of ₹${data.amountInr} for booking ${booking.bookingReference} (${data.paymentMethod})`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return payment;
  }

  public recordRefund(
    paymentId: string,
    refundAmount: number,
    refundReference: string,
    actorId: string
  ): PaymentRecord {
    const payment = this.state.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error(`Payment record not found: ${paymentId}`);

    const booking = this.getBookingById(payment.bookingId);
    const actor = DEFAULT_USERS.find((u) => u.id === actorId) || DEFAULT_USERS[0];

    payment.refundAmountInr = refundAmount;
    payment.refundReference = refundReference;
    payment.refundedAt = new Date().toISOString();
    payment.paymentStatus = 'REFUNDED';

    if (booking) {
      booking.paidAmountInr = Math.max(0, (booking.paidAmountInr || 0) - refundAmount);
      booking.balanceAmountInr = booking.totalAmountInr - booking.paidAmountInr;
      booking.updatedAt = new Date().toISOString();
      this.enqueueSyncJob('BOOKING_STATUS_CHANGED', 'BOOKINGS', booking.id, this.formatBookingForSync(booking));
    }

    this.addAuditLog({
      userId: actor.id,
      userEmail: actor.email,
      action: 'PAYMENT_REFUNDED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: `Processed refund of ₹${refundAmount} for payment ${payment.paymentReference}. Refund ref: ${refundReference}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return payment;
  }

  // --- Communication Logs (Phase 3) ---
  public getCommunicationLogs(filter?: {
    customerId?: string;
    leadId?: string;
    bookingId?: string;
    channel?: string;
  }): CommunicationLogRecord[] {
    let logs = [...this.state.communicationLogs];
    if (filter?.customerId) {
      logs = logs.filter((l) => l.customerId === filter.customerId);
    }
    if (filter?.leadId) {
      logs = logs.filter((l) => l.leadId === filter.leadId);
    }
    if (filter?.bookingId) {
      logs = logs.filter((l) => l.bookingId === filter.bookingId);
    }
    if (filter?.channel) {
      logs = logs.filter((l) => l.channel === filter.channel);
    }
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public logCommunication(entry: Omit<CommunicationLogRecord, 'id' | 'createdAt'>): CommunicationLogRecord {
    const record: CommunicationLogRecord = {
      ...entry,
      id: `com-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    this.state.communicationLogs.unshift(record);

    if (entry.leadId) {
      this.addLeadActivity({
        leadId: entry.leadId,
        userId: entry.senderUserId,
        userName: entry.senderUserName,
        type: entry.channel === 'EMAIL' ? 'EMAIL' : 'WHATSAPP_CLICK',
        title: `${entry.channel === 'EMAIL' ? 'Email' : 'WhatsApp'} Dispatched: ${entry.templateTitle}`,
        description: `Status: ${entry.deliveryStatus}. Recipient: ${entry.customerContact}`,
        metadata: { channel: entry.channel, deliveryStatus: entry.deliveryStatus, templateKey: entry.templateKey },
      });
    }

    this.addAuditLog({
      userId: entry.senderUserId,
      userEmail: entry.senderUserName,
      action: `COMMUNICATION_${entry.channel}_${entry.deliveryStatus}`,
      entityType: 'COMMUNICATION',
      entityId: record.id,
      details: `Sent ${entry.channel} to ${entry.customerName} (${entry.customerContact}) - ${entry.templateTitle}. Status: ${entry.deliveryStatus}`,
      ipAddress: '127.0.0.1 (Internal CRM)',
    });

    this.persist(this.state);
    return record;
  }

  // --- Customer 360 Unified Timeline ---
  public getCustomerTimeline(customerId: string) {
    const customer = this.getCustomerById(customerId);
    if (!customer) return [];

    const timeline: Array<{
      id: string;
      timestamp: string;
      type: 'LEAD' | 'ACTIVITY' | 'QUOTATION' | 'BOOKING' | 'PAYMENT' | 'SERVICE' | 'COMMUNICATION';
      title: string;
      subtitle?: string;
      status?: string;
      badgeColor?: string;
      details?: any;
      actor?: string;
    }> = [];

    // 1. Leads
    const customerLeads = this.state.leads.filter((l) => l.customerId === customerId);
    customerLeads.forEach((l) => {
      timeline.push({
        id: `tl-lead-${l.id}`,
        timestamp: l.createdAt,
        type: 'LEAD',
        title: `Enquiry Created: ${l.referenceId}`,
        subtitle: `${l.serviceType} Enquiry (${l.source})`,
        status: l.stage,
        badgeColor: 'sky',
        details: l,
      });

      // Activities for this lead
      const leadActs = this.state.activities.filter((a) => a.leadId === l.id);
      leadActs.forEach((a) => {
        timeline.push({
          id: `tl-act-${a.id}`,
          timestamp: a.createdAt,
          type: 'ACTIVITY',
          title: a.title,
          subtitle: a.description,
          status: a.type,
          badgeColor: 'amber',
          actor: a.userName,
          details: a.metadata,
        });
      });
    });

    // 2. Quotations
    const customerQuotes = this.state.quotations.filter((q) => q.customerId === customerId);
    customerQuotes.forEach((q) => {
      timeline.push({
        id: `tl-quo-${q.id}`,
        timestamp: q.createdAt,
        type: 'QUOTATION',
        title: `Quotation Issued: ${q.quotationNumber}`,
        subtitle: `${q.title} • ₹${q.totalAmountInr.toLocaleString('en-IN')}`,
        status: q.status,
        badgeColor: 'indigo',
        actor: q.createdByName,
        details: { totalAmountInr: q.totalAmountInr, validUntil: q.validUntil },
      });
    });

    // 3. Bookings & Services
    const customerBookings = this.state.bookings.filter((b) => b.customerId === customerId);
    customerBookings.forEach((b) => {
      timeline.push({
        id: `tl-bkg-${b.id}`,
        timestamp: b.createdAt,
        type: 'BOOKING',
        title: `Booking Established: ${b.bookingReference}`,
        subtitle: `${b.serviceType} • Total: ₹${b.totalAmountInr.toLocaleString('en-IN')} (Paid: ₹${(b.paidAmountInr || 0).toLocaleString('en-IN')})`,
        status: b.status,
        badgeColor: 'emerald',
        actor: b.managedByName,
        details: b,
      });

      // Service components for this booking
      const services = this.state.bookingServices.filter((s) => s.bookingId === b.id);
      services.forEach((s) => {
        timeline.push({
          id: `tl-srv-${s.id}`,
          timestamp: s.updatedAt || s.createdAt,
          type: 'SERVICE',
          title: `${s.serviceCategory} Milestone: ${s.serviceName}`,
          subtitle: `Reference: ${s.customerConfirmationRef || s.internalReference || 'Pending'}`,
          status: s.status,
          badgeColor: 'purple',
          actor: s.responsibleUserName,
          details: s,
        });
      });
    });

    // 4. Payments
    const customerPayments = this.state.payments.filter((p) => p.customerId === customerId);
    customerPayments.forEach((p) => {
      timeline.push({
        id: `tl-pay-${p.id}`,
        timestamp: p.receivedAt || p.createdAt,
        type: 'PAYMENT',
        title: `Payment Received: ₹${p.amountInr.toLocaleString('en-IN')}`,
        subtitle: `${p.paymentMethod} • Ref: ${p.paymentReference} (Booking: ${p.bookingReference})`,
        status: p.paymentStatus,
        badgeColor: 'emerald',
        actor: p.recordedByName,
        details: p,
      });
    });

    // 5. Communications
    const customerComms = this.state.communicationLogs.filter((c) => c.customerId === customerId);
    customerComms.forEach((c) => {
      timeline.push({
        id: `tl-com-${c.id}`,
        timestamp: c.createdAt,
        type: 'COMMUNICATION',
        title: `${c.channel} Notification: ${c.templateTitle}`,
        subtitle: c.content,
        status: c.deliveryStatus,
        badgeColor: c.deliveryStatus === 'FAILED' ? 'rose' : 'teal',
        actor: c.senderUserName,
        details: c,
      });
    });

    // Sort descending by timestamp
    return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLogRecord[] {
    return [...this.state.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addAuditLog(item: Omit<AuditLogRecord, 'id' | 'createdAt'>): AuditLogRecord {
    const log: AuditLogRecord = {
      ...item,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
    this.persist(this.state);
    return log;
  }

  // --- Package Cost Governance ---
  public getPackageCosts(): PackageCostItem[] {
    return this.state.packageCosts;
  }

  // --- Dashboard Analytics ---
  public getDashboardMetrics() {
    const totalLeads = this.state.leads.filter((l) => !l.isDeleted).length;
    const requestsCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'REQUESTS').length;
    const generalCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'GENERAL').length;
    const priorityCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'PRIORITY').length;
    const convertedCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'CONVERTED').length;
    const closedCount = this.state.leads.filter((l) => !l.isDeleted && l.stage === 'CLOSED').length;

    const flightsCount = this.state.leads.filter((l) => !l.isDeleted && l.serviceType === 'FLIGHT').length;
    const packagesCount = this.state.leads.filter((l) => !l.isDeleted && l.serviceType === 'PACKAGE').length;
    const visaCount = this.state.leads.filter((l) => !l.isDeleted && l.serviceType === 'VISA').length;

    const pendingFollowUps = this.state.followUps.filter((f) => f.status === 'PENDING').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

    return {
      totalLeads,
      requestsCount,
      generalCount,
      priorityCount,
      convertedCount,
      closedCount,
      flightsCount,
      packagesCount,
      visaCount,
      pendingFollowUps,
      conversionRate,
      recentActivities: this.state.activities.slice(0, 10),
    };
  }
}

// Global Singleton for Hot Reloading in Next.js
const globalForCrm = globalThis as unknown as { crmRepo?: CrmRepository };
export const crmRepo = globalForCrm.crmRepo || new CrmRepository();
if (process.env.NODE_ENV !== 'production') globalForCrm.crmRepo = crmRepo;

