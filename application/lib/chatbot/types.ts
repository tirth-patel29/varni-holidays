/**
 * VARNI HOLIDAYS - Website Rule-Based Chatbot Types
 */

export type ServiceOptionId =
  | 'flight'
  | 'package'
  | 'hotel'
  | 'visa'
  | 'other';

export interface ChatbotOption {
  label: string;
  value: string;
  icon?: string;
  action?: 'step' | 'submit' | 'restart' | 'link';
  url?: string;
}

export interface ChatbotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  options?: ChatbotOption[];
  isTyping?: boolean;
  type?: 'text' | 'options' | 'customer_form' | 'review' | 'success' | 'error';
  metadata?: Record<string, any>;
}

export interface CustomerEnquiryDetails {
  fullName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email?: string;
  notes?: string;
}

export interface FlowStep {
  id: string;
  botMessage: string | ((collected: Record<string, any>) => string);
  options?: ChatbotOption[];
  inputType?: 'options' | 'text' | 'customer_form' | 'review';
  inputPlaceholder?: string;
  summaryLabel?: string;
  nextStepId?: string | ((value: string, collected: Record<string, any>) => string);
  serviceCategory?: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'CUSTOM_HOLIDAY' | 'GENERAL';
}

export interface ChatbotSubmissionPayload {
  serviceCategory: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'CUSTOM_HOLIDAY' | 'GENERAL';
  serviceTitle: string;
  enquirySummary: Record<string, string>;
  customer: CustomerEnquiryDetails;
  transcript: Array<{
    sender: 'bot' | 'user';
    text: string;
    timestamp: string;
  }>;
}

export interface ChatbotSubmissionResult {
  success: boolean;
  referenceId?: string;
  message?: string;
  error?: string;
  customerId?: string;
  leadId?: string;
}
