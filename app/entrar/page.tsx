import { pageMetadata } from "@/lib/metadata";
import { safeReturnTo } from "@/lib/talent-schema";
import Link from "next/link";
import { Arrow } from "@/components/icons";
import { authenticate } from "@/app/actions";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next: requestedNext } = await searchParams;
  const next = safeReturnTo(requestedNext);
  return (
    <main className="form-page" data-clarity-mask="true">
      <div className="eyebrow">SUA HISTÓRIA FAZ PARTE</div>
      <h1>ENTRE NA REDE.</h1>
      <p>
        Entre para cuidar do seu negócio, cadastrar seu talento ou encontrar
        profissionais.
      </p>
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
      <form action={authenticate} className="form-stack">
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
          />
        </label>
        <button name="mode" value="signin" className="button">
          Entrar <Arrow />
        </button>
        <p className="muted">
          Ainda não tem acesso?{" "}
          <Link href={"/criar-conta?next=" + encodeURIComponent(next)}>
            Crie sua conta.
          </Link>{" "}
          Para empreender, <Link href="/cadastro">cadastre seu negócio.</Link>
        </p>
      </form>
    </main>
  );
}

export const metadata = pageMetadata(
  "Entrar",
  "Acesse sua conta para cuidar do seu negócio e encontrar talentos.",
  "/entrar",
  true,
);
