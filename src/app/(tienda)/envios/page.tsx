import Link from "next/link";
import { IconBank, IconCard, IconChevronDown, IconGlobe, IconLocation, IconTruck } from "@/components/icons";
import { getLocalZones } from "@/lib/shipping";
import { methodsForChannel } from "@/lib/payments";
import { CHANNEL } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { btn, cn, container } from "@/lib/ui";

export const metadata = { title: "Envíos y pagos" };
export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "¿Los perfumes son originales?",
    a: "Sí. Todos los perfumes de la tienda son originales, nuevos y vienen sellados en su caja de fábrica.",
  },
  {
    q: "¿Cuándo sale mi pedido?",
    a: "Si pagás por transferencia, lo preparamos apenas se acredita el pago y te escribimos para coordinar la entrega.",
  },
  {
    q: "¿Tengo que crear una cuenta para comprar?",
    a: "No. Completás tus datos en el checkout y listo. Al confirmar te mostramos el detalle de tu pedido y los pasos para pagarlo.",
  },
  {
    q: "¿Qué pasa si no pago la transferencia?",
    a: "Tus productos quedan reservados mientras esperamos el pago. Si no se acredita, el pedido se cancela y el perfume vuelve a estar disponible.",
  },
];

export default async function EnviosPage() {
  const zones = await getLocalZones();
  const methods = methodsForChannel(CHANNEL.LOCAL);

  return (
    <>
      <section className="border-b border-stone/70 bg-sand/50">
        <div className={cn(container, "py-16 sm:py-20")}>
          <p className="eyebrow text-champagne">Ayuda</p>
          <h1 className="mt-4 text-[48px] text-emerald sm:text-[64px]">Envíos y pagos</h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
            Todo lo que necesitás saber antes de comprar: cuánto sale el envío, cuánto tarda y cómo pagar.
          </p>
        </div>
      </section>

      <div className={cn(container, "space-y-24 pb-28 pt-20")}>
        {/* Zonas */}
        <section>
          <div className="flex items-center gap-3">
            <IconTruck size={26} className="text-champagne" />
            <h2 className="text-[36px] text-emerald">Envíos dentro de Paraguay</h2>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Despachamos desde Asunción. La tarifa depende de la zona y la ves antes de confirmar la compra.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {zones.map((z) => (
              <div key={z.id} className="flex flex-col rounded-3xl border border-stone/70 bg-pearl p-8">
                <IconLocation size={22} className="text-champagne" />
                <h3 className="mt-5 text-[28px] text-emerald">{z.name}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{z.coverage}</p>
                <div className="mt-auto flex items-end justify-between border-t border-stone/70 pt-6">
                  <span className="text-[13px] text-success">{z.etaText}</span>
                  <span className="tabular font-display text-[28px] text-emerald">{formatMoney(z.priceMinor, "PYG")}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pagos */}
        <section id="pagos" className="scroll-mt-28">
          <div className="flex items-center gap-3">
            <IconBank size={26} className="text-champagne" />
            <h2 className="text-[36px] text-emerald">Medios de pago</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {methods.map((m) => {
              const Icon = m.id === "transferencia" ? IconBank : IconCard;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-5 rounded-3xl border p-8",
                    m.ready ? "border-emerald/30 bg-pearl" : "border-dashed border-stone bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                      m.ready ? "bg-emerald text-champagne-2" : "bg-sand text-subtle",
                    )}
                  >
                    <Icon size={22} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[26px] text-emerald">{m.label}</h3>
                      {!m.ready && (
                        <span className="rounded-full bg-sand px-3 py-1 text-[10px] tracking-[0.14em] uppercase text-muted">
                          Próximamente
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">
                      {m.id === "transferencia"
                        ? "Sin recargo. Al confirmar el pedido te mostramos los datos de la cuenta y el monto exacto. Lo preparamos apenas se acredita."
                        : "Pagá con tarjeta de crédito o débito, Tigo Money, Personal Pay o en bocas de cobranza."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Internacional */}
        <section className="grid gap-8 rounded-[2rem] bg-emerald p-10 text-pearl sm:p-14 lg:grid-cols-[auto_1fr] lg:items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne/15 text-champagne-2">
            <IconGlobe size={30} />
          </span>
          <div>
            <h2 className="text-[34px]">Catálogo internacional</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-pearl/65">
              Los productos del catálogo internacional los despacha el proveedor desde el exterior, con un
              plazo de 15 a 30 días. Se compran por separado de la perfumería local, porque tienen otro
              envío y otro plazo.
            </p>
          </div>
        </section>

        {/* Cambios */}
        <section id="cambios" className="grid scroll-mt-28 gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-[36px] text-emerald">Cambios y preguntas frecuentes</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Si tenés algún problema con tu pedido, escribinos y lo resolvemos. Por tratarse de perfumes,
              los cambios se evalúan siempre con el producto sellado.
            </p>
            <Link href="/perfumes" className={cn(btn.primary, "mt-8")}>
              Ver perfumes
            </Link>
          </div>
          <div className="divide-y divide-stone border-y border-stone">
            {FAQ.map((item) => (
              <details key={item.q} className="py-1">
                <summary className="flex items-center justify-between py-5 font-display text-[21px] text-ink">
                  {item.q}
                  <IconChevronDown size={18} className="chevron shrink-0 text-muted transition-transform duration-300" />
                </summary>
                <p className="pb-6 text-[15px] leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
