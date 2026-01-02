import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { getActiveServices } from "@/data/services";
import { getStoreSettingsFromDB } from "@/lib/settings";
import { getStoreConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with us for a free quote",
};

export default async function ContactPage() {
  const store = getStoreConfig();
  const settings = await getStoreSettingsFromDB();
  const services = await getActiveServices();

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-brand font-semibold text-sm uppercase tracking-wider mb-3">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to get started? Reach out for a free consultation and quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                {settings.phoneNumber && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <a
                        href={"tel:" + settings.phoneNumber}
                        className="text-lg font-semibold text-gray-900 hover:text-brand transition-colors"
                      >
                        {settings.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}

                {store.contactEmail && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <a
                        href={"mailto:" + store.contactEmail}
                        className="text-lg font-semibold text-gray-900 hover:text-brand transition-colors"
                      >
                        {store.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {store.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {store.address}
                      </p>
                    </div>
                  </div>
                )}

                {settings.businessHours && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Business Hours</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {settings.businessHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Areas */}
            {settings.serviceAreas && settings.serviceAreas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Areas
                </h3>
                <ul className="space-y-2">
                  {settings.serviceAreas.map((area, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-brand rounded-full" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <ContactForm services={services} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
