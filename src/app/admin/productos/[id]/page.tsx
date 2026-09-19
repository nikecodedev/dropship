import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/product-form";
import VariantEditor from "@/components/admin/variant-editor";
import { IconChevronRight, IconExternal } from "@/components/icons";
import { requireAdminPage } from "@/lib/auth";
import { fullName, parseImages, productHref } from "@/lib/catalog";
import { db } from "@/lib/db";
import { btn } from "@/lib/ui";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();

  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { variants: { orderBy: [{ sizeMl: "asc" }, { priceMinor: "asc" }] } },
  });
  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <nav className="flex items-center gap-1.5 text-[12px] text-muted">
        <Link href="/admin/productos" className="hover:text-emerald">
          Productos
        </Link>
        <IconChevronRight size={13} />
        <span className="text-ink">{fullName(product.brand, product.name)}</span>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-champagne">{product.brand}</p>
          <h1 className="mt-1 text-[42px] leading-tight text-emerald">{product.name}</h1>
        </div>
        {product.active && (
          <Link href={productHref(product)} target="_blank" className={btn.smallOutline}>
            <IconExternal size={14} /> Ver en la tienda
          </Link>
        )}
      </header>

      <section className="mt-8">
        <h2 className="font-display text-[26px] text-emerald">Presentaciones, precio y stock</h2>
        <p className="mb-5 mt-1 text-[13px] text-muted">
          Cada tamaño con su precio y su stock. El stock baja solo con cada pedido y vuelve si el pedido se cancela.
        </p>
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
      </section>

      <section className="mt-12">
        <h2 className="mb-5 font-display text-[26px] text-emerald">Ficha del producto</h2>
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
      </section>
    </div>
  );
}
