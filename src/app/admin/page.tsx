import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { methodsForChannel } from "@/lib/payments";
import { CHANNEL } from "@/lib/constants";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminHome() {
  await requireAdminPage();

  const [pendientes, productos, sinStock, ultimos, vendidoMes] = await Promise.all([
    db.order.count({ where: { status: "PENDIENTE" } }),
    db.product.count({ where: { active: true } }),
    db.variant.count({ where: { stock: { lte: 0 }, active: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    db.order.aggregate({
      _sum: { totalMinor: true },
      where: {
        paymentStatus: "PAGADO",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
      },
    }),
  ]);

  const localMethods = methodsForChannel(CHANNEL.LOCAL);
  const intlMethods = methodsForChannel(CHANNEL.DROPSHIP);
  const faltantes = [...localMethods, ...intlMethods].filter((m) => !m.ready);

  const cards = [
    { label: "Pedidos pendientes", value: String(pendientes) },
    { label: "Productos activos", value: String(productos) },
    { label: "Variantes sin stock", value: String(sinStock) },
    { label: "Cobrado (30 dias)", value: formatMoney(vendidoMes._sum.totalMinor ?? 0, "PYG") },
  ];

  return (
    <div>
      <h1 className="text-2xl">Resumen</h1>

      {faltantes.length > 0 && (
        <div className="mt-6 border border-gold rounded-sm p-5 text-sm">
          <p className="font-medium">Medios de pago sin configurar</p>
          <ul className="mt-2 space-y-1 text-ink-soft">
            {faltantes.map((m) => (
              <li key={m.id}>
                {m.label} — falta cargar las credenciales en las variables de entorno.
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-line rounded-sm p-5">
            <p className="text-xs uppercase tracking-widest text-ink-soft">{card.label}</p>
            <p className="text-2xl mt-2 font-display">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg mt-12 mb-4">Ultimos pedidos</h2>
      {ultimos.length === 0 ? (
        <p className="text-sm text-ink-soft">Todavia no hay pedidos.</p>
      ) : (
        <div className="overflow-x-auto border border-line rounded-sm">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-sand text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ultimos.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={"/admin/pedidos/" + o.id} className="hover:text-gold">
                      {o.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{o.customerName}</td>
                  <td className="px-4 py-3">
                    {formatMoney(o.totalMinor, o.currency as "PYG" | "USD")}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{o.status.toLowerCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
