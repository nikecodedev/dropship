"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import {
  CONCENTRATIONS,
  CONCENTRATION_LABEL,
  CONDITIONS,
  CONDITION_LABEL,
  GENDERS,
  GENDER_LABEL,
} from "@/lib/constants";
import { btn, cn, field, label } from "@/lib/ui";

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

export default function ProductForm({ values }: { values: ProductFormValues }) {
  const [state, formAction, pending] = useActionState(saveProduct, null);
  const [images, setImages] = useState(values.images.join("\n"));
  const [channel, setChannel] = useState(values.channel);
  const previews = images
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <form action={formAction} className="space-y-6">
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <Card title="Información">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="brand">
              Marca
            </label>
            <input id="brand" name="brand" defaultValue={values.brand} required className={field} />
          </div>
          <div>
            <label className={label} htmlFor="name">
              Nombre del perfume
            </label>
            <input id="name" name="name" defaultValue={values.name} required className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={values.description}
              placeholder="Notas, estilo, ocasión de uso…"
              className={field}
            />
          </div>
        </div>
      </Card>

      <Card title="Clasificación">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="channel">
              Catálogo
            </label>
            <select
              id="channel"
              name="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className={field}
            >
              <option value="LOCAL">Perfumería (stock propio en Paraguay)</option>
              <option value="DROPSHIP">Internacional (lo despacha el proveedor)</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="concentration">
              Concentración
            </label>
            <select id="concentration" name="concentration" defaultValue={values.concentration} className={field}>
              {CONCENTRATIONS.map((c) => (
                <option key={c} value={c}>
                  {c === "NA" ? "Sin especificar" : CONCENTRATION_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="gender">
              Para
            </label>
            <select id="gender" name="gender" defaultValue={values.gender} className={field}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g === "NA" ? "Sin especificar" : GENDER_LABEL[g]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="condition">
              Estado del frasco
            </label>
            <select id="condition" name="condition" defaultValue={values.condition} className={field}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {CONDITION_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          {channel === "DROPSHIP" && (
            <div className="sm:col-span-2">
              <label className={label} htmlFor="supplierRef">
                Referencia en el proveedor
              </label>
              <input id="supplierRef" name="supplierRef" defaultValue={values.supplierRef} className={field} />
            </div>
          )}
        </div>
      </Card>

      <Card title="Imágenes" hint="Una dirección por línea. La primera es la que se ve en el catálogo.">
        <textarea
          name="images"
          rows={3}
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder="/productos/mi-perfume.jpg"
          className={cn(field, "font-mono text-[13px]")}
        />
        {previews.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={src + i} className="relative h-28 w-[88px] overflow-hidden rounded-xl bg-sand">
                <img src={src} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-emerald px-2 py-0.5 text-[9px] uppercase tracking-wider text-pearl">
                    Portada
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Publicación">
        <div className="space-y-4">
          <Toggle name="active" defaultChecked={values.active} title="Visible en la tienda" text="Si lo apagás, el producto deja de aparecer pero no se borra." />
          <Toggle name="featured" defaultChecked={values.featured} title="Destacado" text="Aparece primero y con la etiqueta “Más pedido”." />
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={btn.primary}>
          {pending ? "Guardando…" : values.id ? "Guardar cambios" : "Crear producto"}
        </button>
        {state && "error" in state && state.error && <p className="text-[13px] text-danger">{state.error}</p>}
        {state && "ok" in state && state.ok && <p className="text-[13px] text-success">Cambios guardados.</p>}
      </div>
    </form>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone/70 bg-pearl p-6">
      <h2 className="font-display text-[22px] text-emerald">{title}</h2>
      {hint && <p className="mt-0.5 text-[12px] text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({ name, defaultChecked, title, text }: { name: string; defaultChecked: boolean; title: string; text: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-stone transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-pearl after:shadow after:transition-transform peer-checked:bg-emerald peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-champagne" />
      <span>
        <span className="block text-[14px] font-medium text-ink">{title}</span>
        <span className="block text-[12px] text-muted">{text}</span>
      </span>
    </label>
  );
}
