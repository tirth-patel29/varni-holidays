import { prisma } from '@/lib/prisma';
import { sendCustomerEmail } from '@/lib/integrations/email-service';
import { COMPANY_CONTACT } from '@/lib/config/contact';

export interface MonthlyReportResult {
  success: boolean;
  recipient: string;
  periodLabel: string;
  totalLeads: number;
  messageId?: string;
  error?: string;
  skippedDuplicate?: boolean;
}

/**
 * Calculates start and end of previous month in Asia/Kolkata timezone (UTC+5:30)
 */
export function getPreviousMonthRangeIST(now = new Date()): {
  startDate: Date;
  endDate: Date;
  periodLabel: string;
  year: number;
  month: number; // 1-12
} {
  // Convert current time to IST offset (UTC + 5.5 hours)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);

  let year = istNow.getUTCFullYear();
  let month = istNow.getUTCMonth(); // 0-indexed: previous month is month - 1 + 1 in human terms

  if (month === 0) {
    // Current is January, previous is December of previous year
    month = 12;
    year -= 1;
  }

  // First millisecond of previous month in IST (e.g. 2026-11-01 00:00:00.000 IST)
  // in UTC: 2026-10-31 18:30:00.000 UTC
  const startUtcMs = Date.UTC(year, month - 1, 1, 0, 0, 0, 0) - istOffsetMs;
  const startDate = new Date(startUtcMs);

  // Last millisecond of previous month in IST
  // Month is 1-indexed, so Date.UTC(year, month, 1, 0, 0, 0, 0) - 1 is last ms
  const nextMonthStartUtcMs = Date.UTC(year, month, 1, 0, 0, 0, 0) - istOffsetMs;
  const endDate = new Date(nextMonthStartUtcMs - 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const periodLabel = `${monthNames[month - 1]} ${year}`;

  return { startDate, endDate, periodLabel, year, month };
}

/**
 * Escapes values for standard RFC 4180 CSV export
 */
function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Formats a Date to an IST timestamp string
 */
function formatISTDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Generates and dispatches the monthly leads report to neel248@gmail.com
 */
export async function generateAndSendMonthlyLeadReport(
  options?: { targetDate?: Date; force?: boolean }
): Promise<MonthlyReportResult> {
  const recipient = 'neel248@gmail.com';
  const { startDate, endDate, periodLabel, year, month } = getPreviousMonthRangeIST(
    options?.targetDate || new Date()
  );

  const idempotencyKey = `MONTHLY_REPORT_${year}_${String(month).padStart(2, '0')}`;

  // Check if report already logged to prevent duplicates on cron retries
  if (!options?.force) {
    const existingAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'MONTHLY_LEAD_REPORT_DISPATCHED',
        entityId: idempotencyKey,
      },
    });

    if (existingAudit) {
      console.log(`[Monthly Report] Report for ${periodLabel} was already sent. Skipping duplicate.`);
      return {
        success: true,
        recipient,
        periodLabel,
        totalLeads: 0,
        skippedDuplicate: true,
      };
    }
  }

  // Query database as authoritative source
  const leads = await prisma.lead.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      isDeleted: false,
    },
    include: {
      customer: { select: { fullName: true, phoneNumber: true, email: true } },
      assignedTo: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalLeads = leads.length;

  // Compute breakdowns
  const sourceBreakdown: Record<string, number> = {};
  const typeBreakdown: Record<string, number> = {};
  const stageBreakdown: Record<string, number> = {};
  const staffBreakdown: Record<string, number> = {};

  for (const l of leads) {
    sourceBreakdown[l.source] = (sourceBreakdown[l.source] || 0) + 1;
    typeBreakdown[l.serviceType] = (typeBreakdown[l.serviceType] || 0) + 1;
    stageBreakdown[l.stage] = (stageBreakdown[l.stage] || 0) + 1;
    const staffName = l.assignedTo?.fullName || 'Unassigned';
    staffBreakdown[staffName] = (staffBreakdown[staffName] || 0) + 1;
  }

  // Build CSV
  const csvHeaders = [
    'Lead Reference',
    'Submitted At (IST)',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Service Type',
    'Title',
    'Source',
    'Stage',
    'Priority',
    'Assigned Staff',
    'Budget (INR)',
    'Notes',
  ];

  const csvRows = leads.map((l) => [
    escapeCsv(l.referenceId),
    escapeCsv(formatISTDate(l.createdAt)),
    escapeCsv(l.customer?.fullName || 'N/A'),
    escapeCsv(l.customer?.phoneNumber || 'N/A'),
    escapeCsv(l.customer?.email || 'N/A'),
    escapeCsv(l.serviceType),
    escapeCsv(l.title),
    escapeCsv(l.source),
    escapeCsv(l.stage),
    escapeCsv(l.priorityLevel),
    escapeCsv(l.assignedTo?.fullName || 'Unassigned'),
    escapeCsv(l.estimatedBudgetInr ? `₹${l.estimatedBudgetInr}` : 'N/A'),
    escapeCsv(l.internalNotes || ''),
  ]);

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map((r) => r.join(',')),
  ].join('\r\n');

  const csvBase64 = Buffer.from(csvContent, 'utf-8').toString('base64');
  const filename = `Varni_Holidays_Leads_${year}_${String(month).padStart(2, '0')}.csv`;

  // Build Email Body
  const renderBreakdownTable = (title: string, data: Record<string, number>) => {
    if (Object.keys(data).length === 0) return '<p style="color: #64748B; font-size: 13px;">No data</p>';
    return `
      <div style="margin-bottom: 18px;">
        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #153650; margin: 0 0 8px 0; font-weight: 700;">${title}</h3>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 6px;">
          ${Object.entries(data)
            .map(
              ([key, count]) => `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="color: #475569; padding: 6px 10px;">${key}</td>
              <td style="color: #153650; font-weight: 700; text-align: right; padding: 6px 10px;">${count}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      </div>
    `;
  };

  const bodyHtml = `
    <div style="font-size: 14px; color: #334155; line-height: 1.6;">
      <p>Hello Neel,</p>
      <p>Please find attached the official <strong>Monthly Lead & Enquiry Report</strong> for <strong>${periodLabel}</strong> (Asia/Kolkata timezone).</p>

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px;">Summary Metrics</div>
        <div style="font-size: 26px; font-weight: 800; color: #153650; margin-top: 4px;">${totalLeads} Total Enquiries</div>
        <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Period: ${formatISTDate(startDate)} to ${formatISTDate(endDate)}</div>
      </div>

      ${totalLeads === 0 ? `
        <div style="padding: 16px; background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; color: #92400E; margin: 20px 0;">
          ℹ️ No enquiries or leads were recorded during this calendar month.
        </div>
      ` : `
        <div style="margin: 24px 0;">
          ${renderBreakdownTable('Enquiries by Lead Source', sourceBreakdown)}
          ${renderBreakdownTable('Enquiries by Service Type', typeBreakdown)}
          ${renderBreakdownTable('Leads by Pipeline Stage', stageBreakdown)}
          ${renderBreakdownTable('Leads by Assigned Staff', staffBreakdown)}
        </div>
      `}

      <p style="font-size: 12px; color: #64748B; margin-top: 24px;">
        Attached: <code>${filename}</code> (${totalLeads} records).<br>
        This report is generated directly from the Varni Holidays production database.
      </p>
    </div>
  `;

  // Dispatch email
  const sendResult = await sendCustomerEmail({
    to: recipient,
    toName: 'Neel Patel',
    subject: `Varni Holidays — Monthly Enquiries Report: ${periodLabel} (${totalLeads} Leads)`,
    headline: `Monthly Enquiry & Lead Report — ${periodLabel}`,
    bodyHtml,
    attachments: [
      {
        filename,
        content: csvBase64,
      },
    ],
  });

  if (sendResult.success) {
    // Log audit record for idempotency
    try {
      await prisma.auditLog.create({
        data: {
          action: 'MONTHLY_LEAD_REPORT_DISPATCHED',
          entityType: 'REPORT',
          entityId: idempotencyKey,
          afterDataJson: {
            recipient,
            periodLabel,
            totalLeads,
            messageId: sendResult.messageId,
          },
        },
      });
    } catch (auditErr) {
      console.warn('[Monthly Report] Audit log write error:', auditErr);
    }
  }

  return {
    success: sendResult.success,
    recipient,
    periodLabel,
    totalLeads,
    messageId: sendResult.messageId,
    error: sendResult.error,
  };
}
