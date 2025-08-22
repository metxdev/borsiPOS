import React from "react";
import PriceBadge from "./PriceBadge";

type Item = {
  id: number;
  name: string;
  price: number;
  predictedPrice?: number | null;
  priceChange?: number | null;
  priceUp?: boolean | null;
};

export default function ProductRow({ item }: { item: Item }) {
  const rowBase =
    "flex items-center justify-between rounded-lg border px-3 py-2";
  const rowCls = [rowBase, "border-neutral-800 bg-neutral-900"].join(" ");

  return (
    <div className={rowCls}>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-light truncate">{item.name}</div>
        <div className="text-xs text-muted">
          Now: €{item.price.toFixed(2)}
          {item.predictedPrice != null && (
            <span className="ml-2">
              • Next: €{item.predictedPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <PriceBadge change={item.priceChange ?? 0} up={item.priceUp ?? false} />
      </div>
    </div>
  );
}
