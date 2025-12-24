/**
 * Slugify utility for converting store names to URL-safe subdomains.
 *
 * Examples:
 * - "Goobers Movers" -> "goobers-movers"
 * - "Café Del Mar!" -> "cafe-del-mar"
 * - "John's Store 123" -> "johns-store-123"
 */

/**
 * Converts a store name to a URL-safe subdomain.
 * - Lowercase
 * - Removes accents/diacritics
 * - Removes special characters (keeps alphanumeric and hyphens)
 * - Replaces spaces with hyphens
 * - Collapses multiple hyphens
 * - Trims leading/trailing hyphens
 * - Limits to 63 characters (DNS subdomain limit)
 */
export function slugifyStoreName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // Decompose accents (é -> e + combining accent)
    .replace(/[\u0300-\u036f]/g, "") // Remove combining accent marks
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars, keep alphanumeric, spaces, hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens to single
    .replace(/^-|-$/g, "") // Trim leading/trailing hyphens
    .slice(0, 63); // DNS subdomain limit
}

/**
 * Reserved subdomains that cannot be used for stores.
 */
export const RESERVED_SUBDOMAINS = [
  "www",
  "api",
  "admin",
  "app",
  "mail",
  "ftp",
  "cdn",
  "assets",
  "static",
  "images",
  "files",
  "blog",
  "help",
  "support",
  "docs",
  "status",
  "dashboard",
  "login",
  "signup",
  "auth",
  "oauth",
  "account",
  "billing",
  "payment",
  "checkout",
  "store",
  "stores",
  "shop",
  "test",
  "staging",
  "dev",
  "demo",
];

/**
 * Validates a subdomain format.
 * Must be:
 * - At least 3 characters
 * - Start and end with alphanumeric
 * - Only contain lowercase letters, numbers, and hyphens
 */
export function isValidSubdomainFormat(subdomain: string): {
  valid: boolean;
  error?: string;
} {
  if (!subdomain) {
    return { valid: false, error: "Subdomain is required" };
  }

  if (subdomain.length < 3) {
    return { valid: false, error: "Subdomain must be at least 3 characters" };
  }

  if (subdomain.length > 63) {
    return { valid: false, error: "Subdomain must be 63 characters or less" };
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain) && subdomain.length >= 2) {
    // For 2-char subdomains, just check alphanumeric
    if (subdomain.length === 2 && !/^[a-z0-9]{2}$/.test(subdomain)) {
      return {
        valid: false,
        error: "Subdomain must start and end with a letter or number",
      };
    }
    if (subdomain.length > 2) {
      return {
        valid: false,
        error: "Subdomain must start and end with a letter or number, and only contain letters, numbers, and hyphens",
      };
    }
  }

  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return { valid: false, error: "This subdomain is reserved" };
  }

  return { valid: true };
}
