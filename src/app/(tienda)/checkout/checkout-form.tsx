"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { btn, cn, field, label } from "@/lib/ui";
import { IconBag, IconBank, IconCard, IconCheck, IconShield } from "@/components/icons";
import { submitCheckout } from "./actions";

type Zone = { id: string; name: string; coverage: string; priceMinor: number; etaText: string };
type Method = { id: string; label: string; help: string; ready: boolean };

const METHOD_ICON: Record<string, typeof IconBank> = {
  transferencia: IconBank,
  pagopar: IconCard,
  internacional: IconCard,
};

export default function CheckoutForm({
  zones,
  localMethods,
  intlMethods,
}: {
  zones: Zone[];
  localMethods: Method[];
  intlMethods: Method[];
}) {
  const router = useRouter();
  const cart = useCart();
  const esLocal = cart.channel !== "DROPSHIP";
  const methods = esLocal ? localMethods : intlMethods;

  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [method, setMethod] = useState(methods.find((m) => m.ready)?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const zone = zones.find((z) => z.id === zoneId);
  const shippingMinor = esLocal ? (zone?.priceMinor ?? 0) : 0;
  const total = cart.subtotalMinor + shippingMinor;

  if (!cart.ready) {
    return <div className="py-32 text-center text-[14px] text-muted">Cargando tu carrito…</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sand text-champagne">
          <IconBag size={34} />
        </span>
        <h1 className="mt-6 text-[40px] text-emerald">Tu carrito está vacío</h1>
        <p className="mt-3 text-[15px] text-muted">Agregá algún perfume para poder finalizar la compra.</p>
        <Link href="/perfumes" className={cn(btn.primary, "mt-8")}>
          Ver perfumes
        </Link>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!method) {
      setError("Elegí un medio de pago.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setSending(true);
    try {
      const result = await submitCheckout({
        channel: esLocal ? "LOCAL" : "DROPSHIP",
        customerName: String(form.get("customerName") ?? ""),
        customerEmail: String(form.get("customerEmail") ?? ""),
        customerPhone: String(form.get("customerPhone") ?? ""),
        customerDoc: String(form.get("customerDoc") ?? ""),
        shipCity: String(form.get("shipCity") ?? ""),
        shipAddress: String(form.get("shipAddress") ?? ""),
        shipNotes: String(form.get("shipNotes") ?? ""),
        shipZoneId: esLocal ? zoneId : undefined,
        countryCode: esLocal ? "PY" : String(form.get("countryCode") ?? ""),
        paymentMethod: method,
        items: cart.items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      });

      if (!result.ok) {
        setError(result.error);
        setSending(false);
        return;
      }

      cart.clear();
      if (result.redirect) window.location.href = result.redirect;
      else router.push(result.path);
    } catch {
      setError("No pudimos procesar el pedido. Revisá tu conexión e intentá de nuevo.");
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
      <div className="space-y-6">
        {/* 1. Datos */}
        <Step n={1} title="Tus datos" subtitle="Te escribimos a este número para coordinar la entrega.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="customerName">
                Nombre y apellido
              </label>
              <input id="customerName" name="customerName" required autoComplete="name" className={field} />
            </div>
            <div>
              <label className={label} htmlFor="customerPhone">
                Celular / WhatsApp
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0981 123 456"
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="customerEmail">
                Email
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                required
                type="email"
                autoComplete="email"
                className={field}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="customerDoc">
                CI o RUC <span className="font-normal text-subtle">(opcional, si necesitás factura)</span>
              </label>
              <input id="customerDoc" name="customerDoc" className={field} />
            </div>
          </div>
        </Step>

        {/* 2. Entrega */}
        <Step
          n={2}
          title="Entrega"
          subtitle={esLocal ? "Elegí la zona y completá la dirección." : "El proveedor despacha desde el exterior."}
        >
          {esLocal ? (
            <>
              <div className="grid gap-3">
                {zones.map((z) => {
                  const active = zoneId === z.id;
                  return (
                    <label
                      key={z.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all",
                        active ? "border-emerald bg-emerald/[0.03] shadow-card" : "border-stone hover:border-emerald/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="zone"
                        checked={active}
                        onChange={() => setZoneId(z.id)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                          active ? "border-emerald bg-emerald" : "border-stone",
                        )}
                      >
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-pearl" />}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[15px] font-medium text-ink">{z.name}</span>
                        <span className="mt-0.5 block text-[13px] text-muted">{z.coverage}</span>
                        {z.etaText && (
                          <span className="mt-1 block text-[12px] text-success">Llega en {z.etaText}</span>
                        )}
                      </span>
                      <span className="tabular text-[15px] font-medium text-emerald">
                        {formatMoney(z.priceMinor, "PYG")}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_2fr]">
                <div>
                  <label className={label} htmlFor="shipCity">
                    Ciudad
                  </label>
                  <input id="shipCity" name="shipCity" required autoComplete="address-level2" className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="shipAddress">
                    Dirección
                  </label>
                  <input
                    id="shipAddress"
                    name="shipAddress"
                    required
                    autoComplete="street-address"
                    placeholder="Calle, número y barrio"
                    className={field}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="shipNotes">
                    Referencias <span className="font-normal text-subtle">(opcional)</span>
                  </label>
                  <textarea
                    id="shipNotes"
                    name="shipNotes"
                    rows={2}
                    placeholder="Casa de portón negro, frente a la farmacia…"
                    className={field}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="countryCode">
                  País
                </label>
                <input id="countryCode" name="countryCode" required className={field} />
              </div>
              <div>
                <label className={label} htmlFor="shipCity">
                  Ciudad
                </label>
                <input id="shipCity" name="shipCity" required className={field} />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="shipAddress">
                  Dirección completa
                </label>
                <input id="shipAddress" name="shipAddress" required className={field} />
              </div>
            </div>
          )}
        </Step>

        {/* 3. Pago */}
        <Step n={3} title="Pago" subtitle="Elegí cómo querés pagar.">
          <div className="grid gap-3">
            {methods.map((m) => {
              const Icon = METHOD_ICON[m.id] ?? IconCard;
              const active = method === m.id;
              return (
                <label
                  key={m.id}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4 transition-all",
                    !m.ready && "cursor-not-allowed opacity-50",
                    m.ready && "cursor-pointer",
                    active ? "border-emerald bg-emerald/[0.03] shadow-card" : "border-stone",
                    m.ready && !active && "hover:border-emerald/40",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    disabled={!m.ready}
                    checked={active}
                    onChange={() => setMethod(m.id)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                      active ? "bg-emerald text-champagne-2" : "bg-sand text-emerald",
                    )}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium text-ink">{m.label}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                      {m.ready ? m.help : "Próximamente"}
                    </span>
                  </span>
                  {active && <IconCheck size={20} className="text-emerald" />}
                </label>
              );
            })}
          </div>
        </Step>
      </div>

      {/* Resumen */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-3xl border border-stone/70 bg-pearl shadow-card">
          <div className="border-b border-stone/70 px-6 py-5">
            <h2 className="font-display text-[28px] text-emerald">Tu pedido</h2>
          </div>

          <ul className="max-h-[320px] divide-y divide-stone/60 overflow-y-auto px-6">
            {cart.items.map((i) => (
              <li key={i.variantId} className="flex items-center gap-4 py-4">
                <div className="relative h-[72px] w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-emerald px-1 text-[10px] font-medium text-pearl">
                    {i.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow truncate text-[9px] text-muted">{i.brand}</p>
                  <p className="truncate font-display text-[17px] leading-tight text-ink">{i.name}</p>
                  <p className="text-[12px] text-subtle">{i.variantLabel}</p>
                </div>
                <p className="tabular text-[14px] text-ink">{formatMoney(i.priceMinor * i.qty, i.currency)}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-2.5 border-t border-stone/70 bg-sand/40 px-6 py-5 text-[14px]">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="tabular text-ink">{formatMoney(cart.subtotalMinor, cart.currency)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Envío {esLocal && zone ? "· " + zone.name : ""}</span>
              <span className="tabular text-ink">{esLocal ? formatMoney(shippingMinor, "PYG") : "A confirmar"}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-stone pt-4">
              <span className="text-[15px] font-medium text-ink">Total</span>
              <span className="tabular font-display text-[34px] leading-none text-emerald">
                {formatMoney(total, cart.currency)}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2">
            {error && (
              <p className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-[13px] leading-relaxed text-danger" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={sending} className={cn(btn.primary, "w-full py-4")}>
              {sending ? "Confirmando pedido…" : "Confirmar pedido"}
            </button>
            <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-muted">
              <IconShield size={16} className="mt-0.5 shrink-0 text-champagne" />
              Al confirmar reservamos tus productos. Si pagás por transferencia, te mostramos los datos
              de la cuenta en el siguiente paso.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Step({
  n,
  title,
  subtitle,
  children,
}: {
  n: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-stone/70 bg-pearl p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald font-display text-lg text-champagne-2">
          {n}
        </span>
        <div>
          <h2 className="font-display text-[26px] leading-tight text-emerald">{title}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
