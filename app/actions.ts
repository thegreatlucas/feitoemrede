"use server";
import {
  prepareImages,
  uploadImages,
  removeImages,
  type ImagePaths,
} from "@/lib/business-images";
import { safeReturnTo } from "@/lib/talent-schema";
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
      "Não foi possível entrar. Verifique seu e-mail e sua senha.",
    );
  revalidatePath("/", "layout");
  redirect(safeReturnTo(form.get("next")));
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  revalidatePath("/", "layout");
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
  const { data: previousData, error: previousError } = await db
    .from("businesses")
    .select("logo_path,facade_path")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (previousError)
    message(
      "/cadastro",
      "Não foi possível carregar as imagens atuais. Tente novamente.",
    );
  const previous = previousData ?? {};
  let images: Awaited<ReturnType<typeof uploadImages>>;
  try {
    images = await uploadImages(
      db,
      user.id,
      await prepareImages(form),
      previous,
      form,
    );
  } catch (error) {
    message(
      "/cadastro",
      error instanceof Error
        ? error.message
        : "Não foi possível enviar as imagens.",
    );
  }
  if (
    !(await persistBusiness(db, user.id, { ...parsed.data, ...images.paths }))
  )
    message(
      "/cadastro",
      "Não foi possível salvar agora. Tente novamente em instantes.",
    );
  try {
    await removeImages(db, images.obsolete);
  } catch {
    message(
      "/cadastro",
      "Dados salvos. Não foi possível remover uma imagem antiga; tente novamente em instantes.",
    );
  }
  revalidatePath("/");
  revalidatePath("/painel");
  redirect("/painel");
}
export async function deleteBusiness() {
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/entrar");
  const previous = (
    await db
      .from("businesses")
      .select("logo_path,facade_path")
      .eq("owner_id", user.id)
      .maybeSingle()
  ).data;
  if (previous)
    try {
      await removeImages(
        db,
        Object.values(previous).filter(
          (path): path is string =>
            typeof path === "string" && path.startsWith(user.id + "/"),
        ),
      );
    } catch {
      message(
        "/painel",
        "Não foi possível remover as imagens. Tente novamente.",
      );
    }
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
    "phone",
    "whatsapp",
    "contact_email",
    "instagram",
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
  let prepared: Awaited<ReturnType<typeof prepareImages>>;
  try {
    prepared = await prepareImages(form);
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Revise as imagens enviadas.",
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
  let paths: ImagePaths = { logo_path: "", facade_path: "" };
  try {
    paths = (await uploadImages(db, data.user.id, prepared, {}, form)).paths;
  } catch {
    redirect(
      "/cadastro?message=" +
        encodeURIComponent(
          "Sua conta e os dados do negócio foram salvos. Não foi possível enviar as imagens; tente novamente.",
        ),
    );
  }
  if (!(await persistBusiness(db, data.user.id, { ...business, ...paths })))
    redirect(
      "/cadastro?message=" +
        encodeURIComponent(
          "Sua conta foi criada. Tente salvar o negócio novamente.",
        ),
    );
  revalidatePath("/");
  revalidatePath("/painel");
  redirect("/painel");
}
