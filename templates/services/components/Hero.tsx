import Link from "next/link";
import { Shield, Award, CheckCircle, ChevronDown } from "lucide-react";
import type { RuntimeSettings } from "@/lib/settings";

interface HeroProps {
  settings: RuntimeSettings;
  storeName: string;
}

export function Hero({ settings, storeName }: HeroProps) {
  const trustIndicators = [
    { icon: Shield, text: "Fully Insured" },
    { icon: Award, text: "Certified Experts" },
    { icon: CheckCircle, text: "100% Satisfaction" },
  ];

  // Background style based on settings
  const getBgStyle = () => {
    if (settings.heroStyle === "image" && settings.heroImageUrl) {
      return {
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(" + settings.heroImageUrl + ")",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (settings.heroStyle === "video" && settings.heroVideoUrl) {
      return {}; // Video will be handled separately
    }
    // Default gradient
    return {
      background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
    };
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-20"
      style={getBgStyle()}
    >
      {/* Video background if applicable */}
      {settings.heroStyle === "video" && settings.heroVideoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={settings.heroVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay for video */}
      {settings.heroStyle === "video" && (
        <div className="absolute inset-0 bg-black/60" />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-brand/20 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
          <Award className="w-4 h-4" />
          Trusted Since 2010
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-shadow animate-slide-up">
          Professional Services
          <br />
          <span className="text-brand">You Can Trust</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto text-shadow-sm animate-slide-up stagger-2">
          {settings.tagline || "Quality workmanship, reliable service, and complete customer satisfaction guaranteed."}
        </p>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 animate-slide-up stagger-3">
          {trustIndicators.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-300">
              <item.icon className="w-5 h-5 text-brand" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-4">
          <Link
            href="/contact"
            className="bg-brand text-gray-900 font-semibold px-8 py-4 rounded-xl hover:bg-brand-dark transition-all btn-glow text-lg"
          >
            Get a Free Quote
          </Link>
          <Link
            href="/services"
            className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-gray-900 transition-all text-lg"
          >
            Our Services
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60" />
      </div>
    </section>
  );
}
