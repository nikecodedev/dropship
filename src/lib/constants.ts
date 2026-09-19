export const CHANNEL = {
  LOCAL: "LOCAL",
  DROPSHIP: "DROPSHIP",
} as const;
export type Channel = (typeof CHANNEL)[keyof typeof CHANNEL];

export const CHANNEL_LABEL: Record<Channel, string> = {
  LOCAL: "Perfumería",
  DROPSHIP: "Internacional",
};

export const CONCENTRATIONS = ["EDT", "EDP", "PARFUM", "EDC", "NA"] as const;
export type Concentration = (typeof CONCENTRATIONS)[number];

export const CONCENTRATION_LABEL: Record<Concentration, string> = {
  EDT: "Eau de Toilette",
  EDP: "Eau de Parfum",
  PARFUM: "Parfum",
  EDC: "Eau de Cologne",
  NA: "",
};

export const GENDERS = ["FEMENINO", "MASCULINO", "UNISEX", "NA"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABEL: Record<Gender, string> = {
  FEMENINO: "Femenino",
  MASCULINO: "Masculino",
  UNISEX: "Unisex",
  NA: "",
};

// Como se nombra cada genero en la navegacion de la tienda.
export const GENDER_NAV: Record<Exclude<Gender, "NA">, string> = {
  FEMENINO: "Mujer",
  MASCULINO: "Hombre",
  UNISEX: "Unisex",
};

// Estado del frasco. Importante declararlo en la ficha: si la clienta vende
// frascos abiertos o decants, el comprador tiene que verlo antes de pagar.
export const CONDITIONS = ["NUEVO_SELLADO", "NUEVO_ABIERTO", "USADO"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const CONDITION_LABEL: Record<Condition, string> = {
  NUEVO_SELLADO: "Nuevo, sellado en caja",
  NUEVO_ABIERTO: "Nuevo, caja abierta",
  USADO: "Usado",
};

export const ORDER_STATUSES = [
  "PENDIENTE",
  "PAGADO",
  "PREPARANDO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente de pago",
  PAGADO: "Pagado",
  PREPARANDO: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const PAYMENT_STATUSES = ["PENDIENTE", "PAGADO", "FALLIDO", "REEMBOLSADO"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDIENTE: "Pago pendiente",
  PAGADO: "Pago confirmado",
  FALLIDO: "Pago fallido",
  REEMBOLSADO: "Reembolsado",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  pagopar: "Pagopar",
  transferencia: "Transferencia bancaria",
  internacional: "Tarjeta internacional",
};

// Los datos de contacto vienen de variables de entorno. Si no estan cargados,
// los botones de WhatsApp y el email simplemente no se muestran: es mejor eso
// que mandar a los clientes a un numero de ejemplo.
function onlyDigits(value: string | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export const SITE = {
  name: "Zunilda Perfumería",
  shortName: "Zunilda",
  tagline: "Perfumería importada en Paraguay",
  whatsapp: onlyDigits(process.env.NEXT_PUBLIC_WHATSAPP),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
  city: "Asunción, Paraguay",
};

// Nombre completo para titulos, pedidos y mensajes. Algunos perfumes ya traen
// la marca en el nombre ("Azzaro Pour Homme"): ahi no se repite.
export function fullName(brand: string, name: string) {
  return name.toLowerCase().startsWith(brand.toLowerCase()) ? name : brand + " " + name;
}

export function whatsappLink(message: string) {
  if (!SITE.whatsapp) return null;
  return "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(message);
}

// Convierte un celular paraguayo como lo escribe la gente (0981 123 456) al
// formato internacional que necesita WhatsApp (595981123456).
export function paraguayPhoneToWhatsapp(phone: string) {
  const digits = onlyDigits(phone);
  if (!digits) return null;
  if (digits.startsWith("595")) return digits;
  if (digits.startsWith("0")) return "595" + digits.slice(1);
  if (digits.length === 9) return "595" + digits;
  return digits;
}
