import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/en/onboarding"; // default redirect to onboarding

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } else {
      // Return with error param
      return NextResponse.redirect(new URL(`/en/login?error=Invalid verification code`, requestUrl.origin));
    }
  }

  // If there's no code, redirect to login
  return NextResponse.redirect(new URL("/en/login", requestUrl.origin));
}
