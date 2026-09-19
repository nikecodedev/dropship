"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { btn, cn, container } from "@/lib/ui";
import { IconBag, IconMinus, IconPlus, IconShield, IconTruck } from "@/components/icons";

export default function CarritoPage() {
  const cart = useCart();

  if (!cart.ready) {
    return <div className="py-40 text-center text-[14px] text-muted">Cargando tu carrito…</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className={cn(container, "max-w-lg py-28 text-center")}>
        <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sand text-champagne">
          <IconBag size={40} />
        </span>
        <h1 className="mt-8 text-[46px] text-emerald">Tu carrito está vacío</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Descubrí nuestras fragancias originales, todas selladas en su caja y con entrega en 48 horas.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/perfumes?gender=FEMENINO" className={btn.primary}>
            Perfumes de mujer
          </Link>
          <Link href="/perfumes?gender=MASCULINO" className={btn.outline}>
            Perfumes de hombre
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(container, "pb-24 pt-14")}>
      <h1 className="text-[46px] text-emerald sm:text-[56px]">Tu carrito</h1>
      <p className="mt-2 text-[14px] text-muted">
        {cart.count} {cart.count === 1 ? "producto" : "productos"}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <ul className="divide-y divide-stone/70 border-y border-stone/70">
          {cart.items.map((item) => {
            const href = (item.channel === "LOCAL" ? "/perfumes/" : "/internacional/") + item.slug;
            const atMax = item.maxQty !== undefined && item.qty >= item.maxQty;
            return (
              <li key={item.variantId} className="flex gap-5 py-6">
                <Link href={href} className="h-36 w-28 shrink-0 overflow-hidden rounded-2xl bg-sand sm:h-40 sm:w-32">
                  {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow text-[10px] text-muted">{item.brand}</p>
                      <Link href={href} className="mt-1 block font-display text-[24px] leading-tight text-ink hover:text-emerald">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[13px] text-muted">{item.variantLabel}</p>
                    </div>
                    <p className="tabular shrink-0 text-[16px] font-medium text-ink">
                      {formatMoney(item.priceMinor * item.qty, item.currency)}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center rounded-full border border-stone">
                      <button
                        type="button"
                        onClick={() => cart.setQty(item.variantId, item.qty - 1)}
                        className="flex h-10 w-10 items-center justify-center text-muted hover:text-emerald"
                        aria-label="Quitar una unidad"
                      >
                        <IconMinus size={16} />
                      </button>
                      <span className="tabular w-7 text-center text-[14px]">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => cart.setQty(item.variantId, item.qty + 1)}
                        disabled={atMax}
                        className="flex h-10 w-10 items-center justify-center text-muted hover:text-emerald disabled:opacity-30"
                        aria-label="Agregar una unidad"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.remove(item.variantId)}
                      className="text-[12px] tracking-wide text-subtle hover:text-danger"
                    >
                      Quitar
                    </button>
                  </div>
                  {atMax && <p className="mt-2 text-[12px] text-wine">Ya tenés todo el stock disponible.</p>}
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-stone/70 bg-pearl p-7 shadow-card">
            <h2 className="font-display text-[28px] text-emerald">Resumen</h2>
            <div className="mt-6 space-y-3 text-[14px]">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="tabular text-ink">{formatMoney(cart.subtotalMinor, cart.currency)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Envío</span>
                <span>Se calcula en el siguiente paso</span>
              </div>
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-stone pt-5">
              <span className="font-medium">Total parcial</span>
              <span className="tabular font-display text-[32px] text-emerald">
                {formatMoney(cart.subtotalMinor, cart.currency)}
              </span>
            </div>
            <Link href="/checkout" className={cn(btn.primary, "mt-6 w-full py-4")}>
              Finalizar compra
            </Link>
            <Link href="/perfumes" className="mt-4 block text-center text-[12px] tracking-[0.12em] uppercase text-muted hover:text-emerald">
              Seguir comprando
            </Link>
            <div className="mt-7 space-y-3 border-t border-stone pt-6 text-[13px] text-muted">
              <p className="flex items-center gap-2.5">
                <IconTruck size={18} className="text-champagne" />
                {cart.channel === "DROPSHIP" ? "Envío desde el exterior en 15 a 30 días" : "Entrega en 24 a 48 h en Asunción"}
              </p>
              <p className="flex items-center gap-2.5">
                <IconShield size={18} className="text-champagne" /> Perfumes originales y sellados
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
