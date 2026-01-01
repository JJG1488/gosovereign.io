"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Check, X } from "lucide-react";

interface Props {
  deployedCount: number;
}

interface RedeployResult {
  storeId: string;
  storeName: string;
  success: boolean;
  deploymentUrl?: string;
  error?: string;
}

type DeployState = "idle" | "confirm" | "deploying" | "success" | "error";

export function RedeployAllButton({ deployedCount }: Props) {
  const [state, setState] = useState<DeployState>("idle");
  const [results, setResults] = useState<RedeployResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleClick = () => {
    if (state === "idle" && deployedCount > 0) {
      setState("confirm");
    }
  };

  const handleConfirm = async () => {
    setState("deploying");
    setResults([]);

    try {
      const response = await fetch("/api/platform-admin/redeploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      setResults(data.results || []);
      setState(data.failed > 0 ? "error" : "success");
      setShowResults(true);
    } catch (err) {
      setState("error");
    }
  };

  const handleCancel = () => {
    setState("idle");
  };

  const handleDismiss = () => {
    setState("idle");
    setShowResults(false);
    setResults([]);
  };

  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  if (state === "confirm") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">
          Redeploy all {deployedCount} stores?
        </span>
        <button
          onClick={handleConfirm}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Yes, redeploy all
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (state === "deploying") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 text-sm font-medium rounded-lg cursor-not-allowed"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Redeploying {deployedCount} stores...
      </button>
    );
  }

  if (showResults && (state === "success" || state === "error")) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 ${
              state === "success"
                ? "bg-emerald-600/20 text-emerald-400"
                : "bg-amber-600/20 text-amber-400"
            } text-sm font-medium rounded-lg`}
          >
            {state === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {successCount} succeeded, {failedCount} failed
          </div>
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>

        {failedCount > 0 && (
          <div className="text-sm text-red-400">
            <p className="font-medium mb-1">Failed stores:</p>
            <ul className="list-disc list-inside">
              {results
                .filter((r) => !r.success)
                .map((r) => (
                  <li key={r.storeId}>
                    {r.storeName}: {r.error}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={deployedCount === 0}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        deployedCount === 0
          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700 text-white"
      }`}
    >
      <RefreshCw className="w-4 h-4" />
      Redeploy All ({deployedCount})
    </button>
  );
}
