import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";

// Gray placeholder for missing images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0] || PLACEHOLDER_IMAGE;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <p className="text-lg font-semibold text-gray-900 mt-2">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
