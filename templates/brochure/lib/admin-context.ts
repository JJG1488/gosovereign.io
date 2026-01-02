import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Verify admin password against environment variable
 */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminPassword && !superAdminPassword) {
    console.error("No admin password configured");
    return false;
  }

  return password === adminPassword || password === superAdminPassword;
}

/**
 * Create admin session token
 */
export function createSessionToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(`${timestamp}:${random}`).toString("base64");
}

/**
 * Verify session token is valid (not expired)
 */
export function verifySessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [timestamp] = decoded.split(":");
    const age = Date.now() - parseInt(timestamp, 10);
    return age < ADMIN_COOKIE_MAX_AGE * 1000;
  } catch {
    return false;
  }
}

/**
 * Get admin session from cookies (server-side)
 */
export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!session?.value) return null;
  return verifySessionToken(session.value) ? session.value : null;
}

/**
 * Check if current request is authenticated as admin
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null;
}

export { ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE };
