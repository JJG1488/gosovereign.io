"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  ExternalLink,
  Check,
  Loader2,
  RefreshCw,
  Eye,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui";
import type { Store, Product, ProductImage } from "@/types/database";
import { getStore, getStoreProducts } from "@/lib/supabase";
import { formatPrice } from "@/components/wizard/WizardContext";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { UpgradeModal, PaymentStatusBadge } from "@/components/payment";

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("store");

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { isPaid, tier, isLoading: isPaymentLoading } = usePaymentStatus();

  useEffect(() => {
    async function loadData() {
      if (!storeId) {
        router.push("/wizard");
        return;
      }

      try {
        const [storeData, productsData] = await Promise.all([
          getStore(storeId),
          getStoreProducts(storeId),
        ]);

        if (!storeData) {
          setError("Store not found");
          return;
        }

        setStore(storeData);
        setProducts(productsData);
      } catch (err) {
        console.error("Error loading preview data:", err);
        setError("Failed to load store data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [storeId, router]);

  const handleDownload = async () => {
    if (!storeId) return;

    // Check payment status before allowing download
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

      // Download the zip file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store?.name?.toLowerCase().replace(/\s+/g, "-") || "store"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDownloaded(true);
    } catch (err) {
      console.error("Error downloading store:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    router.push("/wizard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-400 mb-4">{error || "Store not found"}</p>
        <Button onClick={() => router.push("/wizard")}>
          Back to Wizard
        </Button>
      </div>
    );
  }

  const branding = store.config?.branding || {};

  return (
    <div className="max-w-4xl mx-auto">
      {/* Payment status indicator */}
      <div className="flex justify-end mb-4">
        <PaymentStatusBadge isPaid={isPaid} tier={tier} isLoading={isPaymentLoading} />
      </div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6">
          {isDownloaded ? (
            <Check className="w-10 h-10 text-emerald-400" />
          ) : (
            <Eye className="w-10 h-10 text-emerald-400" />
          )}
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          {isDownloaded ? "Your Store is Ready!" : "Preview Your Store"}
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          {isDownloaded
            ? "Your store has been downloaded. Extract the zip file and follow the setup instructions to deploy."
            : "Review your store configuration below, then download your custom e-commerce store."}
        </p>
      </div>

      {/* Free trial watermark overlay */}
      {!isPaid && !isPaymentLoading && (
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-400 font-medium">Free Trial Preview</p>
              <p className="text-sm text-gray-400">
                You&apos;re viewing a preview of your store configuration. Upgrade to download your store.
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
                Tagline
              </h3>
              <p className="text-gray-300">{branding.tagline || "—"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Brand Color
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: branding.primaryColor || "#10b981" }}
                />
                <span className="text-gray-300 font-mono">
                  {branding.primaryColor || "#10b981"}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                Contact Email
              </h3>
              <p className="text-gray-300">{branding.contactEmail || "—"}</p>
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
                const firstImage = product.images?.[0] as ProductImage | undefined;
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
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {!isDownloaded ? (
          <>
            <Button
              variant="secondary"
              onClick={() => router.push(`/wizard?store=${storeId}`)}
              disabled={isGenerating}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Edit Configuration
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Store
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Again
            </Button>
            <Button onClick={handleStartOver}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Create Another Store
            </Button>
          </>
        )}
      </div>

      {/* Next steps */}
      {isDownloaded && (
        <div className="mt-12 p-6 bg-navy-800 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Next Steps</h3>
          <ol className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-medium">
                1
              </span>
              <div>
                <p className="font-medium text-white">Extract the zip file</p>
                <p className="text-sm text-gray-400">
                  Unzip the downloaded file to a folder on your computer.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-medium">
                2
              </span>
              <div>
                <p className="font-medium text-white">Install dependencies</p>
                <p className="text-sm text-gray-400">
                  Open a terminal in the folder and run{" "}
                  <code className="px-1 py-0.5 bg-navy-900 rounded text-emerald-400">
                    npm install
                  </code>
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-medium">
                3
              </span>
              <div>
                <p className="font-medium text-white">Start the development server</p>
                <p className="text-sm text-gray-400">
                  Run{" "}
                  <code className="px-1 py-0.5 bg-navy-900 rounded text-emerald-400">
                    npm run dev
                  </code>{" "}
                  to preview your store locally.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-medium">
                4
              </span>
              <div>
                <p className="font-medium text-white">Deploy to Vercel</p>
                <p className="text-sm text-gray-400">
                  Push to GitHub and connect to{" "}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    Vercel
                    <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  for free hosting.
                </p>
              </div>
            </li>
          </ol>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        context="download"
      />
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
