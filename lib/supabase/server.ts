import { publicSupabaseKey } from "./config";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export function configured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && publicSupabaseKey());
}
export async function supabase() {
  if (!configured()) throw new Error("Configure o Supabase para continuar.");
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publicSupabaseKey(),
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server components cannot write cookies. */
          }
        },
      },
    },
  );
}
