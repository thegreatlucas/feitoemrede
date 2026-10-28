import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import { JobForm } from "@/components/job-form";
import type { JobPost } from "@/lib/job-schema";
export const dynamic = "force-dynamic";
export default async function EditJob({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("/painel/vagas");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const db = await supabase();
  const { data, error } = await db
    .from("job_posts")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error)
    return (
      <main className="form-page">
        <p role="alert">Não foi possível carregar esta vaga.</p>
      </main>
    );
  if (!data) notFound();
  return (
    <main className="form-page wide">
      <div className="eyebrow">OPORTUNIDADE EM MOVIMENTO</div>
      <h1>EDITAR VAGA.</h1>
      <JobForm job={data as JobPost} />
    </main>
  );
}
