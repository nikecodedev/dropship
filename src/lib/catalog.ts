import { db } from "@/lib/db";
import type { Channel } from "@/lib/constants";

// fullName vive en constants para poder usarse tambien en componentes de cliente.
export { fullName } from "@/lib/constants";

export function parseImages(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function coverImage(raw: string): string | null {
  return parseImages(raw)[0] ?? null;
}

export function productHref(product: { channel: string; slug: string }) {
  return (product.channel === "LOCAL" ? "/perfumes/" : "/internacional/") + product.slug;
}

// Rangos de precio pensados para este catalogo, que va de 65.000 a 750.000.
export const PRICE_RANGES = [
  { key: "hasta-200", label: "Hasta Gs. 200.000", min: 0, max: 200000 },
  { key: "200-500", label: "Gs. 200.000 a 500.000", min: 200000, max: 500000 },
  { key: "mas-500", label: "Más de Gs. 500.000", min: 500000, max: Infinity },
] as const;

export const SORTS = [
  { key: "destacados", label: "Destacados" },
  { key: "precio-asc", label: "Precio: menor a mayor" },
  { key: "precio-desc", label: "Precio: mayor a menor" },
  { key: "nombre", label: "Nombre: A a Z" },
] as const;

export type SortKey = (typeof SORTS)[number]["key"];

export type CatalogFilters = {
  channel: Channel;
  brand?: string;
  gender?: string;
  q?: string;
  price?: string;
  sort?: string;
};

const withVariants = {
  variants: { where: { active: true }, orderBy: { priceMinor: "asc" as const } },
};

export async function listProducts(filters: CatalogFilters) {
  const { channel, brand, gender, q, price, sort } = filters;

  const products = await db.product.findMany({
    where: {
      channel,
      active: true,
      ...(brand ? { brand } : {}),
      ...(gender ? { gender } : {}),
      // En Postgres "contains" distingue mayusculas, asi que la busqueda
      // necesita mode insensitive para que "yara" encuentre "Yara".
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { brand: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: withVariants,
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
  });

  // Precio y orden se resuelven aca: dependen del precio mas bajo entre las
  // presentaciones, que Prisma no ordena directo. Con un catalogo de decenas
  // de productos no cambia nada en rendimiento.
  const range = PRICE_RANGES.find((r) => r.key === price);
  let result = products.filter((p) => p.variants.length > 0);
  if (range) {
    result = result.filter((p) => {
      const min = fromPrice(p.variants) ?? 0;
      return min >= range.min && min < range.max;
    });
  }

  if (sort === "precio-asc") {
    result.sort((a, b) => (fromPrice(a.variants) ?? 0) - (fromPrice(b.variants) ?? 0));
  } else if (sort === "precio-desc") {
    result.sort((a, b) => (fromPrice(b.variants) ?? 0) - (fromPrice(a.variants) ?? 0));
  } else if (sort === "nombre") {
    result.sort((a, b) => (a.brand + a.name).localeCompare(b.brand + b.name, "es"));
  }

  return result;
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      variants: { where: { active: true }, orderBy: [{ sizeMl: "asc" }, { priceMinor: "asc" }] },
      supplier: true,
    },
  });
}

// Marcas con la cantidad de productos, respetando el genero elegido.
export async function listBrands(channel: Channel, gender?: string) {
  const rows = await db.product.groupBy({
    by: ["brand"],
    where: { channel, active: true, ...(gender ? { gender } : {}) },
    _count: { _all: true },
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => ({ brand: r.brand, count: r._count._all }));
}

export async function countByGender(channel: Channel) {
  const rows = await db.product.groupBy({
    by: ["gender"],
    where: { channel, active: true },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((r) => [r.gender, r._count._all])) as Record<string, number>;
}

export async function featuredProducts(channel: Channel, take = 8) {
  return db.product.findMany({
    where: { channel, active: true },
    include: withVariants,
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take,
  });
}

export async function productsByGender(channel: Channel, gender: string, take = 4) {
  return db.product.findMany({
    where: { channel, active: true, gender },
    include: withVariants,
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take,
  });
}

// Productos para "tambien te puede gustar": primero del mismo genero.
export async function relatedProducts(
  product: { id: string; channel: string; gender: string },
  take = 4,
) {
  const sameGender = await db.product.findMany({
    where: { channel: product.channel, active: true, gender: product.gender, id: { not: product.id } },
    include: withVariants,
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take,
  });
  if (sameGender.length >= take) return sameGender;

  const rest = await db.product.findMany({
    where: {
      channel: product.channel,
      active: true,
      id: { notIn: [product.id, ...sameGender.map((p) => p.id)] },
    },
    include: withVariants,
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take: take - sameGender.length,
  });
  return [...sameGender, ...rest];
}

// Precio mas bajo entre las variantes activas, para mostrar "desde Gs. X".
export function fromPrice(variants: { priceMinor: number }[]): number | null {
  if (variants.length === 0) return null;
  return Math.min(...variants.map((v) => v.priceMinor));
}

export function totalStock(variants: { stock: number }[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

// Resumen de presentaciones para la tarjeta: "100 ml", "100 ml · 200 ml".
export function sizeSummary(variants: { sizeMl: number | null; label: string }[]) {
  const labels = variants.map((v) => (v.sizeMl ? v.sizeMl + " ml" : v.label));
  return Array.from(new Set(labels)).join(" · ");
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
