"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
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

  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function logoutAction() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { success: true };
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath("/");
  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
