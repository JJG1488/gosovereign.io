"use client";

/**
 * Hook to access tier-based feature flags.
 * Reads from NEXT_PUBLIC_* environment variables set during deployment.
 */
export function useFeatureFlags() {
  // All tier env vars use NEXT_PUBLIC_ prefix for client access
  const paymentTier = process.env.NEXT_PUBLIC_PAYMENT_TIER || "starter";
  const maxServicesRaw = process.env.NEXT_PUBLIC_MAX_SERVICES || "10";
  const maxServices = maxServicesRaw === "unlimited" ? Infinity : parseInt(maxServicesRaw, 10);
  
  const isPro = paymentTier === "pro" || paymentTier === "hosted";

  return {
    paymentTier,
    maxServices,
    // Feature flags
    calendlyEnabled: process.env.NEXT_PUBLIC_CALENDLY_ENABLED === "true" || isPro,
    portfolioEnabled: process.env.NEXT_PUBLIC_PORTFOLIO_ENABLED === "true" || isPro,
    analyticsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" || isPro,
    premiumThemesEnabled: process.env.NEXT_PUBLIC_PREMIUM_THEMES_ENABLED === "true" || isPro,
    customDomainEnabled: process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_ENABLED === "true" || isPro,
    // Helper
    isPro,
  };
}

/**
 * Check if a service can be added (enforces tier limits)
 */
export function canAddService(currentCount: number): boolean {
  const maxServicesRaw = process.env.NEXT_PUBLIC_MAX_SERVICES || "10";
  const maxServices = maxServicesRaw === "unlimited" ? Infinity : parseInt(maxServicesRaw, 10);
  return currentCount < maxServices;
}

/**
 * Get the current service limit for display purposes
 */
export function getServiceLimit(): number | "unlimited" {
  const maxServicesRaw = process.env.NEXT_PUBLIC_MAX_SERVICES || "10";
  return maxServicesRaw === "unlimited" ? "unlimited" : parseInt(maxServicesRaw, 10);
}
