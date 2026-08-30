import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { CHANNEL, type Channel } from "@/lib/constants";
import { getProvider, type CheckoutResult, type PaymentMethodId } from "@/lib/payments";
import { quote } from "@/lib/shipping";

export const checkoutSchema = z.object({
  channel: z.enum([CHANNEL.LOCAL, CHANNEL.DROPSHIP]),
  customerName: z.string().trim().min(3, "Nombre y apellido"),
  customerEmail: z.string().trim().email("Email invalido"),
  customerPhone: z.string().trim().min(6, "Telefono invalido"),
  customerDoc: z.string().trim().default(""),
  shipCity: z.string().trim().default(""),
  shipAddress: z.string().trim().default(""),
  shipNotes: z.string().trim().default(""),
  shipZoneId: z.string().trim().optional(),
  countryCode: z.string().trim().default("PY"),
  paymentMethod: z.enum(["pagopar", "transferencia", "internacional"]),
  items: z
    .array(z.object({ variantId: z.string().min(1), qty: z.number().int().min(1).max(20) }))
    .min(1, "El carrito esta vacio"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

function newOrderCode() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return "AP-" + stamp + rand;
}

export type CreateOrderResult =
  | { ok: true; code: string; payment: CheckoutResult }
  | { ok: false; error: string };

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const channel = input.channel as Channel;

  // Los precios se recalculan siempre desde la base. Nunca se confia en lo que
  // manda el navegador.
  const variants = await db.variant.findMany({
    where: { id: { in: input.items.map((i) => i.variantId) }, active: true },
    include: { product: true },
  });

  if (variants.length !== input.items.length) {
    return { ok: false, error: "Alguno de los productos ya no esta disponible." };
  }

  const mixedChannel = variants.some((v) => v.product.channel !== channel);
  if (mixedChannel) {
    return {
      ok: false,
      error:
        "El carrito mezcla productos de perfumeria local con productos internacionales. Se compran por separado porque tienen envio y plazo distintos.",
    };
  }

  const currency = variants[0].product.currency;
  const lines = input.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    return {
      variant,
      qty: item.qty,
      unitPriceMinor: variant.priceMinor,
      lineTotalMinor: variant.priceMinor * item.qty,
    };
  });

  // El stock solo se controla en el canal local. En dropshipping lo maneja el
  // proveedor y hay que consultarlo contra su API.
  if (channel === CHANNEL.LOCAL) {
    const sinStock = lines.find((l) => l.variant.stock < l.qty);
    if (sinStock) {
      return {
        ok: false,
        error: "No hay stock suficiente de " + sinStock.variant.product.name + ".",
      };
    }
  }

  const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);

  const shippingQuote = await quote(channel, {
    zoneId: input.shipZoneId,
    countryCode: input.countryCode,
    items: lines.map((l) => ({ supplierRef: l.variant.product.supplierRef, qty: l.qty })),
  });

  if (channel === CHANNEL.LOCAL && !shippingQuote) {
    return { ok: false, error: "Elegi una zona de envio." };
  }

  const shippingMinor = shippingQuote?.priceMinor ?? 0;
  const totalMinor = subtotalMinor + shippingMinor;

  const provider = getProvider(input.paymentMethod as PaymentMethodId);
  if (!provider) return { ok: false, error: "Medio de pago invalido." };
  if (!provider.channels.includes(channel)) {
    return { ok: false, error: "Ese medio de pago no esta disponible para este catalogo." };
  }

  const code = newOrderCode();

  const order = await db.order.create({
    data: {
      code,
      channel,
      currency,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerDoc: input.customerDoc,
      shipCity: input.shipCity,
      shipAddress: input.shipAddress,
      shipNotes: input.shipNotes,
      shipZoneId: input.shipZoneId ?? null,
      shipZoneName: shippingQuote?.label ?? "",
      subtotalMinor,
      shippingMinor,
      totalMinor,
      paymentMethod: provider.id,
      items: {
        create: lines.map((l) => ({
          variantId: l.variant.id,
          productName: l.variant.product.brand + " " + l.variant.product.name,
          variantLabel: l.variant.label,
          unitPriceMinor: l.unitPriceMinor,
          qty: l.qty,
          lineTotalMinor: l.lineTotalMinor,
        })),
      },
    },
  });

  const payment = await provider.createCheckout({
    code: order.code,
    totalMinor,
    currency: currency as "PYG" | "USD",
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    customerDoc: input.customerDoc,
    items: lines.map((l) => ({
      name: l.variant.product.name + " " + l.variant.label,
      qty: l.qty,
      unitPriceMinor: l.unitPriceMinor,
    })),
  });

  if (payment.kind === "unavailable") {
    await db.order.update({
      where: { id: order.id },
      data: { status: "CANCELADO", adminNotes: payment.reason },
    });
    return { ok: false, error: payment.reason };
  }

  if (payment.kind === "redirect") {
    await db.order.update({ where: { id: order.id }, data: { paymentRef: payment.ref } });
  }

  return { ok: true, code: order.code, payment };
}

// Descuenta stock al confirmarse el pago. Se llama desde el webhook de la
// pasarela o al marcar el pago a mano en el panel.
export async function markOrderPaid(code: string, ref: string) {
  const order = await db.order.findUnique({ where: { code }, include: { items: true } });
  if (!order || order.paymentStatus === "PAGADO") return;

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAGADO", status: "PAGADO", paymentRef: ref },
    });
    if (order.channel !== CHANNEL.LOCAL) return;
    for (const item of order.items) {
      if (!item.variantId) continue;
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.qty } },
      });
    }
  });
}
