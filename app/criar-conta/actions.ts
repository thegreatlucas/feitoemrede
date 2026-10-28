"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { accountSchema, safeReturnTo } from "@/lib/talent-schema";
import { configured, supabase } from "@/lib/supabase/server";
export async function createAccount(
  _previous: { message?: string },
  form: FormData,
): Promise<{ message?: string }> {
  if (!configured())
    return {
      message: "A criação de contas está temporariamente indisponível.",
    };
  const parsed = accountSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { message: parsed.error.issues[0]?.message ?? "Revise os dados." };
  const db = await supabase();
  const { data, error } = await db.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.session)
    return {
      message:
        "Não foi possível criar a conta. Se você já possui acesso, entre pela página de login. Caso contrário, tente novamente mais tarde.",
    };
  revalidatePath("/", "layout");
  redirect(safeReturnTo(form.get("next")));
}
