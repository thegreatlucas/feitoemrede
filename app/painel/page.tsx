import { pageMetadata } from "@/lib/metadata";
import { Arrow, Burst } from "@/components/icons";
import Link from "next/link";
import { redirect } from "next/navigation";
import { configured, supabase } from "@/lib/supabase/server";
import { deleteBusiness, logout } from "@/app/actions";
export const dynamic = "force-dynamic";
export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  if (!configured()) redirect("/entrar");
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/entrar");
  const { data, error } = await db
    .from("businesses")
    .select("id,name,status,description")
    .eq("owner_id", user.id)
    .maybeSingle();
  const { message } = await searchParams;
  return (
    <main className="form-page">
      <div className="eyebrow">SEU ESPAÇO NA REDE</div>
      <h1>MEU NEGÓCIO.</h1>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {error ? (
        <p role="alert">
          Não foi possível carregar seu cadastro. Tente novamente.
        </p>
      ) : data ? (
        <article className="notice">
          <h2>{data.name}</h2>
          <p>
            Status:{" "}
            <strong>
              {{
                pending: "Em análise",
                approved: "Publicado",
                rejected: "Não aprovado",
              }[data.status as string] ?? data.status}
            </strong>
          </p>
          {data.status === "pending" && (
            <p>
              Seu cadastro foi salvo e está aguardando a atualização da
              publicação automática.
            </p>
          )}
          <p>{data.description}</p>
          <p>
            <Link className="button" href="/cadastro">
              Editar dados e contatos <Arrow />
            </Link>
          </p>
          <p>
            <Link className="button secondary" href="/painel/vagas">
              Gerenciar vagas da empresa <Arrow />
            </Link>
          </p>
          <p>
            Você também pode remover o negócio do catálogo. A remoção é
            permanente.
          </p>
          <form action={deleteBusiness}>
            <button className="button secondary">Remover meu cadastro</button>
          </form>
        </article>
      ) : (
        <>
          <p>Vamos apresentar seu trabalho para a comunidade?</p>
          <Link className="button" href="/cadastro">
            Cadastrar meu negócio <Arrow />
          </Link>
        </>
      )}
      <form action={logout} className="logout">
        <button className="text-link">
          Sair da conta <Arrow />
        </button>
      </form>
    </main>
  );
}

export const metadata = pageMetadata(
  "Meu negócio",
  "Gerencie as informações do seu negócio na rede.",
  "/painel",
  true,
);
