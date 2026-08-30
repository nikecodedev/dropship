export const CHANNEL = {
  LOCAL: "LOCAL",
  DROPSHIP: "DROPSHIP",
} as const;
export type Channel = (typeof CHANNEL)[keyof typeof CHANNEL];

export const CHANNEL_LABEL: Record<Channel, string> = {
  LOCAL: "Perfumeria",
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

export const PAYMENT_STATUSES = ["PENDIENTE", "PAGADO", "FALLIDO", "REEMBOLSADO"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SITE = {
  name: "Aroma Paraguay",
  tagline: "Perfumeria importada y catalogo internacional",
  whatsapp: "595000000000",
  email: "hola@ejemplo.com.py",
};
