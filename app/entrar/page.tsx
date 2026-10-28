import Link from "next/link";
import { Arrow } from "@/components/icons";
import { authenticate } from "@/app/actions";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  return (
    <main className="form-page">
      <div className="eyebrow">SUA HISTÓRIA FAZ PARTE</div>
      <h1>ENTRE NA REDE.</h1>
      <p>Entre para cuidar do seu negócio.</p>
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
      <form action={authenticate} className="form-stack">
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
          Ainda não faz parte?{" "}
          <Link href="/cadastro">Cadastre sua empresa e crie sua conta.</Link>
        </p>
      </form>
    </main>
  );
}
