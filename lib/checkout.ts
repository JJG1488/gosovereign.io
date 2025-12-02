"use client";

export type PlanType = "starter" | "pro" | "hosted";

// Stripe Payment Links - Direct checkout URLs
const PAYMENT_LINKS: Record<PlanType, string> = {
  starter: "https://buy.stripe.com/aFacMYehD3UC3yL9BydMI06",
  pro: "https://buy.stripe.com/7sYaEQgpLaj0glx5lidMI07",
  hosted: "https://buy.stripe.com/dRmfZa0qNgHo4CP152dMI08",
};

interface CheckoutOptions {
  plan: PlanType;
  variant?: string;
}

export function getCheckoutUrl({ plan, variant }: CheckoutOptions): string {
  const baseUrl = PAYMENT_LINKS[plan];

  // Add variant tracking via client_reference_id or prefilled_email param
  // Stripe Payment Links support ?client_reference_id= for tracking
  if (variant) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}client_reference_id=variant_${variant}`;
  }

  return baseUrl;
}

export function redirectToCheckout(plan: PlanType, variant?: string): void {
  const url = getCheckoutUrl({ plan, variant });
  window.location.href = url;
}
