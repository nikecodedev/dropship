"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { SITE } from "@/lib/constants";

export default function SiteHeader() {
  const { count, ready } = useCart();

  return (
    <header className="border-b border-line bg-cream sticky top-0 z-40">
      <div className="bg-ink text-sand text-center text-xs py-2 px-4">
        Perfumeria con entrega en Asuncion y Gran Asuncion. Envios al interior por encomienda.
      </div>
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="font-display text-xl tracking-tight">
          {SITE.name}
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm">
          <Link href="/perfumes" className="hover:text-gold transition-colors">
            Perfumeria
          </Link>
          <Link href="/internacional" className="hover:text-gold transition-colors">
            Catalogo internacional
          </Link>
          <Link href="/envios" className="hover:text-gold transition-colors">
            Envios y pagos
          </Link>
        </div>

        <Link
          href="/carrito"
          className="text-sm border border-line rounded-full px-4 py-2 hover:border-gold transition-colors"
        >
          Carrito{ready && count > 0 ? " (" + count + ")" : ""}
        </Link>
      </nav>

      <div className="md:hidden border-t border-line flex text-sm">
        <Link href="/perfumes" className="flex-1 text-center py-3 border-r border-line">
          Perfumeria
        </Link>
        <Link href="/internacional" className="flex-1 text-center py-3">
          Internacional
        </Link>
      </div>
    </header>
  );
}
