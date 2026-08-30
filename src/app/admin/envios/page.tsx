import { db } from "@/lib/db";
import { toMajor } from "@/lib/money";
import { saveZone } from "../actions";
import { requireAdminPage } from "@/lib/auth";

const field =
  "w-full border border-line rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-gold";

type ZoneValues = {
  id?: string;
  name: string;
  coverage: string;
  priceMinor: number;
  etaText: string;
  active: boolean;
  sortOrder: number;
};

function ZoneForm({ zone }: { zone: ZoneValues }) {
  return (
    <form action={saveZone} className="border border-line rounded-sm p-4 grid gap-3 sm:grid-cols-6 items-end">
      {zone.id && <input type="hidden" name="id" value={zone.id} />}

      <label className="block sm:col-span-2">
        <span className="text-[11px] uppercase tracking-widest text-ink-soft">Zona</span>
        <input name="name" defaultValue={zone.name} required className={field + " mt-1"} />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-[11px] uppercase tracking-widest text-ink-soft">Cobertura</span>
        <input name="coverage" defaultValue={zone.coverage} className={field + " mt-1"} />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-widest text-ink-soft">Precio Gs</span>
        <input
          name="price"
          defaultValue={zone.priceMinor ? String(toMajor(zone.priceMinor, "PYG")) : ""}
          className={field + " mt-1"}
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-widest text-ink-soft">Plazo</span>
        <input name="etaText" defaultValue={zone.etaText} className={field + " mt-1"} />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-widest text-ink-soft">Orden</span>
        <input
          name="sortOrder"
          type="number"
          defaultValue={zone.sortOrder}
          className={field + " mt-1"}
        />
      </label>

      <div className="sm:col-span-5 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={zone.active} />
          Activa
        </label>
        <button type="submit" className="bg-ink text-cream px-5 py-2 text-sm rounded-sm">
          Guardar
        </button>
      </div>
    </form>
  );
}

export default async function AdminEnviosPage() {
  await requireAdminPage();

  const zones = await db.shippingZone.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="text-2xl mb-3">Zonas de envio</h1>
      <p className="text-sm text-ink-soft mb-8 max-w-2xl">
        Tarifas para la perfumeria con stock propio en Paraguay. El envio del catalogo
        internacional no se configura aca: lo cotiza el proveedor en el momento de la compra.
      </p>

      <div className="space-y-4">
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

        <div>
          <p className="text-xs uppercase tracking-widest text-ink-soft mb-2">Agregar zona</p>
          <ZoneForm
            zone={{
              name: "",
              coverage: "",
              priceMinor: 0,
              etaText: "",
              active: true,
              sortOrder: zones.length,
            }}
          />
        </div>
      </div>
    </div>
  );
}
