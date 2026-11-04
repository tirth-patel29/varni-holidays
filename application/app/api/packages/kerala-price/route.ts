import { NextRequest, NextResponse } from "next/server";
import { calculateKeralaPrice, PricingCalculationInput } from "@/lib/pricing/kerala";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PricingCalculationInput;
    const result = calculateKeralaPrice(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate package price" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hotelTier = (searchParams.get("tier") || "DELUXE") as any;
  const adultsCount = parseInt(searchParams.get("adults") || "2", 10);
  const configCode = searchParams.get("config") || undefined;

  const result = calculateKeralaPrice({
    hotelTier,
    adultsCount,
    configCode,
    includeHouseboatUpgrade: searchParams.get("houseboat") === "true",
    includeMealPlan: searchParams.get("meals") === "true",
    includeAthirapillyTrip: searchParams.get("athirapilly") === "true",
    includeKanyakumariTrip: searchParams.get("kanyakumari") === "true",
  });

  return NextResponse.json({ success: true, data: result });
}

