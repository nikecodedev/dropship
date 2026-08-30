import { bankTransfer } from "./bank-transfer";
import { international } from "./international";
import { pagopar } from "./pagopar";
import type { Channel } from "@/lib/constants";
import type { PaymentMethodId, PaymentProvider } from "./types";

export const providers: PaymentProvider[] = [pagopar, bankTransfer, international];

export function getProvider(id: PaymentMethodId): PaymentProvider | undefined {
  return providers.find((p) => p.id === id);
}

// Medios disponibles para un canal, marcando cuales estan listos para cobrar.
export function methodsForChannel(channel: Channel) {
  return providers
    .filter((p) => p.channels.includes(channel))
    .map((p) => ({
      id: p.id,
      label: p.label,
      help: p.help,
      ready: p.isConfigured(),
    }));
}

export type { PaymentMethodId, PaymentProvider, CheckoutOrder, CheckoutResult } from "./types";
