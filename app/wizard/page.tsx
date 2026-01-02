"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WizardProvider, WizardContainer, useWizard } from "@/components/wizard";
import {
  createStore,
  getUserStores,
  createWizardProgress,
  getCurrentUser,
  getStore,
} from "@/lib/supabase";
import type { StoreTemplate, PaymentTier } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { UpgradeModal } from "@/components/payment";
import { slugifyStoreName } from "@/lib/slugify";
import { StoreLimitModal, NewStoreModal } from "@/components/ui";
import { AppHeader } from "@/components/layout";
import type { StoreOption } from "@/components/layout";
import { getMaxStores } from "@/lib/bogo";

interface WizardContentProps {
  prefillName?: string;
  prefillColor?: string;
}

function WizardContent({ prefillName, prefillColor }: WizardContentProps) {
  const router = useRouter();
  const { storeId, saveProgress, updateConfig } = useWizard();
  const { isPaid } = usePaymentStatus();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const prefillApplied = useRef(false);

  // Apply prefill values from mini-wizard on mount
  useEffect(() => {
    if (prefillApplied.current) return;
    prefillApplied.current = true;

    if (prefillName || prefillColor) {
      const updates: Record<string, string> = {};
      if (prefillName) updates.storeName = prefillName;
      if (prefillColor) updates.primaryColor = prefillColor;
      updateConfig(updates);
    }
  }, [prefillName, prefillColor, updateConfig]);

  const handleGenerate = async () => {
    // Check payment status before allowing generation
    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      await saveProgress();
      // Navigate to preview with store ID
      router.push(`/wizard/preview?store=${storeId}`);
    } catch (err) {
      console.error("Error generating store:", err);
    }
  };

  return (
    <>
      <WizardContainer onGenerate={handleGenerate} />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        context="generate"
      />
    </>
  );
}

function WizardLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [template, setTemplate] = useState<StoreTemplate>("goods");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isPaid, tier, isLoading: isPaymentLoading } = usePaymentStatus();
  const [userStoreCount, setUserStoreCount] = useState<number>(0);
  const [userStores, setUserStores] = useState<StoreOption[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showStoreLimitModal, setShowStoreLimitModal] = useState(false);
  const [showNewStoreModal, setShowNewStoreModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [prefillName, setPrefillName] = useState<string | undefined>();
  const [prefillColor, setPrefillColor] = useState<string | undefined>();

  // Guard against double initialization (React StrictMode)
  const initializingRef = useRef(false);

  useEffect(() => {
    async function initializeWizard() {
      // Prevent double initialization from StrictMode
      if (initializingRef.current) {
        return;
      }
      initializingRef.current = true;

      try {
        // Check if store ID is in URL
        const urlStoreId = searchParams.get("store");
        const urlTemplate = searchParams.get("template") as StoreTemplate | null;

        // Extract prefill values from mini-wizard
        const urlPrefillName = searchParams.get("prefill_name");
        const urlPrefillColor = searchParams.get("prefill_color");
        if (urlPrefillName) setPrefillName(urlPrefillName);
        if (urlPrefillColor) setPrefillColor(urlPrefillColor);

        if (urlStoreId) {
          // Load existing store and get its template
          const existingStoreData = await getStore(urlStoreId);
          if (existingStoreData) {
            setTemplate(existingStoreData.template || "goods");
          }
          setStoreId(urlStoreId);
          setIsLoading(false);
          return;
        }

        // Validate template from URL
        const validTemplates: StoreTemplate[] = ["goods", "services", "brochure"];
        const selectedTemplate = urlTemplate && validTemplates.includes(urlTemplate) ? urlTemplate : "goods";
        setTemplate(selectedTemplate);

        // Get current user
        const user = await getCurrentUser();
        if (!user) {
          // Redirect to signup for new users (not login)
          router.push("/auth/signup?next=/wizard");
          return;
        }

        // Ensure user profile exists (handles race condition with auth trigger)
        const supabase = createClient();
        const { data: userProfile, error: profileCheckError } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        // Handle various error cases
        if (profileCheckError) {
          // 42P01 = table doesn't exist
          if (profileCheckError.code === "42P01") {
            console.error("Users table does not exist. Please run the database setup script.");
            setError("Database not configured. Please contact support.");
            setIsLoading(false);
            return;
          }
          // PGRST116 = no rows found (expected for new users, continue to create)
          if (profileCheckError.code !== "PGRST116") {
            console.error("Unexpected error checking user profile:", profileCheckError);
            // Continue anyway - the trigger might have created the profile
          }
        }

        if (!userProfile) {
          // Manually create user profile if trigger hasn't fired yet
          const { error: profileError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email,
            })
            .select()
            .single();

          if (profileError) {
            // Ignore "already exists" error (23505 = unique_violation)
            // This can happen if the trigger created the profile between our check and insert
            if (profileError.code !== "23505") {
              console.error("Error creating user profile:", {
                code: profileError.code,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
              });
              // Check for common issues
              if (profileError.code === "42501") {
                setError("Permission denied. RLS policy may be misconfigured.");
              } else if (profileError.code === "23503") {
                setError("Foreign key error. Database may need setup.");
              } else {
                setError(`Failed to create user profile: ${profileError.message}`);
              }
              setIsLoading(false);
              return;
            }
          }
        }

        // Track user email
        setUserEmail(user.email || "");

        // Get ALL user stores for StoreSwitcher
        const allStores = await getUserStores(user.id);
        const storeCount = allStores.length;

        // Track store count and stores for UI
        setUserStoreCount(storeCount);
        setUserStores(allStores.map(s => ({
          id: s.id,
          name: (s.config as { branding?: { storeName?: string } })?.branding?.storeName || s.name || "Unnamed Store",
          subdomain: s.subdomain || "unknown",
          payment_tier: s.payment_tier as PaymentTier | null,
          template: s.template || "goods",
          status: s.status || "draft",
          deployment_url: s.deployment_url || null,
        })));

        // BOGO deal: 2 stores allowed until Feb 1, 2026
        const MAX_STORES = getMaxStores();

        // Get most recent store for existing user
        const existingStore = allStores.length > 0 ? allStores[allStores.length - 1] : null;

        if (existingStore) {
          // Check if trying to create a new store beyond limit
          if ((storeCount || 0) >= MAX_STORES && !urlStoreId) {
            // Show store limit modal instead of silent redirect
            setTemplate(existingStore.template || "goods");
            setStoreId(existingStore.id);
            setShowStoreLimitModal(true);
            setIsLoading(false);
            return;
          }

          // Resume existing store - use its template
          setTemplate(existingStore.template || "goods");
          setStoreId(existingStore.id);
          router.replace(`/wizard?store=${existingStore.id}`);
        } else {
          // Create new store with selected template
          const storeName = selectedTemplate === "brochure" ? "My Site" :
                           selectedTemplate === "services" ? "My Business" : "My Store";

          // Generate subdomain from store name (will be updated when user changes store name)
          let subdomain = slugifyStoreName(storeName);

          // Check availability and add suffix if needed
          try {
            const checkRes = await fetch(`/api/subdomain/check?subdomain=${encodeURIComponent(subdomain)}`);
            const checkData = await checkRes.json();
            if (!checkData.available) {
              // Add timestamp suffix if default name is taken
              subdomain = `${subdomain}-${Date.now().toString(36).slice(-4)}`;
            }
          } catch {
            // If check fails, add unique suffix anyway
            subdomain = `${subdomain}-${Date.now().toString(36).slice(-4)}`;
          }

          const newStore = await createStore(user.id, storeName, subdomain, selectedTemplate);

          if (newStore) {
            // Create wizard progress record
            await createWizardProgress(newStore.id);

            // Propagate user's payment tier to new store if they paid before creating a store
            const supabase = createClient();
            const { data: userProfile } = await supabase
              .from("users")
              .select("payment_tier")
              .eq("id", user.id)
              .single();

            if (userProfile?.payment_tier) {
              // Check if any existing stores already have this tier applied
              const { data: storesWithTier } = await supabase
                .from("stores")
                .select("id")
                .eq("user_id", user.id)
                .not("payment_tier", "is", null);

              // If no stores have tier applied yet, apply to this new store
              if (!storesWithTier || storesWithTier.length === 0) {
                await supabase
                  .from("stores")
                  .update({
                    payment_tier: userProfile.payment_tier,
                    subscription_status: userProfile.payment_tier === "hosted" ? "active" : "none",
                    can_deploy: true,
                  })
                  .eq("id", newStore.id);
              }
            }

            setStoreId(newStore.id);
            router.replace(`/wizard?store=${newStore.id}`);
          } else {
            setError("Failed to create store. Please try again.");
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing wizard:", err);
        setError("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    }

    initializeWizard();
  }, [router, searchParams]);

  // Store switching handler
  const handleSwitchStore = (newStoreId: string) => {
    if (newStoreId !== storeId) {
      router.replace(`/wizard?store=${newStoreId}`);
    }
  };

  // Open template selection modal for new store
  const handleCreateNewStore = () => {
    setShowNewStoreModal(true);
  };

  // Handle template selection and create new store directly
  const handleTemplateSelect = async (selectedTemplate: StoreTemplate) => {
    setShowNewStoreModal(false);
    setIsLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/auth/signup?next=/wizard");
        return;
      }

      // Generate store name based on template
      const storeName = selectedTemplate === "brochure" ? "My New Site" :
                       selectedTemplate === "services" ? "My New Business" : "My New Store";

      // Generate subdomain
      let subdomain = slugifyStoreName(storeName);

      // Check availability and add suffix if needed
      try {
        const checkRes = await fetch(`/api/subdomain/check?subdomain=${encodeURIComponent(subdomain)}`);
        const checkData = await checkRes.json();
        if (!checkData.available) {
          subdomain = `${subdomain}-${Date.now().toString(36).slice(-4)}`;
        }
      } catch {
        subdomain = `${subdomain}-${Date.now().toString(36).slice(-4)}`;
      }

      // Create the new store
      const newStore = await createStore(user.id, storeName, subdomain, selectedTemplate);

      if (newStore) {
        await createWizardProgress(newStore.id);

        // Update local state with new store
        setUserStores(prev => [...prev, {
          id: newStore.id,
          name: storeName,
          subdomain: subdomain,
          payment_tier: null,
          template: selectedTemplate,
          status: "draft",
        }]);
        setUserStoreCount(prev => prev + 1);

        // Navigate to the new store
        setStoreId(newStore.id);
        setTemplate(selectedTemplate);
        router.replace(`/wizard?store=${newStore.id}`);
      } else {
        setError("Failed to create store. Please try again.");
      }
    } catch (err) {
      console.error("Error creating new store:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // AppHeader component for consistent navigation
  const headerJSX = (
    <AppHeader
      stores={userStores}
      currentStoreId={storeId}
      onSwitchStore={handleSwitchStore}
      onCreateStore={handleCreateNewStore}
      showStoreSwitcher={userStores.length > 0}
      isPaid={isPaid}
      tier={tier}
      isPaymentLoading={isPaymentLoading}
      userEmail={userEmail}
    />
  );

  // Get current store for deployed banner
  const currentStore = userStores.find(s => s.id === storeId);
  const isDeployed = currentStore?.status === "deployed" && currentStore?.deployment_url;

  // Copy URL handler
  const handleCopyUrl = async () => {
    if (!currentStore?.deployment_url) return;
    try {
      await navigator.clipboard.writeText(currentStore.deployment_url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Visit store handler
  const handleVisitStore = () => {
    if (currentStore?.deployment_url) {
      window.open(currentStore.deployment_url, "_blank");
    }
  };

  // Deployed store banner (mobile-first)
  const deployedBannerJSX = isDeployed ? (
    <div className="mx-4 mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Store info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-emerald-400 font-medium">Store is live</p>
            <a
              href={currentStore.deployment_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-emerald-400 text-sm truncate block transition-colors"
            >
              {currentStore.deployment_url!.replace("https://", "")}
            </a>
          </div>
        </div>

        {/* Action buttons - stack on mobile, inline on sm+ */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleVisitStore}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-medium rounded-lg transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Store
          </button>
          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white font-medium rounded-lg border border-navy-600 transition-colors text-sm"
          >
            {copiedUrl ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy URL
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900">
        {headerJSX}
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Setting up your store...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900">
        {headerJSX}
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-500 text-navy-900 rounded-lg font-semibold hover:bg-emerald-400"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="min-h-screen bg-navy-900">
        {headerJSX}
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  const handleManageStores = () => {
    // Close modal and redirect to first store
    setShowStoreLimitModal(false);
    if (storeId) {
      router.replace(`/wizard?store=${storeId}`);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900">
      {headerJSX}
      {deployedBannerJSX}
      <main className="py-8 px-4">
        <WizardProvider storeId={storeId} template={template}>
          <WizardContent prefillName={prefillName} prefillColor={prefillColor} />
        </WizardProvider>
      </main>

      {/* Store Limit Modal */}
      <StoreLimitModal
        isOpen={showStoreLimitModal}
        onClose={() => {
          setShowStoreLimitModal(false);
          if (storeId) {
            router.replace(`/wizard?store=${storeId}`);
          }
        }}
        onManageStores={handleManageStores}
        storeCount={userStoreCount}
      />

      {/* New Store Template Selection Modal */}
      <NewStoreModal
        isOpen={showNewStoreModal}
        onClose={() => setShowNewStoreModal(false)}
        onCreateStore={handleTemplateSelect}
      />
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <WizardLoader />
    </Suspense>
  );
}
