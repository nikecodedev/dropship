import { cn } from "@/lib/ui";

// Logo tipografico provisorio: el nombre compuesto en Cormorant italica con el
// rotulo en mayusculas espaciadas. Se reemplaza cuando este el logo final.
export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn("flex flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "font-display text-[30px] font-semibold italic tracking-tight sm:text-[34px]",
          light ? "text-pearl" : "text-emerald",
        )}
      >
        Zunilda
      </span>
      <span
        className={cn(
          "mt-1 text-[9px] font-medium tracking-[0.5em] uppercase",
          light ? "text-champagne-2" : "text-champagne",
        )}
      >
        Perfumería
      </span>
    </span>
  );
}
