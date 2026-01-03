import { Clock, Phone } from "lucide-react";
import type { RuntimeSettings } from "@/lib/settings";

interface WhyChooseUsProps {
  settings: RuntimeSettings;
}

export function WhyChooseUs({ settings }: WhyChooseUsProps) {
  return (
    <section className="py-20" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center text-white mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-brand tracking-wide">
            {settings.whyChooseUsTitle}
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-white leading-relaxed">
            {settings.whyChooseUsHeading}
          </h3>

          {/* Emergency Banner */}
          {settings.emergencyBannerEnabled && settings.emergencyBannerText && (
            <div className="inline-flex items-center justify-center gap-3 flex-wrap bg-brand/10 border-2 border-brand rounded-xl px-6 py-4 mb-8">
              <Clock className="w-8 h-8 text-brand" />
              <p className="text-lg font-semibold text-white mb-0">
                {settings.emergencyBannerText}
              </p>
              <Phone className="w-7 h-7 text-brand" />
              {settings.phoneNumber && (
                <a
                  href={`tel:${settings.phoneNumber}`}
                  className="text-lg font-semibold text-brand hover:text-brand-dark transition-colors"
                >
                  Give us a call!
                </a>
              )}
            </div>
          )}
        </div>

        {/* About Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 rounded-2xl shadow-xl p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {settings.whyChooseUsText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
