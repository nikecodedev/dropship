import { saveZone } from "../actions";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { toMajor } from "@/lib/money";
import { btn, cn } from "@/lib/ui";

const cell =
  "w-full rounded-lg border border-stone bg-pearl px-3 py-2 text-[14px] focus:border-emerald focus:outline-none focus:ring-4 focus:ring-emerald/10";
const cellLabel = "mb-1 block text-[11px] tracking-[0.08em] uppercase text-muted";

type ZoneValues = {
  id?: string;
  name: string;
  coverage: string;
  priceMinor: number;
  etaText: string;
  active: boolean;
  sortOrder: number;
};

function ZoneForm({ zone, isNew = false }: { zone: ZoneValues; isNew?: boolean }) {
  return (
    <form
      action={saveZone}
      className={cn(
        "grid gap-4 rounded-2xl border p-5 sm:grid-cols-6 sm:items-end",
        isNew ? "border-dashed border-stone" : "border-stone/70 bg-pearl",
      )}
    >
      {zone.id && <input type="hidden" name="id" value={zone.id} />}
      <label className="block sm:col-span-2">
        <span className={cellLabel}>Zona</span>
        <input name="name" defaultValue={zone.name} required placeholder="Ej: Luque" className={cell} />
      </label>
      <label className="block sm:col-span-4">
        <span className={cellLabel}>Qué incluye</span>
        <input name="coverage" defaultValue={zone.coverage} placeholder="Barrios o ciudades" className={cell} />
      </label>
      <label className="block sm:col-span-2">
        <span className={cellLabel}>Costo (Gs.)</span>
        <input
          name="price"
          inputMode="numeric"
          defaultValue={zone.priceMinor ? String(toMajor(zone.priceMinor, "PYG")) : ""}
          className={cn(cell, "tabular")}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className={cellLabel}>Plazo</span>
        <input name="etaText" defaultValue={zone.etaText} placeholder="24 a 48 horas" className={cell} />
      </label>
      <label className="block">
        <span className={cellLabel}>Orden</span>
        <input name="sortOrder" type="number" defaultValue={zone.sortOrder} className={cell} />
      </label>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-[12px] text-muted">
          <input type="checkbox" name="active" defaultChecked={zone.active} className="accent-emerald" />
          Activa
        </label>
        <button type="submit" className={cn(btn.small, "flex-1")}>
          {isNew ? "Agregar" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export default async function AdminEnviosPage() {
  await requireAdminPage();

  const zones = await db.shippingZone.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="max-w-5xl">
      <h1 className="text-[42px] text-emerald">Zonas de envío</h1>
      <p className="mt-1 max-w-2xl text-[14px] text-muted">
        Lo que ve el cliente al elegir dónde recibe su pedido. El catálogo internacional no se configura acá:
        su envío lo cotiza el proveedor.
      </p>

      <div className="mt-8 space-y-3">
        {zones.map((z) => (
          <ZoneForm
            key={z.id}
            zone={{
              id: z.id,
              name: z.name,
              coverage: z.coverage,
              priceMinor: z.priceMinor,
              etaText: z.etaText,
              active: z.active,
              sortOrder: z.sortOrder,
            }}
          />
        ))}
        <p className="pt-4 text-[12px] tracking-[0.1em] uppercase text-muted">Agregar zona</p>
        <ZoneForm
          isNew
          zone={{ name: "", coverage: "", priceMinor: 0, etaText: "", active: true, sortOrder: zones.length }}
        />
      </div>
    </div>
  );
}
