import { Hero } from "@/components/Hero";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { Testimonials } from "@/components/Testimonials";
import { About } from "@/components/About";
import { ContactForm } from "@/components/ContactForm";
import { portfolio } from "@/data/portfolio";
import { testimonials } from "@/data/testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section id="portfolio" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">My Work</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A selection of projects I've worked on
          </p>
          <PortfolioGrid items={portfolio} />
        </div>
      </section>
      {testimonials.length > 0 && <Testimonials testimonials={testimonials} />}
      <About />
      <ContactForm />
    </>
  );
}
