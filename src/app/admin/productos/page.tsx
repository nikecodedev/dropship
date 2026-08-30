import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { updateStock } from "../actions";
import { CHANNEL_LABEL, type Channel } from "@/lib/constants";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminProductosPage() {
  await requireAdminPage();

  const products = await db.product.findMany({
    include: { variants: { orderBy: { sizeMl: "asc" } } },
    orderBy: [{ channel: "asc" }, { brand: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-ink text-cream px-5 py-2.5 text-sm rounded-sm"
        >
          Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-ink-soft">Todavia no hay productos cargados.</p>
      ) : (
        <div className="space-y-5">
          {products.map((p) => (
            <div key={p.id} className="border border-line rounded-sm p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <Link href={"/admin/productos/" + p.id} className="hover:text-gold">
                    <span className="text-xs uppercase tracking-widest text-ink-soft">
                      {p.brand}
                    </span>
                    <span className="block text-base">{p.name}</span>
                  </Link>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-soft">
                  <span className="border border-line rounded-full px-3 py-1">
                    {CHANNEL_LABEL[p.channel as Channel]}
                  </span>
                  {!p.active && (
                    <span className="border border-line rounded-full px-3 py-1">Oculto</span>
                  )}
                </div>
              </div>

              {/* El stock se edita desde el listado porque es lo que mas se
                  toca en el dia a dia. Todo lo demas vive en la ficha. */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {p.variants.map((v) => (
                  <form
                    key={v.id}
                    action={updateStock}
                    className="flex items-center gap-2 border border-line rounded-sm px-3 py-2"
                  >
                    <input type="hidden" name="id" value={v.id} />
                    <span className="text-sm flex-1">{v.label}</span>
                    <span className="text-xs text-ink-soft">
                      {formatMoney(v.priceMinor, p.currency as "PYG" | "USD")}
                    </span>
                    {p.channel === "LOCAL" ? (
                      <>
                        <input
                          name="stock"
                          type="number"
                          defaultValue={v.stock}
                          className="w-16 border border-line rounded-sm px-2 py-1 text-sm bg-white"
                        />
                        <button type="submit" className="text-xs underline hover:text-gold">
                          ok
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-ink-soft">stock del proveedor</span>
                    )}
                  </form>
                ))}
                {p.variants.length === 0 && (
                  <p className="text-xs text-ink-soft">
                    Sin presentaciones cargadas.{" "}
                    <Link href={"/admin/productos/" + p.id} className="underline">
                      Agregar
                    </Link>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
