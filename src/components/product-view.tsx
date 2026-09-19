import Link from "next/link";
import { notFound } from "next/navigation";
import BuyBox from "./buy-box";
import CatalogGrid from "./catalog-grid";
import ProductGallery from "./product-gallery";
import {
  IconBank,
  IconChevronDown,
  IconChevronRight,
  IconSeal,
  IconShield,
  IconTruck,
} from "./icons";
import { fullName, getProductBySlug, parseImages, relatedProducts, sizeSummary } from "@/lib/catalog";
import {
  CONCENTRATION_LABEL,
  CONDITION_LABEL,
  GENDER_LABEL,
  type Channel,
  type Concentration,
  type Condition,
  type Gender,
} from "@/lib/constants";
import { toMajor } from "@/lib/money";
import { cn, container } from "@/lib/ui";

export default async function ProductView({ slug, channel }: { slug: string; channel: Channel }) {
  const product = await getProductBySlug(slug);
  if (!product || !product.active || product.channel !== channel) notFound();

  const images = parseImages(product.images);
  const esLocal = channel === "LOCAL";
  const concentration = CONCENTRATION_LABEL[product.concentration as Concentration];
  const gender = GENDER_LABEL[product.gender as Gender];
  const related = await relatedProducts(product, 4);
  const basePath = esLocal ? "/perfumes" : "/internacional";

  const details = [
    { label: "Marca", value: product.brand },
    { label: "Concentración", value: concentration },
    { label: "Género", value: gender },
    { label: "Presentación", value: sizeSummary(product.variants) },
    { label: "Estado", value: CONDITION_LABEL[product.condition as Condition] },
  ].filter((d) => d.value);

  const inStock = product.variants.some((v) => !esLocal || v.stock > 0);
  const lowest = product.variants.length ? Math.min(...product.variants.map((v) => v.priceMinor)) : 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullName(product.brand, product.name),
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: images,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: toMajor(lowest, product.currency as "PYG" | "USD"),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className={cn(container, "pt-8")}>
        <nav className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted" aria-label="Ruta">
          <Link href="/" className="hover:text-emerald">
            Inicio
          </Link>
          <IconChevronRight size={13} />
          <Link href={basePath} className="hover:text-emerald">
            {esLocal ? "Perfumes" : "Internacional"}
          </Link>
          <IconChevronRight size={13} />
          <Link href={basePath + "?brand=" + encodeURIComponent(product.brand)} className="hover:text-emerald">
            {product.brand}
          </Link>
          <IconChevronRight size={13} />
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <section className={cn(container, "grid gap-10 pb-20 pt-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16")}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery images={images} alt={fullName(product.brand, product.name)} />
        </div>

        <div className="lg:pt-4">
          <Link
            href={basePath + "?brand=" + encodeURIComponent(product.brand)}
            className="eyebrow text-champagne hover:text-emerald"
          >
            {product.brand}
          </Link>
          <h1 className="mt-3 text-[46px] leading-[1.02] text-ink sm:text-[58px]">{product.name}</h1>
          <p className="mt-3 text-[14px] tracking-wide text-muted">
            {[concentration, gender, sizeSummary(product.variants)].filter(Boolean).join("  ·  ")}
          </p>

          {esLocal && (
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/50 bg-champagne-3/40 px-3 py-1.5 text-[11px] tracking-[0.08em] uppercase text-emerald">
                <IconShield size={14} className="text-champagne" /> 100% original
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/50 bg-champagne-3/40 px-3 py-1.5 text-[11px] tracking-[0.08em] uppercase text-emerald">
                <IconSeal size={14} className="text-champagne" /> {CONDITION_LABEL[product.condition as Condition]}
              </span>
            </div>
          )}

          <div className="mt-8 border-t border-stone pt-8">
            <BuyBox
              slug={product.slug}
              brand={product.brand}
              name={product.name}
              image={images[0] ?? null}
              currency={product.currency as "PYG" | "USD"}
              channel={channel}
              variants={product.variants.map((v) => ({
                id: v.id,
                label: v.label,
                sizeMl: v.sizeMl,
                priceMinor: v.priceMinor,
                stock: v.stock,
              }))}
            />
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 rounded-2xl bg-sand/70 p-4 text-center">
            {[
              { icon: IconTruck, text: esLocal ? "Entrega en 24 a 48 h" : "Envío en 15 a 30 días" },
              { icon: IconShield, text: "Producto original" },
              { icon: IconBank, text: "Transferencia sin recargo" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 px-1 py-2">
                <Icon size={22} className="text-champagne" />
                <span className="text-[11px] leading-snug text-emerald">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 divide-y divide-stone border-y border-stone">
            {product.description && (
              <Accordion title="Descripción" open>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted">{product.description}</p>
              </Accordion>
            )}
            <Accordion title="Detalles del producto">
              <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-[14px]">
                {details.map((d) => (
                  <div key={d.label} className="contents">
                    <dt className="text-muted">{d.label}</dt>
                    <dd className="text-ink">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </Accordion>
            <Accordion title="Envío y entrega">
              {esLocal ? (
                <div className="space-y-2 text-[14px] leading-relaxed text-muted">
                  <p>
                    Enviamos desde Asunción. En Asunción y Gran Asunción lo recibís en 24 a 48 horas, y al
                    interior del país va por encomienda, en 2 a 4 días hábiles.
                  </p>
                  <p>El costo depende de la zona y lo ves antes de confirmar la compra.</p>
                  <Link href="/envios" className="inline-block text-emerald underline underline-offset-2">
                    Ver zonas y tarifas
                  </Link>
                </div>
              ) : (
                <p className="text-[14px] leading-relaxed text-muted">
                  Este producto lo despacha el proveedor desde el exterior. El plazo estimado es de 15 a
                  30 días y no se combina en el mismo pedido con la perfumería local.
                </p>
              )}
            </Accordion>
            <Accordion title="Formas de pago">
              <p className="text-[14px] leading-relaxed text-muted">
                Podés pagar por transferencia bancaria sin recargo. Al confirmar el pedido te mostramos
                los datos de la cuenta, y lo preparamos apenas se acredita el pago.
              </p>
            </Accordion>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-stone/70 bg-sand/40 py-20">
          <div className={container}>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-champagne">Seguí explorando</p>
                <h2 className="mt-3 text-[38px] text-emerald">También te puede gustar</h2>
              </div>
              <Link href={basePath} className="hidden text-[13px] text-muted hover:text-emerald sm:block">
                Ver todo el catálogo
              </Link>
            </div>
            <CatalogGrid products={related} columns="wide" />
          </div>
        </section>
      )}
    </>
  );
}

function Accordion({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group py-1">
      <summary className="flex items-center justify-between py-4 text-[14px] font-medium tracking-wide text-ink">
        {title}
        <IconChevronDown size={18} className="chevron text-muted transition-transform duration-300" />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}
