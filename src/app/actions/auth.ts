"use server";

import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl, isDemoModeEnabled } from "@/lib/runtime-mode";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (isDemoModeEnabled()) {
    // Demo mode handles login entirely client side
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (isDemoModeEnabled()) {
    return { success: true };
  }

  const baseUrl = getAppBaseUrl();

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${baseUrl}/auth/callback?next=/en/onboarding`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function logoutAction() {
  if (isDemoModeEnabled()) {
    return { success: true };
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/");
  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (isDemoModeEnabled()) {
    return { success: true };
  }

  const baseUrl = getAppBaseUrl();

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/en/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
