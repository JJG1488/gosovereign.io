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
import { Loader2 } from "lucide-react";

function WizardContent() {
  const router = useRouter();
  const { storeId, saveProgress } = useWizard();

  const handleGenerate = async () => {
    // Save progress before navigating
    await saveProgress();

    // Navigate to preview with store ID
    router.push(`/wizard/preview?store=${storeId}`);
  };

  return <WizardContainer onGenerate={handleGenerate} />;
}

function WizardLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Setting up your store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
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
    );
  }

  if (!storeId) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <WizardProvider storeId={storeId}>
      <WizardContent />
    </WizardProvider>
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
