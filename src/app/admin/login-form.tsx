"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Logo } from "@/components/logo";
import { btn, cn, field, label } from "@/lib/ui";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald px-5">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-emerald-3/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-champagne/10 blur-3xl" />

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="flex justify-center">
          <Logo light />
        </div>

        <div className="mt-10 rounded-3xl bg-pearl p-8 shadow-lift">
          <h1 className="font-display text-[32px] text-emerald">Panel de gestión</h1>
          <p className="mt-1 text-[14px] text-muted">Ingresá la contraseña para administrar la tienda.</p>

          <form action={formAction} className="mt-7 space-y-4">
            <div>
              <label className={label} htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                autoFocus
                autoComplete="current-password"
                className={field}
              />
            </div>
            {state?.error && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-[13px] text-danger" role="alert">
                {state.error}
              </p>
            )}
            <button type="submit" disabled={pending} className={cn(btn.primary, "w-full py-4")}>
              {pending ? "Verificando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
