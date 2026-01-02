import { ServiceGrid } from "@/components/ServiceGrid";
import { getActiveServices } from "@/data/services";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Services",
  description: "Browse our full range of professional services",
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-brand font-semibold text-sm uppercase tracking-wider mb-3">
            What We Offer
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional solutions tailored to meet your specific needs
          </p>
        </div>

        {/* Services Grid */}
        <ServiceGrid services={services} showAll />
      </div>
    </div>
  );
}
