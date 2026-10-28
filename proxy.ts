import { publicSupabaseKey } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !publicSupabaseKey())
    return response;
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    publicSupabaseKey(),
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  await db.auth.getUser();
  return response;
}
export const config = {
  matcher: [
    "/painel/:path*",
    "/cadastro",
    "/entrar",
    "/criar-conta",
    "/talentos/:path*",
  ],
};
