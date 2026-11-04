export interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
  example: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", minDigits: 10, maxDigits: 10, example: "98980 00000" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", minDigits: 10, maxDigits: 10, example: "415 555 2671" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", minDigits: 10, maxDigits: 11, example: "7911 123456" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", minDigits: 9, maxDigits: 9, example: "50 123 4567" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", minDigits: 10, maxDigits: 10, example: "416 555 0199" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", minDigits: 9, maxDigits: 9, example: "412 345 678" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", minDigits: 8, maxDigits: 8, example: "8123 4567" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪", minDigits: 9, maxDigits: 9, example: "712 345678" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿", minDigits: 8, maxDigits: 10, example: "21 123 4567" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", minDigits: 10, maxDigits: 11, example: "151 12345678" },
];

export function validatePhoneNumber(dialCode: string, nationalNumber: string): { isValid: boolean; error?: string; normalized?: string } {
  const cleanNumber = nationalNumber.replace(/\D/g, "");
  const country = COUNTRY_CODES.find((c) => c.dialCode === dialCode) || {
    minDigits: 7,
    maxDigits: 15,
  };

  if (!cleanNumber) {
    return { isValid: false, error: "Phone number is required." };
  }

  if (cleanNumber.length < country.minDigits || cleanNumber.length > country.maxDigits) {
    return {
      isValid: false,
      error: `For ${dialCode}, phone number must be ${country.minDigits === country.maxDigits ? country.minDigits : `${country.minDigits} to ${country.maxDigits}`} digits.`,
    };
  }

  // Basic sanity check: prevent all zeros
  if (/^0+$/.test(cleanNumber)) {
    return { isValid: false, error: "Please enter a plausible valid telephone number." };
  }

  return {
    isValid: true,
    normalized: `${dialCode}${cleanNumber}`,
  };
}

