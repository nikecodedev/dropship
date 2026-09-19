"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui";
import { IconBox, IconDashboard, IconReceipt, IconTruck } from "../icons";

const ITEMS = [
  { href: "/admin", label: "Resumen", icon: IconDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: IconReceipt, badge: "pending" as const },
  { href: "/admin/productos", label: "Productos", icon: IconBox },
  { href: "/admin/envios", label: "Zonas de envío", icon: IconTruck },
];

export default function AdminNav({ pending, horizontal = false }: { pending: number; horizontal?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn(horizontal ? "no-scrollbar flex gap-1 overflow-x-auto" : "flex flex-col gap-1")}>
      {ITEMS.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-[14px] transition-colors",
              active ? "bg-pearl/10 text-pearl" : "text-pearl/60 hover:bg-pearl/5 hover:text-pearl",
            )}
          >
            <Icon size={19} className={active ? "text-champagne-2" : ""} />
            <span className="flex-1 whitespace-nowrap">{label}</span>
            {badge === "pending" && pending > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-champagne px-1.5 text-[11px] font-semibold text-emerald">
                {pending}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
