import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Catalogo real de la tienda, con los datos que confirmo la duena del negocio:
// precios en guaranies, tamanos y stock por unidad. Todos los frascos son
// originales, nuevos y sellados en su caja.
//
// Lo que sigue pendiente esta marcado producto por producto:
//   - Tommy Girl no tiene precio confirmado, asi que se carga desactivado.
//   - Donde no sabemos con certeza la concentracion o el genero va "NA" en
//     vez de un valor inventado. Se completa cuando ella lo confirme.

// priceMinor: guaranies enteros en el catalogo local, centavos de dolar en el
// internacional. sizeMl en null para productos que no se miden en ml, como
// los estuches.
type SeedVariant = {
  sizeMl: number | null;
  label?: string;
  priceMinor: number;
  stock: number;
};

type SeedProduct = {
  slug: string;
  brand: string;
  name: string;
  description: string;
  concentration: string;
  gender: string;
  featured?: boolean;
  variants: SeedVariant[];
};

const perfumes: SeedProduct[] = [
  {
    slug: "azzaro-pour-homme",
    brand: "Azzaro",
    name: "Azzaro Pour Homme",
    description:
      "Fougere aromatico clasico, en el mercado desde 1978. Anis, lavanda y madera de cedro. Un masculino de referencia, elegante y facil de llevar todo el ano.",
    concentration: "EDT",
    gender: "MASCULINO",
    featured: true,
    variants: [
      { sizeMl: 100, priceMinor: 200000, stock: 2 },
      { sizeMl: 200, priceMinor: 250000, stock: 2 },
    ],
  },
  {
    slug: "dolce-gabbana-the-one-estuche",
    brand: "Dolce & Gabbana",
    name: "The One",
    description:
      "Estuche completo con perfume de 100 ml, miniatura de 10 ml, crema corporal de 50 ml y gel de ducha de 50 ml. Oriental floral, con vainilla y ambar. Ideal para regalo.",
    concentration: "EDP",
    gender: "FEMENINO",
    featured: true,
    variants: [{ sizeMl: null, label: "Estuche completo", priceMinor: 750000, stock: 2 }],
  },
  {
    slug: "cuba-prestige",
    brand: "Cuba",
    name: "Prestige",
    description:
      "Fragancia de la linea Cuba, muy buscada por su relacion entre precio y duracion. Frasco de 100 ml, original y sellado.",
    // Concentracion a confirmar con la duena del negocio.
    concentration: "NA",
    gender: "MASCULINO",
    variants: [{ sizeMl: 100, priceMinor: 70000, stock: 2 }],
  },
  {
    slug: "cuba-royal",
    brand: "Cuba",
    name: "Royal",
    description:
      "Uno de los mas vendidos de la linea Cuba. Frasco de 100 ml, original y sellado.",
    concentration: "NA",
    gender: "MASCULINO",
    variants: [{ sizeMl: 100, priceMinor: 65000, stock: 2 }],
  },
  {
    slug: "cuba-copacabana",
    brand: "Cuba",
    name: "Copacabana",
    description: "Fragancia de la linea Cuba. Frasco de 100 ml, original y sellado.",
    concentration: "NA",
    // Genero a confirmar.
    gender: "NA",
    variants: [{ sizeMl: 100, priceMinor: 70000, stock: 2 }],
  },
  {
    slug: "nasma-sultan",
    brand: "Nasma",
    name: "Sultan",
    description:
      "Eau de Parfum arabe de Dubai. Frasco de 100 ml, original y sellado en su caja.",
    concentration: "EDP",
    gender: "NA",
    variants: [{ sizeMl: 100, priceMinor: 250000, stock: 2 }],
  },
  {
    slug: "nasma-bellissima",
    brand: "Nasma",
    name: "Bellissima",
    description: "Eau de Parfum de 100 ml, original y sellado en su caja.",
    concentration: "EDP",
    gender: "FEMENINO",
    variants: [{ sizeMl: 100, priceMinor: 150000, stock: 2 }],
  },
  {
    slug: "aqua-dubai-parfum",
    brand: "Aqua Dubai",
    name: "Parfum",
    description: "Parfum arabe de 100 ml, original y sellado en su caja.",
    concentration: "PARFUM",
    gender: "NA",
    variants: [{ sizeMl: 100, priceMinor: 380000, stock: 2 }],
  },
  {
    slug: "lattafa-yara",
    brand: "Lattafa",
    name: "Yara",
    description:
      "Dulce, cremoso y con mucha proyeccion. Uno de los arabes mas pedidos, con notas de orquidea, heliotropo y vainilla.",
    concentration: "EDP",
    gender: "FEMENINO",
    featured: true,
    variants: [{ sizeMl: 100, priceMinor: 150000, stock: 2 }],
  },
  {
    slug: "azzaro-chrome",
    brand: "Azzaro",
    name: "Chrome",
    description:
      "Fresco y limpio, con citricos y notas acuaticas sobre un fondo amaderado. Muy usado de dia y para oficina.",
    concentration: "EDT",
    gender: "MASCULINO",
    variants: [{ sizeMl: 200, priceMinor: 380000, stock: 2 }],
  },
  {
    slug: "montblanc-legend-spirit",
    brand: "Montblanc",
    name: "Legend Spirit",
    description:
      "Version fresca del Legend clasico. Pomelo rosa, bergamota y notas acuaticas sobre madera blanca.",
    concentration: "EDT",
    gender: "MASCULINO",
    variants: [{ sizeMl: 100, priceMinor: 300000, stock: 2 }],
  },
  {
    slug: "givenchy-ange-ou-demon",
    brand: "Givenchy",
    name: "Ange ou Demon",
    description:
      "Floral amaderado intenso, con azafran, lirio y vainilla. Elegante, de noche, con muy buena duracion en piel.",
    concentration: "EDP",
    gender: "FEMENINO",
    featured: true,
    variants: [{ sizeMl: 100, priceMinor: 700000, stock: 7 }],
  },
  {
    slug: "armani-acqua-di-gio",
    brand: "Giorgio Armani",
    name: "Acqua di Gio",
    description:
      "El acuatico mas conocido del mercado. Citricos, romero y notas marinas. Fresco, versatil y siempre vigente.",
    concentration: "EDT",
    gender: "MASCULINO",
    featured: true,
    variants: [{ sizeMl: 100, priceMinor: 500000, stock: 2 }],
  },
  {
    slug: "dolce-gabbana-light-blue",
    brand: "Dolce & Gabbana",
    name: "Light Blue",
    description:
      "Citrico mediterraneo con manzana verde, cedro y almizcle. Fresco y liviano, muy pedido para el verano.",
    concentration: "EDT",
    gender: "FEMENINO",
    variants: [{ sizeMl: 100, priceMinor: 650000, stock: 2 }],
  },
  {
    slug: "lancome-hypnose",
    brand: "Lancome",
    name: "Hypnose",
    description:
      "Oriental vainillado con flor de la pasion y jazmin. Elegante, de noche, con buena duracion en piel.",
    concentration: "EDP",
    gender: "FEMENINO",
    variants: [{ sizeMl: 75, priceMinor: 700000, stock: 2 }],
  },

  // Sets de miniaturas. Los precios y los tamanos estan confirmados, pero
  // falta el stock de cada uno, asi que se cargan desactivados mas abajo.
  // Falta tambien saber que fragancias trae cada set: es el dato que decide
  // la compra, asi que las descripciones quedan a medias hasta tenerlo.
  {
    slug: "lattafa-yara-set-miniaturas",
    brand: "Lattafa",
    name: "Yara Collection, set de miniaturas",
    description:
      "Set de 4 fragancias de la linea Yara en formato de 5 ml. Practico para probar la linea completa o para regalar.",
    concentration: "EDP",
    gender: "FEMENINO",
    variants: [{ sizeMl: null, label: "Set de 4 x 5 ml", priceMinor: 150000, stock: 0 }],
  },
  {
    slug: "versace-set-miniaturas",
    brand: "Versace",
    name: "Set de miniaturas",
    description: "Set con 2 miniaturas de 10 ml, original y sellado en su caja.",
    concentration: "NA",
    gender: "NA",
    variants: [{ sizeMl: null, label: "Set de 2 x 10 ml", priceMinor: 400000, stock: 0 }],
  },
  {
    slug: "dolce-gabbana-set-miniaturas",
    brand: "Dolce & Gabbana",
    name: "Set de miniaturas",
    description: "Set con 5 miniaturas, original y sellado en su caja.",
    concentration: "NA",
    gender: "NA",
    variants: [{ sizeMl: null, label: "Set de 5 miniaturas", priceMinor: 530000, stock: 0 }],
  },
  {
    slug: "bvlgari-omnia-crystalline",
    brand: "Bvlgari",
    name: "Omnia Crystalline",
    description:
      "Floral fresco y transparente, con pera nashi, bambu y loto. Suave y facil de usar de dia. Miniatura de 15 ml.",
    concentration: "EDT",
    gender: "FEMENINO",
    variants: [{ sizeMl: 15, priceMinor: 260000, stock: 0 }],
  },
];

// Productos que existen en stock pero todavia no tienen precio confirmado.
// Se dejan desactivados: es preferible que no se vean a que se vendan a un
// precio que la duena del negocio nunca fijo.
const sinPrecioConfirmado = ["tommy-hilfiger-tommy-girl"];

// Sets con precio confirmado pero sin stock. Se dejan ocultos: mostrarlos
// agotados desde el dia uno no vende nada y ensucia el catalogo. Cuando
// llegue la cantidad, se pone el stock arriba y se saca el slug de esta
// lista.
const sinStockConfirmado = [
  "lattafa-yara-set-miniaturas",
  "versace-set-miniaturas",
  "dolce-gabbana-set-miniaturas",
  "bvlgari-omnia-crystalline",
];

// El catalogo internacional queda vacio hasta que se defina el proveedor de
// dropshipping. El producto de ejemplo que se uso para las pruebas se
// desactiva, para que nadie pueda comprar algo que no existe.
const demoDesactivar = ["difusor-aromatico-bambu"];

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

function variantLabel(variant: SeedVariant) {
  if (variant.label) return variant.label;
  return variant.sizeMl ? variant.sizeMl + " ml" : "Unico";
}

function variantSku(slug: string, variant: SeedVariant) {
  const suffix = variant.sizeMl ? String(variant.sizeMl) : "UNICO";
  return slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 14) + "-" + suffix;
}

async function upsertProduct(product: SeedProduct, channel: "LOCAL" | "DROPSHIP") {
  const currency = channel === "DROPSHIP" ? "USD" : "PYG";

  // A diferencia de la carga inicial, aca si actualizamos: la lista de precios
  // y el stock cambian, y volver a correr el seed tiene que dejarlos al dia.
  const data = {
    brand: product.brand,
    name: product.name,
    description: product.description,
    channel,
    concentration: product.concentration,
    gender: product.gender,
    condition: "NUEVO_SELLADO",
    currency,
    featured: product.featured ?? false,
    active: true,
  };

  const created = await db.product.upsert({
    where: { slug: product.slug },
    update: data,
    create: { ...data, slug: product.slug, images: "[]" },
  });

  for (const variant of product.variants) {
    const sku = variantSku(product.slug, variant);
    const variantData = {
      sizeMl: variant.sizeMl,
      label: variantLabel(variant),
      priceMinor: variant.priceMinor,
      stock: variant.stock,
      active: true,
    };
    await db.variant.upsert({
      where: { sku },
      update: variantData,
      create: { ...variantData, sku, productId: created.id },
    });
  }
}

async function main() {
  for (const product of perfumes) await upsertProduct(product, "LOCAL");

  for (const slug of [...sinPrecioConfirmado, ...sinStockConfirmado, ...demoDesactivar]) {
    const existe = await db.product.findUnique({ where: { slug } });
    if (existe) {
      await db.product.update({ where: { slug }, data: { active: false } });
      console.log("  desactivado  " + slug);
    }
  }

  for (const zona of zonas) {
    const existing = await db.shippingZone.findFirst({ where: { name: zona.name } });
    if (existing) {
      await db.shippingZone.update({ where: { id: existing.id }, data: zona });
    } else {
      await db.shippingZone.create({ data: zona });
    }
  }

  const activos = await db.product.count({ where: { active: true } });
  const variantes = await db.variant.count();
  console.log("");
  console.log(activos + " productos activos, " + variantes + " presentaciones.");
  console.log("Pendientes: precio de Tommy Girl y stock de los cuatro sets.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
