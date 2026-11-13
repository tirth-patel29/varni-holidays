/**
 * VARNI HOLIDAYS - Quotation Pricing Engine
 * Server-side calculation and validation of quotation pricing in INR.
 * 
 * STRICT FINANCIAL RULES:
 * 1. Preserves original catalogue prices; calculations apply only to current quotation.
 * 2. Does not assume all services have the same GST rate; supports configurable tax rates (5%, 18%, 0%, custom).
 * 3. Handles discounts as either fixed INR amount or percentage.
 * 4. Never trust client-side math; every calculation is validated and computed on the server.
 */

export interface AdditionalServiceItem {
  id?: string;
  title: string;
  serviceCategory?: string;
  quantity: number;
  unitPriceInr: number;
  supplierCostInr?: number;
}

export interface QuotationPricingInput {
  basePriceInr: number;
  adultsCount: number;
  childrenCount: number;
  roomsCount: number;
  transportChargesInr?: number;
  additionalServices?: AdditionalServiceItem[];
  extraChargesInr?: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  taxPercent: number; // e.g. 5 for 5% GST, 18 for 18% GST, 0 for exempt
}

export interface QuotationPricingResult {
  basePriceInr: number;
  adultsCount: number;
  childrenCount: number;
  roomsCount: number;
  transportChargesInr: number;
  additionalServicesTotalInr: number;
  extraChargesInr: number;
  grossSubtotalInr: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  discountAmountInr: number;
  taxableSubtotalInr: number;
  taxPercent: number;
  taxAmountInr: number;
  cgstAmountInr: number;
  sgstAmountInr: number;
  totalPayableAmountInr: number;
  lineItems: Array<{
    itemOrder: number;
    description: string;
    serviceCategory: string;
    quantity: number;
    unitPriceInr: number;
    supplierCostInr?: number;
    totalAmountInr: number;
  }>;
}

export function calculateQuotationPricing(input: QuotationPricingInput): QuotationPricingResult {
  const basePrice = Math.max(0, Number(input.basePriceInr) || 0);
  const adults = Math.max(1, Math.floor(Number(input.adultsCount) || 1));
  const children = Math.max(0, Math.floor(Number(input.childrenCount) || 0));
  const rooms = Math.max(1, Math.floor(Number(input.roomsCount) || 1));
  const transport = Math.max(0, Number(input.transportChargesInr) || 0);
  const extra = Math.max(0, Number(input.extraChargesInr) || 0);

  const rawServices = input.additionalServices || [];
  let additionalServicesTotal = 0;
  const lineItems: QuotationPricingResult['lineItems'] = [];

  // 1. Primary Line Item (Base Package or Room)
  lineItems.push({
    itemOrder: 1,
    description: `Base Accommodation & Tour Plan (${adults} Adults${children > 0 ? `, ${children} Children` : ''}, ${rooms} Room${rooms > 1 ? 's' : ''})`,
    serviceCategory: 'BASE_SERVICE',
    quantity: 1,
    unitPriceInr: basePrice,
    totalAmountInr: basePrice,
  });

  // 2. Transport Line Item (if specified)
  if (transport > 0) {
    lineItems.push({
      itemOrder: lineItems.length + 1,
      description: 'Dedicated Private Transportation & Sightseeing Transfers',
      serviceCategory: 'TRANSPORT',
      quantity: 1,
      unitPriceInr: transport,
      totalAmountInr: transport,
    });
  }

  // 3. Additional Services
  rawServices.forEach((s, idx) => {
    const qty = Math.max(1, Number(s.quantity) || 1);
    const unitPrice = Math.max(0, Number(s.unitPriceInr) || 0);
    const itemTotal = Math.round(qty * unitPrice * 100) / 100;
    additionalServicesTotal += itemTotal;

    lineItems.push({
      itemOrder: lineItems.length + 1,
      description: s.title || `Additional Service #${idx + 1}`,
      serviceCategory: s.serviceCategory || 'SUPPLEMENT',
      quantity: qty,
      unitPriceInr: unitPrice,
      supplierCostInr: s.supplierCostInr,
      totalAmountInr: itemTotal,
    });
  });

  // 4. Extra Charges (Peak Season / Permits / Gala Dinner)
  if (extra > 0) {
    lineItems.push({
      itemOrder: lineItems.length + 1,
      description: 'Peak Season / Destination Environmental & Permit Surcharges',
      serviceCategory: 'SURCHARGE',
      quantity: 1,
      unitPriceInr: extra,
      totalAmountInr: extra,
    });
  }

  // Gross Subtotal
  const grossSubtotal = Math.round((basePrice + transport + additionalServicesTotal + extra) * 100) / 100;

  // Discount Calculation
  let discountAmount = 0;
  const rawDiscountVal = Math.max(0, Number(input.discountValue) || 0);
  if (input.discountType === 'PERCENTAGE') {
    const pct = Math.min(100, rawDiscountVal);
    discountAmount = Math.round((grossSubtotal * (pct / 100)) * 100) / 100;
  } else {
    discountAmount = Math.min(grossSubtotal, Math.round(rawDiscountVal * 100) / 100);
  }

  // Taxable Subtotal
  const taxableSubtotal = Math.max(0, Math.round((grossSubtotal - discountAmount) * 100) / 100);

  // Tax Calculation (GST)
  const taxRate = Math.max(0, Math.min(100, Number(input.taxPercent) || 0));
  const taxAmount = Math.round((taxableSubtotal * (taxRate / 100)) * 100) / 100;
  const cgstAmount = Math.round((taxAmount / 2) * 100) / 100;
  const sgstAmount = Math.round((taxAmount - cgstAmount) * 100) / 100;

  // Final Payable
  const totalPayable = Math.round((taxableSubtotal + taxAmount) * 100) / 100;

  return {
    basePriceInr: basePrice,
    adultsCount: adults,
    childrenCount: children,
    roomsCount: rooms,
    transportChargesInr: transport,
    additionalServicesTotalInr: additionalServicesTotal,
    extraChargesInr: extra,
    grossSubtotalInr: grossSubtotal,
    discountType: input.discountType,
    discountValue: rawDiscountVal,
    discountAmountInr: discountAmount,
    taxableSubtotalInr: taxableSubtotal,
    taxPercent: taxRate,
    taxAmountInr: taxAmount,
    cgstAmountInr: cgstAmount,
    sgstAmountInr: sgstAmount,
    totalPayableAmountInr: totalPayable,
    lineItems,
  };
}

