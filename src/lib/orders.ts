import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { fullName } from "@/lib/catalog";
import { CHANNEL, type Channel } from "@/lib/constants";
import { getProvider, type CheckoutResult, type PaymentMethodId } from "@/lib/payments";
import { quote } from "@/lib/shipping";

export const checkoutSchema = z.object({
  channel: z.enum([CHANNEL.LOCAL, CHANNEL.DROPSHIP]),
  customerName: z.string().trim().min(3, "Escribí tu nombre y apellido."),
  customerEmail: z.string().trim().email("El email no parece válido."),
  customerPhone: z.string().trim().min(6, "Revisá el número de teléfono."),
  customerDoc: z.string().trim().default(""),
  shipCity: z.string().trim().default(""),
  shipAddress: z.string().trim().default(""),
  shipNotes: z.string().trim().default(""),
  shipZoneId: z.string().trim().optional(),
  countryCode: z.string().trim().default("PY"),
  paymentMethod: z.enum(["pagopar", "transferencia", "internacional"]),
  items: z
    .array(z.object({ variantId: z.string().min(1), qty: z.number().int().min(1).max(20) }))
    .min(1, "Tu carrito está vacío."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

function newOrderCode() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return "ZP-" + stamp + rand;
}

export type CreateOrderResult =
  | { ok: true; code: string; payment: CheckoutResult }
  | { ok: false; error: string };

class SinStock extends Error {
  constructor(public productName: string) {
    super("sin stock");
  }
}

// El stock se reserva en el momento de crear el pedido, no al confirmar el
// pago. Con dos unidades por perfume, esperar al pago dejaba que dos personas
// compraran la misma ultima unidad por transferencia. Si el pedido se cancela,
// el stock vuelve (ver cancelOrder).
export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const channel = input.channel as Channel;

  // Los precios se recalculan siempre desde la base. Nunca se confia en lo que
  // manda el navegador.
  const variants = await db.variant.findMany({
    where: { id: { in: input.items.map((i) => i.variantId) }, active: true, product: { active: true } },
    include: { product: true },
  });

  if (variants.length !== input.items.length) {
    return { ok: false, error: "Alguno de los productos de tu carrito ya no está disponible." };
  }

  if (variants.some((v) => v.product.channel !== channel)) {
    return {
      ok: false,
      error:
        "Tu carrito mezcla perfumería local con productos internacionales. Se compran por separado porque tienen otro envío y otro plazo.",
    };
  }

  if (channel === CHANNEL.LOCAL && (!input.shipCity || !input.shipAddress)) {
    return { ok: false, error: "Completá la ciudad y la dirección de entrega." };
  }

  const provider = getProvider(input.paymentMethod as PaymentMethodId);
  if (!provider || !provider.channels.includes(channel)) {
    return { ok: false, error: "Ese medio de pago no está disponible para este pedido." };
  }
  if (!provider.isConfigured()) {
    return { ok: false, error: "Ese medio de pago todavía no está habilitado. Elegí otro." };
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

  const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);

  const shippingQuote = await quote(channel, {
    zoneId: input.shipZoneId,
    countryCode: input.countryCode,
    items: lines.map((l) => ({ supplierRef: l.variant.product.supplierRef, qty: l.qty })),
  });

  if (channel === CHANNEL.LOCAL && !shippingQuote) {
    return { ok: false, error: "Elegí una zona de entrega." };
  }

  const shippingMinor = shippingQuote?.priceMinor ?? 0;
  const totalMinor = subtotalMinor + shippingMinor;

  let order;
  try {
    order = await db.$transaction(async (tx) => {
      if (channel === CHANNEL.LOCAL) {
        for (const line of lines) {
          // Descuento condicional: solo si todavia quedan las unidades pedidas.
          // Si dos pedidos llegan juntos por la ultima unidad, uno de los dos
          // no encuentra fila para actualizar y se cancela entero.
          const updated = await tx.variant.updateMany({
            where: { id: line.variant.id, stock: { gte: line.qty } },
            data: { stock: { decrement: line.qty } },
          });
          if (updated.count !== 1) throw new SinStock(line.variant.product.name);
        }
      }

      return tx.order.create({
        data: {
          code: newOrderCode(),
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
              productName: fullName(l.variant.product.brand, l.variant.product.name),
              variantLabel: l.variant.label,
              unitPriceMinor: l.unitPriceMinor,
              qty: l.qty,
              lineTotalMinor: l.lineTotalMinor,
            })),
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof SinStock) {
      return {
        ok: false,
        error: "No queda stock suficiente de " + error.productName + ". Revisá las cantidades de tu carrito.",
      };
    }
    throw error;
  }

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
    // La pasarela fallo despues de reservar: se cancela y el stock vuelve.
    await cancelOrder(order.id, "No se pudo iniciar el pago: " + payment.reason);
    return { ok: false, error: payment.reason };
  }

  if (payment.kind === "redirect") {
    await db.order.update({ where: { id: order.id }, data: { paymentRef: payment.ref } });
  }

  return { ok: true, code: order.code, payment };
}

// Marca un pedido como pagado. Se llama desde el webhook de la pasarela o al
// confirmar una transferencia a mano en el panel. El stock ya se habia
// reservado al crear el pedido, asi que aca no se toca, salvo que el pedido
// estuviera cancelado y el pago haya llegado igual.
export async function markOrderPaid(code: string, ref: string) {
  const order = await db.order.findUnique({ where: { code }, include: { items: true } });
  if (!order || order.paymentStatus === "PAGADO") return;

  await db.$transaction(async (tx) => {
    let note = order.adminNotes;

    if (order.status === "CANCELADO" && order.channel === CHANNEL.LOCAL) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        const updated = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty } },
        });
        if (updated.count !== 1) {
          note = (note ? note + "\n" : "") +
            "Llegó el pago de un pedido cancelado y ya no hay stock de " + item.productName + ". Revisar.";
        }
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAGADO",
        status: order.status === "PENDIENTE" || order.status === "CANCELADO" ? "PAGADO" : order.status,
        paymentRef: ref,
        adminNotes: note,
      },
    });
  });
}

// Cancela un pedido y devuelve al stock las unidades que tenia reservadas.
// Es idempotente: cancelar dos veces no devuelve el stock dos veces.
export async function cancelOrder(orderId: string, note?: string) {
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.status === "CANCELADO") return;

    if (order.channel === CHANNEL.LOCAL) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.qty } },
        });
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELADO",
        adminNotes: note ? (order.adminNotes ? order.adminNotes + "\n" : "") + note : order.adminNotes,
      },
    });
  });
}
