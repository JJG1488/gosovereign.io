import { createAdminClient } from "@/lib/supabase/server";
import { DollarSign, TrendingUp, CreditCard, Calendar } from "lucide-react";

interface Purchase {
  id: string;
  email: string;
  plan: string;
  amount: number;
  status: string;
  created_at: string;
}

async function getRevenueData() {
  const supabase = createAdminClient();

  // Get all completed purchases
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const allPurchases = (purchases || []) as Purchase[];

  // Calculate revenue by tier
  const starterPurchases = allPurchases.filter((p) => p.plan === "starter");
  const proPurchases = allPurchases.filter((p) => p.plan === "pro");
  const hostedPurchases = allPurchases.filter((p) => p.plan === "hosted");

  const starterRevenue = starterPurchases.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );
  const proRevenue = proPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const hostedOneTime = hostedPurchases.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  // Get active hosted subscriptions for MRR
  const { count: activeHosted } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .eq("payment_tier", "hosted")
    .eq("subscription_status", "active");

  const mrr = (activeHosted || 0) * 19;

  // Calculate revenue by month (last 6 months)
  const now = new Date();
  const monthlyRevenue: { month: string; revenue: number; count: number }[] =
    [];

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthLabel = monthStart.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    const monthPurchases = allPurchases.filter((p) => {
      const date = new Date(p.created_at);
      return date >= monthStart && date <= monthEnd;
    });

    monthlyRevenue.push({
      month: monthLabel,
      revenue: monthPurchases.reduce((sum, p) => sum + (p.amount || 0), 0),
      count: monthPurchases.length,
    });
  }

  // Recent purchases (last 20)
  const recentPurchases = allPurchases.slice(0, 20);

  return {
    totalRevenue: starterRevenue + proRevenue + hostedOneTime,
    starterRevenue,
    starterCount: starterPurchases.length,
    proRevenue,
    proCount: proPurchases.length,
    hostedOneTime,
    hostedCount: hostedPurchases.length,
    mrr,
    activeHosted: activeHosted || 0,
    monthlyRevenue,
    recentPurchases,
  };
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color = "emerald",
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "emerald" | "blue" | "purple" | "yellow";
}) {
  const colorClasses = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    yellow: "text-yellow-400",
  };

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    starter: "bg-blue-500/20 text-blue-400",
    pro: "bg-purple-500/20 text-purple-400",
    hosted: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[tier] || colors.starter}`}
    >
      {tier}
    </span>
  );
}

export default async function RevenuePage() {
  const data = await getRevenueData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Revenue</h1>
        <p className="text-gray-400 mt-1">
          Platform revenue breakdown and purchase history
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          subtext="All-time one-time purchases"
          icon={DollarSign}
        />
        <StatCard
          label="Monthly Recurring"
          value={`$${data.mrr}`}
          subtext={`${data.activeHosted} active subscriptions`}
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          label="Total Purchases"
          value={String(
            data.starterCount + data.proCount + data.hostedCount
          )}
          subtext="Completed transactions"
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          label="ARR (Projected)"
          value={`$${data.mrr * 12}`}
          subtext="Annual recurring revenue"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Tier Breakdown */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Revenue by Tier
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-navy-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TierBadge tier="starter" />
              <span className="text-sm text-gray-500">
                {data.starterCount} sales
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.starterRevenue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">$149 one-time</p>
          </div>

          <div className="border border-navy-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TierBadge tier="pro" />
              <span className="text-sm text-gray-500">
                {data.proCount} sales
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.proRevenue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">$299 one-time</p>
          </div>

          <div className="border border-navy-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TierBadge tier="hosted" />
              <span className="text-sm text-gray-500">
                {data.hostedCount} sales
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.hostedOneTime)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              $149 + $19/mo ({data.activeHosted} active)
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Monthly Revenue (Last 6 Months)
        </h2>
        <div className="grid grid-cols-6 gap-2">
          {data.monthlyRevenue.map((month) => {
            const maxRevenue = Math.max(
              ...data.monthlyRevenue.map((m) => m.revenue),
              1
            );
            const height = Math.max((month.revenue / maxRevenue) * 100, 4);

            return (
              <div key={month.month} className="text-center">
                <div className="h-32 flex items-end justify-center mb-2">
                  <div
                    className="w-full max-w-[40px] bg-emerald-500/50 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{month.month}</p>
                <p className="text-sm font-medium text-white">
                  {formatCurrency(month.revenue)}
                </p>
                <p className="text-xs text-gray-500">
                  {month.count} sale{month.count !== 1 ? "s" : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="bg-navy-800 border border-navy-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-navy-700">
          <h2 className="text-lg font-semibold text-white">Recent Purchases</h2>
        </div>
        {data.recentPurchases.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No purchases yet</div>
        ) : (
          <div className="divide-y divide-navy-700">
            {data.recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="p-4 flex items-center justify-between hover:bg-navy-700/30"
              >
                <div>
                  <p className="text-white font-medium">{purchase.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TierBadge tier={purchase.plan} />
                    <span className="text-sm text-gray-500">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-emerald-400">
                  {formatCurrency(purchase.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
