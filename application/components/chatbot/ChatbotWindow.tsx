'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Minus,
  RotateCcw,
  Send,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  User,
  Mail,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { CHATBOT_CONFIG } from '@/lib/chatbot/config';
import { CHATBOT_FLOW_STEPS } from '@/lib/chatbot/flows';
import {
  ChatbotMessage,
  ChatbotOption,
  CustomerEnquiryDetails,
  ChatbotSubmissionResult,
} from '@/lib/chatbot/types';
import { COUNTRY_CODES, validatePhoneNumber } from '@/lib/validation/phone';
import { submitChatbotEnquiryAction } from '@/app/actions/chatbot';

interface ChatbotWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export default function ChatbotWindow({
  isOpen,
  onClose,
  onMinimize,
}: ChatbotWindowProps) {
  // Navigation & Step tracking
  const [currentStepId, setCurrentStepId] = useState<string>('welcome');
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  const [serviceCategory, setServiceCategory] = useState<
    'FLIGHT' | 'PACKAGE' | 'VISA' | 'CUSTOM_HOLIDAY' | 'GENERAL'
  >('GENERAL');
  const [serviceTitle, setServiceTitle] = useState<string>('Travel Enquiry');
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});

  // Messages list
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: CHATBOT_CONFIG.welcomeMessage,
      timestamp: formatTime(new Date()),
      options: CHATBOT_CONFIG.initialOptions,
      type: 'options',
    },
  ]);

  // Loading & Typing state
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ChatbotSubmissionResult | null>(null);

  // Form input states
  const [inputText, setInputText] = useState<string>('');
  const [customerForm, setCustomerForm] = useState<CustomerEnquiryDetails>({
    fullName: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    email: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper for nice timestamp
  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Auto-scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isBotTyping, isOpen, currentStepId]);

  // Restart conversation handler
  const handleRestart = () => {
    setCurrentStepId('welcome');
    setStepHistory([]);
    setServiceCategory('GENERAL');
    setServiceTitle('Travel Enquiry');
    setCollectedData({});
    setSubmissionResult(null);
    setFormErrors({});
    setCustomerForm({
      fullName: '',
      phoneCountryCode: '+91',
      phoneNumber: '',
      email: '',
      notes: '',
    });
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'bot',
        text: CHATBOT_CONFIG.welcomeMessage,
        timestamp: formatTime(new Date()),
        options: CHATBOT_CONFIG.initialOptions,
        type: 'options',
      },
    ]);
  };

  // Back button handler to step back one question
  const handleBack = () => {
    if (stepHistory.length === 0) return;
    const previousStepId = stepHistory[stepHistory.length - 1];
    setStepHistory((prev) => prev.slice(0, -1));
    setCurrentStepId(previousStepId);

    const prevStep = CHATBOT_FLOW_STEPS[previousStepId];
    if (prevStep) {
      const promptText =
        typeof prevStep.botMessage === 'function'
          ? prevStep.botMessage(collectedData)
          : prevStep.botMessage;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-back-${Date.now()}`,
          sender: 'bot',
          text: `Going back: ${promptText}`,
          timestamp: formatTime(new Date()),
          options: prevStep.options,
          type: prevStep.inputType === 'customer_form' ? 'customer_form' : 'options',
        },
      ]);
    }
  };

  // Step transition helper
  const advanceToStep = (nextId: string, userResponseText?: string) => {
    if (userResponseText) {
      // Append user's message
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: 'user',
          text: userResponseText,
          timestamp: formatTime(new Date()),
        },
      ]);
    }

    // Save step in history
    setStepHistory((prev) => [...prev, currentStepId]);
    setCurrentStepId(nextId);

    const nextStep = CHATBOT_FLOW_STEPS[nextId];
    if (!nextStep) return;

    if (nextStep.serviceCategory) {
      setServiceCategory(nextStep.serviceCategory);
    }

    // Humanized typing simulation
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      const promptText =
        typeof nextStep.botMessage === 'function'
          ? nextStep.botMessage(collectedData)
          : nextStep.botMessage;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: promptText,
          timestamp: formatTime(new Date()),
          options: nextStep.options,
          type:
            nextStep.inputType === 'customer_form'
              ? 'customer_form'
              : nextStep.inputType === 'review'
              ? 'review'
              : 'options',
        },
      ]);
    }, CHATBOT_CONFIG.typingDelayMs);
  };

  // Option click handler
  const handleOptionSelect = (option: ChatbotOption) => {
    // 1. Check if clicking one of the initial 5 options
    if (currentStepId === 'welcome') {
      let firstStepId = 'flight_trip_type';
      let cat: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'CUSTOM_HOLIDAY' | 'GENERAL' = 'FLIGHT';
      let title = 'Flight Bookings';

      if (option.value === 'flight') {
        firstStepId = 'flight_trip_type';
        cat = 'FLIGHT';
        title = 'Flight Bookings';
      } else if (option.value === 'package') {
        firstStepId = 'package_destination';
        cat = 'PACKAGE';
        title = 'Holiday Packages';
      } else if (option.value === 'hotel') {
        firstStepId = 'hotel_destination';
        cat = 'GENERAL';
        title = 'Hotel Bookings';
      } else if (option.value === 'visa') {
        firstStepId = 'visa_country';
        cat = 'VISA';
        title = 'Visa Assistance';
      } else if (option.value === 'other') {
        firstStepId = 'other_topic';
        cat = 'CUSTOM_HOLIDAY';
        title = 'Other Travel Enquiries';
      }

      setServiceCategory(cat);
      setServiceTitle(title);
      setCollectedData({ 'Service Category': title });
      advanceToStep(firstStepId, option.label);
      return;
    }

    // 2. Normal flow step option
    const currentStep = CHATBOT_FLOW_STEPS[currentStepId];
    if (!currentStep) return;

    if (currentStep.summaryLabel) {
      setCollectedData((prev) => ({
        ...prev,
        [currentStep.summaryLabel!]: option.label,
      }));
    }

    // Determine next step
    let nextStepId = 'collect_customer_details';
    if (typeof currentStep.nextStepId === 'function') {
      nextStepId = currentStep.nextStepId(option.value, collectedData);
    } else if (typeof currentStep.nextStepId === 'string') {
      nextStepId = currentStep.nextStepId;
    }

    advanceToStep(nextStepId, option.label);
  };

  // Custom text submission handler from footer
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setInputText('');

    const currentStep = CHATBOT_FLOW_STEPS[currentStepId];

    // If current step accepts text
    if (currentStep && currentStep.inputType === 'text') {
      if (currentStep.summaryLabel) {
        setCollectedData((prev) => ({
          ...prev,
          [currentStep.summaryLabel!]: trimmed,
        }));
      }

      let nextStepId = 'collect_customer_details';
      if (typeof currentStep.nextStepId === 'function') {
        nextStepId = currentStep.nextStepId(trimmed, collectedData);
      } else if (typeof currentStep.nextStepId === 'string') {
        nextStepId = currentStep.nextStepId;
      }

      advanceToStep(nextStepId, trimmed);
      return;
    }

    // If user types general text when options are expected, offer rule-based guidance
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: formatTime(new Date()),
      },
    ]);

    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: `Thank you for your message! To help you plan accurately, please choose one of the options below, or share your contact details directly:`,
          timestamp: formatTime(new Date()),
          options: currentStep?.options || CHATBOT_CONFIG.initialOptions,
          type: 'options',
        },
      ]);
    }, CHATBOT_CONFIG.typingDelayMs);
  };

  // Validate and submit customer details form
  const handleCustomerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!customerForm.fullName.trim() || customerForm.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (at least 2 letters).';
    }

    const phoneValidation = validatePhoneNumber(
      customerForm.phoneCountryCode,
      customerForm.phoneNumber
    );
    if (!phoneValidation.isValid) {
      errors.phoneNumber = phoneValidation.error || 'Please enter a valid mobile number.';
    }

    if (customerForm.email && customerForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerForm.email.trim())) {
        errors.email = 'Please enter a valid email address or leave it blank.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Append user confirmation in chat
    const summaryText = `Name: ${customerForm.fullName.trim()}\nPhone: ${customerForm.phoneCountryCode} ${customerForm.phoneNumber.trim()}${
      customerForm.email ? `\nEmail: ${customerForm.email.trim()}` : ''
    }${customerForm.notes ? `\nNotes: ${customerForm.notes.trim()}` : ''}`;

    advanceToStep('review_enquiry', summaryText);
  };

  // Final submission to CRM Server Action
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      const transcript = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
      }));

      const res = await submitChatbotEnquiryAction({
        serviceCategory,
        serviceTitle,
        enquirySummary: collectedData,
        customer: customerForm,
        transcript,
      });

      setSubmissionResult(res);

      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-success-${Date.now()}`,
            sender: 'bot',
            text: CHATBOT_CONFIG.submissionConfirmation,
            timestamp: formatTime(new Date()),
            type: 'success',
            metadata: {
              referenceId: res.referenceId,
            },
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-error-${Date.now()}`,
            sender: 'bot',
            text:
              res.error ||
              'We were unable to process your enquiry automatically. Please connect with our team directly via WhatsApp or phone.',
            timestamp: formatTime(new Date()),
            type: 'error',
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          sender: 'bot',
          text: 'An unexpected connection issue occurred. Please call or WhatsApp our Anand travel desk directly.',
          timestamp: formatTime(new Date()),
          type: 'error',
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentStep = CHATBOT_FLOW_STEPS[currentStepId];
  const isFormStep = currentStepId === 'collect_customer_details';
  const isReviewStep = currentStepId === 'review_enquiry';
  const isCompleted = submissionResult?.success === true;

  return (
    <div
      role="dialog"
      aria-label="Varni Holidays Travel Assistant"
      className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] max-w-[410px] h-[calc(100dvh-90px)] sm:h-[620px] max-h-[640px] flex flex-col bg-white rounded-2xl shadow-[0_20px_50px_rgba(21,54,80,0.22)] border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {/* ================================================================= */}
      {/* 1. HEADER */}
      {/* ================================================================= */}
      <div className="bg-gradient-to-r from-[#153650] via-[#1a4465] to-[#24689B] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0 w-10 h-10 rounded-full bg-white/95 p-1 flex items-center justify-center shadow-inner">
            <Image
              src={CHATBOT_CONFIG.logoUrl}
              alt="Varni Holidays"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
            {/* Live Green Status Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#153650] rounded-full ring-2 ring-emerald-400/40"></span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base tracking-tight truncate leading-tight text-white flex items-center gap-1.5">
              {CHATBOT_CONFIG.brandName}
            </h3>
            <p className="text-[11px] text-slate-200 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {CHATBOT_CONFIG.onlineStatusText}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 shrink-0 text-slate-200">
          <button
            onClick={handleRestart}
            title="Restart conversation"
            aria-label="Restart conversation"
            className="p-1.5 rounded-lg hover:bg-white/15 active:bg-white/20 transition text-slate-200 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onMinimize}
            title="Minimize chat"
            aria-label="Minimize chat"
            className="p-1.5 rounded-lg hover:bg-white/15 active:bg-white/20 transition text-slate-200 hover:text-white"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close chat"
            aria-label="Close chat"
            className="p-1.5 rounded-lg hover:bg-white/15 active:bg-white/20 transition text-slate-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. CHAT STREAM (MESSAGES) */}
      {/* ================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-sm">
        {messages.map((msg, index) => {
          const isBot = msg.sender === 'bot';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm transition-all text-xs sm:text-sm ${
                  isBot
                    ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-sm'
                    : 'bg-[#153650] text-white rounded-tr-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Reference ID Pill if Success */}
                {msg.type === 'success' && msg.metadata?.referenceId && (
                  <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Ref: {msg.metadata.referenceId}
                    </span>
                    <span className="text-[11px] text-slate-500">Saved to CRM</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>

              {/* Options Chips (Only render below latest bot message if active) */}
              {isBot &&
                msg.options &&
                index === messages.length - 1 &&
                !isFormStep &&
                !isReviewStep &&
                !isCompleted && (
                  <div className="mt-2.5 w-full space-y-1.5">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionSelect(opt)}
                        className="w-full text-left px-3.5 py-2.5 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 hover:border-[#153650]/40 text-slate-800 text-xs sm:text-sm font-medium rounded-xl shadow-xs transition flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{opt.label}</span>
                        <span className="text-[#153650] opacity-0 group-hover:opacity-100 transition text-xs font-semibold">
                          ➔
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isBotTyping && (
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-tl-sm w-16 shadow-xs">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}

        {/* =============================================================== */}
        {/* INLINE FORM: CUSTOMER DETAILS */}
        {/* =============================================================== */}
        {isFormStep && !isCompleted && (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3 mt-2">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-[#153650]" />
              <h4 className="text-xs font-semibold text-slate-800">
                Your Contact Information
              </h4>
            </div>

            <form onSubmit={handleCustomerFormSubmit} className="space-y-2.5 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerForm.fullName}
                    onChange={(e) =>
                      setCustomerForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="e.g. Rajesh Patel"
                    className={`w-full px-3 py-2 border rounded-lg outline-none transition text-xs sm:text-sm ${
                      formErrors.fullName
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-slate-300 focus:border-[#153650]'
                    }`}
                  />
                </div>
                {formErrors.fullName && (
                  <p className="text-[11px] text-red-500 mt-0.5">{formErrors.fullName}</p>
                )}
              </div>

              {/* Phone with Country Code */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Mobile / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={customerForm.phoneCountryCode}
                    onChange={(e) =>
                      setCustomerForm((prev) => ({
                        ...prev,
                        phoneCountryCode: e.target.value,
                      }))
                    }
                    className="w-[90px] shrink-0 px-2 py-2 border border-slate-300 bg-slate-50 rounded-lg text-xs font-medium outline-none focus:border-[#153650]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                        {c.flag} {c.dialCode}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    value={customerForm.phoneNumber}
                    onChange={(e) =>
                      setCustomerForm((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder="e.g. 98980 12345"
                    className={`flex-1 px-3 py-2 border rounded-lg outline-none transition text-xs sm:text-sm ${
                      formErrors.phoneNumber
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-slate-300 focus:border-[#153650]'
                    }`}
                  />
                </div>
                {formErrors.phoneNumber && (
                  <p className="text-[11px] text-red-500 mt-0.5">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={customerForm.email || ''}
                  onChange={(e) =>
                    setCustomerForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="e.g. rajesh@example.com"
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition text-xs sm:text-sm ${
                    formErrors.email
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:border-[#153650]'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-red-500 mt-0.5">{formErrors.email}</p>
                )}
              </div>

              {/* Notes / Special Requests */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Travel Notes / Specific Requests{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={customerForm.notes || ''}
                  onChange={(e) =>
                    setCustomerForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Any preferences: veg meals, budget, specific dates, or hotel stars..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-[#153650] transition text-xs"
                />
              </div>

              {/* Submit to review */}
              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 bg-[#153650] hover:bg-[#1a4465] text-white font-medium rounded-lg text-xs sm:text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                Continue to Review
                <span>➔</span>
              </button>
            </form>
          </div>
        )}

        {/* =============================================================== */}
        {/* INLINE CARD: REVIEW ENQUIRY SUMMARY */}
        {/* =============================================================== */}
        {isReviewStep && !isCompleted && (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-3 mt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#153650]" />
                <h4 className="text-xs font-semibold text-slate-800">
                  Enquiry Summary
                </h4>
              </div>
              <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {serviceTitle}
              </span>
            </div>

            {/* Collected Details */}
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
              {Object.entries(collectedData).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">{key}:</span>
                  <span className="font-medium text-slate-800 text-right truncate">
                    {value}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-200 my-1 pt-1 space-y-1">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Traveler:</span>
                  <span className="font-medium text-slate-800">
                    {customerForm.fullName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-medium text-slate-800">
                    {customerForm.phoneCountryCode} {customerForm.phoneNumber}
                  </span>
                </div>
                {customerForm.email && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-800">
                      {customerForm.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-full py-2.5 px-4 bg-[#153650] hover:bg-[#1a4465] text-white font-medium rounded-lg text-xs sm:text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting to Travel Desk...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#E9B95E]" />
                    Submit Enquiry to Travel Desk
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBack}
                className="w-full py-1.5 text-slate-500 hover:text-slate-700 text-xs text-center transition"
              >
                ← Edit details or change options
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* POST-SUBMISSION CONFIRMATION ACTIONS */}
        {/* =============================================================== */}
        {isCompleted && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-3 mt-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enquiry Submitted Successfully</span>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              Our travel specialists in Anand will review your requirements and reach out
              promptly with best options.
            </p>

            <div className="space-y-2 pt-1">
              {/* WhatsApp direct link */}
              <a
                href={CHATBOT_CONFIG.contact.buildWhatsappUrl(submissionResult?.referenceId)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium rounded-lg text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat on WhatsApp Now
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {/* Direct Call */}
              <a
                href={CHATBOT_CONFIG.contact.phoneHref}
                className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 font-medium rounded-lg text-xs border border-slate-300 shadow-xs transition flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#153650]" />
                Call Desk: {CHATBOT_CONFIG.contact.phoneDisplay}
              </a>

              {/* Start new enquiry */}
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-[11px] text-center transition block"
              >
                Start another enquiry
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ================================================================= */}
      {/* 3. FOOTER / INPUT BAR */}
      {/* ================================================================= */}
      <div className="p-3 bg-white border-t border-slate-200/90 shrink-0">
        {!isCompleted && !isFormStep && !isReviewStep && (
          <form onSubmit={handleSendText} className="flex items-center gap-1.5">
            {stepHistory.length > 0 && (
              <button
                type="button"
                onClick={handleBack}
                title="Back to previous question"
                aria-label="Back to previous question"
                className="p-2 text-slate-500 hover:text-[#153650] hover:bg-slate-100 rounded-lg transition shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                currentStep?.inputPlaceholder || 'Type your message or enquiry...'
              }
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#153650] focus:bg-white transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isBotTyping}
              aria-label="Send message"
              className="p-2 bg-[#153650] hover:bg-[#1a4465] text-white rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Small footer privacy & brand trust label */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>🔒 Varni Holidays Official Desk</span>
          <span className="text-[#E9B95E] font-medium">Anand, Gujarat</span>
        </div>
      </div>
    </div>
  );
}
