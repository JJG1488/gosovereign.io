"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Container, Button } from "@/components/ui";
import { PaymentStatusBadge } from "@/components/payment";
import { createClient } from "@/lib/supabase/client";
import { getUserStores } from "@/lib/supabase";
import type { PaymentTier } from "@/types/database";
import { AppHeader } from "@/components/layout";
import type { StoreOption } from "@/components/layout";

interface BillingInfo {
  paymentTier: PaymentTier | null;
  hasPaid: boolean;
  stripeCustomerId: string | null;
  subscriptionStatus: "active" | "past_due" | "cancelled" | "none" | null;
  subscriptionEndsAt: string | null;
  currentPeriodEnd: string | null;
}

export default function BillingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userStores, setUserStores] = useState<StoreOption[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function fetchBillingInfo() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Set user email for header
        setUserEmail(user.email || "");

        // Fetch user stores for header
        const allStores = await getUserStores(user.id);
        setUserStores(allStores.map(s => ({
          id: s.id,
          name: (s.config as { branding?: { storeName?: string } })?.branding?.storeName || s.name || "Unnamed Store",
          subdomain: s.subdomain || "unknown",
          payment_tier: s.payment_tier as PaymentTier | null,
          template: s.template || "goods",
          status: s.status || "draft",
          deployment_url: s.deployment_url || null,
        })));

        // Fetch user profile with payment info
        const { data: userProfile, error: userError } = await supabase
          .from("users")
          .select("payment_tier, has_paid, stripe_customer_id")
          .eq("id", user.id)
          .single();

        if (userError) {
          setError("Failed to load billing information");
          setIsLoading(false);
          return;
        }

        // Fetch store subscription info (for Hosted tier)
        const { data: stores } = await supabase
          .from("stores")
          .select("subscription_status, subscription_ends_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        // Fetch subscription period info
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("current_period_end")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const store = stores?.[0];

        setBillingInfo({
          paymentTier: userProfile?.payment_tier || null,
          hasPaid: userProfile?.has_paid || false,
          stripeCustomerId: userProfile?.stripe_customer_id || null,
          subscriptionStatus: store?.subscription_status || null,
          subscriptionEndsAt: store?.subscription_ends_at || null,
          currentPeriodEnd: subscription?.current_period_end || null,
        });
      } catch (err) {
        console.error("Error fetching billing info:", err);
        setError("Failed to load billing information");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBillingInfo();
  }, [router]);

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to open billing portal");
        setIsPortalLoading(false);
      }
    } catch (err) {
      console.error("Portal error:", err);
      setError("Failed to open billing portal");
      setIsPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSubscriptionStatusBadge = () => {
    if (!billingInfo?.subscriptionStatus) return null;

    switch (billingInfo.subscriptionStatus) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Active
          </span>
        );
      case "past_due":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Past Due
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Store switching handler
  const handleSwitchStore = (newStoreId: string) => {
    router.push(`/wizard?store=${newStoreId}`);
  };

  // AppHeader component - no store switcher on billing page
  const headerJSX = (
    <AppHeader
      stores={userStores}
      currentStoreId={null}
      onSwitchStore={handleSwitchStore}
      showStoreSwitcher={false}
      isPaid={billingInfo?.hasPaid || false}
      tier={billingInfo?.paymentTier || null}
      isPaymentLoading={isLoading}
      userEmail={userEmail}
    />
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-navy-900">
        {headerJSX}
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy-900">
      {headerJSX}
      <div className="py-12">
        <Container size="sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Billing & Subscription
            </h1>
            <p className="text-gray-400 text-sm">
              Manage your plan and payment method
            </p>
          </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-400 hover:text-red-300 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Current Plan
            </h2>
            <PaymentStatusBadge
              isPaid={billingInfo?.hasPaid || false}
              tier={billingInfo?.paymentTier || null}
            />
          </div>

          {!billingInfo?.hasPaid ? (
            <p className="text-gray-400">
              You haven&apos;t purchased a plan yet. Complete a purchase to
              unlock all features.
            </p>
          ) : (
            <p className="text-gray-400">
              You own the{" "}
              <span className="text-white font-medium">
                {billingInfo.paymentTier
                  ? billingInfo.paymentTier.charAt(0).toUpperCase() +
                    billingInfo.paymentTier.slice(1)
                  : "GoSovereign"}
              </span>{" "}
              plan.
              {billingInfo.paymentTier !== "hosted" && (
                <span className="text-emerald-400">
                  {" "}
                  One-time purchase, yours forever.
                </span>
              )}
            </p>
          )}
        </div>

        {/* Subscription Status Card (Hosted tier only) */}
        {billingInfo?.paymentTier === "hosted" && (
          <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Subscription Status
              </h2>
              {getSubscriptionStatusBadge()}
            </div>

            {billingInfo.subscriptionStatus === "past_due" && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                <p className="text-amber-200 text-sm">
                  Your payment failed. Please update your payment method to
                  continue deploying updates.
                </p>
              </div>
            )}

            {billingInfo.subscriptionStatus === "cancelled" && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <p className="text-red-200 text-sm">
                  Your subscription was cancelled.
                  {billingInfo.subscriptionEndsAt && (
                    <>
                      {" "}
                      Store remains active until{" "}
                      <span className="font-medium">
                        {formatDate(billingInfo.subscriptionEndsAt)}
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>
            )}

            {billingInfo.currentPeriodEnd &&
              billingInfo.subscriptionStatus === "active" && (
                <p className="text-gray-400">
                  Next billing date:{" "}
                  <span className="text-white font-medium">
                    {formatDate(billingInfo.currentPeriodEnd)}
                  </span>
                </p>
              )}
          </div>
        )}

        {/* Manage Subscription Button */}
        {billingInfo?.stripeCustomerId ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleManageSubscription}
            disabled={isPortalLoading}
            className="w-full"
          >
            {isPortalLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening Portal...
              </>
            ) : (
              <>
                Manage Subscription
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              No billing account found. Make a purchase to access billing
              management.
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push("/wizard")}
            >
              Go to Store Builder
            </Button>
          </div>
        )}

          {/* Footer Note */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Secure billing powered by Stripe. Questions? Contact{" "}
            <a
              href="mailto:info@gosovereign.io"
              className="text-emerald-400 hover:underline"
            >
              info@gosovereign.io
            </a>
          </p>
        </Container>
      </div>
    </main>
  );
}
