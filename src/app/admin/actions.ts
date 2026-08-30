"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkPassword, createSession, destroySession, isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/catalog";
import { parseMoneyToMinor } from "@/lib/money";
import { markOrderPaid } from "@/lib/orders";

async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("No autorizado");
}

export async function login(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) return { error: "Contrasena incorrecta" };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin");
}

function str(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

export async function saveProduct(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  const name = str(formData, "name");
  const brand = str(formData, "brand");
  if (!name || !brand) return { error: "Marca y nombre son obligatorios" };

  const images = str(formData, "images")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const data = {
    name,
    brand,
    description: str(formData, "description"),
    channel: str(formData, "channel", "LOCAL"),
    concentration: str(formData, "concentration", "NA"),
    gender: str(formData, "gender", "NA"),
    condition: str(formData, "condition", "NUEVO_SELLADO"),
    currency: str(formData, "channel", "LOCAL") === "DROPSHIP" ? "USD" : "PYG",
    images: JSON.stringify(images),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    supplierRef: str(formData, "supplierRef") || null,
  };

  if (id) {
    await db.product.update({ where: { id }, data });
  } else {
    const created = await db.product.create({
      data: { ...data, slug: await uniqueSlug(slugify(brand + " " + name)) },
    });
    revalidatePath("/admin/productos");
    redirect("/admin/productos/" + created.id);
  }

  revalidatePath("/admin/productos");
  revalidatePath("/perfumes");
  revalidatePath("/internacional");
  return { ok: true };
}

async function uniqueSlug(base: string) {
  let slug = base || "producto";
  let n = 2;
  while (await db.product.findUnique({ where: { slug } })) {
    slug = base + "-" + n;
    n += 1;
  }
  return slug;
}

export async function saveVariant(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  const productId = str(formData, "productId");
  const currency = str(formData, "currency", "PYG") as "PYG" | "USD";
  const sizeRaw = str(formData, "sizeMl");
  const sizeMl = sizeRaw ? Number(sizeRaw) : null;
  const label = str(formData, "label") || (sizeMl ? sizeMl + " ml" : "Unico");

  const data = {
    label,
    sizeMl,
    sku: str(formData, "sku") || "SKU-" + Date.now().toString(36).toUpperCase(),
    priceMinor: parseMoneyToMinor(str(formData, "price"), currency),
    stock: Number(str(formData, "stock", "0")) || 0,
    active: formData.get("active") === "on",
  };

  if (data.priceMinor <= 0) return { error: "El precio tiene que ser mayor a cero" };

  if (id) {
    await db.variant.update({ where: { id }, data });
  } else {
    await db.variant.create({ data: { ...data, productId } });
  }

  revalidatePath("/admin/productos/" + productId);
  return { ok: true };
}

export async function deleteVariant(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId"));
  await db.variant.delete({ where: { id } });
  revalidatePath("/admin/productos/" + productId);
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const stock = Number(formData.get("stock")) || 0;
  await db.variant.update({ where: { id }, data: { stock } });
  revalidatePath("/admin/productos");
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await db.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/pedidos/" + id);
}

// Confirmacion manual de una transferencia bancaria. Descuenta el stock igual
// que si el pago hubiera llegado por la pasarela.
export async function confirmTransfer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return;
  await markOrderPaid(order.code, "confirmado-a-mano");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/pedidos/" + id);
}

export async function saveZone(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    coverage: String(formData.get("coverage") ?? "").trim(),
    priceMinor: parseMoneyToMinor(String(formData.get("price") ?? ""), "PYG"),
    etaText: String(formData.get("etaText") ?? "").trim(),
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder")) || 0,
  };
  if (id) await db.shippingZone.update({ where: { id }, data });
  else await db.shippingZone.create({ data });
  revalidatePath("/admin/envios");
  revalidatePath("/envios");
}
