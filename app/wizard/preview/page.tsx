"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  ExternalLink,
  Check,
  Loader2,
  RefreshCw,
  Eye,
  Lock,
  Rocket,
  AlertCircle,
  PartyPopper,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { Store, Product, ProductImage, PaymentTier } from "@/types/database";
import { getStore, getStoreProducts, getUserStores, getCurrentUser } from "@/lib/supabase";
import { formatPrice } from "@/components/wizard/WizardContext";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useSubscriptionStatus, getSubscriptionWarningMessage } from "@/hooks/useSubscriptionStatus";
import { UpgradeModal } from "@/components/payment";
import { AppHeader } from "@/components/layout";
import type { StoreOption } from "@/components/layout";
import { getMaxStores } from "@/lib/bogo";

type DeploymentState =
  | "idle"
  | "deploying"
  | "polling"
  | "success"
  | "error";

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("store");

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deployState, setDeployState] = useState<DeploymentState>("idle");
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userStores, setUserStores] = useState<StoreOption[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const { isPaid, tier, isLoading: isPaymentLoading } = usePaymentStatus();
  const { subscriptionStatus, canDeploy, subscriptionEndsAt } = useSubscriptionStatus(storeId);
  const subscriptionWarning = getSubscriptionWarningMessage(subscriptionStatus, subscriptionEndsAt);

  useEffect(() => {
    async function loadData() {
      if (!storeId) {
        router.push("/wizard");
        return;
      }

      try {
        // Load current user for header
        const user = await getCurrentUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }
        setUserEmail(user.email || "");

        // Load store data and user stores in parallel
        const [storeData, productsData, allStores] = await Promise.all([
          getStore(storeId),
          getStoreProducts(storeId),
          getUserStores(user.id),
        ]);

        if (!storeData) {
          setError("Store not found");
          return;
        }

        setStore(storeData);
        setProducts(productsData);

        // Map stores for header
        setUserStores(allStores.map(s => ({
          id: s.id,
          name: (s.config as { branding?: { storeName?: string } })?.branding?.storeName || s.name || "Unnamed Store",
          subdomain: s.subdomain || "unknown",
          payment_tier: s.payment_tier as PaymentTier | null,
          template: s.template || "goods",
          status: s.status || "draft",
          deployment_url: s.deployment_url || null,
        })));

        // Check if store is already deployed
        if (storeData.status === "deployed" && storeData.deployment_url) {
          setDeployState("success");
          setStoreUrl(storeData.deployment_url);
        } else if (storeData.status === "deploying") {
          setDeployState("polling");
        }
      } catch (err) {
        console.error("Error loading preview data:", err);
        setError("Failed to load store data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [storeId, router]);

  // Poll deployment status
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/deploy/status?store_id=${storeId}`);
      const data = await res.json();

      if (data.status === "READY") {
        setDeployState("success");
        setStoreUrl(data.url);
        return true; // Stop polling
      } else if (data.status === "ERROR" || data.status === "CANCELED") {
        setDeployState("error");
        setError(data.error || "Deployment failed");
        return true; // Stop polling
      }
      return false; // Continue polling
    } catch {
      return false; // Continue polling on network error
    }
  }, [storeId]);

  useEffect(() => {
    if (deployState !== "polling") return;

    let isMounted = true;
    const poll = async () => {
      const done = await pollStatus();
      if (!done && isMounted) {
        setTimeout(poll, 3000); // Poll every 3 seconds
      }
    };

    poll();

    return () => {
      isMounted = false;
    };
  }, [deployState, pollStatus]);

  const handleDeploy = async () => {
    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }

    setDeployState("deploying");
    setError(null);

    try {
      const res = await fetch("/api/deploy/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: storeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      // If already deployed, show success
      if (data.message === "Store already deployed") {
        setDeployState("success");
        setStoreUrl(data.storeUrl || data.deploymentUrl);
        return;
      }

      // Start polling for deployment status
      setStoreUrl(data.storeUrl);
      setDeployState("polling");
    } catch (err) {
      console.error("Deploy error:", err);
      setDeployState("error");
      setError(err instanceof Error ? err.message : "Deployment failed");
    }
  };

  const handleDownload = async () => {
    if (!storeId) return;

    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate store");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store?.name?.toLowerCase().replace(/\s+/g, "-") || "store"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading store:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  // Store switching handler
  const handleSwitchStore = (newStoreId: string) => {
    if (newStoreId !== storeId) {
      router.push(`/wizard?store=${newStoreId}`);
    }
  };

  // Header component
  const headerJSX = (
    <AppHeader
      stores={userStores}
      currentStoreId={storeId}
      onSwitchStore={handleSwitchStore}
      showStoreSwitcher={userStores.length > 0}
      isPaid={isPaid}
      tier={tier}
      isPaymentLoading={isPaymentLoading}
      userEmail={userEmail}
    />
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900">
        {headerJSX}
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-navy-900">
        {headerJSX}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-red-400 mb-4">{error || "Store not found"}</p>
          <Button onClick={() => router.push("/wizard")}>Back to Wizard</Button>
        </div>
      </div>
    );
  }

  const branding = store.config?.branding || {};
  const isDeploying = deployState === "deploying" || deployState === "polling";
  const isDeployed = deployState === "success";

  return (
    <div className="min-h-screen bg-navy-900">
      {headerJSX}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Subscription warning banner */}
      {subscriptionWarning && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-200">{subscriptionWarning}</p>
              {!canDeploy && (
                <p className="text-sm text-amber-400/80 mt-1">
                  Deployments are currently disabled.
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/billing")}
              className="flex-shrink-0 border-amber-500/50 text-amber-200 hover:bg-amber-500/10"
            >
              Manage Billing
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6">
          {isDeployed ? (
            <PartyPopper className="w-10 h-10 text-emerald-400" />
          ) : isDeploying ? (
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          ) : (
            <Eye className="w-10 h-10 text-emerald-400" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          {isDeployed
            ? "Your Store is Live!"
            : isDeploying
              ? "Deploying Your Store..."
              : "Preview Your Store"}
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          {isDeployed
            ? "Your store is now live and ready to accept orders."
            : isDeploying
              ? "We're setting up your store. This usually takes about 60 seconds."
              : "Review your store configuration, then deploy with one click."}
        </p>
      </div>

      {/* Success banner */}
      {isDeployed && storeUrl && (
        <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-white">
                Your store is live at:
              </h3>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline text-lg inline-flex items-center gap-2 mt-1"
              >
                {storeUrl.replace("https://", "")}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <Button
              onClick={() => window.open(storeUrl, "_blank")}
              className="bg-emerald-500 hover:bg-emerald-600 flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Store
            </Button>
          </div>
        </div>
      )}

      {/* Deploying status */}
      {isDeploying && (
        <div className="mb-8 p-6 bg-navy-800 rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <div>
              <h3 className="font-semibold text-white">Deploying your store</h3>
              <p className="text-sm text-gray-400">
                Creating project and configuring environment...
              </p>
            </div>
          </div>
          {storeUrl && (
            <p className="text-sm text-gray-400">
              Your store will be available at:{" "}
              <span className="text-emerald-400">{storeUrl}</span>
            </p>
          )}
        </div>
      )}

      {/* Free trial watermark */}
      {!isPaid && !isPaymentLoading && !isDeploying && !isDeployed && (
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-400 font-medium">Preview Mode</p>
              <p className="text-sm text-gray-400">
                You&apos;re viewing a preview. Purchase to deploy your store.
              </p>
            </div>
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="ml-auto bg-amber-500 hover:bg-amber-600 text-navy-900"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Store Preview Card */}
      <div className="bg-navy-800 rounded-2xl p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Store Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Store Name
              </h3>
              <p className="text-2xl font-bold text-white">{store.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Store URL
              </h3>
              <p className="text-gray-300 font-mono text-sm">
                {store.subdomain}.gosovereign.io
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Brand Color
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{
                    backgroundColor: branding.primaryColor || "#10b981",
                  }}
                />
                <span className="text-gray-300 font-mono">
                  {branding.primaryColor || "#10b981"}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Stripe Connected
              </h3>
              <p className="text-gray-300">
                {store.stripe_account_id ? (
                  <span className="text-emerald-400">Connected</span>
                ) : (
                  <span className="text-amber-400">Not connected</span>
                )}
              </p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              Products ({products.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {products.map((product) => {
                const firstImage = product.images?.[0] as
                  | ProductImage
                  | undefined;
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-navy-900/50 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-lg bg-navy-700 flex-shrink-0 overflow-hidden">
                      {firstImage?.url ? (
                        <img
                          src={firstImage.url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-emerald-400">
                        {formatPrice(Math.round(product.price * 100))}
                      </p>
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && (
                <p className="text-gray-500 text-sm">No products added</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setError(null);
              setDeployState("idle");
            }}
            className="ml-auto"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Actions */}
      {!isDeployed && !isDeploying && (
        <div className="space-y-6">
          {/* Edit button */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={() => router.push(`/wizard?store=${storeId}`)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Edit Configuration
            </Button>
          </div>

          {/* One-click deploy */}
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || isGenerating}
              className="bg-emerald-500 hover:bg-emerald-600 text-lg px-8 py-4 h-auto"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Deploy Now
            </Button>
            <p className="text-gray-400 text-sm">
              One click. Your store goes live at{" "}
              <span className="text-emerald-400 font-mono">
                {store.subdomain}.gosovereign.io
              </span>
            </p>
          </div>

          {/* Download option */}
          <div className="pt-6 border-t border-navy-700">
            <p className="text-center text-gray-500 text-sm mb-3">
              Prefer to self-host?
            </p>
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={handleDownload}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download ZIP
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success actions */}
      {isDeployed && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => window.open(storeUrl!, "_blank")}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Store
          </Button>
          <Button variant="secondary" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Source Code
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/wizard")}
            disabled={userStores.length >= getMaxStores()}
            title={userStores.length >= getMaxStores() ? "Store limit reached" : undefined}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Create Another Store
            <span className="ml-2 text-xs opacity-70">
              ({userStores.length}/{getMaxStores()})
            </span>
          </Button>
        </div>
      )}

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          context="download"
        />
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
