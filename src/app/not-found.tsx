import Link from "next/link";
import { Logo } from "@/components/logo";
import { btn } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-emerald px-6 text-center text-pearl">
      <Link href="/" aria-label="Volver al inicio">
        <Logo light />
      </Link>
      <p className="mt-16 font-display text-[120px] italic leading-none text-champagne-2/80">404</p>
      <h1 className="mt-4 text-[40px]">Esta página no existe</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-pearl/60">
        Puede que el perfume ya no esté disponible o que el enlace tenga un error.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/perfumes" className={btn.gold}>
          Ver perfumes
        </Link>
        <Link href="/" className={btn.ghostLight}>
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
