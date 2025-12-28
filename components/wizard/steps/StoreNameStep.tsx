"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Store, Check, X, Loader2 } from "lucide-react";
import { useWizard } from "../WizardContext";
import { slugifyStoreName } from "@/lib/slugify";
import { createClient } from "@/lib/supabase/client";

type SubdomainStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function StoreNameStep() {
  const { state, updateConfig, storeId } = useWizard();
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>("idle");
  const [subdomain, setSubdomain] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const lastSavedSubdomain = useRef<string>("");

  // Debounced subdomain check
  const checkSubdomain = useCallback(async (storeName: string) => {
    if (!storeName || storeName.length < 2) {
      setSubdomainStatus("idle");
      setSubdomain("");
      setErrorMessage("");
      return;
    }

    const slug = slugifyStoreName(storeName);
    setSubdomain(slug);

    if (slug.length < 3) {
      setSubdomainStatus("invalid");
      setErrorMessage("Store name must result in at least 3 characters");
      return;
    }

    setSubdomainStatus("checking");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/subdomain/check?subdomain=${encodeURIComponent(slug)}`);
      const data = await res.json();

      if (data.available) {
        setSubdomainStatus("available");
        setErrorMessage("");
      } else {
        setSubdomainStatus("taken");
        setErrorMessage(data.error || "This subdomain is already taken");
      }
    } catch {
      // On error, assume available (will be checked again at store creation)
      setSubdomainStatus("available");
    }
  }, []);

  // Debounce the check
  useEffect(() => {
    const storeName = state.config.storeName || "";

    if (!storeName) {
      setSubdomainStatus("idle");
      setSubdomain("");
      return;
    }

    // Immediately show the slugified version
    setSubdomain(slugifyStoreName(storeName));
    setSubdomainStatus("checking");

    const timeout = setTimeout(() => {
      checkSubdomain(storeName);
    }, 500);

    return () => clearTimeout(timeout);
  }, [state.config.storeName, checkSubdomain]);

  // Update subdomain in database when available
  const updateSubdomainInDb = useCallback(async () => {
    if (subdomainStatus !== "available" || !subdomain || !storeId) return;
    if (subdomain === lastSavedSubdomain.current) return; // Skip if already saved

    const supabase = createClient();
    const { error } = await supabase
      .from("stores")
      .update({ subdomain })
      .eq("id", storeId);

    if (error) {
      console.error("Failed to update subdomain:", error);
    } else {
      lastSavedSubdomain.current = subdomain;
    }
  }, [subdomain, subdomainStatus, storeId]);

  // Persist subdomain when it becomes available
  useEffect(() => {
    if (subdomainStatus === "available" && subdomain) {
      updateSubdomainInDb();
    }
  }, [subdomainStatus, subdomain, updateSubdomainInDb]);

  const getStatusIcon = () => {
    switch (subdomainStatus) {
      case "checking":
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
      case "available":
        return <Check className="w-5 h-5 text-emerald-400" />;
      case "taken":
      case "invalid":
        return <X className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (subdomainStatus) {
      case "available":
        return "border-emerald-500/50 bg-emerald-500/5";
      case "taken":
      case "invalid":
        return "border-red-500/50 bg-red-500/5";
      default:
        return "border-navy-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Store className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          What's your store called?
        </h2>
        <p className="text-gray-400">
          This will be displayed in your store header and used for your URL.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-md mx-auto">
        <label htmlFor="storeName" className="sr-only">
          Store Name
        </label>
        <input
          id="storeName"
          type="text"
          value={state.config.storeName ?? ""}
          onChange={(e) => updateConfig({ storeName: e.target.value })}
          placeholder="My Awesome Store"
          className="w-full px-4 py-4 text-lg bg-navy-900 border border-navy-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          autoFocus
        />

        {/* Subdomain Preview with Availability Status */}
        {subdomain && (
          <div className={`mt-3 p-3 rounded-lg border transition-colors ${getStatusColor()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Your store URL:</span>
                <span className="text-sm font-mono text-white">
                  {subdomain}.gosovereign.io
                </span>
              </div>
              {getStatusIcon()}
            </div>
            {errorMessage && (
              <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
            )}
            {subdomainStatus === "available" && (
              <p className="mt-2 text-sm text-emerald-400">
                This subdomain is available!
              </p>
            )}
          </div>
        )}

        <p className="mt-2 text-sm text-gray-500 text-center">
          You can always change this later
        </p>
      </div>

      {/* Preview */}
      {state.config.storeName && (
        <div className="max-w-md mx-auto mt-8 p-4 bg-navy-900/50 rounded-xl border border-navy-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Store Header Preview
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-lg">
                {state.config.storeName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xl font-semibold text-white">
              {state.config.storeName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
