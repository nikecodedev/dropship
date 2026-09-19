import Link from "next/link";
import { updateStock } from "../actions";
import { IconPlus } from "@/components/icons";
import { requireAdminPage } from "@/lib/auth";
import { coverImage } from "@/lib/catalog";
import { CHANNEL_LABEL, type Channel } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { btn, cn } from "@/lib/ui";

const TABS = [
  { key: "", label: "Todos" },
  { key: "publicados", label: "Publicados" },
  { key: "ocultos", label: "Ocultos" },
];

export default async function AdminProductosPage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  await requireAdminPage();
  const { ver } = await searchParams;

  const products = await db.product.findMany({
    where: ver === "publicados" ? { active: true } : ver === "ocultos" ? { active: false } : {},
    include: { variants: { orderBy: [{ sizeMl: "asc" }, { priceMinor: "asc" }] } },
    orderBy: [{ active: "desc" }, { brand: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[42px] text-emerald">Productos</h1>
          <p className="mt-1 text-[14px] text-muted">El stock se puede corregir directo desde esta lista.</p>
        </div>
        <Link href="/admin/productos/nuevo" className={btn.primary}>
          <IconPlus size={16} /> Nuevo producto
        </Link>
      </div>

      <div className="mt-8 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? "/admin/productos?ver=" + t.key : "/admin/productos"}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] transition-colors",
              (ver ?? "") === t.key ? "bg-emerald text-pearl" : "bg-pearl text-ink hover:bg-sand",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone px-6 py-20 text-center">
          <p className="font-display text-2xl text-emerald">No hay productos en esta sección</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {products.map((p) => {
            const img = coverImage(p.images);
            return (
              <li
                key={p.id}
                className={cn(
                  "grid gap-5 rounded-2xl border bg-pearl p-4 sm:grid-cols-[72px_1fr] lg:grid-cols-[72px_1.1fr_1.6fr_auto] lg:items-center",
                  p.active ? "border-stone/70" : "border-dashed border-stone opacity-80",
                )}
              >
                <Link href={"/admin/productos/" + p.id} className="h-[90px] w-[72px] overflow-hidden rounded-xl bg-sand">
                  {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                </Link>

                <div className="min-w-0">
                  <p className="eyebrow text-[10px] text-muted">{p.brand}</p>
                  <Link href={"/admin/productos/" + p.id} className="font-display text-[22px] leading-tight text-ink hover:text-emerald">
                    {p.name}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px]",
                        p.active ? "bg-success/12 text-success" : "bg-stone text-muted",
                      )}
                    >
                      {p.active ? "Publicado" : "Oculto"}
                    </span>
                    <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] text-muted">
                      {CHANNEL_LABEL[p.channel as Channel]}
                    </span>
                    {p.featured && (
                      <span className="rounded-full bg-champagne-3 px-2.5 py-0.5 text-[11px] text-[#7a5b1f]">Destacado</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  {p.variants.length === 0 && (
                    <p className="text-[13px] text-muted">Sin presentaciones cargadas.</p>
                  )}
                  {p.variants.map((v) => (
                    <form
                      key={v.id}
                      action={updateStock}
                      className="flex items-center gap-3 rounded-xl bg-sand/50 px-3 py-2"
                    >
                      <input type="hidden" name="id" value={v.id} />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{v.label}</span>
                      <span className="tabular text-[13px] text-muted">
                        {formatMoney(v.priceMinor, p.currency as "PYG" | "USD")}
                      </span>
                      {p.channel === "LOCAL" ? (
                        <>
                          <label className="flex items-center gap-1.5 text-[12px] text-muted">
                            Stock
                            <input
                              name="stock"
                              type="number"
                              min={0}
                              defaultValue={v.stock}
                              className={cn(
                                "tabular w-16 rounded-lg border bg-pearl px-2 py-1 text-center text-[13px]",
                                v.stock <= 0 ? "border-danger/40 text-danger" : "border-stone text-ink",
                              )}
                            />
                          </label>
                          <button type="submit" className="rounded-lg px-2 py-1 text-[12px] text-emerald hover:bg-pearl">
                            Guardar
                          </button>
                        </>
                      ) : (
                        <span className="text-[12px] text-subtle">Stock del proveedor</span>
                      )}
                    </form>
                  ))}
                </div>

                <Link
                  href={"/admin/productos/" + p.id}
                  className="hidden text-[12px] tracking-[0.1em] uppercase text-muted hover:text-emerald lg:block"
                >
                  Editar
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
