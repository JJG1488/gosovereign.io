"use client";

import { Sparkles, Crown, Cloud, Rocket } from "lucide-react";
import type { PaymentTier } from "@/types/database";

interface PaymentStatusBadgeProps {
  isPaid: boolean;
  tier: PaymentTier | null;
  isLoading?: boolean;
}

const TIER_CONFIG: Record<
  PaymentTier,
  { label: string; icon: React.ReactNode; className: string }
> = {
  starter: {
    label: "Starter",
    icon: <Rocket className="w-3.5 h-3.5" />,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  pro: {
    label: "Pro",
    icon: <Crown className="w-3.5 h-3.5" />,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  hosted: {
    label: "Hosted",
    icon: <Cloud className="w-3.5 h-3.5" />,
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

export function PaymentStatusBadge({
  isPaid,
  tier,
  isLoading = false,
}: PaymentStatusBadgeProps) {
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-navy-700/50 text-gray-500 border border-navy-600 animate-pulse">
        <div className="w-3 h-3 bg-gray-600 rounded-full" />
        Loading...
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Sparkles className="w-3.5 h-3.5" />
        Preview Mode
      </div>
    );
  }

  if (!tier) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <Sparkles className="w-3.5 h-3.5" />
        Paid
      </div>
    );
  }

  const config = TIER_CONFIG[tier];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.icon}
      {config.label}
    </div>
  );
}
