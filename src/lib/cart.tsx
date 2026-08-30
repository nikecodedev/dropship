"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Channel } from "@/lib/constants";

export type CartItem = {
  variantId: string;
  slug: string;
  brand: string;
  name: string;
  variantLabel: string;
  priceMinor: number;
  currency: "PYG" | "USD";
  channel: Channel;
  image: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
  channel: Channel | null;
  count: number;
  subtotalMinor: number;
  currency: "PYG" | "USD";
  add: (item: Omit<CartItem, "qty">, qty?: number) => { ok: boolean; conflict?: boolean };
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  ready: boolean;
};

const STORAGE_KEY = "carrito-v1";
const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // carrito corrupto o storage bloqueado: arrancamos vacio
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // sin storage disponible el carrito vive solo en memoria
    }
  }, [items, ready]);

  const value = useMemo<CartState>(() => {
    const channel = items[0]?.channel ?? null;
    return {
      items,
      channel,
      ready,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotalMinor: items.reduce((sum, i) => sum + i.priceMinor * i.qty, 0),
      currency: items[0]?.currency ?? "PYG",

      add(item, qty = 1) {
        // Un pedido no puede mezclar perfumeria local con catalogo
        // internacional: distinto envio, distinto plazo y distinto medio de
        // pago. Se avisa en vez de dejar armar un carrito imposible.
        if (channel && item.channel !== channel) return { ok: false, conflict: true };
        setItems((prev) => {
          const found = prev.find((i) => i.variantId === item.variantId);
          if (found) {
            return prev.map((i) =>
              i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i,
            );
          }
          return [...prev, { ...item, qty }];
        });
        return { ok: true };
      },

      setQty(variantId, qty) {
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.variantId !== variantId)
            : prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i)),
        );
      },

      remove(variantId) {
        setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      },

      clear() {
        setItems([]);
      },
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart tiene que usarse dentro de CartProvider");
  return ctx;
}
