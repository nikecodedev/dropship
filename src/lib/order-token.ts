import { createHmac, timingSafeEqual } from "crypto";

// El codigo de pedido es corto a proposito, porque el cliente lo escribe como
// concepto de la transferencia. Por eso solo no alcanza para abrir la pagina
// del pedido, que muestra nombre, direccion y telefono. El enlace lleva ademas
// una firma que solo puede generar el servidor.

function secret() {
  return process.env.SESSION_SECRET ?? "dev-secret-inseguro";
}

export function orderToken(code: string) {
  return createHmac("sha256", secret()).update("pedido:" + code).digest("hex").slice(0, 24);
}

export function orderPath(code: string) {
  return "/pedido/" + encodeURIComponent(code) + "?t=" + orderToken(code);
}

export function isValidOrderToken(code: string, token: string | undefined) {
  if (!token) return false;
  const expected = Buffer.from(orderToken(code));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
