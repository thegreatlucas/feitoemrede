"use server";
import { redirect } from "next/navigation";
import { persistBusiness } from "@/lib/business-registration";
import { publicSupabaseKey } from "@/lib/supabase/config";
import { revalidatePath } from "next/cache";
import { supabase, configured } from "@/lib/supabase/server";
import { businessSchema, credentialsSchema, signupSchema } from "@/lib/schema";
function message(path: string, text: string): never {
  redirect(`${path}?message=${encodeURIComponent(text)}`);
}
export async function authenticate(form: FormData) {
  if (!configured())
    message(
      "/entrar",
      "O cadastro será liberado assim que a conexão com o Supabase estiver configurada.",
    );
  const parsed = credentialsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    message(
      "/entrar",
      "Informe um e-mail válido e uma senha de 10 a 128 caracteres.",
    );
  const { email, password } = parsed.data;
  const db = await supabase();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error)
    message(
      "/entrar",
      "Não foi possível entrar. Verifique suas credenciais e a confirmação do e-mail.",
    );
  redirect("/painel");
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  redirect("/");
}
export async function createBusiness(form: FormData) {
  if (!configured())
    message(
      "/cadastro",
      "O cadastro será liberado após a configuração do Supabase.",
    );
  const parsed = businessSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    message(
      "/cadastro",
      "Revise os campos, use um site HTTPS e aceite a publicação dos dados.",
    );
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/entrar");
  if (!(await persistBusiness(db, user.id, parsed.data)))
    message(
      "/cadastro",
      "Não foi possível ativar o negócio agora. Seus dados foram guardados; tente novamente em instantes.",
    );
  revalidatePath("/painel");
  redirect("/painel");
}
export async function deleteBusiness() {
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/entrar");
  const { error } = await db
    .from("businesses")
    .delete()
    .eq("owner_id", user.id);
  if (error) message("/painel", "Não foi possível remover o negócio.");
  revalidatePath("/");
  revalidatePath("/painel");
}

export type RegistrationState = {
  message?: string;
  values?: Record<string, string>;
};
export async function registerBusiness(
  _previous: RegistrationState,
  form: FormData,
): Promise<RegistrationState> {
  const values: Record<string, string> = {};
  for (const key of [
    "name",
    "description",
    "category",
    "city",
    "state",
    "website",
    "email",
    "consent",
  ])
    values[key] = String(form.get(key) ?? "").slice(0, 1000);
  const fail = (message: string): RegistrationState => ({ message, values });
  if (!configured())
    return fail(
      "O cadastro está temporariamente indisponível. Tente novamente em instantes.",
    );
  if (String(form.get("company_url") ?? ""))
    return fail("Não foi possível enviar o cadastro.");
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return fail(
      parsed.error.issues[0]?.message ?? "Revise os campos do cadastro.",
    );
  // Não crie uma conta inacessível caso o provedor ainda exija confirmação.
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
      {
        headers: { apikey: publicSupabaseKey() },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok)
      return fail(
        "Não foi possível conectar ao cadastro. Tente novamente em instantes.",
      );
    const settings = await response.json();
    if (settings.mailer_autoconfirm !== true)
      return fail(
        "Estamos ajustando a liberação de novas contas. Tente novamente em instantes.",
      );
  } catch {
    return fail(
      "O cadastro está temporariamente indisponível. Seus dados continuam preenchidos.",
    );
  }
  const { email, password, passwordConfirmation, ...business } = parsed.data;
  void passwordConfirmation;
  const db = await supabase();
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { data: { business_draft: business } },
  });
  if (error || !data.session || !data.user)
    return fail(
      "Não foi possível concluir agora. Se você já tem conta, entre pela página de login. Caso contrário, tente novamente em alguns instantes.",
    );
  if (!(await persistBusiness(db, data.user.id, business)))
    redirect(
      "/cadastro?message=" +
        encodeURIComponent(
          "Sua conta foi criada e seus dados foram guardados. Tente salvar o negócio novamente.",
        ),
    );
  revalidatePath("/painel");
  redirect("/painel");
}
