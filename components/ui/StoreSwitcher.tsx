"use client";

import { useState, useRef, useEffect } from "react";
import { Gift, ChevronDown, Store, Check, Plus, Rocket, FileText, ExternalLink, Copy } from "lucide-react";
import { isBogoPeriod, formatCountdownShort, getMaxStores } from "@/lib/bogo";
import type { PaymentTier } from "@/types/database";

interface StoreOption {
  id: string;
  name: string;
  subdomain: string;
  payment_tier: PaymentTier | null;
  template: string;
  status: string;
  deployment_url?: string | null;
}

interface StoreSwitcherProps {
  stores: StoreOption[];
  currentStoreId: string | null;
  onSwitchStore: (storeId: string) => void;
  onCreateStore: () => void;
}

/**
 * Interactive store switcher that replaces BogoBadge.
 * Shows store count/countdown as a clickable badge that opens a dropdown
 * with store list and "Create New Store" option.
 */
export function StoreSwitcher({
  stores,
  currentStoreId,
  onSwitchStore,
  onCreateStore,
}: StoreSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const storeCount = stores.length;

  // Handle copy URL
  const handleCopyUrl = async (e: React.MouseEvent, store: StoreOption) => {
    e.stopPropagation(); // Prevent store selection
    if (!store.deployment_url) return;

    try {
      await navigator.clipboard.writeText(store.deployment_url);
      setCopiedStoreId(store.id);
      setTimeout(() => setCopiedStoreId(null), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Handle visit store
  const handleVisitStore = (e: React.MouseEvent, store: StoreOption) => {
    e.stopPropagation(); // Prevent store selection
    if (store.deployment_url) {
      window.open(store.deployment_url, "_blank");
    }
  };
  const maxStores = getMaxStores();
  const canCreateStore = storeCount < maxStores && isBogoPeriod();
  const countdown = formatCountdownShort();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const getTierBadge = (tier: PaymentTier | null) => {
    if (!tier) return null;
    const colors: Record<PaymentTier, string> = {
      starter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      pro: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      hosted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded border ${colors[tier]}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  const getStatusDot = (status: string) => {
    if (status === "deployed") {
      return <span className="w-2 h-2 rounded-full bg-emerald-500" title="Deployed" />;
    }
    return <span className="w-2 h-2 rounded-full bg-gray-500" title="Draft" />;
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
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Badge (like BogoBadge but interactive) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors cursor-pointer"
      >
        <Gift className="w-3.5 h-3.5" />
        <span>
          {storeCount} of {maxStores} Stores
        </span>
        {isBogoPeriod() && (
          <>
            <span className="text-purple-500/50">•</span>
            <span className="text-purple-300">{countdown}</span>
          </>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-navy-800 border border-navy-600 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-navy-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Your Stores</span>
              {isBogoPeriod() && (
                <span className="text-xs text-purple-400">
                  BOGO ends in {countdown}
                </span>
              )}
            </div>
          </div>

          {/* Store List */}
          <div className="p-2 max-h-64 overflow-y-auto">
            {stores.map((store) => {
              const isSelected = currentStoreId === store.id;

              return (
                <div
                  key={store.id}
                  className={`w-full p-3 rounded-lg transition-all text-left mb-1 last:mb-0 ${
                    isSelected
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "bg-navy-700/50 border border-transparent hover:bg-navy-700 hover:border-navy-600"
                  }`}
                >
                  {/* Clickable Store Info */}
                  <button
                    onClick={() => {
                      onSwitchStore(store.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? "bg-purple-500/30 text-purple-400"
                              : "bg-navy-600 text-gray-400"
                          }`}
                        >
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm truncate max-w-[140px]">
                              {store.name}
                            </span>
                            {getTierBadge(store.payment_tier)}
                            {getStatusDot(store.status)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-gray-500 truncate max-w-[120px]">
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
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Quick Actions for Deployed Stores */}
                  {store.status === "deployed" && store.deployment_url && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-navy-600">
                      <button
                        onClick={(e) => handleVisitStore(e, store)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded hover:bg-emerald-500/20 transition-colors"
                        title="Visit store"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Visit
                      </button>
                      <button
                        onClick={(e) => handleCopyUrl(e, store)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-navy-600 border border-navy-500 rounded hover:bg-navy-500 hover:text-white transition-colors"
                        title="Copy URL"
                      >
                        {copiedStoreId === store.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy URL
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Create New Store Button */}
          {canCreateStore && (
            <div className="p-2 border-t border-navy-700">
              <button
                onClick={() => {
                  onCreateStore();
                  setIsOpen(false);
                }}
                className="w-full p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="font-medium text-purple-400 text-sm">
                      Create New Store
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Use your BOGO bonus store
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* All slots used message */}
          {!canCreateStore && storeCount >= maxStores && (
            <div className="px-4 py-3 border-t border-navy-700 bg-navy-900/50">
              <p className="text-xs text-gray-500 text-center">
                You&apos;ve used all {maxStores} store slots
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
