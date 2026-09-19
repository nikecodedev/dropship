import Link from "next/link";
import CatalogGrid from "./catalog-grid";
import SortSelect from "./sort-select";
import { IconChevronDown, IconChevronRight, IconClose, IconSearch } from "./icons";
import { PRICE_RANGES, countByGender, listBrands, listProducts } from "@/lib/catalog";
import { GENDER_NAV, type Channel } from "@/lib/constants";
import { btn, cn, container } from "@/lib/ui";

export type CatalogParams = {
  brand?: string;
  gender?: string;
  q?: string;
  price?: string;
  sort?: string;
};

type Props = {
  channel: Channel;
  basePath: string;
  eyebrow: string;
  title: string;
  intro: string;
  params: CatalogParams;
};

const GENDER_TITLES: Record<string, string> = {
  FEMENINO: "Perfumes de mujer",
  MASCULINO: "Perfumes de hombre",
  UNISEX: "Perfumes unisex",
};

export default async function CatalogView({ channel, basePath, eyebrow, title, intro, params }: Props) {
  const [products, brands, genders] = await Promise.all([
    listProducts({ channel, ...params }),
    listBrands(channel, params.gender),
    countByGender(channel),
  ]);

  function href(patch: Partial<CatalogParams>) {
    const merged = { ...params, ...patch };
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value) qs.set(key, value);
    }
    const s = qs.toString();
    return s ? basePath + "?" + s : basePath;
  }

  const heading = params.q
    ? "Resultados para “" + params.q + "”"
    : params.gender && GENDER_TITLES[params.gender]
      ? GENDER_TITLES[params.gender]
      : title;

  const totalActive = Object.values(genders).reduce((a, b) => a + b, 0);
  const genderOptions = (Object.keys(GENDER_NAV) as (keyof typeof GENDER_NAV)[]).filter(
    (g) => (genders[g] ?? 0) > 0,
  );

  const chips: { label: string; remove: Partial<CatalogParams> }[] = [];
  if (params.q) chips.push({ label: "Búsqueda: " + params.q, remove: { q: undefined } });
  if (params.gender && GENDER_NAV[params.gender as keyof typeof GENDER_NAV])
    chips.push({ label: GENDER_NAV[params.gender as keyof typeof GENDER_NAV], remove: { gender: undefined } });
  if (params.brand) chips.push({ label: params.brand, remove: { brand: undefined } });
  const range = PRICE_RANGES.find((r) => r.key === params.price);
  if (range) chips.push({ label: range.label, remove: { price: undefined } });

  const filters = (
    <div className="space-y-9">
      <form action={basePath} className="relative">
        {params.gender && <input type="hidden" name="gender" value={params.gender} />}
        <IconSearch size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Buscar perfume o marca"
          className="w-full rounded-full border border-stone bg-pearl py-2.5 pl-11 pr-4 text-[14px] placeholder:text-subtle focus:border-emerald focus:outline-none"
        />
      </form>

      {genderOptions.length > 0 && (
        <FilterGroup title="Para">
          <FilterLink href={href({ gender: undefined, brand: undefined })} active={!params.gender} count={totalActive}>
            Todos
          </FilterLink>
          {genderOptions.map((g) => (
            <FilterLink
              key={g}
              href={href({ gender: g, brand: undefined })}
              active={params.gender === g}
              count={genders[g]}
            >
              {GENDER_NAV[g]}
            </FilterLink>
          ))}
        </FilterGroup>
      )}

      {brands.length > 1 && (
        <FilterGroup title="Marca">
          <FilterLink href={href({ brand: undefined })} active={!params.brand}>
            Todas las marcas
          </FilterLink>
          {brands.map((b) => (
            <FilterLink key={b.brand} href={href({ brand: b.brand })} active={params.brand === b.brand} count={b.count}>
              {b.brand}
            </FilterLink>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Precio">
        <FilterLink href={href({ price: undefined })} active={!params.price}>
          Todos los precios
        </FilterLink>
        {PRICE_RANGES.map((r) => (
          <FilterLink key={r.key} href={href({ price: r.key })} active={params.price === r.key}>
            {r.label}
          </FilterLink>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div>
      {/* Encabezado */}
      <section className="border-b border-stone/70 bg-sand/50">
        <div className={cn(container, "py-12 sm:py-16")}>
          <nav className="flex items-center gap-1.5 text-[12px] text-muted" aria-label="Ruta">
            <Link href="/" className="hover:text-emerald">
              Inicio
            </Link>
            <IconChevronRight size={13} />
            <span className="text-ink">{eyebrow}</span>
          </nav>
          <h1 className="mt-5 text-[44px] text-emerald sm:text-[60px]">{heading}</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>
        </div>
      </section>

      <div className={cn(container, "grid gap-10 pb-24 pt-10 lg:grid-cols-[240px_1fr] lg:gap-14 lg:pt-14")}>
        {/* Filtros: columna en escritorio, desplegable en celular */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">{filters}</div>
        </aside>

        <div>
          <details className="mb-6 rounded-2xl border border-stone bg-pearl lg:hidden">
            <summary className="flex items-center justify-between px-5 py-4 text-[13px] font-medium tracking-wide text-emerald">
              Filtrar productos
              <IconChevronDown size={18} className="chevron transition-transform" />
            </summary>
            <div className="border-t border-stone px-5 py-6">{filters}</div>
          </details>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone/70 pb-5">
            <p className="text-[13px] text-muted">
              <span className="font-medium text-ink">{products.length}</span>{" "}
              {products.length === 1 ? "producto" : "productos"}
            </p>
            <SortSelect basePath={basePath} params={params as Record<string, string | undefined>} />
          </div>

          {chips.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <Link
                  key={chip.label}
                  href={href(chip.remove)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-3.5 py-1.5 text-[12px] text-pearl transition-colors hover:bg-emerald-2"
                >
                  {chip.label}
                  <IconClose size={13} />
                </Link>
              ))}
              <Link href={basePath} className="ml-1 text-[12px] text-muted underline-offset-2 hover:text-emerald hover:underline">
                Limpiar todo
              </Link>
            </div>
          )}

          <div className="mt-10">
            {products.length > 0 ? (
              <CatalogGrid products={products} />
            ) : (
              <div className="rounded-3xl border border-dashed border-stone px-6 py-20 text-center">
                <p className="font-display text-3xl text-emerald">No encontramos perfumes con esos filtros</p>
                <p className="mx-auto mt-3 max-w-md text-[14px] text-muted">
                  Probá quitando algún filtro o buscando por otra marca. Si buscás algo puntual,
                  escribinos y te decimos si lo conseguimos.
                </p>
                <Link href={basePath} className={cn(btn.outline, "mt-8")}>
                  Ver todos los perfumes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-champagne">{title}</p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function FilterLink({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2 text-[14px] transition-colors",
          active ? "bg-emerald text-pearl" : "text-ink hover:bg-sand",
        )}
      >
        <span>{children}</span>
        {count !== undefined && (
          <span className={cn("tabular text-[12px]", active ? "text-champagne-2" : "text-subtle")}>{count}</span>
        )}
      </Link>
    </li>
  );
}
