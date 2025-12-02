"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface HowItWorksProps {
  headline: string;
  steps: Step[];
}

export function HowItWorks({ headline, steps }: HowItWorksProps): React.ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-navy-800 overflow-hidden">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100">
            {headline}
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent md:-translate-x-1/2 hidden md:block" />

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + index * 0.2,
                }}
                className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Number */}
                <div className="relative z-10 flex-shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl font-bold text-navy-900 shadow-lg shadow-emerald-500/30">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`flex-1 ${
                    index % 2 === 0
                      ? "md:pr-24 md:text-right"
                      : "md:pl-24 md:text-left"
                  }`}
                >
                  <div className="bg-navy-900/50 rounded-2xl p-6 border border-navy-700">
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-100 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
