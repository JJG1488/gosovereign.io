import Link from "next/link";
import type { StoreSettings } from "@/lib/settings";

interface HeroProps {
  settings: StoreSettings;
  storeName: string;
}

export function Hero({ settings, storeName }: HeroProps) {
  return (
    <section className="relative bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto px-4 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {settings.heroTitle || storeName}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {settings.heroSubtitle || "Welcome to our site"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={settings.heroCtaLink || "#portfolio"}
              className="btn-primary"
            >
              {settings.heroCta || "View Our Work"}
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
