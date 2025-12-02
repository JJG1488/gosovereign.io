"use client";

import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard, COLOR_PRESETS } from "../WizardContext";

export function ColorStep() {
  const { state, updateConfig } = useWizard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Palette className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose your brand color
        </h2>
        <p className="text-gray-400">
          This will be used for buttons, links, and accents throughout your
          store.
        </p>
      </div>

      {/* Color grid */}
      <div className="max-w-sm mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = state.config.primaryColor === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => updateConfig({ primaryColor: preset.value })}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-white bg-navy-700"
                    : "border-navy-600 hover:border-navy-500"
                )}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: preset.value }}
                >
                  {isSelected && (
                    <Check
                      className="w-6 h-6"
                      style={{ color: preset.textColor }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom color input */}
        <div className="mt-6 flex items-center gap-4">
          <label
            htmlFor="customColor"
            className="text-sm text-gray-400 whitespace-nowrap"
          >
            Or choose custom:
          </label>
          <div className="relative flex-1">
            <input
              id="customColor"
              type="color"
              value={state.config.primaryColor ?? "#10b981"}
              onChange={(e) => updateConfig({ primaryColor: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-full h-10 rounded-lg border-2 border-navy-600 cursor-pointer"
              style={{ backgroundColor: state.config.primaryColor }}
            />
          </div>
          <span className="text-sm font-mono text-gray-400">
            {state.config.primaryColor?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="max-w-sm mx-auto mt-8 p-6 bg-navy-900/50 rounded-xl border border-navy-700">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
          Preview
        </p>
        <div className="space-y-4">
          <button
            className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: state.config.primaryColor }}
          >
            Add to Cart
          </button>
          <p className="text-sm">
            Check out our{" "}
            <span
              className="font-medium underline cursor-pointer"
              style={{ color: state.config.primaryColor }}
            >
              best sellers
            </span>{" "}
            and{" "}
            <span
              className="font-medium underline cursor-pointer"
              style={{ color: state.config.primaryColor }}
            >
              new arrivals
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
