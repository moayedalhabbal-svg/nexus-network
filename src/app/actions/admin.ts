"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Helper to check if current user is admin
async function checkIsAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return profile?.is_admin === true;
}

// Get admin supabase client with service role for destructive actions
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }
  
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function getAdminUsersAction() {
  if (!(await checkIsAdmin())) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, users: data };
}

export async function getAdminProjectsAction() {
  if (!(await checkIsAdmin())) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles!owner_id(full_name, email:username)') // we don't have email in profiles directly, maybe use username
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, projects: data };
}

export async function getAdminStatsAction() {
  if (!(await checkIsAdmin())) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  
  // Count users
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  // Count projects
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  return { 
    success: true, 
    stats: {
      totalUsers: usersCount || 0,
      totalProjects: projectsCount || 0,
    } 
  };
}

export async function deleteUserAction(userId: string) {
  if (!(await checkIsAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const adminAuthClient = getServiceRoleClient();
    
    // Deleting the user from auth.users will cascade and delete their profile, projects, etc.
    const { error } = await adminAuthClient.auth.admin.deleteUser(userId);
    
    if (error) return { success: false, error: error.message };
    
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteProjectAction(projectId: string) {
  if (!(await checkIsAdmin())) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin");
  return { success: true };
}
