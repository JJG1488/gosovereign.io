import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { About } from "@/components/About";
import { products } from "@/data/products";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Products</h2>
          <ProductGrid products={products} />
        </div>
      </section>
      <About />
    </>
  );
}
