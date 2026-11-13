import {
  createVisaApplicationAction,
  getVisaApplicationDetailsAction,
  getVisaDashboardAction,
  updateVisaStatusAction,
  uploadVisaDocumentAction,
  verifyVisaDocumentAction,
  sendVisaEmailAction,
  getVisaTemplatesAction,
} from '../app/actions/visa';
import { VISA_EMAIL_TEMPLATES, renderVisaEmail } from '../lib/visa/templates';
import { crmRepo } from '../lib/crm/store';

async function runVisaAutomationTests() {
  console.log('====================================================');
  console.log('VARNI HOLIDAYS — VISA AUTOMATION SYSTEM TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // TEST 1: Template Catalog Check
    console.log('--- TEST 1: Email Templates Catalog ---');
    const templates = Object.values(VISA_EMAIL_TEMPLATES);
    assert(templates.length === 7, `Expected 7 official templates, found ${templates.length}`);

    const expectedCodes = [
      'INQUIRY_RECEIVED',
      'DOCUMENTS_RECEIVED',
      'FILE_SUBMITTED',
      'VISA_APPROVED',
      'ADDITIONAL_INFORMATION_REQUIRED',
      'VISA_REJECTED',
      'COMPLETED',
    ];

    for (const code of expectedCodes) {
      assert(Boolean(VISA_EMAIL_TEMPLATES[code]), `Template exists for ${code}`);
    }

    // TEST 2: Template Rendering & Variable Substitution
    console.log('\n--- TEST 2: Variable Token Substitution Engine ---');
    const sampleContext = {
      customer_name: 'Bhaveshbhai Patel',
      customer_email: 'bhavesh.test@example.com',
      customer_phone: '+91 98251 99999',
      destination_country: 'Canada',
      visa_type: 'Super Visa (Parents & Grandparents 5-Year)',
      application_reference: 'VH-VIS-202611-TEST',
      official_reference: 'IRCC-CAN-2026-TEST',
      inquiry_date: '14/11/2026',
      document_received_date: '15/11/2026',
      submission_date: '18/11/2026',
      approval_date: '25/11/2026',
      decision_date: '25/11/2026',
      employee_name: 'Ananya Joshi',
      employee_phone: '+91 94260 45678',
    };

    for (const code of expectedCodes) {
      const rendered = renderVisaEmail(code, sampleContext, 'Please ensure your biometrics are booked at Ahmedabad VFS.');
      assert(rendered.subject.length > 5, `${code}: Subject line populated: "${rendered.subject.slice(0, 40)}..."`);
      assert(rendered.html.includes('Bhaveshbhai Patel'), `${code}: Customer name injected into HTML`);
      assert(rendered.html.includes('VH-VIS-202611-TEST'), `${code}: Application reference injected`);
      assert(rendered.html.includes('Canada'), `${code}: Destination country injected`);
      assert(rendered.html.includes('Ahmedabad VFS'), `${code}: Custom counselor message appended`);
      assert(!rendered.html.includes('{{customer_name}}'), `${code}: No unrendered {{customer_name}} token`);
      assert(!rendered.html.includes('{{application_reference}}'), `${code}: No unrendered {{application_reference}} token`);
    }

    // TEST 3: Register Visa Application Dossier
    console.log('\n--- TEST 3: Register Visa Dossier Action ---');
    const createRes = await createVisaApplicationAction({
      customerName: 'Jitendrabhai Shah',
      customerEmail: 'jitendra.shah.test@example.com',
      customerPhone: '+91 98980 11223',
      destinationCountry: 'United Kingdom',
      visaType: 'Standard Visitor Visa (6 Months)',
      visaCategory: 'TOURIST',
      applicantCount: 2,
      travelPlannedDate: '2026-12-15',
      stayDurationDays: 20,
      assignedUserId: 'usr-ananya-joshi-visa',
      internalNotes: 'Family visiting London for winter holidays. All financial proofs available.',
    });

    assert(createRes.success, 'Dossier successfully created');
    assert(Boolean(createRes.application?.id), 'Application ID generated');
    assert(createRes.application?.applicationReference.startsWith('VH-VIS-'), `Reference format verified: ${createRes.application?.applicationReference}`);
    assert(createRes.application?.status === 'INQUIRY_RECEIVED', 'Initial status set to INQUIRY_RECEIVED');

    const appId = createRes.application!.id;

    // TEST 4: Fetch Dossier Details
    console.log('\n--- TEST 4: Dossier Details & Initial Status History ---');
    const detailsRes = await getVisaApplicationDetailsAction(appId);
    assert(detailsRes.success, 'Fetched dossier details successfully');
    assert(detailsRes.statusHistory?.length === 1, 'Initial status history record created');
    assert(detailsRes.statusHistory?.[0].toStatus === 'INQUIRY_RECEIVED', 'History record records INQUIRY_RECEIVED');

    // TEST 5: Status Lifecycle Transitions
    console.log('\n--- TEST 5: Status Transitions & Milestone Tracking ---');
    
    // Transition to DOCUMENTS_RECEIVED
    const st1 = await updateVisaStatusAction(appId, 'DOCUMENTS_RECEIVED', 'Original passports and ITR files collected at Anand HQ');
    assert(st1.success && st1.application?.status === 'DOCUMENTS_RECEIVED', 'Status transitioned to DOCUMENTS_RECEIVED');
    assert(Boolean(st1.application?.documentReceivedDate), 'documentReceivedDate milestone recorded');

    // Transition to FILE_SUBMITTED
    const st2 = await updateVisaStatusAction(appId, 'FILE_SUBMITTED', 'File lodged on UKVI portal', 'UKVI-GWF-9928172');
    assert(st2.success && st2.application?.status === 'FILE_SUBMITTED', 'Status transitioned to FILE_SUBMITTED');
    assert(st2.application?.officialReferenceNo === 'UKVI-GWF-9928172', 'Official reference number updated');
    assert(Boolean(st2.application?.submissionDate), 'submissionDate milestone recorded');

    // Transition to VISA_APPROVED
    const st3 = await updateVisaStatusAction(appId, 'VISA_APPROVED', 'Passport received with approved visa vignette sticker');
    assert(st3.success && st3.application?.status === 'VISA_APPROVED', 'Status transitioned to VISA_APPROVED');
    assert(Boolean(st3.application?.decisionDate), 'decisionDate milestone recorded');

    // Verify full history
    const historyCheck = await getVisaApplicationDetailsAction(appId);
    assert(historyCheck.statusHistory?.length === 4, `Status history contains all 4 transition records (found ${historyCheck.statusHistory?.length})`);

    // TEST 6: Document Vault & Verification
    console.log('\n--- TEST 6: Document Vault & Verification ---');
    const docRes = await uploadVisaDocumentAction({
      visaApplicationId: appId,
      documentType: 'PASSPORT_FRONT',
      fileName: 'Jitendra_Shah_Passport_Front.pdf',
      fileSize: 1024 * 350,
      mimeType: 'application/pdf',
      fileDataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
    });

    assert(docRes.success && Boolean(docRes.document?.id), 'Passport front document recorded');
    assert(docRes.document?.isVerified === false, 'Document starts as unverified');

    // Mark verified
    const verifyRes = await verifyVisaDocumentAction(docRes.document!.id, true);
    assert(verifyRes.success && verifyRes.document?.isVerified === true, 'Document marked as verified');

    // Add Approved Visa Document
    const approvedDocRes = await uploadVisaDocumentAction({
      visaApplicationId: appId,
      documentType: 'APPROVED_VISA',
      fileName: 'Official_UK_Visa_Approval.pdf',
      fileDataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
    });
    assert(approvedDocRes.success && approvedDocRes.document?.documentType === 'APPROVED_VISA', 'Approved visa document recorded in vault');

    // TEST 7: Resend Client Email Dispatch & Communication Log
    console.log('\n--- TEST 7: Client Email Dispatch & Log Recording ---');
    const emailRes = await sendVisaEmailAction({
      applicationId: appId,
      templateCode: 'VISA_APPROVED',
      recipientEmail: 'dhaval.patel@example.com',
      subject: 'Congratulations! Your UK Visa Has Been Approved – Varni Holidays',
      customMessage: 'Your passport is ready for pickup at our Anand office.',
      attachApprovedVisa: true,
      actorId: 'usr-ananya-joshi-visa',
    });

    assert(emailRes.success, 'Email action completed successfully');
    assert(Boolean(emailRes.messageId), `Resend message ID or simulated ID returned: ${emailRes.messageId}`);
    assert(Boolean(emailRes.log), 'Communication log recorded in CRM');
    assert(emailRes.log?.recipientEmail === 'dhaval.patel@example.com', 'Communication log records correct recipient');

    // TEST 8: Dashboard Metrics
    console.log('\n--- TEST 8: Dashboard Metrics & Filtering ---');
    const dashRes = await getVisaDashboardAction();
    assert(dashRes.success, 'Dashboard action responded');
    assert(dashRes.applications.length >= 1, `Dashboard lists applications (found ${dashRes.applications.length})`);
    assert(dashRes.stats.approvedCount >= 1, `Stats accurately aggregate approved applications (${dashRes.stats.approvedCount})`);

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runVisaAutomationTests();

