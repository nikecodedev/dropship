import Link from "next/link";
import { coverImage, fromPrice, fullName, productHref, sizeSummary, totalStock } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { CONCENTRATION_LABEL, type Channel, type Concentration } from "@/lib/constants";
import QuickAdd from "./quick-add";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  images: string;
  currency: string;
  channel: string;
  concentration: string;
  featured: boolean;
  variants: {
    id: string;
    label: string;
    priceMinor: number;
    stock: number;
    sizeMl: number | null;
  }[];
};

export default function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  const href = productHref(product);
  const image = coverImage(product.images);
  const price = fromPrice(product.variants);
  const esLocal = product.channel === "LOCAL";
  const stock = totalStock(product.variants);
  const agotado = esLocal && stock <= 0;
  const ultima = esLocal && stock === 1;
  const concentration = CONCENTRATION_LABEL[product.concentration as Concentration] ?? "";
  const single = product.variants.length === 1 ? product.variants[0] : null;
  const canQuickAdd = single && !agotado && (!esLocal || single.stock > 0);

  return (
    <article className="group relative flex flex-col">
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sand"
        aria-label={fullName(product.brand, product.name)}
      >
        {image ? (
          <img
            src={image}
            alt={fullName(product.brand, product.name)}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-luxe)] group-hover:scale-[1.045]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-subtle">
            Foto próximamente
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {agotado && (
            <span className="rounded-full bg-ink/85 px-3 py-1 text-[10px] tracking-[0.14em] uppercase text-pearl">
              Agotado
            </span>
          )}
          {ultima && (
            <span className="rounded-full bg-wine px-3 py-1 text-[10px] tracking-[0.14em] uppercase text-pearl">
              Última unidad
            </span>
          )}
          {!agotado && !ultima && product.featured && (
            <span className="rounded-full bg-pearl/90 px-3 py-1 text-[10px] tracking-[0.14em] uppercase text-emerald backdrop-blur">
              Más pedido
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <p className="eyebrow text-[10px] text-muted">{product.brand}</p>
        <Link href={href} className="mt-1.5">
          <h3 className="font-display text-[22px] leading-[1.1] text-ink transition-colors group-hover:text-emerald">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-[12px] text-subtle">
          {[concentration, sizeSummary(product.variants)].filter(Boolean).join(" · ")}
        </p>
        {price !== null && (
          <p className="tabular mt-2.5 text-[15px] font-medium text-emerald">
            {product.variants.length > 1 && <span className="font-normal text-muted">Desde </span>}
            {formatMoney(price, product.currency as "PYG" | "USD")}
          </p>
        )}
        {canQuickAdd && single && (
          <div className="mt-auto pt-4">
            <QuickAdd
              variant={single}
              product={{
                slug: product.slug,
                brand: product.brand,
                name: product.name,
                image,
                currency: product.currency as "PYG" | "USD",
                channel: product.channel as Channel,
              }}
            />
          </div>
        )}
        {!canQuickAdd && !agotado && (
          <div className="mt-auto pt-4">
            <Link
              href={href}
              className="flex w-full items-center justify-center rounded-full border border-stone py-3 text-[11px] font-medium tracking-[0.16em] uppercase text-emerald transition-colors hover:border-emerald hover:bg-emerald hover:text-pearl"
            >
              Elegir tamaño
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
