"use client";

import { Gift } from "lucide-react";
import { isBogoPeriod, formatCountdownShort } from "@/lib/bogo";

interface BogoBadgeProps {
  storeCount: number;
  maxStores?: number;
  showCountdown?: boolean;
}

/**
 * BOGO promotion badge showing store count and countdown.
 * Displays "1 of 2 Stores • 403d left" style badge.
 */
export function BogoBadge({
  storeCount,
  maxStores = 2,
  showCountdown = true,
}: BogoBadgeProps) {
  // Don't render if BOGO period has ended
  if (!isBogoPeriod()) return null;

  const countdown = formatCountdownShort();

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
      <Gift className="w-3.5 h-3.5" />
      <span>
        {storeCount} of {maxStores} Stores
      </span>
      {showCountdown && (
        <>
          <span className="text-purple-500/50">•</span>
          <span className="text-purple-300">{countdown}</span>
        </>
      )}
    </div>
  );
}
