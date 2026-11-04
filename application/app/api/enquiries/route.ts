import { NextRequest, NextResponse } from "next/server";
import {
  submitFlightEnquiry,
  submitPackageEnquiry,
  submitVisaEnquiry,
} from "@/app/actions/enquiries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type || body.serviceType || "PACKAGE";

    let result;
    if (type === "FLIGHT") {
      result = await submitFlightEnquiry(body);
    } else if (type === "VISA") {
      result = await submitVisaEnquiry(body);
    } else {
      result = await submitPackageEnquiry(body);
    }

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (err: any) {
    console.error("API enquiry submission error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process enquiry" },
      { status: 500 }
    );
  }
}

