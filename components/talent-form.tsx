"use client";
import { Arrow } from "@/components/icons";
import { useActionState } from "react";
import Link from "next/link";
import { saveTalent } from "@/app/talentos/actions";
import { talentAreas, states, workModes } from "@/lib/talent-schema";
import type { TalentProfile } from "@/lib/talent-cv";
export function TalentForm({
  profile,
  email,
}: {
  profile: TalentProfile | null;
  email: string;
}) {
  const [state, action, pending] = useActionState(saveTalent, {});
  return (
    <form
      action={action}
      className="form-stack"
      onReset={(event) => event.preventDefault()}
      data-clarity-mask="true"
    >
      {state.message && (
        <p className="notice" role="alert">
          {state.message}
        </p>
      )}
      <fieldset disabled={pending}>
        <legend>Seu perfil profissional</legend>
        <label>
          Nome completo
          <input
            name="full_name"
            required
            minLength={3}
            maxLength={100}
            defaultValue={profile?.full_name}
            autoComplete="name"
          />
        </label>
        <label>
          Título profissional
          <input
            name="headline"
            required
            minLength={3}
            maxLength={120}
            defaultValue={profile?.headline}
            placeholder="Ex.: Analista de marketing, eletricista, assistente administrativo"
          />
        </label>
        <label>
          Área de atuação
          <select name="area" defaultValue={profile?.area ?? ""} required>
            <option value="" disabled>
              Selecione sua área
            </option>
            {talentAreas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </label>
        <label>
          Apresente sua experiência
          <textarea
            name="summary"
            required
            minLength={20}
            maxLength={2000}
            rows={5}
            defaultValue={profile?.summary}
            placeholder="Conte sobre suas experiências e o tipo de oportunidade que procura."
          />
        </label>
        <label>
          Habilidades <small>(separe por vírgula)</small>
          <input
            name="skills"
            maxLength={500}
            defaultValue={profile?.skills}
            placeholder="Ex.: atendimento, Excel, organização de eventos"
          />
        </label>
        <div className="form-row">
          <label>
            Cidade
            <input
              name="city"
              required
              minLength={2}
              maxLength={80}
              defaultValue={profile?.city}
              autoComplete="address-level2"
            />
          </label>
          <label>
            UF
            <select name="state" required defaultValue={profile?.state ?? ""}>
              <option value="" disabled>
                Selecione
              </option>
              {states.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Região de interesse <small>(opcional)</small>
          <input
            name="region"
            maxLength={120}
            defaultValue={profile?.region}
            placeholder="Ex.: Grande São Paulo, ABC, Zona Norte"
          />
        </label>
        <div>
          <p className="field-title">Modalidades que você aceita</p>
          <div className="work-options">
            {workModes.map((mode) => (
              <label className="checkbox" key={mode}>
                <input
                  type="checkbox"
                  name="work_modes"
                  value={mode}
                  defaultChecked={profile?.work_modes.includes(mode)}
                />
                <span>{mode}</span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>
      <fieldset disabled={pending}>
        <legend>Contato e currículo</legend>
        <p className="muted">
          Estes dados e o currículo ficam acessíveis somente a pessoas que
          entrarem na plataforma. Evite documentos pessoais, endereço
          residencial completo e informações sensíveis.
        </p>
        <label>
          E-mail profissional para contato
          <input
            type="email"
            name="contact_email"
            required
            maxLength={254}
            defaultValue={profile?.contact_email ?? email}
            autoComplete="email"
          />
        </label>
        <label>
          Telefone ou WhatsApp <small>(opcional)</small>
          <input
            type="tel"
            name="phone"
            maxLength={30}
            defaultValue={profile?.phone}
            placeholder="(11) 99999-9999"
          />
        </label>
        <label>
          LinkedIn <small>(opcional)</small>
          <input
            type="url"
            name="linkedin"
            maxLength={300}
            defaultValue={profile?.linkedin}
            placeholder="https://www.linkedin.com/in/seu-perfil"
          />
        </label>
        <label>
          Site ou portfólio <small>(opcional)</small>
          <input
            type="url"
            name="portfolio"
            maxLength={300}
            defaultValue={profile?.portfolio}
            placeholder="https://"
          />
        </label>
        <label>
          {profile ? "Substituir currículo" : "Seu currículo"}{" "}
          <small>(PDF de até 2 MB, sem senha, até 20 páginas)</small>
          <input
            type="file"
            name="resume"
            accept="application/pdf"
            required={!profile}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.setCustomValidity(
                file && file.size > 2000000
                  ? "Envie um PDF de até 2 MB."
                  : file && file.type !== "application/pdf"
                    ? "Envie um arquivo PDF."
                    : "",
              );
              event.currentTarget.reportValidity();
            }}
          />
        </label>
        {profile && (
          <a
            className="text-link"
            href={`/talentos/${profile.owner_id}/curriculo`}
          >
            Baixar currículo atual <Arrow />
          </a>
        )}
        <label className="checkbox">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={profile?.is_active ?? true}
          />
          <span>
            Disponibilizar meu perfil no banco de talentos. Se desmarcar, apenas
            você poderá acessá-lo.
          </span>
        </label>
        <label className="checkbox">
          <input type="checkbox" name="consent" required />
          <span>
            Autorizo o acesso aos dados deste perfil e ao currículo por pessoas
            autenticadas, para oportunidades profissionais, e concordo com os{" "}
            <Link href="/privacidade">
              termos de participação e privacidade
            </Link>
            .
          </span>
        </label>
        <button className="button" disabled={pending}>
          {pending ? "Salvando…" : "Salvar meu perfil"}
        </button>
      </fieldset>
    </form>
  );
}
