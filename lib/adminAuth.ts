export const ADMIN_COOKIE_NAME = "anabia-admin-session";
export const ADMIN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Constant-time string comparison to prevent timing attacks.
 * Uses bitwise XOR accumulation which executes in constant time regardless of match position.
 * Compatible with Edge Runtime and Node.js.
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  if (aBuf.byteLength !== bBuf.byteLength) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < aBuf.byteLength; i++) {
    mismatch |= aBuf[i] ^ bBuf[i];
  }
  return mismatch === 0;
}

/**
 * Derives a SHA-256 token from the configured ADMIN_PASSWORD.
 * Fails closed if ADMIN_PASSWORD is missing or empty.
 */
export async function getExpectedAdminToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.trim().length === 0) {
    throw new Error("ADMIN_PASSWORD is not configured in environment variables.");
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(`anabia-admin-v1:${password.trim()}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifies if a given plain-text password matches ADMIN_PASSWORD using constant-time comparison.
 */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!password || !adminPassword || adminPassword.trim().length === 0) return false;
  return safeCompare(password.trim(), adminPassword.trim());
}

/**
 * Validates the value of an anabia-admin-session cookie using constant-time comparison.
 */
export async function verifyAdminSession(cookieValue?: string | null): Promise<boolean> {
  if (!cookieValue) return false;
  try {
    const expectedToken = await getExpectedAdminToken();
    return safeCompare(cookieValue.trim(), expectedToken);
  } catch {
    return false;
  }
}
