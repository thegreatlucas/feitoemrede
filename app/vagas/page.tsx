import { pageMetadata } from "@/lib/metadata";
import { Arrow } from "@/components/icons";
import Link from "next/link";
import { configured, supabase } from "@/lib/supabase/server";
import { talentAreas, workModes, states } from "@/lib/talent-schema";
import { brazilToday, type JobPost } from "@/lib/job-schema";
export const dynamic = "force-dynamic";
export default async function Jobs({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const q = typeof p.q === "string" ? p.q.slice(0, 100) : "";
  const area = typeof p.area === "string" ? p.area : "";
  const mode = typeof p.mode === "string" ? p.mode : "";
  const state = typeof p.state === "string" ? p.state : "";
  const page = Math.max(
    1,
    Math.min(1000000, Number.parseInt(String(p.page ?? "1"), 10) || 1),
  );
  let jobs: JobPost[] = [];
  let failed = false;
  let count = 0;
  if (configured()) {
    const db = await supabase();
    let query = db
      .from("job_posts")
      .select("*,businesses!inner(name,status)", { count: "exact" })
      .eq("businesses.status", "approved")
      .eq("is_active", true)
      .gte("expires_on", brazilToday())
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * 12, page * 12 - 1);
    if (talentAreas.includes(area as (typeof talentAreas)[number]))
      query = query.eq("area", area);
    if (workModes.includes(mode as (typeof workModes)[number]))
      query = query.eq("work_mode", mode);
    if (states.includes(state as (typeof states)[number]))
      query = query.eq("state", state);
    const term = q.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
    if (term)
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,city.ilike.%${term}%`,
      );
    const result = await query;
    jobs = (result.data as unknown as JobPost[]) ?? [];
    failed = !!result.error;
    count = result.count ?? 0;
  }
  const pageUrl = (n: number) =>
    "/vagas?" + new URLSearchParams({ q, area, mode, state, page: String(n) });
  return (
    <main className="talent-directory">
      <div className="section-top">
        <div>
          <div className="eyebrow">TRABALHO QUE CONECTA</div>
          <h1>
            OPORTUNIDADES
            <br />
            NA NOSSA REDE.
          </h1>
          <p>Vagas anunciadas pelas empresas cadastradas na plataforma.</p>
        </div>
        <Link className="button" href="/painel/vagas/nova">
          Minha empresa quer contratar <Arrow />
        </Link>
      </div>
      <form className="talent-filters">
        <label>
          Buscar
          <input
            name="q"
            maxLength={100}
            defaultValue={q}
            placeholder="Cargo, cidade ou palavra-chave"
          />
        </label>
        <label>
          Área
          <select name="area" defaultValue={area}>
            <option value="">Todas as áreas</option>
            {talentAreas.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          UF
          <select name="state" defaultValue={state}>
            <option value="">Todo o Brasil</option>
            {states.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Modalidade
          <select name="mode" defaultValue={mode}>
            <option value="">Todas</option>
            {workModes.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <button className="button">Filtrar</button>
      </form>
      {failed ? (
        <p className="notice" role="alert">
          Não foi possível carregar as vagas. Tente novamente.
        </p>
      ) : (
        <>
          <p className="muted">{count} oportunidades abertas</p>
          {jobs.length ? (
            <div className="talent-cards">
              {jobs.map((job) => (
                <article key={job.id} className="talent-card">
                  <div className="eyebrow">{job.businesses?.name}</div>
                  <h2>{job.title}</h2>
                  <p>
                    {job.city} · {job.state}
                  </p>
                  <div className="talent-tags">
                    <span>{job.work_mode}</span>
                    <span>{job.contract_type}</span>
                  </div>
                  {job.salary && (
                    <p>
                      <strong>{job.salary}</strong>
                    </p>
                  )}
                  <p>
                    {job.description.slice(0, 180)}
                    {job.description.length > 180 ? "…" : ""}
                  </p>
                  <Link className="text-link" href={"/vagas/" + job.id}>
                    Conhecer a vaga <Arrow />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div>
                <h2>
                  {q || area || mode || state
                    ? "Nenhuma vaga encontrada com esses filtros."
                    : "As próximas oportunidades começam aqui."}
                </h2>
                <p>Empresas da rede já podem anunciar suas vagas.</p>
                <Link className="text-link" href="/painel/vagas/nova">
                  Anunciar uma oportunidade <Arrow />
                </Link>
              </div>
            </div>
          )}
          {count > 12 && (
            <div className="pagination">
              <span>
                Página {page} de {Math.ceil(count / 12)}
              </span>
              <div>
                {page > 1 && (
                  <Link className="button secondary" href={pageUrl(page - 1)}>
                    Anterior
                  </Link>
                )}
                {page * 12 < count && (
                  <Link className="button" href={pageUrl(page + 1)}>
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
      <p className="notice">
        Busca recolocação?{" "}
        <Link className="text-link" href="/talentos/meu-perfil">
          Cadastre seu perfil no banco de talentos.
        </Link>
      </p>
    </main>
  );
}

export const metadata = pageMetadata(
  "Vagas",
  "Encontre oportunidades de trabalho nas empresas da rede.",
  "/vagas",
  false,
);
