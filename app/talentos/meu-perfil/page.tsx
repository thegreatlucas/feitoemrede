import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import { TalentForm } from "@/components/talent-form";
import type { TalentProfile } from "@/lib/talent-cv";
import { deleteTalent } from "../actions";
export const dynamic = "force-dynamic";
export default async function MyTalent({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const user = await requireUser("/talentos/meu-perfil");
  const db = await supabase();
  const { data, error } = await db
    .from("talent_profiles")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  const { message } = await searchParams;
  return (
    <main className="form-page wide">
      <div className="eyebrow">SEU PRÓXIMO PASSO COMEÇA AQUI</div>
      <h1>
        SEU TALENTO
        <br />
        TEM VALOR.
      </h1>
      <p>
        Apresente sua experiência e encontre novas oportunidades. O perfil e o
        currículo são visíveis apenas depois do login.
      </p>
      <Link className="text-link" href="/talentos">
        Voltar ao banco de talentos
      </Link>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {error ? (
        <p role="alert" className="notice">
          Não foi possível carregar seu perfil. Tente novamente.
        </p>
      ) : (
        <>
          <TalentForm
            profile={data as TalentProfile | null}
            email={user.email ?? ""}
          />
          {data && (
            <section className="danger-section">
              <h2>Remover meu perfil</h2>
              <p>
                Isso exclui seu perfil profissional e o currículo. Sua conta e
                seu negócio continuam na plataforma.
              </p>
              <form action={deleteTalent}>
                <button className="button secondary">
                  Remover perfil e currículo
                </button>
              </form>
            </section>
          )}
        </>
      )}
    </main>
  );
}
