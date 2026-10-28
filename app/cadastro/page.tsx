import { Arrow, Burst } from "@/components/icons";
import Link from "next/link";
import { createBusiness } from "@/app/actions";
import { categories } from "@/lib/schema";
import { configured, supabase } from "@/lib/supabase/server";
export default async function Cadastro({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const db = configured() ? await supabase() : null;
  const user = db ? (await db.auth.getUser()).data.user : null;
  return (
    <main className="form-page wide">
      <div className="eyebrow">TRABALHO LOCAL. IMPACTO COLETIVO.</div>
      <h1>
        QUEM FAZ
        <br />
        TEM LUGAR AQUI.
      </h1>
      <p>
        Apresente seu negócio. Os cadastros passam por moderação antes de
        aparecer na rede.
      </p>
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
      {!user ? (
        <div className="notice">
          <p>
            {configured()
              ? "Para cadastrar, crie uma conta ou entre."
              : "Estamos preparando a abertura dos cadastros. A conexão com o Supabase ainda precisa ser configurada."}
          </p>
          <Link className="button" href="/entrar">
            Criar conta ou entrar <Arrow />
          </Link>
        </div>
      ) : (
        <form className="form-stack" action={createBusiness}>
          <label>
            Nome do negócio
            <input name="name" required minLength={3} maxLength={100} />
          </label>
          <label>
            O que você faz?
            <textarea
              name="description"
              required
              minLength={20}
              maxLength={1000}
              rows={5}
              placeholder="Conte sua história e apresente seus produtos ou serviços."
            />
          </label>
          <div className="form-row">
            <label>
              Categoria
              <select name="category">
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Cidade
              <input name="city" required minLength={2} maxLength={80} />
            </label>
            <label>
              UF
              <select name="state">
                {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
                  .split(" ")
                  .map((s) => (
                    <option key={s}>{s}</option>
                  ))}
              </select>
            </label>
          </div>
          <label>
            Site ou rede social <small>(opcional, endereço HTTPS)</small>
            <input
              type="url"
              name="website"
              placeholder="https://"
              maxLength={300}
            />
          </label>
          <label className="checkbox">
            <input type="checkbox" name="consent" required />
            <span>
              Autorizo a publicação dos dados deste negócio e concordo com os{" "}
              <Link href="/privacidade">termos de participação</Link>. Declaro
              compromisso com uma rede solidária e respeitosa.
            </span>
          </label>
          <button className="button">
            Enviar para análise <Arrow />
          </button>
          <p className="muted">
            Seu e-mail de acesso não será publicado. Não inclua documentos ou
            informações sensíveis na descrição.
          </p>
        </form>
      )}
    </main>
  );
}
