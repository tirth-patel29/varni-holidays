import {
  submitFlightEnquiry,
  submitPackageEnquiry,
  submitVisaEnquiry,
  submitTravelInsuranceEnquiryAction,
  EnquirySubmissionResult,
} from "@/app/actions/enquiries";

export async function safeSubmitPackageEnquiry(payload: any): Promise<EnquirySubmissionResult> {
  try {
    const res = await submitPackageEnquiry(payload);
    if (res && res.success) {
      return res;
    }
    if (!res?.success) {
      const apiRes = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "PACKAGE" }),
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
    }
    return res;
  } catch (actionErr) {
    console.warn("Server action failed, falling back to /api/enquiries:", actionErr);
    try {
      const apiRes = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "PACKAGE" }),
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
      const data = await apiRes.json();
      return { success: false, error: data.error || "Submission failed" };
    } catch (fetchErr: any) {
      return { success: false, error: fetchErr.message || "Network error. Please try again." };
    }
  }
}

export async function safeSubmitFlightEnquiry(payload: any): Promise<EnquirySubmissionResult> {
  try {
    const res = await submitFlightEnquiry(payload);
    if (res && res.success) {
      return res;
    }
    if (!res?.success) {
      const apiRes = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "FLIGHT" }),
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
    }
    return res;
  } catch (actionErr) {
    console.warn("Server action failed, falling back to /api/enquiries:", actionErr);
    try {
      const apiRes = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "FLIGHT" }),
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
      const data = await apiRes.json();
      return { success: false, error: data.error || "Submission failed" };
    } catch (fetchErr: any) {
      return { success: false, error: fetchErr.message || "Network error. Please try again." };
    }
  }
}

export async function safeSubmitVisaEnquiry(payload: any): Promise<EnquirySubmissionResult> {
  try {
    const res = await submitVisaEnquiry(payload);
    if (res && res.success) {
      return res;
    }
    if (!res?.success) {
      const apiRes = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "VISA" }),
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
    }
    return res;
  } catch (actionErr) {
    console.warn("Server action failed, falling back to /api/enquiries:", actionErr);
    try {
      const apiRes = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "VISA" }),
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
      const data = await apiRes.json();
      return { success: false, error: data.error || "Submission failed" };
    } catch (fetchErr: any) {
      return { success: false, error: fetchErr.message || "Network error. Please try again." };
    }
  }
}

export async function safeSubmitTravelInsuranceEnquiry(payload: any): Promise<EnquirySubmissionResult> {
  try {
    const res = await submitTravelInsuranceEnquiryAction(payload);
    if (res && res.success) {
      return res;
    }
    if (!res?.success) {
      const apiRes = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "TRAVEL_INSURANCE" }),
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
    }
    return res;
  } catch (actionErr) {
    console.warn("Server action failed, falling back to /api/enquiries:", actionErr);
    try {
      const apiRes = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "TRAVEL_INSURANCE" }),
      });
      if (apiRes.ok) {
        return await apiRes.json();
      }
      const data = await apiRes.json();
      return { success: false, error: data.error || "Submission failed" };
    } catch (fetchErr: any) {
      return { success: false, error: fetchErr.message || "Network error. Please try again." };
    }
  }
}
