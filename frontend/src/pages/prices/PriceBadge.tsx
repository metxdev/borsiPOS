import React from "react";

type Props = { change?: number | null; up?: boolean | null };

export default function PriceBadge({ change, up }: Props) {
  const isZero = !change || change === 0;
  const base =
    "px-2 py-0.5 rounded text-xs font-medium border inline-flex items-center gap-1";
  const cls = [
    base,
    isZero && "text-muted border-neutral-800 bg-transparent",
    !isZero && up && "text-green-400 border-green-500/30 bg-green-500/10",
    !isZero && !up && "text-red-400 border-red-500/30 bg-red-500/10",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls}>
      {isZero ? "0.00 €" : `${change! > 0 ? "+" : ""}${change?.toFixed(2)} €`}
    </span>
  );
}
