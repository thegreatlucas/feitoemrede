import { cache } from "react";
import { redirect } from "next/navigation";
import { configured, supabase } from "./supabase/server";
import { safeReturnTo } from "./talent-schema";
export const currentUser = cache(async () => {
  if (!configured()) return null;
  const db = await supabase();
  return (await db.auth.getUser()).data.user;
});
export async function requireUser(next = "/talentos") {
  const user = await currentUser();
  if (!user) redirect("/entrar?next=" + encodeURIComponent(safeReturnTo(next)));
  return user;
}
