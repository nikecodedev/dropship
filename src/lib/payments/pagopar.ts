import { createHash } from "crypto";
import type { CheckoutOrder, CheckoutResult, PaymentProvider } from "./types";
import { toMajor } from "@/lib/money";

// Pagopar - cobro local en Paraguay.
// Cubre tarjetas, Tigo Money, Personal Pay, transferencia y bocas de cobranza
// con una sola integracion, que es la razon por la que lo elegimos.
//
// IMPORTANTE: el formato exacto del payload y del token hay que verificarlo
// contra la documentacion vigente de Pagopar cuando se abra la cuenta y
// tengamos las claves. La estructura de abajo sigue la version 1.1 de su API.

const API_BASE = "https://api.pagopar.com/api";
const PAY_URL = "https://www.pagopar.com/pagos";

function publicKey() {
  return process.env.PAGOPAR_PUBLIC_KEY ?? "";
}

function privateKey() {
  return process.env.PAGOPAR_PRIVATE_KEY ?? "";
}

function sha1(value: string) {
  return createHash("sha1").update(value).digest("hex");
}

export function buildInitToken(orderCode: string, totalMajor: number) {
  return sha1(privateKey() + orderCode + String(totalMajor));
}

export function buildWebhookToken(orderCode: string) {
  return sha1(privateKey() + orderCode);
}

export const pagopar: PaymentProvider = {
  id: "pagopar",
  label: "Tarjeta, Tigo Money, Personal Pay o boca de cobranza",
  help: "Vas a ser redirigido a Pagopar para completar el pago de forma segura.",
  channels: ["LOCAL"],

  isConfigured() {
    return Boolean(publicKey() && privateKey());
  },

  async createCheckout(order: CheckoutOrder): Promise<CheckoutResult> {
    if (!pagopar.isConfigured()) {
      return {
        kind: "unavailable",
        reason: "Pagopar todavia no esta configurado. Faltan las claves de la cuenta.",
      };
    }

    const totalMajor = toMajor(order.totalMinor, order.currency);
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const maxDate = new Date(Date.now() + 48 * 3600 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const payload = {
      token: buildInitToken(order.code, totalMajor),
      public_key: publicKey(),
      monto_total: totalMajor,
      tipo_pedido: "VENTA-COMERCIO",
      id_pedido_comercio: order.code,
      descripcion_resumen: "Pedido " + order.code,
      fecha_maxima_pago: maxDate,
      url_retorno: site + "/pedido/" + order.code,
      comprador: {
        ruc: order.customerDoc,
        email: order.customerEmail,
        nombre: order.customerName,
        telefono: order.customerPhone,
        documento: order.customerDoc,
        tipo_documento: "CI",
        razon_social: order.customerName,
        ciudad: 1,
        direccion: "",
      },
      compras_items: order.items.map((item, index) => ({
        ciudad: 1,
        nombre: item.name,
        cantidad: item.qty,
        categoria: "909",
        public_key: publicKey(),
        url_imagen: "",
        id_producto: index + 1,
        precio_total: toMajor(item.unitPriceMinor * item.qty, order.currency),
        vendedor_telefono: "",
        vendedor_direccion: "",
      })),
    };

    const res = await fetch(API_BASE + "/comercios/1.1/iniciar-transaccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      return { kind: "unavailable", reason: "Pagopar respondio " + res.status + "." };
    }

    const data = (await res.json()) as {
      respuesta?: boolean;
      resultado?: { data?: string }[];
      mensaje?: string;
    };

    const hash = data.resultado?.[0]?.data;
    if (!data.respuesta || !hash) {
      return {
        kind: "unavailable",
        reason: data.mensaje ?? "Pagopar no devolvio un identificador de pago.",
      };
    }

    return { kind: "redirect", url: PAY_URL + "/" + hash, ref: hash };
  },
};
