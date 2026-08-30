import Link from "next/link";
import { coverImage, fromPrice } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { CONCENTRATION_LABEL, type Concentration } from "@/lib/constants";

type Props = {
  product: {
    slug: string;
    name: string;
    brand: string;
    images: string;
    currency: string;
    channel: string;
    concentration: string;
    variants: { priceMinor: number; stock: number; sizeMl: number | null }[];
  };
};

export default function ProductCard({ product }: Props) {
  const href = (product.channel === "LOCAL" ? "/perfumes/" : "/internacional/") + product.slug;
  const image = coverImage(product.images);
  const price = fromPrice(product.variants);
  const agotado =
    product.channel === "LOCAL" && product.variants.every((v) => v.stock <= 0);

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[3/4] bg-sand overflow-hidden rounded-sm">
        {image ? (
          <img
            src={image}
            alt={product.brand + " " + product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-ink-soft text-xs px-4 text-center">
            Foto pendiente
          </div>
        )}
        {agotado && (
          <span className="absolute top-3 left-3 bg-ink text-sand text-[11px] px-2 py-1 rounded-sm">
            Sin stock
          </span>
        )}
      </div>

      <div className="pt-3">
        <p className="text-[11px] uppercase tracking-widest text-ink-soft">{product.brand}</p>
        <h3 className="text-base leading-snug mt-1 group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-ink-soft mt-0.5">
          {CONCENTRATION_LABEL[product.concentration as Concentration] ?? ""}
        </p>
        {price !== null && (
          <p className="mt-2 text-sm">
            {product.variants.length > 1 ? "Desde " : ""}
            {formatMoney(price, product.currency as "PYG" | "USD")}
          </p>
        )}
      </div>
    </Link>
  );
}
