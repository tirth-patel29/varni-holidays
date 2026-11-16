import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import { hashToken } from './crypto';

/**
 * Enterprise TOTP & Multi-Factor Authentication Utilities for Varni Holidays
 * RFC 6238 compliant TOTP for Google Authenticator, Microsoft Authenticator, 1Password, Authy.
 */

const ISSUER = 'Varni Holidays';

/**
 * Generate a cryptographically secure Base32 TOTP Secret
 */
export function generateTotpSecret(): string {
  return generateSecret();
}

/**
 * Generate the standard otpauth:// URI
 */
export function generateTotpUri(email: string, secret: string): string {
  return generateURI({
    issuer: ISSUER,
    label: email,
    secret,
  });
}

/**
 * Render a crisp QR code data URL (image/png) for mobile authenticator scanning
 */
export async function generateQrCodeDataUrl(otpAuthUri: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: {
      dark: '#153650', // Varni Holidays brand primary
      light: '#FFFFFF',
    },
  });
}

/**
 * Verify a 6-digit TOTP code with safe ±1 time window clock-skew tolerance (±30s)
 */
export function verifyTotpCode(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.trim().replace(/\s+/g, '');
  if (cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) {
    return false;
  }

  try {
    const result = verifySync({
      token: cleanToken,
      secret: secret.trim(),
    });
    return result.valid;
  } catch (err) {
    console.error('[TOTP Verification Error]:', err);
    return false;
  }
}

/**
 * Verify and consume a single-use recovery code.
 * Returns { valid: true, remainingHashedCodesJson: string } if matched, or { valid: false } if not.
 */
export function consumeRecoveryCode(
  plainCode: string,
  storedHashedCodesJson: string
): { valid: boolean; remainingHashedCodesJson?: string } {
  if (!plainCode || !storedHashedCodesJson) {
    return { valid: false };
  }

  const cleanCode = plainCode.trim().toUpperCase();
  const inputHash = hashToken(cleanCode);

  try {
    const hashedCodes: string[] = JSON.parse(storedHashedCodesJson);
    if (!Array.isArray(hashedCodes)) {
      return { valid: false };
    }

    const matchIndex = hashedCodes.findIndex((h) => h === inputHash);
    if (matchIndex === -1) {
      return { valid: false };
    }

    // Invalidate the matched code (single-use enforcement)
    const updated = [...hashedCodes];
    updated.splice(matchIndex, 1);

    return {
      valid: true,
      remainingHashedCodesJson: JSON.stringify(updated),
    };
  } catch {
    return { valid: false };
  }
}
