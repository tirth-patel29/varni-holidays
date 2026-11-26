/**
 * VARNI HOLIDAYS - WhatsApp Cloud API & AI Chatbot Types
 * Single source of truth for Webhook payloads, conversations, messages, and state machine.
 */

export type WhatsAppConversationStatus =
  | 'BOT_ACTIVE'
  | 'REQUIRES_HUMAN'
  | 'HUMAN_ACTIVE'
  | 'CLOSED';

export type WhatsAppFlowType =
  | 'NONE'
  | 'TOUR_PACKAGE'
  | 'HOTEL'
  | 'VISA'
  | 'BOOKING_LOOKUP'
  | 'HUMAN_REQUEST';

export type WhatsAppMessageDirection = 'INBOUND' | 'OUTBOUND';

export type WhatsAppSenderType = 'CUSTOMER' | 'BOT' | 'HUMAN_AGENT';

export type WhatsAppMessageStatus =
  | 'RECEIVED'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED';

export interface WhatsAppConversationRecord {
  id: string; // e.g. wac-916357050505
  customerPhone: string; // E.164 digits without + (e.g. 916357050505)
  customerName: string;
  customerId?: string | null;
  leadId?: string | null;

  status: WhatsAppConversationStatus;
  currentFlow: WhatsAppFlowType;
  flowStep: string; // e.g. "INITIAL", "SELECT_DESTINATION", "AWAIT_DATES", "AWAIT_PAX", "AWAIT_BUDGET"
  collectedData: Record<string, any>; // Stores accumulated user preferences (destination, dates, party size, etc.)

  assignedUserId: string; // Staff member assigned (defaults to relevant desk or superadmin)
  assignedUserName: string;

  unreadCount: number;
  lastCustomerMessageAt: string | null; // ISO string used to compute 24-hour Meta service window
  lastBotMessageAt: string | null;
  internalNotes: Array<{
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessageRecord {
  id: string; // e.g. wam-1794726...
  conversationId: string;
  metaMessageId?: string | null; // e.g. wamid.HBg...
  direction: WhatsAppMessageDirection;
  senderType: WhatsAppSenderType;
  senderId: string; // phone number or staff user ID
  senderName: string;

  messageType: 'text' | 'interactive' | 'image' | 'document' | 'template' | 'button';
  content: string; // Plain body text or description
  interactiveData?: any; // For button replies, list row selections, or template params
  mediaUrl?: string | null;
  mediaType?: string | null;

  status: WhatsAppMessageStatus;
  errorMessage?: string | null;
  timestamp: string; // ISO string
  rawPayload?: any;
}

export interface WhatsAppWebhookEventRecord {
  id: string;
  metaEventId: string; // Used for deduplication
  eventType: 'message' | 'status';
  fromPhone?: string;
  payload: any;
  processed: boolean;
  processedAt?: string | null;
  error?: string | null;
  receivedAt: string;
}

export interface WhatsAppTemplateRecord {
  id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttonsJson?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
  exampleVariables: string[];
  updatedAt: string;
}

// ----------------------------------------------------
// Meta WhatsApp Cloud API Raw Webhook Structures
// ----------------------------------------------------

export interface MetaWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: 'text' | 'interactive' | 'image' | 'document' | 'button' | 'location' | 'unsupported';
          text?: {
            body: string;
          };
          interactive?: {
            type: 'button_reply' | 'list_reply';
            button_reply?: {
              id: string;
              title: string;
            };
            list_reply?: {
              id: string;
              title: string;
              description?: string;
            };
          };
          image?: {
            id: string;
            mime_type: string;
            sha256?: string;
            caption?: string;
          };
          document?: {
            id: string;
            filename: string;
            mime_type: string;
            sha256?: string;
            caption?: string;
          };
          button?: {
            payload: string;
            text: string;
          };
        }>;
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
          errors?: Array<{
            code: number;
            title: string;
            message?: string;
          }>;
        }>;
      };
      field: string;
    }>;
  }>;
}

// ----------------------------------------------------
// Chatbot Engine Types
// ----------------------------------------------------

export type WhatsAppIntent =
  | 'GREETING'
  | 'TOUR_PACKAGES'
  | 'HOTEL_RESERVATIONS'
  | 'VISA_ASSISTANCE'
  | 'FLIGHT_ENQUIRY'
  | 'EXISTING_BOOKING'
  | 'SPEAK_TO_HUMAN'
  | 'OPT_OUT'
  | 'UNKNOWN';

export interface ChatbotContext {
  conversation: WhatsAppConversationRecord;
  incomingText: string;
  senderPhone: string;
  senderName: string;
  interactiveReplyId?: string;
  mediaType?: string;
}

export interface ChatbotResponsePayload {
  text?: string;
  buttons?: Array<{ id: string; title: string }>;
  headerText?: string;
  footerText?: string;
  list?: {
    buttonText: string;
    sections: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>;
  };
  document?: {
    url: string;
    filename: string;
    caption?: string;
  };
}

// ----------------------------------------------------
// Interactive Conversational Flow Engine Types
// ----------------------------------------------------

export type BotFlowType =
  | 'IDLE'
  | 'PACKAGE_BOOKING'
  | 'FLIGHT_BOOKING'
  | 'VISA_ENQUIRY'
  | 'TRACK_STATUS'
  | 'FAQ_HELP';

export interface WhatsAppSessionData {
  phone: string; // E.164 digits e.g. "916357050505"
  customerName?: string;
  customerEmail?: string;
  flow: BotFlowType;
  step: string;
  data: Record<string, any>;
  lastActivityAt: number;
}

export interface BotIncomingMessage {
  fromPhone: string;
  senderName?: string;
  messageId: string;
  text?: string;
  interactiveType?: 'button_reply' | 'list_reply';
  buttonId?: string;
  buttonTitle?: string;
  listId?: string;
  listTitle?: string;
  timestamp: number;
}

export interface BotQuickButton {
  id: string;
  title: string;
}

export interface BotListSectionItem {
  id: string;
  title: string;
  description?: string;
}

export interface BotListSection {
  title: string;
  rows: BotListSectionItem[];
}

export interface BotOutgoingMessage {
  toPhone: string;
  text: string;
  buttons?: BotQuickButton[];
  list?: {
    buttonText: string;
    title: string;
    sections: BotListSection[];
  };
}

export interface BotProcessingResult {
  reply: BotOutgoingMessage;
  actionTaken?: string;
  leadReferenceId?: string;
  bookingReferenceId?: string;
  sessionState: WhatsAppSessionData;
}
