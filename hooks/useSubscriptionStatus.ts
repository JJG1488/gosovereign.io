"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SubscriptionStatus {
  subscriptionStatus: "active" | "past_due" | "cancelled" | "none" | null;
  canDeploy: boolean;
  subscriptionEndsAt: Date | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and monitor subscription status for a store.
 * Useful for showing warnings and restricting actions in the UI.
 */
export function useSubscriptionStatus(storeId: string | null): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscriptionStatus: null,
    canDeploy: true,
    subscriptionEndsAt: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!storeId) {
      setStatus({
        subscriptionStatus: null,
        canDeploy: true,
        subscriptionEndsAt: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    async function fetchStatus() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("stores")
          .select("subscription_status, can_deploy, subscription_ends_at")
          .eq("id", storeId)
          .single();

        if (error) {
          setStatus({
            subscriptionStatus: null,
            canDeploy: true,
            subscriptionEndsAt: null,
            isLoading: false,
            error: error.message,
          });
          return;
        }

        setStatus({
          subscriptionStatus: data?.subscription_status || null,
          canDeploy: data?.can_deploy ?? true,
          subscriptionEndsAt: data?.subscription_ends_at
            ? new Date(data.subscription_ends_at)
            : null,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setStatus({
          subscriptionStatus: null,
          canDeploy: true,
          subscriptionEndsAt: null,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    fetchStatus();
  }, [storeId]);

  return status;
}

/**
 * Helper to get a user-friendly message based on subscription status.
 */
export function getSubscriptionWarningMessage(
  subscriptionStatus: string | null,
  subscriptionEndsAt: Date | null
): string | null {
  if (!subscriptionStatus) return null;

  switch (subscriptionStatus) {
    case "past_due":
      return "Your payment failed. Please update your payment method to continue deploying updates.";
    case "cancelled":
      if (subscriptionEndsAt) {
        const formattedDate = subscriptionEndsAt.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        return `Your subscription was cancelled. Store remains active until ${formattedDate}, but you cannot deploy updates.`;
      }
      return "Your subscription was cancelled. You cannot deploy updates.";
    default:
      return null;
  }
}
