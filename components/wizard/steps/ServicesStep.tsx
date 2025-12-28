"use client";

import { useState } from "react";
import { Briefcase, Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { Product } from "@/types/database";
import { useWizard, formatPrice, createEmptyProduct } from "../WizardContext";

export function ServicesStep() {
  const { state, addProduct, updateProductData, removeProduct } = useWizard();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Services use the products table but with different terminology
  const services = state.products;

  const handleAddService = async () => {
    setIsAdding(true);
    const newService = await addProduct({
      ...createEmptyProduct(),
      name: "",
    });
    if (newService) {
      setEditingId(newService.id);
    }
    setIsAdding(false);
  };

  const handleRemoveService = async (id: string) => {
    await removeProduct(id);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const editingService = services.find((p) => p.id === editingId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Briefcase className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Add your services</h2>
        <p className="text-gray-400">
          Add at least one service to continue. Describe what you offer.
        </p>
      </div>

      {/* Service list or editor */}
      <div className="max-w-lg mx-auto">
        {editingService ? (
          <ServiceEditor
            service={editingService}
            onUpdate={(updates) => updateProductData(editingService.id, updates)}
            onSave={() => setEditingId(null)}
            onCancel={() => {
              if (!editingService.name) {
                handleRemoveService(editingService.id);
              }
              setEditingId(null);
            }}
          />
        ) : (
          <>
            {/* Service list */}
            {services.length > 0 && (
              <div className="space-y-3 mb-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={() => setEditingId(service.id)}
                    onRemove={() => handleRemoveService(service.id)}
                  />
                ))}
              </div>
            )}

            {/* Add service button */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleAddService}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {services.length === 0 ? "Add Your First Service" : "Add Another Service"}
            </Button>

            {/* Limit note */}
            <p className="text-center text-sm text-gray-500 mt-4">
              {services.length}/10 services (MVP limit)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Service Card
// =============================================================================

interface ServiceCardProps {
  service: Product;
  onEdit: () => void;
  onRemove: () => void;
}

function ServiceCard({ service, onEdit, onRemove }: ServiceCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-navy-900/50 border border-navy-700 rounded-xl group">
      {/* Drag handle */}
      <GripVertical className="w-5 h-5 text-gray-600 cursor-grab" />

      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-navy-700 flex items-center justify-center flex-shrink-0">
        <Briefcase className="w-6 h-6 text-emerald-400" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {service.name || "Untitled Service"}
        </p>
        <p className="text-sm text-emerald-400">
          {service.price > 0 ? formatPrice(Math.round(service.price * 100)) : "Price not set"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg bg-navy-700 hover:bg-navy-600 text-gray-400 hover:text-white transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg bg-navy-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Service Editor
// =============================================================================

interface ServiceEditorProps {
  service: Product;
  onUpdate: (updates: Partial<Product>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ServiceEditor({
  service,
  onUpdate,
  onSave,
  onCancel,
}: ServiceEditorProps) {
  const handlePriceChange = (value: string) => {
    const dollars = parseFloat(value) || 0;
    onUpdate({ price: dollars });
  };

  const isValid = service.name?.trim() && service.price > 0;

  return (
    <div className="space-y-6 p-6 bg-navy-900/50 border border-navy-700 rounded-xl">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Service Name *
        </label>
        <input
          type="text"
          value={service.name || ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Website Design"
          className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Starting Price *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
          <input
            type="number"
            value={service.price || ""}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full pl-8 pr-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This is the starting price. You can provide quotes for specific projects.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={service.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe what's included in this service..."
          rows={4}
          className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-navy-700">
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!isValid} className="flex-1">
          Save Service
        </Button>
      </div>
    </div>
  );
}
