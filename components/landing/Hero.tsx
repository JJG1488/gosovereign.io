"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui";
import { MiniWizard } from "./MiniWizard";

interface HeroProps {
  headline: string;
  subheadline: string;
  microProof: string;
}

// Shopify makes roughly $0.013 per second from their 2M+ merchants
// We'll use a dramatic but believable rate
const DOLLARS_PER_SECOND = 0.47;

export function Hero({
  headline,
  subheadline,
  microProof,
}: HeroProps): React.ReactElement {
  const [counter, setCounter] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // useEffect(() => {
  //   setIsVisible(true);
  //   const interval = setInterval(() => {
  //     setCounter((prev) => prev + DOLLARS_PER_SECOND / 10);
  //   }, 100);

  //   return () => clearInterval(interval);
  // }, []);


  useEffect(() => {

    const raf = requestAnimationFrame(() => setIsVisible(true));

    const interval = setInterval(() => {
      setCounter((prev) => prev + DOLLARS_PER_SECOND / 1);
    }, 100);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, []);
 

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-800" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Red glow at top - the bleed */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-bleed-500/10 blur-[150px] rounded-full" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live Counter - The Bleed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-navy-800/50 border border-bleed-500/30 backdrop-blur-sm">
              <span className="text-sm text-gray-400">
                Since you opened this page, alternative platforms have collected
              </span>
              <span className="text-3xl md:text-4xl font-bold text-bleed-400 animate-counter-glow tabular-nums">
                ${counter.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                from entrepreneurs like you
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-100 leading-[1.1] tracking-tight mb-6"
          >
            {headline.split(".").map((part, i, arr) =>
              i === arr.length - 1 && part.trim() === "" ? null : (
                <span key={i}>
                  {part.trim()}
                  {i < arr.length - 2 && "."}
                  {i === arr.length - 2 && (
                    <>
                      .<br className="hidden sm:block" />{" "}
                    </>
                  )}
                </span>
              )
            )}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {subheadline}
          </motion.p>

          {/* Mini Wizard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <MiniWizard />
          </motion.div>

          {/* Demo Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-6"
          >
            <a
              href="https://demo.gosovereign.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              See Live Examples
            </a>
          </motion.div>

          {/* Micro-proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center justify-center gap-2 text-gray-500"
          >
            <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span className="text-sm italic">{microProof}</span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
