"use client";

import { X, Gift, Store, Calendar } from "lucide-react";
import { Button } from "@/components/ui";
import {
  getDaysRemaining,
  getDeadlineFormatted,
  getMaxStores,
  isBogoPeriod,
} from "@/lib/bogo";

interface StoreLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManageStores: () => void;
  storeCount: number;
}

/**
 * Modal displayed when a user tries to create more stores than allowed.
 * Explains the BOGO promotion and provides options to manage existing stores.
 */
export function StoreLimitModal({
  isOpen,
  onClose,
  onManageStores,
  storeCount,
}: StoreLimitModalProps) {
  if (!isOpen) return null;

  const maxStores = getMaxStores();
  const daysRemaining = getDaysRemaining();
  const deadline = getDeadlineFormatted();
  const isBogo = isBogoPeriod();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-navy-800 rounded-2xl max-w-md w-full mx-4 border border-navy-700 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500/30 mb-4">
            <Gift className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Store Limit Reached
          </h2>
          <p className="text-gray-400">
            {isBogo
              ? `You've created ${storeCount} stores during our BOGO promotion!`
              : `You've reached the maximum of ${maxStores} store${maxStores > 1 ? "s" : ""}.`}
          </p>
        </div>

        {/* BOGO Info Box */}
        {isBogo && (
          <div className="mx-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Offer ends: {deadline}
              </span>
            </div>
            <p className="text-sm text-purple-200/80">
              {daysRemaining > 0
                ? `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} remaining`
                : "Offer has expired"}
            </p>
          </div>
        )}

        {/* Description */}
        <div className="p-6 pt-4">
          <p className="text-gray-400 text-sm text-center mb-6">
            You can manage your existing stores or contact us if you need
            additional store capacity.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={onManageStores} className="w-full">
              <Store className="w-4 h-4 mr-2" />
              Manage Existing Stores
            </Button>
            <Button variant="secondary" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-gray-500">
            Need more stores?{" "}
            <a
              href="mailto:info@gosovereign.io"
              className="text-purple-400 hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
