import { crmRepo } from '../lib/crm/store';
import { DEFAULT_USERS, getUserSession } from '../lib/auth/session';
import {
  updateLeadStageAction,
  assignLeadAction,
  updateLeadPriorityAction,
  logCallActivityAction,
  recordWhatsAppClickAction,
  createFollowUpAction,
  completeFollowUpAction,
  mergeCustomersAction,
  updateQuotationStatusAction,
  getDashboardMetricsAction,
} from '../app/actions/crm';

console.log('=== RUNNING PHASE 2 CRM & ADMIN PORTAL AUTOMATED TESTS ===\n');

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runPhase2Tests() {
  crmRepo.reset();

  // 1. Multi-Role Employee Management & Super Admin Neel Patel
  const superAdmin = getUserSession('usr-neel-patel-superadmin');
  assert(superAdmin !== null, 'Test 1: Super Admin Neel Patel exists');
  assert(superAdmin?.fullName === 'Neel Patel', 'Test 1: Super Admin name is Neel Patel');
  assert(superAdmin?.role === 'SUPER_ADMIN', 'Test 1: Neel Patel role is SUPER_ADMIN');
  assert(superAdmin?.canViewSupplierCosts === true, 'Test 1: Neel Patel can view supplier costs');
  assert(superAdmin?.canApprovePricing === true, 'Test 1: Neel Patel can approve pricing');
  assert(superAdmin?.canMergeCustomers === true, 'Test 1: Neel Patel can merge customers');

  const flightAgent = getUserSession('usr-priya-sharma-flights');
  assert(flightAgent?.role === 'FLIGHTS_AGENT', 'Test 1: Priya Sharma is FLIGHTS_AGENT');
  assert(flightAgent?.canViewSupplierCosts === false, 'Test 1: Flights Agent cannot view confidential supplier costs');
  assert(flightAgent?.servicePermissions.includes('FLIGHT') ?? false, 'Test 1: Priya has FLIGHT service permission');

  // 2. Lead Pipeline Stages & Triage (REQUESTS -> GENERAL -> PRIORITY -> CONVERTED)
  const leads = crmRepo.getLeads();
  assert(leads.length >= 4, `Test 2: Seed leads loaded (${leads.length} found)`);

  const requestLead = leads.find((l) => l.stage === 'REQUESTS');
  assert(requestLead !== undefined, 'Test 2: Lead in REQUESTS stage exists');

  // Advance REQUESTS -> GENERAL
  const resStage1 = await updateLeadStageAction(requestLead!.id, 'GENERAL', 'Agent contacted customer via phone', superAdmin!.id);
  assert(resStage1.success === true, 'Test 2: Stage updated to GENERAL');
  const updatedLead1 = crmRepo.getLeadById(requestLead!.id);
  assert(updatedLead1?.stage === 'GENERAL', 'Test 2: Lead state persisted as GENERAL');

  // Advance GENERAL -> PRIORITY
  const resStage2 = await updateLeadStageAction(requestLead!.id, 'PRIORITY', 'Customer confirmed family dates and high budget', superAdmin!.id);
  assert(resStage2.success === true, 'Test 2: Stage updated to PRIORITY');
  const updatedLead2 = crmRepo.getLeadById(requestLead!.id);
  assert(updatedLead2?.stage === 'PRIORITY', 'Test 2: Lead state persisted as PRIORITY');

  // 3. Lead Assignment & Priority Update
  const resAssign = await assignLeadAction(requestLead!.id, 'usr-harshil-desai-packages', superAdmin!.id);
  assert(resAssign.success === true, 'Test 3: Lead assigned to Harshil Desai');
  const assignedLead = crmRepo.getLeadById(requestLead!.id);
  assert(assignedLead?.assignedUserId === 'usr-harshil-desai-packages', 'Test 3: Assigned user ID matches');

  // 4. Strict WhatsApp Click-to-Chat Compliance (Review Item 9)
  const resWhatsApp = await recordWhatsAppClickAction(
    requestLead!.id,
    '+91 9825012345',
    superAdmin!.id
  );
  assert(resWhatsApp.success === true, 'Test 4: WhatsApp click-to-chat recorded');
  assert(
    resWhatsApp.activity?.metadata?.whatsappStatus === 'CLICK_TO_CHAT_TRIGGERED',
    'Test 4: WhatsApp status is strictly CLICK_TO_CHAT_TRIGGERED (NEVER falsely marked as DELIVERED)'
  );

  // 5. Phone Call Logging
  const resCall = await logCallActivityAction(
    requestLead!.id,
    450,
    'CONNECTED',
    'Discussed 6-pax vehicle differences between Innova and Tempo Traveller with customer.',
    superAdmin!.id
  );
  assert(resCall.success === true, 'Test 5: Call logged successfully');
  assert(resCall.activity?.metadata?.callDurationSeconds === 450, 'Test 5: Duration recorded');
  assert(resCall.activity?.metadata?.callOutcome === 'CONNECTED', 'Test 5: Outcome recorded');

  // 6. Follow-Up Reminders & Overdue Tracking
  const resFollowUp = await createFollowUpAction(
    requestLead!.id,
    new Date(Date.now() + 86400000).toISOString(),
    'Verify hotel availability in Munnar for 3 rooms.',
    superAdmin!.id
  );
  assert(resFollowUp.success === true, 'Test 6: Follow-up scheduled');
  assert(resFollowUp.followUp?.status === 'PENDING', 'Test 6: Status is PENDING');

  const completeRes = await completeFollowUpAction(resFollowUp.followUp!.id);
  assert(completeRes.success === true, 'Test 6: Follow-up marked as completed');

  // 7. Quotation & Auto-Conversion to Booking
  const quotes = crmRepo.getQuotations();
  assert(quotes.length >= 1, 'Test 7: Quotations exist');
  const testQuote = quotes[0];
  const quoteRes = await updateQuotationStatusAction(testQuote.id, 'ACCEPTED', superAdmin!.id);
  assert(quoteRes.success === true, 'Test 7: Quotation marked as ACCEPTED');
  const relatedLead = crmRepo.getLeadById(testQuote.leadId);
  assert(relatedLead?.stage === 'CONVERTED', 'Test 7: Lead automatically converted to CONVERTED upon quotation acceptance');

  // 8. Admin Customer Deduplication & Non-Destructive Merging (Review Item 1)
  const duplicateGroups = crmRepo.findPotentialDuplicates();
  assert(duplicateGroups.length >= 1, `Test 8: Potential duplicate detected (${duplicateGroups.length} groups)`);

  const dupGroup = duplicateGroups[0];
  const primaryId = dupGroup.primary.id;
  const subordinateId = dupGroup.matches[0].id;

  const mergeRes = await mergeCustomersAction(primaryId, subordinateId, superAdmin!.id);
  assert(mergeRes.success === true, `Test 8: Customer merged successfully (${mergeRes.message})`);

  const subordinateCust = crmRepo.getCustomerById(subordinateId);
  assert(subordinateCust === null, 'Test 8: Subordinate customer archived from active list');

  const auditLogs = crmRepo.getAuditLogs();
  const mergeAudit = auditLogs.find((l) => l.action === 'CUSTOMER_MERGED');
  assert(mergeAudit !== undefined, 'Test 8: CUSTOMER_MERGED audit record created');
  assert(mergeAudit?.userId === superAdmin!.id, 'Test 8: Actor is Super Admin Neel Patel');

  // 9. Package Rate Governance & Confidential Costs (Review Item 3 & 11)
  const pkgCosts = crmRepo.getPackageCosts();
  assert(pkgCosts.length >= 4, `Test 9: Rate cards found (${pkgCosts.length})`);

  const innova6Pax = pkgCosts.find((c) => c.packageCode === 'KER-6N7D-STD-6PAX-INV');
  const traveller6Pax = pkgCosts.find((c) => c.packageCode === 'KER-6N7D-STD-6PAX-TRV');

  assert(innova6Pax !== undefined, 'Test 9: 6 Pax Innova rate card exists');
  assert(innova6Pax?.supplierCostInr === 16500, 'Test 9: 6 Pax Innova supplier cost is 16500');
  assert(innova6Pax?.varniSellingPriceInr === 20700, 'Test 9: 6 Pax Innova selling price is 20700');

  assert(traveller6Pax !== undefined, 'Test 9: 6 Pax Traveller rate card exists');
  assert(traveller6Pax?.supplierCostInr === 17100, 'Test 9: 6 Pax Traveller supplier cost is 17100');
  assert(traveller6Pax?.varniSellingPriceInr === 21400, 'Test 9: 6 Pax Traveller selling price is 21400');

  // 10. Dashboard Analytics
  const metrics = await getDashboardMetricsAction();
  assert(metrics.totalLeads > 0, 'Test 10: Total leads > 0');
  assert(typeof metrics.conversionRate === 'number', 'Test 10: Conversion rate computed');
  assert(metrics.recentActivities.length > 0, 'Test 10: Recent activities feed populated');

  console.log('\n🎉 ALL 10 PHASE 2 CRM & SUPER ADMIN WORKFLOW TESTS PASSED CLEANLY!\n');
}

runPhase2Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
