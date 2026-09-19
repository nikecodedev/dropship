import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { SITE } from "@/lib/constants";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE.name + " · Perfumes originales en Paraguay",
    template: "%s · " + SITE.name,
  },
  description:
    "Perfumes importados 100% originales y sellados en caja. Givenchy, Armani, Dolce & Gabbana, Lancôme, Azzaro, Lattafa y más, con entrega en Asunción y todo Paraguay.",
};

export const viewport: Viewport = {
  themeColor: "#0f2e28",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PY" className={cormorant.variable + " " + jost.variable}>
      <body className="min-h-screen">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
