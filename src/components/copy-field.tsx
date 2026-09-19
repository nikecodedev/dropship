"use client";

import { useState } from "react";
import { cn } from "@/lib/ui";
import { IconCheck, IconCopy } from "./icons";

// Un dato bancario con boton para copiarlo. En el celular evita tener que
// tipear el numero de cuenta a mano en la app del banco.
export default function CopyField({
  label,
  value,
  copyValue,
  emphasis = false,
}: {
  label: string;
  value: string;
  copyValue?: string;
  emphasis?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sin permiso de portapapeles: el dato igual queda a la vista.
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[11px] tracking-[0.14em] uppercase text-muted">{label}</p>
        <p
          className={cn(
            "mt-0.5 truncate",
            emphasis ? "tabular font-display text-[28px] leading-tight text-emerald" : "text-[16px] font-medium text-ink",
          )}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] tracking-[0.1em] uppercase transition-all",
          copied
            ? "border-success bg-success text-pearl"
            : "border-stone text-emerald hover:border-emerald hover:bg-emerald hover:text-pearl",
        )}
        aria-label={"Copiar " + label}
      >
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
