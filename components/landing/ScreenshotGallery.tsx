"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Wand2, Settings, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui";

const screenshots = [
  {
    title: "15-Minute Wizard",
    description: "Answer a few questions. Watch your store build itself.",
    icon: Wand2,
    gradient: "from-emerald-500/20 to-navy-800",
  },
  {
    title: "Powerful Admin",
    description: "Manage products, orders, and settings from one dashboard.",
    icon: Settings,
    gradient: "from-blue-500/20 to-navy-800",
  },
  {
    title: "Beautiful Storefront",
    description: "Professional design that converts visitors to customers.",
    icon: ShoppingBag,
    gradient: "from-purple-500/20 to-navy-800",
  },
];

export function ScreenshotGallery(): React.ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-navy-900">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-4">
            What You&apos;ll Build
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From setup to sales in 15 minutes. Here&apos;s what your store looks like.
          </p>
        </motion.div>

        {/* Screenshot Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {screenshots.map((screenshot, index) => {
            const Icon = screenshot.icon;
            return (
              <motion.div
                key={screenshot.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.15,
                }}
                className="group"
              >
                <div className="relative rounded-2xl overflow-hidden border border-navy-700 bg-navy-800/50 transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                  {/* Placeholder Image Area */}
                  <div
                    className={`aspect-[4/3] bg-gradient-to-br ${screenshot.gradient} flex items-center justify-center`}
                  >
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <div className="w-16 h-16 rounded-xl bg-navy-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-emerald-500/70" />
                      </div>
                      <span className="text-sm">Screenshot coming soon</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-100 mb-2">
                      {screenshot.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {screenshot.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
