import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Sesion simple para el panel: una sola contrasena y una cookie firmada.
// Alcanza para una tienda de un solo administrador. Si mas adelante entra mas
// de una persona al panel, conviene pasar a usuarios en base de datos.

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 12;

function secret() {
  return process.env.SESSION_SECRET ?? "dev-secret-inseguro";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  return safeEqual(input, expected);
}

export async function createSession() {
  const issued = String(Date.now());
  const token = issued + "." + sign(issued);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAuthenticated() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  const [issued, signature] = token.split(".");
  if (!issued || !signature) return false;
  if (!safeEqual(signature, sign(issued))) return false;
  return Date.now() - Number(issued) < MAX_AGE * 1000;
}

// Guardia para cada pagina del panel.
//
// No alcanza con esconder el contenido desde el layout: Next ejecuta igual el
// componente de la pagina, corre sus consultas y manda el resultado en la
// carga inicial. La verificacion tiene que estar dentro de cada pagina, antes
// de tocar la base.
export async function requireAdminPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}
