import CatalogView from "@/components/catalog-view";
import { CHANNEL } from "@/lib/constants";

export const metadata = { title: "Catalogo internacional" };

export default async function InternacionalPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; gender?: string; q?: string }>;
}) {
  const params = await searchParams;
  return (
    <CatalogView
      channel={CHANNEL.DROPSHIP}
      basePath="/internacional"
      title="Catalogo internacional"
      intro="Productos despachados directamente por el proveedor en el exterior. El plazo de entrega es de 15 a 30 dias y esta indicado en cada ficha. Se compran por separado de la perfumeria local."
      searchParams={params}
    />
  );
}
