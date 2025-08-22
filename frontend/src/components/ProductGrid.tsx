import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryName: string;
  imageUrl?: string;
}

interface Props {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductGrid({ products, onEdit, onDelete }: Props) {
  if (products.length === 0) {
    return (
      <p className="text-muted text-sm text-center py-8">No products found.</p>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <article
          key={p.id}
          className="group relative rounded-2xl border border-neutral-800 bg-card/70 backdrop-blur-md p-4 shadow-md transition hover:shadow-lg"
        >
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => onEdit?.(p)}
              className="p-1.5 bg-neutral-800 rounded-full hover:bg-accent text-white"
              aria-label="Edit product"
            >
              <Pencil size={16} />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(p)}
                className="p-1.5 bg-neutral-800 rounded-full hover:bg-red-600 text-white"
                aria-label="Delete product"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {p.imageUrl && (
            <img
              src={p.imageUrl}
              alt={p.name}
              className="rounded-xl mb-4 h-40 w-full object-cover border border-neutral-800"
            />
          )}

          <h3 className="text-lg font-semibold text-light">{p.name}</h3>
          <p className="text-sm text-muted line-clamp-2 mb-2">
            {p.description || "—"}
          </p>

          <div className="flex justify-between items-center text-sm text-muted mt-2">
            <span className="text-accent font-medium">€{p.price.toFixed(2)}</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-xs text-muted">
              {p.categoryName}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
