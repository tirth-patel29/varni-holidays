import { NextRequest, NextResponse } from 'next/server';
import { crmRepo } from '@/lib/crm/store';
import { generateQuotationPdf, QuotationPdfData } from '@/lib/quotations/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params.id;
    if (!quotationId) {
      return NextResponse.json({ error: 'Quotation ID required' }, { status: 400 });
    }

    const quote = crmRepo.getQuotationById(quotationId);
    if (!quote) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const customer = crmRepo.getCustomerById(quote.customerId);
    const customerName = customer?.fullName || quote.customerName || 'Valued Guest';

    // Prepare PDF Data
    const pdfData: QuotationPdfData = {
      quotationNumber: quote.quotationNumber,
      quotationType: quote.quotationType || 'PACKAGE',
      version: quote.version || 1,
      revisionNumber: quote.revisionNumber,
      title: quote.title,
      createdAt: quote.createdAt,
      validUntil: quote.validUntil,
      createdByName: quote.createdByName,
      customer: {
        fullName: customerName,
        email: quote.customerEmail || customer?.email || null,
        phoneNumber: quote.customerPhone || customer?.phoneNumber || '',
        city: customer?.city,
      },
      destination: quote.destination,
      durationNights: quote.durationNights,
      durationDays: quote.durationDays,
      travelStartDate: quote.travelStartDate,
      travelEndDate: quote.travelEndDate,
      adultsCount: quote.adultsCount || 2,
      childrenCount: quote.childrenCount || 0,
      roomsCount: quote.roomsCount || 1,
      hotelCategory: quote.hotelCategory,
      mealPlan: quote.mealPlan,
      transportType: quote.transportType,
      itineraryDays: quote.itineraryDays,
      hotelDetails: quote.hotelDetails,
      inclusions: quote.inclusions || [],
      exclusions: quote.exclusions || [],
      basePriceInr: quote.basePriceInr || quote.subtotalInr,
      transportChargesInr: quote.transportChargesInr,
      additionalServicesTotalInr: quote.additionalServicesInr,
      extraChargesInr: quote.extraChargesInr,
      grossSubtotalInr:
        (quote.basePriceInr || quote.subtotalInr) +
        (quote.transportChargesInr || 0) +
        (quote.additionalServicesInr || 0) +
        (quote.extraChargesInr || 0),
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      discountAmountInr: quote.discountInr || 0,
      taxableSubtotalInr: quote.subtotalInr,
      taxPercent: quote.taxPercent !== undefined ? quote.taxPercent : 5,
      taxAmountInr: quote.taxesInr || 0,
      totalPayableAmountInr: quote.totalAmountInr,
      lineItems: quote.lineItems,
      termsAndConditions: quote.terms,
      customerNotes: quote.customerNotes,
    };

    const pdfBuffer = generateQuotationPdf(pdfData);

    const isDownload = req.nextUrl.searchParams.get('download') === '1';
    const filename = `${quote.quotationNumber}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Quotation PDF Generation Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: err.message },
      { status: 500 }
    );
  }
}

