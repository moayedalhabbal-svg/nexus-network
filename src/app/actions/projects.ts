"use server";

import { createClient } from "@/lib/supabase/server";
import { projectSchema, applicationSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createProjectAction(formData: FormData) {
  try {
    const data = {
      title: formData.get("title") as string,
      pitch: formData.get("pitch") as string,
      description: formData.get("description") as string,
      stage: formData.get("stage") as string,
      category: formData.get("category") as string,
      is_private: formData.get("is_private") === "true",
    };

    const validated = projectSchema.parse(data);

    // If in demo mode (no real Supabase), gracefully simulate success
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log("[DEMO MODE] Simulating project creation:", validated);
      revalidatePath("/projects");
      return { success: true, projectId: "demo-id" };
    }

    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Insert project
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        ...validated,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/projects");
    return { success: true, projectId: project.id };
  } catch (error: any) {
    console.error("Project validation error:", error);
    return { success: false, error: error.message || "Invalid data provided" };
  }
}

export async function submitApplicationAction(projectId: string, needId: string, message: string) {
  try {
    const validated = applicationSchema.parse({ project_id: projectId, need_id: needId, message });

    if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log("[DEMO MODE] Simulating application submission");
      return { success: true };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("applications")
      .insert({
        project_id: validated.project_id,
        need_id: validated.need_id,
        applicant_id: user.id,
        message: validated.message,
      });

    if (error) return { success: false, error: error.message };
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Invalid submission" };
  }
}
