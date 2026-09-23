export const ADMIN_COOKIE_NAME = "anabia-admin-session";
export const ADMIN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Derives a deterministic SHA-256 token from the configured ADMIN_PASSWORD.
 * Uses Web Crypto API (crypto.subtle) so it runs identically in Edge Middleware and Node.js.
 */
export async function getExpectedAdminToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "yourclientpassword";
  const encoder = new TextEncoder();
  const data = encoder.encode(`anabia-admin-v1:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifies if a given plain-text password matches ADMIN_PASSWORD.
 */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || "yourclientpassword";
  if (!password || !adminPassword) return false;
  return password === adminPassword;
}

/**
 * Validates the value of an anabia-admin-session cookie.
 */
export async function verifyAdminSession(cookieValue?: string | null): Promise<boolean> {
  if (!cookieValue) return false;
  const expectedToken = await getExpectedAdminToken();
  return cookieValue === expectedToken;
}
