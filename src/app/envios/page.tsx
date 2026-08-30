import { getLocalZones } from "@/lib/shipping";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Envios y pagos" };
export const dynamic = "force-dynamic";

export default async function EnviosPage() {
  const zones = await getLocalZones();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">Envios y pagos</h1>

      <section className="mt-12">
        <h2 className="text-xl">Perfumeria, entrega en Paraguay</h2>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Son los perfumes que tenemos en stock. Se despachan desde Asuncion y la tarifa depende de
          la zona.
        </p>

        <ul className="mt-6 border-y border-line divide-y divide-line">
          {zones.map((z) => (
            <li key={z.id} className="py-4 flex items-baseline justify-between gap-4 text-sm">
              <div>
                <p>{z.name}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  {z.coverage}
                  {z.etaText ? " · " + z.etaText : ""}
                </p>
              </div>
              <span>{formatMoney(z.priceMinor, "PYG")}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Catalogo internacional</h2>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Son productos que despacha el proveedor desde el exterior. El plazo va de 15 a 30 dias
          segun el destino y el costo de envio lo cotiza el proveedor en el momento de la compra.
          Estos pedidos se compran por separado de la perfumeria, porque tienen otro envio y otro
          plazo.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Medios de pago</h2>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Para compras dentro de Paraguay aceptamos tarjeta, billetera electronica, boca de
          cobranza y transferencia bancaria. Para compras desde el exterior el pago se procesa con
          tarjeta internacional en dolares.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Cambios y devoluciones</h2>
        <p className="mt-3 text-sm text-ink-soft leading-relaxed">
          Los perfumes sellados se pueden cambiar dentro de los 7 dias si no fueron abiertos. Los
          productos del catalogo internacional siguen la politica del proveedor, que se indica en
          cada ficha.
        </p>
      </section>
    </div>
  );
}
