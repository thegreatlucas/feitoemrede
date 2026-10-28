import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
};
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user)
    return NextResponse.redirect(
      new URL("/entrar?next=%2Ftalentos", request.url),
      { headers: privateHeaders },
    );
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new Response("Currículo não encontrado.", {
      status: 404,
      headers: privateHeaders,
    });
  const db = await supabase();
  const { data, error } = await db
    .from("talent_profiles")
    .select("resume_path")
    .eq("owner_id", id)
    .maybeSingle();
  if (error)
    return new Response("Não foi possível carregar o currículo.", {
      status: 503,
      headers: privateHeaders,
    });
  if (!data)
    return new Response("Currículo não encontrado.", {
      status: 404,
      headers: privateHeaders,
    });
  const file = await db.storage.from("talent-cvs").download(data.resume_path);
  if (file.error || !file.data)
    return new Response("Currículo indisponível.", {
      status: 404,
      headers: privateHeaders,
    });
  return new Response(file.data.stream(), {
    headers: {
      ...privateHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="curriculo.pdf"',
    },
  });
}
