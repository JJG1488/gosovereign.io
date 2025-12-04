"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProduct, formatPrice } from "@/data/products";
import { useCart } from "@/components/CartContext";

// Gray placeholder for missing images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductPage() {
  const params = useParams();
  const product = getProduct(params.id as string);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h1>
        <Link href="/" className="text-primary hover:underline">
          &larr; Back to shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          Shop
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[selectedImage] || PLACEHOLDER_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === i
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-gray-900 mb-6">
            {formatPrice(product.price)}
          </p>
          <p className="text-gray-600 mb-8">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="quantity" className="font-medium text-gray-700">
              Quantity
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center border-x border-gray-300 py-2"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
              isAdded
                ? "bg-green-500"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {isAdded ? "Added to Cart!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
