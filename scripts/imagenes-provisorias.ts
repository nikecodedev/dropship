// Genera una imagen provisoria por producto que no tenga foto cargada.
//
// No reemplaza a la foto real: sirve para que el catalogo se vea terminado
// mientras esperamos el material de la clienta. Cuando llegan las fotos
// buenas se cargan desde el panel y estas quedan sin uso.
//
// Uso:  npx tsx scripts/imagenes-provisorias.ts
//       npx tsx scripts/imagenes-provisorias.ts --forzar   (regenera todas)

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const OUT_DIR = join(process.cwd(), "public", "productos");
const forzar = process.argv.includes("--forzar");

type Paleta = { fondo: string; vidrio: string; liquido: string; tapa: string; texto: string };

// La familia olfativa define el color del liquido. Es lo que hace que el
// catalogo se vea variado en vez de repetir el mismo frasco cuatro veces.
const PALETAS: Record<string, Paleta> = {
  fresco: {
    fondo: "#eef2ea",
    vidrio: "#ffffff",
    liquido: "#cfe0b4",
    tapa: "#8a9a6f",
    texto: "#2f3a2a",
  },
  dulce: {
    fondo: "#f6ece2",
    vidrio: "#ffffff",
    liquido: "#e8b878",
    tapa: "#a67c3d",
    texto: "#4a3520",
  },
  floral: {
    fondo: "#f5eaee",
    vidrio: "#ffffff",
    liquido: "#e3b3c2",
    tapa: "#a35d76",
    texto: "#452330",
  },
  oriental: {
    fondo: "#efe9f0",
    vidrio: "#ffffff",
    liquido: "#a98bb8",
    tapa: "#6b4c7a",
    texto: "#33203c",
  },
  amaderado: {
    fondo: "#e8eded",
    vidrio: "#ffffff",
    liquido: "#7ea3a3",
    tapa: "#3f5f5f",
    texto: "#1e3030",
  },
  neutro: {
    fondo: "#f0ece5",
    vidrio: "#ffffff",
    liquido: "#d8cbb4",
    tapa: "#8a7c62",
    texto: "#3a3227",
  },
};

// Asignacion por producto conocido. Lo que no este aca cae en el reparto
// automatico de mas abajo.
const POR_SLUG: Record<string, keyof typeof PALETAS> = {
  "tommy-hilfiger-tommy-girl": "fresco",
  "lattafa-yara": "dulce",
  "lancome-hypnose": "oriental",
  "azzaro-pour-homme": "amaderado",
};

const AUTOMATICAS: (keyof typeof PALETAS)[] = [
  "floral",
  "dulce",
  "amaderado",
  "fresco",
  "oriental",
  "neutro",
];

function elegirPaleta(slug: string, gender: string): Paleta {
  const fija = POR_SLUG[slug];
  if (fija) return PALETAS[fija];
  if (gender === "MASCULINO") return PALETAS.amaderado;

  // Reparto estable: el mismo producto recibe siempre el mismo color.
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) % 100000;
  return PALETAS[AUTOMATICAS[hash % AUTOMATICAS.length]];
}

function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Corta el nombre en dos lineas para que no se desborde del frasco.
function partirNombre(nombre: string, max = 18): string[] {
  if (nombre.length <= max) return [nombre];
  const palabras = nombre.split(" ");
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of palabras) {
    if ((actual + " " + palabra).trim().length > max && actual) {
      lineas.push(actual.trim());
      actual = palabra;
    } else {
      actual = (actual + " " + palabra).trim();
    }
  }
  if (actual) lineas.push(actual);
  if (lineas.length <= 2) return lineas;
  // Nombre largo: cortamos en dos lineas y avisamos con puntos suspensivos,
  // en vez de dejar la segunda linea terminando en una preposicion suelta.
  return [lineas[0], lineas[1].replace(/\s+(de|con|y|del|la|el)$/i, "") + "..."];
}

function svg(opts: {
  brand: string;
  name: string;
  size: string;
  paleta: Paleta;
}) {
  const { brand, name, size, paleta } = opts;
  const lineas = partirNombre(name);

  // El texto va debajo del frasco, no encima: sobre el liquido oscuro no se
  // leeria en las paletas amaderada y oriental.
  const nombreTop = lineas.length > 1 ? 682 : 700;
  const marcaY = nombreTop - 34;
  const tamanoY = nombreTop + lineas.length * 34 + 4;

  const nombreSvg = lineas
    .map(
      (linea, i) =>
        `<text x="300" y="${nombreTop + i * 34}" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="${paleta.texto}">${escapar(linea)}</text>`,
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800" role="img" aria-label="${escapar(brand + " " + name)}">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${paleta.fondo}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="liquido" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${paleta.liquido}"/>
      <stop offset="100%" stop-color="${paleta.tapa}"/>
    </linearGradient>
    <linearGradient id="brillo" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="600" height="800" fill="url(#fondo)"/>

  <ellipse cx="300" cy="612" rx="132" ry="16" fill="${paleta.texto}" opacity="0.10"/>

  <!-- tapa -->
  <rect x="264" y="128" width="72" height="60" rx="8" fill="${paleta.tapa}"/>
  <rect x="264" y="128" width="24" height="60" rx="8" fill="#ffffff" opacity="0.18"/>

  <!-- cuello -->
  <rect x="282" y="186" width="36" height="34" fill="${paleta.tapa}" opacity="0.55"/>

  <!-- cuerpo del frasco -->
  <rect x="196" y="218" width="208" height="386" rx="26" fill="${paleta.vidrio}"/>
  <rect x="196" y="218" width="208" height="386" rx="26" fill="none" stroke="${paleta.tapa}" stroke-opacity="0.35" stroke-width="2"/>

  <!-- liquido -->
  <path d="M 208 330 L 392 330 L 392 578 A 14 14 0 0 1 378 592 L 222 592 A 14 14 0 0 1 208 578 Z" fill="url(#liquido)" opacity="0.9"/>
  <rect x="208" y="326" width="184" height="10" rx="5" fill="${paleta.liquido}" opacity="0.6"/>

  <!-- brillo del vidrio -->
  <rect x="212" y="236" width="60" height="350" rx="20" fill="url(#brillo)"/>

  <text x="300" y="${marcaY}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" letter-spacing="5" fill="${paleta.texto}" opacity="0.65">${escapar(brand.toUpperCase())}</text>
  ${nombreSvg}
  <text x="300" y="${tamanoY}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" letter-spacing="2" fill="${paleta.texto}" opacity="0.6">${escapar(size)}</text>

  <text x="300" y="786" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" letter-spacing="3" fill="${paleta.texto}" opacity="0.35">IMAGEN PROVISORIA</text>
</svg>
`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const productos = await db.product.findMany({
    include: { variants: { orderBy: { sizeMl: "asc" } } },
    orderBy: { brand: "asc" },
  });

  let generadas = 0;
  let salteadas = 0;

  for (const producto of productos) {
    const yaTiene = producto.images !== "[]" && producto.images.trim() !== "";
    if (yaTiene && !forzar) {
      salteadas += 1;
      continue;
    }

    const tamanos = producto.variants
      .map((v) => (v.sizeMl ? v.sizeMl + " ml" : v.label))
      .filter(Boolean);
    const size = tamanos.length ? tamanos.join(" · ") : "";

    const contenido = svg({
      brand: producto.brand,
      name: producto.name,
      size,
      paleta: elegirPaleta(producto.slug, producto.gender),
    });

    const archivo = producto.slug + ".svg";
    writeFileSync(join(OUT_DIR, archivo), contenido, "utf8");

    await db.product.update({
      where: { id: producto.id },
      data: { images: JSON.stringify(["/productos/" + archivo]) },
    });

    console.log("  generada  /productos/" + archivo);
    generadas += 1;
  }

  console.log("");
  console.log(generadas + " imagenes generadas, " + salteadas + " productos ya tenian foto.");
  if (salteadas > 0) {
    console.log("Para regenerar todas: npx tsx scripts/imagenes-provisorias.ts --forzar");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
