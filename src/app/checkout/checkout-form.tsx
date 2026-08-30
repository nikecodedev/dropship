"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { submitCheckout } from "./actions";

type Zone = { id: string; name: string; coverage: string; priceMinor: number; etaText: string };
type Method = { id: string; label: string; help: string; ready: boolean };

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
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [method, setMethod] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const esLocal = cart.channel !== "DROPSHIP";
  const methods = esLocal ? localMethods : intlMethods;
  const zone = zones.find((z) => z.id === zoneId);
  const shippingMinor = esLocal ? (zone?.priceMinor ?? 0) : 0;
  const total = cart.subtotalMinor + shippingMinor;

  if (cart.ready && cart.items.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Tu carrito esta vacio. Agrega productos antes de continuar.
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const chosen = method || methods.find((m) => m.ready)?.id || "";
    if (!chosen) {
      setError("No hay un medio de pago disponible todavia para este catalogo.");
      return;
    }

    setSending(true);
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
      paymentMethod: chosen,
      items: cart.items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
    });
    setSending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    cart.clear();
    if (result.redirect) window.location.href = result.redirect;
    else router.push("/pedido/" + result.code);
  }

  const field =
    "w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-gold";

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-lg mb-3">Tus datos</legend>
          <input name="customerName" required placeholder="Nombre y apellido" className={field} />
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="customerEmail" type="email" required placeholder="Email" className={field} />
            <input name="customerPhone" required placeholder="Telefono / WhatsApp" className={field} />
          </div>
          <input name="customerDoc" placeholder="CI o RUC (para la factura)" className={field} />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg mb-3">Envio</legend>

          {esLocal ? (
            <>
              <div className="space-y-2">
                {zones.map((z) => (
                  <label
                    key={z.id}
                    className={
                      "flex items-start gap-3 border rounded-sm p-4 cursor-pointer " +
                      (zoneId === z.id ? "border-gold" : "border-line")
                    }
                  >
                    <input
                      type="radio"
                      name="zone"
                      checked={zoneId === z.id}
                      onChange={() => setZoneId(z.id)}
                      className="mt-1"
                    />
                    <span className="flex-1">
                      <span className="block text-sm">{z.name}</span>
                      <span className="block text-xs text-ink-soft mt-0.5">
                        {z.coverage}
                        {z.etaText ? " · " + z.etaText : ""}
                      </span>
                    </span>
                    <span className="text-sm">{formatMoney(z.priceMinor, "PYG")}</span>
                  </label>
                ))}
              </div>
              <input name="shipCity" required placeholder="Ciudad" className={field} />
              <input name="shipAddress" required placeholder="Direccion" className={field} />
              <textarea
                name="shipNotes"
                rows={2}
                placeholder="Referencias para la entrega (opcional)"
                className={field}
              />
            </>
          ) : (
            <>
              <input name="countryCode" required placeholder="Pais de destino" className={field} />
              <input name="shipCity" required placeholder="Ciudad" className={field} />
              <input name="shipAddress" required placeholder="Direccion completa" className={field} />
              <p className="text-xs text-ink-soft">
                El costo de envio de este catalogo lo cotiza el proveedor. Te lo confirmamos por
                email antes de cobrar.
              </p>
            </>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg mb-3">Pago</legend>
          {methods.length === 0 && (
            <p className="text-sm text-ink-soft">No hay medios de pago configurados.</p>
          )}
          {methods.map((m) => (
            <label
              key={m.id}
              className={
                "flex items-start gap-3 border rounded-sm p-4 " +
                (m.ready ? "cursor-pointer " : "opacity-50 cursor-not-allowed ") +
                (method === m.id ? "border-gold" : "border-line")
              }
            >
              <input
                type="radio"
                name="paymentMethod"
                disabled={!m.ready}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm">{m.label}</span>
                <span className="block text-xs text-ink-soft mt-0.5">
                  {m.ready ? m.help : "Pendiente de configurar"}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside className="border border-line rounded-sm p-6 h-fit bg-white/60">
        <h2 className="text-lg mb-4">Tu pedido</h2>
        <ul className="space-y-3 text-sm">
          {cart.items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-4">
              <span className="text-ink-soft">
                {i.name} {i.variantLabel} x{i.qty}
              </span>
              <span>{formatMoney(i.priceMinor * i.qty, i.currency)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-line mt-5 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Subtotal</span>
            <span>{formatMoney(cart.subtotalMinor, cart.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Envio</span>
            <span>{esLocal ? formatMoney(shippingMinor, "PYG") : "A confirmar"}</span>
          </div>
          <div className="flex justify-between text-base pt-2">
            <span>Total</span>
            <span>{formatMoney(total, cart.currency)}</span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={sending}
          className="mt-6 w-full bg-ink text-cream py-3.5 text-sm rounded-sm hover:bg-gold transition-colors disabled:opacity-50"
        >
          {sending ? "Procesando..." : "Confirmar pedido"}
        </button>
      </aside>
    </form>
  );
}
