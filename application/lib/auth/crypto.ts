import crypto from 'crypto';

/**
 * Enterprise Cryptographic & Security Utilities for Varni Holidays
 * Standardizes password hashing, encryption at rest, secure tokens, and rate limits.
 */

// Derive or fallback encryption key (AES-256 requires 32 bytes)
const ENCRYPTION_SECRET =
  process.env.TOTP_ENCRYPTION_KEY ||
  process.env.BETTER_AUTH_SECRET ||
  'VARNI_HOLIDAYS_ENTERPRISE_KEY_32_BYTES_STRICT_2026';

const DERIVED_KEY = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

/**
 * Encrypt sensitive data at rest using AES-256-GCM (Authenticated Encryption)
 */
export function encryptAtRest(plainText: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', DERIVED_KEY, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  // Format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt sensitive data at rest using AES-256-GCM
 */
export function decryptAtRest(cipherPayload: string): string {
  const parts = cipherPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted ciphertext format.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', DERIVED_KEY, iv);

  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a cryptographically secure random token (hex-encoded)
 */
export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * SHA-256 Hash for storage (single-use tokens, recovery codes, invitation tokens)
 * Plaintext secrets are NEVER stored in the database.
 */
export function hashToken(plainToken: string): string {
  return crypto.createHash('sha256').update(plainToken.trim().toLowerCase()).digest('hex');
}

/**
 * Scrypt-based Password Hashing (Modern, memory-hard, salt, constant-time)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(plainPassword, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify password against stored scrypt hash using timing-safe comparison
 */
export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;

  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    // Legacy fallback check if needed
    const legacyExpected = crypto.createHash('sha256').update(plainPassword + 'VARNI_HOLIDAYS_SALT_2026').digest('hex');
    return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(legacyExpected));
  }

  const [, salt, expectedKeyHex] = parts;
  const expectedKey = Buffer.from(expectedKeyHex, 'hex');

  return new Promise((resolve) => {
    crypto.scrypt(plainPassword, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const matches = crypto.timingSafeEqual(derivedKey, expectedKey);
        resolve(matches);
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Password strength validation:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special symbol
 */
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must include at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must include at least one numeric digit.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must include at least one special character (e.g. !@#$%^&*).' };
  }
  return { valid: true };
}

/**
 * Generate 10 secure, human-readable one-time recovery codes (e.g. "ABCD-1234-EFGH")
 */
export function generateRecoveryCodes(count = 10): { plainCodes: string[]; hashedCodes: string[] } {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(6).toString('hex').toUpperCase();
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
    plainCodes.push(formatted);
    hashedCodes.push(hashToken(formatted));
  }

  return { plainCodes, hashedCodes };
}
