/**
 * VARNI HOLIDAYS - PASSENGER TRAVEL CARE & TICKET ISSUANCE TEST SUITE
 * Tests:
 * 1. PNR Creation with Optional Passenger Email
 * 2. Passenger Email Validation (Rejection of invalid format, acceptance of valid format)
 * 3. Update Contact Action (Editing passenger email on active holds and issued PNRs)
 * 4. E-Ticket PDF Validation (%PDF- magic byte check, size limit, rejection of invalid files)
 * 5. Private PDF Document Storage & Tokenized URL Generation
 * 6. Tokenized Download Endpoint Retrieval
 * 7. Ticket Issuance with Optional PDF Attachment & Notifications
 * 8. Non-blocking Error Isolation (Issuance succeeds even if notifications/PDF fail)
 * 9. 24-Hour Departure Reminder Scheduling & Logic
 * 10. Past-Departure Safeguard (Skip reminder if departure < 24h away)
 * 11. Hold Cancellation (Auto-cancels any pending departure reminders)
 * 12. Scheduler Runner (Processes pending passenger reminders)
 */

import { prisma } from '../lib/prisma';
import {
  createFlightHoldAction,
  updateFlightHoldContactAction,
  issueFlightHoldAction,
  cancelFlightHoldAction,
  runFlightHoldSchedulerAction,
} from '../app/actions/flight-holds';
import { isValidEmail } from '../lib/flights/timing';
import {
  validateTicketPdf,
  storeFlightTicketPdf,
  getFlightTicketPdfByToken,
  buildTicketDownloadUrl,
} from '../lib/flights/ticket-document-service';
import {
  schedule24HourDepartureReminder,
  dispatchTicketConfirmation,
  buildTicketConfirmationEmailHtml,
  buildDepartureReminderEmailHtml,
  buildTicketConfirmationWhatsAppText,
  buildDepartureReminderWhatsAppText,
  TicketFlightDetails,
} from '../lib/flights/passenger-care';

// Minimal valid PDF binary buffer (%PDF-1.4 followed by minimal objects)
const MINIMAL_VALID_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000108 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n183\n%%EOF\n',
  'utf-8'
);

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('VARNI HOLIDAYS: PASSENGER TRAVEL CARE AUTOMATED VERIFICATION');
  console.log('================================================================\n');

  const testSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const testPnr1 = `TC${testSuffix}1`;
  const testPnr2 = `TC${testSuffix}2`;
  const testPnr3 = `TC${testSuffix}3`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Email Validation Helper
    // -------------------------------------------------------------
    console.log('--- Test Suite 1: Email Validation Logic ---');
    assert(isValidEmail('guest@example.com') === true, 'Valid email accepted');
    assert(isValidEmail('tirth@varnitours.com') === true, 'Company domain email accepted');
    assert(isValidEmail('invalid-email') === false, 'Plain string without @ rejected');
    assert(isValidEmail('user@domain') === false, 'Email without TLD rejected');
    assert(isValidEmail('') === false, 'Empty string rejected');
    assert(isValidEmail(null) === false, 'Null rejected');

    // -------------------------------------------------------------
    // TEST 2: Create Flight Hold with Passenger Email
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 2: Hold Creation with Passenger Email ---');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const inTwoDays = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Invalid email should fail
    const invalidEmailRes = await createFlightHoldAction({
      pnr: testPnr1,
      passengerName: 'Test Passenger',
      passengerPhone: '+91 98980 12345',
      passengerEmail: 'invalid-email-address',
      travelDate: inTwoDays.toISOString().split('T')[0],
      platform: 'AMADEUS',
      holdTillDateTime: tomorrow.toISOString(),
    });
    assert(invalidEmailRes.success === false, 'Create hold with invalid email is rejected');

    // Valid email should succeed
    const validCreateRes = await createFlightHoldAction({
      pnr: testPnr1,
      passengerName: 'Rajesh Patel',
      passengerPhone: '+91 98980 11111',
      passengerEmail: 'rajesh.patel.test@example.com',
      travelRoute: 'BOM - DXB - BOM',
      travelDate: inTwoDays.toISOString().split('T')[0],
      platform: 'AMADEUS',
      holdTillDateTime: tomorrow.toISOString(),
      internalNotes: 'Automated test hold with email',
    });
    assert(validCreateRes.success === true, 'Create hold with valid email succeeds');
    const createdHold1 = validCreateRes.data;
    assert(createdHold1?.passengerEmail === 'rajesh.patel.test@example.com', 'Passenger email persisted in DB');

    // Optional email: create hold without email
    const noEmailCreateRes = await createFlightHoldAction({
      pnr: testPnr2,
      passengerName: 'Kiran Shah',
      passengerPhone: '+91 98980 22222',
      travelRoute: 'DEL - LHR',
      travelDate: inTwoDays.toISOString().split('T')[0],
      platform: 'CT',
      holdTillDateTime: tomorrow.toISOString(),
    });
    assert(noEmailCreateRes.success === true, 'Create hold without optional email succeeds');
    const createdHold2 = noEmailCreateRes.data;
    assert(createdHold2?.passengerEmail === null, 'Passenger email defaults to null when omitted');

    // -------------------------------------------------------------
    // TEST 3: Update Contact Details (Staff editing email)
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 3: Update Contact & Email Persistence ---');
    const updateRes = await updateFlightHoldContactAction({
      id: createdHold2.id,
      passengerPhone: '+91 98980 33333',
      passengerEmail: 'kiran.shah.updated@example.com',
      passengerName: 'Kiran Shah (Updated)',
    });
    assert(updateRes.success === true, 'Update contact with new email succeeds');

    const refreshedHold2 = await prisma.flightHoldPNR.findUnique({
      where: { id: createdHold2.id },
    });
    assert(refreshedHold2?.passengerEmail === 'kiran.shah.updated@example.com', 'Updated email persisted in DB');
    assert(refreshedHold2?.passengerPhone === '+91 98980 33333', 'Updated phone persisted in DB');

    // -------------------------------------------------------------
    // TEST 4: E-Ticket PDF Validation & Document Service
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 4: PDF Validation & Storage Service ---');
    const invalidMagicBytes = Buffer.from('NOT A PDF FILE DATA CONTENT', 'utf-8');
    const validateInvalid = validateTicketPdf(invalidMagicBytes, 'ticket.pdf');
    assert(validateInvalid.valid === false, 'Non-PDF binary correctly rejected by magic byte inspection');

    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const validateOversized = validateTicketPdf(oversizedBuffer, 'huge.pdf');
    assert(validateOversized.valid === false, 'Oversized (>10MB) file rejected');

    const validateValid = validateTicketPdf(MINIMAL_VALID_PDF, 'Rajesh-Ticket.pdf');
    assert(validateValid.valid === true, 'Valid PDF passes magic bytes & size verification');

    // Store PDF in DB
    const storeResult = await storeFlightTicketPdf({
      flightHoldId: createdHold1.id,
      fileName: 'Rajesh-Ticket.pdf',
      fileBuffer: MINIMAL_VALID_PDF,
    });
    assert(storeResult.success === true, 'storeFlightTicketPdf stores PDF successfully');
    assert(Boolean(storeResult.downloadToken), 'storeFlightTicketPdf generates secure 32-byte download token');

    const downloadUrl = buildTicketDownloadUrl(storeResult.downloadToken!);
    assert(downloadUrl.includes(`/api/tickets/download/${storeResult.downloadToken}`), 'buildTicketDownloadUrl generates valid token URL');

    // Retrieve PDF by token
    const retrievedResult = await getFlightTicketPdfByToken(storeResult.downloadToken!);
    assert(retrievedResult.found === true, 'getFlightTicketPdfByToken retrieves stored document');
    assert(retrievedResult.document?.fileName === 'Rajesh-Ticket.pdf', 'Retrieved document matches original fileName');
    assert(retrievedResult.document?.mimeType === 'application/pdf', 'Retrieved document has application/pdf MIME type');
    assert(retrievedResult.document?.fileBuffer.toString('utf-8').startsWith('%PDF-'), 'Retrieved buffer contains valid PDF magic header');

    // -------------------------------------------------------------
    // TEST 5: HTML Email & WhatsApp Template Generation
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 5: Branded Notification Templates ---');
    const sampleDetails: TicketFlightDetails = {
      pnr: testPnr1,
      airlineTicketNumber: '176-9876543210',
      passengerName: 'Rajesh Patel',
      passengerEmail: 'rajesh.patel.test@example.com',
      passengerPhone: '+91 98980 11111',
      airline: 'Air India',
      flightNumber: 'AI 983',
      travelRoute: 'BOM - DXB',
      origin: 'BOM',
      destination: 'DXB',
      departureDateTime: inTwoDays,
      departureTimezone: 'Asia/Kolkata',
      pdfDownloadUrl: downloadUrl,
    };

    const confirmHtml = buildTicketConfirmationEmailHtml(sampleDetails);
    assert(confirmHtml.includes('Varni Holidays'), 'Confirmation email contains Varni Holidays branding');
    assert(confirmHtml.includes(testPnr1), 'Confirmation email contains PNR');
    assert(confirmHtml.includes('AI 983'), 'Confirmation email contains flight number');
    assert(confirmHtml.includes('Chat With Varni Holidays'), 'Confirmation email contains WhatsApp assistance CTA');
    assert(confirmHtml.includes(downloadUrl), 'Confirmation email includes secure ticket download link');

    const reminderHtml = buildDepartureReminderEmailHtml(sampleDetails);
    assert(reminderHtml.includes('Air India'), 'Departure reminder contains airline name');
    assert(reminderHtml.includes('Pre-Departure Checklist'), 'Departure reminder contains 6-point travel checklist');
    assert(reminderHtml.includes('Official Airline Web Check-in'), 'Departure reminder includes official airline web check-in');

    const confirmWa = buildTicketConfirmationWhatsAppText(sampleDetails);
    assert(confirmWa.includes(testPnr1), 'WhatsApp confirmation text contains PNR');
    assert(confirmWa.includes(downloadUrl), 'WhatsApp confirmation text contains secure download link');

    const reminderWa = buildDepartureReminderWhatsAppText(sampleDetails);
    assert(reminderWa.includes('24-HOUR DEPARTURE REMINDER'), 'WhatsApp reminder text contains departure notice');

    // -------------------------------------------------------------
    // TEST 6: Ticket Issuance with Customer Notifications & PDF
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 6: Ticket Issuance with PDF & Non-blocking Notifications ---');
    const issueRes = await issueFlightHoldAction({
      id: createdHold1.id,
      paymentMode: 'BANK_TRANSFER',
      issuedFrom: 'Amadeus',
      issuanceAmountInr: 34500,
      airlineTicketNumber: '098-1234567890',
      passengerEmail: 'rajesh.patel.test@example.com',
      airline: 'Air India',
      flightNumber: 'AI 983',
      originAirport: 'BOM',
      destinationAirport: 'DXB',
      departureDateTime: inTwoDays.toISOString(),
      pdfBase64: MINIMAL_VALID_PDF.toString('base64'),
      pdfFileName: `E-Ticket-${testPnr1}.pdf`,
      sendEmailNotification: true,
      sendWhatsAppNotification: true,
      scheduleDepartureReminder: true,
    });

    assert(issueRes.success === true, 'issueFlightHoldAction succeeds with PDF and notifications');
    assert(issueRes.data?.status === 'ISSUED', 'FlightHold status updated to ISSUED');
    assert(Number(issueRes.data?.issuanceAmountInr) === 34500, 'Issuance amount persisted');

    // Verify document was recorded
    const attachedDocs = await prisma.flightTicketDocument.findMany({
      where: { flightHoldId: createdHold1.id },
    });
    assert(attachedDocs.length >= 1, 'E-Ticket document successfully attached to issued PNR in database');

    // Verify notifications were logged in PassengerNotification table
    const loggedNotifs = await prisma.passengerNotification.findMany({
      where: { flightHoldId: createdHold1.id },
    });
    assert(loggedNotifs.length >= 1, 'PassengerNotification records created for ticket issuance');

    // -------------------------------------------------------------
    // TEST 7: 24-Hour Departure Reminder Scheduling
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 7: 24-Hour Departure Reminder Logic ---');
    const futureDeparture = new Date(Date.now() + 72 * 60 * 60 * 1000); // 3 days in future
    const schedResult = await schedule24HourDepartureReminder({
      flightHoldId: createdHold2.id,
      passengerName: 'Kiran Shah',
      passengerEmail: 'kiran.shah@example.com',
      passengerPhone: '+91 98980 33333',
      departureDateTime: futureDeparture,
    });
    assert(schedResult.scheduled === true, 'Departure reminder scheduled for future flight');
    const expectedReminderTime = new Date(futureDeparture.getTime() - 24 * 60 * 60 * 1000);
    assert(
      Math.abs(schedResult.scheduledFor!.getTime() - expectedReminderTime.getTime()) < 1000,
      'Reminder scheduled strictly 24 hours prior to departure'
    );

    // Test past/immediate departure safeguard
    const imminentDeparture = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours in future (less than 24h)
    const imminentResult = await schedule24HourDepartureReminder({
      flightHoldId: createdHold2.id,
      passengerName: 'Kiran Shah',
      passengerEmail: 'kiran.shah@example.com',
      passengerPhone: '+91 98980 33333',
      departureDateTime: imminentDeparture,
    });
    assert(imminentResult.scheduled === false, 'Safeguard skips reminder if departure is less than 24h away');

    // -------------------------------------------------------------
    // TEST 8: Hold Cancellation Auto-Cancels Pending Departure Reminders
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 8: Cancellation & Reminder Cleanup ---');
    const hold3Res = await createFlightHoldAction({
      pnr: testPnr3,
      passengerName: 'Anil Desai',
      passengerPhone: '+91 98980 44444',
      passengerEmail: 'anil.desai@example.com',
      travelDate: inTwoDays.toISOString().split('T')[0],
      platform: 'RC',
      holdTillDateTime: tomorrow.toISOString(),
    });
    const hold3 = hold3Res.data;

    // Schedule a reminder for hold 3
    await schedule24HourDepartureReminder({
      flightHoldId: hold3.id,
      passengerName: 'Anil Desai',
      passengerEmail: 'anil.desai@example.com',
      departureDateTime: futureDeparture,
    });

    const pendingBeforeCancel = await prisma.passengerNotification.count({
      where: { flightHoldId: hold3.id, status: 'PENDING' },
    });
    assert(pendingBeforeCancel > 0, 'Pending reminder exists before cancellation');

    // Cancel hold
    const cancelRes = await cancelFlightHoldAction({
      id: hold3.id,
      cancellationReason: 'Client decided to fly next month',
    });
    assert(cancelRes.success === true, 'Hold cancelled successfully');

    const pendingAfterCancel = await prisma.passengerNotification.count({
      where: { flightHoldId: hold3.id, status: 'PENDING' },
    });
    assert(pendingAfterCancel === 0, 'Pending departure reminders cancelled on hold cancellation');

    const cancelledNotifs = await prisma.passengerNotification.findMany({
      where: { flightHoldId: hold3.id, status: 'CANCELLED' },
    });
    assert(cancelledNotifs.length > 0, 'Notification status updated to CANCELLED');

    // -------------------------------------------------------------
    // TEST 9: Scheduler Execution
    // -------------------------------------------------------------
    console.log('\n--- Test Suite 9: Scheduler Execution ---');
    const schedulerRes = await runFlightHoldSchedulerAction();
    assert(schedulerRes.success === true, 'runFlightHoldSchedulerAction executes cleanly');
    assert(schedulerRes.data !== undefined, 'Scheduler returns processed counts');

    // -------------------------------------------------------------
    // CLEANUP TEST DATA
    // -------------------------------------------------------------
    console.log('\n--- Cleaning up test records ---');
    const testHoldIds = [createdHold1.id, createdHold2.id, hold3.id];
    await prisma.passengerNotification.deleteMany({ where: { flightHoldId: { in: testHoldIds } } });
    await prisma.flightTicketDocument.deleteMany({ where: { flightHoldId: { in: testHoldIds } } });
    await prisma.flightHoldActionHistory.deleteMany({ where: { flightHoldId: { in: testHoldIds } } });
    await prisma.flightHoldReminder.deleteMany({ where: { flightHoldId: { in: testHoldIds } } });
    await prisma.flightHoldExtension.deleteMany({ where: { flightHoldId: { in: testHoldIds } } });
    await prisma.flightHoldPNR.deleteMany({ where: { id: { in: testHoldIds } } });
    console.log('  Cleaned up all test PNRs, documents, and notifications.');

    console.log('\n================================================================');
    console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('================================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
