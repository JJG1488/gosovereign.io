"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Check, X } from "lucide-react";

interface Props {
  storeId: string;
  storeName: string;
}

type DeployState = "idle" | "confirm" | "deploying" | "success" | "error";

export function RedeployButton({ storeId, storeName }: Props) {
  const [state, setState] = useState<DeployState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);

  const handleClick = () => {
    if (state === "idle") {
      setState("confirm");
    }
  };

  const handleConfirm = async () => {
    setState("deploying");
    setError(null);

    try {
      const response = await fetch("/api/platform-admin/redeploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      setDeploymentUrl(data.deploymentUrl);
      setState("success");

      // Reset after 5 seconds
      setTimeout(() => {
        setState("idle");
        setDeploymentUrl(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setState("error");

      // Reset after 5 seconds
      setTimeout(() => {
        setState("idle");
        setError(null);
      }, 5000);
    }
  };

  const handleCancel = () => {
    setState("idle");
  };

  if (state === "confirm") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Redeploy {storeName}?</span>
        <button
          onClick={handleConfirm}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Yes
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          No
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
        Deploying...
      </button>
    );
  }

  if (state === "success") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 text-sm font-medium rounded-lg">
        <Check className="w-4 h-4" />
        Deployed successfully
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg">
        <X className="w-4 h-4" />
        {error || "Failed"}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Redeploy
    </button>
  );
}
