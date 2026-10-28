import { z } from "zod";
import { businessSchema, credentialsSchema } from "./schema";
export const talentAreas = [
  "Administração",
  "Atendimento e vendas",
  "Comunicação e marketing",
  "Construção e manutenção",
  "Design e criação",
  "Educação",
  "Engenharia",
  "Finanças e contabilidade",
  "Gastronomia",
  "Jurídico",
  "Logística e transportes",
  "Produção e indústria",
  "Recursos humanos",
  "Saúde e cuidados",
  "Serviços gerais",
  "Tecnologia",
  "Turismo e eventos",
  "Outras áreas",
] as const;
export const workModes = ["Presencial", "Híbrido", "Remoto"] as const;
export const states = businessSchema.shape.state.options;
const optionalHttps = z
  .union([
    z.literal(""),
    z
      .url()
      .max(300)
      .refine(
        (value) => value.startsWith("https://"),
        "Use um endereço HTTPS.",
      ),
  ])
  .default("");
export const talentSchema = z.object({
  full_name: z.string().trim().min(3, "Informe seu nome.").max(100),
  headline: z
    .string()
    .trim()
    .min(3, "Informe seu título profissional.")
    .max(120),
  summary: z
    .string()
    .trim()
    .min(20, "Conte um pouco da sua experiência (mínimo de 20 caracteres).")
    .max(2000),
  area: z.enum(talentAreas),
  city: businessSchema.shape.city,
  state: businessSchema.shape.state,
  region: z.string().trim().max(120).default(""),
  work_modes: z
    .array(z.enum(workModes))
    .min(1, "Selecione ao menos uma modalidade de trabalho.")
    .max(3)
    .transform((values) => [...new Set(values)]),
  skills: z.string().trim().max(500).default(""),
  contact_email: z
    .string()
    .trim()
    .email("Informe um e-mail de contato válido.")
    .max(254),
  phone: businessSchema.shape.phone,
  linkedin: optionalHttps.refine(
    (value) => !value || /^https:\/\/(www\.)?linkedin\.com(\/|$)/.test(value),
    "Informe o endereço do seu perfil no LinkedIn.",
  ),
  portfolio: optionalHttps,
  is_active: z.boolean(),
  consent: z.literal("on", {
    error: "Autorize a exibição para pessoas autenticadas.",
  }),
});
export const accountSchema = credentialsSchema
  .extend({
    passwordConfirmation: z.string(),
    consent: z.literal("on", { error: "Aceite os termos de participação." }),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas precisam ser iguais.",
  });
export function safeReturnTo(value: unknown) {
  return typeof value === "string" &&
    [
      "/talentos",
      "/talentos/meu-perfil",
      "/painel",
      "/painel/vagas",
      "/painel/vagas/nova",
    ].includes(value)
    ? value
    : "/painel";
}
