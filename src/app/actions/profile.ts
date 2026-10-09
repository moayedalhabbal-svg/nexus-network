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

export async function ensureProfileAction() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { success: true };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Try with authenticated client first (works if RLS policy allows it)
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || 'NEXUS User',
      search_visibility: true,
    });

    if (insertError) {
      // Fallback: Create admin client to bypass RLS for insert if service key is available
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const adminSupabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        await adminSupabase.from('profiles').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || 'NEXUS User',
          search_visibility: true,
        });
      } else {
        console.error("Failed to ensure profile: RLS blocked insert and no service key available.");
      }
    }
  }

  return { success: true };
}
