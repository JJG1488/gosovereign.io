"use client";

import { useState, useRef } from "react";
import { Image, Upload, Type, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "../WizardContext";
import { uploadLogo } from "@/lib/supabase";

export function LogoStep() {
  const { state, storeId, userId, updateConfig } = useWizard();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    if (!storeId || !userId) {
      console.error("Missing storeId or userId for logo upload");
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadLogo(userId, storeId, file);
      if (url) {
        updateConfig({ logoUrl: url, useTextLogo: false });
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeLogo = () => {
    updateConfig({ logoUrl: undefined, useTextLogo: true });
  };

  const useTextLogo = () => {
    updateConfig({ logoUrl: undefined, useTextLogo: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Image className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Add your logo</h2>
        <p className="text-gray-400">
          Upload an image or use your store name as a text logo.
        </p>
      </div>

      {/* Options */}
      <div className="max-w-md mx-auto space-y-4">
        {/* Upload area */}
        {!state.config.logoUrl && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              dragActive
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-navy-600 hover:border-navy-500 bg-navy-900/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-gray-400">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">
                  Drop your logo here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse (PNG, JPG, SVG)
                </p>
              </>
            )}
          </div>
        )}

        {/* Logo preview */}
        {state.config.logoUrl && (
          <div className="relative border border-navy-600 rounded-xl p-6 bg-navy-900/50">
            <button
              onClick={removeLogo}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-navy-700 hover:bg-navy-600 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center">
              <img
                src={state.config.logoUrl}
                alt="Store logo"
                className="max-h-24 max-w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-navy-700" />
          <span className="text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-navy-700" />
        </div>

        {/* Text logo option */}
        <button
          onClick={useTextLogo}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
            state.config.useTextLogo && !state.config.logoUrl
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-navy-600 hover:border-navy-500 bg-navy-900/50"
          )}
        >
          <div className="w-12 h-12 rounded-lg bg-navy-700 flex items-center justify-center">
            <Type className="w-6 h-6 text-gray-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-white">Use text logo</p>
            <p className="text-sm text-gray-400">
              Display "{state.config.storeName || "Store Name"}" as your logo
            </p>
          </div>
        </button>
      </div>

      {/* Preview */}
      <div className="max-w-md mx-auto mt-8 p-4 bg-navy-900/50 rounded-xl border border-navy-700">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Header Preview
        </p>
        <div className="flex items-center justify-between py-2 px-4 bg-navy-800 rounded-lg">
          <div className="flex items-center gap-3">
            {state.config.logoUrl ? (
              <img
                src={state.config.logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {state.config.storeName || "Store Name"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Shop</span>
            <span>About</span>
            <span>Cart</span>
          </div>
        </div>
      </div>
    </div>
  );
}
