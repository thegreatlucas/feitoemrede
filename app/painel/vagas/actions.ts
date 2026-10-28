"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import { jobSchema, brazilToday } from "@/lib/job-schema";
export async function saveJob(
  _previous: { message?: string },
  form: FormData,
): Promise<{ message?: string }> {
  const user = await requireUser("/painel/vagas");
  const db = await supabase();
  const parsed = jobSchema.safeParse({
    ...Object.fromEntries(form),
    is_active: form.get("is_active") === "on",
  });
  if (!parsed.success)
    return {
      message: parsed.error.issues[0]?.message ?? "Revise os dados da vaga.",
    };
  if (parsed.data.is_active && parsed.data.expires_on < brazilToday())
    return { message: "Escolha uma data de encerramento a partir de hoje." };
  const { data: business, error } = await db
    .from("businesses")
    .select("id,status")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error || !business || business.status !== "approved")
    return {
      message: "É necessário ter uma empresa publicada para anunciar vagas.",
    };
  const id = form.get("job_id");
  if (id && !z.uuid().safeParse(id).success)
    return { message: "Vaga inválida." };
  const { consent, ...values } = parsed.data;
  void consent;
  const result = id
    ? await db
        .from("job_posts")
        .update(values)
        .eq("id", id)
        .eq("owner_id", user.id)
        .select("id")
        .maybeSingle()
    : await db
        .from("job_posts")
        .insert({ ...values, owner_id: user.id, business_id: business.id })
        .select("id")
        .single();
  if (result.error || !result.data)
    return { message: "Não foi possível salvar a vaga. Tente novamente." };
  revalidatePath("/vagas");
  revalidatePath("/painel/vagas");
  revalidatePath("/vagas/" + result.data.id);
  redirect("/painel/vagas?message=Vaga%20salva.");
}
export async function closeJob(form: FormData) {
  const user = await requireUser("/painel/vagas");
  const id = form.get("job_id");
  if (!z.uuid().safeParse(id).success) redirect("/painel/vagas");
  const db = await supabase();
  const { error } = await db
    .from("job_posts")
    .update({ is_active: false })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error)
    redirect(
      "/painel/vagas?message=Não%20foi%20possível%20encerrar%20a%20vaga.",
    );
  revalidatePath("/vagas");
  revalidatePath("/vagas/" + id);
  revalidatePath("/painel/vagas");
  redirect("/painel/vagas?message=Vaga%20encerrada.");
}
export async function deleteJob(form: FormData) {
  const user = await requireUser("/painel/vagas");
  const id = form.get("job_id");
  if (!z.uuid().safeParse(id).success) redirect("/painel/vagas");
  const db = await supabase();
  const { error } = await db
    .from("job_posts")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error)
    redirect(
      "/painel/vagas?message=Não%20foi%20possível%20remover%20a%20vaga.",
    );
  revalidatePath("/vagas");
  revalidatePath("/vagas/" + id);
  revalidatePath("/painel/vagas");
  redirect("/painel/vagas?message=Vaga%20removida.");
}
