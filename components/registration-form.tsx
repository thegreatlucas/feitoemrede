"use client";
import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { registerBusiness } from "@/app/actions";
import { BusinessFields } from "@/components/business-fields";
import { Arrow } from "@/components/icons";
export function RegistrationForm() {
  const [step, setStep] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(registerBusiness, {});
  return (
    <>
      <ol className="signup-progress" aria-label="Etapas do cadastro">
        <li aria-current={step === 0 ? "step" : undefined}>01 · Seu negócio</li>
        <li aria-current={step === 1 ? "step" : undefined}>02 · Sua conta</li>
        <li>03 · Pronto para participar</li>
      </ol>
      <form
        ref={form}
        action={action}
        className="form-stack"
        onReset={(event) => event.preventDefault()}
      >
        {state.message && (
          <div className="notice" role="alert">
            {state.message}
          </div>
        )}
        <div className="honeypot" aria-hidden="true">
          <label>
            Deixe este campo vazio
            <input name="company_url" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <fieldset hidden={step !== 0} disabled={pending}>
          <legend>Comece pela sua empresa</legend>
          <BusinessFields defaults={state.values} />
        </fieldset>
        <fieldset hidden={step !== 1} disabled={pending || step !== 1}>
          <legend>Como você vai acessar a rede?</legend>
          <p className="muted">
            Os dados do negócio continuam preenchidos. Ao concluir, você já
            entra no painel para acompanhar sua empresa.
          </p>
          <label>
            E-mail
            <input
              type="email"
              name="email"
              required={step === 1}
              maxLength={254}
              autoComplete="email"
              defaultValue={state.values?.email}
            />
          </label>
          <label>
            Senha <small>(mínimo de 10 caracteres)</small>
            <input
              type="password"
              name="password"
              required={step === 1}
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
              required={step === 1}
              minLength={10}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>
        </fieldset>
        <div className="signup-buttons">
          {step === 1 && (
            <button
              type="button"
              disabled={pending}
              className="button secondary"
              onClick={() => setStep(0)}
            >
              Voltar aos dados
            </button>
          )}
          {step === 0 ? (
            <button
              type="button"
              className="button"
              onClick={() => {
                if (form.current?.reportValidity()) setStep(1);
              }}
            >
              Continuar para minha conta <Arrow />
            </button>
          ) : (
            <button type="submit" className="button" disabled={pending}>
              {pending ? "Enviando cadastro…" : "Concluir cadastro"} <Arrow />
            </button>
          )}
        </div>
        <p className="muted">
          Seu e-mail e sua senha não são públicos. Não inclua documentos ou
          informações sensíveis na descrição.
        </p>
        <p className="muted">
          Já tem conta? <Link href="/entrar">Entre aqui.</Link>
        </p>
      </form>
    </>
  );
}
