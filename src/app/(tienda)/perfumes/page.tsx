import type { Metadata } from "next";
import CatalogView, { type CatalogParams } from "@/components/catalog-view";
import { CHANNEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogParams>;
}): Promise<Metadata> {
  const { gender } = await searchParams;
  if (gender === "FEMENINO") return { title: "Perfumes de mujer" };
  if (gender === "MASCULINO") return { title: "Perfumes de hombre" };
  return { title: "Perfumes" };
}

export default async function PerfumesPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const params = await searchParams;
  return (
    <CatalogView
      channel={CHANNEL.LOCAL}
      basePath="/perfumes"
      eyebrow="Perfumes"
      title="Todos los perfumes"
      intro="Fragancias francesas, árabes y de la línea Cuba, todas originales y selladas en su caja. Stock propio en Asunción, con entrega en 24 a 48 horas."
      params={params}
    />
  );
}
