import { Arrow } from "@/components/icons";
import { createBusiness } from "@/app/actions";
import { configured, supabase } from "@/lib/supabase/server";
import {
  BusinessFields,
  type BusinessDefaults,
} from "@/components/business-fields";
import { RegistrationForm } from "@/components/registration-form";
export default async function Cadastro({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const db = configured() ? await supabase() : null;
  const user = db ? (await db.auth.getUser()).data.user : null;
  const draft = user?.user_metadata?.business_draft;
  const defaults: BusinessDefaults = {};
  if (draft && typeof draft === "object")
    for (const key of [
      "name",
      "description",
      "category",
      "city",
      "state",
      "website",
    ] as const)
      if (typeof draft[key] === "string") defaults[key] = draft[key];
  return (
    <main className="form-page wide">
      <div className="eyebrow">TRABALHO LOCAL. IMPACTO COLETIVO.</div>
      <h1>
        QUEM FAZ
        <br />
        TEM LUGAR AQUI.
      </h1>
      <p>
        {user
          ? "Apresente sua empresa para a comunidade."
          : "Primeiro, conte sobre seu negócio. Depois crie seu acesso e entre no painel, sem confirmação por e-mail."}{" "}
        Os cadastros passam por análise antes de aparecer na rede.
      </p>
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
      {user ? (
        <form action={createBusiness} className="form-stack">
          <BusinessFields defaults={defaults} />
          <button className="button">
            Salvar meu negócio <Arrow />
          </button>
        </form>
      ) : (
        <RegistrationForm />
      )}
    </main>
  );
}
