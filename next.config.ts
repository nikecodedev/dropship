import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imagenes de catalogo servidas desde /public/productos por defecto.
    // Al integrar el proveedor de dropshipping se agrega su dominio aca.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
