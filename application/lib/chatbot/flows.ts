/**
 * VARNI HOLIDAYS - Rule-Based Chatbot Conversation Flows
 * 
 * Clean, extensible flow architecture for all 5 core service categories.
 * Completely deterministic and rule-based (zero third-party AI APIs).
 */

import { FlowStep } from './types';
import { CHATBOT_CONFIG } from './config';

export const CHATBOT_FLOW_STEPS: Record<string, FlowStep> = {
  // =========================================================================
  // 1. WELCOME STEP
  // =========================================================================
  welcome: {
    id: 'welcome',
    botMessage: CHATBOT_CONFIG.welcomeMessage,
    inputType: 'options',
    options: CHATBOT_CONFIG.initialOptions,
  },

  // =========================================================================
  // 2. FLIGHT BOOKINGS FLOW
  // =========================================================================
  flight_trip_type: {
    id: 'flight_trip_type',
    serviceCategory: 'FLIGHT',
    summaryLabel: 'Trip Type',
    botMessage: 'What type of flight journey are you planning?',
    inputType: 'options',
    options: [
      { label: '➡️ One Way', value: 'One Way' },
      { label: '🔁 Round Trip', value: 'Round Trip' },
      { label: '🔀 Multi-City / Connecting', value: 'Multi-City' },
    ],
    nextStepId: 'flight_sector',
  },

  flight_sector: {
    id: 'flight_sector',
    serviceCategory: 'FLIGHT',
    summaryLabel: 'Sector / Route',
    botMessage: 'Where would you like to fly from and to? You can choose a popular route or type your own cities below:',
    inputType: 'text',
    inputPlaceholder: 'e.g. Ahmedabad (AMD) to London Heathrow (LHR)',
    options: [
      { label: 'Ahmedabad (AMD) ➔ Dubai (DXB)', value: 'Ahmedabad (AMD) to Dubai (DXB)' },
      { label: 'Mumbai (BOM) ➔ London (LHR)', value: 'Mumbai (BOM) to London Heathrow (LHR)' },
      { label: 'Delhi (DEL) ➔ Bangkok (BKK)', value: 'Delhi (DEL) to Bangkok (BKK)' },
      { label: 'Ahmedabad (AMD) ➔ Mumbai (BOM)', value: 'Ahmedabad (AMD) to Mumbai (BOM)' },
      { label: 'Ahmedabad (AMD) ➔ Singapore (SIN)', value: 'Ahmedabad (AMD) to Singapore (SIN)' },
    ],
    nextStepId: 'flight_dates',
  },

  flight_dates: {
    id: 'flight_dates',
    serviceCategory: 'FLIGHT',
    summaryLabel: 'Travel Dates',
    botMessage: 'When are you planning to travel?',
    inputType: 'text',
    inputPlaceholder: 'e.g. 15th December 2026 or Next Month',
    options: [
      { label: 'Within next 7 days (Urgent)', value: 'Within next 7 days' },
      { label: 'This Month', value: 'This Month' },
      { label: 'Next Month', value: 'Next Month' },
      { label: 'After 2-3 Months', value: 'After 2-3 Months' },
    ],
    nextStepId: 'flight_cabin',
  },

  flight_cabin: {
    id: 'flight_cabin',
    serviceCategory: 'FLIGHT',
    summaryLabel: 'Cabin Class',
    botMessage: 'Which cabin class do you prefer for this journey?',
    inputType: 'options',
    options: [
      { label: 'Economy Class', value: 'Economy Class' },
      { label: 'Premium Economy', value: 'Premium Economy' },
      { label: 'Business Class', value: 'Business Class' },
    ],
    nextStepId: 'flight_passengers',
  },

  flight_passengers: {
    id: 'flight_passengers',
    serviceCategory: 'FLIGHT',
    summaryLabel: 'Passengers',
    botMessage: 'How many passengers will be traveling?',
    inputType: 'options',
    options: [
      { label: '👤 1 Solo Traveler', value: '1 Passenger' },
      { label: '👥 2 Passengers', value: '2 Passengers' },
      { label: '👨‍👩‍👦 Family (3 - 4 Travelers)', value: '3 - 4 Passengers (Family)' },
      { label: '👥 Group (5+ Travelers)', value: '5+ Passengers (Group)' },
    ],
    nextStepId: 'collect_customer_details',
  },

  // =========================================================================
  // 3. HOLIDAY PACKAGES FLOW
  // =========================================================================
  package_destination: {
    id: 'package_destination',
    serviceCategory: 'PACKAGE',
    summaryLabel: 'Destination',
    botMessage: 'Which holiday destination would you love to explore? Select one below or type your dream location:',
    inputType: 'text',
    inputPlaceholder: 'e.g. Switzerland, Maldives, Bali, Kashmir...',
    options: [
      { label: '🌴 Kerala (Munnar, Alleppey)', value: 'Kerala (Gods Own Country)' },
      { label: '🏔️ Kashmir Valley (Srinagar, Gulmarg)', value: 'Kashmir Valley' },
      { label: '🏰 Royal Rajasthan (Jaipur, Udaipur)', value: 'Rajasthan Royal Heritage' },
      { label: '🏙️ Dubai & Abu Dhabi', value: 'Dubai & Abu Dhabi' },
      { label: '⛰️ Switzerland & Europe', value: 'Europe & Swiss Alps' },
      { label: '🏝️ Southeast Asia (Bali, Thailand, Vietnam)', value: 'Southeast Asia' },
    ],
    nextStepId: 'package_duration',
  },

  package_duration: {
    id: 'package_duration',
    serviceCategory: 'PACKAGE',
    summaryLabel: 'Tour Duration',
    botMessage: 'How many days would you like your holiday package to be?',
    inputType: 'options',
    options: [
      { label: '4 to 5 Days (Short Getaway)', value: '4 to 5 Days' },
      { label: '6 to 7 Days (Popular Week)', value: '6 to 7 Days' },
      { label: '8 to 10 Days (Relaxed Tour)', value: '8 to 10 Days' },
      { label: '10+ Days (Comprehensive Vacation)', value: '10+ Days' },
    ],
    nextStepId: 'package_timeframe',
  },

  package_timeframe: {
    id: 'package_timeframe',
    serviceCategory: 'PACKAGE',
    summaryLabel: 'Travel Timeframe',
    botMessage: 'When are you planning to take this holiday?',
    inputType: 'options',
    options: [
      { label: 'Upcoming 30 Days', value: 'Upcoming 30 Days' },
      { label: 'Next 2 - 3 Months', value: 'Next 2 - 3 Months' },
      { label: 'Holiday / Festival Season', value: 'Holiday / Festival Season' },
      { label: 'Exploring Options & Pricing', value: 'Exploring Options' },
    ],
    nextStepId: 'package_travelers',
  },

  package_travelers: {
    id: 'package_travelers',
    serviceCategory: 'PACKAGE',
    summaryLabel: 'Traveler Group',
    botMessage: 'Who are you traveling with?',
    inputType: 'options',
    options: [
      { label: '👩‍❤️‍👨 Couple / Honeymoon', value: 'Couple / Honeymoon' },
      { label: '👨‍👩‍👧‍👦 Family with Kids', value: 'Family with Kids' },
      { label: '🧑‍🤝‍🧑 Group of Friends', value: 'Group of Friends' },
      { label: '👴 Senior Citizens Tour', value: 'Senior Citizens Group' },
    ],
    nextStepId: 'collect_customer_details',
  },

  // =========================================================================
  // 4. HOTEL BOOKINGS FLOW
  // =========================================================================
  hotel_destination: {
    id: 'hotel_destination',
    serviceCategory: 'GENERAL',
    summaryLabel: 'Hotel City / Area',
    botMessage: 'In which city or destination do you need hotel accommodation? Select or type below:',
    inputType: 'text',
    inputPlaceholder: 'e.g. Dubai Downtown, South Mumbai, Goa, London...',
    options: [
      { label: 'Dubai (Downtown / Marina)', value: 'Dubai, UAE' },
      { label: 'Goa (North / South Beach)', value: 'Goa' },
      { label: 'Mumbai (Bandra / Airport)', value: 'Mumbai' },
      { label: 'London (Central / West End)', value: 'London, UK' },
      { label: 'Singapore (Marina Bay / Orchard)', value: 'Singapore' },
    ],
    nextStepId: 'hotel_tier',
  },

  hotel_tier: {
    id: 'hotel_tier',
    serviceCategory: 'GENERAL',
    summaryLabel: 'Preferred Hotel Tier',
    botMessage: 'What tier of hotel stay do you prefer?',
    inputType: 'options',
    options: [
      { label: '⭐⭐⭐⭐⭐ 5-Star Luxury Resort', value: '5-Star Luxury Resort' },
      { label: '⭐⭐⭐⭐ 4-Star Premium / Deluxe', value: '4-Star Premium Deluxe' },
      { label: '⭐⭐⭐ 3-Star Comfortable Stay', value: '3-Star Standard' },
      { label: '🏰 Heritage / Boutique Property', value: 'Heritage / Boutique' },
    ],
    nextStepId: 'hotel_dates',
  },

  hotel_dates: {
    id: 'hotel_dates',
    serviceCategory: 'GENERAL',
    summaryLabel: 'Check-in Timeline',
    botMessage: 'What are your tentative check-in and check-out dates?',
    inputType: 'text',
    inputPlaceholder: 'e.g. 10th - 14th Dec 2026 or Next Weekend',
    options: [
      { label: 'Upcoming Weekend', value: 'Upcoming Weekend' },
      { label: 'Within next 2 weeks', value: 'Within next 2 weeks' },
      { label: 'Next Month', value: 'Next Month' },
      { label: 'Looking for best weekend rates', value: 'Flexible Weekend Dates' },
    ],
    nextStepId: 'hotel_rooms',
  },

  hotel_rooms: {
    id: 'hotel_rooms',
    serviceCategory: 'GENERAL',
    summaryLabel: 'Rooms & Guests',
    botMessage: 'How many rooms and guests will be staying?',
    inputType: 'options',
    options: [
      { label: '1 Room (1 - 2 Adults)', value: '1 Room (1-2 Adults)' },
      { label: '2 Rooms (3 - 4 Adults)', value: '2 Rooms (3-4 Adults)' },
      { label: 'Family Suite with Kids', value: 'Family Suite' },
      { label: 'Multiple Rooms (Group Booking)', value: 'Multiple Rooms (Group)' },
    ],
    nextStepId: 'collect_customer_details',
  },

  // =========================================================================
  // 5. VISA ASSISTANCE FLOW
  // =========================================================================
  visa_destination: {
    id: 'visa_destination',
    serviceCategory: 'VISA',
    summaryLabel: 'Visa Country',
    botMessage: 'Which country do you need visa consultation or application assistance for?',
    inputType: 'text',
    inputPlaceholder: 'e.g. Schengen (France/Swiss), UK, USA, Dubai...',
    options: [
      { label: '🇪🇺 Schengen Countries (Europe)', value: 'Schengen (Europe)' },
      { label: '🇬🇧 United Kingdom (UK Visitor)', value: 'United Kingdom' },
      { label: '🇺🇸 United States (B1/B2 Visa)', value: 'United States' },
      { label: '🇦🇪 Dubai / UAE Tourist Visa', value: 'Dubai / UAE' },
      { label: '🇸🇬 Singapore & Malaysia', value: 'Singapore / Malaysia' },
      { label: '🇨🇦 Canada / Australia', value: 'Canada / Australia' },
    ],
    nextStepId: 'visa_category',
  },

  visa_category: {
    id: 'visa_category',
    serviceCategory: 'VISA',
    summaryLabel: 'Visa Type',
    botMessage: 'What type of visa do you require?',
    inputType: 'options',
    options: [
      { label: '🏖️ Tourist / Holiday Visa', value: 'Tourist / Holiday Visa' },
      { label: '💼 Business / Conference Visa', value: 'Business Travel Visa' },
      { label: '👨‍👩‍👧 Family / Friend Visit Visa', value: 'Family Visit Visa' },
      { label: '✈️ Transit / Short Stay', value: 'Transit Visa' },
    ],
    nextStepId: 'visa_timeline',
  },

  visa_timeline: {
    id: 'visa_timeline',
    serviceCategory: 'VISA',
    summaryLabel: 'Application Urgency',
    botMessage: 'When do you plan to travel? (Visa processing timelines vary by consulate)',
    inputType: 'options',
    options: [
      { label: '⚡ Urgent (Traveling in 2 - 3 weeks)', value: 'Urgent (Within 2-3 weeks)' },
      { label: '📅 Within next 1 - 2 Months', value: 'Within next 1-2 Months' },
      { label: '⏳ Planning ahead (3+ Months)', value: 'Planning Ahead (3+ Months)' },
    ],
    nextStepId: 'collect_customer_details',
  },

  // =========================================================================
  // 6. OTHER TRAVEL ENQUIRIES FLOW
  // =========================================================================
  other_topic: {
    id: 'other_topic',
    serviceCategory: 'CUSTOM_HOLIDAY',
    summaryLabel: 'Enquiry Service',
    botMessage: 'How can our travel team assist you today? Please choose an enquiry topic below:',
    inputType: 'options',
    options: [
      { label: '🗺️ Custom Tailor-made Itinerary', value: 'Custom Tailor-made Itinerary' },
      { label: '🛡️ International Travel Insurance', value: 'Overseas Travel Insurance' },
      { label: '🏢 Corporate / MICE Travel', value: 'Corporate / MICE Travel' },
      { label: '👥 NRI & Family Group Tours', value: 'NRI & Family Group Tours' },
      { label: '📞 Speak with Anand Travel Consultant', value: 'General Consultation' },
    ],
    nextStepId: 'other_details',
  },

  other_details: {
    id: 'other_details',
    serviceCategory: 'CUSTOM_HOLIDAY',
    summaryLabel: 'Specific Requirements',
    botMessage: 'Please provide a brief outline of your travel plan or specific questions:',
    inputType: 'text',
    inputPlaceholder: 'e.g. Planning a 12-person family tour to Switzerland next summer, need hotels and Swiss Pass...',
    options: [
      { label: 'Need custom quote with day-wise itinerary', value: 'Need custom quote with day-wise itinerary' },
      { label: 'Need urgent ticket/visa guidance', value: 'Need urgent guidance' },
      { label: 'Request callback from senior consultant', value: 'Request callback from senior consultant' },
    ],
    nextStepId: 'collect_customer_details',
  },

  // =========================================================================
  // 7. COLLECT CUSTOMER CONTACT DETAILS
  // =========================================================================
  collect_customer_details: {
    id: 'collect_customer_details',
    botMessage: 'Wonderful! To prepare your personalized options and connect with you directly, please enter your contact details below:',
    inputType: 'customer_form',
    nextStepId: 'review_enquiry',
  },

  // =========================================================================
  // 8. REVIEW ENQUIRY DETAILS
  // =========================================================================
  review_enquiry: {
    id: 'review_enquiry',
    botMessage: 'Please review your enquiry details below before submitting to our Anand travel desk:',
    inputType: 'review',
  },
};
