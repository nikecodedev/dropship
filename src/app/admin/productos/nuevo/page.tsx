import Link from "next/link";
import ProductForm from "@/components/admin/product-form";
import { IconChevronRight } from "@/components/icons";
import { requireAdminPage } from "@/lib/auth";

export default async function NuevoProductoPage() {
  await requireAdminPage();

  return (
    <div className="max-w-4xl">
      <nav className="flex items-center gap-1.5 text-[12px] text-muted">
        <Link href="/admin/productos" className="hover:text-emerald">
          Productos
        </Link>
        <IconChevronRight size={13} />
        <span className="text-ink">Nuevo</span>
      </nav>
      <h1 className="mt-4 text-[42px] text-emerald">Nuevo producto</h1>
      <p className="mb-8 mt-1 text-[14px] text-muted">
        Primero cargá la ficha. Después de guardarla vas a poder sumar los tamaños, el precio y el stock.
      </p>
      <ProductForm
        values={{
          name: "",
          brand: "",
          description: "",
          channel: "LOCAL",
          concentration: "EDP",
          gender: "FEMENINO",
          condition: "NUEVO_SELLADO",
          images: [],
          active: true,
          featured: false,
          supplierRef: "",
        }}
      />
    </div>
  );
}
