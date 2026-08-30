import { NextResponse } from "next/server";
import { buildWebhookToken } from "@/lib/payments/pagopar";
import { markOrderPaid } from "@/lib/orders";

// Aviso de pago de Pagopar.
// Pagopar espera que le devolvamos el mismo objeto que nos mando, para dar el
// aviso por recibido. El token viaja en el cuerpo y sirve para confirmar que
// el llamado es legitimo: sin esa validacion cualquiera podria marcar un
// pedido como pagado.
//
// Verificar el formato exacto contra la documentacion vigente al integrar.

type PagoparPedido = {
  token?: string;
  pagado?: boolean;
  numero_pedido?: string;
  hash_pedido?: string;
  forma_pago?: string;
};

export async function POST(request: Request) {
  let body: { resultado?: PagoparPedido[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const pedido = body.resultado?.[0];
  if (!pedido?.numero_pedido) {
    return NextResponse.json({ error: "Falta numero_pedido" }, { status: 400 });
  }

  const expected = buildWebhookToken(pedido.numero_pedido);
  if (!pedido.token || pedido.token !== expected) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  if (pedido.pagado) {
    await markOrderPaid(pedido.numero_pedido, pedido.hash_pedido ?? "");
  }

  return NextResponse.json(body.resultado);
}
