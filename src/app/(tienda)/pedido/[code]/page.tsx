import Link from "next/link";
import { notFound } from "next/navigation";
import CopyField from "@/components/copy-field";
import { IconBank, IconCheck, IconLocation, IconWhatsapp } from "@/components/icons";
import { db } from "@/lib/db";
import { isValidOrderToken } from "@/lib/order-token";
import { formatMoney, toMajor } from "@/lib/money";
import { accountNumberOnly, bankDetails } from "@/lib/payments/bank-transfer";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, type OrderStatus, whatsappLink } from "@/lib/constants";
import { btn, cn, container } from "@/lib/ui";

export const metadata = { title: "Tu pedido", robots: { index: false } };
export const dynamic = "force-dynamic";

const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: "PENDIENTE", label: "Pedido recibido" },
  { status: "PAGADO", label: "Pago confirmado" },
  { status: "PREPARANDO", label: "En preparación" },
  { status: "ENVIADO", label: "Enviado" },
  { status: "ENTREGADO", label: "Entregado" },
];

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { code } = await params;
  const { t } = await searchParams;
  // Sin la firma del enlace no se muestra nada: la pagina tiene datos personales.
  if (!isValidOrderToken(code, t)) notFound();
  const order = await db.order.findUnique({ where: { code }, include: { items: true } });
  if (!order) notFound();

  const currency = order.currency as "PYG" | "USD";
  const firstName = order.customerName.split(" ")[0];
  const cancelado = order.status === "CANCELADO";
  const pendienteTransferencia =
    order.paymentMethod === "transferencia" && order.paymentStatus === "PENDIENTE" && !cancelado;
  const bank = bankDetails();
  const stepIndex = TIMELINE.findIndex((step) => step.status === order.status);

  const comprobante = whatsappLink(
    "Hola, te envío el comprobante de la transferencia del pedido " +
      order.code +
      " por " +
      formatMoney(order.totalMinor, currency) +
      ".",
  );

  return (
    <div className="bg-sand/40 pb-10">
      <div className={cn(container, "max-w-4xl py-14 sm:py-20")}>
        {/* Encabezado */}
        <div className="animate-fade-up text-center">
          <span
            className={cn(
              "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
              cancelado ? "bg-stone text-muted" : "bg-emerald text-champagne-2",
            )}
          >
            <IconCheck size={30} />
          </span>
          <p className="mt-6 eyebrow text-champagne">Pedido {order.code}</p>
          <h1 className="mt-3 text-[44px] leading-tight text-emerald sm:text-[56px]">
            {cancelado ? "Este pedido fue cancelado" : "¡Gracias, " + firstName + "!"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
            {cancelado
              ? "Si creés que es un error, escribinos y lo revisamos."
              : pendienteTransferencia
                ? "Recibimos tu pedido y reservamos tus productos. Para confirmarlo, solo falta la transferencia."
                : "Recibimos tu pedido. Te vamos a escribir al " + order.customerPhone + " para coordinar la entrega."}
          </p>
        </div>

        {/* Transferencia */}
        {pendienteTransferencia && (
          <section className="mt-12 overflow-hidden rounded-3xl border border-stone/70 bg-pearl shadow-card">
            <div className="flex items-center gap-4 bg-emerald px-6 py-5 text-pearl sm:px-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-champagne/20 text-champagne-2">
                <IconBank size={22} />
              </span>
              <div>
                <h2 className="font-display text-[26px] leading-tight">Completá tu pago</h2>
                <p className="text-[13px] text-pearl/65">Transferí el total exacto a esta cuenta.</p>
              </div>
            </div>

            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.3fr_1fr]">
              <div className="divide-y divide-stone/70">
                <CopyField
                  label="Monto a transferir"
                  value={formatMoney(order.totalMinor, currency)}
                  copyValue={String(toMajor(order.totalMinor, currency))}
                  emphasis
                />
                <CopyField label="Banco" value={bank.bank} />
                <CopyField label="Cuenta" value={bank.account} copyValue={accountNumberOnly(bank.account)} />
                <CopyField label="Titular" value={bank.holder} />
                <CopyField label={bank.docLabel} value={bank.doc} />
                <CopyField label="Concepto" value={order.code} />
              </div>

              <div className="rounded-2xl bg-sand/70 p-6">
                <p className="eyebrow text-champagne">Qué sigue</p>
                <ol className="mt-5 space-y-5">
                  {[
                    "Hacé la transferencia desde la app de tu banco, con el número de pedido como concepto.",
                    "Envianos el comprobante" + (comprobante ? " por WhatsApp." : "."),
                    "Apenas se acredita, preparamos tu pedido y te avisamos.",
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink/80">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald font-display text-[13px] text-champagne-2">
                        {i + 1}
                      </span>
                      {text}
                    </li>
                  ))}
                </ol>
                {comprobante && (
                  <a
                    href={comprobante}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(btn.primary, "mt-7 w-full")}
                  >
                    <IconWhatsapp size={18} /> Enviar comprobante
                  </a>
                )}
                <p className="mt-5 text-[12px] leading-relaxed text-muted">
                  Tus productos quedan reservados mientras esperamos el pago.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Estado */}
        {!cancelado && (
          <section className="mt-8 rounded-3xl border border-stone/70 bg-pearl p-6 sm:p-8">
            <h2 className="font-display text-[24px] text-emerald">Estado del pedido</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-5">
              {TIMELINE.map((step, i) => {
                const done = i <= stepIndex;
                return (
                  <li key={step.status} className="flex items-center gap-3 sm:flex-col sm:text-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[12px]",
                        done ? "border-emerald bg-emerald text-champagne-2" : "border-stone text-subtle",
                      )}
                    >
                      {done ? <IconCheck size={14} /> : i + 1}
                    </span>
                    <span className={cn("text-[13px]", done ? "font-medium text-emerald" : "text-muted")}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Detalle */}
        <section className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-stone/70 bg-pearl p-6 sm:p-8">
            <h2 className="font-display text-[24px] text-emerald">Detalle</h2>
            <ul className="mt-4 divide-y divide-stone/60">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3 text-[14px]">
                  <span>
                    <span className="text-ink">{item.productName}</span>
                    <span className="block text-[12px] text-muted">
                      {item.variantLabel} · {item.qty} {item.qty === 1 ? "unidad" : "unidades"}
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
                <span>Envío {order.shipZoneName ? "· " + order.shipZoneName : ""}</span>
                <span className="tabular">
                  {order.channel === "DROPSHIP" && order.shippingMinor === 0
                    ? "A confirmar"
                    : formatMoney(order.shippingMinor, currency)}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="font-medium text-ink">Total</span>
                <span className="tabular font-display text-[28px] text-emerald">
                  {formatMoney(order.totalMinor, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-stone/70 bg-pearl p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-[24px] text-emerald">
                <IconLocation size={20} className="text-champagne" /> Entrega
              </h2>
              <p className="mt-3 text-[14px] text-ink">{order.customerName}</p>
              <p className="text-[14px] text-muted">{order.shipAddress}</p>
              <p className="text-[14px] text-muted">{order.shipCity}</p>
              {order.shipNotes && <p className="mt-2 text-[13px] italic text-muted">{order.shipNotes}</p>}
            </div>
            <div className="rounded-3xl border border-stone/70 bg-pearl p-6 sm:p-8 text-[14px]">
              <p className="text-muted">Medio de pago</p>
              <p className="text-ink">{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
              <p className="mt-3 text-muted">Estado</p>
              <p className="text-ink">{ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}</p>
            </div>
          </div>
        </section>

        <div className="mt-12 text-center">
          <Link href="/perfumes" className={btn.outline}>
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
