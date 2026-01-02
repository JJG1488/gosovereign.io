"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

interface EnhanceButtonProps {
  type: "tagline" | "about";
  storeName: string;
  template: "goods" | "services" | "brochure";
  currentText?: string;
  onEnhanced: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function EnhanceButton({
  type,
  storeName,
  template,
  currentText,
  onEnhanced,
  disabled,
  className = "",
}: EnhanceButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [hasEnhanced, setHasEnhanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhance = async () => {
    if (!storeName.trim()) {
      setError("Enter a store name first (Step 1)");
      return;
    }

    setIsEnhancing(true);
    setError(null);

    try {
      const response = await fetch("/api/wizard/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          storeName: storeName.trim(),
          template,
          currentText: currentText?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to enhance");
      }

      const data = await response.json();
      onEnhanced(data.result);
      setHasEnhanced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  const isDisabled = disabled || isEnhancing || !storeName.trim();

  const label = type === "tagline" ? "tagline" : "about section";
  const buttonText = hasEnhanced
    ? "Try Again"
    : currentText?.trim()
    ? `Enhance ${label}`
    : `Generate ${label}`;

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleEnhance}
        disabled={isDisabled}
        className={`
          inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
          transition-all duration-200
          ${
            isDisabled
              ? "bg-navy-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-sm hover:shadow"
          }
        `}
      >
        {isEnhancing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enhancing...
          </>
        ) : hasEnhanced ? (
          <>
            <RefreshCw className="w-4 h-4" />
            {buttonText}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {buttonText}
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!storeName.trim() && !error && (
        <p className="text-xs text-gray-500">Complete Step 1 first</p>
      )}
    </div>
  );
}
