import { Arrow } from "@/components/icons";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import { talentAreas, workModes, states } from "@/lib/talent-schema";
export const dynamic = "force-dynamic";
export default async function Talents({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await currentUser();
  if (!user)
    return (
      <main className="form-page wide">
        <div className="eyebrow">RECOMEÇOS FICAM MAIS FORTES EM REDE</div>
        <h1>
          GENTE BOA.
          <br />
          NOVOS CAMINHOS.
        </h1>
        <p>
          Um banco de talentos para conectar quem busca recolocação a quem quer
          contratar. Aberto a profissionais de todas as áreas, sem exigir
          filiação ou opinião política.
        </p>
        <div className="notice">
          <h2>Um espaço com acesso reservado.</h2>
          <p>
            Os nomes, contatos e currículos só ficam disponíveis após entrar na
            plataforma.
          </p>
          <div className="signup-buttons">
            <Link className="button" href="/entrar?next=%2Ftalentos">
              Entrar para encontrar talentos <Arrow />
            </Link>
            <Link
              className="button secondary"
              href="/criar-conta?next=%2Ftalentos%2Fmeu-perfil"
            >
              Quero cadastrar meu talento <Arrow />
            </Link>
          </div>
        </div>
      </main>
    );
  const p = await searchParams;
  const q = typeof p.q === "string" ? p.q.slice(0, 100) : "";
  const area = typeof p.area === "string" ? p.area : "";
  const mode = typeof p.mode === "string" ? p.mode : "";
  const state = typeof p.state === "string" ? p.state : "";
  const page = Math.max(
    1,
    Math.min(1000000, Number.parseInt(String(p.page ?? "1"), 10) || 1),
  );
  const db = await supabase();
  let query = db
    .from("talent_profiles")
    .select(
      "owner_id,full_name,headline,area,city,state,region,work_modes,skills,summary",
      { count: "exact" },
    )
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .order("owner_id")
    .range((page - 1) * 12, page * 12 - 1);
  if (talentAreas.includes(area as (typeof talentAreas)[number]))
    query = query.eq("area", area);
  if (workModes.includes(mode as (typeof workModes)[number]))
    query = query.contains("work_modes", [mode]);
  if (states.includes(state as (typeof states)[number]))
    query = query.eq("state", state);
  const term = q.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
  if (term)
    query = query.or(
      `full_name.ilike.%${term}%,headline.ilike.%${term}%,city.ilike.%${term}%,region.ilike.%${term}%,skills.ilike.%${term}%`,
    );
  const { data, error, count } = await query;
  const pageUrl = (number: number) =>
    "/talentos?" +
    new URLSearchParams({ q, area, mode, state, page: String(number) });
  return (
    <main className="talent-directory">
      <div className="section-top">
        <div>
          <div className="eyebrow">OPORTUNIDADES SE CONSTROEM EM REDE</div>
          <h1>BANCO DE TALENTOS.</h1>
          <p>Encontre pessoas pela experiência, região e forma de trabalho.</p>
        </div>
        <Link className="button" href="/talentos/meu-perfil">
          Meu perfil profissional <Arrow />
        </Link>
      </div>
      <form className="talent-filters">
        <label>
          Buscar
          <input
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Nome, cargo, habilidade ou região"
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
      {error ? (
        <p className="notice" role="alert">
          Não foi possível carregar os perfis. Tente novamente.
        </p>
      ) : (
        <>
          <p className="muted">
            {count ?? 0} profissionais encontrados · Acesso exclusivo para
            pessoas autenticadas
          </p>
          {data?.length ? (
            <div className="talent-cards">
              {data.map((talent) => (
                <article className="talent-card" key={talent.owner_id}>
                  <div className="eyebrow">{talent.area}</div>
                  <h2>{talent.full_name}</h2>
                  <h3>{talent.headline}</h3>
                  <p className="muted">
                    {talent.city} · {talent.state}
                    {talent.region ? " · " + talent.region : ""}
                  </p>
                  <div className="talent-tags">
                    {talent.work_modes.map((value: string) => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>
                  <p>
                    {talent.summary.slice(0, 220)}
                    {talent.summary.length > 220 ? "…" : ""}
                  </p>
                  {talent.skills && <p className="muted">{talent.skills}</p>}
                  <Link
                    className="text-link"
                    href={"/talentos/" + talent.owner_id}
                  >
                    Ver perfil, contatos e currículo <Arrow />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div>
                <h2>
                  {q || area || mode || state
                    ? "Nenhum perfil encontrado com esses filtros."
                    : "O próximo talento pode ser você."}
                </h2>
                <p>Cadastre sua experiência e ajude esta rede a crescer.</p>
                <Link className="text-link" href="/talentos/meu-perfil">
                  Criar meu perfil <Arrow />
                </Link>
              </div>
            </div>
          )}
          {(count ?? 0) > 12 && (
            <div className="pagination">
              <span>
                Página {page} de {Math.ceil((count ?? 0) / 12)}
              </span>
              <div>
                {page > 1 && (
                  <Link className="button secondary" href={pageUrl(page - 1)}>
                    Anterior
                  </Link>
                )}
                {page * 12 < (count ?? 0) && (
                  <Link className="button" href={pageUrl(page + 1)}>
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
