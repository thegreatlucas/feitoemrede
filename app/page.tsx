import { BusinessDescription } from "@/components/business-description";
import { businessImageUrl } from "@/lib/image-url";
import { contactLinks, type BusinessContacts } from "@/lib/contact-links";
import { Arrow, Burst } from "@/components/icons";
import Link from "next/link";
import { configured, supabase } from "@/lib/supabase/server";
import { categories } from "@/lib/schema";
export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const category = typeof params.category === "string" ? params.category : "";
  const page = Math.max(
    1,
    Math.min(1000000, Number.parseInt(String(params.page ?? "1"), 10) || 1),
  );
  const pageSize = 9;
  let total = 0;
  let businesses: (BusinessContacts & {
    id: string;
    name: string;
    description: string;
    category: string;
    city: string;
    state: string;
    website: string | null;
    logo_path: string;
    facade_path: string;
  })[] = [];
  let failed = false;
  if (configured()) {
    const db = await supabase();
    let query = db
      .from("businesses")
      .select(
        "id,name,description,category,city,state,website,phone,whatsapp,contact_email,instagram,logo_path,facade_path",
        {
          count: "exact",
        },
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (categories.includes(category as (typeof categories)[number]))
      query = query.eq("category", category);
    const term = q.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
    if (term)
      query = query.or(
        `name.ilike.%${term}%,city.ilike.%${term}%,description.ilike.%${term}%`,
      );
    const { data, error, count } = await query;
    businesses = data ?? [];
    total = count ?? 0;
    failed = !!error;
  }
  const filtered = businesses;
  const pageUrl = (number: number) =>
    `/?${new URLSearchParams({ q, category, page: String(number) })}#explorar`;
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> ECONOMIA LOCAL. FORÇA COLETIVA.
          </div>
          <h1>
            QUEM FAZ,
            <br />
            <span>FORTALECE.</span>
          </h1>
          <p>
            Todo negócio tem uma história.
            <br />
            Toda escolha pode fortalecer uma rede.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/#explorar">
              Encontre seu próximo favorito{" "}
              <span>
                <Arrow />
              </span>
            </Link>
            <Link className="text-link" href="/cadastro">
              Tenho um negócio <Arrow />
            </Link>
          </div>
          <div className="hero-note">
            <span>
              <Burst />
            </span>{" "}
            Gente de verdade. Trabalho que transforma.
          </div>
        </div>
        <div
          className="poster"
          aria-label="Ilustração gráfica: juntos fazemos a economia girar"
        >
          <div className="poster-top">
            DE MÃO EM MÃO<span>BRASIL · COLETIVO</span>
          </div>
          <div className="sunburst" />
          <div className="poster-star">
            <Burst />
          </div>
          <div className="poster-type">
            NINGUÉM
            <br />
            CRESCE
            <br />
            <em>SOZINHO.</em>
          </div>
          <div className="poster-bottom">
            APOIE QUEM FAZ PERTO DE VOCÊ{" "}
            <span>
              <Arrow />
            </span>
          </div>
        </div>
      </section>
      <div className="ticker">
        <span>
          COMPRE LOCAL <Arrow />
        </span>
        <span>
          FORTALEÇA A REDE <Burst />
        </span>
        <span>
          VALORIZE QUEM FAZ <Arrow />
        </span>
        <span>
          O FUTURO É COLETIVO <Burst />
        </span>
      </div>
      <section id="explorar" className="explore">
        <div className="section-top">
          <div>
            <div className="eyebrow">ENCONTROS QUE MOVIMENTAM</div>
            <h2>
              Tem muita gente
              <br />
              boa fazendo.
            </h2>
          </div>
          <p>
            Descubra negócios, serviços e ideias.
            <br />
            Encontre sua gente. Faça a rede girar.
          </p>
        </div>
        <form className="search">
          <label className="search-input">
            <span>⌕</span>
            <input
              name="q"
              defaultValue={q}
              maxLength={100}
              placeholder="Busque um negócio, serviço ou cidade"
              aria-label="Buscar negócios"
            />
          </label>
          <select
            name="category"
            defaultValue={category}
            aria-label="Categoria"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button className="button">
            Explorar <Arrow />
          </button>
        </form>
        <div className="results-label">
          <span>{total} negócios encontrados</span>
          <span>FEITO POR PESSOAS, PARA PESSOAS</span>
        </div>
        {filtered.length ? (
          <div className="cards">
            {filtered.map((b, i) => (
              <article className="card" key={b.id}>
                <div className={`card-art art-${i % 3}`}>
                  {businessImageUrl(b.facade_path) ? (
                    <img
                      className="facade-photo"
                      src={businessImageUrl(b.facade_path)!}
                      alt={`Fachada de ${b.name}`}
                      loading="lazy"
                    />
                  ) : (
                    <span>{b.name.charAt(0)}</span>
                  )}
                  {businessImageUrl(b.logo_path) && (
                    <img
                      className="business-logo"
                      src={businessImageUrl(b.logo_path)!}
                      alt={`Logo de ${b.name}`}
                      loading="lazy"
                    />
                  )}
                  <small>{b.category}</small>
                </div>
                <div className="card-content">
                  <div className="eyebrow">
                    {b.city} · {b.state}
                  </div>
                  <h3>{b.name}</h3>
                  <BusinessDescription text={b.description} />
                  <div className="contact-links">
                    {contactLinks(b).map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                      >
                        {link.label} <Arrow />
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <span>
              <Burst />
            </span>
            <div>
              <h3>
                {failed
                  ? "A rede está temporariamente indisponível."
                  : q || category
                    ? "Ainda não encontramos esse negócio."
                    : "Uma grande rede começa com o primeiro nó."}
              </h3>
              <p>
                {failed
                  ? "Tente novamente em alguns instantes."
                  : "Seu negócio pode abrir esse caminho. Cadastre-se para aparecer na rede."}
              </p>
              <Link href="/cadastro" className="text-link">
                Cadastre seu negócio <Arrow />
              </Link>
            </div>
          </div>
        )}
        {total > pageSize && (
          <div className="pagination">
            <span>
              Página {page} de {Math.ceil(total / pageSize)}
            </span>
            <div>
              {page > 1 && (
                <Link className="button secondary" href={pageUrl(page - 1)}>
                  Anterior
                </Link>
              )}
              {page * pageSize < total && (
                <Link className="button" href={pageUrl(page + 1)}>
                  Próxima <Arrow />
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
      <section className="manifesto">
        <span className="manifesto-symbol">
          <Arrow />
        </span>
        <div className="eyebrow">MAIS DO QUE UM CATÁLOGO</div>
        <h2>
          Uma escolha pequena.
          <br />
          Um movimento enorme.
        </h2>
        <p>
          Conectamos quem empreende a quem acredita em uma economia mais justa,
          diversa e solidária. Cada compra é uma oportunidade de construir o
          mundo que a gente quer.
        </p>
        <Link href="/cadastro" className="button cream">
          Vamos construir juntos <Arrow />
        </Link>
      </section>
    </main>
  );
}
