// Store configuration from environment variables
// All client-accessible vars must use NEXT_PUBLIC_ prefix
export function getStoreConfig() {
  return {
    id: process.env.NEXT_PUBLIC_STORE_ID || "",
    name: process.env.NEXT_PUBLIC_STORE_NAME || "My Business",
    tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE || "",
    aboutText: process.env.NEXT_PUBLIC_ABOUT_TEXT || "",
    primaryColor: process.env.NEXT_PUBLIC_BRAND_COLOR || "#FFD700",
    themePreset: process.env.NEXT_PUBLIC_THEME_PRESET || "default",
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
    // Contact info
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
    address: process.env.NEXT_PUBLIC_ADDRESS || "",
    // Social links
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
    twitterUrl: process.env.NEXT_PUBLIC_TWITTER_URL || "",
    linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
  };
}
