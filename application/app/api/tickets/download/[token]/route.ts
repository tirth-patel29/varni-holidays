import { NextRequest, NextResponse } from 'next/server';
import { getFlightTicketPdfByToken } from '@/lib/flights/ticket-document-service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  if (!token) {
    return NextResponse.json(
      { error: 'Document token is required' },
      { status: 400 }
    );
  }

  const result = await getFlightTicketPdfByToken(token);

  if (!result.found || !result.document) {
    return NextResponse.json(
      { error: result.error || 'Ticket document not found or link has expired' },
      { status: 404 }
    );
  }

  const { document } = result;
  const isDownload = req.nextUrl.searchParams.get('download') === '1';
  const disposition = isDownload ? 'attachment' : 'inline';

  return new NextResponse(document.fileBuffer as any, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="${document.fileName}"`,
      'Content-Length': document.fileSize.toString(),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
