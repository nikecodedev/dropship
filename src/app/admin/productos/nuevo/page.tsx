import ProductForm from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/auth";

export default async function NuevoProductoPage() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="text-2xl mb-8">Nuevo producto</h1>
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
      <p className="mt-6 text-xs text-ink-soft max-w-2xl">
        Despues de guardar vas a poder cargar los tamanos, precios y stock de cada presentacion.
      </p>
    </div>
  );
}
