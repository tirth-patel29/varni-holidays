'use server';

import {
  actionCustomerAcceptQuotation,
  actionCustomerRequestRevision,
} from '@/lib/pwa/customer-data';

/**
 * Server Action: Accept Quotation
 */
export async function actionAcceptQuotation(quotationId: string) {
  return await actionCustomerAcceptQuotation(quotationId);
}

/**
 * Server Action: Request Revision on Quotation
 */
export async function actionRequestRevision(quotationId: string, revisionNotes: string) {
  return await actionCustomerRequestRevision(quotationId, revisionNotes);
}
