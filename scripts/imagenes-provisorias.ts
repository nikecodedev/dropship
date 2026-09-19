// Genera una imagen ilustrativa por producto que no tenga foto cargada.
//
// No reemplaza a la foto real: sirve para que el catalogo se vea terminado
// mientras llegan las fotos de la duena del negocio. Cada imagen lleva la
// leyenda "imagen ilustrativa" para que nadie la confunda con el producto.
//
// Cada producto tiene su forma de frasco, su color de liquido y su tapa, asi
// el catalogo no repite el mismo dibujo quince veces.
//
// Uso:  npx tsx scripts/imagenes-provisorias.ts            (solo sin foto)
//       npx tsx scripts/imagenes-provisorias.ts --forzar   (regenera todas)

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const OUT_DIR = join(process.cwd(), "public", "productos");
const forzar = process.argv.includes("--forzar");

const W = 800;
const H = 1000;
const CX = W / 2;
const FLOOR = 792;

type Shape = "clasico" | "alto" | "cuadrado" | "redondo" | "facetado" | "set" | "estuche";
type Cap = "gold" | "silver" | "black" | "white" | "blue";

type Look = {
  shape: Shape;
  liquid: string;
  cap: Cap;
  // Colores de las miniaturas en los sets.
  minis?: string[];
};

// Cada perfume con una forma y un color que recuerdan al original, sin copiar
// logos ni el diseno exacto del frasco.
const LOOKS: Record<string, Look> = {
  "azzaro-pour-homme": { shape: "cuadrado", liquid: "#7a4a22", cap: "black" },
  "azzaro-chrome": { shape: "clasico", liquid: "#b9c8d3", cap: "silver" },
  "armani-acqua-di-gio": { shape: "clasico", liquid: "#dfe8ea", cap: "silver" },
  "dolce-gabbana-light-blue": { shape: "alto", liquid: "#c6ddec", cap: "blue" },
  "dolce-gabbana-the-one-estuche": { shape: "estuche", liquid: "#d6a153", cap: "gold" },
  "givenchy-ange-ou-demon": { shape: "facetado", liquid: "#c79bc2", cap: "silver" },
  "lancome-hypnose": { shape: "redondo", liquid: "#6d4a80", cap: "silver" },
  "lattafa-yara": { shape: "redondo", liquid: "#f0b3c3", cap: "gold" },
  "nasma-bellissima": { shape: "facetado", liquid: "#e7a4b2", cap: "gold" },
  "nasma-sultan": { shape: "cuadrado", liquid: "#c48f3b", cap: "gold" },
  "aqua-dubai-parfum": { shape: "alto", liquid: "#7cc0bd", cap: "gold" },
  "montblanc-legend-spirit": { shape: "clasico", liquid: "#d6e6f1", cap: "white" },
  "cuba-prestige": { shape: "clasico", liquid: "#c6964a", cap: "black" },
  "cuba-royal": { shape: "clasico", liquid: "#3d5d99", cap: "silver" },
  "cuba-copacabana": { shape: "redondo", liquid: "#f09c78", cap: "gold" },
  "bvlgari-omnia-crystalline": { shape: "redondo", liquid: "#e9efec", cap: "silver" },
  "lattafa-yara-set-miniaturas": {
    shape: "set",
    liquid: "#f0b3c3",
    cap: "gold",
    minis: ["#f0b3c3", "#9c7ab8", "#f4efe6", "#e0a860"],
  },
  "versace-set-miniaturas": {
    shape: "set",
    liquid: "#e3bd62",
    cap: "gold",
    minis: ["#e3bd62", "#28466e"],
  },
  "dolce-gabbana-set-miniaturas": {
    shape: "set",
    liquid: "#c6ddec",
    cap: "gold",
    minis: ["#c6ddec", "#d6a153", "#f0b3c3", "#2b2b2b", "#e9d8b0"],
  },
};

function defaultLook(gender: string): Look {
  if (gender === "MASCULINO") return { shape: "clasico", liquid: "#a8773f", cap: "black" };
  if (gender === "FEMENINO") return { shape: "redondo", liquid: "#eab0bd", cap: "gold" };
  return { shape: "clasico", liquid: "#d9c29a", cap: "gold" };
}

const CONCENTRATION: Record<string, string> = {
  EDT: "Eau de Toilette",
  EDP: "Eau de Parfum",
  PARFUM: "Parfum",
  EDC: "Eau de Cologne",
};

// ---------------------------------------------------------------- colores

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hex: string, target: string, amount: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

const lighten = (hex: string, amount: number) => mix(hex, "#ffffff", amount);
const darken = (hex: string, amount: number) => mix(hex, "#000000", amount);

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const CAPS: Record<Cap, string[]> = {
  gold: ["#7d5f27", "#e9d08f", "#b48c46", "#6a5021"],
  silver: ["#767d82", "#f2f4f5", "#b3babe", "#646b70"],
  black: ["#050505", "#3b3b3b", "#141414", "#000000"],
  white: ["#cfcfcf", "#ffffff", "#e6e6e6", "#bdbdbd"],
  blue: ["#1c3a66", "#5c8bc6", "#2c5590", "#17305a"],
};

function esc(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Parte un texto en hasta dos lineas que entren en `max` caracteres.
function wrap(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = (current + " " + word).trim();
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 2) return lines;
  return [lines[0], lines.slice(1).join(" ").slice(0, max - 1).trimEnd() + "…"];
}

// ---------------------------------------------------------------- piezas

type Box = { x: number; y: number; w: number; h: number };

function defs(look: Look) {
  const liquid = look.liquid;
  const cap = CAPS[look.cap];
  const tint = lighten(liquid, 0.55);
  return `
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6f0e6"/>
      <stop offset="1" stop-color="#ece2d3"/>
    </linearGradient>
    <linearGradient id="arco" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lighten(tint, 0.35)}"/>
      <stop offset="1" stop-color="${mix(tint, "#e9dfcf", 0.45)}"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${lighten(liquid, 0.2)}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${lighten(liquid, 0.2)}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="podioCuerpo" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#cdbfa8"/>
      <stop offset="0.45" stop-color="#e6dccb"/>
      <stop offset="1" stop-color="#c7b8a0"/>
    </linearGradient>
    <linearGradient id="podioTapa" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f1e9dc"/>
      <stop offset="1" stop-color="#e2d6c3"/>
    </linearGradient>
    <linearGradient id="liquido" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lighten(liquid, 0.3)}"/>
      <stop offset="0.55" stop-color="${liquid}"/>
      <stop offset="1" stop-color="${darken(liquid, 0.22)}"/>
    </linearGradient>
    <linearGradient id="liquidoLado" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="0.35" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.7" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="vidrio" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="0.18" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="0.6" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="0.9" stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="brillo" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="tapa" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${cap[0]}"/>
      <stop offset="0.38" stop-color="${cap[1]}"/>
      <stop offset="0.7" stop-color="${cap[2]}"/>
      <stop offset="1" stop-color="${cap[3]}"/>
    </linearGradient>
    <linearGradient id="caja" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#141414"/>
      <stop offset="0.5" stop-color="#2c2a27"/>
      <stop offset="1" stop-color="#0d0d0d"/>
    </linearGradient>
    <filter id="sombra" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <filter id="sombraSuave" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
  </defs>`;
}

function scene() {
  return `
  <rect width="${W}" height="${H}" fill="url(#fondo)"/>
  <path d="M170 ${FLOOR} L170 380 A230 230 0 0 1 630 380 L630 ${FLOOR} Z" fill="url(#arco)"/>
  <ellipse cx="${CX}" cy="470" rx="250" ry="250" fill="url(#halo)"/>
  <rect x="140" y="${FLOOR}" width="520" height="${H - FLOOR}" fill="url(#podioCuerpo)"/>
  <ellipse cx="${CX}" cy="${FLOOR}" rx="260" ry="40" fill="url(#podioTapa)"/>
  <ellipse cx="${CX}" cy="${FLOOR}" rx="260" ry="40" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="1.5"/>`;
}

function floorShadow(width: number, offsetX = 0) {
  return `<ellipse cx="${CX + offsetX}" cy="${FLOOR + 4}" rx="${width / 2 + 24}" ry="16" fill="#3b2f1f" opacity="0.28" filter="url(#sombra)"/>`;
}

function label(box: Box, brand: string, name: string, concentration: string) {
  const lines = wrap(name, box.w > 200 ? 16 : 13);
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.max(17, Math.min(30, (box.w - 28) / (longest * 0.5)));
  const brandSize = brand.length > 14 ? 10 : 12;
  const lineGap = size * 1.05;
  const textBlock = lines.length * lineGap;
  const h = Math.min(box.h, 44 + textBlock + (concentration ? 22 : 6));
  const y = box.y + (box.h - h) / 2;
  const nameStart = y + 30 + size * 0.85;

  const nameSvg = lines
    .map(
      (line, i) =>
        `<text x="${box.x + box.w / 2}" y="${(nameStart + i * lineGap).toFixed(1)}" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, 'Times New Roman', serif" font-style="italic" font-size="${size.toFixed(1)}" fill="#1f1c18">${esc(line)}</text>`,
    )
    .join("\n    ");

  return `
  <g>
    <rect x="${box.x}" y="${y.toFixed(1)}" width="${box.w}" height="${h.toFixed(1)}" rx="5" fill="#fbf7f0" fill-opacity="0.94"/>
    <rect x="${box.x + 5}" y="${(y + 5).toFixed(1)}" width="${box.w - 10}" height="${(h - 10).toFixed(1)}" rx="3" fill="none" stroke="#c5a467" stroke-width="1"/>
    <text x="${box.x + box.w / 2}" y="${(y + 24).toFixed(1)}" text-anchor="middle" font-family="Jost, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="${brandSize}" letter-spacing="3.5" fill="#6b5a3e">${esc(brand.toUpperCase())}</text>
    ${nameSvg}
    ${
      concentration
        ? `<text x="${box.x + box.w / 2}" y="${(y + h - 13).toFixed(1)}" text-anchor="middle" font-family="Jost, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="9" letter-spacing="2.5" fill="#8a7a5e">${esc(concentration.toUpperCase())}</text>`
        : ""
    }
  </g>`;
}

// Cuerpo de vidrio con liquido adentro, reflejos y borde.
function glass(outer: string, inner: string, clipId: string) {
  return `
  <clipPath id="${clipId}"><path d="${outer}"/></clipPath>
  <path d="${outer}" fill="#ffffff" fill-opacity="0.35"/>
  <path d="${inner}" fill="url(#liquido)"/>
  <path d="${inner}" fill="url(#liquidoLado)"/>
  <g clip-path="url(#${clipId})">
    <path d="${outer}" fill="url(#vidrio)"/>
  </g>
  <path d="${outer}" fill="none" stroke="#ffffff" stroke-opacity="0.85" stroke-width="2.5"/>
  <path d="${outer}" fill="none" stroke="#4a3d2b" stroke-opacity="0.18" stroke-width="1"/>`;
}

function highlight(x: number, y: number, w: number, h: number, clipId: string) {
  return `
  <g clip-path="url(#${clipId})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="url(#brillo)" opacity="0.9"/>
  </g>`;
}

function capRect(x: number, y: number, w: number, h: number, rx: number) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#tapa)"/>
  <rect x="${x + w * 0.12}" y="${y + 6}" width="${w * 0.1}" height="${h - 12}" rx="${w * 0.05}" fill="#ffffff" opacity="0.35"/>
  <rect x="${x}" y="${y + h - 5}" width="${w}" height="5" fill="#000" opacity="0.18"/>`;
}

function neck(w: number, h: number, top: number) {
  return `<rect x="${CX - w / 2}" y="${top}" width="${w}" height="${h}" fill="url(#tapa)" opacity="0.75"/>`;
}

function roundedRect(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
}

// ---------------------------------------------------------------- frascos

type BottleArt = { svg: string; labelBox: Box | null; width: number };

function bottleClasico(): BottleArt {
  const w = 250;
  const h = 330;
  const x = CX - w / 2;
  const y = FLOOR - h;
  const outer = roundedRect(x, y, w, h, 30);
  const inner = roundedRect(x + 12, y + 44, w - 24, h - 56, 22);
  return {
    width: w,
    labelBox: { x: x + 38, y: y + 90, w: w - 76, h: 160 },
    svg:
      neck(56, 28, y - 26) +
      capRect(CX - 58, y - 118, 116, 96, 10) +
      glass(outer, inner, "c1") +
      highlight(x + 18, y + 16, 22, h - 36, "c1"),
  };
}

function bottleAlto(): BottleArt {
  const w = 200;
  const h = 420;
  const x = CX - w / 2;
  const y = FLOOR - h;
  const outer = roundedRect(x, y, w, h, 18);
  const inner = roundedRect(x + 11, y + 50, w - 22, h - 62, 12);
  return {
    width: w,
    labelBox: { x: x + 26, y: y + 140, w: w - 52, h: 170 },
    svg:
      neck(46, 22, y - 20) +
      capRect(CX - 46, y - 128, 92, 110, 8) +
      glass(outer, inner, "c1") +
      highlight(x + 14, y + 14, 18, h - 30, "c1"),
  };
}

function bottleCuadrado(): BottleArt {
  const w = 310;
  const h = 300;
  const x = CX - w / 2;
  const y = FLOOR - h;
  const outer = roundedRect(x, y, w, h, 20);
  // Vidrio grueso: el liquido queda bien adentro, como en los frascos pesados.
  const inner = roundedRect(x + 26, y + 48, w - 52, h - 74, 12);
  return {
    width: w,
    labelBox: { x: x + 56, y: y + 78, w: w - 112, h: 150 },
    svg:
      neck(64, 26, y - 24) +
      capRect(CX - 74, y - 100, 148, 78, 8) +
      glass(outer, inner, "c1") +
      highlight(x + 14, y + 12, 16, h - 26, "c1") +
      highlight(x + w - 30, y + 12, 10, h - 26, "c1"),
  };
}

function bottleRedondo(): BottleArt {
  const r = 170;
  const cy = FLOOR - r;
  const outer = `M${CX - r} ${cy} A${r} ${r} 0 1 1 ${CX + r} ${cy} A${r} ${r} 0 1 1 ${CX - r} ${cy} Z`;
  const ri = r - 14;
  const top = cy - ri + 58;
  // Liquido: el circulo cortado por arriba, como un frasco lleno a un 85%.
  const dx = Math.sqrt(ri * ri - (top - cy) * (top - cy));
  const inner = `M${CX - dx} ${top} A${ri} ${ri} 0 1 0 ${CX + dx} ${top} Z`;
  const topY = cy - r;
  return {
    width: r * 2,
    labelBox: { x: CX - 108, y: cy - 60, w: 216, h: 150 },
    svg:
      neck(58, 30, topY - 24) +
      `<circle cx="${CX}" cy="${topY - 72}" r="58" fill="url(#tapa)"/>
  <ellipse cx="${CX - 20}" cy="${topY - 94}" rx="16" ry="11" fill="#ffffff" opacity="0.45"/>` +
      glass(outer, inner, "c1") +
      highlight(CX - r + 26, cy - r + 50, 24, r * 1.4, "c1"),
  };
}

function bottleFacetado(): BottleArt {
  const w = 270;
  const h = 330;
  const x = CX - w / 2;
  const y = FLOOR - h;
  const c = 58;
  const outer = `M${x + c} ${y} H${x + w - c} L${x + w} ${y + c} V${y + h - c} L${x + w - c} ${y + h} H${x + c} L${x} ${y + h - c} V${y + c} Z`;
  const i = 14;
  const ci = c - 6;
  const inner = `M${x + i + ci} ${y + i + 34} H${x + w - i - ci} L${x + w - i} ${y + i + 34 + ci} V${y + h - i - ci} L${x + w - i - ci} ${y + h - i} H${x + i + ci} L${x + i} ${y + h - i - ci} V${y + i + 34 + ci} Z`;
  const facets = `
  <g clip-path="url(#c1)" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.5" fill="none">
    <path d="M${x + c} ${y} L${x + c + 26} ${y + 40} L${x + w - c - 26} ${y + 40} L${x + w - c} ${y}"/>
    <path d="M${x + c} ${y + h} L${x + c + 26} ${y + h - 40} L${x + w - c - 26} ${y + h - 40} L${x + w - c} ${y + h}"/>
    <path d="M${x} ${y + c} L${x + 40} ${y + c + 26} L${x + 40} ${y + h - c - 26} L${x} ${y + h - c}"/>
    <path d="M${x + w} ${y + c} L${x + w - 40} ${y + c + 26} L${x + w - 40} ${y + h - c - 26} L${x + w} ${y + h - c}"/>
  </g>`;
  // Tapa facetada, mas alta y angosta.
  const tx = CX - 52;
  const ty = y - 148;
  const cap = `
  <path d="M${tx + 16} ${ty} H${tx + 88} L${tx + 104} ${ty + 24} V${ty + 104} L${tx + 88} ${ty + 124} H${tx + 16} L${tx} ${ty + 104} V${ty + 24} Z" fill="url(#tapa)"/>
  <path d="M${tx + 16} ${ty} L${tx + 30} ${ty + 24} V${ty + 104} L${tx + 16} ${ty + 124}" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="1.5"/>`;
  return {
    width: w,
    labelBox: { x: x + 52, y: y + 88, w: w - 104, h: 158 },
    svg: neck(52, 28, y - 26) + cap + glass(outer, inner, "c1") + facets + highlight(x + 22, y + 60, 18, h - 120, "c1"),
  };
}

function miniBottle(cx: number, w: number, h: number, liquid: string, id: string) {
  const x = cx - w / 2;
  const y = FLOOR - h;
  const outer = roundedRect(x, y, w, h, 12);
  const inner = roundedRect(x + 6, y + 22, w - 12, h - 28, 8);
  const grad = "mini" + id;
  return `
  <linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${lighten(liquid, 0.3)}"/>
    <stop offset="1" stop-color="${darken(liquid, 0.2)}"/>
  </linearGradient>
  <clipPath id="clip${id}"><path d="${outer}"/></clipPath>
  <ellipse cx="${cx}" cy="${FLOOR + 2}" rx="${w / 2 + 10}" ry="8" fill="#3b2f1f" opacity="0.25" filter="url(#sombra)"/>
  <rect x="${cx - w * 0.2}" y="${y - 14}" width="${w * 0.4}" height="16" fill="url(#tapa)" opacity="0.8"/>
  <rect x="${cx - w * 0.34}" y="${y - 58}" width="${w * 0.68}" height="46" rx="6" fill="url(#tapa)"/>
  <path d="${outer}" fill="#ffffff" fill-opacity="0.35"/>
  <path d="${inner}" fill="url(#${grad})"/>
  <g clip-path="url(#clip${id})"><path d="${outer}" fill="url(#vidrio)"/>
    <rect x="${x + 6}" y="${y + 8}" width="${Math.max(6, w * 0.12)}" height="${h - 16}" rx="4" fill="url(#brillo)" opacity="0.8"/></g>
  <path d="${outer}" fill="none" stroke="#ffffff" stroke-opacity="0.85" stroke-width="2"/>
  <path d="${outer}" fill="none" stroke="#4a3d2b" stroke-opacity="0.18" stroke-width="1"/>`;
}

function bottleSet(look: Look): BottleArt {
  const colors = look.minis ?? [look.liquid, look.liquid, look.liquid];
  const n = colors.length;
  const w = n >= 5 ? 76 : n === 4 ? 88 : n === 2 ? 118 : 100;
  const gap = n >= 5 ? 14 : 20;
  const total = n * w + (n - 1) * gap;
  const heights = [230, 270, 250, 285, 240];
  let svg = "";
  colors.forEach((color, i) => {
    const cx = CX - total / 2 + w / 2 + i * (w + gap);
    const h = n === 2 ? [300, 270][i] : heights[i % heights.length];
    svg += miniBottle(cx, w, h, color, String(i));
  });
  return { width: total, labelBox: null, svg };
}

function bottleEstuche(): BottleArt {
  // Caja de regalo atras a la derecha, frasco adelante a la izquierda.
  const bw = 270;
  const bh = 400;
  const bx = CX - 20;
  const by = FLOOR - bh;
  const box = `
  <ellipse cx="${bx + bw / 2}" cy="${FLOOR + 4}" rx="${bw / 2 + 20}" ry="14" fill="#3b2f1f" opacity="0.3" filter="url(#sombra)"/>
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="url(#caja)"/>
  <rect x="${bx}" y="${by}" width="${bw}" height="46" fill="#000" opacity="0.35"/>
  <rect x="${bx + bw * 0.62}" y="${by}" width="22" height="${bh}" fill="url(#tapa)"/>
  <rect x="${bx + 18}" y="${by + 18}" width="${bw - 36}" height="${bh - 36}" fill="none" stroke="#c5a467" stroke-opacity="0.55"/>`;
  // Frasco adelante, mas chico.
  const w = 190;
  const h = 250;
  const x = CX - 190;
  const y = FLOOR - h;
  const cx = x + w / 2;
  const outer = roundedRect(x, y, w, h, 24);
  const inner = roundedRect(x + 10, y + 36, w - 20, h - 46, 18);
  const bottle = `
  <ellipse cx="${cx}" cy="${FLOOR + 4}" rx="${w / 2 + 16}" ry="12" fill="#3b2f1f" opacity="0.3" filter="url(#sombra)"/>
  <rect x="${cx - 22}" y="${y - 22}" width="44" height="24" fill="url(#tapa)" opacity="0.75"/>
  ${capRect(cx - 46, y - 96, 92, 78, 8)}
  ${glass(outer, inner, "c1")}
  ${highlight(x + 14, y + 14, 18, h - 28, "c1")}`;
  return {
    width: 0,
    labelBox: { x: bx + 40, y: by + 110, w: bw - 110, h: 170 },
    svg: box + bottle,
  };
}

function art(look: Look): BottleArt {
  switch (look.shape) {
    case "alto":
      return bottleAlto();
    case "cuadrado":
      return bottleCuadrado();
    case "redondo":
      return bottleRedondo();
    case "facetado":
      return bottleFacetado();
    case "set":
      return bottleSet(look);
    case "estuche":
      return bottleEstuche();
    default:
      return bottleClasico();
  }
}

// En los sets el nombre va grabado en el frente del podio.
function plaque(brand: string, name: string) {
  const lines = wrap(name, 26);
  return `
  <text x="${CX}" y="${FLOOR + 72}" text-anchor="middle" font-family="Jost, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="13" letter-spacing="4" fill="#6b5a3e">${esc(brand.toUpperCase())}</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="${CX}" y="${FLOOR + 108 + i * 30}" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, 'Times New Roman', serif" font-style="italic" font-size="28" fill="#3a3024">${esc(line)}</text>`,
    )
    .join("\n  ")}`;
}

function renderSvg(p: { slug: string; brand: string; name: string; concentration: string; gender: string }) {
  const look = LOOKS[p.slug] ?? defaultLook(p.gender);
  const a = art(look);
  const concentration = CONCENTRATION[p.concentration] ?? "";

  const shadow = look.shape === "set" || look.shape === "estuche" ? "" : floorShadow(a.width);
  const lbl = a.labelBox ? label(a.labelBox, p.brand, p.name, concentration) : plaque(p.brand, p.name);
  // Etiqueta clara sobre liquido oscuro se lee sola; sobre liquido claro le
  // sumamos una sombra minima para despegarla del vidrio.
  const labelShadow =
    a.labelBox && luminance(look.liquid) > 0.7
      ? `<rect x="${a.labelBox.x}" y="${a.labelBox.y + 6}" width="${a.labelBox.w}" height="${a.labelBox.h - 12}" rx="6" fill="#3b2f1f" opacity="0.08" filter="url(#sombra)"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(p.brand + " " + p.name)}">
${defs(look)}
${scene()}
${shadow}
${a.svg}
${labelShadow}
${lbl}
  <text x="${CX}" y="${H - 22}" text-anchor="middle" font-family="Jost, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" letter-spacing="4" fill="#7d705c" opacity="0.7">IMAGEN ILUSTRATIVA</text>
</svg>
`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const productos = await db.product.findMany({ orderBy: { brand: "asc" } });

  let generadas = 0;
  let salteadas = 0;

  for (const producto of productos) {
    const yaTiene = producto.images !== "[]" && producto.images.trim() !== "";
    // Una foto real cargada desde el panel nunca se pisa, ni con --forzar.
    const esIlustrativa = producto.images.includes("/productos/" + producto.slug + ".svg");
    if (yaTiene && (!forzar || !esIlustrativa)) {
      salteadas += 1;
      continue;
    }

    const archivo = producto.slug + ".svg";
    writeFileSync(join(OUT_DIR, archivo), renderSvg(producto), "utf8");

    if (!yaTiene) {
      await db.product.update({
        where: { id: producto.id },
        data: { images: JSON.stringify(["/productos/" + archivo]) },
      });
    }

    console.log("  generada  /productos/" + archivo);
    generadas += 1;
  }

  console.log("");
  console.log(generadas + " imagenes generadas, " + salteadas + " productos con foto propia o ya generada.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
