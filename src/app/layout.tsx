import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: SITE.name + " | " + SITE.tagline,
    template: "%s | " + SITE.name,
  },
  description:
    "Perfumeria importada con entrega en Paraguay y catalogo internacional con envio desde el proveedor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PY">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
