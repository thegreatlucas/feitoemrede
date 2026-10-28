import { z } from "zod";
import { talentAreas, workModes, states } from "./talent-schema";
export const contractTypes = [
  "CLT",
  "Pessoa jurídica (PJ)",
  "Temporário",
  "Estágio",
  "Aprendiz",
  "Freelance",
  "Cooperado",
  "Outro",
] as const;
export function brazilToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (name: string) => parts.find((p) => p.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function defaultJobDeadline() {
  const date = new Date(brazilToday() + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}
export const jobSchema = z
  .object({
    title: z.string().trim().min(3, "Informe o cargo da vaga.").max(120),
    description: z
      .string()
      .trim()
      .min(40, "Descreva as atividades e requisitos (mínimo de 40 caracteres).")
      .max(5000),
    area: z.enum(talentAreas),
    city: z.string().trim().min(2).max(80),
    state: z.enum(states),
    work_mode: z.enum(workModes),
    contract_type: z.enum(contractTypes),
    salary: z.string().trim().max(100).default(""),
    application_email: z
      .union([z.literal(""), z.string().trim().email().max(254)])
      .default(""),
    application_url: z
      .union([
        z.literal(""),
        z
          .url()
          .max(300)
          .refine(
            (value) => value.startsWith("https://"),
            "Use um link HTTPS.",
          ),
      ])
      .default(""),
    expires_on: z.iso.date(),
    is_active: z.boolean(),
    consent: z.literal("on", {
      error: "Confirme as regras para publicar a vaga.",
    }),
  })
  .refine((value) => !!(value.application_email || value.application_url), {
    path: ["application_email"],
    message: "Informe um e-mail ou link para receber candidaturas.",
  });
export type JobPost = {
  id: string;
  owner_id: string;
  business_id: string;
  title: string;
  description: string;
  area: string;
  city: string;
  state: string;
  work_mode: string;
  contract_type: string;
  salary: string;
  application_email: string;
  application_url: string;
  expires_on: string;
  is_active: boolean;
  created_at: string;
  businesses?: { name: string } | null;
};
