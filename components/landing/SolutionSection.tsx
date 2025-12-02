"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Palette,
  Wand2,
  CreditCard,
  MousePointerClick,
  Download,
} from "lucide-react";
import { Container, Card } from "@/components/ui";

interface Feature {
  title: string;
  description: string;
}

interface SolutionSectionProps {
  headline: string;
  intro: string;
  features: Feature[];
}

const icons = [Palette, Wand2, CreditCard, MousePointerClick, Download];

export function SolutionSection({
  headline,
  intro,
  features,
}: SolutionSectionProps): React.ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-800 overflow-hidden"
    >
      {/* Hope glow - emerald */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full" />

      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-4">
            <span className="text-gradient">{headline.split(".")[0]}.</span>
            <br />
            {headline.split(".").slice(1).join(".")}
          </h2>
          <p className="text-lg text-gray-400">{intro}</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + index * 0.1,
                }}
              >
                <Card hover className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
