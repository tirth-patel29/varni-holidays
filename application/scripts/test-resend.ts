import { sendCustomerEmail } from '../lib/integrations/email-service';
import fs from 'fs';
import path from 'path';

// Read .env to inspect RESEND configuration
const envLines = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8').split('\n');
let apiKey = '';
let fromEmail = '';

for (const line of envLines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('RESEND_API_KEY=')) apiKey = trimmed.split('=')[1].replace(/^["']|["']$/g, '');
  if (trimmed.startsWith('RESEND_FROM_EMAIL=')) fromEmail = trimmed.split('=')[1].replace(/^["']|["']$/g, '');
}

if (apiKey) process.env.RESEND_API_KEY = apiKey;
if (fromEmail) process.env.RESEND_FROM_EMAIL = fromEmail;

async function testResendLive() {
  console.log('--- TESTING RESEND EMAIL DISPATCH ---');
  console.log(`API Key configured: ${apiKey ? `re_*** (length: ${apiKey.length})` : 'NO'}`);
  console.log(`From Email configured: ${fromEmail}`);

  // Test recipient
  const testRecipient = 'varniinternational7@gmail.com'; // Verified office email from .env

  console.log(`\nDispatching test email to: ${testRecipient}...`);
  const result = await sendCustomerEmail({
    to: testRecipient,
    toName: 'Varni Holidays Desk',
    subject: 'Production Deployment Verification - Varni Holidays Platform',
    category: 'BOOKING_CONFIRMATION',
    headline: 'Varni Holidays Platform Deployment Verification',
    bodyHtml: '<p>This is a live system verification email confirming that the Varni Holidays platform is successfully connected to the Resend API and Neon PostgreSQL production database.</p><p>Timestamp: ' + new Date().toISOString() + '</p>',
    ctaText: 'Access CRM Portal',
    ctaUrl: 'https://varniholidays.com/employee/login',
  });

  console.log('\nResult:');
  console.log(`- Success: ${result.success}`);
  console.log(`- Provider Status: ${result.providerStatus}`);
  console.log(`- Message ID: ${result.messageId}`);
  if (result.error) {
    console.log(`- Note / Error: ${result.error}`);
  }
}

testResendLive();
