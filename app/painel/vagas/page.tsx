import { Arrow } from "@/components/icons";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import { brazilToday } from "@/lib/job-schema";
import { closeJob, deleteJob } from "./actions";
export const dynamic = "force-dynamic";
export default async function MyJobs({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const user = await requireUser("/painel/vagas");
  const db = await supabase();
  const { data, error } = await db
    .from("job_posts")
    .select("id,title,city,state,work_mode,is_active,expires_on")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const { message } = await searchParams;
  return (
    <main className="talent-directory">
      <div className="section-top">
        <div>
          <div className="eyebrow">QUEM EMPREENDE TAMBÉM ABRE CAMINHOS</div>
          <h1>VAGAS DA MINHA EMPRESA.</h1>
        </div>
        <Link className="button" href="/painel/vagas/nova">
          Anunciar vaga <Arrow />
        </Link>
      </div>
      <Link className="text-link" href="/vagas">
        Ver oportunidades da rede <Arrow />
      </Link>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {error ? (
        <p className="notice" role="alert">
          Não foi possível carregar suas vagas.
        </p>
      ) : data?.length ? (
        <div className="talent-cards">
          {data.map((job) => (
            <article className="talent-card" key={job.id}>
              <div className="eyebrow">
                {!job.is_active
                  ? "Rascunho / encerrada"
                  : job.expires_on < brazilToday()
                    ? "Prazo encerrado"
                    : "Publicada"}
              </div>
              <h2>{job.title}</h2>
              <p>
                {job.city} · {job.state} · {job.work_mode}
              </p>
              <Link className="text-link" href={"/painel/vagas/" + job.id}>
                Editar vaga <Arrow />
              </Link>
              <div className="job-controls">
                {job.is_active && (
                  <form action={closeJob}>
                    <input type="hidden" name="job_id" value={job.id} />
                    <button className="button secondary">Encerrar vaga</button>
                  </form>
                )}
                <form action={deleteJob}>
                  <input type="hidden" name="job_id" value={job.id} />
                  <button className="text-link">Remover anúncio</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="notice">Sua empresa ainda não anunciou vagas.</p>
      )}
    </main>
  );
}
