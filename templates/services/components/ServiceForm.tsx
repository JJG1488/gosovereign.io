"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, X, Plus } from "lucide-react";
import type { Service } from "@/data/services";

interface ServiceFormProps {
  service?: Service;
  isNew?: boolean;
}

export function ServiceForm({ service, isNew = false }: ServiceFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: service?.name || "",
    slug: service?.slug || "",
    short_description: service?.short_description || "",
    description: service?.description || "",
    price: service?.price ? (service.price / 100).toString() : "",
    price_type: service?.price_type || "fixed",
    duration: service?.duration || "",
    icon: service?.icon || "",
    features: service?.features || [],
    category: service?.category || "",
    is_featured: service?.is_featured || false,
    is_active: service?.is_active !== false,
    seo_title: service?.seo_title || "",
    seo_description: service?.seo_description || "",
  });

  const [newFeature, setNewFeature] = useState("");

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleNameChange(name: string) {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isNew ? generateSlug(name) : prev.slug,
    }));
  }

  function addFeature() {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  }

  function removeFeature(index: number) {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      const url = isNew
        ? "/api/admin/services"
        : "/api/admin/services/" + service?.id;

      const body = {
        ...formData,
        price: formData.price ? Math.round(parseFloat(formData.price) * 100) : null,
      };

      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save service");
      }

      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this service?")) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/services/" + service?.id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) throw new Error("Failed to delete service");

      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="e.g., Roof Repair"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="roof-repair"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData((prev) => ({ ...prev, short_description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Brief description for cards and listings"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Detailed description of the service"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Type
            </label>
            <select
              value={formData.price_type}
              onChange={(e) => setFormData((prev) => ({ ...prev, price_type: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="fixed">Fixed Price</option>
              <option value="starting_at">Starting At</option>
              <option value="hourly">Hourly Rate</option>
              <option value="custom">Contact for Pricing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="0.00"
              disabled={formData.price_type === "custom"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="e.g., 2-4 hours"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Features</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="Add a feature..."
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {formData.features.length > 0 && (
            <ul className="space-y-2">
              {formData.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Status</h2>
        
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="w-5 h-5 text-brand focus:ring-brand rounded"
            />
            <span className="text-gray-700">Active (visible on site)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
              className="w-5 h-5 text-brand focus:ring-brand rounded"
            />
            <span className="text-gray-700">Featured</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <Trash2 className="w-5 h-5" />
              {deleting ? "Deleting..." : "Delete Service"}
            </button>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-brand text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : isNew ? "Create Service" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
