import type { CheckoutOrder, CheckoutResult, PaymentProvider } from "./types";

// Cobro a clientes del exterior, para el catalogo de dropshipping.
//
// Stripe no opera con comercios paraguayos y PayPal tiene restricciones para
// retirar fondos a una cuenta local, asi que ninguno de los dos sirve tal cual.
// Las salidas reales son dLocal, un merchant of record tipo 2Checkout o
// Verifone, o abrir una entidad fuera del pais.
//
// Este adaptador queda con la forma definida y sin implementar hasta que se
// decida cual se usa. El checkout lo detecta y avisa, en vez de romperse.

export const international: PaymentProvider = {
  id: "internacional",
  label: "Tarjeta internacional",
  help: "Pago en dólares con tarjeta emitida fuera de Paraguay.",
  channels: ["DROPSHIP"],

  isConfigured() {
    const gateway = process.env.INTL_GATEWAY ?? "none";
    return gateway !== "none" && Boolean(process.env.INTL_API_KEY);
  },

  async createCheckout(_order: CheckoutOrder): Promise<CheckoutResult> {
    if (!international.isConfigured()) {
      return {
        kind: "unavailable",
        reason:
          "El cobro internacional esta pendiente de definir la pasarela (dLocal o merchant of record).",
      };
    }
    // Al elegir la pasarela: crear aca la sesion de pago y devolver el redirect.
    throw new Error("Pasarela internacional seleccionada pero sin implementar.");
  },
};
