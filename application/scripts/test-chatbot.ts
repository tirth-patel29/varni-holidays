process.env.NODE_ENV = 'test';

import { prisma } from '../lib/prisma';
import { submitChatbotEnquiryAction } from '../app/actions/chatbot';
import { CHATBOT_CONFIG } from '../lib/chatbot/config';
import { validatePhoneNumber } from '../lib/validation/phone';

async function runChatbotTests() {
  console.log('====================================================');
  console.log('VARNI HOLIDAYS - RULE-BASED CHATBOT TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
      failed++;
    }
  }

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const testPhone = `9825${randomSuffix}`;
  const testEmail = `chatbot.tester.${Date.now()}@varniholidays.test`;

  let createdCustomerId = '';
  let createdLeadId = '';

  try {
    // ----------------------------------------------------
    // Test 1: Configuration & Exact Messages
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Canonical Configuration & Exact Copy ---');
    assert(
      CHATBOT_CONFIG.welcomeMessage.includes('Hello! Welcome to Varni Holidays.'),
      'Welcome message includes exact greeting'
    );
    assert(
      CHATBOT_CONFIG.initialOptions.length === 5,
      'Exactly 5 initial quick-reply service options are configured'
    );
    assert(
      CHATBOT_CONFIG.submissionConfirmation.includes('Thank you for contacting Varni Holidays!'),
      'Submission confirmation has exact required text'
    );
    assert(
      Boolean(CHATBOT_CONFIG.contact.phoneDisplay && CHATBOT_CONFIG.contact.phoneHref),
      'Contact phone is loaded from canonical company config'
    );

    // ----------------------------------------------------
    // Test 2: Input Validation via Action
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Input Validation ---');

    // Missing Name
    const resNoName = await submitChatbotEnquiryAction({
      serviceCategory: 'FLIGHT',
      serviceTitle: 'Flight Bookings',
      enquirySummary: { Route: 'AMD to DXB' },
      customer: {
        fullName: ' ',
        phoneCountryCode: '+91',
        phoneNumber: testPhone,
      },
      transcript: [],
    });
    assert(
      !resNoName.success && resNoName.error?.includes('name'),
      'Rejects empty traveler name'
    );

    // Invalid Phone Number
    const resBadPhone = await submitChatbotEnquiryAction({
      serviceCategory: 'FLIGHT',
      serviceTitle: 'Flight Bookings',
      enquirySummary: { Route: 'AMD to DXB' },
      customer: {
        fullName: 'Test Traveler',
        phoneCountryCode: '+91',
        phoneNumber: '123', // too short for India
      },
      transcript: [],
    });
    assert(
      !resBadPhone.success && resBadPhone.error?.includes('digits'),
      'Rejects invalid phone number'
    );

    // Invalid Email format
    const resBadEmail = await submitChatbotEnquiryAction({
      serviceCategory: 'FLIGHT',
      serviceTitle: 'Flight Bookings',
      enquirySummary: { Route: 'AMD to DXB' },
      customer: {
        fullName: 'Test Traveler',
        phoneCountryCode: '+91',
        phoneNumber: testPhone,
        email: 'invalid-email-address',
      },
      transcript: [],
    });
    assert(
      !resBadEmail.success && resBadEmail.error?.includes('email'),
      'Rejects malformed email address'
    );

    // ----------------------------------------------------
    // Test 3: Successful Chatbot Submission & Lead Creation
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Submission & Lead Creation ---');

    const validSubmission = await submitChatbotEnquiryAction({
      serviceCategory: 'FLIGHT',
      serviceTitle: 'Flight Bookings',
      enquirySummary: {
        'Trip Type': 'Round Trip',
        'Sector / Route': 'Ahmedabad (AMD) to Dubai (DXB)',
        'Travel Dates': 'Next Month',
        'Cabin Class': 'Economy Class',
        Passengers: '2 Passengers',
      },
      customer: {
        fullName: 'Amitbhai Patel',
        phoneCountryCode: '+91',
        phoneNumber: testPhone,
        email: testEmail,
        notes: 'Vegetarian meals preferred on flight',
      },
      transcript: [
        { sender: 'bot', text: CHATBOT_CONFIG.welcomeMessage, timestamp: '10:00 AM' },
        { sender: 'user', text: 'Flight Bookings', timestamp: '10:01 AM' },
        { sender: 'bot', text: 'What type of flight journey are you planning?', timestamp: '10:01 AM' },
        { sender: 'user', text: 'Round Trip', timestamp: '10:02 AM' },
      ],
    });

    assert(validSubmission.success === true, 'Submission action succeeded');
    assert(Boolean(validSubmission.referenceId), `Reference ID generated: ${validSubmission.referenceId}`);
    assert(Boolean(validSubmission.customerId), `Customer ID generated: ${validSubmission.customerId}`);
    assert(Boolean(validSubmission.leadId), `Lead ID generated: ${validSubmission.leadId}`);

    createdCustomerId = validSubmission.customerId || '';
    createdLeadId = validSubmission.leadId || '';

    // Verify in database
    if (createdLeadId) {
      const dbLead = await prisma.lead.findUnique({
        where: { id: createdLeadId },
        include: { customer: true, inboxConversations: true },
      });

      assert(dbLead !== null, 'Lead record persisted in Neon DB');
      assert(dbLead?.source === 'WEBSITE_CHATBOT', `Lead source is correctly 'WEBSITE_CHATBOT' (found: ${dbLead?.source})`);
      assert(dbLead?.stage === 'NEW', `Lead initial stage is 'NEW' (found: ${dbLead?.stage})`);
      assert(dbLead?.serviceType === 'FLIGHT', `Lead serviceType is 'FLIGHT' (found: ${dbLead?.serviceType})`);
      assert(
        dbLead?.internalNotes?.includes('Vegetarian meals'),
        'Internal notes contain user remarks'
      );
      assert(
        dbLead?.internalNotes?.includes('Trip Type: Round Trip'),
        'Internal notes contain enquiry summary'
      );
      assert(
        Array.isArray(dbLead?.inboxConversations) && dbLead.inboxConversations.length > 0,
        'Automatically created & linked InboxConversation for CRM Unified Inbox'
      );
    }

    // ----------------------------------------------------
    // Test 4: Customer Deduplication on Repeated Enquiries
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Customer Deduplication ---');

    const secondSubmission = await submitChatbotEnquiryAction({
      serviceCategory: 'PACKAGE',
      serviceTitle: 'Holiday Packages',
      enquirySummary: {
        Destination: 'Switzerland',
        Duration: '7 - 10 Days',
      },
      customer: {
        fullName: 'Amitbhai Patel',
        phoneCountryCode: '+91',
        phoneNumber: testPhone, // Same phone
        email: testEmail,       // Same email
      },
      transcript: [],
    });

    assert(secondSubmission.success === true, 'Second enquiry submitted successfully');
    assert(
      secondSubmission.customerId === createdCustomerId,
      `Customer deduplication attached new lead to existing Customer ID: ${createdCustomerId}`
    );
    assert(
      secondSubmission.leadId !== createdLeadId,
      `New distinct Lead created for second service request: ${secondSubmission.leadId}`
    );

    // ----------------------------------------------------
    // Test 5: Clean Up Test Records
    // ----------------------------------------------------
    console.log('\n--- 5. Cleanup Test Artifacts ---');
    async function cleanupLead(id?: string) {
      if (!id) return;
      try {
        await prisma.followUp.deleteMany({ where: { leadId: id } });
        await prisma.leadActivity.deleteMany({ where: { leadId: id } });
        const convos = await prisma.inboxConversation.findMany({ where: { leadId: id }, select: { id: true } });
        for (const c of convos) {
          await prisma.inboxMessage.deleteMany({ where: { conversationId: c.id } });
        }
        await prisma.inboxConversation.deleteMany({ where: { leadId: id } });
        await prisma.lead.delete({ where: { id } });
      } catch (e) {
        console.warn(`Cleanup error for lead ${id}:`, e);
      }
    }

    await cleanupLead(secondSubmission.leadId);
    await cleanupLead(createdLeadId);

    if (createdCustomerId) {
      try {
        await prisma.customer.delete({ where: { id: createdCustomerId } });
      } catch (e) {
        console.warn(`Cleanup error for customer ${createdCustomerId}:`, e);
      }
    }
    console.log('Cleaned up test customer & leads successfully.');

  } catch (err: any) {
    console.error('Test run error:', err);
    failed++;
  } finally {
    console.log('\n====================================================');
    console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================\n');
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runChatbotTests();
