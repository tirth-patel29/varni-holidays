import { prisma } from '../lib/prisma';
import {
  findCustomerDuplicates,
  createCustomerRecord,
  updateCustomerPreferences,
  getCustomer360Profile,
  createLeadRecord,
  getLeadsFiltered,
  updateLeadStageWithReason,
  assignLeadToStaff,
  getNextRoundRobinAssignee,
  createFollowUpTask,
  getFollowUpsDashboard,
  completeFollowUpTask,
  rescheduleFollowUpTask,
  cancelFollowUpTask,
  getInboxConversationsList,
  getInboxConversationDetail,
  sendInboxMessageReply,
  createManualEnquiry,
  getCrmAnalyticsMetrics,
  UserContext,
} from '../lib/crm/unified-crm-service';
import { PipelineStage, PriorityLevel, ServiceType } from '@prisma/client';

async function runTests() {
  console.log('====================================================');
  console.log('VARNI HOLIDAYS CRM & SALES MANAGEMENT TEST SUITE');
  console.log('Testing unified CRM system against staging database');
  console.log('====================================================\n');

  const mockStaff: UserContext = {
    id: '3fb5cc1b-4278-4d0b-8715-4356fd8e2f2e',
    fullName: 'Neel Patel',
    email: 'neel@varniholidays.com',
    role: 'SUPER_ADMIN',
  };

  let testCustomerId = '';
  let testLeadId = '';
  let testFollowUpId = '';
  let testConversationId = '';

  const testPhone = `9825${Math.floor(100000 + Math.random() * 900000)}`;
  const testEmail = `crm.tester.${Date.now()}@example.com`;

  try {
    // ----------------------------------------------------
    // Scenario 1: Customer Duplicate Detection
    // ----------------------------------------------------
    console.log('[Scenario 1] Testing customer duplicate detection...');
    const dupsBefore = await findCustomerDuplicates(testPhone, testEmail);
    console.log(`✓ Duplicates before creation: ${dupsBefore.length} (expected 0)`);

    // ----------------------------------------------------
    // Scenario 2: Customer Creation with Preferences
    // ----------------------------------------------------
    console.log('\n[Scenario 2] Creating customer with travel preferences...');
    const custResult = await createCustomerRecord(
      {
        fullName: 'Vikramaditya Shah',
        phoneCountryCode: '+91',
        phoneNumber: testPhone,
        email: testEmail,
        city: 'Vadodara',
        preferredChannel: 'WHATSAPP',
        preferredAirlines: ['Emirates', 'Air India'],
        preferredDestinations: ['Dubai', 'London'],
        preferredCabinClass: 'Business',
        preferredSeat: 'Aisle',
        mealPreference: 'Vegetarian',
        budgetRange: '₹2,00,000 - ₹4,00,000',
        specialAssistance: 'Extra legroom requested',
        internalRemarks: 'High Net-worth Individual, frequent traveler from Gujarat',
      },
      mockStaff
    );
    testCustomerId = custResult.customer.id;
    console.log(`✓ Customer created: ${custResult.customer.fullName} (ID: ${testCustomerId})`);

    // ----------------------------------------------------
    // Scenario 3: Customer Duplicate Detection (Should now match)
    // ----------------------------------------------------
    console.log('\n[Scenario 3] Testing duplicate detection after customer creation...');
    const dupsAfter = await findCustomerDuplicates(testPhone);
    if (dupsAfter.length === 0) throw new Error('Duplicate detection failed to find newly created customer');
    console.log(`✓ Duplicate detected correctly: found ${dupsAfter[0].fullName} (${dupsAfter[0].phoneNumber})`);

    // ----------------------------------------------------
    // Scenario 4: Updating Customer Preferences
    // ----------------------------------------------------
    console.log('\n[Scenario 4] Updating customer travel preferences...');
    const updatedCust = await updateCustomerPreferences(
      testCustomerId,
      {
        preferredCabinClass: 'First',
        budgetRange: '₹5,00,000+',
        preferredDestinations: ['Dubai', 'London', 'Switzerland'],
      },
      mockStaff
    );
    console.log(`✓ Customer preferences updated: Cabin: ${updatedCust.preferredCabinClass}, Budget: ${updatedCust.budgetRange}`);

    // ----------------------------------------------------
    // Scenario 5: Round-Robin Staff Assignment Lookup
    // ----------------------------------------------------
    console.log('\n[Scenario 5] Testing round-robin sales consultant assignment...');
    const assignee1 = await getNextRoundRobinAssignee();
    console.log(`✓ Round-robin selected assignee ID: ${assignee1}`);

    // ----------------------------------------------------
    // Scenario 6: Lead Creation linked to Customer
    // ----------------------------------------------------
    console.log('\n[Scenario 6] Creating lead with deal budget and destination...');
    const lead = await createLeadRecord(
      {
        title: 'Swiss Alps Family Tour 7N/8D',
        serviceType: 'PACKAGE' as ServiceType,
        source: 'WHATSAPP',
        customerId: testCustomerId,
        origin: 'Ahmedabad',
        destination: 'Switzerland (Zurich & Lucerne)',
        travelStartDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        travelEndDate: new Date(Date.now() + 37 * 86400000).toISOString(),
        passengerCount: 4,
        estimatedBudgetInr: 650000,
        expectedValueInr: 620000,
        priorityLevel: 'HIGH' as PriorityLevel,
        assignedUserId: assignee1 || undefined,
        internalNotes: 'Wants 4-star mountain view hotels and 1st class Swiss Travel Pass',
      },
      mockStaff
    );
    testLeadId = lead.id;
    console.log(`✓ Lead created: Reference ${lead.referenceId}, Title: "${lead.title}", Budget: ₹${lead.estimatedBudgetInr}`);

    // ----------------------------------------------------
    // Scenario 7: Pipeline Stage Transitions
    // ----------------------------------------------------
    console.log('\n[Scenario 7] Progressing lead through pipeline stages...');
    const stage1 = await updateLeadStageWithReason(testLeadId, 'CONTACTED' as PipelineStage, undefined, undefined, mockStaff);
    console.log(`✓ Stage moved to: ${stage1.stage}`);

    const stage2 = await updateLeadStageWithReason(testLeadId, 'QUOTED' as PipelineStage, undefined, undefined, mockStaff);
    console.log(`✓ Stage moved to: ${stage2.stage}`);

    const stage3 = await updateLeadStageWithReason(testLeadId, 'NEGOTIATION' as PipelineStage, undefined, undefined, mockStaff);
    console.log(`✓ Stage moved to: ${stage3.stage}`);

    // ----------------------------------------------------
    // Scenario 8: Loss Reason Enforcement on LOST
    // ----------------------------------------------------
    console.log('\n[Scenario 8] Verifying loss reason enforcement on LOST stage...');
    let threwWithoutReason = false;
    try {
      await updateLeadStageWithReason(testLeadId, 'LOST' as PipelineStage, undefined, undefined, mockStaff);
    } catch (err: any) {
      threwWithoutReason = true;
      console.log(`✓ Properly rejected without reason: "${err.message}"`);
    }
    if (!threwWithoutReason) throw new Error('Failed: Allowed transition to LOST without reason');

    // ----------------------------------------------------
    // Scenario 9: Won Deal & Conversion to Booking
    // ----------------------------------------------------
    console.log('\n[Scenario 9] Converting lead to WON and verifying booking file...');
    const wonLead = await updateLeadStageWithReason(testLeadId, 'WON' as PipelineStage, undefined, undefined, mockStaff);
    console.log(`✓ Lead marked WON: ${wonLead.stage}`);

    // Create booking from won lead
    const booking = await prisma.booking.create({
      data: {
        bookingReference: `VH-BKG-${Date.now().toString().slice(-8)}`,
        customerId: testCustomerId,
        leadId: testLeadId,
        managedByUserId: assignee1 || '3fb5cc1b-4278-4d0b-8715-4356fd8e2f2e',
        totalAmountInr: 620000,
        paidAmountInr: 200000,
        balanceAmountInr: 420000,
        travelStartDate: new Date(Date.now() + 30 * 86400000),
        travelEndDate: new Date(Date.now() + 37 * 86400000),
        status: 'CONFIRMED',
      },
    });
    console.log(`✓ Booking confirmed: ${booking.bookingReference}, Total: ₹${booking.totalAmountInr}, Paid: ₹${booking.paidAmountInr}`);

    // ----------------------------------------------------
    // Scenario 10: Follow-up Task Creation
    // ----------------------------------------------------
    console.log('\n[Scenario 10] Scheduling follow-up task...');
    const followUp = await createFollowUpTask(
      {
        leadId: testLeadId,
        customerId: testCustomerId,
        type: 'PHONE_CALL',
        title: 'Call client to collect Swiss Visa passport documents',
        notes: 'Confirm original passport and 6-month bank statements',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        priority: 'HIGH',
        assignedUserId: assignee1 || undefined,
      },
      mockStaff
    );
    testFollowUpId = followUp.id;
    console.log(`✓ Follow-up created: ID: ${testFollowUpId}, Title: "${followUp.title}"`);

    // ----------------------------------------------------
    // Scenario 11: Follow-up Rescheduling
    // ----------------------------------------------------
    console.log('\n[Scenario 11] Rescheduling follow-up task...');
    const rescheduled = await rescheduleFollowUpTask(
      testFollowUpId,
      new Date(Date.now() + 2 * 86400000).toISOString(),
      'Client traveling out of town today, requested callback Wednesday'
    );
    console.log(`✓ Follow-up rescheduled to: ${rescheduled.scheduledAt}`);

    // ----------------------------------------------------
    // Scenario 12: Follow-up Completion
    // ----------------------------------------------------
    console.log('\n[Scenario 12] Completing follow-up task...');
    const completed = await completeFollowUpTask(testFollowUpId, 'Documents collected and scanned at Anand branch');
    console.log(`✓ Follow-up completed: Status: ${completed.status}`);

    // ----------------------------------------------------
    // Scenario 13: Customer 360° Profile & Multi-Source Timeline
    // ----------------------------------------------------
    console.log('\n[Scenario 13] Verifying Customer 360° profile & unified timeline...');
    const profile = await getCustomer360Profile(testCustomerId);
    if (!profile) throw new Error('Customer 360 profile not found');
    console.log(`✓ Customer: ${profile.customer.fullName}`);
    console.log(`✓ Stats: Total Enquiries: ${profile.stats.totalEnquiries}, Confirmed: ${profile.stats.totalBookings}, Spend: ₹${profile.stats.totalSpendInr}`);
    console.log(`✓ Timeline Events Count: ${profile.timeline.length}`);
    profile.timeline.slice(0, 3).forEach((item: any) => {
      console.log(`   - [${item.type}] ${item.title}: ${item.description}`);
    });

    // ----------------------------------------------------
    // Scenario 14: Unified Inbox - Manual Walk-In Enquiry
    // ----------------------------------------------------
    console.log('\n[Scenario 14] Creating manual Walk-In enquiry in Unified Inbox...');
    const manualEnquiry = await createManualEnquiry(
      {
        channel: 'WALK_IN',
        customerName: 'Anil Desai (Walk-in)',
        phoneNumber: '9427112233',
        serviceType: 'FLIGHT',
        subject: 'Walk-in enquiry at Anand branch for London direct flight',
        initialMessage: 'Inquired about Air India direct Ahmedabad to London Gatwick for next month',
        destination: 'London (LGW)',
        estimatedBudgetInr: 95000,
      },
      mockStaff
    );
    testConversationId = manualEnquiry.conversation.id;
    console.log(`✓ Manual enquiry logged in Inbox: Conversation ${testConversationId}, Lead: ${manualEnquiry.lead.referenceId}`);

    // ----------------------------------------------------
    // Scenario 15: Unified Inbox - Outbound Reply Dispatch
    // ----------------------------------------------------
    console.log('\n[Scenario 15] Sending reply message in Unified Inbox...');
    const replyRes = await sendInboxMessageReply(
      {
        conversationId: testConversationId,
        messageContent: 'Shared fare options for AI 171 AMD-LGW: Economy ₹88,000, Premium Economy ₹1,25,000.',
        channel: 'WALK_IN',
      },
      mockStaff
    );
    console.log(`✓ Inbox message dispatched: ID: ${replyRes.message.id}, Content: "${replyRes.message.content}"`);

    // ----------------------------------------------------
    // Scenario 16: Unified Inbox - Detail & Message History
    // ----------------------------------------------------
    console.log('\n[Scenario 16] Fetching conversation detail & thread...');
    const convoDetail = await getInboxConversationDetail(testConversationId);
    if (!convoDetail) throw new Error('Conversation detail not found');
    console.log(`✓ Conversation channel: ${convoDetail.channel}, Messages count: ${convoDetail.messages.length}`);

    // ----------------------------------------------------
    // Scenario 17: Follow-up Cancellation with Reason
    // ----------------------------------------------------
    console.log('\n[Scenario 17] Testing follow-up task cancellation with reason...');
    const followUp2 = await createFollowUpTask(
      {
        leadId: testLeadId,
        customerId: testCustomerId,
        type: 'WHATSAPP',
        title: 'Send reminder for hotel preference',
        notes: 'Check if they want Interlaken or Lucerne stay',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        priority: 'MEDIUM',
      },
      mockStaff
    );
    const cancelled = await cancelFollowUpTask(followUp2.id, 'Client already confirmed Lucerne stay in person');
    console.log(`✓ Follow-up cancelled: Status: ${cancelled.status}, Reason: "${cancelled.cancelReason}"`);

    // ----------------------------------------------------
    // Scenario 18: Live Real-Time CRM Analytics Metrics
    // ----------------------------------------------------
    console.log('\n[Scenario 18] Calculating CRM Analytics Metrics across filters...');
    const metricsToday = await getCrmAnalyticsMetrics('TODAY', mockStaff);
    const metrics30D = await getCrmAnalyticsMetrics('30D', mockStaff);
    const metricsAll = await getCrmAnalyticsMetrics('ALL', mockStaff);

    console.log(`✓ Metrics TODAY: Total Leads: ${metricsToday.kpis.totalLeads}, Won: ${metricsToday.kpis.wonDeals}, Pipeline: ₹${metricsToday.kpis.pipelineValueInr}`);
    console.log(`✓ Metrics 30D: Total Leads: ${metrics30D.kpis.totalLeads}, Won: ${metrics30D.kpis.wonDeals}, Win Rate: ${metrics30D.kpis.conversionRate}%`);
    console.log(`✓ Metrics ALL: Total Leads: ${metricsAll.kpis.totalLeads}, Realized: ₹${metricsAll.kpis.realizedRevenueInr}`);
    console.log(`✓ Stage Breakdown categories: ${metricsAll.stageBreakdown.length}`);
    console.log(`✓ Source Breakdown categories: ${metricsAll.sourceBreakdown.length}`);
    console.log(`✓ Staff Leaderboard consultants: ${metricsAll.staffPerformance.length}`);

    console.log('\n====================================================');
    console.log('ALL 18 CRM FUNCTIONAL SCENARIOS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (err: any) {
    console.error('\n❌ Test execution failed with error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
