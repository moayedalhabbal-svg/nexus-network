"use server";

import { createClient } from "@/lib/supabase/server";
import { projectSchema, applicationSchema } from "@/lib/validations";
import { SEED_PROJECTS } from "@/lib/seed-data";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { formatProjectForEmbedding, generateTextEmbedding } from "@/lib/embeddings";

const DEMO_PROJECTS_KEY = "nexus-demo-projects";
const DEMO_APPLICATIONS_KEY = "nexus-demo-applications";

async function getDemoProjects() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(DEMO_PROJECTS_KEY)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveDemoProjects(projects: unknown[]) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_PROJECTS_KEY, JSON.stringify(projects), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
}

async function getDemoApplications() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(DEMO_APPLICATIONS_KEY)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveDemoApplications(applications: unknown[]) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_APPLICATIONS_KEY, JSON.stringify(applications), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
}

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

    // If in demo mode (no real Supabase), gracefully simulate success and persist locally
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const demoUserId = (await cookies()).get("nexus-demo-user-id")?.value || "demo-user";
      const project = {
        id: `demo-project-${Date.now()}`,
        title: validated.title,
        pitch: validated.pitch,
        description: validated.description,
        phase: validated.stage,
        stage: validated.stage,
        category: validated.category,
        categories: [validated.category],
        technologies: [],
        needs: [],
        team: [],
        location: "Remote",
        remote: true,
        visibility: "public",
        ownerId: demoUserId,
        ownerName: "Demo User",
        ownerAvatar: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existing = await getDemoProjects();
      await saveDemoProjects([project, ...existing]);
      revalidatePath("/projects");
      return { success: true, projectId: project.id };
    }

    const supabase = await createClient();
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Ensure profile exists to avoid foreign key violation
    const { ensureProfileAction } = await import("./profile");
    await ensureProfileAction();

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

    // Fire and forget embedding generation
    const projectForEmbedding = {
      title: project.title,
      category: project.category,
      pitch: project.pitch,
      problem: project.problem,
      solution: project.solution,
      description: project.description,
      project_needs: [] // Since we haven't added needs yet, this is empty on creation
    };
    const embeddingText = formatProjectForEmbedding(projectForEmbedding);
    generateTextEmbedding(embeddingText).then(async (embeddingArray) => {
      if (embeddingArray && embeddingArray.length > 0) {
        await supabase.from("projects").update({
          embedding: `[${embeddingArray.join(',')}]`,
          embedding_generated_at: new Date().toISOString()
        }).eq("id", project.id);
      }
    }).catch(err => {
      console.error("Failed to generate embedding for project", err);
    });

    revalidatePath("/projects");
    return { success: true, projectId: project.id };
  } catch (error: unknown) {
    console.error("Project validation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Invalid data provided";
    return { success: false, error: errorMessage };
  }
}

export async function submitApplicationAction(projectId: string, needId: string, message: string) {
  try {
    const validated = applicationSchema.parse({ project_id: projectId, need_id: needId, message });

    if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const demoUserId = (await cookies()).get("nexus-demo-user-id")?.value || "demo-user";
      const existing = await getDemoApplications();
      const app = {
        id: `demo-application-${Date.now()}`,
        projectId,
        needId,
        applicantId: demoUserId,
        message,
        status: "pending",
        score: 92,
        createdAt: new Date().toISOString(),
      };
      await saveDemoApplications([app, ...existing]);
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Invalid submission";
    return { success: false, error: errorMessage };
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
    const { data: newConvo } = await supabase
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

type DemoProject = {
  ownerId?: string;
  [key: string]: unknown;
};

export async function getMyProjectsAction() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const demoUserId = (await cookies()).get("nexus-demo-user-id")?.value;
    if (!demoUserId) return { success: true, projects: [] };
    const projects = await getDemoProjects();
    return {
      success: true,
      projects: projects.filter((project: DemoProject) => project.ownerId === demoUserId),
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: true, projects: [] };

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, projects: data || [] };
}

export async function getAllProjectsAction() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const demoProjects = await getDemoProjects();
    return { success: true, projects: [...demoProjects, ...SEED_PROJECTS] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles!owner_id(full_name, avatar_url)')
    .eq('is_private', false)
    .order('created_at', { ascending: false });
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, projects: data || [] };
}
