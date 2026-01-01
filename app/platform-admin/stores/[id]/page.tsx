import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Store,
  User,
  Package,
  CreditCard,
  Globe,
  Calendar,
  Rocket,
} from "lucide-react";
import { RedeployButton } from "@/components/platform-admin";

interface StoreDetail {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  template: string;
  config: Record<string, unknown>;
  status: string;
  payment_tier: string | null;
  subscription_status: string | null;
  subscription_ends_at: string | null;
  can_deploy: boolean;
  deployment_url: string | null;
  vercel_project_id: string | null;
  vercel_deployment_id: string | null;
  deployed_at: string | null;
  created_at: string;
  updated_at: string;
  stripe_account_id: string | null;
  users: {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
  } | null;
}

interface DeploymentLog {
  id: string;
  step: string;
  status: string;
  message: string | null;
  created_at: string;
}

async function getStoreDetail(id: string) {
  const supabase = createAdminClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select(
      `
      *,
      users:user_id (id, email, full_name, created_at)
    `
    )
    .eq("id", id)
    .single();

  if (error || !store) {
    return null;
  }

  // Get product count
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("store_id", id);

  // Get order count
  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("store_id", id);

  // Get deployment logs
  const { data: deploymentLogs } = await supabase
    .from("deployment_logs")
    .select("*")
    .eq("store_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    store: store as StoreDetail,
    productCount: productCount || 0,
    orderCount: orderCount || 0,
    deploymentLogs: (deploymentLogs || []) as DeploymentLog[],
  };
}

function TierBadge({ tier }: { tier: string | null }) {
  const colors: Record<string, string> = {
    starter: "bg-blue-500/20 text-blue-400",
    pro: "bg-purple-500/20 text-purple-400",
    hosted: "bg-emerald-500/20 text-emerald-400",
    none: "bg-gray-500/20 text-gray-400",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[tier || "none"] || colors.none}`}
    >
      {tier || "Free"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    deployed: "bg-emerald-500/20 text-emerald-400",
    deploying: "bg-yellow-500/20 text-yellow-400",
    pending: "bg-gray-500/20 text-gray-400",
    configuring: "bg-blue-500/20 text-blue-400",
    failed: "bg-red-500/20 text-red-400",
    error: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}
    >
      {status}
    </span>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  subtext?: string;
}) {
  return (
    <div className="bg-navy-800 border border-navy-700 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="text-white font-medium">{value}</div>
      {subtext && <div className="text-gray-500 text-sm mt-0.5">{subtext}</div>}
    </div>
  );
}

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getStoreDetail(id);

  if (!data) {
    notFound();
  }

  const { store, productCount, orderCount, deploymentLogs } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/platform-admin/stores"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to stores
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{store.name}</h1>
              <TierBadge tier={store.payment_tier} />
              <StatusBadge status={store.status} />
            </div>
            <p className="text-gray-400 mt-1">
              {store.subdomain}.gosovereign.io
            </p>
          </div>

          <div className="flex items-center gap-3">
            <RedeployButton storeId={store.id} storeName={store.name} />
            {store.deployment_url && (
              <a
                href={store.deployment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Store
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <InfoCard
          icon={Package}
          label="Products"
          value={productCount}
          subtext={store.payment_tier === "starter" ? "Max 10" : "Unlimited"}
        />
        <InfoCard icon={CreditCard} label="Orders" value={orderCount} />
        <InfoCard
          icon={Calendar}
          label="Created"
          value={new Date(store.created_at).toLocaleDateString()}
        />
        <InfoCard
          icon={Rocket}
          label="Deployed"
          value={
            store.deployed_at
              ? new Date(store.deployed_at).toLocaleDateString()
              : "Never"
          }
        />
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Owner Info */}
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Owner</h2>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-white">{store.users?.email || "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-white">
                {store.users?.full_name || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">User ID</dt>
              <dd className="text-white font-mono text-sm">
                {store.users?.id || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Account Created</dt>
              <dd className="text-white">
                {store.users?.created_at
                  ? new Date(store.users.created_at).toLocaleDateString()
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Store Config */}
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Configuration</h2>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Template</dt>
              <dd className="text-white capitalize">{store.template}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Stripe Account</dt>
              <dd className="text-white font-mono text-sm">
                {store.stripe_account_id || "Not connected"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Custom Domain</dt>
              <dd className="text-white">
                {store.custom_domain || "Not configured"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Can Deploy</dt>
              <dd className="text-white">
                {store.can_deploy ? "Yes" : "No (subscription issue)"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Subscription (if hosted) */}
        {store.payment_tier === "hosted" && (
          <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Subscription</h2>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-white capitalize">
                  {store.subscription_status || "Unknown"}
                </dd>
              </div>
              {store.subscription_ends_at && (
                <div>
                  <dt className="text-sm text-gray-500">Ends At</dt>
                  <dd className="text-white">
                    {new Date(store.subscription_ends_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Deployment Info */}
        <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Deployment</h2>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">URL</dt>
              <dd className="text-white">
                {store.deployment_url ? (
                  <a
                    href={store.deployment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline"
                  >
                    {store.deployment_url}
                  </a>
                ) : (
                  "Not deployed"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Vercel Project ID</dt>
              <dd className="text-white font-mono text-sm">
                {store.vercel_project_id || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Deployment ID</dt>
              <dd className="text-white font-mono text-sm">
                {store.vercel_deployment_id || "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Deployment Logs */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-navy-700">
          <h2 className="text-lg font-semibold text-white">Deployment Logs</h2>
        </div>
        {deploymentLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No deployment logs
          </div>
        ) : (
          <div className="divide-y divide-navy-700">
            {deploymentLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-4">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    log.status === "completed"
                      ? "bg-emerald-400"
                      : log.status === "failed"
                        ? "bg-red-400"
                        : "bg-yellow-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{log.step}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        log.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  {log.message && (
                    <p className="text-sm text-gray-400 mt-1">{log.message}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
