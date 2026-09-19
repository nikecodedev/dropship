"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Channel } from "@/lib/constants";
import { cn } from "@/lib/ui";
import { IconBag, IconCheck } from "./icons";

type Props = {
  variant: { id: string; label: string; priceMinor: number; stock: number };
  product: {
    slug: string;
    brand: string;
    name: string;
    image: string | null;
    currency: "PYG" | "USD";
    channel: Channel;
  };
};

// Boton de "agregar" en la tarjeta del catalogo. Solo se muestra en productos
// con una sola presentacion: si hay que elegir tamano, se entra a la ficha.
export default function QuickAdd({ variant, product }: Props) {
  const cart = useCart();
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const trackStock = product.channel === "LOCAL";

  function add(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const result = cart.add(
      {
        variantId: variant.id,
        slug: product.slug,
        brand: product.brand,
        name: product.name,
        variantLabel: variant.label,
        priceMinor: variant.priceMinor,
        currency: product.currency,
        channel: product.channel,
        image: product.image,
        maxQty: trackStock ? variant.stock : undefined,
      },
      1,
    );
    if (!result.ok) {
      setState("error");
      setTimeout(() => setState("idle"), 2200);
      if (result.reason === "conflict") cart.openCart();
      return;
    }
    setState("added");
    cart.openCart();
    setTimeout(() => setState("idle"), 1600);
  }

  return (
    <button
      type="button"
      onClick={add}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-full py-3 text-[11px] font-medium tracking-[0.16em] uppercase backdrop-blur-md transition-all duration-300",
        state === "error"
          ? "bg-wine text-pearl"
          : "bg-pearl/95 text-emerald shadow-card hover:bg-emerald hover:text-pearl",
      )}
    >
      {state === "added" ? (
        <>
          <IconCheck size={15} /> Agregado
        </>
      ) : state === "error" ? (
        "No hay más stock"
      ) : (
        <>
          <IconBag size={15} />
          <span className="sm:hidden">Agregar</span>
          <span className="hidden sm:inline">Agregar al carrito</span>
        </>
      )}
    </button>
  );
}
