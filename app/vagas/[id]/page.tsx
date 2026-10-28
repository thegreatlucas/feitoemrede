import { Arrow } from "@/components/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { supabase } from "@/lib/supabase/server";
import { brazilToday, type JobPost } from "@/lib/job-schema";
export const dynamic = "force-dynamic";
export default async function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const db = await supabase();
  const { data, error } = await db
    .from("job_posts")
    .select("*,businesses!inner(name,status)")
    .eq("id", id)
    .eq("businesses.status", "approved")
    .eq("is_active", true)
    .gte("expires_on", brazilToday())
    .maybeSingle();
  if (error)
    return (
      <main className="form-page">
        <p role="alert">Não foi possível carregar a vaga.</p>
      </main>
    );
  if (!data) notFound();
  const job = data as unknown as JobPost;
  return (
    <main className="form-page wide">
      <Link className="text-link" href="/vagas">
        Voltar às vagas
      </Link>
      <div className="eyebrow talent-profile-area">{job.businesses?.name}</div>
      <h1 className="talent-name">{job.title}</h1>
      <p>
        {job.city} · {job.state} · {job.area}
      </p>
      <div className="talent-tags">
        <span>{job.work_mode}</span>
        <span>{job.contract_type}</span>
      </div>
      {job.salary && (
        <p>
          <strong>Remuneração: {job.salary}</strong>
        </p>
      )}
      <section className="talent-bio">
        <h2>Sobre a oportunidade</h2>
        <p>{job.description}</p>
      </section>
      <section className="notice">
        <h2>Candidate-se</h2>
        <p>
          Recebimento de candidaturas até{" "}
          {new Date(job.expires_on + "T12:00:00Z").toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })}
          .
        </p>
        <div className="signup-buttons">
          {job.application_url && (
            <a
              className="button"
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Acessar candidatura <Arrow />
            </a>
          )}
          {job.application_email && (
            <a
              className="button secondary"
              href={
                "mailto:" +
                encodeURIComponent(job.application_email) +
                "?subject=" +
                encodeURIComponent("Candidatura: " + job.title)
              }
            >
              Candidatar por e-mail <Arrow />
            </a>
          )}
        </div>
        <p className="muted">
          A candidatura é feita diretamente com a empresa. Seu currículo do
          banco de talentos não é enviado automaticamente. Não pague taxas para
          concorrer a uma vaga.
        </p>
      </section>
    </main>
  );
}
