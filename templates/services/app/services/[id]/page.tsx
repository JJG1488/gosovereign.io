import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, formatPrice, services } from "@/data/services";
import { store } from "@/data/store";

interface ServicePageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return services.map((service) => ({
    id: service.id,
  }));
}

export default function ServicePage({ params }: ServicePageProps) {
  const service = getService(params.id);

  if (!service) {
    notFound();
  }

  const imageUrl = service.images[0] || "/placeholder.jpg";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/#services"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Back to Services
        </Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {service.name}
          </h1>
          <p className="text-2xl font-bold text-primary mb-6">
            Starting at {formatPrice(service.price)}
          </p>

          <div className="prose prose-gray mb-8">
            {service.description.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-gray-600">
                {paragraph}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link href="/#contact" className="w-full btn-primary block text-center">
              Get a Quote
            </Link>
            <a
              href={`mailto:${store.contactEmail}?subject=Inquiry about ${service.name}`}
              className="w-full btn-secondary block text-center"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
