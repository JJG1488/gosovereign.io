"use client";

import { useState } from "react";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  client_name?: string;
  tags?: string[];
}

interface PortfolioGridProps {
  items: PortfolioItem[];
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No portfolio items yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const images = Array.isArray(item.images) ? item.images : [];
          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group text-left bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={images[0] || "/placeholder.jpg"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="aspect-video bg-gray-100">
              <img
                src={(Array.isArray(selectedItem.images) ? selectedItem.images[0] : null) || "/placeholder.jpg"}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedItem.title}
              </h3>
              {selectedItem.client_name && (
                <p className="text-sm text-gray-500 mb-4">Client: {selectedItem.client_name}</p>
              )}
              <div className="prose prose-gray">
                {(selectedItem.description || "").split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-gray-600">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Gallery */}
              {Array.isArray(selectedItem.images) && selectedItem.images.length > 1 && (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {selectedItem.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${selectedItem.title} ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Close */}
              <button
                onClick={() => setSelectedItem(null)}
                className="mt-6 w-full btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
