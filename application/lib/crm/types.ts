import { ServiceTypeCode, PipelineStageCode, PriorityLevelCode, UserRoleCode } from '../auth/types';

export interface CustomerRecord {
  id: string;
  fullName: string;
  email: string | null;
  phoneCountryCode: string;
  phoneNumber: string;
  normalizedPhone: string;
  normalizedEmail: string | null;
  city?: string;
  duplicateWarning: boolean;
  duplicateNotes?: string;
  mergedIntoCustomerId?: string | null;
  mergedAt?: string | null;
  mergedByUserId?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlightEnquiryData {
  tripType: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
  originAirport: string;
  destinationAirport: string;
  departureDate: string;
  returnDate?: string | null;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  specialRequirements?: string;
  segments?: Array<{
    segmentOrder: number;
    originAirport: string;
    destinationAirport: string;
    departureDate: string;
  }>;
}

export interface PackageEnquiryData {
  packageSlug: string;
  packageName: string;
  hotelTier: 'STANDARD' | 'DELUXE' | 'SUPER_DELUXE' | 'PREMIUM' | 'LUXURY';
  configCode?: string;
  adultsCount: number;
  childrenWithBedCount: number;
  childrenNoBedCount: number;
  roomsCount: number;
  preferredTravelDate?: string | null;
  includeHouseboatUpgrade: boolean;
  includeMealPlan: boolean;
  includeAthirapillyTrip: boolean;
  includeKanyakumariTrip: boolean;
  pricingStatus: 'EXACT_MATCH' | 'CUSTOM_QUOTATION_REQUIRED' | 'PRICE_UNAVAILABLE';
  quotedUnitPriceInr: number | null;
  quotedTotalPriceInr: number | null;
  vehicleAssigned?: string | null;
  notes?: string[];
}

export interface VisaEnquiryData {
  destinationCountry: string;
  visaCategory: 'TOURIST' | 'BUSINESS' | 'STUDENT' | 'WORK' | 'TRANSIT' | 'OTHER';
  travelPurpose?: string;
  applicantNationality: string;
  residenceCountry: string;
  plannedTravelDate?: string | null;
  stayDurationDays?: number | null;
  applicantCount: number;
  specialCircumstances?: string;
}

export interface LeadRecord {
  id: string;
  referenceId: string; // "FLT-...", "PKG-...", "VIS-..."
  serviceType: ServiceTypeCode;
  stage: PipelineStageCode;
  priorityLevel: PriorityLevelCode;
  source: string;
  customerId: string;
  assignedUserId: string | null;
  flightDetail?: FlightEnquiryData;
  packageDetail?: PackageEnquiryData;
  visaDetail?: VisaEnquiryData;
  closeReason?: string | null;
  closedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | 'NOTE'
  | 'CALL'
  | 'EMAIL'
  | 'WHATSAPP_CLICK'
  | 'STAGE_CHANGE'
  | 'ASSIGNMENT'
  | 'QUOTATION_CREATED'
  | 'QUOTATION'
  | 'PAYMENT'
  | 'STATUS_CHANGE';

export interface LeadActivityRecord {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: {
    callDurationSeconds?: number;
    callOutcome?: 'CONNECTED' | 'BUSY' | 'UNANSWERED' | 'CALLBACK_REQUESTED';
    emailSubject?: string;
    whatsappStatus?: 'CLICK_TO_CHAT_TRIGGERED'; // STRICT RULE: Never falsely 'DELIVERED'
    fromStage?: PipelineStageCode;
    toStage?: PipelineStageCode;
    previousAssignee?: string | null;
    newAssignee?: string | null;
    quotationNumber?: string;
    bookingReference?: string;
    totalAmountInr?: number;
    paymentReference?: string;
    balanceAmountInr?: number;
    amountInr?: number;
    status?: string;
    channel?: string;
    deliveryStatus?: string;
    templateKey?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface FollowUpRecord {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  scheduledAt: string; // ISO date string
  note: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  completedAt?: string | null;
  createdAt: string;
}

export interface QuotationRecord {
  id: string;
  quotationNumber: string; // "VH-QUO-202611-001"
  leadId: string;
  customerId: string;
  createdByUserId: string;
  createdByName: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'SUPERSEDED';
  title: string;
  subtotalInr: number;
  taxesInr: number;
  discountInr: number;
  totalAmountInr: number;
  supplierNetCostInr?: number; // Restricted to Super Admin / Manager
  validUntil: string;
  terms: string;
  inclusions?: string[];
  exclusions?: string[];
  internalNotes?: string;
  customerNotes?: string;
  immutableSnapshotJson?: string;
  sentAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  lineItems: Array<{
    itemOrder: number;
    description: string;
    serviceCategory: string;
    quantity: number;
    unitPriceInr: number;
    supplierCostInr?: number;
    totalAmountInr: number;
  }>;
  createdAt: string;
}

// ----------------------------------------------------
// PHASE 3: BOOKINGS, SERVICES, PAYMENTS & COMMUNICATIONS
// ----------------------------------------------------

export type FlightServiceStatus =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'PENDING_CONFIRMATION'
  | 'RESERVED_TICKETED'
  | 'CANCELLED'
  | 'AMENDED';

export type HotelServiceStatus =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'VOUCHER_ISSUED'
  | 'CANCELLED';

export type VisaServiceStatus =
  | 'ENQUIRY_RECEIVED'
  | 'DOCUMENTS_REQUESTED'
  | 'DOCUMENTS_RECEIVED'
  | 'APPLICATION_PREPARATION'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'DECISION_RECEIVED'
  | 'COMPLETED';

export type TransferServiceStatus =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface BookingServiceComponent {
  id: string;
  bookingId: string;
  serviceCategory: 'FLIGHT' | 'HOTEL' | 'VISA' | 'TRANSFER' | 'CRUISE' | 'INSURANCE' | 'OTHER';
  serviceName: string;
  supplierName?: string;
  internalReference?: string;
  customerConfirmationRef?: string;
  status: string; // Typed per category
  startDate?: string;
  endDate?: string;
  responsibleUserId: string;
  responsibleUserName: string;
  notes?: string;
  documentRefs?: string[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethodCode = 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'CASH' | 'CHEQUE' | 'OTHER';
export type PaymentStatusCode = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  paymentReference: string; // e.g. "VH-PAY-202611-0001"
  bookingId: string;
  bookingReference: string;
  customerId: string;
  customerName: string;
  amountInr: number;
  paymentMethod: PaymentMethodCode;
  bankTransactionRef?: string;
  upiRef?: string;
  chequeDetails?: string;
  paymentStatus: PaymentStatusCode;
  receivedAt: string;
  refundAmountInr?: number;
  refundReference?: string;
  refundedAt?: string;
  internalNotes?: string;
  recordedByUserId: string;
  recordedByName: string;
  createdAt: string;
}

export type CommunicationChannel = 'EMAIL' | 'WHATSAPP';

export type CommunicationDeliveryStatus =
  | 'RECORD_CREATED'
  | 'SEND_INITIATED'
  | 'PROVIDER_ACCEPTED'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'CLICK_TO_CHAT_TRIGGERED';

export type UpdateCategory =
  | 'WELCOME'
  | 'QUOTATION_PREPARED'
  | 'FLIGHT_REQUESTED'
  | 'FLIGHT_CONFIRMED'
  | 'HOTEL_REQUESTED'
  | 'HOTEL_CONFIRMED'
  | 'VISA_DOCS_REQUIRED'
  | 'VISA_SUBMITTED'
  | 'ITINERARY_PREPARED'
  | 'DOCUMENTS_SHARED'
  | 'BOOKING_CONFIRMATION'
  | 'CUSTOM_MESSAGE';

export interface CommunicationLogRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerContact: string; // email or phone
  leadId?: string | null;
  bookingId?: string | null;
  quotationId?: string | null;
  senderUserId: string;
  senderUserName: string;
  templateKey: UpdateCategory;
  templateTitle: string;
  channel: CommunicationChannel;
  subject?: string;
  content: string;
  providerRef?: string;
  deliveryStatus: CommunicationDeliveryStatus;
  errorDetails?: string | null;
  createdAt: string;
  sentAt?: string | null;
  deliveredAt?: string | null;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface PackageCostItem {
  id: string;
  packageCode: string;
  packageName: string;
  hotelTier: string;
  vehicleOption: string;
  paxCount: number;
  supplierCostInr: number;
  sourceRackRateInr: number;
  varniSellingPriceInr: number;
  marginAmountInr: number;
  marginPercent: number;
  seasonValidity: string;
  approvalStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'SUPERSEDED';
}

// ----------------------------------------------------
// PHASE 2.1: BOOKINGS & GOOGLE SHEETS LIVE SYNC
// ----------------------------------------------------

export interface BookingRecord {
  id: string;
  bookingReference: string; // e.g. "VH-BKG-202611-001"
  customerId: string;
  customerName: string;
  serviceType: ServiceTypeCode;
  leadId: string | null;
  managedByUserId: string;
  managedByName: string;
  travelStartDate: string;
  travelEndDate: string;
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalAmountInr: number;
  paidAmountInr: number;
  balanceAmountInr: number;
  createdAt: string;
  updatedAt: string;
}

export type SyncEventType =
  | 'LEAD_CREATED'
  | 'LEAD_UPDATED'
  | 'STAGE_CHANGED'
  | 'ASSIGNMENT_CHANGED'
  | 'FOLLOW_UP_CREATED'
  | 'FOLLOW_UP_UPDATED'
  | 'BOOKING_CREATED'
  | 'BOOKING_STATUS_CHANGED'
  | 'QUOTATION_CREATED'
  | 'QUOTATION_UPDATED'
  | 'RECONCILIATION_FULL';

export type SyncTargetTab = 'ALL_LEADS' | 'QUOTATIONS' | 'FOLLOW_UPS' | 'BOOKINGS' | 'BUSINESS_SUMMARY';

export interface SyncJobRecord {
  id: string;
  eventType: SyncEventType;
  targetTab: SyncTargetTab;
  entityId: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  maxRetries: number;
  error?: string | null;
  scheduledAt: string;
  processedAt?: string | null;
  createdAt: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  clientEmail: string;
  hasPrivateKey: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSuccessfulSyncAt: string | null;
  lastSyncError: string | null;
  totalSyncedEvents: number;
  activeViewerEmail: string; // "neel@varniholidays.com"
  webhookUrl?: string | null;
}

