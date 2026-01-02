import Link from "next/link";
import { ArrowRight, Wrench, Home, Hammer, PaintBucket, Zap } from "lucide-react";
import type { Service } from "@/data/services";

interface ServiceGridProps {
  services: Service[];
  showAll?: boolean;
}

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wrench: Wrench,
  home: Home,
  hammer: Hammer,
  paintbucket: PaintBucket,
  zap: Zap,
};

function getIcon(iconName: string | null): React.ComponentType<{ className?: string }> {
  if (!iconName) return Wrench;
  return iconMap[iconName.toLowerCase()] || Wrench;
}

function formatPrice(price: number | null, priceType: string): string {
  if (price === null) return "Contact for pricing";
  
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price / 100);

  switch (priceType) {
    case "starting_at":
      return "From " + formatted;
    case "hourly":
      return formatted + "/hr";
    case "custom":
      return "Custom pricing";
    default:
      return formatted;
  }
}

export function ServiceGrid({ services, showAll = false }: ServiceGridProps) {
  const displayServices = showAll ? services : services.slice(0, 6);

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No services available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayServices.map((service, index) => {
          const Icon = getIcon(service.icon);
          return (
            <Link
              key={service.id}
              href={"/services/" + service.slug}
              className={"group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 card-hover stagger-" + ((index % 5) + 1)}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                <Icon className="w-7 h-7 text-brand" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                {service.name}
              </h3>

              {service.short_description && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {service.short_description}
                </p>
              )}

              {/* Price */}
              {service.price !== null && (
                <p className="text-brand font-semibold mb-4">
                  {formatPrice(service.price, service.price_type)}
                </p>
              )}

              {/* Features Preview */}
              {service.features && service.features.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {service.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Learn More */}
              <div className="flex items-center gap-2 text-brand font-medium group-hover:gap-3 transition-all">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Button */}
      {!showAll && services.length > 6 && (
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-brand text-gray-900 font-semibold px-8 py-4 rounded-xl hover:bg-brand-dark transition-all btn-glow"
          >
            View All Services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
