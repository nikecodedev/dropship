import type { CheckoutOrder, CheckoutResult, PaymentProvider } from "./types";
import { formatMoney } from "@/lib/money";

// Transferencia bancaria. En Paraguay sigue siendo un medio muy usado y no
// paga comision de pasarela, asi que conviene ofrecerlo siempre.
// El pedido queda PENDIENTE hasta que se confirma la transferencia a mano
// desde el panel de administracion.

export const bankTransfer: PaymentProvider = {
  id: "transferencia",
  label: "Transferencia bancaria",
  help: "Te mostramos los datos de la cuenta y confirmamos el pedido al recibir la transferencia.",
  channels: ["LOCAL"],

  isConfigured() {
    return Boolean(process.env.BANK_ACCOUNT);
  },

  async createCheckout(order: CheckoutOrder): Promise<CheckoutResult> {
    const bank = process.env.BANK_NAME ?? "";
    const account = process.env.BANK_ACCOUNT ?? "";
    const holder = process.env.BANK_HOLDER ?? "";
    const ruc = process.env.BANK_RUC ?? "";
    const total = formatMoney(order.totalMinor, order.currency);

    const html = [
      "<p>Transferi <strong>" + total + "</strong> a esta cuenta:</p>",
      "<ul>",
      "<li>Banco: <strong>" + bank + "</strong></li>",
      "<li>Cuenta: <strong>" + account + "</strong></li>",
      "<li>Titular: <strong>" + holder + "</strong></li>",
      "<li>RUC: <strong>" + ruc + "</strong></li>",
      "</ul>",
      "<p>Usa <strong>" + order.code + "</strong> como concepto y envianos el comprobante",
      "por WhatsApp. Apenas lo verifiquemos preparamos tu pedido.</p>",
    ].join("\n");

    return { kind: "instructions", html, ref: order.code };
  },
};
