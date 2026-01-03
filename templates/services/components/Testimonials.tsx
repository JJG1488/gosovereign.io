"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, ExternalLink, MapPin, Phone } from "lucide-react";
import type { RuntimeSettings, Testimonial } from "@/lib/settings";
import { getStoreConfig } from "@/lib/store";

interface TestimonialsProps {
  settings: RuntimeSettings;
  storeName?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials({ settings, storeName }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const store = getStoreConfig();
  const displayName = storeName || store.name;

  const testimonials = settings.testimonials || [];

  if (testimonials.length === 0) {
    return null;
  }

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {settings.testimonialsTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {settings.testimonialsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Business Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {displayName}
              </h3>

              {/* Overall Rating */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {settings.overallRating.toFixed(1)}
                </span>
                <div>
                  <StarRating rating={Math.round(settings.overallRating)} />
                  <p className="text-sm text-gray-500 mt-1">
                    {settings.reviewCount} reviews
                  </p>
                </div>
              </div>

              {/* Location */}
              {settings.address && (
                <div className="flex items-start gap-2 text-gray-600 mb-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{settings.address}</span>
                </div>
              )}

              {/* Phone */}
              {settings.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a
                    href={`tel:${settings.phoneNumber}`}
                    className="text-sm hover:text-brand transition-colors"
                  >
                    {settings.phoneNumber}
                  </a>
                </div>
              )}

              {/* Google Reviews Link */}
              {settings.googleReviewsUrl && (
                <a
                  href={settings.googleReviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors text-sm w-full justify-center"
                >
                  <Star className="w-4 h-4" />
                  View on Google
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Testimonials Carousel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 relative">
              {/* Current Testimonial */}
              <div className="mb-6">
                <StarRating rating={currentTestimonial.rating} />
              </div>

              <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 min-h-[120px]">
                &ldquo;{currentTestimonial.text}&rdquo;
              </blockquote>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {currentTestimonial.reviewerName}
                  </p>
                  {currentTestimonial.date && (
                    <p className="text-sm text-gray-500">
                      {currentTestimonial.date}
                    </p>
                  )}
                </div>

                {/* Navigation */}
                {testimonials.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevTestimonial}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-500 min-w-[60px] text-center">
                      {currentIndex + 1} / {testimonials.length}
                    </span>
                    <button
                      onClick={nextTestimonial}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Dots Indicator */}
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_: Testimonial, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? "bg-brand w-6"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
