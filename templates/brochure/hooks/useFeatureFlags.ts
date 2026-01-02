"use client";

/**
 * Hook to access tier-based feature flags.
 * Reads from NEXT_PUBLIC_* environment variables set during deployment.
 */
export function useFeatureFlags() {
  const paymentTier = process.env.NEXT_PUBLIC_PAYMENT_TIER || "starter";
  const isPro = paymentTier === "pro" || paymentTier === "hosted";

  return {
    paymentTier,
    // Feature flags
    analyticsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" || isPro,
    premiumThemesEnabled: process.env.NEXT_PUBLIC_PREMIUM_THEMES_ENABLED === "true" || isPro,
    customDomainEnabled: process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_ENABLED === "true" || isPro,
    // Helper
    isPro,
  };
}
