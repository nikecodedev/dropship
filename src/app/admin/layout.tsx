import Link from "next/link";
import { logout } from "./actions";
import AdminNav from "@/components/admin/admin-nav";
import { IconExternal, IconLogout } from "@/components/icons";
import { Logo } from "@/components/logo";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Panel", robots: { index: false } };
export const dynamic = "force-dynamic";

// El layout solo arma el marco del panel. Quien protege el contenido es cada
// pagina con requireAdminPage(), porque Next ejecuta la pagina aunque el
// layout no la incluya en la salida.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();
  if (!authed) return <>{children}</>;

  const pending = await db.order.count({ where: { status: "PENDIENTE" } });

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[260px_1fr]">
      {/* Barra lateral */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-emerald px-4 py-7 lg:flex">
        <Link href="/admin" className="px-4">
          <Logo light className="items-start" />
          <span className="mt-3 block text-[11px] tracking-[0.2em] uppercase text-pearl/40">Panel de gestión</span>
        </Link>
        <div className="mt-10">
          <AdminNav pending={pending} />
        </div>
        <div className="mt-auto space-y-1 border-t border-pearl/10 pt-5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-pearl/60 hover:bg-pearl/5 hover:text-pearl"
          >
            <IconExternal size={18} /> Ver la tienda
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-pearl/60 hover:bg-pearl/5 hover:text-pearl"
            >
              <IconLogout size={18} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Barra superior en celular */}
      <div className="sticky top-0 z-30 bg-emerald px-4 pb-3 pt-4 lg:hidden">
        <div className="flex items-center justify-between px-2">
          <Logo light className="scale-90 items-start" />
          <form action={logout}>
            <button type="submit" className="rounded-full p-2 text-pearl/70" aria-label="Cerrar sesión">
              <IconLogout size={20} />
            </button>
          </form>
        </div>
        <div className="mt-3">
          <AdminNav pending={pending} horizontal />
        </div>
      </div>

      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
