"use client";

import { useActionState } from "react";
import { saveProduct } from "@/app/admin/actions";
import {
  CONCENTRATIONS,
  CONCENTRATION_LABEL,
  CONDITIONS,
  CONDITION_LABEL,
  GENDERS,
  GENDER_LABEL,
} from "@/lib/constants";

export type ProductFormValues = {
  id?: string;
  name: string;
  brand: string;
  description: string;
  channel: string;
  concentration: string;
  gender: string;
  condition: string;
  images: string[];
  active: boolean;
  featured: boolean;
  supplierRef: string;
};

const field =
  "w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-gold";

export default function ProductForm({ values }: { values: ProductFormValues }) {
  const [state, formAction, pending] = useActionState(saveProduct, null);

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Marca</span>
          <input name="brand" defaultValue={values.brand} required className={field + " mt-1"} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Nombre</span>
          <input name="name" defaultValue={values.name} required className={field + " mt-1"} />
        </label>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-widest text-ink-soft">Descripcion</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={values.description}
          className={field + " mt-1"}
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Catalogo</span>
          <select name="channel" defaultValue={values.channel} className={field + " mt-1"}>
            <option value="LOCAL">Perfumeria (stock propio, Paraguay)</option>
            <option value="DROPSHIP">Internacional (dropshipping)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Concentracion</span>
          <select
            name="concentration"
            defaultValue={values.concentration}
            className={field + " mt-1"}
          >
            {CONCENTRATIONS.map((c) => (
              <option key={c} value={c}>
                {c === "NA" ? "Sin especificar" : c + " - " + CONCENTRATION_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Genero</span>
          <select name="gender" defaultValue={values.gender} className={field + " mt-1"}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g === "NA" ? "Sin especificar" : GENDER_LABEL[g]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-soft">Estado del frasco</span>
          <select name="condition" defaultValue={values.condition} className={field + " mt-1"}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-widest text-ink-soft">
          Imagenes (una URL o ruta por linea)
        </span>
        <textarea
          name="images"
          rows={3}
          defaultValue={values.images.join("\n")}
          placeholder="/productos/yara-100.jpg"
          className={field + " mt-1"}
        />
      </label>

      <label className="block">
        <span className="text-xs uppercase tracking-widest text-ink-soft">
          Referencia del proveedor (solo dropshipping)
        </span>
        <input
          name="supplierRef"
          defaultValue={values.supplierRef}
          className={field + " mt-1"}
        />
      </label>

      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={values.active} />
          Visible en la tienda
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={values.featured} />
          Destacado
        </label>
      </div>

      {state && "error" in state && state.error && (
        <p className="text-sm text-red-700">{state.error}</p>
      )}
      {state && "ok" in state && state.ok && <p className="text-sm text-gold">Guardado.</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-cream px-8 py-3 text-sm rounded-sm disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}
