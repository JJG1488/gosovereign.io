"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUserStores } from "@/lib/supabase";

/**
 * Dashboard page - redirects to the wizard with the user's first store.
 * This serves as the authenticated "home" page and can be expanded later.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function redirectToWizard() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Get user's stores
        const stores = await getUserStores(user.id);

        if (stores.length > 0) {
          // Redirect to wizard with most recent store
          const mostRecentStore = stores[stores.length - 1];
          router.replace(`/wizard?store=${mostRecentStore.id}`);
        } else {
          // No stores yet, redirect to wizard to create one
          router.replace("/wizard");
        }
      } catch (err) {
        console.error("Dashboard redirect error:", err);
        setError("Something went wrong. Please try again.");
      }
    }

    redirectToWizard();
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-500 text-navy-900 rounded-lg font-semibold hover:bg-emerald-400"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading your dashboard...</p>
      </div>
    </main>
  );
}
