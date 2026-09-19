import Link from "next/link";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { requireAdminPage } from "@/lib/auth";
import { PAYMENT_METHOD_LABEL } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/ui";

const TABS = [
  { key: "", label: "Todos" },
  { key: "PENDIENTE", label: "Esperando pago" },
  { key: "PAGADO", label: "Pagados" },
  { key: "PREPARANDO", label: "En preparación" },
  { key: "ENVIADO", label: "Enviados" },
  { key: "ENTREGADO", label: "Entregados" },
  { key: "CANCELADO", label: "Cancelados" },
];

const DOS_DIAS = 48 * 3600 * 1000;

export default async function AdminPedidosPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await requireAdminPage();
  const { estado } = await searchParams;
  const filtro = TABS.some((t) => t.key === estado) ? estado : "";

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: filtro ? { status: filtro } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { items: true },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countOf = (key: string) =>
    key ? (counts.find((c) => c.status === key)?._count._all ?? 0) : counts.reduce((s, c) => s + c._count._all, 0);
  const ahora = Date.now();

  return (
    <div>
      <h1 className="text-[42px] text-emerald">Pedidos</h1>
      <p className="mt-1 text-[14px] text-muted">
        Los pedidos por transferencia quedan esperando pago hasta que lo confirmes.
      </p>

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-stone/70 pb-4">
        {TABS.map((t) => {
          const active = (filtro ?? "") === t.key;
          const n = countOf(t.key);
          return (
            <Link
              key={t.key}
              href={t.key ? "/admin/pedidos?estado=" + t.key : "/admin/pedidos"}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] transition-colors",
                active ? "bg-emerald text-pearl" : "bg-pearl text-ink hover:bg-sand",
              )}
            >
              {t.label}
              <span className={cn("tabular text-[11px]", active ? "text-champagne-2" : "text-subtle")}>{n}</span>
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone px-6 py-20 text-center">
          <p className="font-display text-2xl text-emerald">No hay pedidos en esta sección</p>
          <p className="mt-2 text-[14px] text-muted">Cuando entre un pedido lo vas a ver acá.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone/70 bg-pearl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-[14px]">
              <thead>
                <tr className="border-b border-stone/70 bg-sand/50 text-left text-[11px] tracking-[0.12em] uppercase text-muted">
                  <th className="px-5 py-3.5 font-medium">Pedido</th>
                  <th className="px-5 py-3.5 font-medium">Cliente</th>
                  <th className="px-5 py-3.5 font-medium">Pago</th>
                  <th className="px-5 py-3.5 font-medium">Estado</th>
                  <th className="px-5 py-3.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/60">
                {orders.map((o) => {
                  const viejo = o.status === "PENDIENTE" && ahora - o.createdAt.getTime() > DOS_DIAS;
                  const dias = Math.floor((ahora - o.createdAt.getTime()) / (24 * 3600 * 1000));
                  return (
                    <tr key={o.id} className="transition-colors hover:bg-sand/40">
                      <td className="px-5 py-4">
                        <Link href={"/admin/pedidos/" + o.id} className="font-medium text-emerald hover:underline">
                          {o.code}
                        </Link>
                        <p className="text-[12px] text-muted">
                          {o.createdAt.toLocaleDateString("es-PY", { day: "numeric", month: "short" })} ·{" "}
                          {o.createdAt.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-ink">{o.customerName}</p>
                        <p className="text-[12px] text-muted">
                          {o.items.reduce((s, i) => s + i.qty, 0)} art. · {o.shipZoneName || o.shipCity}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] text-ink">{PAYMENT_METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod}</p>
                        <div className="mt-1">
                          <PaymentStatusBadge status={o.paymentStatus} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <OrderStatusBadge status={o.status} />
                        {viejo && (
                          <p className="mt-1.5 text-[11px] text-wine">Sin pago hace {dias} días</p>
                        )}
                      </td>
                      <td className="tabular px-5 py-4 text-right font-medium text-ink">
                        {formatMoney(o.totalMinor, o.currency as "PYG" | "USD")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
