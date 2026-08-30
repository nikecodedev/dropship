import Link from "next/link";
import CatalogGrid from "./catalog-grid";
import { listBrands, listProducts } from "@/lib/catalog";
import { GENDERS, GENDER_LABEL, type Channel, type Gender } from "@/lib/constants";

type Props = {
  channel: Channel;
  basePath: string;
  title: string;
  intro: string;
  searchParams: { brand?: string; gender?: string; q?: string };
};

export default async function CatalogView({
  channel,
  basePath,
  title,
  intro,
  searchParams,
}: Props) {
  const [products, brands] = await Promise.all([
    listProducts({
      channel,
      brand: searchParams.brand,
      gender: searchParams.gender,
      q: searchParams.q,
    }),
    listBrands(channel),
  ]);

  function filterHref(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...patch };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? basePath + "?" + qs : basePath;
  }

  const generos = GENDERS.filter((g) => g !== "NA") as Gender[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft leading-relaxed">{intro}</p>

      <div className="mt-10 flex flex-wrap gap-2 text-sm">
        <Link
          href={filterHref({ gender: undefined })}
          className={
            "border rounded-full px-4 py-1.5 " +
            (!searchParams.gender ? "border-gold text-gold" : "border-line hover:border-gold")
          }
        >
          Todos
        </Link>
        {generos.map((g) => (
          <Link
            key={g}
            href={filterHref({ gender: g })}
            className={
              "border rounded-full px-4 py-1.5 " +
              (searchParams.gender === g ? "border-gold text-gold" : "border-line hover:border-gold")
            }
          >
            {GENDER_LABEL[g]}
          </Link>
        ))}
      </div>

      {brands.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft">
          <Link href={filterHref({ brand: undefined })} className="hover:text-gold">
            Todas las marcas
          </Link>
          {brands.map((b) => (
            <Link
              key={b}
              href={filterHref({ brand: b })}
              className={searchParams.brand === b ? "text-gold" : "hover:text-gold"}
            >
              {b}
            </Link>
          ))}
        </div>
      )}

      <p className="mt-8 mb-6 text-xs text-ink-soft">
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </p>

      <CatalogGrid products={products} />
    </div>
  );
}
