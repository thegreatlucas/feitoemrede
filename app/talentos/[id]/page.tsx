import { Arrow } from "@/components/icons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import type { TalentProfile } from "@/lib/talent-cv";
export const dynamic = "force-dynamic";
export default async function TalentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const db = await supabase();
  const { data, error } = await db
    .from("talent_profiles")
    .select("*")
    .eq("owner_id", id)
    .maybeSingle();
  if (error)
    return (
      <main className="form-page">
        <p role="alert">Não foi possível carregar o perfil. Tente novamente.</p>
      </main>
    );
  if (!data) notFound();
  const profile = data as TalentProfile;
  return (
    <main className="form-page wide">
      <Link className="text-link" href="/talentos">
        Voltar aos talentos
      </Link>
      <div className="eyebrow talent-profile-area">{profile.area}</div>
      <h1 className="talent-name">{profile.full_name}</h1>
      <h2>{profile.headline}</h2>
      <p>
        {profile.city} · {profile.state}
        {profile.region ? " · " + profile.region : ""}
      </p>
      <div className="talent-tags">
        {profile.work_modes.map((mode) => (
          <span key={mode}>{mode}</span>
        ))}
      </div>
      {!profile.is_active && (
        <p className="notice">
          Perfil oculto. Apenas você pode acessar estes dados e o currículo.
        </p>
      )}
      <section className="talent-bio">
        <h2>Experiência e objetivos</h2>
        <p>{profile.summary}</p>
        {profile.skills && (
          <>
            <h2>Habilidades</h2>
            <p>{profile.skills}</p>
          </>
        )}
      </section>
      <section className="notice">
        <h2>Vamos conversar?</h2>
        <p>
          Use estes contatos exclusivamente para oportunidades profissionais.
        </p>
        <div className="contact-links">
          <a href={"mailto:" + encodeURIComponent(profile.contact_email)}>
            Enviar e-mail <Arrow />
          </a>
          {/^\+55[1-9][0-9]{9,10}$/.test(profile.phone) && (
            <>
              <a
                href={"https://wa.me/" + profile.phone.slice(1)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp <Arrow />
              </a>
              <a href={"tel:" + profile.phone}>
                Ligar <Arrow />
              </a>
            </>
          )}
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <Arrow />
            </a>
          )}
          {profile.portfolio && (
            <a
              href={profile.portfolio}
              target="_blank"
              rel="noopener noreferrer"
            >
              Portfólio <Arrow />
            </a>
          )}
        </div>
        <a className="button" href={`/talentos/${id}/curriculo`}>
          Baixar currículo PDF <Arrow />
        </a>
      </section>
      {user.id === id && (
        <Link className="text-link" href="/talentos/meu-perfil">
          Editar meu perfil <Arrow />
        </Link>
      )}
    </main>
  );
}
