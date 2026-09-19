// Clases compartidas de la interfaz. Se exportan como texto para poder usarlas
// igual en links, botones y formularios sin envolver todo en componentes.

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full text-[13px] font-medium tracking-[0.08em] uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

export const btn = {
  primary: cn(
    btnBase,
    "bg-emerald text-pearl px-7 py-3.5 hover:bg-emerald-2 active:scale-[0.98] shadow-[0_10px_30px_-12px_rgb(15_46_40/0.6)]",
  ),
  gold: cn(
    btnBase,
    "bg-champagne text-emerald px-7 py-3.5 hover:bg-champagne-2 active:scale-[0.98]",
  ),
  outline: cn(
    btnBase,
    "border border-emerald/25 text-emerald px-7 py-3.5 hover:border-emerald hover:bg-emerald hover:text-pearl",
  ),
  ghostLight: cn(
    btnBase,
    "border border-pearl/30 text-pearl px-7 py-3.5 hover:bg-pearl hover:text-emerald",
  ),
  small: cn(
    btnBase,
    "bg-emerald text-pearl px-4 py-2 text-[11px] hover:bg-emerald-2",
  ),
  smallOutline: cn(
    btnBase,
    "border border-stone text-ink px-4 py-2 text-[11px] hover:border-emerald hover:text-emerald",
  ),
};

export const field =
  "w-full rounded-xl border border-stone bg-pearl px-4 py-3 text-[15px] text-ink placeholder:text-subtle transition-colors focus:border-emerald focus:outline-none focus:ring-4 focus:ring-emerald/10";

export const label = "mb-1.5 block text-[12px] font-medium tracking-wide text-muted";

export const card = "rounded-2xl border border-stone/70 bg-pearl";

export const container = "mx-auto w-full max-w-7xl px-5 sm:px-8";
