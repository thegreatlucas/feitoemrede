"use client";
import { useActionState } from "react";
import Link from "next/link";
import { saveJob } from "@/app/painel/vagas/actions";
import {
  contractTypes,
  defaultJobDeadline,
  type JobPost,
} from "@/lib/job-schema";
import { talentAreas, states, workModes } from "@/lib/talent-schema";
export function JobForm({ job }: { job: JobPost | null }) {
  const [state, action, pending] = useActionState(saveJob, {});
  return (
    <form
      className="form-stack"
      action={action}
      onReset={(event) => event.preventDefault()}
    >
      {state.message && (
        <p className="notice" role="alert">
          {state.message}
        </p>
      )}
      {job && <input type="hidden" name="job_id" value={job.id} />}
      <fieldset disabled={pending}>
        <label>
          Cargo
          <input
            name="title"
            required
            minLength={3}
            maxLength={120}
            defaultValue={job?.title}
          />
        </label>
        <label>
          Atividades e requisitos
          <textarea
            name="description"
            required
            minLength={40}
            maxLength={5000}
            rows={7}
            defaultValue={job?.description}
          />
        </label>
        <label>
          Área
          <select name="area" required defaultValue={job?.area ?? ""}>
            <option value="" disabled>
              Selecione
            </option>
            {talentAreas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Cidade
            <input
              name="city"
              required
              minLength={2}
              maxLength={80}
              defaultValue={job?.city}
            />
          </label>
          <label>
            UF
            <select name="state" required defaultValue={job?.state ?? ""}>
              <option value="" disabled>
                Selecione
              </option>
              {states.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Modalidade
            <select name="work_mode" defaultValue={job?.work_mode}>
              {workModes.map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </label>
          <label>
            Contratação
            <select name="contract_type" defaultValue={job?.contract_type}>
              {contractTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Remuneração ou faixa salarial <small>(opcional)</small>
          <input
            name="salary"
            maxLength={100}
            defaultValue={job?.salary}
            placeholder="Ex.: R$ 3.000 a R$ 4.000 + benefícios"
          />
        </label>
        <label>
          Receber candidaturas por e-mail{" "}
          <small>(informe ao menos um canal)</small>
          <input
            type="email"
            name="application_email"
            maxLength={254}
            defaultValue={job?.application_email}
          />
        </label>
        <label>
          Link para candidatura <small>(opcional, HTTPS)</small>
          <input
            type="url"
            name="application_url"
            maxLength={300}
            defaultValue={job?.application_url}
            placeholder="https://"
          />
        </label>
        <label>
          Receber candidaturas até
          <input
            type="date"
            name="expires_on"
            required
            defaultValue={job?.expires_on ?? defaultJobDeadline()}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={job?.is_active ?? true}
          />
          <span>
            Publicar esta vaga. Desmarque para mantê-la como rascunho.
          </span>
        </label>
        <label className="checkbox">
          <input type="checkbox" name="consent" required />
          <span>
            Confirmo que a oportunidade é real, que posso publicar os contatos
            de candidatura e que os requisitos são profissionais e não
            discriminatórios. Concordo com os{" "}
            <Link href="/privacidade">termos da plataforma</Link>.
          </span>
        </label>
        <button className="button" disabled={pending}>
          {pending ? "Salvando…" : "Salvar vaga"}
        </button>
      </fieldset>
    </form>
  );
}
