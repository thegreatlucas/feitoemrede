import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import { businessSchema } from "./schema";
/** Auth identity owns the business. Never accept owner_id or status from the form. */
export async function persistBusiness(
  db: SupabaseClient,
  userId: string,
  draft: z.infer<typeof businessSchema> & {
    logo_path?: string;
    facade_path?: string;
  },
) {
  const update = await db.auth.updateUser({ data: { business_draft: draft } });
  if (update.error) return false;
  const created = await db
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();
  if (created.error) return false;
  if (created.data) return true;
  return false;
}
