import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";

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

function getUserEmail(
  users: { email: string } | { email: string }[] | null
): string {
  if (!users) return "Unknown";
  if (Array.isArray(users)) return users[0]?.email || "Unknown";
  return users.email || "Unknown";
}

interface SearchParams {
  search?: string;
  status?: string;
  tier?: string;
  page?: string;
}

const ITEMS_PER_PAGE = 25;

async function getStores(params: SearchParams) {
  const supabase = createAdminClient();

  const page = parseInt(params.page || "1", 10);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  let query = supabase
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
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  // Apply filters
  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.tier) {
    if (params.tier === "none") {
      query = query.is("payment_tier", null);
    } else {
      query = query.eq("payment_tier", params.tier);
    }
  }

  if (params.search) {
    // Search in name, subdomain - Supabase doesn't support OR on related tables in a simple way
    // so we search on store fields only
    query = query.or(
      `name.ilike.%${params.search}%,subdomain.ilike.%${params.search}%`
    );
  }

  const { data, count } = await query;

  return {
    stores: (data || []) as StoreWithOwner[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
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

function SearchForm({
  currentSearch,
  currentStatus,
  currentTier,
}: {
  currentSearch?: string;
  currentStatus?: string;
  currentTier?: string;
}) {
  return (
    <form method="GET" className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search by name or subdomain..."
          className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <select
        name="status"
        defaultValue={currentStatus || ""}
        className="px-4 py-2 bg-navy-800 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
      >
        <option value="">All Statuses</option>
        <option value="deployed">Deployed</option>
        <option value="deploying">Deploying</option>
        <option value="pending">Pending</option>
        <option value="configuring">Configuring</option>
        <option value="failed">Failed</option>
      </select>

      <select
        name="tier"
        defaultValue={currentTier || ""}
        className="px-4 py-2 bg-navy-800 border border-navy-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
      >
        <option value="">All Tiers</option>
        <option value="starter">Starter</option>
        <option value="pro">Pro</option>
        <option value="hosted">Hosted</option>
        <option value="none">Free</option>
      </select>

      <button
        type="submit"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
      >
        Search
      </button>

      {(currentSearch || currentStatus || currentTier) && (
        <Link
          href="/platform-admin/stores"
          className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-gray-300 rounded-lg transition-colors"
        >
          Clear
        </Link>
      )}
    </form>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: SearchParams;
}) {
  if (totalPages <= 1) return null;

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.status) params.set("status", searchParams.status);
    if (searchParams.tier) params.set("tier", searchParams.tier);
    params.set("page", String(newPage));
    return `/platform-admin/stores?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-6 border-t border-navy-700">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={buildUrl(page - 1)}
            className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            Previous
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={buildUrl(page + 1)}
            className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function StoresListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { stores, total, page, totalPages } = await getStores(params);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">All Stores</h1>
        <p className="text-gray-400 mt-1">{total} stores total</p>
      </div>

      <SearchForm
        currentSearch={params.search}
        currentStatus={params.status}
        currentTier={params.tier}
      />

      <div className="bg-navy-800 border border-navy-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Store
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Owner
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Tier
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Created
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700">
            {stores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No stores found
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id} className="hover:bg-navy-700/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/platform-admin/stores/${store.id}`}
                      className="font-medium text-white hover:text-emerald-400"
                    >
                      {store.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {store.subdomain}.gosovereign.io
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {getUserEmail(store.users)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={store.status} />
                  </td>
                  <td className="px-4 py-3">
                    <TierBadge tier={store.payment_tier} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(store.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/platform-admin/stores/${store.id}`}
                        className="text-sm text-emerald-400 hover:text-emerald-300"
                      >
                        View
                      </Link>
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination page={page} totalPages={totalPages} searchParams={params} />
      </div>
    </div>
  );
}
