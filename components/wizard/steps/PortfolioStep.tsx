"use client";

import { useState } from "react";
import { Image, Plus, Trash2, GripVertical, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui";
import type { Product, ProductImage } from "@/types/database";
import { useWizard, createEmptyProduct } from "../WizardContext";
import { uploadProductImage } from "@/lib/supabase";

export function PortfolioStep() {
  const { state, storeId, userId, addProduct, updateProductData, removeProduct } = useWizard();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Portfolio items use the products table
  const portfolioItems = state.products;

  const handleAddItem = async () => {
    setIsAdding(true);
    const newItem = await addProduct({
      ...createEmptyProduct(),
      name: "",
      price: 0, // Portfolio items don't have prices
    });
    if (newItem) {
      setEditingId(newItem.id);
    }
    setIsAdding(false);
  };

  const handleRemoveItem = async (id: string) => {
    await removeProduct(id);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const editingItem = portfolioItems.find((p) => p.id === editingId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Image className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Build your portfolio</h2>
        <p className="text-gray-400">
          Showcase your best work. Add images and descriptions of your projects.
        </p>
      </div>

      {/* Portfolio list or editor */}
      <div className="max-w-lg mx-auto">
        {editingItem ? (
          <PortfolioEditor
            item={editingItem}
            storeId={storeId}
            userId={userId}
            onUpdate={(updates) => updateProductData(editingItem.id, updates)}
            onSave={() => setEditingId(null)}
            onCancel={() => {
              if (!editingItem.name) {
                handleRemoveItem(editingItem.id);
              }
              setEditingId(null);
            }}
          />
        ) : (
          <>
            {/* Portfolio grid */}
            {portfolioItems.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {portfolioItems.map((item) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingId(item.id)}
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))}
              </div>
            )}

            {/* Add item button */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleAddItem}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {portfolioItems.length === 0 ? "Add Your First Project" : "Add Another Project"}
            </Button>

            {/* Limit note */}
            <p className="text-center text-sm text-gray-500 mt-4">
              {portfolioItems.length}/12 portfolio items
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Portfolio Card
// =============================================================================

interface PortfolioCardProps {
  item: Product;
  onEdit: () => void;
  onRemove: () => void;
}

function PortfolioCard({ item, onEdit, onRemove }: PortfolioCardProps) {
  const firstImage = item.images?.[0]?.url;

  return (
    <div className="relative group rounded-xl overflow-hidden bg-navy-900/50 border border-navy-700">
      {/* Image */}
      <div className="aspect-[4/3] bg-navy-800">
        {firstImage ? (
          <img
            src={firstImage}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-gray-600" />
          </div>
        )}
      </div>

      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white text-sm font-medium truncate">
          {item.name || "Untitled Project"}
        </p>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 bg-navy-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={onEdit}
          className="px-3 py-2 rounded-lg bg-navy-700 hover:bg-navy-600 text-white text-sm transition-colors"
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
// Portfolio Editor
// =============================================================================

interface PortfolioEditorProps {
  item: Product;
  storeId: string | undefined;
  userId: string | undefined;
  onUpdate: (updates: Partial<Product>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function PortfolioEditor({
  item,
  storeId,
  userId,
  onUpdate,
  onSave,
  onCancel,
}: PortfolioEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeId || !userId) return;

    setIsUploading(true);
    try {
      const imageIndex = item.images?.length || 0;
      const url = await uploadProductImage(userId, storeId, item.id, file, imageIndex);

      if (url) {
        const newImage: ProductImage = {
          url,
          alt: item.name || "Portfolio image",
          position: imageIndex,
        };
        const currentImages = item.images || [];
        onUpdate({ images: [...currentImages, newImage] });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = (item.images || []).filter((_, i) => i !== index);
    const repositioned = newImages.map((img, i) => ({ ...img, position: i }));
    onUpdate({ images: repositioned });
  };

  const isValid = item.name?.trim();

  return (
    <div className="space-y-6 p-6 bg-navy-900/50 border border-navy-700 rounded-xl">
      {/* Project Image */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project Image
        </label>
        <div className="flex flex-wrap gap-3">
          {(item.images || []).map((img, index) => (
            <div key={index} className="relative w-24 h-24 group">
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {(item.images?.length || 0) < 4 && (
            <label className="w-24 h-24 border-2 border-dashed border-navy-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-navy-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
              ) : (
                <Plus className="w-6 h-6 text-gray-500" />
              )}
            </label>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project Title *
        </label>
        <input
          type="text"
          value={item.name || ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="E-commerce Website Redesign"
          className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={item.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe the project, your role, and the results..."
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
          Save Project
        </Button>
      </div>
    </div>
  );
}
