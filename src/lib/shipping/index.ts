import { db } from "@/lib/db";
import type { Channel } from "@/lib/constants";

// Dos modelos de envio distintos, uno por canal.
//
// LOCAL: tarifa por zona dentro de Paraguay, definida por la duena de la tienda
// desde el panel. Es un valor fijo y conocido.
//
// DROPSHIP: el costo depende del proveedor y del destino. NO se pone fijo: se
// pide al proveedor en el momento del checkout. Si se estima mal, se pierde
// margen en cada venta.

export type ShippingQuote = {
  priceMinor: number;
  label: string;
  eta: string;
};

export async function getLocalZones() {
  return db.shippingZone.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function quoteLocal(zoneId: string): Promise<ShippingQuote | null> {
  const zone = await db.shippingZone.findUnique({ where: { id: zoneId } });
  if (!zone || !zone.active) return null;
  return { priceMinor: zone.priceMinor, label: zone.name, eta: zone.etaText };
}

// Cotizacion de envio del proveedor de dropshipping.
// Queda sin implementar hasta saber que proveedor se usa. Devuelve null para
// que el checkout muestre "a confirmar" en vez de inventar un precio.
export async function quoteDropship(_params: {
  countryCode: string;
  items: { supplierRef: string | null; qty: number }[];
}): Promise<ShippingQuote | null> {
  return null;
}

export async function quote(
  channel: Channel,
  params: { zoneId?: string; countryCode?: string; items: { supplierRef: string | null; qty: number }[] },
): Promise<ShippingQuote | null> {
  if (channel === "LOCAL") {
    return params.zoneId ? quoteLocal(params.zoneId) : null;
  }
  return quoteDropship({ countryCode: params.countryCode ?? "", items: params.items });
}
