import { CheckCircle } from "lucide-react";
import type { RuntimeSettings, SpecialtyItem } from "@/lib/settings";

interface SpecialtiesProps {
  settings: RuntimeSettings;
}

export function Specialties({ settings }: SpecialtiesProps) {
  if (!settings.specialties || settings.specialties.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {settings.specialtiesTitle}
        </h2>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.specialties.map((specialty: SpecialtyItem, index: number) => (
            <div
              key={specialty.id || index}
              className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border border-transparent hover:border-brand/20"
            >
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-brand flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-gray-900">
                  {specialty.name}
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed pl-9">
                {specialty.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
