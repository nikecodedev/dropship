"use client";

import { useActionState } from "react";
import { deleteVariant, saveVariant } from "@/app/admin/actions";
import { toMajor } from "@/lib/money";

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
  "w-full border border-line rounded-sm px-2 py-2 text-sm bg-white focus:outline-none focus:border-gold";

function VariantRow({
  variant,
  productId,
  currency,
}: {
  variant: VariantValues;
  productId: string;
  currency: "PYG" | "USD";
}) {
  const [state, formAction, pending] = useActionState(saveVariant, null);

  return (
    <div className="border border-line rounded-sm p-4">
      <form action={formAction} className="grid gap-3 sm:grid-cols-6 items-end">
        {variant.id && <input type="hidden" name="id" value={variant.id} />}
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="currency" value={currency} />

        <label className="block sm:col-span-1">
          <span className="text-[11px] uppercase tracking-widest text-ink-soft">ml</span>
          <input
            name="sizeMl"
            type="number"
            defaultValue={variant.sizeMl ?? ""}
            className={cell + " mt-1"}
          />
        </label>

        <label className="block sm:col-span-1">
          <span className="text-[11px] uppercase tracking-widest text-ink-soft">Etiqueta</span>
          <input name="label" defaultValue={variant.label} className={cell + " mt-1"} />
        </label>

        <label className="block sm:col-span-1">
          <span className="text-[11px] uppercase tracking-widest text-ink-soft">SKU</span>
          <input name="sku" defaultValue={variant.sku} className={cell + " mt-1"} />
        </label>

        <label className="block sm:col-span-1">
          <span className="text-[11px] uppercase tracking-widest text-ink-soft">
            Precio ({currency})
          </span>
          <input
            name="price"
            defaultValue={variant.priceMinor ? String(toMajor(variant.priceMinor, currency)) : ""}
            className={cell + " mt-1"}
          />
        </label>

        <label className="block sm:col-span-1">
          <span className="text-[11px] uppercase tracking-widest text-ink-soft">Stock</span>
          <input
            name="stock"
            type="number"
            defaultValue={variant.stock}
            className={cell + " mt-1"}
          />
        </label>

        <div className="sm:col-span-1 flex items-center gap-3">
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" name="active" defaultChecked={variant.active} />
            Activa
          </label>
          <button
            type="submit"
            disabled={pending}
            className="bg-ink text-cream px-3 py-2 text-xs rounded-sm disabled:opacity-50"
          >
            {pending ? "..." : "Guardar"}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-4 mt-2">
        {state && "error" in state && state.error && (
          <p className="text-xs text-red-700">{state.error}</p>
        )}
        {state && "ok" in state && state.ok && <p className="text-xs text-gold">Guardado.</p>}
        {variant.id && (
          <form action={deleteVariant}>
            <input type="hidden" name="id" value={variant.id} />
            <input type="hidden" name="productId" value={productId} />
            <button type="submit" className="text-xs text-ink-soft underline hover:text-red-700">
              Eliminar
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
  const blank: VariantValues = {
    label: "",
    sizeMl: null,
    sku: "",
    priceMinor: 0,
    stock: 0,
    active: true,
  };

  return (
    <div className="space-y-4">
      {variants.map((v) => (
        <VariantRow key={v.id} variant={v} productId={productId} currency={currency} />
      ))}

      <div>
        <p className="text-xs uppercase tracking-widest text-ink-soft mb-2">Agregar presentacion</p>
        <VariantRow variant={blank} productId={productId} currency={currency} />
      </div>
    </div>
  );
}
