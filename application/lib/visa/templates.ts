import { COMPANY_CONTACT } from '@/lib/config/contact';
import { VisaApplicationStatusCode } from '@/lib/crm/types';

export interface VisaEmailTemplateDefinition {
  code: string;
  title: string;
  triggerStatus: VisaApplicationStatusCode;
  defaultSubject: string;
  description: string;
  purpose: string;
  bodyHtml: string;
  bodyText: string;
}

export interface VisaTemplateContext {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  destination_country?: string;
  visa_type?: string;
  application_reference?: string;
  official_reference?: string;
  inquiry_date?: string;
  document_received_date?: string;
  submission_date?: string;
  approval_date?: string;
  decision_date?: string;
  employee_name?: string;
  employee_email?: string;
  employee_phone?: string;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  additional_message?: string;
}

export const VISA_EMAIL_TEMPLATES: Record<string, VisaEmailTemplateDefinition> = {
  INQUIRY_RECEIVED: {
    code: 'INQUIRY_RECEIVED',
    title: 'Email 1 — Inquiry Received',
    triggerStatus: 'INQUIRY_RECEIVED',
    defaultSubject: 'Your Visa Assistance Journey Has Started – Varni Holidays',
    description: 'Sent when an employee registers a new visa inquiry in the CRM.',
    purpose: 'Confirms registration of visa inquiry, explains the roadmap, and introduces assigned visa officer.',
    bodyText: `Dear {{customer_name}},

Namaste from Varni Holidays!

Thank you for choosing Varni Holidays for your {{destination_country}} ({{visa_type}}) visa assistance. We are delighted to confirm that your visa inquiry dossier has been successfully registered under reference {{application_reference}}.

Our dedicated visa counselor, {{employee_name}}, will personally guide you through each milestone of the process. We will soon share the complete, up-to-date checklist of document requirements, financial proofs, and photograph specifications tailored to {{destination_country}} consular guidelines.

Application Summary:
• Reference Number: {{application_reference}}
• Destination: {{destination_country}}
• Visa Category: {{visa_type}}
• Registration Date: {{inquiry_date}}
• Assigned Visa Officer: {{employee_name}} ({{employee_phone}} | {{employee_email}})

Next Steps:
1. Review the personalized checklist sent by our visa desk.
2. Collate your original passports, financial records, and supporting documents.
3. Submit your documents physically at our Anand office or digitally via our secure client portal.

{{additional_message}}

Should you have any immediate questions, please feel free to reach out to our Anand headquarters.

Warm regards,
{{employee_name}}
Visa Operations Desk | {{company_name}}
Office: {{company_address}}
Phone: {{company_phone}} | Email: {{company_email}}`,
    bodyHtml: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E8ED;">
  <!-- Header Bar -->
  <div style="background-color: #002037; padding: 24px 30px; border-bottom: 3px solid #E9B95E;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif;">VARNI HOLIDAYS</div>
          <div style="font-size: 11px; color: #E9B95E; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">Global Visa Guidance & Concierge</div>
        </td>
        <td align="right">
          <span style="display: inline-block; background-color: rgba(233,185,94,0.15); border: 1px solid #E9B95E; color: #E9B95E; font-size: 10px; font-weight: bold; padding: 4px 10px; text-transform: uppercase; letter-spacing: 1px;">
            Inquiry Registered
          </span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Body Content -->
  <div style="padding: 32px 30px; color: #172B45; line-height: 1.6; font-size: 14px;">
    <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #002037;">Dear {{customer_name}},</p>
    <p>Namaste from Varni Holidays!</p>
    <p>Thank you for placing your trust in Varni Holidays. We are pleased to confirm that your visa inquiry for <strong>{{destination_country}} ({{visa_type}})</strong> has been officially registered in our system under reference <strong style="color: #002037; font-family: monospace;">{{application_reference}}</strong>.</p>
    <p>Our dedicated visa counselor, <strong>{{employee_name}}</strong>, will personally navigate every requirement with you to ensure complete compliance with the relevant consular standards.</p>

    <!-- Key Details Box -->
    <div style="background-color: #F8F6F0; border-left: 4px solid #002037; padding: 18px 20px; margin: 24px 0;">
      <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="40%" style="color: #718096; font-weight: 600;">Dossier Reference:</td>
          <td style="color: #002037; font-weight: bold; font-family: monospace;">{{application_reference}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Destination Country:</td>
          <td style="color: #002037; font-weight: bold;">{{destination_country}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Visa Classification:</td>
          <td style="color: #002037;">{{visa_type}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Registration Date:</td>
          <td style="color: #002037;">{{inquiry_date}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Dedicated Officer:</td>
          <td style="color: #002037; font-weight: 600;">{{employee_name}} ({{employee_phone}})</td>
        </tr>
      </table>
    </div>

    <!-- Next Steps -->
    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #002037; margin-bottom: 12px; border-bottom: 1px solid #E5E8ED; padding-bottom: 6px;">Next Steps</h3>
    <ol style="padding-left: 20px; margin: 0 0 20px 0; font-size: 13px; color: #4A5568;">
      <li style="margin-bottom: 8px;"><strong>Custom Checklist:</strong> Our visa desk will provide the exact, country-specific documentation checklist.</li>
      <li style="margin-bottom: 8px;"><strong>Document Collection:</strong> Gather your passport, photographs, financial proofs, and relevant affidavits.</li>
      <li style="margin-bottom: 8px;"><strong>Submission:</strong> Bring your papers to our Anand office or submit them to your assigned officer.</li>
    </ol>

    {{additional_message}}

    <p style="margin-top: 24px; font-size: 13px; color: #718096;">
      Warm regards,<br />
      <strong style="color: #002037;">{{employee_name}}</strong><br />
      Visa Operations Team | {{company_name}}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #F8FAFC; border-top: 1px solid #E5E8ED; padding: 20px 30px; font-size: 11px; color: #718096; text-align: center;">
    <div><strong>{{company_name}}</strong> • {{company_address}}</div>
    <div style="margin-top: 4px;">Direct Phone: {{company_phone}} • Email: {{company_email}}</div>
    <div style="margin-top: 8px; color: #A0AEC0; font-size: 10px;">
      This email contains operational updates for your registered file. Please retain this for your records.
    </div>
  </div>
</div>`
  },

  DOCUMENTS_RECEIVED: {
    code: 'DOCUMENTS_RECEIVED',
    title: 'Email 2 — Documents Received',
    triggerStatus: 'DOCUMENTS_RECEIVED',
    defaultSubject: 'Documents Received – Varni Holidays',
    description: 'Sent when customer documents are received at the visa desk.',
    purpose: 'Confirms receipt of physical/digital papers, initiates thorough internal audit, sets expectation for follow-up without falsely guaranteeing verification.',
    bodyText: `Dear {{customer_name}},

Namaste from Varni Holidays!

We are pleased to inform you that we have received your documents for your {{destination_country}} ({{visa_type}}) visa application under reference {{application_reference}}.

Milestone Status:
• Reference Number: {{application_reference}}
• Date Received: {{document_received_date}}
• Destination: {{destination_country}}
• Stage: Documents Under Internal Review

What Happens Next:
Our compliance specialists are currently reviewing each page to ensure complete alignment with current consular guidelines, photo sizing standards, and financial documentation protocols. 

Please note that receipt of documents does not imply consular verification. Should our team identify any missing paperwork, notarization needs, or discrepancies, we will reach out promptly to assist you.

{{additional_message}}

Warm regards,
{{employee_name}}
Visa Operations Desk | {{company_name}}
Office: {{company_address}}
Phone: {{company_phone}}`,
    bodyHtml: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E8ED;">
  <!-- Header Bar -->
  <div style="background-color: #002037; padding: 24px 30px; border-bottom: 3px solid #E9B95E;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif;">VARNI HOLIDAYS</div>
          <div style="font-size: 11px; color: #E9B95E; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">Document Verification Desk</div>
        </td>
        <td align="right">
          <span style="display: inline-block; background-color: #168653; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 4px 10px; text-transform: uppercase; letter-spacing: 1px;">
            Papers Received
          </span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Body Content -->
  <div style="padding: 32px 30px; color: #172B45; line-height: 1.6; font-size: 14px;">
    <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #002037;">Dear {{customer_name}},</p>
    <p>Namaste from Varni Holidays!</p>
    <p>We are pleased to inform you that your documents for your <strong>{{destination_country}} ({{visa_type}})</strong> application have been received by our visa desk under reference <strong style="color: #002037; font-family: monospace;">{{application_reference}}</strong>.</p>

    <!-- Key Details Box -->
    <div style="background-color: #F8F6F0; border-left: 4px solid #168653; padding: 18px 20px; margin: 24px 0;">
      <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="40%" style="color: #718096; font-weight: 600;">Dossier Reference:</td>
          <td style="color: #002037; font-weight: bold; font-family: monospace;">{{application_reference}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Destination:</td>
          <td style="color: #002037; font-weight: bold;">{{destination_country}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Receipt Timestamp:</td>
          <td style="color: #002037;">{{document_received_date}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Current Stage:</td>
          <td style="color: #168653; font-weight: bold;">Under Detailed Document Review</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #4A5568;">
      Our visa verification officers are now conducting a thorough pre-screening of your paperwork to confirm that every form, statement, and certificate satisfies the precise criteria of the consular authority.
    </p>

    <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px 16px; margin: 18px 0; font-size: 12px; color: #1E40AF;">
      <strong>Note:</strong> Receipt of documents does not imply final verification or guarantee consular approval. Should any supplemental paperwork or clarity be required, your assigned officer will reach out directly.
    </div>

    {{additional_message}}

    <p style="margin-top: 24px; font-size: 13px; color: #718096;">
      Warm regards,<br />
      <strong style="color: #002037;">{{employee_name}}</strong><br />
      Visa Operations Team | {{company_name}}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #F8FAFC; border-top: 1px solid #E5E8ED; padding: 20px 30px; font-size: 11px; color: #718096; text-align: center;">
    <div><strong>{{company_name}}</strong> • {{company_address}}</div>
    <div style="margin-top: 4px;">Phone: {{company_phone}} • Email: {{company_email}}</div>
  </div>
</div>`
  },

  FILE_SUBMITTED: {
    code: 'FILE_SUBMITTED',
    title: 'Email 3 — Visa File Submitted',
    triggerStatus: 'FILE_SUBMITTED',
    defaultSubject: 'Your Visa Application Has Been Submitted – Varni Holidays',
    description: 'Sent when the application file is formally lodged with the consulate/embassy portal or VFS.',
    purpose: 'Notifies customer of official lodgement, provides portal tracking reference, sets realistic expectation that decision timeline is in sovereign authority hands.',
    bodyText: `Dear {{customer_name}},

Namaste from Varni Holidays!

We are pleased to inform you that your official visa application for {{destination_country}} ({{visa_type}}) has been formally submitted.

Lodgement Details:
• Varni Reference: {{application_reference}}
• Official Tracking Reference: {{official_reference}}
• Destination: {{destination_country}}
• Submission Date: {{submission_date}}
• Assigned Visa Officer: {{employee_name}}

Important Processing Notice:
Your application file is now under active processing with the official immigration and consular authorities of {{destination_country}}. 

Please be advised that all final decisions, processing turnaround times, and biometric/interview schedules are determined exclusively by the respective embassy/high commission. While Varni Holidays actively tracks your file, sovereign authorities do not provide guaranteed delivery windows.

We will notify you immediately once official updates or interview notifications become available.

{{additional_message}}

Warm regards,
{{employee_name}}
Visa Operations Desk | {{company_name}}
Office: {{company_address}}
Phone: {{company_phone}}`,
    bodyHtml: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E8ED;">
  <!-- Header Bar -->
  <div style="background-color: #002037; padding: 24px 30px; border-bottom: 3px solid #E9B95E;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif;">VARNI HOLIDAYS</div>
          <div style="font-size: 11px; color: #E9B95E; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">Consular Lodgement Update</div>
        </td>
        <td align="right">
          <span style="display: inline-block; background-color: #24689B; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 4px 10px; text-transform: uppercase; letter-spacing: 1px;">
            File Lodged
          </span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Body Content -->
  <div style="padding: 32px 30px; color: #172B45; line-height: 1.6; font-size: 14px;">
    <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #002037;">Dear {{customer_name}},</p>
    <p>Namaste from Varni Holidays!</p>
    <p>We are pleased to notify you that your visa file for <strong>{{destination_country}} ({{visa_type}})</strong> has been officially lodged with the relevant consular processing center.</p>

    <!-- Key Details Box -->
    <div style="background-color: #F8F6F0; border-left: 4px solid #24689B; padding: 18px 20px; margin: 24px 0;">
      <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="42%" style="color: #718096; font-weight: 600;">Internal Reference:</td>
          <td style="color: #002037; font-weight: bold; font-family: monospace;">{{application_reference}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Official Consular Ref:</td>
          <td style="color: #24689B; font-weight: bold; font-family: monospace;">{{official_reference}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Destination Country:</td>
          <td style="color: #002037; font-weight: bold;">{{destination_country}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Lodgement Date:</td>
          <td style="color: #002037;">{{submission_date}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Status:</td>
          <td style="color: #24689B; font-weight: bold;">Under Active Sovereign Processing</td>
        </tr>
      </table>
    </div>

    <!-- Realistic Expectation Notice -->
    <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; padding: 14px 16px; margin: 18px 0; font-size: 12px; color: #92400E; line-height: 1.5;">
      <strong>Important Advisory:</strong> The outcome of your application and all processing timelines remain solely under the statutory jurisdiction of the Embassy / High Commission of {{destination_country}}. Varni Holidays does not guarantee issuance or exact decision timeframes.
    </div>

    {{additional_message}}

    <p style="margin-top: 24px; font-size: 13px; color: #718096;">
      Warm regards,<br />
      <strong style="color: #002037;">{{employee_name}}</strong><br />
      Visa Operations Team | {{company_name}}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #F8FAFC; border-top: 1px solid #E5E8ED; padding: 20px 30px; font-size: 11px; color: #718096; text-align: center;">
    <div><strong>{{company_name}}</strong> • {{company_address}}</div>
    <div style="margin-top: 4px;">Phone: {{company_phone}} • Email: {{company_email}}</div>
  </div>
</div>`
  },

  VISA_APPROVED: {
    code: 'VISA_APPROVED',
    title: 'Email 4A — Visa Approved',
    triggerStatus: 'VISA_APPROVED',
    defaultSubject: 'Congratulations! Your Visa Has Been Approved – Varni Holidays',
    description: 'Sent strictly after employee verifies the official approval letter/sticker from the embassy.',
    purpose: 'Celebrates approval, provides destination & travel advisory, informs about attached verified e-visa/passport collection, outlines next holiday preparation steps.',
    bodyText: `Dear {{customer_name}},

Congratulations from the entire team at Varni Holidays!

We are thrilled to share the wonderful news: your visa for {{destination_country}} ({{visa_type}}) has been officially APPROVED!

Approval Highlights:
• Reference Number: {{application_reference}}
• Official Reference: {{official_reference}}
• Destination: {{destination_country}}
• Visa Category: {{visa_type}}
• Decision Date: {{approval_date}}
• Primary Applicant: {{customer_name}}

Next Steps & Travel Readiness:
1. Document Verification: Please inspect your approved visa document (attached herewith or available at our Anand office) to confirm exact spelling of name, passport number, validity dates, and entry category.
2. Passport Collection: If physical stamping was conducted, your passport is safely stored in our Anand vault and ready for pickup during office hours.
3. Travel Insurance & Flights: If you require flight ticketing, hotel vouchers, or comprehensive overseas travel insurance, your Varni travel counselor is ready to assist.

{{additional_message}}

Thank you for choosing Varni Holidays as your trusted travel partner. We wish you a delightful and safe journey ahead!

Warmest congratulations,
{{employee_name}}
Visa Operations Desk | {{company_name}}
Office: {{company_address}}
Phone: {{company_phone}}`,
    bodyHtml: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E8ED;">
  <!-- Header Bar -->
  <div style="background-color: #002037; padding: 24px 30px; border-bottom: 3px solid #E9B95E;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif;">VARNI HOLIDAYS</div>
          <div style="font-size: 11px; color: #E9B95E; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">Official Visa Milestone</div>
        </td>
        <td align="right">
          <span style="display: inline-block; background-color: #168653; color: #FFFFFF; font-size: 11px; font-weight: bold; padding: 5px 12px; text-transform: uppercase; letter-spacing: 1px;">
            ✓ VISA APPROVED
          </span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Body Content -->
  <div style="padding: 32px 30px; color: #172B45; line-height: 1.6; font-size: 14px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #F0FDF4; border: 2px solid #168653; border-radius: 50%; line-height: 48px; font-size: 24px; color: #168653; text-align: center;">
        ✓
      </div>
      <h2 style="font-size: 22px; color: #002037; margin: 12px 0 4px 0; font-family: 'Playfair Display', Georgia, serif;">Congratulations, {{customer_name}}!</h2>
      <p style="font-size: 14px; color: #168653; font-weight: 600; margin: 0;">Your {{destination_country}} Visa has been Officially Approved</p>
    </div>

    <p>Namaste from Varni Holidays!</p>
    <p>We are delighted to bring you this joyful update. The consular authority has verified your application and granted your visa for <strong>{{destination_country}}</strong>.</p>

    <!-- Key Details Box -->
    <div style="background-color: #F8F6F0; border-left: 4px solid #168653; padding: 18px 20px; margin: 24px 0;">
      <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="42%" style="color: #718096; font-weight: 600;">Application Ref:</td>
          <td style="color: #002037; font-weight: bold; font-family: monospace;">{{application_reference}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Consular Ref:</td>
          <td style="color: #002037; font-weight: bold; font-family: monospace;">{{official_reference}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Destination:</td>
          <td style="color: #002037; font-weight: bold;">{{destination_country}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Visa Category:</td>
          <td style="color: #002037;">{{visa_type}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Approval Date:</td>
          <td style="color: #168653; font-weight: bold;">{{approval_date}}</td>
        </tr>
      </table>
    </div>

    <!-- Travel Checklist -->
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #002037; margin-bottom: 10px; border-bottom: 1px solid #E5E8ED; padding-bottom: 6px;">Important Pre-Travel Checklist</h3>
    <ul style="padding-left: 20px; margin: 0 0 20px 0; font-size: 13px; color: #4A5568;">
      <li style="margin-bottom: 6px;"><strong>Name & Dates Verification:</strong> Check that your name, date of birth, and passport number match your passport bio-data page precisely.</li>
      <li style="margin-bottom: 6px;"><strong>Passport Pickup:</strong> For physical passport endorsements, collect your original passport from our Anand office.</li>
      <li style="margin-bottom: 6px;"><strong>Travel Coverage:</strong> Ensure mandatory international travel medical insurance is active for your full length of stay.</li>
    </ul>

    {{additional_message}}

    <p style="margin-top: 24px; font-size: 13px; color: #718096;">
      Warmest congratulations,<br />
      <strong style="color: #002037;">{{employee_name}}</strong><br />
      Visa Operations Team | {{company_name}}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #F8FAFC; border-top: 1px solid #E5E8ED; padding: 20px 30px; font-size: 11px; color: #718096; text-align: center;">
    <div><strong>{{company_name}}</strong> • {{company_address}}</div>
    <div style="margin-top: 4px;">Phone: {{company_phone}} • Email: {{company_email}}</div>
  </div>
</div>`
  },

  ADDITIONAL_INFORMATION_REQUIRED: {
    code: 'ADDITIONAL_INFORMATION_REQUIRED',
    title: 'Email 4B — Important Update / Office Visit Required',
    triggerStatus: 'ADDITIONAL_INFORMATION_REQUIRED',
    defaultSubject: 'Important Update Regarding Your Visa Application – Varni Holidays',
    description: 'Triggered when supplemental consular requirements or an in-person office consultation is required.',
    purpose: 'Politely requests in-person or direct telephone contact while strictly shielding sensitive data from email.',
    bodyText: `Dear {{customer_name}},

Namaste from Varni Holidays.

We are writing with reference to your ongoing {{destination_country}} ({{visa_type}}) visa application under reference {{application_reference}}.

Our visa operations desk has received an important update regarding your file from the processing channel. To protect your personal privacy and sensitive application credentials, we do not discuss detailed consular instructions via unencrypted email.

We kindly request you to connect with your assigned visa counselor or visit our Anand headquarters at your earliest convenience:

Office Contact & Location:
• Varni Holidays Anand HQ: {{company_address}}
• Operating Hours: Monday to Saturday, 10:00 AM – 7:00 PM
• Direct Phone: {{employee_phone}} / {{company_phone}}
• Assigned Visa Counselor: {{employee_name}}
• Application Reference: {{application_reference}}

{{additional_message}}

Please have your application reference ready when you call or visit so we can attend to your file immediately.

Warm regards,
{{employee_name}}
Visa Operations Desk | {{company_name}}
Office: {{company_address}}
Phone: {{company_phone}}`,
    bodyHtml: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E8ED;">
  <!-- Header Bar -->
  <div style="background-color: #002037; padding: 24px 30px; border-bottom: 3px solid #E9B95E;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif;">VARNI HOLIDAYS</div>
          <div style="font-size: 11px; color: #E9B95E; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">Important File Communication</div>
        </td>
        <td align="right">
          <span style="display: inline-block; background-color: #D97706; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 4px 10px; text-transform: uppercase; letter-spacing: 1px;">
            Action Required
          </span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Body Content -->
  <div style="padding: 32px 30px; color: #172B45; line-height: 1.6; font-size: 14px;">
    <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #002037;">Dear {{customer_name}},</p>
    <p>Namaste from Varni Holidays.</p>
    <p>We are writing regarding your <strong>{{destination_country}} ({{visa_type}})</strong> visa application registered under reference <strong style="color: #002037; font-family: monospace;">{{application_reference}}</strong>.</p>
    <p>Our visa desk has received an important update regarding your application file that requires your prompt attention.</p>

    <!-- Privacy Shield Notice -->
    <div style="background-color: #EFF6FF; border-left: 4px solid #24689B; padding: 16px 20px; margin: 20px 0; font-size: 13px; color: #1E40AF;">
      <strong>Data Privacy Notice:</strong> In adherence to strict client confidentiality and data security protocols, sensitive consular correspondence and identity records are not transmitted over unencrypted email channels.
    </div>

    <!-- Office Visit Box -->
    <div style="background-color: #F8F6F0; border: 1px solid #E5E8ED; padding: 20px; margin: 20px 0;">
      <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #002037; margin-bottom: 12px;">
        Please Contact or Visit Our Office
      </div>
      <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="35%" style="color: #718096; font-weight: 600;">Office Location:</td>
          <td style="color: #002037; font-weight: 600;">{{company_address}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Operating Hours:</td>
          <td style="color: #002037;">Monday – Saturday (10:00 AM – 7:00 PM)</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Direct Contact:</td>
          <td style="color: #002037; font-weight: bold;">{{employee_phone}} / {{company_phone}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Officer in Charge:</td>
          <td style="color: #002037;">{{employee_name}}</td>
        </tr>
      </table>
    </div>

    {{additional_message}}

    <p style="margin-top: 24px; font-size: 13px; color: #718096;">
      Warm regards,<br />
      <strong style="color: #002037;">{{employee_name}}</strong><br />
      Visa Operations Team | {{company_name}}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #F8FAFC; border-top: 1px solid #E5E8ED; padding: 20px 30px; font-size: 11px; color: #718096; text-align: center;">
    <div><strong>{{company_name}}</strong> • {{company_address}}</div>
    <div style="margin-top: 4px;">Phone: {{company_phone}} • Email: {{company_email}}</div>
  </div>
</div>`
  },

  VISA_REJECTED: {
    code: 'VISA_REJECTED',
    title: 'Email 4C — Visa Decision / Next Options',
    triggerStatus: 'VISA_REJECTED',
    defaultSubject: 'Update Regarding Your Visa Application – Varni Holidays',
    description: 'Sent after respectful verification of an unfavorable official consular decision.',
    purpose: 'Communicates official outcome with dignity and empathy, avoids blame, and offers guidance on re-application, appeal, or refund procedures.',
    bodyText: `Dear {{customer_name}},

Namaste from Varni Holidays.

We are writing with respect to your {{destination_country}} ({{visa_type}}) visa application under reference {{application_reference}}.

We have received the official communication from the consular authority regarding your application. Regrettably, the consular authority has decided not to grant the visa at this time (Decision Date: {{decision_date}}).

Please be assured that consular evaluations are made strictly at the independent discretion of embassy visa officers based on internal assessment metrics. This decision is not a reflection of your credibility, and many applicants successfully secure approvals upon addressing specific requirements or submitting supplementary documentation.

Available Next Steps:
1. Re-application Strategy: Our senior visa counselors can review the official rejection notice with you and explore whether a re-submission with strengthened documentation is viable.
2. Alternative Destinations: We can evaluate other international holiday or business destinations with flexible visa frameworks.
3. Original Document Return: Any original physical documents submitted with your file are safeguarded in our office and available for collection.

{{additional_message}}

Please feel free to connect directly with {{employee_name}} at {{employee_phone}} to discuss your options.

Warm regards,
{{employee_name}}
Visa Operations Desk | {{company_name}}
Office: {{company_address}}
Phone: {{company_phone}}`,
    bodyHtml: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E8ED;">
  <!-- Header Bar -->
  <div style="background-color: #002037; padding: 24px 30px; border-bottom: 3px solid #E9B95E;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif;">VARNI HOLIDAYS</div>
          <div style="font-size: 11px; color: #E9B95E; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">Consular Decision Notice</div>
        </td>
        <td align="right">
          <span style="display: inline-block; background-color: #4A5568; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 4px 10px; text-transform: uppercase; letter-spacing: 1px;">
            Official Decision
          </span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Body Content -->
  <div style="padding: 32px 30px; color: #172B45; line-height: 1.6; font-size: 14px;">
    <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #002037;">Dear {{customer_name}},</p>
    <p>Namaste from Varni Holidays.</p>
    <p>We are writing to provide you with the official outcome received from the consular authority regarding your <strong>{{destination_country}} ({{visa_type}})</strong> visa application under reference <strong style="color: #002037; font-family: monospace;">{{application_reference}}</strong>.</p>
    <p>Regrettably, the consular authority has notified us that the application has not been approved at this time.</p>

    <!-- Details Box -->
    <div style="background-color: #F8FAFC; border-left: 4px solid #718096; padding: 18px 20px; margin: 20px 0; font-size: 13px;">
      <table width="100%" cellpadding="4" cellspacing="0" border="0">
        <tr>
          <td width="42%" style="color: #718096; font-weight: 600;">Dossier Reference:</td>
          <td style="color: #002037; font-weight: bold; font-family: monospace;">{{application_reference}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Destination Country:</td>
          <td style="color: #002037; font-weight: bold;">{{destination_country}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Official Decision Date:</td>
          <td style="color: #002037;">{{decision_date}}</td>
        </tr>
      </table>
    </div>

    <!-- Respectful Guidance -->
    <p style="font-size: 13px; color: #4A5568;">
      Consular assessments are conducted solely under the sovereign prerogative of the visa officers. An unfavorable decision is not a reflection of your background, and many applicants successfully obtain visas after reviewing specific requirements or choosing alternative travel solutions.
    </p>

    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #002037; margin: 18px 0 8px 0; border-bottom: 1px solid #E5E8ED; padding-bottom: 6px;">Next Recommended Steps</h3>
    <ul style="padding-left: 20px; margin: 0 0 18px 0; font-size: 13px; color: #4A5568;">
      <li style="margin-bottom: 6px;"><strong>File Review:</strong> Schedule a consultation with our senior visa advisor to analyze the consular feedback.</li>
      <li style="margin-bottom: 6px;"><strong>Re-application or Appeal:</strong> We can examine whether supplementary documentation allows a strengthened re-submission.</li>
      <li style="margin-bottom: 6px;"><strong>Original Document Retrieval:</strong> Your original passports and records are safely stored at our Anand office for collection.</li>
    </ul>

    {{additional_message}}

    <p style="margin-top: 24px; font-size: 13px; color: #718096;">
      Warm regards,<br />
      <strong style="color: #002037;">{{employee_name}}</strong><br />
      Visa Operations Team | {{company_name}}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #F8FAFC; border-top: 1px solid #E5E8ED; padding: 20px 30px; font-size: 11px; color: #718096; text-align: center;">
    <div><strong>{{company_name}}</strong> • {{company_address}}</div>
    <div style="margin-top: 4px;">Phone: {{company_phone}} • Email: {{company_email}}</div>
  </div>
</div>`
  },

  COMPLETED: {
    code: 'COMPLETED',
    title: 'Email 5 — Visa Service Completed',
    triggerStatus: 'COMPLETED',
    defaultSubject: 'Thank You for Choosing Varni Holidays!',
    description: 'Sent when the entire visa service is fulfilled, passports handed over, and file archived.',
    purpose: 'Expresses sincere gratitude, provides final international travel reminders, and invites ongoing relationship for future holidays.',
    bodyText: `Dear {{customer_name}},

Namaste from Varni Holidays!

We are writing to formally confirm that all visa assistance services for your {{destination_country}} ({{visa_type}}) application (Reference: {{application_reference}}) have been successfully completed.

It has been an absolute privilege for our team to serve you throughout this journey.

Final Pre-Departure Checklist:
• Confirm that your passport possesses at least 6 months validity from your scheduled date of return.
• Carry physical printouts of your approved visa and travel insurance policy.
• Check baggage allowances and airline check-in timelines.

Whenever you plan your next international vacation, customized domestic tour, or corporate flight booking, our team in Anand will be honoured to assist you once again.

{{additional_message}}

Wishing you joyful holidays, smooth skies, and memorable experiences!

With heartfelt appreciation,
{{employee_name}} & The Varni Holidays Family
{{company_name}}
Office: {{company_address}}
Phone: {{company_phone}} | Email: {{company_email}}`,
    bodyHtml: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E8ED;">
  <!-- Header Bar -->
  <div style="background-color: #002037; padding: 24px 30px; border-bottom: 3px solid #E9B95E;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif;">VARNI HOLIDAYS</div>
          <div style="font-size: 11px; color: #E9B95E; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">Service Fulfillment</div>
        </td>
        <td align="right">
          <span style="display: inline-block; background-color: #E9B95E; color: #002037; font-size: 10px; font-weight: bold; padding: 4px 10px; text-transform: uppercase; letter-spacing: 1px;">
            Service Completed
          </span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Body Content -->
  <div style="padding: 32px 30px; color: #172B45; line-height: 1.6; font-size: 14px;">
    <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #002037;">Dear {{customer_name}},</p>
    <p>Namaste from Varni Holidays!</p>
    <p>We are delighted to confirm that all visa assistance services for your <strong>{{destination_country}} ({{visa_type}})</strong> journey under reference <strong style="color: #002037; font-family: monospace;">{{application_reference}}</strong> have been completed successfully.</p>
    <p>It has been our genuine pleasure to assist you, and we sincerely thank you for giving us the opportunity to be part of your travel story.</p>

    <!-- Key Details Box -->
    <div style="background-color: #F8F6F0; border-left: 4px solid #E9B95E; padding: 18px 20px; margin: 24px 0;">
      <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="42%" style="color: #718096; font-weight: 600;">Service Reference:</td>
          <td style="color: #002037; font-weight: bold; font-family: monospace;">{{application_reference}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Destination Country:</td>
          <td style="color: #002037; font-weight: bold;">{{destination_country}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Service Category:</td>
          <td style="color: #002037;">{{visa_type}}</td>
        </tr>
        <tr>
          <td style="color: #718096; font-weight: 600;">Status:</td>
          <td style="color: #168653; font-weight: bold;">Completed & Archived</td>
        </tr>
      </table>
    </div>

    <!-- Final Reminders -->
    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #002037; margin-bottom: 10px; border-bottom: 1px solid #E5E8ED; padding-bottom: 6px;">Final Travel Reminders</h3>
    <ul style="padding-left: 20px; margin: 0 0 20px 0; font-size: 13px; color: #4A5568;">
      <li style="margin-bottom: 6px;">Carry your valid passport and printed visa documents during check-in and immigration.</li>
      <li style="margin-bottom: 6px;">Review international roaming, currency exchange, and medical insurance coverage.</li>
    </ul>

    {{additional_message}}

    <p style="margin-top: 24px; font-size: 13px; color: #718096;">
      With warmest appreciation,<br />
      <strong style="color: #002037;">{{employee_name}} & The Varni Holidays Team</strong><br />
      {{company_name}}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #F8FAFC; border-top: 1px solid #E5E8ED; padding: 20px 30px; font-size: 11px; color: #718096; text-align: center;">
    <div><strong>{{company_name}}</strong> • {{company_address}}</div>
    <div style="margin-top: 4px;">Phone: {{company_phone}} • Email: {{company_email}}</div>
  </div>
</div>`
  },
};

/**
 * Format ISO date string into readable DD/MM/YYYY
 */
export function formatVisaDate(dateStr?: string | null): string {
  if (!dateStr) return 'Pending / Under Verification';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Assemble default context with company branding and fallback defaults
 */
export function buildVisaContext(
  customContext: Partial<VisaTemplateContext> = {}
): Record<string, string> {
  const defaults: Record<string, string> = {
    customer_name: customContext.customer_name || 'Valued Applicant',
    customer_email: customContext.customer_email || '',
    customer_phone: customContext.customer_phone || '',
    destination_country: customContext.destination_country || 'Canada',
    visa_type: customContext.visa_type || 'Tourist / Visitor Visa',
    application_reference: customContext.application_reference || 'VH-VIS-202611-0001',
    official_reference: customContext.official_reference || 'Pending Consular Assignment',
    inquiry_date: formatVisaDate(customContext.inquiry_date) || formatVisaDate(new Date().toISOString()),
    document_received_date: formatVisaDate(customContext.document_received_date),
    submission_date: formatVisaDate(customContext.submission_date),
    approval_date: formatVisaDate(customContext.approval_date || customContext.decision_date),
    decision_date: formatVisaDate(customContext.decision_date),
    employee_name: customContext.employee_name || 'Ananya Joshi',
    employee_email: customContext.employee_email || 'ananya@varniholidays.com',
    employee_phone: customContext.employee_phone || '+91 94260 45678',
    company_name: COMPANY_CONTACT.businessName,
    company_address: COMPANY_CONTACT.address.full,
    company_phone: COMPANY_CONTACT.phone.display,
    company_email: COMPANY_CONTACT.email.primary,
    additional_message: customContext.additional_message || '',
  };

  return defaults;
}

/**
 * Render email template with variable replacement for both HTML and Plain Text
 */
export function renderVisaEmail(
  templateCode: string,
  context: Partial<VisaTemplateContext> = {},
  customAdditionalMessage?: string
): { subject: string; html: string; text: string; template: VisaEmailTemplateDefinition } {
  const template = VISA_EMAIL_TEMPLATES[templateCode] || VISA_EMAIL_TEMPLATES.INQUIRY_RECEIVED;
  const mergedContext = buildVisaContext({
    ...context,
    additional_message: customAdditionalMessage
      ? `<div style="background-color: #F8FAFC; border: 1px solid #E5E8ED; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #153650;"><strong>Special Note from Counselor:</strong><br />${customAdditionalMessage.replace(/\n/g, '<br />')}</div>`
      : '',
  });

  const plainMergedContext = buildVisaContext({
    ...context,
    additional_message: customAdditionalMessage
      ? `Special Note from Counselor:\n${customAdditionalMessage}\n`
      : '',
  });

  // Replace subject variables
  let subject = template.defaultSubject;
  for (const [key, value] of Object.entries(mergedContext)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
  }

  // Replace HTML variables
  let html = template.bodyHtml;
  for (const [key, value] of Object.entries(mergedContext)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
  }

  // Replace Text variables
  let text = template.bodyText;
  for (const [key, value] of Object.entries(plainMergedContext)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    text = text.replace(regex, value);
  }

  return {
    subject,
    html,
    text,
    template,
  };
}
