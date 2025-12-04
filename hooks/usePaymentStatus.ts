"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PaymentTier } from "@/types/database";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface PaymentStatus {
  isPaid: boolean;
  tier: PaymentTier | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePaymentStatus(): PaymentStatus {
  const [isPaid, setIsPaid] = useState(false);
  const [tier, setTier] = useState<PaymentTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPaymentStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        setIsPaid(false);
        setTier(null);
        return;
      }

      // Get user profile with payment info
      // Note: has_paid and payment_tier columns may not exist if SQL hasn't been run
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("has_paid, payment_tier")
        .eq("id", user.id)
        .single();

      if (profileError) {
        // User might not have a profile yet (PGRST116 = no rows returned)
        // Or columns might not exist yet (42703 = undefined column)
        // In either case, default to free trial (not paid)
        if (profileError.code === "PGRST116" || profileError.code === "42703") {
          console.log("Payment status: defaulting to free trial", profileError.code);
          setIsPaid(false);
          setTier(null);
          return;
        }
        // For other errors, log but don't throw - default to free trial
        console.warn("Payment status query error, defaulting to free trial:", profileError);
        setIsPaid(false);
        setTier(null);
        return;
      }

      setIsPaid(profile?.has_paid ?? false);
      setTier((profile?.payment_tier as PaymentTier) ?? null);
    } catch (err) {
      console.error("Error fetching payment status:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch payment status"));
      setIsPaid(false);
      setTier(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();

    // Subscribe to auth changes to refetch on login
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session) {
        fetchPaymentStatus();
      } else {
        setIsPaid(false);
        setTier(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isPaid,
    tier,
    isLoading,
    error,
    refetch: fetchPaymentStatus,
  };
}
