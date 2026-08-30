import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-display text-lg">{SITE.name}</p>
          <p className="mt-2 text-ink-soft">{SITE.tagline}</p>
        </div>

        <div>
          <p className="font-medium mb-3">Tienda</p>
          <ul className="space-y-2 text-ink-soft">
            <li>
              <Link href="/perfumes" className="hover:text-gold">
                Perfumeria
              </Link>
            </li>
            <li>
              <Link href="/internacional" className="hover:text-gold">
                Catalogo internacional
              </Link>
            </li>
            <li>
              <Link href="/envios" className="hover:text-gold">
                Envios y pagos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-medium mb-3">Contacto</p>
          <ul className="space-y-2 text-ink-soft">
            <li>{SITE.email}</li>
            <li>WhatsApp +{SITE.whatsapp}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-ink-soft">
        {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
