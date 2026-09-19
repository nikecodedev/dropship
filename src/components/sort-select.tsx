"use client";

import { useRouter } from "next/navigation";
import { SORTS } from "@/lib/catalog";
import { IconChevronDown } from "./icons";

export default function SortSelect({
  basePath,
  params,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const router = useRouter();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, sort: event.target.value })) {
      if (value && !(key === "sort" && value === "destacados")) next.set(key, value);
    }
    const qs = next.toString();
    router.push(qs ? basePath + "?" + qs : basePath, { scroll: false });
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Ordenar por</span>
      <select
        value={params.sort ?? "destacados"}
        onChange={onChange}
        className="cursor-pointer appearance-none rounded-full border border-stone bg-pearl py-2.5 pl-4 pr-10 text-[13px] text-ink transition-colors hover:border-emerald focus:border-emerald focus:outline-none"
      >
        {SORTS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      <IconChevronDown size={16} className="pointer-events-none absolute right-3.5 text-muted" />
    </label>
  );
}
