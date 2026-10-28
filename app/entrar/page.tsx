import { Arrow, Burst } from "@/components/icons";
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
      <p>Crie sua conta ou entre para cuidar do seu negócio.</p>
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
        <button name="mode" value="signup" className="button secondary">
          Criar minha conta <Arrow />
        </button>
        <p className="muted">
          Ao criar uma conta, você concorda com os{" "}
          <a href="/privacidade">termos de participação e privacidade</a>.
          Confirme seu endereço pelo e-mail enviado.
        </p>
      </form>
    </main>
  );
}
