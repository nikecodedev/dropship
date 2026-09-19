"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/constants";
import { IconWhatsapp } from "./icons";

// Boton flotante de consulta. Solo aparece si hay un numero cargado, y se
// esconde en el checkout para no tapar el boton de confirmar en el celular.
export default function WhatsappFloat() {
  const pathname = usePathname();
  const link = whatsappLink("Hola, quería hacer una consulta sobre un perfume.");
  if (!link || pathname.startsWith("/checkout")) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald text-champagne-2 shadow-lift transition-transform duration-300 hover:scale-105 hover:bg-emerald-2"
    >
      <IconWhatsapp size={26} />
    </a>
  );
}
