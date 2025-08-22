import React, { useEffect, useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import { Trophy, Package, Euro } from "lucide-react";

interface OrderItemDTO {
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    [key: string]: any;
  };
}

export interface OrderDTO {
  id: number;
  createdAt: string;
  total: number;
  items: OrderItemDTO[];
}

type AccumulatedProduct = {
  name: string;
  sold: number;
  revenue: number;
};

function accumulateProductsByName(orders: OrderDTO[]) {
  const map = new Map<string, AccumulatedProduct>();
  let grand = 0;

  orders.forEach((order) => {
    grand += order.total;
    order.items.forEach(({ product, quantity }) => {
      const prev = map.get(product.name) ?? {
        name: product.name,
        sold: 0,
        revenue: 0,
      };

      map.set(product.name, {
        name: product.name,
        sold: prev.sold + quantity,
        revenue: prev.revenue + product.price * quantity,
      });
    });
  });

  return {
    list: Array.from(map.values()).sort((a, b) => b.sold - a.sold),
    grand,
  };
}

const RevenuePage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/orders/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: OrderDTO[]) => setOrders(data))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        toast.error(`Orders load failed: ${msg}`);
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  const { list: products, grand } = useMemo(
    () => accumulateProductsByName(orders),
    [orders]
  );

  const totalOrders = orders.length;
  const avg = totalOrders ? grand / totalOrders : 0;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" limit={1} />
      <PageHeader
        title="Revenue Dashboard"
        subtitle="Performance insights & top-selling products"
      />

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-xl border border-neutral-700 hover:border-accent transition">
            <Euro className="mx-auto mb-2 text-accent" size={28} />
            <p className="text-sm text-muted mb-1">Revenue</p>
            <p className="text-2xl font-bold text-light">€{grand.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-xl border border-neutral-700 hover:border-accent transition">
            <Package className="mx-auto mb-2 text-yellow-500" size={28} />
            <p className="text-sm text-muted mb-1">Orders</p>
            <p className="text-2xl font-bold text-light">{totalOrders}</p>
          </div>
          <div className="p-4 rounded-xl border border-neutral-700 hover:border-accent transition">
            <Trophy className="mx-auto mb-2 text-green-500" size={28} />
            <p className="text-sm text-muted mb-1">Avg. Order</p>
            <p className="text-2xl font-bold text-light">€{avg.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Product Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Top-Selling Products</h2>

        {loading && <p className="text-muted">Loading...</p>}
        {error && !loading && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="overflow-auto rounded-lg border border-neutral-800">
            <table className="w-full table-auto text-left">
              <thead>
                <tr className="bg-neutral-800/50 text-sm text-muted">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Units Sold</th>
                  <th className="py-3 px-4">Revenue (€)</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-muted text-center">
                      No products sold.
                    </td>
                  </tr>
                )}
                {products.map((p, i) => (
                  <tr
                    key={p.name + i}
                    className="border-t border-neutral-800 hover:bg-neutral-800/30 transition"
                  >
                    <td className="py-3 px-4 text-muted">{i + 1}</td>
                    <td className="py-3 px-4 text-light">{p.name}</td>
                    <td className="py-3 px-4">{p.sold}</td>
                    <td className="py-3 px-4 font-medium">€{p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RevenuePage;
