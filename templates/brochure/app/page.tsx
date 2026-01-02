import { Hero } from "@/components/Hero";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { Testimonials } from "@/components/Testimonials";
import { About } from "@/components/About";
import { ContactForm } from "@/components/ContactForm";
import { getStoreSettingsFromDB } from "@/lib/settings";
import { getSupabaseAdmin, getStoreId } from "@/lib/supabase";
import { getStoreConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

async function getPortfolioItems() {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) return [];

  const { data } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return data || [];
}

async function getTestimonials() {
  const supabase = getSupabaseAdmin();
  const storeId = getStoreId();

  if (!supabase || !storeId) return [];

  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return data || [];
}

export default async function HomePage() {
  const store = getStoreConfig();
  const settings = await getStoreSettingsFromDB();
  const portfolioItems = await getPortfolioItems();
  const testimonials = await getTestimonials();

  return (
    <>
      <Hero settings={settings} storeName={store.name} />

      {/* Portfolio Section */}
      <section id="portfolio" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Our Work</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A selection of projects we have worked on
          </p>
          <PortfolioGrid items={portfolioItems} />
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}

      {/* About Section */}
      {settings.showAbout && <About settings={settings} />}

      {/* Contact Section */}
      {settings.showContactForm && (
        <section id="contact" className="py-16 px-4 bg-[var(--bg-secondary)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Get in Touch</h2>
            <p className="text-center text-gray-600 mb-12">
              Have a project in mind? We would love to hear from you.
            </p>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <ContactForm />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
