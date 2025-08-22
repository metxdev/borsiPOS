import React from "react";

export interface ProductItemExtended {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryName: string;
  salesCount?: number;
  imageUrl?: string;
  priceUp?: boolean;
}

interface SalesProductCardProps {
  product: ProductItemExtended;
  onAdd: (p: ProductItemExtended) => void;
  bgColor?: string;
}

const SalesProductCard: React.FC<SalesProductCardProps> = ({ product, onAdd, bgColor }) => {
  return (
    <button
      onClick={() => onAdd(product)}
      className={`h-28 w-full flex flex-col justify-center items-center rounded-lg border border-neutral-700 hover:border-accent active:scale-95 transition text-white ${bgColor || "bg-neutral-900"}`}
    >
      <span className="text-sm font-semibold text-center line-clamp-2 px-1">
        {product.name}
      </span>
      <span className="text-lg font-bold mt-1">
        €{product.price.toFixed(2)}
      </span>
    </button>
  );
};

export default React.memo(SalesProductCard);
