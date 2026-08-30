"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-2xl">Panel de administracion</h1>
      <p className="mt-2 text-sm text-ink-soft">Ingresa la contrasena para continuar.</p>

      <form action={formAction} className="mt-8 space-y-4">
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Contrasena"
          className="w-full border border-line rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-gold"
        />
        {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink text-cream py-3 text-sm rounded-sm disabled:opacity-50"
        >
          {pending ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
