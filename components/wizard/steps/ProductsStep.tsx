"use client";

import { useState } from "react";
import { Package, Plus, Trash2, ImagePlus, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { Product, ProductImage } from "@/types/database";
import { useWizard, formatPrice, createEmptyProduct } from "../WizardContext";
import { uploadProductImage } from "@/lib/supabase";

export function ProductsStep() {
  const { state, storeId, userId, addProduct, updateProductData, removeProduct } = useWizard();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const products = state.products;

  const handleAddProduct = async () => {
    setIsAdding(true);
    const newProduct = await addProduct(createEmptyProduct());
    if (newProduct) {
      setEditingId(newProduct.id);
    }
    setIsAdding(false);
  };

  const handleRemoveProduct = async (id: string) => {
    await removeProduct(id);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const editingProduct = products.find((p) => p.id === editingId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Package className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Add your products</h2>
        <p className="text-gray-400">
          Add at least one product to continue. You can add more later.
        </p>
      </div>

      {/* Product list or editor */}
      <div className="max-w-lg mx-auto">
        {editingProduct ? (
          <ProductEditor
            product={editingProduct}
            storeId={storeId}
            userId={userId}
            onUpdate={(updates) => updateProductData(editingProduct.id, updates)}
            onSave={() => setEditingId(null)}
            onCancel={() => {
              if (!editingProduct.name) {
                handleRemoveProduct(editingProduct.id);
              }
              setEditingId(null);
            }}
          />
        ) : (
          <>
            {/* Product list */}
            {products.length > 0 && (
              <div className="space-y-3 mb-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={() => setEditingId(product.id)}
                    onRemove={() => handleRemoveProduct(product.id)}
                  />
                ))}
              </div>
            )}

            {/* Add product button */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleAddProduct}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {products.length === 0 ? "Add Your First Product" : "Add Another Product"}
            </Button>

            {/* Limit note */}
            <p className="text-center text-sm text-gray-500 mt-4">
              {products.length}/10 products (MVP limit)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Product Card
// =============================================================================

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onRemove: () => void;
}

function ProductCard({ product, onEdit, onRemove }: ProductCardProps) {
  const firstImage = product.images?.[0]?.url;

  return (
    <div className="flex items-center gap-4 p-4 bg-navy-900/50 border border-navy-700 rounded-xl group">
      {/* Drag handle */}
      <GripVertical className="w-5 h-5 text-gray-600 cursor-grab" />

      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-navy-700 flex items-center justify-center overflow-hidden flex-shrink-0">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImagePlus className="w-6 h-6 text-gray-500" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {product.name || "Untitled Product"}
        </p>
        <p className="text-sm text-emerald-400">
          {formatPrice(Math.round(product.price * 100))}
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
// Product Editor
// =============================================================================

interface ProductEditorProps {
  product: Product;
  storeId: string | undefined;
  userId: string | undefined;
  onUpdate: (updates: Partial<Product>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function ProductEditor({
  product,
  storeId,
  userId,
  onUpdate,
  onSave,
  onCancel,
}: ProductEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeId || !userId) return;

    setIsUploading(true);
    try {
      const imageIndex = product.images?.length || 0;
      const url = await uploadProductImage(userId, storeId, product.id, file, imageIndex);

      if (url) {
        const newImage: ProductImage = {
          url,
          alt: product.name || "Product image",
          position: imageIndex,
        };
        const currentImages = product.images || [];
        onUpdate({ images: [...currentImages, newImage] });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = (product.images || []).filter((_, i) => i !== index);
    // Update positions
    const repositioned = newImages.map((img, i) => ({ ...img, position: i }));
    onUpdate({ images: repositioned });
  };

  const handlePriceChange = (value: string) => {
    // Store price as decimal (dollars)
    const dollars = parseFloat(value) || 0;
    onUpdate({ price: dollars });
  };

  const isValid = product.name?.trim() && product.price > 0;

  return (
    <div className="space-y-6 p-6 bg-navy-900/50 border border-navy-700 rounded-xl">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Product Name *
        </label>
        <input
          type="text"
          value={product.name || ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Premium Widget"
          className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Price *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
          <input
            type="number"
            value={product.price || ""}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full pl-8 pr-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={product.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe your product..."
          rows={3}
          className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Images
        </label>
        <div className="flex flex-wrap gap-3">
          {(product.images || []).map((img, index) => (
            <div key={index} className="relative w-20 h-20 group">
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
          {(product.images?.length || 0) < 4 && (
            <label className="w-20 h-20 border-2 border-dashed border-navy-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-navy-500 transition-colors">
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

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-navy-700">
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!isValid} className="flex-1">
          Save Product
        </Button>
      </div>
    </div>
  );
}
