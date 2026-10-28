import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token_hash = params.get("token_hash");
  const type = params.get("type");
  if (token_hash && type === "signup") {
    const db = await supabase();
    const { error } = await db.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (!error) return NextResponse.redirect(new URL("/painel", request.url));
  }
  return NextResponse.redirect(
    new URL("/entrar?message=Link%20inválido%20ou%20expirado.", request.url),
  );
}
