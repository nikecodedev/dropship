import CheckoutForm from "./checkout-form";
import { getLocalZones } from "@/lib/shipping";
import { methodsForChannel } from "@/lib/payments";
import { CHANNEL } from "@/lib/constants";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const zones = await getLocalZones();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl mb-10">Finalizar compra</h1>
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
  );
}
