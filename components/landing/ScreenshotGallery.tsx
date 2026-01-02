"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Check,
  Package,
  LayoutDashboard,
  ShoppingCart,
  Settings,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Heart,
  Search,
} from "lucide-react";
import { Container } from "@/components/ui";

// Wizard Mockup - Shows the 8-step wizard interface
function WizardMockup(): React.ReactElement {
  const steps = [
    { num: 1, done: true },
    { num: 2, done: true },
    { num: 3, active: true },
    { num: 4 },
    { num: 5 },
    { num: 6 },
    { num: 7 },
    { num: 8 },
  ];

  return (
    <div className="w-full h-full bg-navy-900 rounded-t-lg overflow-hidden">
      {/* Top bar with step indicators */}
      <div className="bg-navy-800 px-4 py-3 border-b border-navy-700">
        <div className="flex items-center justify-center gap-1.5">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.done
                  ? "bg-emerald-500 text-white"
                  : step.active
                    ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500"
                    : "bg-navy-700 text-gray-500"
              }`}
            >
              {step.done ? <Check className="w-3 h-3" /> : step.num}
            </div>
          ))}
        </div>
      </div>

      {/* Wizard content */}
      <div className="p-5">
        <div className="mb-4">
          <div className="text-sm font-medium text-emerald-400 mb-1">
            Step 3 of 8
          </div>
          <div className="text-lg font-semibold text-white mb-1">
            Name your store
          </div>
          <div className="text-xs text-gray-400">
            This will be your store&apos;s identity
          </div>
        </div>

        {/* Input field */}
        <div className="mb-4">
          <div className="bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 flex items-center gap-2">
            <span className="text-gray-300 text-sm">Awesome Store</span>
            <span className="w-0.5 h-4 bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-1.5 text-xs text-gray-500">
            URL:{" "}
            <span className="text-emerald-400 font-mono">
              awesome-store.gosovereign.io
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>37%</span>
          </div>
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              style={{ width: "37%" }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <div className="flex-1 bg-navy-700 text-gray-400 text-xs py-2 rounded-lg text-center">
            Back
          </div>
          <div className="flex-1 bg-emerald-500 text-white text-xs py-2 rounded-lg text-center font-medium">
            Continue
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Mockup - Shows the store admin interface
function AdminMockup(): React.ReactElement {
  const stats = [
    { label: "Revenue", value: "$2,847", icon: DollarSign, trend: "+12%" },
    { label: "Orders", value: "64", icon: ShoppingCart, trend: "+8%" },
    { label: "Visitors", value: "1,234", icon: Users, trend: "+23%" },
  ];

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Package, label: "Products" },
    { icon: ShoppingCart, label: "Orders" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-full h-full bg-gray-50 rounded-t-lg overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-12 bg-navy-900 flex flex-col items-center py-3 gap-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center mb-2">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                item.active
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 p-3">
        <div className="text-xs font-semibold text-gray-800 mb-2">
          Dashboard
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-lg p-2 border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] text-gray-500">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-gray-800">
                    {stat.value}
                  </span>
                  <span className="text-[9px] text-emerald-500">
                    {stat.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mini chart placeholder */}
        <div className="bg-white rounded-lg p-2 border border-gray-100 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-gray-600">
              Revenue
            </span>
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="flex items-end gap-1 h-8">
            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/20 rounded-t"
                style={{ height: `${h}%` }}
              >
                <div
                  className="w-full bg-emerald-500 rounded-t"
                  style={{ height: `${h * 0.7}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-lg p-2 border border-gray-100">
          <div className="text-[10px] font-medium text-gray-600 mb-1.5">
            Recent Orders
          </div>
          <div className="space-y-1.5">
            {[
              { id: "#1847", amount: "$89", status: "Shipped" },
              { id: "#1846", amount: "$156", status: "Pending" },
            ].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between text-[10px]"
              >
                <span className="text-gray-700 font-medium">{order.id}</span>
                <span className="text-gray-500">{order.amount}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] ${
                    order.status === "Shipped"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Storefront Mockup - Shows the customer-facing store
function StorefrontMockup(): React.ReactElement {
  const products = [
    { name: "Premium Headphones", price: "$199", rating: 5 },
    { name: "Wireless Speaker", price: "$89", rating: 4 },
  ];

  return (
    <div className="w-full h-full bg-white rounded-t-lg overflow-hidden">
      {/* Store header */}
      <div className="bg-emerald-500 px-4 py-2.5 flex items-center justify-between">
        <span className="font-bold text-white text-sm">Awesome Store</span>
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-white/80" />
          <Heart className="w-4 h-4 text-white/80" />
          <div className="relative">
            <ShoppingCart className="w-4 h-4 text-white/80" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white text-emerald-600 rounded-full text-[8px] font-bold flex items-center justify-center">
              2
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 px-4 py-1.5 flex gap-4 text-[10px] border-b border-gray-100">
        <span className="text-emerald-600 font-medium">Shop</span>
        <span className="text-gray-500">New Arrivals</span>
        <span className="text-gray-500">Sale</span>
        <span className="text-gray-500">About</span>
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-3">
        <div className="text-xs font-semibold text-gray-800">Summer Sale</div>
        <div className="text-[10px] text-gray-600 mb-1">
          Up to 40% off select items
        </div>
        <div className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded inline-block font-medium">
          Shop Now
        </div>
      </div>

      {/* Product grid */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="w-10 h-10 bg-gray-300 rounded-lg" />
              </div>
              <div className="p-2">
                <div className="text-[10px] font-medium text-gray-800 truncate">
                  {product.name}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {product.price}
                  </span>
                  <div className="flex">
                    {[...Array(product.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-2 h-2 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const screenshots = [
  {
    title: "15-Minute Wizard",
    description: "Answer a few questions. Watch your store build itself.",
    Mockup: WizardMockup,
    gradient: "from-emerald-500/20 to-navy-800",
  },
  {
    title: "Powerful Admin",
    description: "Manage products, orders, and settings from one dashboard.",
    Mockup: AdminMockup,
    gradient: "from-blue-500/20 to-navy-800",
  },
  {
    title: "Beautiful Storefront",
    description: "Professional design that converts visitors to customers.",
    Mockup: StorefrontMockup,
    gradient: "from-purple-500/20 to-navy-800",
  },
];

export function ScreenshotGallery(): React.ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-navy-900">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-4">
            What You&apos;ll Build
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From setup to sales in 15 minutes. Here&apos;s what your store looks
            like.
          </p>
        </motion.div>

        {/* Screenshot Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {screenshots.map((screenshot, index) => {
            const MockupComponent = screenshot.Mockup;
            return (
              <motion.div
                key={screenshot.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.15,
                }}
                className="group"
              >
                <div className="relative rounded-2xl overflow-hidden border border-navy-700 bg-navy-800/50 transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                  {/* Rendered Mockup */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <MockupComponent />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-100 mb-2">
                      {screenshot.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {screenshot.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
