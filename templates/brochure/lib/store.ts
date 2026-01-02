/**
 * Get store configuration from environment variables.
 * These are set during deployment by the GoSovereign platform.
 */
export function getStoreConfig() {
  return {
    id: process.env.NEXT_PUBLIC_STORE_ID || "",
    name: process.env.NEXT_PUBLIC_STORE_NAME || "My Site",
    brandColor: process.env.NEXT_PUBLIC_BRAND_COLOR || "#10b981",
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
    themePreset: process.env.NEXT_PUBLIC_THEME_PRESET || "default",
  };
}

/**
 * Get the app URL for links
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
