import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import { businessSchema } from "./schema";
/** Auth identity owns the business. Never accept owner_id or status from the form. */
export async function persistBusiness(
  db: SupabaseClient,
  userId: string,
  draft: z.infer<typeof businessSchema>,
) {
  const existing = await db
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();
  if (existing.error) return false;
  if (existing.data) return true;
  const update = await db.auth.updateUser({ data: { business_draft: draft } });
  if (update.error) return false;
  const created = await db
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();
  if (created.error) return false;
  if (created.data) return true;
  // Compatibilidade temporária com o banco anterior. Após a nova migração,
  // INSERT autenticado é revogado e apenas o trigger do Auth faz a gravação.
  const { consent, ...values } = draft;
  void consent;
  const inserted = await db
    .from("businesses")
    .insert({ ...values, owner_id: userId });
  return !inserted.error;
}
