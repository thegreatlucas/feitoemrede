"use client";
import { useActionState } from "react";
import Link from "next/link";
import { createAccount } from "@/app/criar-conta/actions";
export function AccountForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(createAccount, {});
  return (
    <form
      action={action}
      className="form-stack"
      onReset={(event) => event.preventDefault()}
      data-clarity-mask="true"
    >
      {state.message && (
        <p className="notice" role="alert">
          {state.message}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <fieldset disabled={pending}>
        <label>
          E-mail
          <input
            type="email"
            name="email"
            required
            maxLength={254}
            autoComplete="email"
          />
        </label>
        <label>
          Senha <small>(mínimo de 10 caracteres)</small>
          <input
            type="password"
            name="password"
            required
            minLength={10}
            maxLength={128}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirme sua senha
          <input
            type="password"
            name="passwordConfirmation"
            required
            minLength={10}
            maxLength={128}
            autoComplete="new-password"
          />
        </label>
        <label className="checkbox">
          <input type="checkbox" name="consent" required />
          <span>
            Li e aceito os{" "}
            <Link href="/privacidade">
              termos de participação e privacidade
            </Link>
            .
          </span>
        </label>
        <button className="button" disabled={pending}>
          {pending ? "Criando conta…" : "Criar meu acesso"}
        </button>
      </fieldset>
      <p className="muted">
        Já tem conta?{" "}
        <Link href={"/entrar?next=" + encodeURIComponent(next)}>
          Entre aqui.
        </Link>
      </p>
    </form>
  );
}
