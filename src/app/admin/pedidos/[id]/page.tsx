import Link from "next/link";
import { notFound } from "next/navigation";
import { cancelOrderAction, confirmTransfer, setOrderStatus } from "../../actions";
import CopyField from "@/components/copy-field";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { IconAlert, IconArrowRight, IconChevronRight, IconWhatsapp } from "@/components/icons";
import { requireAdminPage } from "@/lib/auth";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, paraguayPhoneToWhatsapp } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { orderPath } from "@/lib/order-token";
import { btn, cn } from "@/lib/ui";

// El siguiente paso natural de cada estado, para avanzar con un solo boton.
const NEXT: Record<string, { status: string; label: string }> = {
  PAGADO: { status: "PREPARANDO", label: "Marcar en preparación" },
  PREPARANDO: { status: "ENVIADO", label: "Marcar como enviado" },
  ENVIADO: { status: "ENTREGADO", label: "Marcar como entregado" },
};

export default async function AdminPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();

  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const currency = order.currency as "PYG" | "USD";
  const cancelado = order.status === "CANCELADO";
  const pendienteTransferencia =
    order.paymentMethod === "transferencia" && order.paymentStatus === "PENDIENTE" && !cancelado;
  const next = NEXT[order.status];
  const wa = paraguayPhoneToWhatsapp(order.customerPhone);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const customerLink = site + orderPath(order.code);

  return (
    <div className="max-w-5xl">
      <nav className="flex items-center gap-1.5 text-[12px] text-muted">
        <Link href="/admin/pedidos" className="hover:text-emerald">
          Pedidos
        </Link>
        <IconChevronRight size={13} />
        <span className="text-ink">{order.code}</span>
      </nav>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[40px] leading-tight text-emerald">Pedido {order.code}</h1>
          <p className="mt-1 text-[14px] text-muted">
            {order.createdAt.toLocaleString("es-PY", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          {/* Con los dos pendientes, el segundo cartel repite lo mismo. */}
          {!(order.status === "PENDIENTE" && order.paymentStatus === "PENDIENTE") && (
            <PaymentStatusBadge status={order.paymentStatus} />
          )}
        </div>
      </header>

      {/* Acciones */}
      {!cancelado && (
        <section className="mt-8 rounded-2xl border border-emerald/20 bg-emerald/[0.03] p-6">
          {pendienteTransferencia ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-[22px] text-emerald">¿Llegó la transferencia?</p>
                <p className="text-[13px] text-muted">
                  Revisá en tu cuenta un ingreso de{" "}
                  <strong className="text-ink">{formatMoney(order.totalMinor, currency)}</strong> con el concepto{" "}
                  <strong className="text-ink">{order.code}</strong>.
                </p>
              </div>
              <form action={confirmTransfer}>
                <input type="hidden" name="id" value={order.id} />
                <button type="submit" className={btn.primary}>
                  Confirmar pago recibido
                </button>
              </form>
            </div>
          ) : next ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-[22px] text-emerald">Siguiente paso</p>
                <p className="text-[13px] text-muted">
                  Estado actual: {ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL]}
                </p>
              </div>
              <form action={setOrderStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value={next.status} />
                <button type="submit" className={btn.primary}>
                  {next.label} <IconArrowRight size={16} />
                </button>
              </form>
            </div>
          ) : (
            <p className="font-display text-[22px] text-emerald">Pedido entregado. No queda nada por hacer.</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-emerald/10 pt-5">
            {wa && (
              <a
                href={
                  "https://wa.me/" +
                  wa +
                  "?text=" +
                  encodeURIComponent("Hola " + order.customerName.split(" ")[0] + ", te escribo por tu pedido " + order.code + " en Zunilda Perfumería.")
                }
                target="_blank"
                rel="noopener noreferrer"
                className={btn.smallOutline}
              >
                <IconWhatsapp size={15} className="text-success" /> Escribir al cliente
              </a>
            )}
            <form action={setOrderStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="rounded-full border border-stone bg-pearl px-4 py-2 text-[12px]"
                aria-label="Cambiar estado"
              >
                {ORDER_STATUSES.filter((s) => s !== "CANCELADO").map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className={btn.smallOutline}>
                Cambiar
              </button>
            </form>
            <details className="relative ml-auto">
              <summary className="rounded-full px-4 py-2 text-[12px] tracking-[0.08em] uppercase text-danger hover:bg-danger/10">
                Cancelar pedido
              </summary>
              <div className="absolute right-0 z-10 mt-2 w-72 rounded-2xl border border-stone bg-pearl p-5 shadow-lift">
                <p className="text-[13px] leading-relaxed text-ink">
                  El pedido se cancela y los productos vuelven al stock. No se puede deshacer.
                </p>
                <form action={cancelOrderAction} className="mt-4">
                  <input type="hidden" name="id" value={order.id} />
                  <button type="submit" className="w-full rounded-full bg-danger px-4 py-2.5 text-[12px] tracking-[0.08em] uppercase text-pearl">
                    Sí, cancelar
                  </button>
                </form>
              </div>
            </details>
          </div>
        </section>
      )}

      {cancelado && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-stone bg-sand/60 px-5 py-4 text-[14px] text-muted">
          <IconAlert size={19} className="mt-0.5 shrink-0" />
          Este pedido está cancelado y sus productos ya volvieron al stock.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Articulos */}
        <section className="min-w-0 rounded-2xl border border-stone/70 bg-pearl p-6">
          <h2 className="font-display text-[24px] text-emerald">Artículos</h2>
          <ul className="mt-4 divide-y divide-stone/60">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3.5 text-[14px]">
                <span>
                  <span className="text-ink">{item.productName}</span>
                  <span className="block text-[12px] text-muted">
                    {item.variantLabel} · {item.qty} × {formatMoney(item.unitPriceMinor, currency)}
                  </span>
                </span>
                <span className="tabular text-ink">{formatMoney(item.lineTotalMinor, currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-2 border-t border-stone pt-4 text-[14px]">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="tabular">{formatMoney(order.subtotalMinor, currency)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Envío · {order.shipZoneName || "sin zona"}</span>
              <span className="tabular">{formatMoney(order.shippingMinor, currency)}</span>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <span className="font-medium text-ink">Total</span>
              <span className="tabular font-display text-[30px] text-emerald">
                {formatMoney(order.totalMinor, currency)}
              </span>
            </div>
          </div>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-stone/70 bg-pearl p-6 text-[14px]">
            <h2 className="font-display text-[24px] text-emerald">Cliente</h2>
            <p className="mt-3 text-ink">{order.customerName}</p>
            <p className="text-muted">{order.customerPhone}</p>
            <p className="text-muted">{order.customerEmail}</p>
            {order.customerDoc && <p className="text-muted">CI/RUC {order.customerDoc}</p>}
          </section>

          <section className="rounded-2xl border border-stone/70 bg-pearl p-6 text-[14px]">
            <h2 className="font-display text-[24px] text-emerald">Entrega</h2>
            <p className="mt-3 text-ink">{order.shipZoneName || "Sin zona"}</p>
            <p className="text-muted">{order.shipAddress}</p>
            <p className="text-muted">{order.shipCity}</p>
            {order.shipNotes && <p className="mt-2 italic text-muted">{order.shipNotes}</p>}
          </section>

          <section className="rounded-2xl border border-stone/70 bg-pearl p-6 text-[14px]">
            <h2 className="font-display text-[24px] text-emerald">Pago</h2>
            <p className="mt-3 text-ink">{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
            {order.paymentRef && <p className="text-[12px] text-muted">Referencia: {order.paymentRef}</p>}
            {site && (
              <div className="mt-3 border-t border-stone/60">
                <CopyField label="Enlace del pedido para el cliente" value={customerLink} />
              </div>
            )}
          </section>
        </div>
      </div>

      {order.adminNotes && (
        <p className={cn("mt-6 whitespace-pre-line rounded-2xl bg-sand/60 px-5 py-4 text-[13px] text-muted")}>
          <strong className="font-medium text-ink">Notas internas: </strong>
          {order.adminNotes}
        </p>
      )}
    </div>
  );
}
