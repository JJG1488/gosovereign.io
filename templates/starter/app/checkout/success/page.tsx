"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { store } from "@/data/store";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  // Clear cart on successful checkout
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success icon */}
      <div
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${store.primaryColor}20` }}
      >
        <svg
          className="w-10 h-10"
          style={{ color: store.primaryColor }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Thank you for your order!
      </h1>

      <p className="text-gray-600 mb-8">
        Your payment was successful. We&apos;ll send a confirmation email shortly with
        your order details.
      </p>

      <div className="space-y-4">
        <Link
          href="/"
          className="btn-primary inline-block"
          style={{ backgroundColor: store.primaryColor }}
        >
          Continue Shopping
        </Link>

        <p className="text-sm text-gray-500">
          Questions? Contact us at{" "}
          <a
            href={`mailto:${store.contactEmail}`}
            className="underline hover:no-underline"
            style={{ color: store.primaryColor }}
          >
            {store.contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
