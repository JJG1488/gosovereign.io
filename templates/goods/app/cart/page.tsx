"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/data/products";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link href="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {/* Cart items */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg"
          >
            {/* Image */}
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={item.product.images[0] || "/placeholder.jpg"}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">{item.product.name}</h3>
              <p className="text-gray-500 text-sm">
                {formatPrice(item.product.price)} each
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                className="px-3 py-1 text-gray-600 hover:text-gray-900"
              >
                -
              </button>
              <span className="px-3 py-1 border-x border-gray-300">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                className="px-3 py-1 text-gray-600 hover:text-gray-900"
              >
                +
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right w-24">
              <p className="font-medium text-gray-900">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeItem(item.product.id)}
              className="p-2 text-gray-400 hover:text-red-500"
              aria-label="Remove item"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-medium text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(total)}
          </span>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="btn-secondary flex-1 text-center">
            Continue Shopping
          </Link>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Checkout"}
          </button>
        </div>

        <button
          onClick={clearCart}
          disabled={isLoading}
          className="w-full mt-4 text-gray-500 hover:text-red-500 text-sm disabled:opacity-50"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
