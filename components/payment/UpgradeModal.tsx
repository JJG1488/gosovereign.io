"use client";

import { useState, useEffect } from "react";
import { X, Check, Rocket, Crown, Cloud, ChevronLeft, Loader2 } from "lucide-react";
import type { PaymentTier } from "@/types/database";
import { StoreSelector } from "./StoreSelector";
import { createClient } from "@/lib/supabase/client";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: "generate" | "download";
  /** Pre-selected store ID (bypasses store selection step) */
  storeId?: string;
}

type ModalStep = "store-selection" | "plan-selection";

const PLANS: {
  tier: PaymentTier;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
}[] = [
  {
    tier: "starter",
    name: "Starter",
    price: 149,
    description: "Perfect for getting started",
    icon: <Rocket className="w-6 h-6" />,
    features: [
      "Full store ownership",
      "All core features",
      "3 template options",
      "Stripe integration",
      "Email support",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 299,
    description: "For serious entrepreneurs",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Everything in Starter",
      "Priority support",
      "Custom domain setup",
      "Advanced analytics",
      "Premium templates",
      "1-on-1 setup call",
    ],
    popular: true,
  },
  {
    tier: "hosted",
    name: "Hosted",
    price: 149,
    description: "$149 setup + $19/mo hosting",
    icon: <Cloud className="w-6 h-6" />,
    features: [
      "Everything in Starter",
      "Managed hosting",
      "Automatic updates",
      "Daily backups",
      "SSL included",
      "99.9% uptime SLA",
    ],
  },
];

export function UpgradeModal({ isOpen, onClose, context = "generate", storeId: propStoreId }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState<PaymentTier | null>(null);
  const [step, setStep] = useState<ModalStep>("plan-selection");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(propStoreId || null);
  const [userId, setUserId] = useState<string | null>(null);
  const [storeCount, setStoreCount] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if user has multiple stores on mount
  useEffect(() => {
    if (!isOpen) return;

    async function checkStores() {
      setIsInitializing(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsInitializing(false);
          return;
        }

        setUserId(user.id);

        // Count user's stores
        const { count, error } = await supabase
          .from("stores")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error counting stores:", error);
          setIsInitializing(false);
          return;
        }

        setStoreCount(count || 0);

        // If user has multiple stores and no store pre-selected, show store selection
        if ((count || 0) > 1 && !propStoreId) {
          setStep("store-selection");
        } else if (count === 1) {
          // Auto-select the single store
          const { data: stores } = await supabase
            .from("stores")
            .select("id")
            .eq("user_id", user.id)
            .limit(1)
            .single();

          if (stores) {
            setSelectedStoreId(stores.id);
          }
        }
      } catch (err) {
        console.error("Error checking stores:", err);
      } finally {
        setIsInitializing(false);
      }
    }

    checkStores();
  }, [isOpen, propStoreId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(storeCount > 1 && !propStoreId ? "store-selection" : "plan-selection");
      setIsLoading(null);
      if (!propStoreId) {
        setSelectedStoreId(null);
      }
    }
  }, [isOpen, storeCount, propStoreId]);

  if (!isOpen) return null;

  const handleSelectPlan = async (tier: PaymentTier) => {
    setIsLoading(tier);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: tier,
          store_id: selectedStoreId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId);
  };

  const handleProceedToPlanSelection = () => {
    if (selectedStoreId) {
      setStep("plan-selection");
    }
  };

  const handleBackToStoreSelection = () => {
    setStep("store-selection");
  };

  const contextMessage =
    context === "generate"
      ? "To generate your store, please select a plan below."
      : "To download your store, please select a plan below.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-navy-800 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-navy-700 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Loading state */}
        {isInitializing ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : step === "store-selection" && userId ? (
          <>
            {/* Store Selection Header */}
            <div className="p-8 pb-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Choose a Store
              </h2>
              <p className="text-gray-400">
                You have multiple stores. Select which one to upgrade.
              </p>
            </div>

            {/* Store Selection */}
            <div className="px-8 pb-4">
              <StoreSelector
                userId={userId}
                selectedStoreId={selectedStoreId}
                onSelect={handleStoreSelect}
              />
            </div>

            {/* Continue Button */}
            <div className="px-8 pb-8">
              <button
                onClick={handleProceedToPlanSelection}
                disabled={!selectedStoreId}
                className="w-full py-3 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Plans
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="p-8 pb-4 text-center">
              {storeCount > 1 && (
                <button
                  onClick={handleBackToStoreSelection}
                  className="absolute left-4 top-4 text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Back</span>
                </button>
              )}
              <h2 className="text-2xl font-bold text-white mb-2">
                Unlock Your Store
              </h2>
              <p className="text-gray-400">{contextMessage}</p>
            </div>

            {/* Plans */}
            <div className="p-8 pt-4">
              <div className="grid md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                  <div
                    key={plan.tier}
                    className={`relative rounded-xl p-6 transition-all ${
                      plan.popular
                        ? "bg-emerald-500/10 border-2 border-emerald-500"
                        : "bg-navy-700/50 border border-navy-600 hover:border-navy-500"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`p-2 rounded-lg ${
                          plan.popular
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-navy-600 text-gray-300"
                        }`}
                      >
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{plan.name}</h3>
                        <p className="text-sm text-gray-400">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-white">
                        ${plan.price}
                      </span>
                      {plan.tier !== "hosted" && (
                        <span className="text-gray-400 ml-1">one-time</span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan.tier)}
                      disabled={isLoading !== null}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        plan.popular
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-navy-600 hover:bg-navy-500 text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading === plan.tier ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Get ${plan.name}`
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 text-center">
              <p className="text-sm text-gray-500">
                Secure payment powered by Stripe. Cancel anytime for hosted plans.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
