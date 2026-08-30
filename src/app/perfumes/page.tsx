import CatalogView from "@/components/catalog-view";
import { CHANNEL } from "@/lib/constants";

export const metadata = { title: "Perfumeria" };

export default async function PerfumesPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; gender?: string; q?: string }>;
}) {
  const params = await searchParams;
  return (
    <CatalogView
      channel={CHANNEL.LOCAL}
      basePath="/perfumes"
      title="Perfumeria"
      intro="Fragancias con stock propio en Paraguay. Entrega en Asuncion y Gran Asuncion en 24 a 48 horas, al interior por encomienda. Precios en guaranies."
      searchParams={params}
    />
  );
}
