"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Award } from "lucide-react";
import { Container } from "@/components/ui";
import { HeroCTA } from "./HeroCTA";

interface FinalCTAProps {
  headline: string;
  subheadline: string;
  cta: string;
  guarantee: string;
  variant?: string;
}

export function FinalCTA({
  headline,
  subheadline,
  cta,
  guarantee,
  variant,
}: FinalCTAProps): React.ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950 overflow-hidden"
    >
      {/* Ownership Deed Effect - Background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.03) 40px,
                rgba(255,255,255,0.03) 41px
              )
            `,
          }}
        />
      </div>

      {/* Emerald glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full" />

      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Certificate-style frame */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Decorative corners */}
            <div className="absolute -top-2 -left-2 w-12 h-12 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg" />

            <div className="bg-navy-800/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 lg:p-16 border border-navy-700 text-center">
              {/* Seal */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={isInView ? { scale: 1, rotate: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 mb-8"
              >
                <Award className="w-10 h-10 text-emerald-400" />
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                <span className="text-gradient">{headline.split(".")[0]}.</span>
                <br />
                <span className="text-gray-100">
                  {headline.split(".").slice(1).join(".")}
                </span>
              </motion.h2>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                {subheadline}
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <HeroCTA cta={cta} variant={variant} />
              </motion.div>

              {/* Guarantee */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="inline-flex items-center gap-2 text-gray-500"
              >
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">{guarantee}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
