"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkPassword, createSession, destroySession, isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/catalog";
import { parseMoneyToMinor } from "@/lib/money";
import { cancelOrder, markOrderPaid } from "@/lib/orders";
import { ORDER_STATUSES } from "@/lib/constants";

async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("No autorizado");
}

// Despues de tocar productos se refrescan las paginas publicas que los muestran.
function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/perfumes");
  revalidatePath("/internacional");
}

export async function login(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) return { error: "La contraseña no es correcta." };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
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
  if (!name || !brand) return { error: "La marca y el nombre son obligatorios." };

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
    revalidateStore();
    redirect("/admin/productos/" + created.id);
  }

  revalidatePath("/admin/productos");
  revalidatePath("/admin/productos/" + id);
  revalidateStore();
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
  const label = str(formData, "label") || (sizeMl ? sizeMl + " ml" : "Único");

  const data = {
    label,
    sizeMl,
    sku: str(formData, "sku") || "SKU-" + Date.now().toString(36).toUpperCase(),
    priceMinor: parseMoneyToMinor(str(formData, "price"), currency),
    stock: Math.max(0, Number(str(formData, "stock", "0")) || 0),
    active: formData.get("active") === "on",
  };

  if (data.priceMinor <= 0) return { error: "El precio tiene que ser mayor a cero." };

  if (id) {
    await db.variant.update({ where: { id }, data });
  } else {
    await db.variant.create({ data: { ...data, productId } });
  }

  revalidatePath("/admin/productos/" + productId);
  revalidatePath("/admin/productos");
  revalidateStore();
  return { ok: true };
}

export async function deleteVariant(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const productId = String(formData.get("productId"));
  await db.variant.delete({ where: { id } });
  revalidatePath("/admin/productos/" + productId);
  revalidateStore();
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const stock = Math.max(0, Number(formData.get("stock")) || 0);
  await db.variant.update({ where: { id }, data: { stock } });
  revalidatePath("/admin/productos");
  revalidateStore();
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;

  const order = await db.order.findUnique({ where: { id } });
  // Un pedido cancelado ya devolvio su stock: reabrirlo desde un selector
  // dejaria el stock descuadrado, asi que queda cerrado.
  if (!order || order.status === "CANCELADO") return;

  if (status === "CANCELADO") {
    await cancelOrder(id, "Cancelado desde el panel.");
  } else if (status === "PAGADO" && order.paymentStatus !== "PAGADO") {
    await markOrderPaid(order.code, "confirmado-a-mano");
  } else {
    await db.order.update({ where: { id }, data: { status } });
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/pedidos/" + id);
  revalidatePath("/admin");
}

export async function cancelOrderAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await cancelOrder(id, "Cancelado desde el panel.");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/pedidos/" + id);
  revalidatePath("/admin");
  revalidateStore();
}

// Confirmacion manual de una transferencia bancaria. El stock ya quedo
// reservado al crear el pedido, asi que aca solo cambia el estado del pago.
export async function confirmTransfer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return;
  await markOrderPaid(order.code, "confirmado-a-mano");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/pedidos/" + id);
  revalidatePath("/admin");
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
  if (!data.name) return;
  if (id) await db.shippingZone.update({ where: { id }, data });
  else await db.shippingZone.create({ data });
  revalidatePath("/admin/envios");
  revalidatePath("/envios");
  revalidatePath("/checkout");
}
