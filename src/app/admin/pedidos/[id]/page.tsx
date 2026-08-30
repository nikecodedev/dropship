import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { confirmTransfer, setOrderStatus } from "../../actions";
import { ORDER_STATUSES } from "@/lib/constants";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();

  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const currency = order.currency as "PYG" | "USD";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl">Pedido {order.code}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {order.createdAt.toLocaleString("es-PY")} · {order.paymentMethod} ·{" "}
        {order.paymentStatus.toLowerCase()}
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-6 text-sm">
        <div className="border border-line rounded-sm p-5">
          <p className="text-xs uppercase tracking-widest text-ink-soft mb-3">Cliente</p>
          <p>{order.customerName}</p>
          <p className="text-ink-soft">{order.customerEmail}</p>
          <p className="text-ink-soft">{order.customerPhone}</p>
          {order.customerDoc && <p className="text-ink-soft">CI/RUC {order.customerDoc}</p>}
        </div>

        <div className="border border-line rounded-sm p-5">
          <p className="text-xs uppercase tracking-widest text-ink-soft mb-3">Envio</p>
          <p>{order.shipZoneName || "Sin zona"}</p>
          <p className="text-ink-soft">{order.shipAddress}</p>
          <p className="text-ink-soft">{order.shipCity}</p>
          {order.shipNotes && <p className="text-ink-soft mt-2">{order.shipNotes}</p>}
        </div>
      </div>

      <div className="mt-6 border border-line rounded-sm p-5">
        <p className="text-xs uppercase tracking-widest text-ink-soft mb-3">Articulos</p>
        <ul className="space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.productName} {item.variantLabel} x{item.qty}
              </span>
              <span>{formatMoney(item.lineTotalMinor, currency)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line mt-4 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotalMinor, currency)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Envio</span>
            <span>{formatMoney(order.shippingMinor, currency)}</span>
          </div>
          <div className="flex justify-between text-base pt-1">
            <span>Total</span>
            <span>{formatMoney(order.totalMinor, currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-4">
        <form action={setOrderStatus} className="flex items-end gap-2">
          <input type="hidden" name="id" value={order.id} />
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-ink-soft">Estado</span>
            <select
              name="status"
              defaultValue={order.status}
              className="mt-1 border border-line rounded-sm px-3 py-2 text-sm bg-white"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="bg-ink text-cream px-5 py-2.5 text-sm rounded-sm">
            Actualizar
          </button>
        </form>

        {/* La transferencia bancaria se confirma a mano: no hay pasarela que
            avise. Al confirmar se descuenta el stock. */}
        {order.paymentMethod === "transferencia" && order.paymentStatus === "PENDIENTE" && (
          <form action={confirmTransfer}>
            <input type="hidden" name="id" value={order.id} />
            <button
              type="submit"
              className="border border-gold text-gold px-5 py-2.5 text-sm rounded-sm"
            >
              Confirmar transferencia recibida
            </button>
          </form>
        )}
      </div>

      {order.adminNotes && (
        <p className="mt-6 text-xs text-ink-soft">Nota interna: {order.adminNotes}</p>
      )}
    </div>
  );
}
