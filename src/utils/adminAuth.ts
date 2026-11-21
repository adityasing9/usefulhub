/**
 * Admin Authentication and Session Utilities
 * Provides secure HMAC-signed session tokens, password verification,
 * and memory-based brute-force attempt throttling.
 */

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'usefulhub@admin2026';
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  'usefulhub-super-secure-admin-secret-2026';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// In-memory rate limiting for failed login attempts
interface RateLimitEntry {
  failures: number;
  lockedUntil: number;
}
const rateLimits = new Map<string, RateLimitEntry>();

export function isRateLimited(identifier: string): { locked: boolean; remainingSeconds: number } {
  const entry = rateLimits.get(identifier);
  if (!entry) return { locked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (entry.lockedUntil > now) {
    return {
      locked: true,
      remainingSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }

  return { locked: false, remainingSeconds: 0 };
}

export function recordLoginAttempt(identifier: string, success: boolean): void {
  const now = Date.now();
  if (success) {
    rateLimits.delete(identifier);
    return;
  }

  const current = rateLimits.get(identifier) ?? { failures: 0, lockedUntil: 0 };
  const failures = current.failures + 1;

  // Lock out after 5 consecutive failures for 5 minutes
  if (failures >= 5) {
    rateLimits.set(identifier, {
      failures,
      lockedUntil: now + 5 * 60 * 1000,
    });
  } else {
    rateLimits.set(identifier, {
      failures,
      lockedUntil: 0,
    });
  }
}

export function verifyPassword(input: string): boolean {
  if (typeof input !== 'string' || !input) return false;
  return input === DEFAULT_ADMIN_PASSWORD;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  const byteView = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < byteView.length; i += 1) {
    hex += byteView[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = `admin:${timestamp}`;
  const key = await getCryptoKey(SESSION_SECRET);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  );
  const signatureHex = bufferToHex(signatureBuffer);
  return `${payload}.${signatureHex}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, expectedSignatureHex] = parts;
  const [role, timestampStr] = payload.split(':');
  if (role !== 'admin' || !timestampStr) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;

  // Check token age
  if (Date.now() - timestamp > SESSION_TTL_MS) {
    return false;
  }

  try {
    const key = await getCryptoKey(SESSION_SECRET);
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload)
    );
    const calculatedHex = bufferToHex(signatureBuffer);
    return calculatedHex === expectedSignatureHex;
  } catch {
    return false;
  }
}
