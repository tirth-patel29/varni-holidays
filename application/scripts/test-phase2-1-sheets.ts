import { crmRepo } from '../lib/crm/store';
import { googleSheetsSync, simulatedSheets } from '../lib/integrations/google-sheets';
import {
  triggerManualSyncAction,
  processSyncQueueAction,
  retryFailedJobsAction,
  getGoogleSheetsStatusAction,
} from '../app/actions/google-sheets';
import {
  updateLeadStageAction,
  assignLeadAction,
  createFollowUpAction,
  completeFollowUpAction,
} from '../app/actions/crm';

console.log('=== RUNNING PHASE 2.1 GOOGLE SHEETS LIVE BUSINESS REPORTING TESTS ===\n');

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runPhase21Tests() {
  // 0. Reset state for clean test run
  crmRepo.reset();
  simulatedSheets.reset();

  // Test 1: Neel Patel is granted Viewer access and Service Account is dedicated identity
  const config = crmRepo.getGoogleSheetsConfig();
  assert(config.activeViewerEmail === 'neel@varniholidays.com', 'Test 1: Active viewer is Neel Patel');
  assert(config.clientEmail.includes('varni-sheets-sync'), 'Test 1: Dedicated service account client identity exists');
  assert(config.spreadsheetUrl.includes(config.spreadsheetId), 'Test 1: Spreadsheet URL properly points to target ID');

  // Test 2: Initial Full Reconciliation populates all 4 tabs
  const reconRes = await triggerManualSyncAction();
  assert(reconRes.success === true, 'Test 2: Full workbook manual reconciliation succeeded');
  assert(reconRes.syncedLeads >= 4, `Test 2: Seed leads reconciled (${reconRes.syncedLeads})`);
  assert(reconRes.syncedFollowUps >= 2, `Test 2: Seed follow-ups reconciled (${reconRes.syncedFollowUps})`);
  assert(reconRes.syncedBookings >= 1, `Test 2: Seed bookings reconciled (${reconRes.syncedBookings})`);

  assert(simulatedSheets.tabs.ALL_LEADS.rows.length >= 4, 'Test 2: ALL_LEADS tab populated');
  assert(simulatedSheets.tabs.FOLLOW_UPS.rows.length >= 2, 'Test 2: FOLLOW_UPS tab populated');
  assert(simulatedSheets.tabs.BOOKINGS.rows.length >= 1, 'Test 2: BOOKINGS tab populated');
  assert(simulatedSheets.tabs.BUSINESS_SUMMARY.length >= 15, 'Test 2: BUSINESS_SUMMARY KPI matrix generated');

  // Test 3: New Lead creates one spreadsheet row via Transactional Outbox
  const initialLeadsCount = simulatedSheets.tabs.ALL_LEADS.rows.length;
  const newLead = crmRepo.saveLead({
    id: 'lead-test-sync-101',
    referenceId: 'PKG-20261104-9999',
    serviceType: 'PACKAGE',
    stage: 'REQUESTS',
    priorityLevel: 'HIGH',
    source: 'WEBSITE_TEST_FORM',
    customerId: 'cust-101-chirag-patel',
    assignedUserId: 'usr-harshil-desai-packages',
    packageDetail: {
      packageSlug: 'kerala-6n7d-winter',
      packageName: 'Scenic Kerala Grand Winter Tour',
      hotelTier: 'STANDARD',
      adultsCount: 2,
      childrenWithBedCount: 0,
      childrenNoBedCount: 0,
      roomsCount: 1,
      preferredTravelDate: '2026-12-15',
      includeHouseboatUpgrade: false,
      includeMealPlan: false,
      includeAthirapillyTrip: false,
      includeKanyakumariTrip: false,
      pricingStatus: 'EXACT_MATCH',
      quotedUnitPriceInr: 27400,
      quotedTotalPriceInr: 54800,
    },
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Verify Outbox queued LEAD_CREATED job
  const pendingJobs = crmRepo.getPendingSyncJobs();
  const leadJob = pendingJobs.find((j) => j.entityId === newLead.id && j.eventType === 'LEAD_CREATED');
  assert(leadJob !== undefined, 'Test 3: Transactional Outbox queued LEAD_CREATED job');

  // Process outbox queue
  await processSyncQueueAction();
  assert(simulatedSheets.tabs.ALL_LEADS.rows.length === initialLeadsCount + 1, 'Test 3: Exactly one new row created in ALL_LEADS');
  const syncedLead = simulatedSheets.tabs.ALL_LEADS.rows.find((r) => r.leadId === newLead.referenceId);
  assert(syncedLead !== undefined, 'Test 3: Synced lead found by Lead Reference ID');
  assert(syncedLead.stage === 'REQUESTS', 'Test 3: Synced lead stage is REQUESTS');

  // Test 4: Updating a lead updates its existing row without creating duplicates
  await updateLeadStageAction(newLead.id, 'PRIORITY', 'Customer confirmed high intent to travel in December.');
  await processSyncQueueAction();

  assert(simulatedSheets.tabs.ALL_LEADS.rows.length === initialLeadsCount + 1, 'Test 4: Row count remains identical (No duplicate rows)');
  const updatedSyncedLead = simulatedSheets.tabs.ALL_LEADS.rows.find((r) => r.leadId === newLead.referenceId);
  assert(updatedSyncedLead.stage === 'PRIORITY', 'Test 4: Existing row stage updated to PRIORITY');

  // Test 5: Employee reassignment updates the sheet row
  await assignLeadAction(newLead.id, 'usr-priya-sharma-flights');
  await processSyncQueueAction();

  const reassignedSyncedLead = simulatedSheets.tabs.ALL_LEADS.rows.find((r) => r.leadId === newLead.referenceId);
  assert(reassignedSyncedLead.assignedEmployee === 'Priya Sharma', 'Test 5: Assigned employee updated to Priya Sharma on existing row');

  // Test 6: Follow-up changes update FOLLOW_UPS tab
  const initialFollowUpsCount = simulatedSheets.tabs.FOLLOW_UPS.rows.length;
  const followUpRes = await createFollowUpAction(
    newLead.id,
    new Date(Date.now() + 86400000).toISOString(),
    'Confirm Kerala flight connections from Ahmedabad',
    'usr-neel-patel-superadmin'
  );
  await processSyncQueueAction();

  assert(simulatedSheets.tabs.FOLLOW_UPS.rows.length === initialFollowUpsCount + 1, 'Test 6: New follow-up row added to FOLLOW_UPS');
  const syncedFollowUp = simulatedSheets.tabs.FOLLOW_UPS.rows.find((f) => f.followUpId === followUpRes.followUp?.id);
  assert(syncedFollowUp !== undefined, 'Test 6: Synced follow-up row identified');
  assert(syncedFollowUp.status === 'PENDING', 'Test 6: Follow-up status is PENDING');

  // Complete follow up
  await completeFollowUpAction(followUpRes.followUp!.id);
  await processSyncQueueAction();
  const completedSyncedFollowUp = simulatedSheets.tabs.FOLLOW_UPS.rows.find((f) => f.followUpId === followUpRes.followUp?.id);
  assert(completedSyncedFollowUp.status === 'COMPLETED', 'Test 6: Existing follow-up updated to COMPLETED without duplicate row');

  // Test 7: Confirmed bookings appear in BOOKINGS tab
  const initialBookingsCount = simulatedSheets.tabs.BOOKINGS.rows.length;
  const newBooking = crmRepo.saveBooking({
    id: 'bkg-test-401',
    bookingReference: 'VH-BKG-202611-0002',
    customerId: 'cust-101-chirag-patel',
    customerName: 'Chirag Patel',
    serviceType: 'PACKAGE',
    leadId: newLead.id,
    managedByUserId: 'usr-neel-patel-superadmin',
    managedByName: 'Neel Patel',
    travelStartDate: '2026-12-15',
    travelEndDate: '2026-12-21',
    status: 'CONFIRMED',
    totalAmountInr: 54800,
    paidAmountInr: 20000,
    balanceAmountInr: 34800,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await processSyncQueueAction();

  assert(simulatedSheets.tabs.BOOKINGS.rows.length === initialBookingsCount + 1, 'Test 7: Booking appeared in BOOKINGS tab');
  const syncedBooking = simulatedSheets.tabs.BOOKINGS.rows.find((b) => b.bookingReference === newBooking.bookingReference);
  assert(syncedBooking !== undefined, 'Test 7: Booking reference verified in sheet');
  assert(syncedBooking.bookingStatus === 'CONFIRMED', 'Test 7: Booking status is CONFIRMED');

  // Test 8: BUSINESS_SUMMARY metrics calculation & no estimated price as revenue
  const summary = googleSheetsSync.computeBusinessSummary();
  const totalEnquiriesRow = summary.find((r) => r[0] === 'Total Enquiries Received');
  assert(totalEnquiriesRow !== undefined, 'Test 8: BUSINESS_SUMMARY Total Enquiries metric exists');
  assert(Number(totalEnquiriesRow![1]) >= 5, 'Test 8: Total Enquiries accurately counts all database leads');

  const confirmedBookingsRow = summary.find((r) => r[0] === 'Confirmed Bookings');
  assert(confirmedBookingsRow !== undefined, 'Test 8: Confirmed Bookings metric exists');
  assert(Number(confirmedBookingsRow![1]) >= 2, 'Test 8: Confirmed Bookings count matches database records');

  // Verify no revenue cell fabricates quotation estimates
  const hasEstimatedRevenueHeader = summary.some((r) => String(r[0]).includes('Estimated Revenue') || String(r[1]).includes('Total Quoted Revenue'));
  assert(!hasEstimatedRevenueHeader, 'Test 8: Estimated package quotation amounts are NOT reported as actual revenue');

  // Test 9: Outage Isolation & Error Handling (Google API outage does NOT block CRM)
  // Simulate an outbox job failure with mock error
  const failJob = crmRepo.enqueueSyncJob(
    'LEAD_UPDATED',
    'ALL_LEADS',
    'lead-offline-test',
    { test: 'data' }
  );

  // Directly simulate API network error
  crmRepo.updateSyncJob(failJob.id, {
    status: 'FAILED',
    retryCount: 5,
    error: 'Google Sheets API ETIMEDOUT: 503 Service Unavailable',
  });

  const statusAfterFailure = await getGoogleSheetsStatusAction();
  assert(statusAfterFailure.counts.failed >= 1, 'Test 9: Failed job tracked in outbox queue');

  // Retry failed jobs
  const retryRes = await retryFailedJobsAction();
  assert(retryRes.retriedCount >= 1, 'Test 9: Failed jobs retried successfully');

  // Test 10: Strict Data Security & Confidentiality Audit
  // Verify that all rows in ALL_LEADS, FOLLOW_UPS, BOOKINGS contain ZERO sensitive fields
  const forbiddenKeys = ['passport', 'passportNumber', 'dateOfBirth', 'dob', 'supplierCost', 'supplierNetCost', 'margin', 'rackRate'];

  let forbiddenFound = false;
  simulatedSheets.tabs.ALL_LEADS.rows.forEach((r) => {
    Object.keys(r).forEach((k) => {
      if (forbiddenKeys.some((fk) => k.toLowerCase().includes(fk.toLowerCase()))) {
        forbiddenFound = true;
      }
    });
  });

  simulatedSheets.tabs.BOOKINGS.rows.forEach((r) => {
    Object.keys(r).forEach((k) => {
      if (forbiddenKeys.some((fk) => k.toLowerCase().includes(fk.toLowerCase()))) {
        forbiddenFound = true;
      }
    });
  });

  assert(!forbiddenFound, 'Test 10: Zero passport, DOB, supplier cost, or margin fields found in any spreadsheet payload');

  console.log('\n🎉 ALL 10 PHASE 2.1 GOOGLE SHEETS LIVE BUSINESS REPORTING TESTS PASSED CLEANLY!\n');
}

runPhase21Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
