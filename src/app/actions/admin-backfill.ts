"use server";

import { createClient } from "@/lib/supabase/server";
import { generateTextEmbedding } from "@/lib/embeddings";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Helper to create a service role client to bypass RLS for backfilling
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

export async function backfillEmbeddingsAction(
  ignoredProjectIds: string[] = [],
  ignoredProfileIds: string[] = []
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Verify Admin Status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (!profile?.is_admin) {
      return { success: false, error: "Unauthorized - Admins only" };
    }

    const adminClient = getServiceRoleClient();
    let updatedCount = 0;
    const errors: string[] = [];

    // 1. Process Projects
    let projectsQuery = adminClient
      .from("projects")
      .select("id, title, pitch, technologies, needs")
      .is("embedding", null);

    if (ignoredProjectIds.length > 0) {
      projectsQuery = projectsQuery.not("id", "in", `(${ignoredProjectIds.join(",")})`);
    }

    const { data: missingProjects, error: fetchProjectsErr } = await projectsQuery.limit(50);

    if (fetchProjectsErr) {
      errors.push(`Failed to fetch projects: ${fetchProjectsErr.message}`);
    }

    if (missingProjects && missingProjects.length > 0) {
      for (const project of missingProjects) {
        try {
          const techs = project.technologies || [];
          const needs = project.needs || [];
          const textToEmbed = `${project.title} ${project.pitch} ${techs.join(" ")} ${needs.join(" ")}`;
          
          const embedding = await generateTextEmbedding(textToEmbed);
          const timestamp = new Date().toISOString();
          
          if (embedding && embedding.length === 768) {
            const { error: updateErr } = await adminClient
              .from("projects")
              .update({ embedding, embedding_generated_at: timestamp })
              .eq("id", project.id);
              
            if (updateErr) {
              errors.push(`Project ${project.id} update failed: ${updateErr.message}`);
              ignoredProjectIds.push(project.id);
            } else {
              updatedCount++;
            }
          } else {
            errors.push(`Project ${project.id} embedding generation failed or bad dimensionality.`);
            ignoredProjectIds.push(project.id);
          }
        } catch (err) {
          errors.push(`Project ${project.id} failed: ${err}`);
          ignoredProjectIds.push(project.id);
        }
      }
    }

    // 2. Process Profiles
    let profilesQuery = adminClient
      .from("profiles")
      .select("id, full_name, bio, skills, interests")
      .is("embedding", null);

    if (ignoredProfileIds.length > 0) {
      profilesQuery = profilesQuery.not("id", "in", `(${ignoredProfileIds.join(",")})`);
    }

    const { data: missingProfiles, error: fetchProfilesErr } = await profilesQuery.limit(50);

    if (fetchProfilesErr) {
      errors.push(`Failed to fetch profiles: ${fetchProfilesErr.message}`);
    }

    if (missingProfiles && missingProfiles.length > 0) {
      for (const prof of missingProfiles) {
        try {
          const skills = prof.skills || [];
          const interests = prof.interests || [];
          const textToEmbed = `${prof.full_name} ${prof.bio || ""} ${skills.join(" ")} ${interests.join(" ")}`;
          
          const embedding = await generateTextEmbedding(textToEmbed);
          const timestamp = new Date().toISOString();
          
          if (embedding && embedding.length === 768) {
            const { error: updateErr } = await adminClient
              .from("profiles")
              .update({ embedding, embedding_generated_at: timestamp })
              .eq("id", prof.id);
              
            if (updateErr) {
              errors.push(`Profile ${prof.id} update failed: ${updateErr.message}`);
              ignoredProfileIds.push(prof.id);
            } else {
              updatedCount++;
            }
          } else {
            errors.push(`Profile ${prof.id} embedding generation failed or bad dimensionality.`);
            ignoredProfileIds.push(prof.id);
          }
        } catch (err) {
          errors.push(`Profile ${prof.id} failed: ${err}`);
          ignoredProfileIds.push(prof.id);
        }
      }
    }

    const fetchFailed = !!fetchProjectsErr || !!fetchProfilesErr;
    let hasMoreStatus: boolean | "unknown" = false;
    
    if (fetchFailed) {
      hasMoreStatus = "unknown";
    } else {
      hasMoreStatus = (missingProjects?.length === 50 || missingProfiles?.length === 50);
    }

    revalidatePath("/admin");
    return { 
      success: true, 
      updated: updatedCount, 
      hasMore: hasMoreStatus,
      fetchFailed,
      errors,
      failedProjectIds: ignoredProjectIds,
      failedProfileIds: ignoredProfileIds
    };

  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
