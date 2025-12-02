import Link from "next/link";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0] || "/placeholder.jpg";

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
