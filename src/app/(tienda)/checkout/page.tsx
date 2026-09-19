import Link from "next/link";
import CheckoutForm from "./checkout-form";
import { IconChevronRight } from "@/components/icons";
import { getLocalZones } from "@/lib/shipping";
import { methodsForChannel } from "@/lib/payments";
import { CHANNEL } from "@/lib/constants";
import { cn, container } from "@/lib/ui";

export const metadata = { title: "Finalizar compra" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const zones = await getLocalZones();

  return (
    <div className="bg-sand/40">
      <div className={cn(container, "pb-8 pt-10")}>
        <nav className="flex items-center gap-1.5 text-[12px] text-muted" aria-label="Pasos">
          <Link href="/carrito" className="hover:text-emerald">
            Carrito
          </Link>
          <IconChevronRight size={13} />
          <span className="text-ink">Datos y pago</span>
          <IconChevronRight size={13} />
          <span>Confirmación</span>
        </nav>
        <h1 className="mt-4 text-[44px] text-emerald sm:text-[54px]">Finalizar compra</h1>
      </div>
      <div className={cn(container, "pb-20")}>
        <CheckoutForm
          zones={zones.map((z) => ({
            id: z.id,
            name: z.name,
            coverage: z.coverage,
            priceMinor: z.priceMinor,
            etaText: z.etaText,
          }))}
          localMethods={methodsForChannel(CHANNEL.LOCAL)}
          intlMethods={methodsForChannel(CHANNEL.DROPSHIP)}
        />
      </div>
    </div>
  );
}
