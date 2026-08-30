import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { CHANNEL_LABEL, type Channel } from "@/lib/constants";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminPedidosPage() {
  await requireAdminPage();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-2xl mb-8">Pedidos</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-ink-soft">Todavia no hay pedidos.</p>
      ) : (
        <div className="overflow-x-auto border border-line rounded-sm">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-sand text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Catalogo</th>
                <th className="px-4 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={"/admin/pedidos/" + o.id} className="hover:text-gold">
                      {o.code}
                    </Link>
                    <span className="block text-xs text-ink-soft">
                      {o.items.length} {o.items.length === 1 ? "articulo" : "articulos"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {o.createdAt.toLocaleDateString("es-PY")}
                  </td>
                  <td className="px-4 py-3">
                    {o.customerName}
                    <span className="block text-xs text-ink-soft">{o.customerPhone}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {CHANNEL_LABEL[o.channel as Channel]}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {o.paymentMethod}
                    <span className="block text-xs">{o.paymentStatus.toLowerCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{o.status.toLowerCase()}</td>
                  <td className="px-4 py-3 text-right">
                    {formatMoney(o.totalMinor, o.currency as "PYG" | "USD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
