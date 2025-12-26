"use client";

import { Zap, ArrowRight } from "lucide-react";
import { isDiscountActive, getDiscountDaysRemaining, getStarterPriceDisplay, getDiscountSavingsDisplay } from "@/lib/discount";
import { isBogoPeriod, formatCountdown, getDeadlineFormatted } from "@/lib/bogo";

interface BogoPromoProps {
  className?: string;
}

/**
 * Promotional banner for landing pages.
 * Shows $50 flash sale when active, otherwise BOGO promotion.
 */
export function BogoPromo({ className = "" }: BogoPromoProps) {
  const discountActive = isDiscountActive();
  const bogoActive = isBogoPeriod();

  // Show $50 flash sale if active
  if (discountActive) {
    const daysLeft = getDiscountDaysRemaining();
    const price = getStarterPriceDisplay();
    const savings = getDiscountSavingsDisplay();

    return (
      <div
        className={`bg-gradient-to-r from-amber-600/90 via-orange-500/90 to-amber-600/90 border-b border-amber-400/30 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            {/* Icon + Message */}
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-200" />
              <span className="text-sm sm:text-base text-white font-medium">
                FLASH SALE: Get Starter for just <span className="text-yellow-200 font-bold">{price}</span>
                <span className="hidden sm:inline"> (Save {savings}!)</span>
              </span>
            </div>

            {/* Countdown */}
            <span className="hidden sm:inline text-amber-200/70">•</span>
            <span className="text-sm text-amber-100/90">
              {daysLeft} {daysLeft === 1 ? "day" : "days"} left
            </span>

            {/* CTA */}
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-amber-50 text-amber-700 text-sm font-semibold rounded-full transition-colors"
            >
              Claim Deal
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fall back to BOGO promotion if active
  if (!bogoActive) return null;

  const countdown = formatCountdown();
  const deadline = getDeadlineFormatted();

  return (
    <div
      className={`bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-purple-900/80 border-b border-purple-500/30 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          {/* Icon + Message */}
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-300" />
            <span className="text-sm sm:text-base text-white font-medium">
              LIMITED TIME: Create <span className="text-purple-300 font-bold">2 stores</span> during our BOGO promotion!
            </span>
          </div>

          {/* Countdown */}
          <span className="hidden sm:inline text-purple-400/70">•</span>
          <span className="text-sm text-purple-300/80">
            Ends {deadline} ({countdown})
          </span>

          {/* CTA */}
          <a
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Start Free
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
