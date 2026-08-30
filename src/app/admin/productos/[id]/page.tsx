import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/product-form";
import VariantEditor from "@/components/admin/variant-editor";
import { db } from "@/lib/db";
import { parseImages } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/auth";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { variants: { orderBy: { sizeMl: "asc" } } },
  });
  if (!product) notFound();

  const publicHref =
    (product.channel === "LOCAL" ? "/perfumes/" : "/internacional/") + product.slug;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl">
          {product.brand} {product.name}
        </h1>
        <Link href={publicHref} className="text-sm text-ink-soft hover:text-gold">
          Ver en la tienda
        </Link>
      </div>

      <ProductForm
        values={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          description: product.description,
          channel: product.channel,
          concentration: product.concentration,
          gender: product.gender,
          condition: product.condition,
          images: parseImages(product.images),
          active: product.active,
          featured: product.featured,
          supplierRef: product.supplierRef ?? "",
        }}
      />

      <h2 className="text-lg mt-14 mb-4">Presentaciones</h2>
      <VariantEditor
        productId={product.id}
        currency={product.currency as "PYG" | "USD"}
        variants={product.variants.map((v) => ({
          id: v.id,
          label: v.label,
          sizeMl: v.sizeMl,
          sku: v.sku,
          priceMinor: v.priceMinor,
          stock: v.stock,
          active: v.active,
        }))}
      />
    </div>
  );
}
