import type { RuntimeSettings, AdditionalService } from "@/lib/settings";

interface AdditionalServicesProps {
  settings: RuntimeSettings;
}

export function AdditionalServices({ settings }: AdditionalServicesProps) {
  if (!settings.additionalServices || settings.additionalServices.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {settings.additionalServicesTitle}
        </h2>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.additionalServices.map((service: AdditionalService, index: number) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-t-4 border-brand"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 leading-none">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
