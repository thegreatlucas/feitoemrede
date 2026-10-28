import { pageMetadata } from "@/lib/metadata";
import { Arrow } from "@/components/icons";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import { JobForm } from "@/components/job-form";
export const dynamic = "force-dynamic";
export default async function NewJob() {
  const user = await requireUser("/painel/vagas/nova");
  const db = await supabase();
  const { data, error } = await db
    .from("businesses")
    .select("name,status")
    .eq("owner_id", user.id)
    .maybeSingle();
  return (
    <main className="form-page wide">
      <div className="eyebrow">UMA OPORTUNIDADE PODE MUDAR UMA HISTÓRIA</div>
      <h1>
        ANUNCIE
        <br />
        UMA VAGA.
      </h1>
      {error ? (
        <p role="alert" className="notice">
          Não foi possível carregar sua empresa.
        </p>
      ) : !data || data.status !== "approved" ? (
        <div className="notice">
          <p>Para anunciar, você precisa ter uma empresa publicada na rede.</p>
          <Link className="button" href="/cadastro">
            Cadastrar ou consultar meu negócio <Arrow />
          </Link>
        </div>
      ) : (
        <>
          <p>
            O anúncio ficará vinculado à empresa <strong>{data.name}</strong> e
            poderá ser encontrado por qualquer visitante.
          </p>
          <JobForm job={null} />
        </>
      )}
    </main>
  );
}

export const metadata = pageMetadata(
  "Anunciar vaga",
  "Cadastre uma oportunidade de trabalho na sua empresa.",
  "/painel/vagas/nova",
  true,
);
