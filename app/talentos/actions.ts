"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { talentSchema } from "@/lib/talent-schema";
import { prepareCv } from "@/lib/talent-cv";
export type TalentFormState = { message?: string };
export async function saveTalent(
  _previous: TalentFormState,
  form: FormData,
): Promise<TalentFormState> {
  const user = await requireUser("/talentos/meu-perfil");
  const parsed = talentSchema.safeParse({
    ...Object.fromEntries(form),
    work_modes: form.getAll("work_modes"),
    is_active: form.get("is_active") === "on",
  });
  if (!parsed.success)
    return {
      message: parsed.error.issues[0]?.message ?? "Revise os dados do perfil.",
    };
  let cv: Buffer | null;
  try {
    cv = await prepareCv(form.get("resume"));
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Revise seu currículo.",
    };
  }
  const db = await supabase();
  const { data: previous, error: readError } = await db
    .from("talent_profiles")
    .select("resume_path")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (readError)
    return {
      message: "Não foi possível carregar seu perfil. Tente novamente.",
    };
  if (!previous && !cv)
    return { message: "Envie seu currículo em PDF para concluir o perfil." };
  let path = previous?.resume_path ?? "";
  if (cv) {
    path = `${user.id}/cv-${randomUUID()}.pdf`;
    const { error } = await db.storage.from("talent-cvs").upload(path, cv, {
      contentType: "application/pdf",
      upsert: false,
      cacheControl: "0",
    });
    if (error)
      return {
        message: "Não foi possível enviar o currículo. Tente novamente.",
      };
  }
  const { consent, ...values } = parsed.data;
  void consent;
  const payload = { ...values, resume_path: path };
  const result = previous
    ? await db.from("talent_profiles").update(payload).eq("owner_id", user.id)
    : await db
        .from("talent_profiles")
        .insert({ ...payload, owner_id: user.id });
  if (result.error)
    return {
      message:
        "Não foi possível salvar seu perfil. Seus campos continuam preenchidos; tente novamente.",
    };
  if (cv && previous?.resume_path && previous.resume_path !== path)
    await db.storage.from("talent-cvs").remove([previous.resume_path]);
  revalidatePath("/talentos");
  revalidatePath("/talentos/meu-perfil");
  redirect(
    "/talentos/meu-perfil?message=" +
      encodeURIComponent(
        "Perfil salvo. " +
          (values.is_active
            ? "Pessoas autenticadas já podem encontrar você."
            : "Seu perfil está oculto do banco de talentos."),
      ),
  );
}
export async function deleteTalent() {
  const user = await requireUser("/talentos/meu-perfil");
  const db = await supabase();
  const { data, error } = await db
    .from("talent_profiles")
    .select("resume_path")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error)
    redirect(
      "/talentos/meu-perfil?message=Não%20foi%20possível%20carregar%20seu%20perfil.",
    );
  if (data?.resume_path) {
    const removed = await db.storage
      .from("talent-cvs")
      .remove([data.resume_path]);
    if (removed.error)
      redirect(
        "/talentos/meu-perfil?message=Não%20foi%20possível%20remover%20o%20currículo.%20Tente%20novamente.",
      );
  }
  const deleted = await db
    .from("talent_profiles")
    .delete()
    .eq("owner_id", user.id);
  if (deleted.error)
    redirect(
      "/talentos/meu-perfil?message=Não%20foi%20possível%20remover%20o%20perfil.%20Tente%20novamente.",
    );
  revalidatePath("/talentos");
  revalidatePath("/talentos/meu-perfil");
  redirect("/talentos/meu-perfil?message=Perfil%20e%20currículo%20removidos.");
}
