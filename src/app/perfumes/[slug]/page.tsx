import ProductView from "@/components/product-view";
import { getProductBySlug } from "@/lib/catalog";
import { CHANNEL } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto" };
  return { title: product.brand + " " + product.name };
}

export default async function PerfumePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductView slug={slug} channel={CHANNEL.LOCAL} />;
}
