import Link from "next/link";
import { logout } from "./actions";
import { isAuthenticated } from "@/lib/auth";

export const metadata = { title: "Administracion" };
export const dynamic = "force-dynamic";

// El layout solo decide si muestra la navegacion. Quien protege el contenido
// es cada pagina con requireAdminPage(), porque Next ejecuta la pagina aunque
// el layout no la incluya en la salida.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();
  if (!authed) return <>{children}</>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <nav className="flex flex-wrap gap-6 text-sm">
          <Link href="/admin" className="hover:text-gold">
            Resumen
          </Link>
          <Link href="/admin/productos" className="hover:text-gold">
            Productos
          </Link>
          <Link href="/admin/pedidos" className="hover:text-gold">
            Pedidos
          </Link>
          <Link href="/admin/envios" className="hover:text-gold">
            Zonas de envio
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-xs text-ink-soft hover:text-gold">
            Salir
          </button>
        </form>
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
