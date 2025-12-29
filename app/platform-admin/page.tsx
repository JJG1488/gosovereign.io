import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Store,
  Rocket,
  DollarSign,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";

interface StoreWithOwner {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  payment_tier: string | null;
  deployment_url: string | null;
  deployed_at: string | null;
  created_at: string;
  users: { email: string } | { email: string }[] | null;
}

async function getDashboardStats() {
  const supabase = createAdminClient();

  // Get store counts by status
  const { data: statusCounts } = await supabase
    .from("stores")
    .select("status");

  const statusBreakdown = (statusCounts || []).reduce(
    (acc, store) => {
      acc[store.status] = (acc[store.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get store counts by tier (only deployed stores)
  const { data: tierCounts } = await supabase
    .from("stores")
    .select("payment_tier")
    .eq("status", "deployed");

  const tierBreakdown = (tierCounts || []).reduce(
    (acc, store) => {
      const tier = store.payment_tier || "none";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get recent deployments (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentStores } = await supabase
    .from("stores")
    .select(
      `
      id,
      name,
      subdomain,
      status,
      payment_tier,
      deployment_url,
      deployed_at,
      created_at,
      users:user_id (email)
    `
    )
    .gte("deployed_at", sevenDaysAgo.toISOString())
    .order("deployed_at", { ascending: false })
    .limit(10);

  // Calculate MRR from hosted tier
  const { count: hostedCount } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .eq("payment_tier", "hosted")
    .eq("subscription_status", "active");

  const mrr = (hostedCount || 0) * 19;

  // Calculate one-time revenue from purchases
  const { data: purchases } = await supabase
    .from("purchases")
    .select("plan, amount")
    .eq("status", "completed");

  const oneTimeRevenue =
    (purchases || []).reduce((sum, p) => {
      if (p.plan === "starter" || p.plan === "pro") {
        return sum + (p.amount || 0);
      }
      return sum;
    }, 0) / 100; // Convert cents to dollars

  return {
    totalStores: statusCounts?.length || 0,
    deployedStores: statusBreakdown["deployed"] || 0,
    statusBreakdown,
    tierBreakdown,
    recentStores: (recentStores || []) as StoreWithOwner[],
    hostedCount: hostedCount || 0,
    mrr,
    oneTimeRevenue,
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtext?: string;
}) {
  return (
    <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-emerald-400" />
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
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

export default async function PlatformAdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Overview of all GoSovereign stores and revenue
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Stores"
          value={stats.totalStores}
          icon={Store}
          subtext={`${stats.deployedStores} deployed`}
        />
        <StatCard
          label="Deployed"
          value={stats.deployedStores}
          icon={Rocket}
          subtext={`${stats.statusBreakdown["deploying"] || 0} in progress`}
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${stats.mrr}`}
          icon={TrendingUp}
          subtext={`${stats.hostedCount} hosted subscriptions`}
        />
        <StatCard
          label="One-Time Revenue"
          value={`$${stats.oneTimeRevenue.toLocaleString()}`}
          icon={DollarSign}
          subtext="Starter + Pro purchases"
        />
      </div>

      {/* Tier Breakdown */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Deployed Stores by Tier
        </h2>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <TierBadge tier="starter" />
            <span className="text-white font-medium">
              {stats.tierBreakdown["starter"] || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TierBadge tier="pro" />
            <span className="text-white font-medium">
              {stats.tierBreakdown["pro"] || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TierBadge tier="hosted" />
            <span className="text-white font-medium">
              {stats.tierBreakdown["hosted"] || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TierBadge tier="none" />
            <span className="text-white font-medium">
              {stats.tierBreakdown["none"] || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Deployments */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">
              Recent Deployments
            </h2>
          </div>
          <Link
            href="/platform-admin/stores"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            View all stores &rarr;
          </Link>
        </div>

        {stats.recentStores.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No deployments in the last 7 days
          </div>
        ) : (
          <div className="divide-y divide-navy-700">
            {stats.recentStores.map((store) => (
              <div
                key={store.id}
                className="p-4 flex items-center justify-between hover:bg-navy-700/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/platform-admin/stores/${store.id}`}
                      className="font-medium text-white hover:text-emerald-400"
                    >
                      {store.name}
                    </Link>
                    <TierBadge tier={store.payment_tier} />
                    <StatusBadge status={store.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {Array.isArray(store.users)
                      ? store.users[0]?.email || "Unknown"
                      : store.users?.email || "Unknown"}{" "}
                    &middot; {store.subdomain}.gosovereign.io
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {store.deployed_at
                      ? new Date(store.deployed_at).toLocaleDateString()
                      : "-"}
                  </span>
                  {store.deployment_url && (
                    <a
                      href={store.deployment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-emerald-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
