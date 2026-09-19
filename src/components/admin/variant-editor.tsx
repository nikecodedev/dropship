"use client";

import { useActionState } from "react";
import { deleteVariant, saveVariant } from "@/app/admin/actions";
import { toMajor } from "@/lib/money";
import { btn, cn } from "@/lib/ui";

export type VariantValues = {
  id?: string;
  label: string;
  sizeMl: number | null;
  sku: string;
  priceMinor: number;
  stock: number;
  active: boolean;
};

const cell =
  "w-full rounded-lg border border-stone bg-pearl px-3 py-2 text-[14px] focus:border-emerald focus:outline-none focus:ring-4 focus:ring-emerald/10";
const cellLabel = "mb-1 block text-[11px] tracking-[0.08em] uppercase text-muted";

function VariantRow({
  variant,
  productId,
  currency,
  isNew = false,
}: {
  variant: VariantValues;
  productId: string;
  currency: "PYG" | "USD";
  isNew?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveVariant, null);

  return (
    <div className={cn("rounded-2xl border p-5", isNew ? "border-dashed border-stone bg-transparent" : "border-stone/70 bg-pearl")}>
      <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:items-end">
        {variant.id && <input type="hidden" name="id" value={variant.id} />}
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="currency" value={currency} />

        <label className="block">
          <span className={cellLabel}>ml</span>
          <input name="sizeMl" type="number" min={0} defaultValue={variant.sizeMl ?? ""} className={cell} />
        </label>
        <label className="block">
          <span className={cellLabel}>Etiqueta</span>
          <input name="label" defaultValue={variant.label} placeholder="100 ml" className={cell} />
        </label>
        <label className="block">
          <span className={cellLabel}>Precio ({currency === "PYG" ? "Gs." : "USD"})</span>
          <input
            name="price"
            inputMode="numeric"
            defaultValue={variant.priceMinor ? String(toMajor(variant.priceMinor, currency)) : ""}
            className={cn(cell, "tabular")}
          />
        </label>
        <label className="block">
          <span className={cellLabel}>Stock</span>
          <input name="stock" type="number" min={0} defaultValue={variant.stock} className={cn(cell, "tabular")} />
        </label>
        <label className="block">
          <span className={cellLabel}>SKU</span>
          <input name="sku" defaultValue={variant.sku} className={cn(cell, "text-[12px]")} />
        </label>
        <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
          <label className="flex items-center gap-1.5 text-[12px] text-muted">
            <input type="checkbox" name="active" defaultChecked={variant.active} className="accent-emerald" />
            Activa
          </label>
          <button type="submit" disabled={pending} className={cn(btn.small, "flex-1")}>
            {pending ? "…" : isNew ? "Agregar" : "Guardar"}
          </button>
        </div>
      </form>

      <div className="mt-3 flex min-h-[18px] items-center justify-between gap-4">
        <span className="text-[12px]">
          {state && "error" in state && state.error && <span className="text-danger">{state.error}</span>}
          {state && "ok" in state && state.ok && <span className="text-success">Guardado.</span>}
        </span>
        {variant.id && (
          <form action={deleteVariant}>
            <input type="hidden" name="id" value={variant.id} />
            <input type="hidden" name="productId" value={productId} />
            <button type="submit" className="text-[12px] text-subtle hover:text-danger">
              Eliminar presentación
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VariantEditor({
  productId,
  currency,
  variants,
}: {
  productId: string;
  currency: "PYG" | "USD";
  variants: VariantValues[];
}) {
  const blank: VariantValues = { label: "", sizeMl: null, sku: "", priceMinor: 0, stock: 0, active: true };

  return (
    <div className="space-y-3">
      {variants.map((v) => (
        <VariantRow key={v.id} variant={v} productId={productId} currency={currency} />
      ))}
      <p className="pt-3 text-[12px] tracking-[0.1em] uppercase text-muted">Agregar presentación</p>
      <VariantRow variant={blank} productId={productId} currency={currency} isNew />
    </div>
  );
}
