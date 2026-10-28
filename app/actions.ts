"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase, configured } from "@/lib/supabase/server";
import { businessSchema } from "@/lib/schema";
function message(path: string, text: string): never {
  redirect(`${path}?message=${encodeURIComponent(text)}`);
}
export async function authenticate(form: FormData) {
  if (!configured())
    message(
      "/entrar",
      "O cadastro será liberado assim que a conexão com o Supabase estiver configurada.",
    );
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    password.length < 10 ||
    password.length > 128
  )
    message(
      "/entrar",
      "Informe um e-mail válido e uma senha de 10 a 128 caracteres.",
    );
  const db = await supabase();
  if (form.get("mode") === "signup") {
    const { error } = await db.auth.signUp({ email, password });
    if (error)
      message(
        "/entrar",
        "Não foi possível criar sua conta. Verifique os dados ou tente mais tarde.",
      );
    message(
      "/entrar",
      "Confira seu e-mail para confirmar a conta. Depois, entre para cadastrar o negócio.",
    );
  }
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
  const { consent, ...values } = parsed.data;
  void consent;
  const { error } = await db
    .from("businesses")
    .insert({ ...values, owner_id: user.id });
  if (error)
    message(
      "/cadastro",
      "Não foi possível salvar. Verifique se você já possui um negócio cadastrado.",
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
