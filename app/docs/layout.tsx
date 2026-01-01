"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book,
  Rocket,
  Package,
  ShoppingCart,
  Tag,
  Palette,
  BarChart3,
  Globe,
  Download,
  Users,
  Settings,
  CreditCard,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Introduction", href: "/docs", icon: <Book className="w-4 h-4" /> },
      { title: "Getting Started", href: "/docs/getting-started", icon: <Rocket className="w-4 h-4" /> },
      { title: "Pricing & Tiers", href: "/docs/tiers", icon: <CreditCard className="w-4 h-4" /> },
    ],
  },
  {
    title: "Features",
    items: [
      { title: "Products", href: "/docs/features/products", icon: <Package className="w-4 h-4" /> },
      { title: "Orders", href: "/docs/features/orders", icon: <ShoppingCart className="w-4 h-4" /> },
      { title: "Coupons", href: "/docs/features/coupons", icon: <Tag className="w-4 h-4" /> },
      { title: "Themes", href: "/docs/features/themes", icon: <Palette className="w-4 h-4" /> },
      { title: "Analytics", href: "/docs/features/analytics", icon: <BarChart3 className="w-4 h-4" /> },
      { title: "Custom Domains", href: "/docs/features/domains", icon: <Globe className="w-4 h-4" /> },
      { title: "Digital Products", href: "/docs/features/digital-products", icon: <Download className="w-4 h-4" /> },
      { title: "Customer Accounts", href: "/docs/features/customer-accounts", icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    title: "Configuration",
    items: [
      { title: "Store Settings", href: "/docs/features/settings", icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-bold text-xl text-gray-900">
                GoSovereign
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Docs</span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Home
              </Link>
              <Link
                href="/wizard"
                className="text-sm px-4 py-2 bg-brand text-white rounded-lg hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar - Mobile */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-30 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
              <nav className="absolute left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 overflow-y-auto p-4">
                <SidebarContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
              </nav>
            </div>
          )}

          {/* Sidebar - Desktop */}
          <nav className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 min-h-[calc(100vh-4rem)]">
            <div className="sticky top-20 py-8 pr-4 overflow-y-auto max-h-[calc(100vh-5rem)]">
              <SidebarContent pathname={pathname} />
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 py-8 lg:pl-8 min-w-0">
            <article className="prose prose-gray max-w-none">
              {children}
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-6">
      {navigation.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {section.title}
          </h3>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <span className={isActive ? "text-brand" : "text-gray-400"}>
                      {item.icon}
                    </span>
                    {item.title}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto text-brand" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
