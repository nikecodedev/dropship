import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { bankTransfer } from "@/lib/payments/bank-transfer";

export const metadata = { title: "Tu pedido" };
export const dynamic = "force-dynamic";

export default async function PedidoPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await db.order.findUnique({ where: { code }, include: { items: true } });
  if (!order) notFound();

  const currency = order.currency as "PYG" | "USD";

  // Para transferencia volvemos a generar las instrucciones con los datos
  // bancarios vigentes, en vez de guardarlas congeladas en la base.
  const instructions =
    order.paymentMethod === "transferencia" && order.paymentStatus === "PENDIENTE"
      ? await bankTransfer.createCheckout({
          code: order.code,
          totalMinor: order.totalMinor,
          currency,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          customerDoc: order.customerDoc,
          items: [],
        })
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gold">Pedido {order.code}</p>
      <h1 className="text-3xl mt-3">Recibimos tu pedido</h1>
      <p className="mt-4 text-sm text-ink-soft leading-relaxed">
        Te enviamos la confirmacion a {order.customerEmail}. Guarda el numero {order.code} para
        cualquier consulta.
      </p>

      {instructions && instructions.kind === "instructions" && (
        <div
          className="mt-8 border border-line rounded-sm p-6 text-sm leading-relaxed prose-instructions bg-white/60"
          dangerouslySetInnerHTML={{ __html: instructions.html }}
        />
      )}

      <div className="mt-10 border-t border-line pt-6">
        <h2 className="text-lg mb-4">Detalle</h2>
        <ul className="space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="text-ink-soft">
                {item.productName} {item.variantLabel} x{item.qty}
              </span>
              <span>{formatMoney(item.lineTotalMinor, currency)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-line mt-5 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Subtotal</span>
            <span>{formatMoney(order.subtotalMinor, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">
              Envio {order.shipZoneName ? "· " + order.shipZoneName : ""}
            </span>
            <span>
              {order.channel === "DROPSHIP" && order.shippingMinor === 0
                ? "A confirmar"
                : formatMoney(order.shippingMinor, currency)}
            </span>
          </div>
          <div className="flex justify-between text-base pt-2">
            <span>Total</span>
            <span>{formatMoney(order.totalMinor, currency)}</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          Estado del pago: {order.paymentStatus.toLowerCase()} · Estado del pedido:{" "}
          {order.status.toLowerCase()}
        </p>
      </div>

      <Link href="/" className="inline-block mt-10 text-sm border-b border-gold pb-1">
        Volver a la tienda
      </Link>
    </div>
  );
}
