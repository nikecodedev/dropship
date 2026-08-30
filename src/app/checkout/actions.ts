"use server";

import { checkoutSchema, createOrder } from "@/lib/orders";

export type CheckoutActionResult =
  | { ok: true; code: string; redirect?: string }
  | { ok: false; error: string };

export async function submitCheckout(raw: unknown): Promise<CheckoutActionResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { ok: false, error: first?.message ?? "Revisa los datos del formulario." };
  }

  const result = await createOrder(parsed.data);
  if (!result.ok) return result;

  return {
    ok: true,
    code: result.code,
    redirect: result.payment.kind === "redirect" ? result.payment.url : undefined,
  };
}
