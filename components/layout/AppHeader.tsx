"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  CreditCard,
  User,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StoreSwitcher } from "@/components/ui";
import { PaymentStatusBadge } from "@/components/payment";
import type { PaymentTier } from "@/types/database";

export interface StoreOption {
  id: string;
  name: string;
  subdomain: string;
  payment_tier: PaymentTier | null;
  template: string;
  status: string;
  deployment_url?: string | null;
}

interface AppHeaderProps {
  stores: StoreOption[];
  currentStoreId: string | null;
  onSwitchStore: (id: string) => void;
  onCreateStore?: () => void;
  showStoreSwitcher?: boolean;
  isPaid?: boolean;
  tier?: PaymentTier | null;
  isPaymentLoading?: boolean;
  userEmail?: string;
}

/**
 * Persistent navigation header for authenticated pages.
 * Provides access to store management, billing, and user actions.
 */
export function AppHeader({
  stores,
  currentStoreId,
  onSwitchStore,
  onCreateStore,
  showStoreSwitcher = true,
  isPaid = false,
  tier = null,
  isPaymentLoading = false,
  userEmail,
}: AppHeaderProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleCopyUrl = async (store: StoreOption) => {
    if (!store.deployment_url) return;

    try {
      await navigator.clipboard.writeText(store.deployment_url);
      setCopiedStoreId(store.id);
      setTimeout(() => setCopiedStoreId(null), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleVisitStore = (store: StoreOption) => {
    if (store.deployment_url) {
      window.open(store.deployment_url, "_blank");
    }
  };

  const handleEditStore = (storeId: string) => {
    router.push(`/wizard?store=${storeId}`);
  };

  // Get current store for quick actions
  const currentStore = stores.find((s) => s.id === currentStoreId);

  return (
    <header className="border-b border-navy-700 bg-navy-800/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + Status */}
          <div className="flex items-center gap-3">
            {/* <Link
              href="/dashboard"
              className="text-xl font-bold text-white hover:text-emerald-400 transition-colors"
            >
              GoSovereign
            </Link> */}
            {/* <span className="text-xs text-gray-500 bg-navy-700 px-2 py-1 rounded hidden sm:inline-block">
              Dashboard
            </span> */}
            <PaymentStatusBadge
              isPaid={isPaid}
              tier={tier}
              isLoading={isPaymentLoading}
            />
          </div>

          {/* Center: Store Switcher */}
          <div className="flex items-center gap-2">
            {showStoreSwitcher && stores.length > 0 && (
              <>
                <StoreSwitcher
                  stores={stores}
                  currentStoreId={currentStoreId}
                  onSwitchStore={onSwitchStore}
                  onCreateStore={onCreateStore || (() => {})}
                />

                {/* Quick Actions for Current Store */}
                {currentStore && currentStore.status === "deployed" && currentStore.deployment_url && (
                  <div className="hidden md:flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleVisitStore(currentStore)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      title="Visit your live store"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {/* <span className="hidden lg:inline">Visit</span> */}
                    </button>
                    <button
                      onClick={() => handleCopyUrl(currentStore)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 bg-navy-700 border border-navy-600 rounded-lg hover:bg-navy-600 hover:text-white transition-colors"
                      title="Copy store URL"
                    >
                      {copiedStoreId === currentStore.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden lg:inline text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Billing + User Menu */}
          <div className="flex items-center gap-3">
            {/* Billing Link */}
            <Link
              href="/billing"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-navy-700"
            >
              <CreditCard className="w-4 h-4" />
              {/* <span className="hidden sm:inline">Billing</span> */}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-navy-700"
              >
                <User className="w-4 h-4" />
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-navy-800 border border-navy-600 rounded-xl shadow-xl overflow-hidden">
                  {/* User Info */}
                  {userEmail && (
                    <div className="px-4 py-3 border-b border-navy-700">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm text-white truncate">{userEmail}</p>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/billing"
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <CreditCard className="w-4 h-4" />
                      Billing & Subscription
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-navy-700 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
