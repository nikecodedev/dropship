import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Carga inicial.
//
// Los cuatro perfumes son los que paso la clienta. Los PRECIOS SON DE EJEMPLO:
// hay que reemplazarlos por la lista real antes de salir a produccion.
// El campo "condition" tambien queda pendiente de confirmar: la lista original
// traia "Especificar si esta lleno o el % restante" sin completar, asi que no
// sabemos todavia si son frascos sellados o abiertos.

// priceMinor: guaranies enteros en el catalogo local, centavos de dolar en el internacional.
type SeedVariant = { sizeMl: number; priceMinor: number; stock: number };
type SeedProduct = {
  slug: string;
  brand: string;
  name: string;
  description: string;
  concentration: string;
  gender: string;
  condition: string;
  featured?: boolean;
  variants: SeedVariant[];
};

const perfumes: SeedProduct[] = [
  {
    slug: "tommy-hilfiger-tommy-girl",
    brand: "Tommy Hilfiger",
    name: "Tommy Girl",
    description:
      "Un floral fresco y citrico, clasico de los noventa. Ligero, facil de usar de dia y muy reconocible.",
    concentration: "EDT",
    gender: "FEMENINO",
    condition: "NUEVO_SELLADO",
    featured: true,
    variants: [{ sizeMl: 100, priceMinor: 320000, stock: 3 }],
  },
  {
    slug: "lattafa-yara",
    brand: "Lattafa",
    name: "Yara",
    description:
      "Dulce, cremoso y con mucha proyeccion. Uno de los arabes mas pedidos, con notas de orquidea, heliotropo y vainilla.",
    concentration: "EDP",
    gender: "FEMENINO",
    condition: "NUEVO_SELLADO",
    featured: true,
    variants: [{ sizeMl: 100, priceMinor: 250000, stock: 5 }],
  },
  {
    slug: "lancome-hypnose",
    brand: "Lancome",
    name: "Hypnose",
    description:
      "Oriental vainillado con flor de la pasion y jazmin. Elegante, de noche, con buena duracion en piel.",
    concentration: "EDP",
    gender: "FEMENINO",
    condition: "NUEVO_SELLADO",
    featured: true,
    variants: [{ sizeMl: 75, priceMinor: 590000, stock: 2 }],
  },
  {
    slug: "azzaro-pour-homme",
    brand: "Azzaro",
    name: "Azzaro Pour Homme",
    description:
      "Fougere aromatico clasico. Anis, lavanda y madera. Un masculino de referencia desde 1978.",
    concentration: "EDT",
    gender: "MASCULINO",
    condition: "NUEVO_SELLADO",
    // Tamano a confirmar con la clienta: la lista decia "confirmar tamano en frasco".
    variants: [{ sizeMl: 100, priceMinor: 420000, stock: 2 }],
  },
];

// Ejemplo del catalogo internacional. Se reemplaza por la sincronizacion real
// cuando se defina el proveedor de dropshipping.
const internacionales: SeedProduct[] = [
  {
    slug: "difusor-aromatico-bambu",
    brand: "Casa Aroma",
    name: "Difusor aromatico con varillas de bambu",
    description:
      "Producto del catalogo internacional. Despachado por el proveedor, entrega estimada de 15 a 30 dias.",
    concentration: "NA",
    gender: "NA",
    condition: "NUEVO_SELLADO",
    variants: [{ sizeMl: 100, priceMinor: 1890, stock: 0 }],
  },
];

const zonas = [
  {
    name: "Asuncion",
    coverage: "Microcentro, Villa Morra, Carmelitas, Recoleta",
    priceMinor: 25000,
    etaText: "24 a 48 horas",
    sortOrder: 0,
  },
  {
    name: "Gran Asuncion",
    coverage: "Lambare, Fernando de la Mora, San Lorenzo, Luque, Capiata",
    priceMinor: 35000,
    etaText: "24 a 48 horas",
    sortOrder: 1,
  },
  {
    name: "Interior del pais",
    coverage: "Por encomienda a todo el pais",
    priceMinor: 45000,
    etaText: "2 a 4 dias habiles",
    sortOrder: 2,
  },
];

async function upsertProduct(product: SeedProduct, channel: "LOCAL" | "DROPSHIP") {
  const currency = channel === "DROPSHIP" ? "USD" : "PYG";

  const created = await db.product.upsert({
    where: { slug: product.slug },
    update: {},
    create: {
      slug: product.slug,
      brand: product.brand,
      name: product.name,
      description: product.description,
      channel,
      concentration: product.concentration,
      gender: product.gender,
      condition: product.condition,
      currency,
      featured: product.featured ?? false,
      images: "[]",
    },
  });

  for (const variant of product.variants) {
    const sku = product.slug.toUpperCase().slice(0, 12) + "-" + variant.sizeMl;
    await db.variant.upsert({
      where: { sku },
      update: {},
      create: {
        productId: created.id,
        sizeMl: variant.sizeMl,
        label: variant.sizeMl + " ml",
        sku,
        priceMinor: variant.priceMinor,
        stock: variant.stock,
      },
    });
  }
}

async function main() {
  for (const product of perfumes) await upsertProduct(product, "LOCAL");
  for (const product of internacionales) await upsertProduct(product, "DROPSHIP");

  for (const zona of zonas) {
    const existing = await db.shippingZone.findFirst({ where: { name: zona.name } });
    if (!existing) await db.shippingZone.create({ data: zona });
  }

  console.log("Carga inicial lista.");
  console.log("Recorda reemplazar los precios de ejemplo por la lista real.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
