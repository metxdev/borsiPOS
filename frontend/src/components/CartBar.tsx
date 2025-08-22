interface Props {
  totalItems: number;
  totalPrice: string;
  onClear: () => void;
  onReview: () => void;
  busy: boolean;
}

export default function CartBar({
  totalItems,
  totalPrice,
  onClear,
  onReview,
  busy,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-t border-neutral-800 px-6 py-4 flex items-center justify-between">
      <div className="text-light text-sm">
        <span className="font-medium">
          {totalItems} item{totalItems !== 1 && "s"}
        </span>{" "}
        · <span className="text-accent">€{totalPrice}</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClear}
          className="text-sm text-muted hover:text-white transition"
        >
          Clear cart
        </button>

        <button
          onClick={onReview}
          disabled={busy}
          className="bg-accent text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {busy ? "Processing..." : "Review & Checkout"}
        </button>
      </div>
    </div>
  );
}
