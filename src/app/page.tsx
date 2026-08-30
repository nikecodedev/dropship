import Link from "next/link";
import CatalogGrid from "@/components/catalog-grid";
import { featuredProducts } from "@/lib/catalog";
import { CHANNEL } from "@/lib/constants";

export default async function HomePage() {
  const destacados = await featuredProducts(CHANNEL.LOCAL, 8);

  return (
    <>
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-soft">Paraguay</p>
          <h1 className="font-display text-4xl sm:text-6xl mt-4 max-w-2xl leading-tight">
            Perfumeria importada, entregada en dos dias
          </h1>
          <p className="mt-6 max-w-xl text-sand/80 leading-relaxed">
            Fragancias francesas, arabes y linea Cuba con stock real en Asuncion. Y un catalogo
            internacional aparte, con envio directo del proveedor.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/perfumes"
              className="bg-cream text-ink px-8 py-4 text-sm rounded-sm hover:bg-gold hover:text-cream transition-colors text-center"
            >
              Ver perfumeria
            </Link>
            <Link
              href="/internacional"
              className="border border-sand/40 px-8 py-4 text-sm rounded-sm hover:border-gold hover:text-gold transition-colors text-center"
            >
              Catalogo internacional
            </Link>
          </div>
        </div>
      </section>

      {/* Las dos secciones se explican por separado a proposito. Si el cliente
          no entiende que son dos logisticas distintas, reclama por el plazo. */}
      <section className="mx-auto max-w-6xl px-4 py-20 grid gap-6 md:grid-cols-2">
        <div className="border border-line rounded-sm p-8 bg-white/60">
          <p className="text-xs uppercase tracking-widest text-gold">Perfumeria</p>
          <h2 className="text-2xl mt-3">Stock propio en Paraguay</h2>
          <p className="mt-4 text-sm text-ink-soft leading-relaxed">
            Tenemos el frasco aca. Entrega en Asuncion y Gran Asuncion en 24 a 48 horas, y al
            interior por encomienda. Pagas en guaranies con tarjeta, billetera o transferencia.
          </p>
          <Link href="/perfumes" className="inline-block mt-6 text-sm border-b border-gold pb-1">
            Ver perfumes disponibles
          </Link>
        </div>

        <div className="border border-line rounded-sm p-8 bg-white/60">
          <p className="text-xs uppercase tracking-widest text-gold">Internacional</p>
          <h2 className="text-2xl mt-3">Catalogo con envio del proveedor</h2>
          <p className="mt-4 text-sm text-ink-soft leading-relaxed">
            Productos que despacha directamente el proveedor en el exterior. El plazo es mas largo,
            entre 15 y 30 dias, y esta indicado en cada ficha. Se compra por separado de la
            perfumeria.
          </p>
          <Link href="/internacional" className="inline-block mt-6 text-sm border-b border-gold pb-1">
            Ver catalogo internacional
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl">Destacados</h2>
          <Link href="/perfumes" className="text-sm text-ink-soft hover:text-gold">
            Ver todo
          </Link>
        </div>
        <CatalogGrid products={destacados} />
      </section>
    </>
  );
}
