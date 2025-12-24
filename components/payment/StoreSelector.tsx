"use client";

import { useState, useEffect } from "react";
import { Store, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PaymentTier } from "@/types/database";

interface StoreOption {
  id: string;
  name: string;
  subdomain: string;
  payment_tier: PaymentTier | null;
  template: string;
}

interface StoreSelectorProps {
  onSelect: (storeId: string) => void;
  selectedStoreId: string | null;
  userId: string;
}

/**
 * Store selector component for users with multiple stores.
 * Allows them to choose which store receives the payment tier.
 */
export function StoreSelector({ onSelect, selectedStoreId, userId }: StoreSelectorProps) {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("stores")
          .select("id, config, subdomain, payment_tier, template")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (fetchError) {
          setError("Failed to load stores");
          return;
        }

        const storeOptions: StoreOption[] = (data || []).map((store: {
          id: string;
          config: { storeName?: string } | null;
          subdomain: string | null;
          payment_tier: PaymentTier | null;
          template: string | null;
        }) => ({
          id: store.id,
          name: store.config?.storeName || "Unnamed Store",
          subdomain: store.subdomain || "unknown",
          payment_tier: store.payment_tier,
          template: store.template || "goods",
        }));

        setStores(storeOptions);

        // Auto-select if only one store without a tier
        const storesWithoutTier = storeOptions.filter((s) => !s.payment_tier);
        if (storesWithoutTier.length === 1 && !selectedStoreId) {
          onSelect(storesWithoutTier[0].id);
        }
      } catch {
        setError("Failed to load stores");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchStores();
    }
  }, [userId, selectedStoreId, onSelect]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading your stores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400">No stores found. Create a store first.</p>
      </div>
    );
  }

  const getTierBadge = (tier: PaymentTier | null) => {
    if (!tier) return null;
    const colors: Record<PaymentTier, string> = {
      starter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      pro: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      hosted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[tier]}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  const getTemplateLabel = (template: string) => {
    const labels: Record<string, string> = {
      goods: "Products",
      services: "Services",
      brochure: "Brochure",
    };
    return labels[template] || template;
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        You have multiple stores. Select which store should receive this plan:
      </p>

      {stores.map((store) => {
        const isSelected = selectedStoreId === store.id;
        const hasTier = !!store.payment_tier;

        return (
          <button
            key={store.id}
            onClick={() => !hasTier && onSelect(store.id)}
            disabled={hasTier}
            className={`w-full p-4 rounded-xl border transition-all text-left ${
              isSelected
                ? "border-emerald-500 bg-emerald-500/10"
                : hasTier
                ? "border-navy-600 bg-navy-800/50 opacity-60 cursor-not-allowed"
                : "border-navy-600 bg-navy-700/50 hover:border-navy-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-navy-600 text-gray-400"
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{store.name}</span>
                    {getTierBadge(store.payment_tier)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-500">
                      {store.subdomain}.gosovereign.io
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">
                      {getTemplateLabel(store.template)}
                    </span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {hasTier && !isSelected && (
                <span className="text-xs text-gray-500">Already upgraded</span>
              )}
            </div>
          </button>
        );
      })}

      {stores.every((s) => s.payment_tier) && (
        <p className="text-sm text-amber-400 mt-4">
          All your stores already have a plan. You can upgrade an existing store to a higher tier.
        </p>
      )}
    </div>
  );
}
