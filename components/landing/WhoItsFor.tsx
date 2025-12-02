"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { Container } from "@/components/ui";

interface WhoItsForProps {
  headline: string;
  checklist: string[];
  closing: string;
}

export function WhoItsFor({
  headline,
  checklist,
  closing,
}: WhoItsForProps): React.ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-navy-800">
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100">
            {headline}
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <ul className="space-y-4 mb-12">
            {checklist.map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + index * 0.1,
                }}
                className="flex items-start gap-4 p-4 rounded-xl bg-navy-900/50 border border-navy-700 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-lg text-gray-300">{item}</span>
              </motion.li>
            ))}
          </ul>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-xl text-center text-emerald-400 font-semibold"
          >
            {closing}
          </motion.p>
        </div>
      </Container>
    </section>
  );
}
