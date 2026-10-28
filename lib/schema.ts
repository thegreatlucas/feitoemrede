import { z } from "zod";
export const categories = [
  "Alimentação",
  "Arte e cultura",
  "Moda",
  "Serviços",
  "Tecnologia",
  "Saúde e bem-estar",
  "Educação",
  "Outros",
] as const;
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
  consent: z.literal("on"),
});
