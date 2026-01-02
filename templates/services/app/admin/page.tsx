import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";
import Link from "next/link";
import { Briefcase, MessageSquare, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) {
    return { services: 0, inquiries: 0, newInquiries: 0 };
  }

  // Get service count
  const { count: serviceCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId);

  // Get total inquiries
  const { count: inquiryCount } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId);

  // Get new inquiries (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const { count: newInquiryCount } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .eq("store_id", storeId)
    .eq("status", "new")
    .gte("created_at", weekAgo.toISOString());

  return {
    services: serviceCount || 0,
    inquiries: inquiryCount || 0,
    newInquiries: newInquiryCount || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const quickLinks = [
    {
      href: "/admin/services",
      label: "Services",
      description: "Manage your service offerings",
      icon: Briefcase,
      stat: stats.services + " services",
    },
    {
      href: "/admin/inquiries",
      label: "Inquiries",
      description: "View and respond to customer inquiries",
      icon: MessageSquare,
      stat: stats.newInquiries > 0 ? stats.newInquiries + " new" : stats.inquiries + " total",
      highlight: stats.newInquiries > 0,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      description: "Configure your site settings",
      icon: Settings,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Services</p>
          <p className="text-3xl font-bold text-gray-900">{stats.services}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Inquiries</p>
          <p className="text-3xl font-bold text-gray-900">{stats.inquiries}</p>
        </div>
        <div className={"bg-white rounded-xl p-6 shadow-sm border " + (
          stats.newInquiries > 0 ? "border-brand bg-yellow-50" : "border-gray-100"
        )}>
          <p className="text-gray-500 text-sm">New This Week</p>
          <p className="text-3xl font-bold text-gray-900">{stats.newInquiries}</p>
        </div>
      </div>

      {/* Quick Links */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={"bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow " + (
              link.highlight ? "border-brand" : "border-gray-100"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={"p-3 rounded-lg " + (
                link.highlight ? "bg-yellow-100" : "bg-gray-100"
              )}>
                <link.icon className={"w-6 h-6 " + (
                  link.highlight ? "text-yellow-600" : "text-gray-600"
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{link.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                {link.stat && (
                  <p className={"text-sm font-medium mt-2 " + (
                    link.highlight ? "text-yellow-600" : "text-gray-700"
                  )}>
                    {link.stat}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
