"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

// ---- Types from your API
type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  salesCount?: number | null;
  categoryId?: number | null;
  categoryName?: string | null;
  lastSaleAt?: string | null;
  priceChange?: number | null;
  priceUp?: boolean | null;
  predictedPrice?: number | null;
};

type OrderItem = {
  quantity: number;
  product: { id: number; name: string; price: number };
};
type Order = {
  id: number;
  createdAt: string;
  total: number;
  items: OrderItem[];
};

type Point = { t: number; price?: number; forecast?: number };

const fmtMoney = (v: number | null | undefined) => `€${Number(v ?? 0).toFixed(2)}`;
const by = <T,>(get: (x: T) => any) => (a: T, b: T) => (get(a) > get(b) ? 1 : get(a) < get(b) ? -1 : 0);

// ---- Sponsor assets (replace with your real public paths)
const SPONSORS = [
  { name: "Saku", src: "/sponsors/saku.png" },
  { name: "A. Le Coq", src: "/sponsors/alecoq.png" },
  { name: "Kalev", src: "/sponsors/kalev.png" },
  { name: "Põhjala", src: "/sponsors/pohjala.png" },
];

const PricesPage: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // selection + rotation
  const [selIdx, setSelIdx] = useState(0);
  const sel = products[selIdx] ?? null;

  const [autoPlay, setAutoPlay] = useState(true);
  const rotRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

  // ---- Fetch + poll (every minute)
  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    const load = async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          fetch(`${API_BASE}/api/products/my`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/orders/my`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [pData, oData] = (await Promise.all([pRes.json(), oRes.json()])) as [Product[], Order[]];

        const safeProducts = Array.isArray(pData) ? pData : [];
        setProducts(safeProducts);
        setOrders(Array.isArray(oData) ? oData : []);

        // keep selection if still valid, else pick best-seller
        setSelIdx((prev) => {
          const curId = safeProducts[prev]?.id;
          const still = curId ? safeProducts.findIndex((x) => x.id === curId) : -1;
          if (still !== -1) return still;
          if (!safeProducts.length) return 0;
          const bestId = safeProducts
            .slice()
            .sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0))[0].id;
          const idx = safeProducts.findIndex((p) => p.id === bestId);
          return idx === -1 ? 0 : idx;
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    load();
    pollRef.current = window.setInterval(load, 60_000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [API_BASE]);

  // ---- Auto rotate selection (TV mode)
  useEffect(() => {
    if (!autoPlay || products.length <= 1) return;
    rotRef.current = window.setInterval(() => {
      setSelIdx((i) => (i + 1) % products.length);
    }, 6000);
    return () => {
      if (rotRef.current) window.clearInterval(rotRef.current);
    };
  }, [autoPlay, products.length]);

  // ---- Grouped board on the left (big tiles)
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = (p.categoryName || "Other").toUpperCase();
      map.set(key, [...(map.get(key) || []), p]);
    }
    const preferred = ["COCKTAILS", "SHOTS", "BEERS", "BEVERAGES"];
    return Array.from(map.entries())
      .sort((a, b) => {
        const ai = preferred.indexOf(a[0]);
        const bi = preferred.indexOf(b[0]);
        if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        return a[0].localeCompare(b[0]);
      })
      .map(([k, v]) => [k, v.sort(by<Product>((x) => x.name))]) as [string, Product[]][];
  }, [products]);

  // ---- History series from orders
  const history: Point[] = useMemo(() => {
    if (!sel) return [];
    const pts: Point[] = [];
    orders.forEach((o) => {
      const t = new Date(o.createdAt).getTime();
      o.items.forEach((it) => {
        if (it.product.id === sel.id) {
          pts.push({ t, price: Number(it.product.price) });
        }
      });
    });

    // ensure we always have a "current" anchor for flat/idle items
    const nowT = Date.now();
    if (!pts.length || nowT - pts[pts.length - 1].t > 55_000) {
      pts.push({
        t: sel.lastSaleAt ? new Date(sel.lastSaleAt).getTime() : nowT,
        price: Number(sel.price),
      });
    }

    pts.sort(by<Point>((p) => p.t));
    // remove exact dupe timestamps
    const dedup: Point[] = [];
    let lastT: number | null = null;
    for (const p of pts) {
      if (lastT !== p.t) dedup.push(p);
      lastT = p.t;
    }
    return dedup;
  }, [orders, sel]);

  // ---- Forecast: server predictedPrice + momentum (can go down)
  const chartData: Point[] = useMemo(() => {
    if (!sel) return [];
    const arr: Point[] = [...history.map((p) => ({ ...p }))];
    const lastPrice = arr[arr.length - 1]?.price ?? sel.price;

    let drift = 0;
    if (history.length >= 3) {
      const p1 = history[history.length - 1].price!;
      const p2 = history[history.length - 2].price!;
      const p3 = history[history.length - 3].price!;
      const d1 = p1 - p2;
      const d2 = p2 - p3;
      drift = (d1 + d2) / 2;
    }

    // a little drama so it's visible on TV
    const targetBase = sel.predictedPrice ?? sel.price;
    const target = Number(targetBase) + drift * 1.35;

    const startT = arr.length ? arr[arr.length - 1].t : Date.now();
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const t = startT + i * 10 * 60 * 1000;
      const ratio = i / steps;
      const val = lastPrice + (target - lastPrice) * ratio;
      arr.push({ t, forecast: Number(val) });
    }
    return arr;
  }, [history, sel]);

  const nowIndex = useMemo(() => history.length - 1, [history]);

  const forecastDirectionUp = useMemo(() => {
    if (!chartData.length) return true;
    const lastReal = history[history.length - 1]?.price ?? sel?.price ?? 0;
    const lastForecast = chartData[chartData.length - 1]?.forecast ?? lastReal;
    return lastForecast >= lastReal;
  }, [chartData, history, sel]);

  const forecastStroke = forecastDirectionUp ? "#34d399" : "#f87171";
  const forecastFillId = forecastDirectionUp ? "forecastFillUp" : "forecastFillDown";

  // ---- Top movers ticker (bottom)
  const movers = useMemo(() => {
    const arr = products
      .map((p) => ({
        id: p.id,
        name: p.name,
        delta: p.priceChange ?? 0,
        up: !!p.priceUp,
        price: p.price,
      }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 12);
    return arr;
  }, [products]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-neutral-950 to-black text-white">
      {/* custom keyframes for sponsor ribbon & ticker */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee {
          width: 200%;
          animation: marquee 24s linear infinite;
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 8px rgba(255,255,255,0.25); }
          50% { text-shadow: 0 0 16px rgba(255,255,255,0.45); }
        }
      `}</style>

      {/* HEADER: Tudengibaar + sponsors */}
      <header className="px-6 pt-5 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/20 border border-accent/30 grid place-items-center">
              <span className="text-xl font-bold">TB</span>
            </div>
            <div>
              <h1 className="text-3xl xl:text-5xl font-extrabold tracking-tight animate-[glow_3s_ease-in-out_infinite]">
                Tudengibaar
              </h1>
              <p className="text-sm text-neutral-400 -mt-1">Live pricing · Dynamic demand</p>
            </div>
          </div>

          {/* Sponsor ribbon */}
          <div className="relative overflow-hidden h-14 flex-1 max-w-[50vw] hidden lg:block">
            <div className="absolute inset-0 marquee flex items-center gap-10 opacity-90">
              {[...SPONSORS, ...SPONSORS].map((s, i) => (
                <div key={s.name + i} className="h-12 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center">
                  <img
                    src={s.src}
                    alt={s.name}
                    className="h-8 w-auto object-contain opacity-90"
                  />
                  <span className="ml-3 text-sm text-neutral-300">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAutoPlay((v) => !v)}
            className={`px-4 py-2 rounded-lg text-sm border ${
              autoPlay
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-600/40"
                : "bg-neutral-900 text-neutral-300 border-neutral-700"
            }`}
            title="Auto-rotate products on the chart"
          >
            {autoPlay ? "Auto: ON" : "Auto: OFF"}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6 h-[calc(100vh-160px)]">
        {/* LEFT BOARD: big clickable tiles */}
        <div className="xl:col-span-1 h-full overflow-hidden">
          <div className="h-full overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950/70">
            {loading ? (
              <div className="p-6 text-neutral-400 text-lg">Loading…</div>
            ) : (
              <div className="p-4 space-y-6">
                {grouped.map(([cat, list]) => (
                  <div key={cat}>
                    <div className="text-neutral-400 tracking-widest text-xs pl-1 mb-2">{cat}</div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {list.map((p) => {
                        const active = sel?.id === p.id;
                        const up = !!p.priceUp;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelIdx(products.findIndex((x) => x.id === p.id));
                              setAutoPlay(false);
                            }}
                            className={`text-left rounded-2xl border px-4 py-4 transition transform hover:scale-[1.02] ${
                              active
                                ? "border-accent/60 bg-accent/10 shadow-lg shadow-accent/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="text-lg font-semibold truncate">{p.name}</div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-2xl font-extrabold">{fmtMoney(p.price)}</div>
                              <div
                                className={`px-2 py-1 rounded-md text-xs border ${
                                  p.priceChange == null
                                    ? "text-neutral-400 border-white/10"
                                    : up
                                    ? "text-emerald-300 bg-emerald-500/10 border-emerald-600/40"
                                    : "text-rose-300 bg-rose-500/10 border-rose-600/40"
                                }`}
                              >
                                {p.priceChange == null
                                  ? "—"
                                  : `${up ? "+" : "−"}${Math.abs(p.priceChange).toFixed(2)}€`}
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-neutral-400">
                              {p.predictedPrice != null ? (
                                <>Next: <span className="text-emerald-300">{fmtMoney(p.predictedPrice)}</span></>
                              ) : (
                                <span className="text-neutral-500">No forecast</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CHART: TV-friendly big chart */}
        <div className="xl:col-span-2 h-full rounded-2xl border border-white/10 bg-neutral-950/70 p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold">{sel ? sel.name : "—"}</h3>
              {sel && (
                <p className="text-sm text-neutral-300 mt-1">
                  Now: <span className="font-semibold text-white">{fmtMoney(sel.price)}</span>
                  {" · "}
                  Predicted:{" "}
                  <span className={`font-semibold ${forecastDirectionUp ? "text-emerald-300" : "text-rose-300"}`}>
                    {fmtMoney(sel.predictedPrice ?? sel.price)}
                  </span>
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2 w-6 rounded-sm bg-violet-500" /> Price
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-6 rounded-sm"
                  style={{ backgroundColor: forecastDirectionUp ? "#34d399" : "#f87171" }}
                />
                Forecast
              </span>
            </div>
          </div>

          <div className="h-[55vh] min-h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="t"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  }
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 14 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  width={70}
                  tickFormatter={(v) => `€${Number(v).toFixed(2)}`}
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 14 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickLine={false}
                  domain={["dataMin - 0.3", "dataMax + 0.3"]}
                />
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="forecastFillUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="forecastFillDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#priceFill)"
                  activeDot={{ r: 4 }}
                  animationDuration={550}
                  connectNulls
                />

                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke={forecastStroke}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  strokeDasharray="5 4"
                  animationDuration={550}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="transparent"
                  fill={`url(#${forecastFillId})`}
                  isAnimationActive={false}
                  connectNulls
                />

                {nowIndex >= 0 && chartData[nowIndex] && (
                  <ReferenceLine
                    x={chartData[nowIndex].t}
                    stroke="rgba(255,255,255,0.35)"
                    strokeDasharray="3 3"
                    label={{
                      value: "Now",
                      position: "top",
                      fill: "rgba(255,255,255,0.75)",
                      fontSize: 12,
                    }}
                  />
                )}

                {chartData.length > 0 && chartData[chartData.length - 1].forecast != null && (
                  <ReferenceDot
                    x={chartData[chartData.length - 1].t}
                    y={chartData[chartData.length - 1].forecast as number}
                    r={6}
                    fill={forecastStroke}
                    stroke="rgba(0,0,0,0.5)"
                  />
                )}

                <Tooltip
                  contentStyle={{
                    background: "rgba(17,17,17,0.92)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "10px 12px",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}
                  formatter={(val: any, key: any) => [
                    `€${Number(val).toFixed(2)}`,
                    key === "price" ? "Price" : "Forecast",
                  ]}
                  labelFormatter={(l: any) =>
                    new Date(l).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  }
                />
                <Legend verticalAlign="bottom" height={28} wrapperStyle={{ color: "rgba(255,255,255,0.85)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="h-[64px] border-t border-white/10 bg-black/60 select-none">
        <div className="h-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-black to-transparent w-24 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-black to-transparent w-24 pointer-events-none" />
          <div className="marquee flex items-center h-full gap-8 px-6">
            {[...movers, ...movers].map((m, i) => (
              <div
                key={m.id + "-" + i}
                className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"
              >
                <span className="text-sm font-medium">{m.name}</span>
                <span
                  className={`text-sm px-2 py-0.5 rounded-md border ${
                    m.delta === 0
                      ? "text-neutral-300 border-white/10"
                      : m.up
                      ? "text-emerald-300 bg-emerald-500/10 border-emerald-600/40"
                      : "text-rose-300 bg-rose-500/10 border-rose-600/40"
                  }`}
                >
                  {m.delta === 0 ? "—" : `${m.up ? "+" : "−"}${Math.abs(m.delta).toFixed(2)}€`}
                </span>
                <span className="text-xs text-neutral-400">{fmtMoney(m.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricesPage;
