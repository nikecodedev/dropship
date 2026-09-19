import Link from "next/link";
import CatalogView, { type CatalogParams } from "@/components/catalog-view";
import { IconBox, IconGlobe, IconTruck } from "@/components/icons";
import { CHANNEL } from "@/lib/constants";
import { db } from "@/lib/db";
import { btn, cn, container } from "@/lib/ui";

export const metadata = { title: "Catálogo internacional" };
export const dynamic = "force-dynamic";

export default async function InternacionalPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const params = await searchParams;
  const total = await db.product.count({ where: { channel: CHANNEL.DROPSHIP, active: true } });

  if (total > 0) {
    return (
      <CatalogView
        channel={CHANNEL.DROPSHIP}
        basePath="/internacional"
        eyebrow="Internacional"
        title="Catálogo internacional"
        intro="Productos que despacha directamente el proveedor desde el exterior. El plazo de entrega es de 15 a 30 días y se compran por separado de la perfumería."
        params={params}
      />
    );
  }

  // Todavia no hay proveedor de dropshipping conectado: en vez de una grilla
  // vacia, una pagina que explica que es y cuando llega.
  return (
    <section className="relative overflow-hidden bg-emerald text-pearl">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-3/40 blur-3xl" />
      <div className={cn(container, "relative grid gap-14 py-24 sm:py-32 lg:grid-cols-[1.2fr_1fr] lg:items-center")}>
        <div className="animate-fade-up">
          <p className="eyebrow text-champagne-2">Próximamente</p>
          <h1 className="mt-6 text-[48px] leading-[1.02] sm:text-[72px]">
            Catálogo <em className="text-champagne-2">internacional</em>
          </h1>
          <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-pearl/70">
            Estamos sumando una selección de productos importados que te llegan directo desde el
            proveedor. Mientras tanto, toda nuestra perfumería está disponible con entrega inmediata
            en Paraguay.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/perfumes" className={btn.gold}>
              Ver la perfumería
            </Link>
            <Link href="/envios" className={btn.ghostLight}>
              Cómo funcionan los envíos
            </Link>
          </div>
        </div>

        <ul className="space-y-4">
          {[
            { icon: IconGlobe, title: "Envío desde el exterior", text: "El proveedor despacha el pedido directamente a tu domicilio." },
            { icon: IconTruck, title: "Entrega en 15 a 30 días", text: "El plazo exacto va a figurar en cada producto antes de comprar." },
            { icon: IconBox, title: "Pedido separado", text: "No se mezcla con la perfumería local, que te llega en 48 horas." },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-pearl/10 bg-emerald-2/60 p-5 backdrop-blur">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne-2">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-display text-xl">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-pearl/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
