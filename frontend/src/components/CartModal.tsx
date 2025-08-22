import { Trash2 } from "lucide-react";
import { ProductItemExtended } from "@/components/SalesProductCard";

interface CartItem {
  product: ProductItemExtended;
  quantity: number;
}

interface Props {
  cart: CartItem[];
  totalPrice: string;
  onClose: () => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
  checkout: () => void;
  busy: boolean;
}

export default function CartModal({
  cart,
  totalPrice,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  checkout,
  busy,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-xl shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-lg font-semibold text-light">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <p className="text-muted text-sm">Your cart is empty.</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto space-y-4 pr-1">
            {cart.map((c) => (
              <li
                key={c.product.id}
                className="border-b border-neutral-800 pb-2 last:border-none"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-light text-sm font-medium">
                    {c.quantity}× {c.product.name}
                  </span>
                  <span className="text-sm text-muted">
                    €{(c.product.price ?? 0).toFixed(2)} each
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDecrement(c.product.id)}
                      className="w-6 h-6 bg-neutral-800 hover:bg-neutral-700 rounded-full text-white text-xs"
                      aria-label="Decrement"
                    >
                      −
                    </button>
                    <button
                      onClick={() => onIncrement(c.product.id)}
                      className="w-6 h-6 bg-neutral-800 hover:bg-neutral-700 rounded-full text-white text-xs"
                      aria-label="Increment"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemove(c.product.id)}
                      className="p-1 text-red-500 hover:text-red-400"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-light font-medium">
                    €{((c.product.price ?? 0) * c.quantity).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
          <span className="text-light font-medium">Total:</span>
          <span className="text-accent font-semibold text-lg">€{totalPrice}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="text-muted text-sm hover:text-white"
          >
            Close
          </button>
          <button
            onClick={checkout}
            disabled={busy || cart.length === 0}
            className="bg-accent text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {busy ? "Processing…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
