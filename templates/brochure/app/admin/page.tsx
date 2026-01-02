import Link from "next/link";
import { Image, Settings, Mail, ExternalLink } from "lucide-react";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return { portfolioCount: 0, messageCount: 0 };
  }

  const [portfolioRes, messagesRes] = await Promise.all([
    supabase
      .from("portfolio_items")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId),
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("status", "new"),
  ]);

  return {
    portfolioCount: portfolioRes.count || 0,
    messageCount: messagesRes.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const quickActions = [
    {
      href: "/admin/portfolio",
      label: "Manage Portfolio",
      description: `${stats.portfolioCount} items`,
      icon: Image,
      color: "bg-blue-500",
    },
    {
      href: "/admin/messages",
      label: "Messages",
      description: stats.messageCount > 0 ? `${stats.messageCount} new` : "No new messages",
      icon: Mail,
      color: "bg-emerald-500",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      description: "Site configuration",
      icon: Settings,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your brochure site</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`${action.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.label}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-brand hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View Live Site
          </Link>
          <Link
            href="/#portfolio"
            target="_blank"
            className="flex items-center gap-2 text-brand hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View Portfolio Section
          </Link>
          <Link
            href="/#contact"
            target="_blank"
            className="flex items-center gap-2 text-brand hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View Contact Form
          </Link>
        </div>
      </div>
    </div>
  );
}
