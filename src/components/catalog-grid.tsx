import ProductCard, { type CardProduct } from "./product-card";
import { cn } from "@/lib/ui";

export default function CatalogGrid({
  products,
  columns = "catalog",
}: {
  products: CardProduct[];
  columns?: "catalog" | "wide";
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6",
        columns === "wide" ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3",
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
