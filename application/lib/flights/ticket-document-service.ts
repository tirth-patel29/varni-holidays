import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getAppBaseUrl } from '@/lib/config/app-url';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates that an uploaded file is a genuine PDF under the 10MB size limit
 */
export function validateTicketPdf(
  buffer: Buffer,
  fileName: string
): { valid: boolean; error?: string; cleanFileName?: string } {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'The uploaded file is empty.' };
  }

  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      error: `PDF file exceeds maximum allowed size of 10MB (Current size: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  // Check PDF magic bytes (%PDF- is 0x25 0x50 0x44 0x46 0x2D)
  const header = buffer.subarray(0, 5).toString('ascii');
  if (!header.startsWith('%PDF-')) {
    return {
      valid: false,
      error: 'Invalid file format. Only genuine PDF documents (.pdf) are permitted.',
    };
  }

  // Sanitize filename to prevent directory traversal or control characters
  const cleanBase = fileName
    .replace(/[^\w\d_.-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^_+|_+$/g, '');
  const cleanFileName = cleanBase.toLowerCase().endsWith('.pdf') ? cleanBase : `${cleanBase}.pdf`;

  return { valid: true, cleanFileName };
}

/**
 * Persists an uploaded e-ticket PDF into the database with cryptographic download token
 */
export async function storeFlightTicketPdf(params: {
  flightHoldId: string;
  fileName: string;
  fileBuffer: Buffer;
  uploadedByUserId?: string | null;
}): Promise<{
  success: boolean;
  documentId?: string;
  downloadToken?: string;
  downloadUrl?: string;
  error?: string;
}> {
  const { flightHoldId, fileName, fileBuffer, uploadedByUserId } = params;

  const validation = validateTicketPdf(fileBuffer, fileName);
  if (!validation.valid || !validation.cleanFileName) {
    return { success: false, error: validation.error };
  }

  try {
    // Generate high-entropy 32-byte cryptographic download token
    const downloadToken = crypto.randomBytes(32).toString('hex');
    const base64Data = fileBuffer.toString('base64');

    // Remove any previous ticket document for this hold to maintain 1:1 active document relation
    await prisma.flightTicketDocument.deleteMany({
      where: { flightHoldId },
    });

    const doc = await prisma.flightTicketDocument.create({
      data: {
        flightHoldId,
        fileName: validation.cleanFileName,
        fileSize: fileBuffer.length,
        mimeType: 'application/pdf',
        fileData: base64Data,
        downloadToken,
        uploadedByUserId: uploadedByUserId || null,
      },
    });

    const baseUrl = getAppBaseUrl();
    const downloadUrl = `${baseUrl}/api/tickets/download/${downloadToken}`;

    return {
      success: true,
      documentId: doc.id,
      downloadToken,
      downloadUrl,
    };
  } catch (err: any) {
    console.error('[storeFlightTicketPdf Error]:', err);
    return { success: false, error: err.message || 'Failed to save e-ticket PDF.' };
  }
}

/**
 * Retrieves a ticket PDF document by token for secure streaming
 */
export async function getFlightTicketPdfByToken(token: string): Promise<{
  found: boolean;
  document?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileBuffer: Buffer;
    flightHold: {
      id: string;
      pnr: string;
      passengerName: string | null;
      status: string;
    };
  };
  error?: string;
}> {
  if (!token || token.trim().length < 16) {
    return { found: false, error: 'Invalid or missing document token.' };
  }

  try {
    const doc = await prisma.flightTicketDocument.findUnique({
      where: { downloadToken: token.trim() },
      include: {
        flightHold: {
          select: {
            id: true,
            pnr: true,
            passengerName: true,
            status: true,
          },
        },
      },
    });

    if (!doc) {
      return { found: false, error: 'E-ticket document not found or access link expired.' };
    }

    const fileBuffer = Buffer.from(doc.fileData, 'base64');

    return {
      found: true,
      document: {
        id: doc.id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        fileBuffer,
        flightHold: doc.flightHold,
      },
    };
  } catch (err: any) {
    console.error('[getFlightTicketPdfByToken Error]:', err);
    return { found: false, error: 'Database error retrieving document.' };
  }
}

/**
 * Builds the secure tokenized download URL for an e-ticket PDF
 */
export function buildTicketDownloadUrl(token: string): string {
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/api/tickets/download/${token}`;
}
