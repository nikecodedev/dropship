import { notFound } from "next/navigation";
import BuyBox from "./buy-box";
import { getProductBySlug, parseImages } from "@/lib/catalog";
import {
  CONCENTRATION_LABEL,
  CONDITION_LABEL,
  GENDER_LABEL,
  type Channel,
  type Concentration,
  type Condition,
  type Gender,
} from "@/lib/constants";

export default async function ProductView({
  slug,
  channel,
}: {
  slug: string;
  channel: Channel;
}) {
  const product = await getProductBySlug(slug);
  if (!product || !product.active || product.channel !== channel) notFound();

  const images = parseImages(product.images);
  const esLocal = channel === "LOCAL";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 lg:grid-cols-2">
      <div>
        <div className="aspect-[3/4] bg-sand rounded-sm overflow-hidden">
          {images[0] ? (
            <img
              src={images[0]}
              alt={product.brand + " " + product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-ink-soft text-sm">
              Foto pendiente
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {images.slice(1, 5).map((src) => (
              <div key={src} className="aspect-square bg-sand rounded-sm overflow-hidden">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">{product.brand}</p>
        <h1 className="text-3xl sm:text-4xl mt-2">{product.name}</h1>

        <p className="mt-3 text-sm text-ink-soft">
          {[
            CONCENTRATION_LABEL[product.concentration as Concentration],
            GENDER_LABEL[product.gender as Gender],
          ]
            .filter(Boolean)
            .join(" \u00b7 ")}
        </p>

        {/* El estado del frasco se declara siempre. Si el comprador se entera
            recien al abrir el paquete, el reclamo cae sobre la tienda. */}
        {esLocal && (
          <p className="mt-4 inline-block border border-line rounded-full px-3 py-1 text-xs">
            {CONDITION_LABEL[product.condition as Condition]}
          </p>
        )}

        {product.description && (
          <p className="mt-6 text-sm leading-relaxed text-ink-soft whitespace-pre-line">
            {product.description}
          </p>
        )}

        <div className="mt-8 border-t border-line pt-8">
          <BuyBox
            slug={product.slug}
            brand={product.brand}
            name={product.name}
            image={images[0] ?? null}
            currency={product.currency as "PYG" | "USD"}
            channel={channel}
            variants={product.variants.map((v) => ({
              id: v.id,
              label: v.label,
              sizeMl: v.sizeMl,
              priceMinor: v.priceMinor,
              stock: v.stock,
            }))}
          />
        </div>

        <div className="mt-10 border border-line rounded-sm p-6 text-sm text-ink-soft leading-relaxed">
          {esLocal ? (
            <>
              <p className="text-ink font-medium mb-2">Entrega en Paraguay</p>
              <p>
                Asuncion y Gran Asuncion en 24 a 48 horas. Interior por encomienda, entre 2 y 4 dias
                habiles. El costo se calcula por zona en el checkout.
              </p>
            </>
          ) : (
            <>
              <p className="text-ink font-medium mb-2">Envio internacional</p>
              <p>
                Este producto lo despacha el proveedor en el exterior. El plazo estimado es de 15 a
                30 dias segun el destino, y el costo de envio se calcula en el checkout. No se
                combina en el mismo pedido con productos de la perfumeria local.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
