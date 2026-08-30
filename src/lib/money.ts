// El guarani no usa decimales, asi que en PYG la "unidad minima" es 1 Gs.
// En USD trabajamos en centavos. Todo se guarda en enteros para no arrastrar
// errores de redondeo.

export type Currency = "PYG" | "USD";

const MINOR_UNITS: Record<Currency, number> = { PYG: 1, USD: 100 };

export function formatMoney(minor: number, currency: Currency = "PYG"): string {
  const value = minor / MINOR_UNITS[currency];
  if (currency === "PYG") {
    return `Gs ${new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(value)}`;
  }
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

// Convierte lo que se escribe en el panel ("185.000" o "185000") a entero.
export function parseMoneyToMinor(input: string, currency: Currency = "PYG"): number {
  const cleaned = input.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;
  if (currency === "PYG") {
    return Math.round(Number(cleaned.replace(/[.,]/g, "")) || 0);
  }
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  return Math.round((Number(normalized) || 0) * 100);
}

export function toMajor(minor: number, currency: Currency = "PYG"): number {
  return minor / MINOR_UNITS[currency];
}
