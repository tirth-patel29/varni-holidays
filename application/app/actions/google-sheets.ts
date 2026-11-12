'use server';

import { crmRepo } from '@/lib/crm/store';
import { googleSheetsSync, simulatedSheets } from '@/lib/integrations/google-sheets';
import { GoogleSheetsConfig } from '@/lib/crm/types';

export async function getGoogleSheetsStatusAction() {
  try {
    const config = crmRepo.getGoogleSheetsConfig() || {
      spreadsheetId: '',
      spreadsheetUrl: '',
      webhookUrl: '',
      status: 'DISCONNECTED',
      lastSyncedAt: null,
      totalSyncedEvents: 0,
      autoSync: true,
      syncIntervalMinutes: 5,
    };
    const allJobs = crmRepo.getSyncJobs ? (crmRepo.getSyncJobs(50) || []) : [];
    const pendingJobs = allJobs.filter((j) => j?.status === 'PENDING');
    const failedJobs = allJobs.filter((j) => j?.status === 'FAILED');
    const completedJobs = allJobs.filter((j) => j?.status === 'COMPLETED');
    const isLive = Boolean(googleSheetsSync?.isLiveCredentialsConfigured?.());

    return {
      config,
      isLive,
      counts: {
        total: allJobs.length,
        pending: pendingJobs.length,
        failed: failedJobs.length,
        completed: completedJobs.length,
      },
      outbox: {
        total: allJobs.length,
        pending: pendingJobs.length,
        failed: failedJobs.length,
        completed: completedJobs.length,
      },
      recentJobs: allJobs.slice(0, 20),
      simulatedStats: {
        leadsCount: simulatedSheets?.tabs?.ALL_LEADS?.rows?.length ?? 0,
        quotationsCount: simulatedSheets?.tabs?.QUOTATIONS?.rows?.length ?? 0,
        followUpsCount: simulatedSheets?.tabs?.FOLLOW_UPS?.rows?.length ?? 0,
        bookingsCount: simulatedSheets?.tabs?.BOOKINGS?.rows?.length ?? 0,
      },
    };
  } catch (err: any) {
    console.error('getGoogleSheetsStatusAction error:', err);
    return {
      config: {
        spreadsheetId: '',
        spreadsheetUrl: '',
        webhookUrl: '',
        status: 'ERROR' as const,
        lastSyncedAt: null,
        totalSyncedEvents: 0,
        autoSync: false,
        syncIntervalMinutes: 5,
      },
      isLive: false,
      counts: { total: 0, pending: 0, failed: 0, completed: 0 },
      outbox: { total: 0, pending: 0, failed: 0, completed: 0 },
      recentJobs: [],
      simulatedStats: { leadsCount: 0, quotationsCount: 0, followUpsCount: 0, bookingsCount: 0 },
    };
  }
}

export async function processSyncQueueAction() {
  const pending = crmRepo.getPendingSyncJobs();
  let successCount = 0;
  let failCount = 0;

  for (const job of pending) {
    job.status = 'PROCESSING';
    crmRepo.updateSyncJob(job.id, { status: 'PROCESSING' });

    const result = await googleSheetsSync.processSyncJob(job);

    if (result.success) {
      crmRepo.updateSyncJob(job.id, {
        status: 'COMPLETED',
        processedAt: new Date().toISOString(),
        error: null,
      });
      successCount++;
    } else {
      const newRetry = (job.retryCount || 0) + 1;
      const willFail = newRetry >= (job.maxRetries || 5);
      crmRepo.updateSyncJob(job.id, {
        status: willFail ? 'FAILED' : 'PENDING',
        retryCount: newRetry,
        error: result.error || 'Unknown sync error',
      });
      failCount++;
    }
  }

  return {
    processed: pending.length,
    successCount,
    failCount,
  };
}

export async function triggerImmediateBackgroundSync() {
  try {
    await processSyncQueueAction();
  } catch (err: any) {
    console.warn('Background Google Sheets sync execution notice:', err.message);
  }
}

export async function triggerManualSyncAction() {
  // Reconcile full workbook across ALL_LEADS, FOLLOW_UPS, BOOKINGS, and BUSINESS_SUMMARY
  const result = await googleSheetsSync.reconcileFullWorkbook();

  // Also drain any pending queue items
  await processSyncQueueAction();

  // Audit Log
  crmRepo.addAuditLog({
    userId: 'usr-neel-patel-superadmin',
    userEmail: 'neel@varniholidays.com',
    action: 'GOOGLE_SHEETS_MANUAL_SYNC',
    entityType: 'INTEGRATION',
    entityId: crmRepo.getGoogleSheetsConfig().spreadsheetId,
    details: `Manual Google Sheets reconciliation executed. Results: ${result.syncedLeads} leads, ${result.syncedFollowUps} follow-ups, ${result.syncedBookings} bookings synced.`,
    ipAddress: 'Internal Portal',
  });

  return result;
}

export async function retryFailedJobsAction() {
  const retriedCount = crmRepo.retryFailedSyncJobs();
  const processResult = await processSyncQueueAction();

  return {
    retriedCount,
    processResult,
  };
}

export async function testGoogleSheetsConnectionAction() {
  const config = crmRepo.getGoogleSheetsConfig();
  const isLive = googleSheetsSync.isLiveCredentialsConfigured();

  if (!isLive) {
    return {
      success: true,
      mode: 'SIMULATION',
      message: 'Operating in Development Simulation Mode. Local mirror active. Real Google API keys can be configured in .env.',
      spreadsheetUrl: config.spreadsheetUrl,
    };
  }

  try {
    const res = await googleSheetsSync.reconcileFullWorkbook();
    if (res.success) {
      return {
        success: true,
        mode: 'LIVE',
        message: 'Successfully authenticated with Google Sheets API and validated workbook permissions.',
        spreadsheetUrl: config.spreadsheetUrl,
      };
    } else {
      return {
        success: false,
        mode: 'LIVE',
        message: `Connection failed: ${res.error}`,
        spreadsheetUrl: config.spreadsheetUrl,
      };
    }
  } catch (e: any) {
    return {
      success: false,
      mode: 'LIVE',
      message: `Google Sheets API Error: ${e.message}`,
      spreadsheetUrl: config.spreadsheetUrl,
    };
  }
}

export async function updateGoogleSheetsSettingsAction(updates: Partial<GoogleSheetsConfig>) {
  const updated = crmRepo.updateGoogleSheetsConfig({
    ...updates,
    spreadsheetUrl: updates.spreadsheetId
      ? `https://docs.google.com/spreadsheets/d/${updates.spreadsheetId}/edit`
      : undefined,
  });

  crmRepo.addAuditLog({
    userId: 'usr-neel-patel-superadmin',
    userEmail: 'neel@varniholidays.com',
    action: 'GOOGLE_SHEETS_SETTINGS_UPDATED',
    entityType: 'INTEGRATION',
    entityId: updated.spreadsheetId,
    details: `Google Sheets integration settings updated by Super Admin Neel Patel.`,
    ipAddress: 'Internal Portal',
  });

  return updated;
}

export async function disconnectGoogleSheetsAction() {
  const updated = crmRepo.updateGoogleSheetsConfig({
    status: 'DISCONNECTED',
  });

  crmRepo.addAuditLog({
    userId: 'usr-neel-patel-superadmin',
    userEmail: 'neel@varniholidays.com',
    action: 'GOOGLE_SHEETS_DISCONNECTED',
    entityType: 'INTEGRATION',
    entityId: updated.spreadsheetId,
    details: `Google Sheets live synchronization disconnected by Super Admin Neel Patel.`,
    ipAddress: 'Internal Portal',
  });

  return updated;
}

