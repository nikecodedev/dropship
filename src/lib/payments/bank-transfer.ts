import type { CheckoutOrder, CheckoutResult, PaymentProvider } from "./types";
import { formatMoney } from "@/lib/money";

// Transferencia bancaria. En Paraguay sigue siendo un medio muy usado y no
// paga comision de pasarela, asi que conviene ofrecerlo siempre.
// El pedido queda PENDIENTE hasta que se confirma la transferencia a mano
// desde el panel de administracion.

export type BankDetails = {
  bank: string;
  account: string;
  holder: string;
  docLabel: string;
  doc: string;
};

export function bankDetails(): BankDetails {
  return {
    bank: process.env.BANK_NAME ?? "",
    account: process.env.BANK_ACCOUNT ?? "",
    holder: process.env.BANK_HOLDER ?? "",
    // La titular puede ser persona fisica (cedula) o tener RUC, asi que la
    // etiqueta se configura junto con el dato.
    docLabel: process.env.BANK_DOC_LABEL ?? "RUC",
    doc: process.env.BANK_DOC ?? process.env.BANK_RUC ?? "",
  };
}

// El numero de cuenta suele venir con el tipo adelante ("Caja de Ahorro
// 000431264"). Para copiar al portapapeles sirve solo el numero.
export function accountNumberOnly(account: string) {
  const match = account.match(/[\d-]{5,}/);
  return match ? match[0] : account;
}

export const bankTransfer: PaymentProvider = {
  id: "transferencia",
  label: "Transferencia bancaria",
  help: "Sin recargo. Al confirmar te mostramos los datos de la cuenta.",
  channels: ["LOCAL"],

  isConfigured() {
    return Boolean(process.env.BANK_ACCOUNT);
  },

  async createCheckout(order: CheckoutOrder): Promise<CheckoutResult> {
    const d = bankDetails();
    const total = formatMoney(order.totalMinor, order.currency);

    const html = [
      "<p>Transferí <strong>" + total + "</strong> a esta cuenta:</p>",
      "<ul>",
      "<li>Banco: <strong>" + d.bank + "</strong></li>",
      "<li>Cuenta: <strong>" + d.account + "</strong></li>",
      "<li>Titular: <strong>" + d.holder + "</strong></li>",
      "<li>" + d.docLabel + ": <strong>" + d.doc + "</strong></li>",
      "</ul>",
      "<p>Usá <strong>" + order.code + "</strong> como concepto y envianos el comprobante.",
      "Apenas lo verifiquemos preparamos tu pedido.</p>",
    ].join("\n");

    return { kind: "instructions", html, ref: order.code };
  },
};
