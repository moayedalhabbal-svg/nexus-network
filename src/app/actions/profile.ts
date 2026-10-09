"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function completeOnboardingAction(data: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { success: true };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Update main profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      headline: data.headline,
      bio: data.bio,
      location: data.location,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // Optional: Update skills and interests in user_skills / user_interests tables
  // For the sake of simplicity, we just save the core profile fields above, 
  // but a complete implementation would insert into user_skills.

  revalidatePath("/");
  return { success: true };
}
