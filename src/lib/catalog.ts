import { db } from "@/lib/db";
import type { Channel } from "@/lib/constants";

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

export type CatalogFilters = {
  channel: Channel;
  brand?: string;
  gender?: string;
  q?: string;
};

export async function listProducts(filters: CatalogFilters) {
  const { channel, brand, gender, q } = filters;
  return db.product.findMany({
    where: {
      channel,
      active: true,
      ...(brand ? { brand } : {}),
      ...(gender && gender !== "TODOS" ? { gender } : {}),
      ...(q
        ? {
            OR: [{ name: { contains: q } }, { brand: { contains: q } }],
          }
        : {}),
    },
    include: { variants: { where: { active: true }, orderBy: { priceMinor: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      variants: { where: { active: true }, orderBy: { sizeMl: "asc" } },
      supplier: true,
    },
  });
}

export async function listBrands(channel: Channel) {
  const rows = await db.product.findMany({
    where: { channel, active: true },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand);
}

export async function featuredProducts(channel: Channel, take = 4) {
  return db.product.findMany({
    where: { channel, active: true },
    include: { variants: { where: { active: true }, orderBy: { priceMinor: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
  });
}

// Precio mas bajo entre las variantes activas, para mostrar "desde Gs X".
export function fromPrice(variants: { priceMinor: number }[]): number | null {
  if (variants.length === 0) return null;
  return Math.min(...variants.map((v) => v.priceMinor));
}

export function totalStock(variants: { stock: number }[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
