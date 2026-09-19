"use server";

import { checkoutSchema, createOrder } from "@/lib/orders";
import { orderPath } from "@/lib/order-token";

export type CheckoutActionResult =
  | { ok: true; path: string; redirect?: string }
  | { ok: false; error: string };

export async function submitCheckout(raw: unknown): Promise<CheckoutActionResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? "Revisá los datos del formulario." };
  }

  const result = await createOrder(parsed.data);
  if (!result.ok) return result;

  return {
    ok: true,
    path: orderPath(result.code),
    redirect: result.payment.kind === "redirect" ? result.payment.url : undefined,
  };
}
