import Link from "next/link";
import CatalogGrid from "@/components/catalog-grid";
import {
  IconArrowRight,
  IconBank,
  IconSeal,
  IconShield,
  IconTruck,
  IconWhatsapp,
} from "@/components/icons";
import { countByGender, coverImage, featuredProducts, fromPrice, fullName, listBrands, productHref } from "@/lib/catalog";
import { CHANNEL, CONCENTRATION_LABEL, type Concentration, whatsappLink } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { btn, cn, container } from "@/lib/ui";

// La portada muestra productos, asi que se arma en cada visita. Si se
// prerenderiza, el build intenta leer la base y falla donde no hay base
// todavia, ademas de congelar el catalogo en el HTML.
export const dynamic = "force-dynamic";

const HERO_SLUGS = ["givenchy-ange-ou-demon", "lattafa-yara", "armani-acqua-di-gio"];
const SPOTLIGHT_SLUG = "givenchy-ange-ou-demon";

export default async function HomePage() {
  const [destacados, brands, genders, heroProducts, spotlight] = await Promise.all([
    featuredProducts(CHANNEL.LOCAL, 8),
    listBrands(CHANNEL.LOCAL),
    countByGender(CHANNEL.LOCAL),
    db.product.findMany({ where: { slug: { in: HERO_SLUGS }, active: true } }),
    db.product.findFirst({
      where: { slug: SPOTLIGHT_SLUG, active: true },
      include: { variants: { where: { active: true }, orderBy: { priceMinor: "asc" } } },
    }),
  ]);

  const totalProducts = Object.values(genders).reduce((a, b) => a + b, 0);
  const hero = HERO_SLUGS.map((slug) => heroProducts.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const whatsapp = whatsappLink("Hola, quería que me recomienden un perfume.");

  // Imagenes para las tarjetas de mujer y hombre, tomadas del catalogo real.
  const [mujer, hombre] = await Promise.all([
    db.product.findMany({ where: { channel: CHANNEL.LOCAL, active: true, gender: "FEMENINO" }, orderBy: [{ featured: "desc" }], take: 2 }),
    db.product.findMany({ where: { channel: CHANNEL.LOCAL, active: true, gender: "MASCULINO" }, orderBy: [{ featured: "desc" }], take: 2 }),
  ]);

  return (
    <>
      {/* ------------------------------------------------ Hero */}
      <section className="relative overflow-hidden bg-emerald text-pearl">
        <div className="pointer-events-none absolute -left-32 top-10 h-[480px] w-[480px] rounded-full bg-emerald-3/35 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-champagne/10 blur-3xl" />

        <div className={cn(container, "relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:py-28")}>
          <div className="animate-fade-up">
            <p className="eyebrow text-champagne-2">Perfumería importada · Asunción</p>
            <h1 className="mt-6 text-[52px] leading-[0.98] sm:text-[76px] lg:text-[84px]">
              Perfumes originales,{" "}
              <em className="font-medium text-champagne-2">sellados en su caja.</em>
            </h1>
            <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-pearl/70">
              Givenchy, Armani, Dolce &amp; Gabbana, Lancôme, Lattafa y más. Stock propio en Asunción y
              entrega en 24 a 48 horas.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/perfumes" className={btn.gold}>
                Comprar perfumes <IconArrowRight size={16} />
              </Link>
              <Link href="/envios" className={btn.ghostLight}>
                Cómo comprar
              </Link>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-pearl/15 pt-8">
              <div>
                <dt className="text-[11px] tracking-[0.14em] uppercase text-pearl/50">Fragancias</dt>
                <dd className="mt-1 font-display text-4xl text-champagne-2">{totalProducts}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.14em] uppercase text-pearl/50">Marcas</dt>
                <dd className="mt-1 font-display text-4xl text-champagne-2">{brands.length}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.14em] uppercase text-pearl/50">Entrega</dt>
                <dd className="mt-1 font-display text-4xl text-champagne-2">48 h</dd>
              </div>
            </dl>
          </div>

          {/* Composicion de frascos en arcos */}
          {hero.length === 3 && (
            <div className="relative mx-auto grid w-full max-w-[560px] grid-cols-3 items-end gap-3 sm:gap-4">
              {hero.map((p, i) => (
                <Link
                  key={p.id}
                  href={productHref(p)}
                  className={cn(
                    "group relative block overflow-hidden rounded-t-full rounded-b-2xl border border-pearl/15 bg-sand shadow-lift",
                    i === 1 ? "aspect-[3/5.2] -translate-y-6" : "aspect-[3/4.4]",
                    "animate-fade-up",
                  )}
                  style={{ animationDelay: 150 + i * 120 + "ms" }}
                >
                  <img
                    src={coverImage(p.images) ?? ""}
                    alt={fullName(p.brand, p.name)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ Marcas */}
      {brands.length > 0 && (
        <section className="overflow-hidden border-b border-stone/70 bg-pearl py-7">
          <div className="flex w-max animate-marquee gap-14 pr-14">
            {[...brands, ...brands, ...brands, ...brands].map((b, i) => (
              <Link
                key={b.brand + i}
                href={"/perfumes?brand=" + encodeURIComponent(b.brand)}
                className="whitespace-nowrap font-display text-[28px] italic text-emerald/70 transition-colors hover:text-emerald"
              >
                {b.brand}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------ Mujer / Hombre */}
      <section className={cn(container, "grid gap-5 pt-20 md:grid-cols-2")}>
        {[
          { label: "Para ella", title: "Perfumes de mujer", href: "/perfumes?gender=FEMENINO", count: genders.FEMENINO ?? 0, items: mujer },
          { label: "Para él", title: "Perfumes de hombre", href: "/perfumes?gender=MASCULINO", count: genders.MASCULINO ?? 0, items: hombre },
        ].map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group relative flex min-h-[460px] overflow-hidden rounded-3xl bg-emerald-2 p-8 text-pearl sm:min-h-[360px] sm:p-10"
          >
            <div className="absolute inset-x-0 bottom-0 flex h-[56%] items-end justify-center gap-3 px-8 sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[58%] sm:justify-end sm:px-0 sm:pr-5 sm:pt-8">
              {cat.items.map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    "overflow-hidden rounded-t-full rounded-b-xl bg-sand shadow-lift transition-transform duration-700 group-hover:-translate-y-2",
                    i === 0 ? "h-[92%] w-[42%] sm:h-[88%] sm:w-1/2" : "h-[78%] w-[42%] sm:h-[74%] sm:w-1/2",
                  )}
                >
                  <img src={coverImage(p.images) ?? ""} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <div className="relative z-10 flex flex-col sm:max-w-[48%]">
              <p className="eyebrow text-champagne-2">{cat.label}</p>
              <h2 className="mt-4 text-[38px] leading-[1.02] sm:text-[46px]">{cat.title}</h2>
              <p className="mt-3 text-[14px] text-pearl/60">
                {cat.count} {cat.count === 1 ? "fragancia" : "fragancias"}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-[12px] tracking-[0.16em] uppercase text-champagne-2 sm:mt-auto sm:pt-10">
                Ver colección
                <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ------------------------------------------------ Destacados */}
      <section className={cn(container, "pt-24")}>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-champagne">Selección de la casa</p>
            <h2 className="mt-3 text-[42px] text-emerald sm:text-[52px]">Los más pedidos</h2>
          </div>
          <Link href="/perfumes" className={btn.outline}>
            Ver todos los perfumes
          </Link>
        </div>
        <CatalogGrid products={destacados} columns="wide" />
      </section>

      {/* ------------------------------------------------ Recomendacion */}
      {spotlight && (
        <section className={cn(container, "pt-28")}>
          <div className="grid overflow-hidden rounded-[2rem] bg-sand lg:grid-cols-2">
            <div className="relative aspect-[4/5] lg:aspect-auto">
              <img
                src={coverImage(spotlight.images) ?? ""}
                alt={fullName(spotlight.brand, spotlight.name)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-14 lg:p-16">
              <p className="eyebrow text-champagne">Nuestra recomendación</p>
              <p className="mt-6 eyebrow text-muted">{spotlight.brand}</p>
              <h2 className="mt-2 text-[52px] leading-none text-emerald sm:text-[64px]">{spotlight.name}</h2>
              <p className="mt-2 text-[14px] text-muted">
                {CONCENTRATION_LABEL[spotlight.concentration as Concentration]}
              </p>
              <p className="mt-7 max-w-md text-[16px] leading-relaxed text-ink/80">{spotlight.description}</p>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link href={productHref(spotlight)} className={btn.primary}>
                  Ver el perfume
                </Link>
                {fromPrice(spotlight.variants) !== null && (
                  <span className="tabular font-display text-3xl text-emerald">
                    {formatMoney(fromPrice(spotlight.variants) ?? 0, "PYG")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------ Por que comprar aca */}
      <section className={cn(container, "pt-28")}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-champagne">Comprá con tranquilidad</p>
          <h2 className="mt-3 text-[42px] text-emerald sm:text-[52px]">Por qué elegirnos</h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: IconShield,
              title: "Originales garantizados",
              text: "Trabajamos solo con perfumes originales. Nada de réplicas ni decants.",
            },
            {
              icon: IconSeal,
              title: "Sellados en su caja",
              text: "Cada frasco llega nuevo, sellado de fábrica y en su caja original.",
            },
            {
              icon: IconTruck,
              title: "Entrega en 48 horas",
              text: "En Asunción y Gran Asunción. Al interior, por encomienda a todo el país.",
            },
            {
              icon: IconBank,
              title: "Pago simple",
              text: "Transferencia bancaria sin recargo. Tu pedido sale apenas se acredita.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-stone/70 bg-pearl p-8 transition-shadow hover:shadow-card">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-champagne-2">
                <Icon size={22} />
              </span>
              <h3 className="mt-6 text-[25px] text-emerald">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Como comprar */}
      <section className="mt-28 bg-emerald py-24 text-pearl">
        <div className={container}>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.6fr] lg:items-center">
            <div>
              <p className="eyebrow text-champagne-2">Así de fácil</p>
              <h2 className="mt-4 text-[42px] leading-[1.05] sm:text-[52px]">Tu perfume en casa en tres pasos</h2>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-pearl/60">
                Sin registrarte ni crear una cuenta. Elegís, pagás y te lo llevamos.
              </p>
            </div>
            <ol className="grid gap-5 sm:grid-cols-3">
              {[
                { n: "01", title: "Elegí tu fragancia", text: "Agregá al carrito el perfume y el tamaño que quieras." },
                { n: "02", title: "Pagá por transferencia", text: "Te mostramos los datos de la cuenta al confirmar el pedido." },
                { n: "03", title: "Recibilo en casa", text: "Lo preparamos apenas se acredita y te lo enviamos." },
              ].map((step) => (
                <li key={step.n} className="rounded-3xl border border-pearl/10 bg-emerald-2/70 p-7">
                  <span className="font-display text-5xl italic text-champagne-2">{step.n}</span>
                  <h3 className="mt-5 text-[24px]">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-pearl/60">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Asesoramiento */}
      <section className={cn(container, "pb-24 pt-24")}>
        <div className="flex flex-col items-center justify-between gap-8 rounded-[2rem] border border-champagne/40 bg-champagne-3/30 px-8 py-14 text-center lg:flex-row lg:px-16 lg:text-left">
          <div>
            <h2 className="text-[36px] leading-tight text-emerald sm:text-[44px]">¿No sabés cuál elegir?</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
              Contanos qué perfumes te gustan o para quién es el regalo, y te recomendamos la fragancia
              ideal.
            </p>
          </div>
          {whatsapp ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={cn(btn.primary, "shrink-0")}>
              <IconWhatsapp size={18} /> Pedir recomendación
            </a>
          ) : (
            <Link href="/perfumes" className={cn(btn.primary, "shrink-0")}>
              Explorar el catálogo
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
