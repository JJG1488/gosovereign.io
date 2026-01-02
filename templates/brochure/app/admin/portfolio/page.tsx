"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, Pencil, Trash2, GripVertical } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  client_name?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await fetch("/api/admin/portfolio");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to load portfolio items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const toggleActive = async (item: PortfolioItem) => {
    try {
      const res = await fetch(`/api/admin/portfolio/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, is_active: !item.is_active }),
      });
      if (res.ok) {
        setItems(
          items.map((i) =>
            i.id === item.id ? { ...i, is_active: !i.is_active } : i
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle item:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600 mt-1">Manage your portfolio items</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No portfolio items yet
            </h3>
            <p className="text-gray-500 mb-6">
              Add your first portfolio item to showcase your work.
            </p>
            <Link
              href="/admin/portfolio/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Item
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50"
            >
              <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />

              {/* Thumbnail */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {item.title}
                </h3>
                {item.client_name && (
                  <p className="text-sm text-gray-500">Client: {item.client_name}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {item.is_featured && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                      Featured
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.is_active ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(item)}
                  className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.is_active ? "Hide" : "Show"}
                </button>
                <Link
                  href={`/admin/portfolio/${item.id}`}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
