"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle,
  Circle,
  ExternalLink,
  Loader2,
  AlertCircle,
  Rocket,
  Github,
} from "lucide-react";

// Vercel logo as component
function VercelLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 76 65" fill="currentColor">
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

interface ConnectionStatus {
  github: boolean;
  githubUsername?: string;
  vercel: boolean;
}

interface StoreStatus {
  id: string;
  name: string;
  status: string;
  deploymentUrl?: string;
  githubRepo?: string;
  stripeAccountId?: string;
}

type DeploymentStage = "idle" | "deploying" | "building" | "ready" | "error";

function DeployPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<ConnectionStatus>({
    github: false,
    vercel: false,
  });
  const [store, setStore] = useState<StoreStatus | null>(null);
  const [deploymentStage, setDeploymentStage] = useState<DeploymentStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);

  const loadConnectionStatus = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Get user's connection status
    const { data: userData } = await supabase
      .from("users")
      .select("github_access_token, github_username, vercel_access_token")
      .eq("id", user.id)
      .single();

    // Get store status
    const { data: storeData } = await supabase
      .from("stores")
      .select("id, name, status, deployment_url, github_repo, stripe_account_id")
      .eq("user_id", user.id)
      .single();

    setConnections({
      github: !!userData?.github_access_token,
      githubUsername: userData?.github_username ?? undefined,
      vercel: !!userData?.vercel_access_token,
    });

    setStore(
      storeData
        ? {
            id: storeData.id,
            name: storeData.name,
            status: storeData.status,
            deploymentUrl: storeData.deployment_url ?? undefined,
            githubRepo: storeData.github_repo ?? undefined,
            stripeAccountId: storeData.stripe_account_id ?? undefined,
          }
        : null
    );

    // If already deployed, show success
    if (storeData?.status === "deployed" && storeData.deployment_url) {
      setDeploymentStage("ready");
      setDeploymentUrl(storeData.deployment_url);
    }

    setLoading(false);
  }, [supabase, router]);

  // Check for OAuth callback results
  useEffect(() => {
    const githubConnected = searchParams.get("github") === "connected";
    const vercelConnected = searchParams.get("vercel") === "connected";
    const errorParam = searchParams.get("error");
    const errorMessage = searchParams.get("message");

    if (errorParam) {
      setError(errorMessage || `Connection failed: ${errorParam}`);
    }

    // Reload connection status after OAuth
    if (githubConnected || vercelConnected) {
      loadConnectionStatus();
    }
  }, [searchParams, loadConnectionStatus]);

  // Load initial status
  useEffect(() => {
    loadConnectionStatus();
  }, [loadConnectionStatus]);

  async function pollDeploymentStatus() {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const response = await fetch("/api/deploy/status");
        const data = await response.json();

        if (data.status === "READY") {
          setDeploymentStage("ready");
          setDeploymentUrl(data.url);
          loadConnectionStatus(); // Refresh store data
          return;
        }

        if (data.status === "ERROR" || data.status === "CANCELED") {
          setError("Deployment failed. Please try again.");
          setDeploymentStage("error");
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setError(
            "Deployment is taking longer than expected. Check Vercel dashboard."
          );
          setDeploymentStage("error");
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setError("Failed to check deployment status");
          setDeploymentStage("error");
        }
      }
    };

    poll();
  }

  async function handleDeploy() {
    setError(null);
    setDeploymentStage("deploying");

    try {
      const response = await fetch("/api/deploy/execute", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      // Start polling for deployment status
      setDeploymentStage("building");
      pollDeploymentStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
      setDeploymentStage("error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Store Found</h1>
          <p className="text-gray-400 mb-6">
            You need to create a store first before deploying.
          </p>
          <a
            href="/wizard"
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-navy-900 font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
          >
            Create Your Store
          </a>
        </div>
      </div>
    );
  }

  // Already deployed - show success
  if (deploymentStage === "ready" && deploymentUrl) {
    return (
      <div className="min-h-screen bg-navy-900 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Your Store is Live!
            </h1>

            <p className="text-lg text-gray-400 mb-8">
              Your e-commerce store has been deployed and is ready for customers.
            </p>

            <div className="bg-navy-800 rounded-xl p-6 mb-8 border border-navy-700">
              <p className="text-sm text-gray-400 mb-2">Your store URL</p>
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-mono text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2"
              >
                {deploymentUrl.replace("https://", "")}
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-navy-900 font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Visit Your Store
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>

            {store?.githubRepo && (
              <div className="mt-8 pt-8 border-t border-navy-700">
                <h2 className="font-semibold text-white mb-4">What You Own</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-left">
                  <a
                    href={`https://github.com/${store.githubRepo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-navy-800 rounded-lg hover:bg-navy-700 transition-colors border border-navy-700"
                  >
                    <Github className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">GitHub Repository</p>
                      <p className="text-sm text-gray-400">{store.githubRepo}</p>
                    </div>
                  </a>

                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-navy-800 rounded-lg hover:bg-navy-700 transition-colors border border-navy-700"
                  >
                    <VercelLogo className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">Vercel Project</p>
                      <p className="text-sm text-gray-400">
                        {store.githubRepo?.split("/")[1]}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {!store?.stripeAccountId && (
              <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 font-medium">
                  Next step: Connect Stripe to accept payments
                </p>
                <a
                  href="/wizard?step=8"
                  className="inline-flex items-center mt-3 text-sm text-yellow-400 hover:text-yellow-300"
                >
                  Connect Stripe →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Deployment in progress
  if (deploymentStage === "deploying" || deploymentStage === "building") {
    return (
      <div className="min-h-screen bg-navy-900 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Deploying Your Store
            </h1>

            <p className="text-lg text-gray-400 mb-8">
              This usually takes 60-90 seconds. Please don&apos;t close this page.
            </p>

            <div className="space-y-4 text-left max-w-md mx-auto">
              <DeploymentStep
                label="Creating GitHub repository"
                status={deploymentStage === "deploying" ? "active" : "complete"}
              />
              <DeploymentStep
                label="Setting up Vercel project"
                status={deploymentStage === "deploying" ? "pending" : "active"}
              />
              <DeploymentStep
                label="Building your store"
                status={deploymentStage === "building" ? "active" : "pending"}
              />
              <DeploymentStep label="Going live" status="pending" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main deploy page - show connection steps
  return (
    <div className="min-h-screen bg-navy-900 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            Deploy Your Store
          </h1>
          <p className="text-lg text-gray-400">
            Connect your accounts to deploy your store. You&apos;ll own everything
            — the code, the hosting, the domain.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">Something went wrong</p>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-navy-800 rounded-xl p-6 mb-8 border border-navy-700">
          <p className="text-sm text-gray-400">
            <strong className="text-white">What you&apos;ll need:</strong> Free
            GitHub and Vercel accounts. If you don&apos;t have them, you&apos;ll
            create them during the next steps (takes ~3 minutes).
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: GitHub */}
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    connections.github ? "bg-emerald-500/20" : "bg-navy-700"
                  }`}
                >
                  {connections.github ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Github className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">Connect GitHub</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {connections.github
                      ? `Connected as @${connections.githubUsername}`
                      : "We'll create a repository to store your store's code"}
                  </p>
                </div>
              </div>

              {!connections.github && (
                <a
                  href="/api/deploy/github"
                  className="inline-flex items-center px-4 py-2 bg-emerald-500 text-navy-900 font-semibold rounded-lg hover:bg-emerald-400 transition-colors text-sm"
                >
                  Connect
                </a>
              )}
            </div>
          </div>

          {/* Step 2: Vercel */}
          <div
            className={`bg-navy-800 border border-navy-700 rounded-xl p-6 ${
              !connections.github ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    connections.vercel ? "bg-emerald-500/20" : "bg-navy-700"
                  }`}
                >
                  {connections.vercel ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <VercelLogo className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">Connect Vercel</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {connections.vercel
                      ? "Connected to your Vercel account"
                      : "We'll deploy your store to your Vercel account"}
                  </p>
                </div>
              </div>

              {connections.github && !connections.vercel && (
                <a
                  href="/api/deploy/vercel"
                  className="inline-flex items-center px-4 py-2 bg-emerald-500 text-navy-900 font-semibold rounded-lg hover:bg-emerald-400 transition-colors text-sm"
                >
                  Connect
                </a>
              )}
            </div>
          </div>

          {/* Step 3: Deploy */}
          <div
            className={`bg-navy-800 border border-navy-700 rounded-xl p-6 ${
              !connections.github || !connections.vercel
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Deploy Your Store</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Create your repository and deploy to Vercel
                  </p>
                </div>
              </div>

              {connections.github && connections.vercel && (
                <button
                  onClick={handleDeploy}
                  className="inline-flex items-center px-4 py-2 bg-emerald-500 text-navy-900 font-semibold rounded-lg hover:bg-emerald-400 transition-colors text-sm"
                >
                  Deploy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeploymentStep({
  label,
  status,
}: {
  label: string;
  status: "pending" | "active" | "complete";
}) {
  return (
    <div className="flex items-center gap-4">
      {status === "complete" && (
        <CheckCircle className="w-6 h-6 text-emerald-400" />
      )}
      {status === "active" && (
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      )}
      {status === "pending" && <Circle className="w-6 h-6 text-gray-600" />}
      <span className={status === "pending" ? "text-gray-500" : "text-white"}>
        {label}
      </span>
    </div>
  );
}

export default function DeployPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      }
    >
      <DeployPageContent />
    </Suspense>
  );
}
