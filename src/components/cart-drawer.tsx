"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { btn, cn } from "@/lib/ui";
import { IconBag, IconClose, IconMinus, IconPlus, IconTruck } from "./icons";

export default function CartDrawer() {
  const cart = useCart();
  const { isOpen, closeCart } = cart;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Carrito">
      <button
        type="button"
        onClick={closeCart}
        className="absolute inset-0 animate-fade-in bg-noir/45 backdrop-blur-[2px]"
        aria-label="Cerrar carrito"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[440px] animate-slide-in-right flex-col bg-pearl shadow-drawer">
        <div className="flex items-center justify-between border-b border-stone px-6 py-5">
          <div>
            <p className="font-display text-2xl text-emerald">Tu carrito</p>
            <p className="text-[12px] text-muted">
              {cart.count === 0
                ? "Todavía no agregaste productos"
                : cart.count + (cart.count === 1 ? " producto" : " productos")}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-emerald"
            aria-label="Cerrar carrito"
          >
            <IconClose size={22} />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sand text-champagne">
              <IconBag size={34} />
            </span>
            <p className="mt-6 font-display text-3xl text-emerald">Tu carrito está vacío</p>
            <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">
              Descubrí nuestras fragancias originales, todas selladas en su caja.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3">
              <Link href="/perfumes?gender=FEMENINO" onClick={closeCart} className={btn.primary}>
                Perfumes de mujer
              </Link>
              <Link href="/perfumes?gender=MASCULINO" onClick={closeCart} className={btn.outline}>
                Perfumes de hombre
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 bg-sand/60 px-6 py-3 text-[12px] text-emerald">
              <IconTruck size={17} className="shrink-0 text-champagne" />
              {cart.channel === "DROPSHIP"
                ? "Pedido internacional: lo despacha el proveedor en 15 a 30 días."
                : "Entrega en 24 a 48 h en Asunción y Gran Asunción."}
            </div>

            <ul className="flex-1 divide-y divide-stone/70 overflow-y-auto px-6">
              {cart.items.map((item) => {
                const atMax = item.maxQty !== undefined && item.qty >= item.maxQty;
                const href =
                  (item.channel === "LOCAL" ? "/perfumes/" : "/internacional/") + item.slug;
                return (
                  <li key={item.variantId} className="flex gap-4 py-5">
                    <Link
                      href={href}
                      onClick={closeCart}
                      className="h-28 w-[88px] shrink-0 overflow-hidden rounded-xl bg-sand"
                    >
                      {item.image && (
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="eyebrow text-[10px] text-muted">{item.brand}</p>
                      <Link
                        href={href}
                        onClick={closeCart}
                        className="mt-1 font-display text-[19px] leading-tight text-ink hover:text-emerald"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-[12px] text-muted">{item.variantLabel}</p>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-stone">
                          <button
                            type="button"
                            onClick={() => cart.setQty(item.variantId, item.qty - 1)}
                            className="flex h-8 w-8 items-center justify-center text-muted hover:text-emerald"
                            aria-label="Quitar una unidad"
                          >
                            <IconMinus size={15} />
                          </button>
                          <span className="tabular w-6 text-center text-[13px]">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => cart.setQty(item.variantId, item.qty + 1)}
                            disabled={atMax}
                            className="flex h-8 w-8 items-center justify-center text-muted hover:text-emerald disabled:opacity-30"
                            aria-label="Agregar una unidad"
                          >
                            <IconPlus size={15} />
                          </button>
                        </div>
                        <p className="tabular text-[15px] font-medium text-ink">
                          {formatMoney(item.priceMinor * item.qty, item.currency)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        {atMax ? (
                          <span className="text-[11px] text-wine">Es todo el stock disponible</span>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => cart.remove(item.variantId)}
                          className="text-[11px] tracking-wide text-subtle underline-offset-2 hover:text-danger hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-stone bg-pearl px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] text-muted">Subtotal</span>
                <span className="tabular font-display text-[28px] text-emerald">
                  {formatMoney(cart.subtotalMinor, cart.currency)}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-subtle">El costo de envío se calcula en el siguiente paso.</p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className={cn(btn.primary, "mt-5 w-full py-4")}
              >
                Finalizar compra
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full text-center text-[12px] tracking-[0.12em] uppercase text-muted hover:text-emerald"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
