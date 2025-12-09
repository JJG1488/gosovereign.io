import Link from "next/link";
import { store } from "@/data/store";

export function Hero() {
  return (
    <section className="relative bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {store.name}
          </h1>
          <p className="text-xl text-gray-600 mb-8">{store.tagline}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#services" className="btn-primary">
              View Services
            </Link>
            <Link href="#contact" className="btn-secondary">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
