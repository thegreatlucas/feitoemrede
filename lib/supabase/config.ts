/** Only public credentials belong in the application client. Never use service_role. */
export function publicSupabaseKey(
  env: Record<string, string | undefined> = process.env,
) {
  return (
    env.NEXT_PUBLIC_ANON?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}
