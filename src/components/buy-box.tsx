"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import type { Channel } from "@/lib/constants";

export type BuyBoxVariant = {
  id: string;
  label: string;
  sizeMl: number | null;
  priceMinor: number;
  stock: number;
};

type Props = {
  slug: string;
  brand: string;
  name: string;
  image: string | null;
  currency: "PYG" | "USD";
  channel: Channel;
  variants: BuyBoxVariant[];
};

export default function BuyBox({ slug, brand, name, image, currency, channel, variants }: Props) {
  const router = useRouter();
  const cart = useCart();
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const trackStock = channel === "LOCAL";
  const agotado = trackStock && (!selected || selected.stock <= 0);

  function add(goToCart: boolean) {
    if (!selected) return;
    const result = cart.add({
      variantId: selected.id,
      slug,
      brand,
      name,
      variantLabel: selected.label,
      priceMinor: selected.priceMinor,
      currency,
      channel,
      image,
    });

    if (!result.ok && result.conflict) {
      setMessage(
        "Tu carrito tiene productos de la otra seccion. La perfumeria local y el catalogo internacional se compran por separado porque tienen envio y plazo distintos.",
      );
      return;
    }

    if (goToCart) router.push("/carrito");
    else setMessage("Agregado al carrito.");
  }

  if (variants.length === 0) {
    return <p className="text-sm text-ink-soft">Este producto no tiene presentaciones cargadas.</p>;
  }

  return (
    <div>
      {variants.length > 1 && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-ink-soft mb-2">Tamano</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const disabled = trackStock && v.stock <= 0;
              const active = v.id === selectedId;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedId(v.id);
                    setMessage(null);
                  }}
                  className={
                    "border rounded-sm px-4 py-2 text-sm transition-colors " +
                    (active ? "border-gold text-gold" : "border-line hover:border-gold") +
                    (disabled ? " opacity-40 line-through cursor-not-allowed" : "")
                  }
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-2xl font-display">
        {selected ? formatMoney(selected.priceMinor, currency) : ""}
      </p>

      {trackStock && selected && selected.stock > 0 && selected.stock <= 3 && (
        <p className="text-xs text-gold mt-1">Quedan {selected.stock} unidades</p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          disabled={agotado}
          onClick={() => add(false)}
          className="flex-1 border border-ink rounded-sm py-3 text-sm hover:bg-ink hover:text-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          {agotado ? "Sin stock" : "Agregar al carrito"}
        </button>
        <button
          type="button"
          disabled={agotado}
          onClick={() => add(true)}
          className="flex-1 bg-ink text-cream rounded-sm py-3 text-sm hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Comprar ahora
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-ink-soft">{message}</p>}
    </div>
  );
}
