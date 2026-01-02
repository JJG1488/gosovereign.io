import Link from "next/link";
import type { Service } from "@/data/services";
import { formatPrice } from "@/data/services";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const imageUrl = service.images[0] || null;

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      {/* Image or Icon */}
      {imageUrl ? (
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gradient-to-br from-brand/10 to-brand/5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
            <span className="text-brand text-2xl font-bold">{service.name.charAt(0)}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
          {service.name}
        </h3>
        {service.short_description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {service.short_description}
          </p>
        )}
        <p className="text-lg font-bold text-brand">
          {formatPrice(service.price, service.price_type)}
        </p>
      </div>
    </Link>
  );
}
