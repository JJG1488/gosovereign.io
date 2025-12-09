import { Hero } from "@/components/Hero";
import { ServiceGrid } from "@/components/ServiceGrid";
import { About } from "@/components/About";
import { ContactForm } from "@/components/ContactForm";
import { services } from "@/data/services";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section id="services" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <ServiceGrid services={services} />
        </div>
      </section>
      <About />
      <ContactForm />
    </>
  );
}
