/**
 * VARNI HOLIDAYS - Quotation PDF Generator
 * Professional server-side multi-page PDF generation using jsPDF & jspdf-autotable.
 * 
 * DESIGN SPECIFICATIONS:
 * - A4 Portrait (210 x 297 mm)
 * - Color Palette: Deep Navy (#002037), Warm Gold (#D49A32), Charcoal (#172B45), Slate (#718096), Pure White (#FFFFFF)
 * - Typography: Crisp Helvetica with proper hierarchy and line heights
 * - Proper multi-page layout with headers, footers, and page numbers
 * - Full compliance with Varni Holidays official branding and SRS requirements
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COMPANY_CONTACT } from '../config/contact';

export interface QuotationPdfData {
  quotationNumber: string;
  quotationType: 'PACKAGE' | 'HOTEL' | 'CUSTOM';
  version: number;
  revisionNumber?: number;
  title: string;
  createdAt: string;
  validUntil: string;
  createdByName?: string;

  customer: {
    fullName: string;
    email?: string | null;
    phoneNumber: string;
    city?: string | null;
  };

  destination?: string | null;
  durationNights?: number | null;
  durationDays?: number | null;
  travelStartDate?: string | null;
  travelEndDate?: string | null;
  adultsCount: number;
  childrenCount: number;
  roomsCount: number;
  hotelCategory?: string | null;
  mealPlan?: string | null;
  transportType?: string | null;

  itineraryDays?: Array<{
    dayNumber: number;
    title: string;
    description: string;
    meals?: string;
    stayDestination?: string;
  }>;

  hotelDetails?: {
    hotelName: string;
    location: string;
    roomType: string;
    mealPlan: string;
    checkInTime?: string;
    checkOutTime?: string;
    perks?: string[];
  };

  inclusions: string[];
  exclusions: string[];

  // Pricing
  basePriceInr: number;
  transportChargesInr?: number;
  additionalServicesTotalInr?: number;
  extraChargesInr?: number;
  grossSubtotalInr: number;
  discountType?: 'FIXED' | 'PERCENTAGE';
  discountValue?: number;
  discountAmountInr: number;
  taxableSubtotalInr: number;
  taxPercent: number;
  taxAmountInr: number;
  totalPayableAmountInr: number;

  lineItems?: Array<{
    itemOrder: number;
    description: string;
    quantity: number;
    unitPriceInr: number;
    totalAmountInr: number;
  }>;

  termsAndConditions?: string;
  customerNotes?: string;
}

export function generateQuotationPdf(data: QuotationPdfData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const navy = [0, 32, 55] as [number, number, number];
  const gold = [212, 154, 50] as [number, number, number];
  const charcoal = [23, 43, 69] as [number, number, number];
  const slate = [113, 128, 150] as [number, number, number];
  const lightBg = [248, 250, 252] as [number, number, number];

  // Helper function for formatted INR currency string (using ASCII "INR" for 100% reliable PDF rendering)
  const formatInr = (amount: number) => `INR ${Math.round(amount).toLocaleString('en-IN')}`;

  // Helper for formatted dates
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Upon Request';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  // ==========================================
  // 1. BRAND HEADER & DOCUMENT BADGE
  // ==========================================
  // Header background bar
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent line
  doc.setFillColor(...gold);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('VARNI HOLIDAYS', margin, 12);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(233, 185, 94);
  doc.text('YOUR GATEWAY TO JOYFUL HOLIDAYS • ANAND, GUJARAT', margin, 18);

  // Address & Contact info in header
  doc.setFontSize(7.5);
  doc.setTextColor(200, 215, 230);
  doc.text(
    `Anand HQ: 317 Narayan Empire, Anand - Vidyanagar Rd | Tel: ${COMPANY_CONTACT.phone.display} | Email: ${COMPANY_CONTACT.email.primary}`,
    margin,
    24
  );

  // Document Badge on right side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL TRAVEL QUOTATION', pageWidth - margin, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(233, 185, 94);
  const revText = data.revisionNumber && data.revisionNumber > 0 ? ` (Rev ${data.revisionNumber})` : '';
  doc.text(`Ref: ${data.quotationNumber}${revText}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Date: ${formatDate(data.createdAt)} | Valid: ${formatDate(data.validUntil)}`, pageWidth - margin, 24, {
    align: 'right',
  });

  let currentY = 36;

  // ==========================================
  // 2. CUSTOMER & PROPOSAL SUMMARY PANELS
  // ==========================================
  // Two rectangular cards side by side
  const colWidth = (contentWidth - 6) / 2;

  // Panel A: Client Information
  doc.setFillColor(...lightBg);
  doc.setDrawColor(229, 232, 237);
  doc.rect(margin, currentY, colWidth, 32, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navy);
  doc.text('PREPARED FOR (VALUED CLIENT):', margin + 4, currentY + 6);

  doc.setFontSize(10.5);
  doc.setTextColor(...charcoal);
  doc.text(data.customer.fullName || 'Valued Guest', margin + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  doc.text(`Mobile: ${data.customer.phoneNumber || 'N/A'}`, margin + 4, currentY + 17);
  doc.text(`Email: ${data.customer.email || 'N/A'}`, margin + 4, currentY + 22);
  doc.text(`Location: ${data.customer.city || 'Gujarat, India'}`, margin + 4, currentY + 27);

  // Panel B: Proposal Meta
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(...lightBg);
  doc.rect(rightColX, currentY, colWidth, 32, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navy);
  doc.text('ITINERARY & RESERVATION SPECS:', rightColX + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  const typeLabel =
    data.quotationType === 'HOTEL'
      ? 'Hotel Stay & Resort Package'
      : data.quotationType === 'PACKAGE'
      ? 'Curated Tour Package Itinerary'
      : 'Custom Holiday Package';
  doc.text(`Type: ${typeLabel}`, rightColX + 4, currentY + 12);

  const durationStr =
    data.durationNights && data.durationDays
      ? `${data.durationNights} Nights / ${data.durationDays} Days`
      : 'Custom Duration';
  doc.text(`Duration: ${durationStr}`, rightColX + 4, currentY + 17);

  const travelDates =
    data.travelStartDate
      ? `${formatDate(data.travelStartDate)} to ${formatDate(data.travelEndDate)}`
      : 'Flexible / As Confirmed';
  doc.text(`Travel Dates: ${travelDates}`, rightColX + 4, currentY + 22);

  const paxText = `${data.adultsCount} Adults${data.childrenCount > 0 ? `, ${data.childrenCount} Children` : ''} • ${data.roomsCount} Room(s)`;
  doc.text(`Party: ${paxText}`, rightColX + 4, currentY + 27);

  currentY += 38;

  // ==========================================
  // 3. PROPOSAL TITLE BANNER
  // ==========================================
  doc.setFillColor(240, 244, 248);
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.4);
  doc.rect(margin, currentY, contentWidth, 12, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...navy);
  doc.text(`PACKAGE / PROPOSAL: ${data.title.toUpperCase()}`, margin + 4, currentY + 7.5);

  if (data.destination) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text(`Destination: ${data.destination}`, pageWidth - margin - 4, currentY + 7.5, { align: 'right' });
  }

  currentY += 16;

  // ==========================================
  // 4. DAY-BY-DAY ITINERARY OR HOTEL DETAILS
  // ==========================================
  if (data.quotationType === 'HOTEL' && data.hotelDetails) {
    // Hotel Specs Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text('ACCOMMODATION & RESORT DETAILS', margin, currentY);
    currentY += 3;

    const hotelTableData = [
      ['Hotel / Resort Name', data.hotelDetails.hotelName || 'Selected Resort'],
      ['Location & Setting', data.hotelDetails.location || data.destination || 'Prime Location'],
      ['Room Category', data.hotelDetails.roomType || 'Standard Deluxe'],
      ['Selected Meal Plan', data.hotelDetails.mealPlan || data.mealPlan || 'CPAI (Breakfast Included)'],
      ['Check-In / Check-Out', `${data.hotelDetails.checkInTime || '02:00 PM'} / ${data.hotelDetails.checkOutTime || '11:00 AM'}`],
    ];

    if (data.hotelDetails.perks && data.hotelDetails.perks.length > 0) {
      hotelTableData.push(['Exclusive Perks', data.hotelDetails.perks.join(' • ')]);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Specification', 'Confirmed Detail']],
      body: hotelTableData,
      theme: 'grid',
      headStyles: {
        fillColor: navy,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        textColor: charcoal,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: navy },
        1: { cellWidth: 'auto' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  } else if (data.itineraryDays && data.itineraryDays.length > 0) {
    // Tour Itinerary Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...navy);
    doc.text('DETAILED DAY-BY-DAY TOUR ITINERARY', margin, currentY);
    currentY += 3;

    const itineraryRows = data.itineraryDays.map((day) => [
      `Day ${day.dayNumber}`,
      `${day.title}\n${day.description}${day.meals ? `\nMeals: ${day.meals}` : ''}${day.stayDestination ? ` | Stay: ${day.stayDestination}` : ''}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Day', 'Itinerary Schedule & Sightseeing Plan']],
      body: itineraryRows,
      theme: 'grid',
      headStyles: {
        fillColor: navy,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        textColor: charcoal,
        cellPadding: 2.8,
        lineColor: [229, 232, 237],
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: 'bold', textColor: navy, halign: 'center' },
        1: { cellWidth: 'auto' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Check if we need a page break before Inclusions & Pricing
  if (currentY > pageHeight - 90) {
    doc.addPage();
    currentY = 20;
  }

  // ==========================================
  // 5. INCLUSIONS & EXCLUSIONS
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...navy);
  doc.text('INCLUSIONS & EXCLUSIONS', margin, currentY);
  currentY += 3;

  const maxListLen = Math.max(data.inclusions.length, data.exclusions.length);
  const incExcRows: string[][] = [];

  for (let i = 0; i < maxListLen; i++) {
    const inc = data.inclusions[i] ? `[+] ${data.inclusions[i]}` : '';
    const exc = data.exclusions[i] ? `[-] ${data.exclusions[i]}` : '';
    incExcRows.push([inc, exc]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['What is Included in Your Package', 'What is Excluded from Your Package']],
    body: incExcRows,
    theme: 'grid',
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7,
      textColor: charcoal,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: contentWidth / 2, textColor: [22, 101, 52] }, // Dark green for included
      1: { cellWidth: contentWidth / 2, textColor: [185, 28, 28] }, // Dark red for excluded
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Check page break before Financial Breakdown
  if (currentY > pageHeight - 90) {
    doc.addPage();
    currentY = 20;
  }

  // ==========================================
  // 6. ITEMIZED PRICING & FINANCIAL BREAKDOWN
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...navy);
  doc.text('ITEMIZED PRICING & TAX BREAKDOWN (IN INR)', margin, currentY);
  currentY += 3;

  const priceRows: any[] = [];

  if (data.lineItems && data.lineItems.length > 0) {
    data.lineItems.forEach((item) => {
      priceRows.push([
        item.itemOrder.toString(),
        item.description,
        item.quantity.toString(),
        formatInr(item.unitPriceInr),
        formatInr(item.totalAmountInr),
      ]);
    });
  } else {
    priceRows.push([
      '1',
      `Base Tour & Accommodation (${data.adultsCount} Adults, ${data.roomsCount} Rooms)`,
      '1',
      formatInr(data.basePriceInr),
      formatInr(data.basePriceInr),
    ]);
    if (data.transportChargesInr && data.transportChargesInr > 0) {
      priceRows.push([
        '2',
        'Dedicated Private Vehicle Sightseeing & Transfers',
        '1',
        formatInr(data.transportChargesInr),
        formatInr(data.transportChargesInr),
      ]);
    }
    if (data.additionalServicesTotalInr && data.additionalServicesTotalInr > 0) {
      priceRows.push([
        '3',
        'Additional Services / Supplements',
        '1',
        formatInr(data.additionalServicesTotalInr),
        formatInr(data.additionalServicesTotalInr),
      ]);
    }
  }

  // Totals rows
  priceRows.push(['', 'Gross Subtotal', '', '', formatInr(data.grossSubtotalInr)]);

  if (data.discountAmountInr > 0) {
    const discLabel =
      data.discountType === 'PERCENTAGE'
        ? `Special Client Discount (${data.discountValue}%)`
        : 'Special Client Discount (Promotional)';
    priceRows.push(['', discLabel, '', '', `- ${formatInr(data.discountAmountInr)}`]);
    priceRows.push(['', 'Taxable Amount', '', '', formatInr(data.taxableSubtotalInr)]);
  }

  if (data.taxAmountInr > 0) {
    priceRows.push([
      '',
      `Goods & Services Tax (GST @ ${data.taxPercent}%) - CGST (${(data.taxPercent / 2).toFixed(1)}%) + SGST (${(data.taxPercent / 2).toFixed(1)}%)`,
      '',
      '',
      `+ ${formatInr(data.taxAmountInr)}`,
    ]);
  } else {
    priceRows.push(['', 'GST (0% - Exempt / Integrated in Base)', '', '', 'INR 0']);
  }

  // Final Total Row
  priceRows.push(['', 'TOTAL INVESTMENT PAYABLE (NET OF ALL TAXES)', '', '', formatInr(data.totalPayableAmountInr)]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Item / Service Description', 'Qty', 'Rate (INR)', 'Total Amount (INR)']],
    body: priceRows,
    theme: 'grid',
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      textColor: charcoal,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 38, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (hookData: any) => {
      // Highlight the Final Total row
      if (hookData.row.index === priceRows.length - 1) {
        hookData.cell.styles.fillColor = [240, 246, 252];
        hookData.cell.styles.textColor = navy;
        hookData.cell.styles.fontSize = 8.5;
        hookData.cell.styles.fontStyle = 'bold';
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Check page break before Terms & Payment instructions
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentY = 20;
  }

  // ==========================================
  // 7. PAYMENT INSTRUCTIONS & TERMS
  // ==========================================
  // Two rectangular cards side by side
  const botColWidth = (contentWidth - 6) / 2;

  // Box A: Payment Instructions
  doc.setFillColor(...lightBg);
  doc.setDrawColor(229, 232, 237);
  doc.rect(margin, currentY, botColWidth, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text('OFFICIAL BANK REMITTANCE & UPI DETAILS:', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...charcoal);
  doc.text('Account Name: Varni Holidays Pvt. Ltd.', margin + 4, currentY + 11);
  doc.text('Bank Name: ICICI Bank', margin + 4, currentY + 16);
  doc.text('Current A/C No: 025605009876', margin + 4, currentY + 21);
  doc.text('IFSC Code: ICIC0000256 (Anand Station Road Branch)', margin + 4, currentY + 26);
  doc.text('UPI ID: varniinternational7@okicici', margin + 4, currentY + 31);
  doc.text('GSTIN: 24AAACV1234P1Z5', margin + 4, currentY + 36);

  // Box B: Booking & Cancellation Terms
  doc.setFillColor(...lightBg);
  doc.rect(rightColX, currentY, botColWidth, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text('BOOKING POLICY & TERMS:', rightColX + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...charcoal);
  doc.text('• 25% advance token required to initiate reservation vouchers.', rightColX + 4, currentY + 11);
  doc.text('• 50% payment due upon receipt of hotel & vehicle confirmations.', rightColX + 4, currentY + 16);
  doc.text('• Balance 25% payable 7 days prior to departure date.', rightColX + 4, currentY + 21);
  doc.text('• Cancellation: 30+ days: 10% fee | 15-29 days: 25% fee.', rightColX + 4, currentY + 26);
  doc.text('• Under 15 days or non-refundable hotel block: as per supplier rules.', rightColX + 4, currentY + 31);
  doc.text('• Quotation valid for 7 days from date of issue.', rightColX + 4, currentY + 36);

  currentY += 44;

  // ==========================================
  // 8. AUTHORIZED SIGNATURE SECTION
  // ==========================================
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = 20;
  }

  doc.setDrawColor(229, 232, 237);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // Left side: Acceptance note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate);
  doc.text('Thank you for giving us the opportunity to plan your journey.', margin, currentY + 4);
  doc.text('To confirm this proposal, please sign or reply to our email with your acceptance.', margin, currentY + 9);

  // Right side: Authorized Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text('FOR VARNI HOLIDAYS PVT. LTD.', pageWidth - margin, currentY + 4, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate);
  doc.text('[Authorized Executive Signatory]', pageWidth - margin, currentY + 15, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...charcoal);
  doc.text('Neel Patel • Managing Director', pageWidth - margin, currentY + 20, { align: 'right' });

  // ==========================================
  // 9. FOOTERS & PAGE NUMBERS ON ALL PAGES
  // ==========================================
  const totalPages = (doc.internal as any).getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Subtle bottom border
    doc.setDrawColor(229, 232, 237);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...slate);
    doc.text(
      'VARNI HOLIDAYS PVT. LTD. • 317 Narayan Empire, Anand, Gujarat • Helpline: +91 63570 50505 • www.varniholidays.com',
      margin,
      pageHeight - 6
    );

    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Return Node Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

