import ProductCard from "./product-card";

type Product = React.ComponentProps<typeof ProductCard>["product"] & { id: string };

export default function CatalogGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="border border-line rounded-sm py-20 text-center text-ink-soft">
        <p>Todavia no hay productos cargados en esta seccion.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
