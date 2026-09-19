"use client";

import { useState } from "react";
import { cn } from "@/lib/ui";

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto sm:w-20 sm:flex-col">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-sand transition-all",
                i === active ? "border-emerald" : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={"Ver imagen " + (i + 1)}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-3xl bg-sand">
        {current ? (
          <img src={current} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[13px] text-subtle">Foto próximamente</div>
        )}
      </div>
    </div>
  );
}
