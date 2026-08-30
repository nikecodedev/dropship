"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";

export default function CarritoPage() {
  const { items, subtotalMinor, currency, setQty, remove, ready, channel } = useCart();

  if (!ready) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-sm text-ink-soft">Cargando...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-3xl">Tu carrito esta vacio</h1>
        <p className="mt-4 text-sm text-ink-soft">
          Mira la perfumeria con stock en Paraguay o el catalogo internacional.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/perfumes" className="bg-ink text-cream px-8 py-3 text-sm rounded-sm">
            Ver perfumeria
          </Link>
          <Link href="/internacional" className="border border-line px-8 py-3 text-sm rounded-sm">
            Catalogo internacional
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-3xl">Tu carrito</h1>

      <p className="mt-3 text-xs text-ink-soft">
        {channel === "LOCAL"
          ? "Pedido de perfumeria con entrega en Paraguay."
          : "Pedido del catalogo internacional, despachado por el proveedor."}
      </p>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.variantId} className="py-5 flex gap-4">
            <div className="h-24 w-20 bg-sand rounded-sm overflow-hidden shrink-0">
              {item.image && (
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-ink-soft">{item.brand}</p>
              <p className="text-sm mt-0.5">{item.name}</p>
              <p className="text-xs text-ink-soft mt-0.5">{item.variantLabel}</p>
              <button
                type="button"
                onClick={() => remove(item.variantId)}
                className="text-xs text-ink-soft underline mt-2 hover:text-gold"
              >
                Quitar
              </button>
            </div>

            <div className="text-right">
              <p className="text-sm">{formatMoney(item.priceMinor * item.qty, item.currency)}</p>
              <div className="mt-3 inline-flex items-center border border-line rounded-sm">
                <button
                  type="button"
                  className="px-3 py-1"
                  onClick={() => setQty(item.variantId, item.qty - 1)}
                >
                  -
                </button>
                <span className="px-3 text-sm">{item.qty}</span>
                <button
                  type="button"
                  className="px-3 py-1"
                  onClick={() => setQty(item.variantId, item.qty + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-between text-sm">
        <span className="text-ink-soft">Subtotal</span>
        <span>{formatMoney(subtotalMinor, currency)}</span>
      </div>
      <p className="mt-2 text-xs text-ink-soft text-right">
        El envio se calcula en el siguiente paso.
      </p>

      <Link
        href="/checkout"
        className="mt-8 block bg-ink text-cream text-center py-4 text-sm rounded-sm hover:bg-gold transition-colors"
      >
        Continuar al pago
      </Link>
    </div>
  );
}
