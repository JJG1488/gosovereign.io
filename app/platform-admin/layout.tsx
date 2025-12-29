import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Store, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Admin | GoSovereign",
  description: "GoSovereign platform administration dashboard",
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/platform-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/platform-admin/stores", label: "Stores", icon: Store },
  { href: "/platform-admin/revenue", label: "Revenue", icon: DollarSign },
];

export default function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-navy-700 bg-navy-800/50 flex flex-col">
        <div className="p-4 border-b border-navy-700">
          <Link href="/platform-admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">GoSovereign</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-navy-700 hover:text-white transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-navy-700">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            &larr; Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
