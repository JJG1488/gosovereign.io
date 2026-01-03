import { Hero } from "@/components/Hero";
import { ServiceGrid } from "@/components/ServiceGrid";
import { ProcessSteps } from "@/components/ProcessSteps";
import { Stats } from "@/components/Stats";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Specialties } from "@/components/Specialties";
import { AdditionalServices } from "@/components/AdditionalServices";
import { Badges } from "@/components/Badges";
import { Testimonials } from "@/components/Testimonials";
import { ContactForm } from "@/components/ContactForm";
import { getActiveServices } from "@/data/services";
import { getStoreSettingsFromDB } from "@/lib/settings";
import { getStoreConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = getStoreConfig();
  const settings = await getStoreSettingsFromDB();
  const services = await getActiveServices();
  const featuredServices = services.filter((s) => s.is_featured);

  return (
    <div>
      {/* Hero Section */}
      <Hero settings={settings} storeName={store.name} />

      {/* Process Steps */}
      {settings.showProcess && <ProcessSteps settings={settings} />}

      {/* Why Choose Us */}
      {settings.showWhyChooseUs && <WhyChooseUs settings={settings} />}

      {/* Specialties */}
      {settings.showSpecialties && <Specialties settings={settings} />}

      {/* Additional Services */}
      {settings.showAdditionalServices && (
        <AdditionalServices settings={settings} />
      )}

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-brand font-semibold text-sm uppercase tracking-wider mb-3">
              What We Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional solutions tailored to your needs
            </p>
          </div>

          <ServiceGrid
            services={featuredServices.length > 0 ? featuredServices : services}
          />
        </div>
      </section>

      {/* Testimonials */}
      {settings.showTestimonials &&
        settings.testimonials &&
        settings.testimonials.length > 0 && (
          <Testimonials settings={settings} storeName={store.name} />
        )}

      {/* Badges & Stats */}
      {settings.showBadges && <Badges settings={settings} />}

      {/* Stats (standalone if badges are hidden) */}
      {!settings.showBadges && settings.showStats && (
        <Stats stats={settings.stats} />
      )}

      {/* CTA Section */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side - Text */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-600 mb-6">
                  Contact us today for a free consultation and quote. We are here
                  to help with all your service needs.
                </p>
                {settings.phoneNumber && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Call us directly:</p>
                    <a
                      href={"tel:" + settings.phoneNumber}
                      className="text-2xl font-bold text-brand hover:text-brand-dark transition-colors"
                    >
                      {settings.phoneNumber}
                    </a>
                  </div>
                )}
                {settings.businessHours && (
                  <p className="text-sm text-gray-500">
                    <strong>Hours:</strong> {settings.businessHours}
                  </p>
                )}
              </div>

              {/* Right Side - Form */}
              <div>
                <ContactForm services={services} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
