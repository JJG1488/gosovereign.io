"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WizardProvider, WizardContainer, useWizard } from "@/components/wizard";
import {
  createStore,
  getUserStore,
  createWizardProgress,
  getCurrentUser,
  getStore,
} from "@/lib/supabase";
import type { StoreTemplate } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { Loader2, LogOut } from "lucide-react";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { UpgradeModal, PaymentStatusBadge } from "@/components/payment";
import { slugifyStoreName } from "@/lib/slugify";

function WizardContent() {
  const router = useRouter();
  const { storeId, saveProgress } = useWizard();
  const { isPaid, tier, isLoading: isPaymentLoading } = usePaymentStatus();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

        console.log("Profile check result:", { userProfile, profileCheckError });

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
          console.log("No user profile found, attempting to create one...");
          // Manually create user profile if trigger hasn't fired yet
          const { data: newProfile, error: profileError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email,
            })
            .select()
            .single();

          console.log("Profile creation result:", { newProfile, profileError });

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
            console.log("Profile already exists (created by trigger), continuing...");
          }
        }

        // Check if user has existing stores
        const existingStore = await getUserStore(user.id);

        // BOGO deal: 2 stores allowed until Feb 1, 2026
        const BOGO_DEADLINE = new Date("2026-02-01T00:00:00Z");
        const isBogoPeriod = Date.now() < BOGO_DEADLINE.getTime();
        const MAX_STORES = isBogoPeriod ? 2 : 1;

        // Count user's stores
        const { count: storeCount } = await supabase
          .from("stores")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (existingStore) {
          // Check if trying to create a new store beyond limit
          if ((storeCount || 0) >= MAX_STORES && !urlStoreId) {
            // Already at store limit, redirect to existing store
            setTemplate(existingStore.template || "goods");
            setStoreId(existingStore.id);
            router.replace(`/wizard?store=${existingStore.id}`);
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
                console.log("Propagated payment tier to new store:", userProfile.payment_tier);
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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Inline header JSX to avoid component-during-render issue
  const headerJSX = (
    <header className="border-b border-navy-700 bg-navy-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">GoSovereign</span>
            <span className="text-xs text-gray-500 bg-navy-700 px-2 py-1 rounded">Setup</span>
            <PaymentStatusBadge isPaid={isPaid} tier={tier} isLoading={isPaymentLoading} />
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );

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

  return (
    <div className="min-h-screen bg-navy-900">
      {headerJSX}
      <main className="py-8 px-4">
        <WizardProvider storeId={storeId} template={template}>
          <WizardContent />
        </WizardProvider>
      </main>
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
