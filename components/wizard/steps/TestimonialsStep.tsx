"use client";

import { useState } from "react";
import { Quote, Plus, Trash2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui";
import { useWizard } from "../WizardContext";
import { uploadProductImage } from "@/lib/supabase";

// Testimonial type - stored in store.config.testimonials
interface Testimonial {
  id: string;
  name: string;
  quote: string;
  company?: string;
  role?: string;
  photoUrl?: string;
}

export function TestimonialsStep() {
  const { state, storeId, userId, updateConfig } = useWizard();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Testimonials stored in config - parse from store config or use empty array
  // For now, store in local state until we add to WizardLocalConfig
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const handleAddTestimonial = () => {
    setIsAdding(true);
    const newTestimonial: Testimonial = {
      id: `testimonial-${Date.now()}`,
      name: "",
      quote: "",
      company: "",
      role: "",
    };
    setTestimonials([...testimonials, newTestimonial]);
    setEditingId(newTestimonial.id);
    setIsAdding(false);
  };

  const handleRemoveTestimonial = (id: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleUpdateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const editingTestimonial = testimonials.find((t) => t.id === editingId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Quote className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Add testimonials</h2>
        <p className="text-gray-400">
          Showcase what your clients say about your work. This step is optional.
        </p>
      </div>

      {/* Testimonials list or editor */}
      <div className="max-w-lg mx-auto">
        {editingTestimonial ? (
          <TestimonialEditor
            testimonial={editingTestimonial}
            storeId={storeId}
            userId={userId}
            onUpdate={(updates) => handleUpdateTestimonial(editingTestimonial.id, updates)}
            onSave={() => setEditingId(null)}
            onCancel={() => {
              if (!editingTestimonial.name || !editingTestimonial.quote) {
                handleRemoveTestimonial(editingTestimonial.id);
              }
              setEditingId(null);
            }}
          />
        ) : (
          <>
            {/* Testimonials list */}
            {testimonials.length > 0 && (
              <div className="space-y-3 mb-6">
                {testimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    onEdit={() => setEditingId(testimonial.id)}
                    onRemove={() => handleRemoveTestimonial(testimonial.id)}
                  />
                ))}
              </div>
            )}

            {/* Add testimonial button */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleAddTestimonial}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {testimonials.length === 0 ? "Add Your First Testimonial" : "Add Another Testimonial"}
            </Button>

            {/* Optional note */}
            <p className="text-center text-sm text-gray-500 mt-4">
              {testimonials.length}/6 testimonials (optional)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Testimonial Card
// =============================================================================

interface TestimonialCardProps {
  testimonial: Testimonial;
  onEdit: () => void;
  onRemove: () => void;
}

function TestimonialCard({ testimonial, onEdit, onRemove }: TestimonialCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-navy-900/50 border border-navy-700 rounded-xl group">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {testimonial.photoUrl ? (
          <img
            src={testimonial.photoUrl}
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-gray-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {testimonial.name || "Unnamed"}
        </p>
        {(testimonial.role || testimonial.company) && (
          <p className="text-sm text-gray-400 truncate">
            {testimonial.role}
            {testimonial.role && testimonial.company && " at "}
            {testimonial.company}
          </p>
        )}
        <p className="text-sm text-gray-300 mt-1 line-clamp-2">
          "{testimonial.quote || "No quote yet..."}"
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
// Testimonial Editor
// =============================================================================

interface TestimonialEditorProps {
  testimonial: Testimonial;
  storeId: string | undefined;
  userId: string | undefined;
  onUpdate: (updates: Partial<Testimonial>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function TestimonialEditor({
  testimonial,
  storeId,
  userId,
  onUpdate,
  onSave,
  onCancel,
}: TestimonialEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeId || !userId) return;

    setIsUploading(true);
    try {
      // Reuse product image upload for testimonial photos
      const url = await uploadProductImage(userId, storeId, testimonial.id, file, 0);
      if (url) {
        onUpdate({ photoUrl: url });
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isValid = testimonial.name?.trim() && testimonial.quote?.trim();

  return (
    <div className="space-y-6 p-6 bg-navy-900/50 border border-navy-700 rounded-xl">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Photo (optional)
        </label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center overflow-hidden">
            {testimonial.photoUrl ? (
              <img
                src={testimonial.photoUrl}
                alt={testimonial.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <label className="px-4 py-2 border border-navy-600 rounded-lg text-gray-400 hover:text-white hover:border-navy-500 cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? "Uploading..." : "Upload Photo"}
          </label>
          {testimonial.photoUrl && (
            <button
              onClick={() => onUpdate({ photoUrl: undefined })}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Name *
        </label>
        <input
          type="text"
          value={testimonial.name || ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Jane Smith"
          className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          autoFocus
        />
      </div>

      {/* Role & Company */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Role
          </label>
          <input
            type="text"
            value={testimonial.role || ""}
            onChange={(e) => onUpdate({ role: e.target.value })}
            placeholder="CEO"
            className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company
          </label>
          <input
            type="text"
            value={testimonial.company || ""}
            onChange={(e) => onUpdate({ company: e.target.value })}
            placeholder="Acme Inc."
            className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Quote */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Testimonial Quote *
        </label>
        <textarea
          value={testimonial.quote || ""}
          onChange={(e) => onUpdate({ quote: e.target.value })}
          placeholder="Working with them was an amazing experience. They delivered exactly what we needed..."
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
          Save Testimonial
        </Button>
      </div>
    </div>
  );
}
