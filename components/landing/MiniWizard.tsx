"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Briefcase,
  Image,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui";
import { slugifyStoreName } from "@/lib/slugify";

type Template = "goods" | "services" | "brochure";

const TEMPLATES = [
  {
    id: "goods" as Template,
    label: "Products",
    description: "Sell physical or digital products",
    icon: ShoppingBag,
  },
  {
    id: "services" as Template,
    label: "Services",
    description: "Offer services and bookings",
    icon: Briefcase,
  },
  {
    id: "brochure" as Template,
    label: "Portfolio",
    description: "Showcase your work",
    icon: Image,
  },
];

const COLOR_PRESETS = [
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Slate", value: "#64748b" },
];

export function MiniWizard(): React.ReactElement {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<Template>("goods");
  const [storeName, setStoreName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#10b981");

  const subdomain = slugifyStoreName(storeName);
  const canProceedStep1 = template !== null;
  const canProceedStep2 = storeName.trim().length >= 2;

  const handleContinue = () => {
    const params = new URLSearchParams({
      template,
      prefill_name: storeName,
      prefill_color: primaryColor,
    });
    router.push(`/wizard?${params.toString()}`);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl bg-navy-800/50 border border-navy-700 backdrop-blur-sm overflow-hidden">
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 py-4 border-b border-navy-700">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => s < step && setStep(s)}
              disabled={s > step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                s === step
                  ? "bg-emerald-500 text-navy-900"
                  : s < step
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 cursor-pointer"
                    : "bg-navy-700 text-gray-500"
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Side: Steps */}
          <div className="p-6 lg:p-8 lg:border-r border-navy-700">
            <AnimatePresence mode="wait" custom={step}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">
                    What are you building?
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Choose the type that best fits your business
                  </p>

                  <div className="space-y-3">
                    {TEMPLATES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = template === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTemplate(t.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-navy-600 hover:border-navy-500 bg-navy-900/50"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-emerald-500 text-navy-900"
                                : "bg-navy-700 text-gray-400"
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-100">
                              {t.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {t.description}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">
                    What&apos;s your store called?
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    This will be your store&apos;s name and URL
                  </p>

                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g., Awesome Goods"
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-navy-600 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    autoFocus
                  />

                  {subdomain && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Your URL: </span>
                      <span className="text-emerald-400 font-mono">
                        {subdomain}.gosovereign.io
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">
                    Pick your brand color
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    This will be your primary accent color
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {COLOR_PRESETS.map((color) => {
                      const isSelected = primaryColor === color.value;
                      return (
                        <button
                          key={color.value}
                          onClick={() => setPrimaryColor(color.value)}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            isSelected
                              ? "border-white bg-navy-700"
                              : "border-navy-600 hover:border-navy-500"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-navy-800 ${
                              isSelected ? "ring-white" : "ring-transparent"
                            }`}
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-xs text-gray-400">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Custom:</span>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-sm text-gray-500 font-mono">
                      {primaryColor.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-700">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="text-gray-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                  className="group"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button onClick={handleContinue} className="group">
                  Continue to Full Wizard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Side: Preview (Hidden on Mobile) */}
          <div className="hidden lg:block p-6 lg:p-8 bg-navy-900/30">
            <div className="text-sm text-gray-500 mb-4">Live Preview</div>

            <motion.div
              key={`${template}-${primaryColor}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl overflow-hidden border border-navy-600 shadow-xl"
            >
              {/* Store Header */}
              <div
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="font-bold text-white truncate max-w-[150px]">
                  {storeName || "Your Store"}
                </span>
                <div className="flex gap-3">
                  <span className="text-white/80 text-sm">
                    {template === "goods"
                      ? "Shop"
                      : template === "services"
                        ? "Services"
                        : "Work"}
                  </span>
                  <span className="text-white/80 text-sm">About</span>
                </div>
              </div>

              {/* Store Body */}
              <div className="bg-white p-6">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />

                {template === "goods" && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gray-100 rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {template === "services" && (
                  <div className="space-y-2 mb-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-100 rounded-lg flex items-center px-3"
                      >
                        <div className="w-8 h-8 rounded bg-gray-200" />
                        <div className="ml-3 flex-1">
                          <div className="h-2 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {template === "brochure" && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gray-100 rounded"
                      />
                    ))}
                  </div>
                )}

                <button
                  style={{ backgroundColor: primaryColor }}
                  className="px-4 py-2 text-white text-sm rounded-lg font-medium"
                >
                  {template === "goods"
                    ? "Shop Now"
                    : template === "services"
                      ? "Book Now"
                      : "View Work"}
                </button>
              </div>
            </motion.div>

            <div className="mt-4 text-center text-xs text-gray-600">
              This is a preview. Your actual store will be fully customizable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
