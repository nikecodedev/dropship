import type { Currency } from "@/lib/money";

export type PaymentMethodId = "pagopar" | "transferencia" | "internacional";

export type CheckoutOrder = {
  code: string;
  totalMinor: number;
  currency: Currency;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDoc: string;
  items: { name: string; qty: number; unitPriceMinor: number }[];
};

export type CheckoutResult =
  | { kind: "redirect"; url: string; ref: string }
  | { kind: "instructions"; html: string; ref: string }
  | { kind: "unavailable"; reason: string };

export interface PaymentProvider {
  id: PaymentMethodId;
  label: string;
  help: string;
  channels: ("LOCAL" | "DROPSHIP")[];
  isConfigured(): boolean;
  createCheckout(order: CheckoutOrder): Promise<CheckoutResult>;
}
