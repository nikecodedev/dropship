import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { IconAlert, IconArrowRight, IconBox, IconClock, IconReceipt, IconSparkle } from "@/components/icons";
import { requireAdminPage } from "@/lib/auth";
import { CHANNEL, fullName } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { methodsForChannel } from "@/lib/payments";
import { cn } from "@/lib/ui";

const DOS_DIAS = 48 * 3600 * 1000;

export default async function AdminHome() {
  await requireAdminPage();

  const hace30 = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [pendientes, porPreparar, cobrado, productos, ocultos, ultimos, pocoStock, pendientesViejos] =
    await Promise.all([
      db.order.aggregate({ where: { status: "PENDIENTE" }, _count: { _all: true }, _sum: { totalMinor: true } }),
      db.order.count({ where: { status: { in: ["PAGADO", "PREPARANDO"] } } }),
      db.order.aggregate({
        where: { paymentStatus: "PAGADO", status: { not: "CANCELADO" }, createdAt: { gte: hace30 } },
        _sum: { totalMinor: true },
        _count: { _all: true },
      }),
      db.product.count({ where: { active: true } }),
      db.product.count({ where: { active: false } }),
      db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { items: true } }),
      db.variant.findMany({
        where: { active: true, stock: { lte: 1 }, product: { active: true, channel: CHANNEL.LOCAL } },
        include: { product: true },
        orderBy: { stock: "asc" },
      }),
      db.order.count({ where: { status: "PENDIENTE", createdAt: { lt: new Date(Date.now() - DOS_DIAS) } } }),
    ]);

  const sinConfigurar = methodsForChannel(CHANNEL.LOCAL).filter((m) => !m.ready);

  const kpis = [
    {
      label: "Esperando pago",
      value: String(pendientes._count._all),
      hint: formatMoney(pendientes._sum.totalMinor ?? 0, "PYG") + " por cobrar",
      icon: IconClock,
      href: "/admin/pedidos?estado=PENDIENTE",
    },
    {
      label: "Para preparar",
      value: String(porPreparar),
      hint: "Pagados, sin enviar",
      icon: IconReceipt,
      href: "/admin/pedidos?estado=PAGADO",
    },
    {
      label: "Cobrado en 30 días",
      value: formatMoney(cobrado._sum.totalMinor ?? 0, "PYG"),
      hint: cobrado._count._all + (cobrado._count._all === 1 ? " pedido pagado" : " pedidos pagados"),
      icon: IconSparkle,
      href: "/admin/pedidos",
    },
    {
      label: "Productos publicados",
      value: String(productos),
      hint: ocultos ? ocultos + " ocultos" : "Todos visibles",
      icon: IconBox,
      href: "/admin/productos",
    },
  ];

  const hoy = new Intl.DateTimeFormat("es-PY", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[13px] text-muted first-letter:uppercase">{hoy}</p>
        <h1 className="mt-1 text-[42px] text-emerald">Hola, Zunilda</h1>
      </header>

      {/* Avisos */}
      {(pendientesViejos > 0 || sinConfigurar.length > 0) && (
        <div className="space-y-3">
          {pendientesViejos > 0 && (
            <Link
              href="/admin/pedidos?estado=PENDIENTE"
              className="flex items-start gap-3 rounded-2xl border border-wine/25 bg-wine/5 px-5 py-4 text-[14px] text-wine transition-colors hover:bg-wine/10"
            >
              <IconAlert size={19} className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-medium">
                  {pendientesViejos} {pendientesViejos === 1 ? "pedido espera" : "pedidos esperan"} pago hace más de 48 horas.
                </strong>{" "}
                Mientras no los canceles, el stock sigue reservado y no se puede vender a otra persona.
              </span>
            </Link>
          )}
          {sinConfigurar.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-champagne/50 bg-champagne-3/40 px-5 py-4 text-[14px] text-[#6b5020]">
              <IconAlert size={19} className="mt-0.5 shrink-0" />
              <span>
                <strong className="font-medium">
                  {sinConfigurar.map((m) => m.label).join(", ")}
                </strong>{" "}
                todavía no está habilitado. Por ahora la tienda cobra solo por transferencia.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, hint, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-stone/70 bg-pearl p-6 transition-shadow hover:shadow-card"
          >
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-muted">{label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-emerald">
                <Icon size={17} />
              </span>
            </div>
            <p className="tabular mt-4 font-display text-[34px] leading-none text-emerald">{value}</p>
            <p className="mt-2 text-[12px] text-subtle">{hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Ultimos pedidos */}
        <section className="rounded-2xl border border-stone/70 bg-pearl">
          <div className="flex items-center justify-between border-b border-stone/70 px-6 py-5">
            <h2 className="font-display text-[26px] text-emerald">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="flex items-center gap-1 text-[13px] text-muted hover:text-emerald">
              Ver todos <IconArrowRight size={15} />
            </Link>
          </div>
          {ultimos.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-display text-2xl text-emerald">Todavía no hay pedidos</p>
              <p className="mt-2 text-[14px] text-muted">Cuando alguien compre, lo vas a ver acá.</p>
            </div>
          ) : (
            <ul className="divide-y divide-stone/60">
              {ultimos.map((o) => (
                <li key={o.id}>
                  <Link
                    href={"/admin/pedidos/" + o.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 transition-colors hover:bg-sand/50"
                  >
                    <div className="min-w-[140px] flex-1">
                      <p className="text-[14px] font-medium text-ink">{o.customerName}</p>
                      <p className="text-[12px] text-muted">
                        {o.code} · {o.items.reduce((s, i) => s + i.qty, 0)} art. ·{" "}
                        {o.createdAt.toLocaleDateString("es-PY", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                    <p className="tabular w-32 text-right text-[14px] font-medium text-ink">
                      {formatMoney(o.totalMinor, o.currency as "PYG" | "USD")}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Stock bajo */}
        <section className="rounded-2xl border border-stone/70 bg-pearl">
          <div className="border-b border-stone/70 px-6 py-5">
            <h2 className="font-display text-[26px] text-emerald">Últimas unidades</h2>
            <p className="text-[12px] text-muted">Presentaciones con una unidad o sin stock</p>
          </div>
          {pocoStock.length === 0 ? (
            <p className="px-6 py-10 text-center text-[14px] text-muted">Todo el catálogo tiene stock.</p>
          ) : (
            <ul className="divide-y divide-stone/60">
              {pocoStock.map((v) => (
                <li key={v.id}>
                  <Link
                    href={"/admin/productos/" + v.productId}
                    className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-sand/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] text-ink">
                        {fullName(v.product.brand, v.product.name)}
                      </span>
                      <span className="text-[12px] text-muted">{v.label}</span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                        v.stock <= 0 ? "bg-danger/10 text-danger" : "bg-champagne-3 text-[#7a5b1f]",
                      )}
                    >
                      {v.stock <= 0 ? "Agotado" : "Queda 1"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
