"use client";

import { useState } from "react";
import { X, Check, Rocket, Crown, Cloud } from "lucide-react";
import type { PaymentTier } from "@/types/database";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: "generate" | "download";
}

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

export function UpgradeModal({ isOpen, onClose, context = "generate" }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState<PaymentTier | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (tier: PaymentTier) => {
    setIsLoading(tier);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tier }),
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

        {/* Header */}
        <div className="p-8 pb-4 text-center">
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
      </div>
    </div>
  );
}
