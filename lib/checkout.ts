"use client";

export type PlanType = "starter" | "pro" | "hosted";

interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export async function createCheckoutSession(
  plan: PlanType,
  variant?: string
): Promise<CheckoutResponse> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, variant }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create checkout session");
  }

  return response.json();
}

export async function redirectToCheckout(
  plan: PlanType,
  variant?: string
): Promise<void> {
  const { url } = await createCheckoutSession(plan, variant);
  window.location.href = url;
}
