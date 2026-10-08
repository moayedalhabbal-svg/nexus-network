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

export async function acceptApplicationAction(applicationId: string, role: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 1. Get the application
  const { data: application, error: appErr } = await supabase
    .from("applications")
    .select("*, projects(id, owner_id, title)")
    .eq("id", applicationId)
    .single();

  if (appErr || !application) return { success: false, error: "Application not found" };

  // 2. Verify owner
  if (application.projects.owner_id !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  // 3. Update application status
  await supabase
    .from("applications")
    .update({ status: 'accepted' })
    .eq("id", applicationId);

  // 4. Add to project_members
  await supabase
    .from("project_members")
    .upsert({
      project_id: application.project_id,
      user_id: application.applicant_id,
      role: role
    });

  // 5. Connect to Collaboration Space (Conversation)
  // Check if a conversation already exists for this project
  const { data: existingConvo } = await supabase
    .from("conversations")
    .select("id")
    .eq("project_id", application.project_id)
    .single();

  let conversationId;

  if (existingConvo) {
    conversationId = existingConvo.id;
  } else {
    // Create new group conversation for the project
    const { data: newConvo, error: convErr } = await supabase
      .from("conversations")
      .insert({
        is_group: true,
        project_id: application.project_id,
        context_message: `Welcome to the collaboration space for ${application.projects.title}`
      })
      .select()
      .single();
      
    if (newConvo) {
      conversationId = newConvo.id;
      // Add the owner to the conversation
      await supabase.from("conversation_members").insert({
        conversation_id: conversationId,
        user_id: user.id
      });
    }
  }

  if (conversationId) {
    // Add applicant to the conversation
    await supabase.from("conversation_members").upsert({
      conversation_id: conversationId,
      user_id: application.applicant_id
    });

    // Send system message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id, // Using owner as sender for now, could be a system ID
      content: `I've accepted your application! You joined this project through NEXUS matching. Welcome to the team!`,
    });
  }

  return { success: true };
}
