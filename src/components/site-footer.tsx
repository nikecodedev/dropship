import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/constants";
import { Logo } from "./logo";
import { IconBank, IconBox, IconShield, IconTruck, IconWhatsapp } from "./icons";

const PROMISES = [
  { icon: IconShield, title: "100% originales", text: "Todos los frascos, sellados en su caja." },
  { icon: IconTruck, title: "Entrega en 24 a 48 h", text: "En Asunción y Gran Asunción." },
  { icon: IconBank, title: "Transferencia sin recargo", text: "Pagás directo a nuestra cuenta." },
  { icon: IconBox, title: "Envíos a todo el país", text: "Por encomienda al interior." },
];

export default function SiteFooter() {
  const whatsapp = whatsappLink("Hola, quería hacer una consulta.");

  return (
    <footer className="border-t border-pearl/10 bg-emerald text-pearl/80">
      {/* Promesas */}
      <div className="border-b border-pearl/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-12 sm:px-8 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-champagne/40 text-champagne">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-display text-lg text-pearl">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-pearl/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light className="items-start" />
          <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-pearl/60">
            Perfumería importada con stock propio en Paraguay. Fragancias francesas, árabes y de la
            línea Cuba, elegidas una por una.
          </p>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-champagne/40 px-5 py-2.5 text-[12px] tracking-[0.12em] uppercase text-champagne-2 transition-colors hover:bg-champagne hover:text-emerald"
            >
              <IconWhatsapp size={16} /> Consultanos
            </a>
          )}
        </div>

        <div>
          <p className="eyebrow text-champagne-2">Tienda</p>
          <ul className="mt-5 space-y-3 text-[14px]">
            <li>
              <Link href="/perfumes?gender=FEMENINO" className="hover:text-champagne-2">
                Perfumes de mujer
              </Link>
            </li>
            <li>
              <Link href="/perfumes?gender=MASCULINO" className="hover:text-champagne-2">
                Perfumes de hombre
              </Link>
            </li>
            <li>
              <Link href="/perfumes" className="hover:text-champagne-2">
                Todos los perfumes
              </Link>
            </li>
            <li>
              <Link href="/internacional" className="hover:text-champagne-2">
                Catálogo internacional
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-champagne-2">Ayuda</p>
          <ul className="mt-5 space-y-3 text-[14px]">
            <li>
              <Link href="/envios" className="hover:text-champagne-2">
                Envíos y entregas
              </Link>
            </li>
            <li>
              <Link href="/envios#pagos" className="hover:text-champagne-2">
                Medios de pago
              </Link>
            </li>
            <li>
              <Link href="/envios#cambios" className="hover:text-champagne-2">
                Cambios y devoluciones
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="hover:text-champagne-2">
                Mi carrito
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-champagne-2">Contacto</p>
          <ul className="mt-5 space-y-3 text-[14px]">
            <li>{SITE.city}</li>
            {SITE.email && (
              <li>
                <a href={"mailto:" + SITE.email} className="hover:text-champagne-2">
                  {SITE.email}
                </a>
              </li>
            )}
            {SITE.whatsapp && <li>WhatsApp +{SITE.whatsapp}</li>}
            {SITE.instagram && (
              <li>
                <a
                  href={"https://instagram.com/" + SITE.instagram.replace("@", "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-champagne-2"
                >
                  Instagram @{SITE.instagram.replace("@", "")}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-pearl/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-[12px] text-pearl/45 sm:flex-row sm:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.
          </p>
          <p>Todos los precios están expresados en guaraníes.</p>
        </div>
      </div>
    </footer>
  );
}
