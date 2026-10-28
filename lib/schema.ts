import { z } from "zod";
export const categories = [
  "Alimentação",
  "Agricultura e agroecologia",
  "Arquitetura e design",
  "Arte e cultura",
  "Artesanato",
  "Beleza e estética",
  "Casa e decoração",
  "Comércio e varejo",
  "Comunicação e marketing",
  "Construção e reformas",
  "Cooperativas e economia solidária",
  "Educação",
  "Esporte e lazer",
  "Eventos",
  "Jurídico e contabilidade",
  "Livros e papelaria",
  "Moda",
  "Pets",
  "Saúde e bem-estar",
  "Serviços",
  "Tecnologia",
  "Transporte e entregas",
  "Turismo e hospedagem",
  "Outros",
] as const;
const publicPhone = z
  .string()
  .trim()
  .max(30)
  .default("")
  .transform((value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return value ? "invalid" : "";
    if (digits.length === 10 || digits.length === 11) return "+55" + digits;
    if (
      (digits.length === 12 || digits.length === 13) &&
      digits.startsWith("55")
    )
      return "+" + digits;
    return "invalid";
  })
  .refine(
    (value) => value === "" || /^\+55[1-9][0-9]{9,10}$/.test(value),
    "Informe um número brasileiro com DDD.",
  );
export const businessSchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().min(20).max(1000),
  category: z.enum(categories),
  city: z.string().trim().min(2).max(80),
  state: z.enum([
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ]),
  website: z.union([
    z.literal(""),
    z
      .url()
      .max(300)
      .refine((v) => new URL(v).protocol === "https:", "Use um endereço HTTPS"),
  ]),
  phone: publicPhone,
  whatsapp: publicPhone,
  contact_email: z
    .union([z.literal(""), z.string().trim().email().max(254)])
    .default(""),
  instagram: z
    .string()
    .trim()
    .max(31)
    .default("")
    .transform((value) => value.replace(/^@/, ""))
    .refine(
      (value) => value === "" || /^[a-zA-Z0-9._]{1,30}$/.test(value),
      "Informe apenas o usuário do Instagram, sem o endereço do site.",
    ),
  consent: z.literal("on"),
});

export const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(128),
});
export const signupSchema = businessSchema
  .extend({
    email: z.string().trim().email().max(254),
    password: z.string().min(10).max(128),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas precisam ser iguais.",
  });
