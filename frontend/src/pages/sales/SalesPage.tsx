import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProducts } from "@/store/product/productAction";
import { fetchCategories } from "@/store/category/categoryAction";
import { placeOrder } from "@/store/order/orderAction";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "@/components/PageHeader";
import CategoryCard from "@/components/CategoryCard";
import SalesProductCard, { ProductItemExtended } from "@/components/SalesProductCard";
import CartModal from "@/components/CartModal";

interface CartItem {
  product: ProductItemExtended;
  quantity: number;
}

const categoryColors: Record<string, string> = {
  cocktails: "bg-purple-500/20",
  shots: "bg-red-500/20",
  beers: "bg-yellow-500/20",
  beverages: "bg-blue-500/20",
  default: "bg-neutral-800/50",
};

export default function SalesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { products: rawProducts = [], loading: productsLoading } = useSelector((s: RootState) => s.product);
  const { categories = [] } = useSelector((s: RootState) => s.category);

  const products = useMemo(
    () => (Array.isArray(rawProducts) ? rawProducts as ProductItemExtended[] : []),
    [rawProducts]
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const add = useCallback((p: ProductItemExtended) => {
    setCart((prev) => {
      const hit = prev.find((c) => c.product.id === p.id);
      if (hit) {
        return prev.map((c) =>
          c.product.id === p.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      setOrder((o) => (o.includes(p.id) ? o : [...o, p.id]));
      return [...prev, { product: p, quantity: 1 }];
    });
  }, []);

  const decrement = useCallback((productId: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === productId
            ? { ...c, quantity: Math.max(1, c.quantity - 1) }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setOrder([]);
  }, []);

  useEffect(() => {
    setOrder((prev) => prev.filter((id) => cart.some((c) => c.product.id === id)));
  }, [cart]);

  const totalItems = useMemo(() => cart.reduce((s, c) => s + c.quantity, 0), [cart]);
  const totalPrice = useMemo(
    () => cart.reduce((s, c) => s + c.quantity * (c.product.price ?? 0), 0).toFixed(2),
    [cart]
  );

  const ordered = useMemo(
    () =>
      order
        .map((id) => cart.find((c) => c.product.id === id))
        .filter((c): c is CartItem => !!c),
    [order, cart]
  );

  const checkout = useCallback(async () => {
    if (!cart.length) return;
    setBusy(true);
    try {
      const itemsPayload = cart.map((c) => ({
        quantity: c.quantity,
        product: { id: c.product.id },
      }));

      const result = await dispatch(placeOrder({ items: itemsPayload }));
      if (placeOrder.rejected.match(result)) {
        throw new Error(result.payload || "Order failed");
      }

      await dispatch(fetchProducts());
      clearCart();
      setOpen(false);
      toast.success("Order successful!");
    } catch (e) {
      toast.error("Failed to place order: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [cart, dispatch, clearCart]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter(
      (p) => p.categoryName.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [products, activeCategory]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ca = a.categoryName.toLowerCase();
      const cb = b.categoryName.toLowerCase();
      return ca !== cb ? ca.localeCompare(cb) : a.name.localeCompare(b.name);
    });
  }, [filtered]);

  const countBy = useCallback(
    (cat: string) =>
      products.filter((p) => p.categoryName.toLowerCase() === cat.toLowerCase()).length,
    [products]
  );

  return (
    <div className="h-screen flex overflow-hidden">
      <ToastContainer position="top-right" limit={1} />

      {/* LEFT SIDE */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <PageHeader title="Sales" subtitle="Tap a product to add it to the cart" />

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 shrink-0">
          <CategoryCard
            name="All"
            count={products.length}
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              count={countBy(cat.name)}
              active={activeCategory.toLowerCase() === cat.name.toLowerCase()}
              onClick={() => setActiveCategory(cat.name)}
            />
          ))}
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto pb-4">
          {productsLoading && filtered.length === 0 ? (
            <p className="text-muted">Loading products...</p>
          ) : !productsLoading && filtered.length === 0 ? (
            <p className="text-muted">No products available.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {sorted.map((p) => {
                const catKey = p.categoryName.toLowerCase();
                const bg = categoryColors[catKey] || categoryColors.default;
                return (
                  <SalesProductCard
                    key={p.id}
                    product={p}
                    onAdd={add}
                    bgColor={bg}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE - FULL HEIGHT ORDER PANEL */}
      <div className="w-96 bg-card border-l border-neutral-800 flex flex-col">
        <h2 className="text-lg font-semibold p-4 border-b border-neutral-800">
          Current Order
        </h2>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {ordered.length === 0 && (
            <p className="text-muted text-sm">No items in cart</p>
          )}
          {ordered.map((item) => {
            const catKey = item.product.categoryName.toLowerCase();
            const bg = categoryColors[catKey] || categoryColors.default;
            return (
              <div
                key={item.product.id}
                className={`flex items-center justify-between p-3 rounded-lg ${bg}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-neutral-400">{item.product.categoryName}</p>
                  <p className="text-xs text-accent font-semibold">
                    €{item.product.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => decrement(item.product.id)}
                    className="px-2 py-1 bg-neutral-800 rounded text-sm"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => add(item.product)}
                    className="px-2 py-1 bg-neutral-800 rounded text-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-neutral-800 shrink-0">
            <div className="flex justify-between mb-3 text-sm">
              <span>Total ({totalItems} items)</span>
              <span className="font-semibold">€{totalPrice}</span>
            </div>
            <button
              onClick={checkout}
              disabled={busy}
              className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
