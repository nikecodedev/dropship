"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { fullName, whatsappLink, type Channel } from "@/lib/constants";
import { btn, cn } from "@/lib/ui";
import { IconBag, IconMinus, IconPlus, IconWhatsapp } from "./icons";

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
  const trackStock = channel === "LOCAL";

  // Arranca en la primera presentacion con stock, no en una agotada.
  const firstAvailable = variants.find((v) => !trackStock || v.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const inCart = cart.items.find((i) => i.variantId === selected?.id)?.qty ?? 0;
  const available = trackStock ? Math.max(0, (selected?.stock ?? 0) - inCart) : 20;
  const agotado = trackStock && (selected?.stock ?? 0) <= 0;

  function add(goToCheckout: boolean) {
    if (!selected) return;
    const result = cart.add(
      {
        variantId: selected.id,
        slug,
        brand,
        name,
        variantLabel: selected.label,
        priceMinor: selected.priceMinor,
        currency,
        channel,
        image,
        maxQty: trackStock ? selected.stock : undefined,
      },
      qty,
    );

    if (!result.ok) {
      setMessage(
        result.reason === "conflict"
          ? "Tu carrito tiene productos del catálogo internacional. Se compran por separado porque tienen otro envío y otro plazo."
          : "Ya tenés en el carrito todas las unidades disponibles de este perfume.",
      );
      return;
    }

    setMessage(null);
    setQty(1);
    if (goToCheckout) router.push("/checkout");
    else cart.openCart();
  }

  if (variants.length === 0) {
    return <p className="text-[14px] text-muted">Este producto no tiene presentaciones disponibles.</p>;
  }

  const whatsapp = whatsappLink("Hola, quería consultar por " + fullName(brand, name) + " (" + selected.label + ").");

  return (
    <div>
      <p className="tabular font-display text-[40px] leading-none text-emerald">
        {formatMoney(selected.priceMinor, currency)}
      </p>

      <div className="mt-4 flex items-center gap-2 text-[13px]">
        {agotado ? (
          <>
            <span className="h-2 w-2 rounded-full bg-subtle" />
            <span className="text-muted">Sin stock por el momento</span>
          </>
        ) : trackStock && selected.stock === 1 ? (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-wine" />
            <span className="text-wine">Última unidad disponible</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-success">
              {trackStock ? "En stock · entrega en 24 a 48 h en Asunción" : "Disponible · envío en 15 a 30 días"}
            </span>
          </>
        )}
      </div>

      {variants.length > 1 && (
        <div className="mt-8">
          <p className="eyebrow mb-3 text-muted">Presentación</p>
          <div className="grid grid-cols-2 gap-3">
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
                    setQty(1);
                    setMessage(null);
                  }}
                  className={cn(
                    "rounded-2xl border px-4 py-3.5 text-left transition-all",
                    active
                      ? "border-emerald bg-emerald text-pearl shadow-card"
                      : "border-stone bg-pearl hover:border-emerald",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span className="block text-[15px] font-medium">{v.label}</span>
                  <span className={cn("tabular block text-[12px]", active ? "text-champagne-2" : "text-muted")}>
                    {disabled ? "Agotado" : formatMoney(v.priceMinor, currency)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!agotado && (
        <div className="mt-8 flex gap-3">
          <div className="flex items-center rounded-full border border-stone bg-pearl">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-[52px] w-11 items-center justify-center text-muted hover:text-emerald"
              aria-label="Restar una unidad"
            >
              <IconMinus size={16} />
            </button>
            <span className="tabular w-7 text-center text-[15px]">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(available, q + 1))}
              disabled={qty >= available}
              className="flex h-[52px] w-11 items-center justify-center text-muted hover:text-emerald disabled:opacity-30"
              aria-label="Sumar una unidad"
            >
              <IconPlus size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => add(false)}
            disabled={available <= 0}
            className={cn(btn.primary, "flex-1")}
          >
            <IconBag size={17} />
            {available <= 0 ? "Ya está en tu carrito" : "Agregar al carrito"}
          </button>
        </div>
      )}

      {!agotado && available > 0 && (
        <button type="button" onClick={() => add(true)} className={cn(btn.outline, "mt-3 w-full")}>
          Comprar ahora
        </button>
      )}

      {message && (
        <p className="mt-4 rounded-xl bg-wine/10 px-4 py-3 text-[13px] leading-relaxed text-wine">{message}</p>
      )}

      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 text-[13px] text-muted transition-colors hover:text-emerald"
        >
          <IconWhatsapp size={17} className="text-success" />
          ¿Tenés dudas? Consultanos por WhatsApp
        </a>
      )}
    </div>
  );
}
