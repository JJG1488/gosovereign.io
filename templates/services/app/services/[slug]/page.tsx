import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Clock, DollarSign } from "lucide-react";
import { getServiceBySlug, getActiveServices } from "@/data/services";
import { ContactForm } from "@/components/ContactForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
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
      return "Starting at " + formatted;
    case "hourly":
      return formatted + " per hour";
    case "custom":
      return "Custom pricing";
    default:
      return formatted;
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  const allServices = await getActiveServices();

  if (!service) {
    notFound();
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-brand mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {service.name}
            </h1>

            {service.short_description && (
              <p className="text-xl text-gray-600 mb-8">
                {service.short_description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 mb-8">
              {service.price !== null && (
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5 text-brand" />
                  <span className="font-semibold">
                    {formatPrice(service.price, service.price_type)}
                  </span>
                </div>
              )}
              {service.duration && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-brand" />
                  <span>{service.duration}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {service.description && (
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {service.description}
                </p>
              </div>
            )}

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  What&apos;s Included
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Request a Quote
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Interested in this service? Fill out the form below and we will
                get back to you with a personalized quote.
              </p>
              <ContactForm
                services={allServices}
                preselectedServiceId={service.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
