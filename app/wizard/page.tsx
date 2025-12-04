"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WizardProvider, WizardContainer, useWizard } from "@/components/wizard";
import {
  createStore,
  getUserStore,
  createWizardProgress,
  getCurrentUser,
} from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import { Loader2, LogOut } from "lucide-react";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { UpgradeModal, PaymentStatusBadge } from "@/components/payment";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isPaid, tier, isLoading: isPaymentLoading } = usePaymentStatus();

  useEffect(() => {
    async function initializeWizard() {
      try {
        // Check if store ID is in URL
        const urlStoreId = searchParams.get("store");

        if (urlStoreId) {
          setStoreId(urlStoreId);
          setIsLoading(false);
          return;
        }

        // Get current user
        const user = await getCurrentUser();
        if (!user) {
          router.push("/auth/login?next=/wizard");
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

        // Check if user has an existing store
        const existingStore = await getUserStore(user.id);

        if (existingStore) {
          // Resume existing store
          setStoreId(existingStore.id);
          router.replace(`/wizard?store=${existingStore.id}`);
        } else {
          // Create new store
          const subdomain = `store-${Date.now()}`;
          const newStore = await createStore(user.id, "My Store", subdomain);

          if (newStore) {
            // Create wizard progress record
            await createWizardProgress(newStore.id);

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

  // Shared header component for all states
  const Header = () => (
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
        <Header />
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
        <Header />
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
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <Header />
      <main className="py-8 px-4">
        <WizardProvider storeId={storeId}>
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
