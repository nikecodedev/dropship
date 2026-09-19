"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { SITE, whatsappLink } from "@/lib/constants";
import { cn } from "@/lib/ui";
import { Logo } from "./logo";
import {
  IconArrowRight,
  IconBag,
  IconClose,
  IconMenu,
  IconSearch,
  IconWhatsapp,
} from "./icons";

const NAV_LEFT = [
  { href: "/perfumes?gender=FEMENINO", label: "Mujer" },
  { href: "/perfumes?gender=MASCULINO", label: "Hombre" },
  { href: "/perfumes", label: "Todos los perfumes" },
];

const NAV_RIGHT = [
  { href: "/internacional", label: "Internacional" },
  { href: "/envios", label: "Envíos y pagos" },
];

const ANNOUNCEMENTS = [
  "Perfumes 100% originales, sellados en caja",
  "Entrega en 24 a 48 h en Asunción y Gran Asunción",
  "Envíos a todo el país por encomienda",
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, ready, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Al navegar se cierran el menu y el buscador.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function onSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    setSearchOpen(false);
    router.push(q ? "/perfumes?q=" + encodeURIComponent(q) : "/perfumes");
  }

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    return base !== "/" && pathname.startsWith(base) && !href.includes("?");
  };

  const whatsapp = whatsappLink("Hola, quería hacer una consulta sobre un perfume.");

  return (
    <>
      {/* Barra de anuncios */}
      <div className="bg-emerald text-champagne-3">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-8 px-5 text-[11px] tracking-[0.18em] uppercase">
          <span className="sm:hidden">{ANNOUNCEMENTS[0]}</span>
          {ANNOUNCEMENTS.map((text, i) => (
            <span key={text} className="hidden items-center gap-8 sm:flex">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-champagne/60" />}
              <span className={i === 2 ? "hidden lg:inline" : ""}>{text}</span>
            </span>
          ))}
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled
            ? "border-stone/80 bg-ivory/90 shadow-[0_8px_30px_-18px_rgb(15_46_40/0.35)] backdrop-blur-md"
            : "border-transparent bg-ivory",
        )}
      >
        <div className="mx-auto grid h-[76px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
          {/* Izquierda */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 rounded-full p-2 text-emerald transition-colors hover:bg-sand lg:hidden"
              aria-label="Abrir menú"
            >
              <IconMenu size={24} />
            </button>
            <nav className="hidden items-center gap-7 lg:flex">
              {NAV_LEFT.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative text-[13px] tracking-[0.06em] text-ink transition-colors hover:text-emerald",
                    isActive(item.href) && "text-emerald",
                  )}
                >
                  {item.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-champagne transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Logo al centro */}
          <Link href="/" aria-label={SITE.name + ", inicio"}>
            <Logo />
          </Link>

          {/* Derecha */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <nav className="mr-4 hidden items-center gap-7 lg:flex">
              {NAV_RIGHT.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative text-[13px] tracking-[0.06em] text-ink transition-colors hover:text-emerald",
                    isActive(item.href) && "text-emerald",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-px bg-champagne transition-all duration-300 group-hover:w-full",
                      isActive(item.href) ? "w-full" : "w-0",
                    )}
                  />
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="rounded-full p-2.5 text-emerald transition-colors hover:bg-sand"
              aria-label="Buscar"
            >
              <IconSearch size={21} />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative rounded-full p-2.5 text-emerald transition-colors hover:bg-sand"
              aria-label={"Abrir carrito" + (ready && count ? ", " + count + " productos" : "")}
            >
              <IconBag size={22} />
              {ready && count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-emerald">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador desplegable */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full animate-fade-in border-b border-stone bg-pearl shadow-card">
            <form onSubmit={onSearch} className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5">
              <IconSearch size={22} className="shrink-0 text-champagne" />
              <input
                ref={searchRef}
                name="q"
                placeholder="Buscá por perfume o marca: Yara, Armani, Light Blue…"
                className="w-full bg-transparent font-display text-2xl text-emerald placeholder:text-subtle focus:outline-none"
                autoComplete="off"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-muted" aria-label="Cerrar buscador">
                <IconClose size={20} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-noir/50 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-slide-in-left flex-col bg-emerald text-pearl">
            <div className="flex items-center justify-between px-6 py-5">
              <Logo light className="items-start" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-2 text-pearl/80 hover:bg-emerald-2"
                aria-label="Cerrar menú"
              >
                <IconClose size={24} />
              </button>
            </div>
            <nav className="flex flex-col px-6 pt-4">
              {[...NAV_LEFT, ...NAV_RIGHT].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between border-b border-pearl/10 py-4 font-display text-[26px] text-pearl"
                >
                  {item.label}
                  <IconArrowRight size={18} className="text-champagne" />
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-3 px-6 pb-8 text-[13px] text-pearl/70">
              <p className="eyebrow text-champagne-2">Atención personalizada</p>
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pearl">
                  <IconWhatsapp size={18} className="text-champagne" /> Escribinos por WhatsApp
                </a>
              ) : (
                <p>{SITE.city}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
