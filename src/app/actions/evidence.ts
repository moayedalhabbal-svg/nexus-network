"use server";

import { SKILLS_DATABASE } from "@/lib/seed-data";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function extractSkillsFromEvidenceAction(title: string, description: string, url: string) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      // Fallback: simple keyword matching
      const text = `${title} ${description} ${url}`.toLowerCase();
      const extracted = SKILLS_DATABASE.filter(s => text.includes(s.name.toLowerCase()));
      return { success: true, skills: extracted.map(s => s.name).slice(0, 5) };
    }

    const { object } = await generateObject({
      model: google("gemini-3.8-flash"),
      schema: z.object({
        skills: z.array(z.string()).describe("List of exact skill names extracted from the evidence. Must match known technologies or domain areas.")
      }),
      prompt: `
Extract up to 5 key professional skills, technologies, or capabilities demonstrated by this evidence.
Do not invent skills. Only extract what is clearly supported by the text.

Title: ${title}
Description: ${description}
URL: ${url}

Return only the skill names.
      `
    });

    return { success: true, skills: object.skills };
  } catch (error) {
    console.error("Failed to extract skills:", error);
    return { success: false, error: "Failed to extract skills" };
  }
}

export async function addProofOfWorkAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;
    const skillsJson = formData.get('skills') as string;
    
    let skills: string[] = [];
    try {
      if (skillsJson) skills = JSON.parse(skillsJson);
    } catch (e) {
      // ignore
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: true, id: `pow-${Date.now()}` };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const source = type === 'github' ? 'GitHub' : type === 'paper' ? 'Research Publication' : 'External';

    const { data, error } = await supabase.from('proof_of_work').insert({
      user_id: user.id,
      title,
      type,
      url,
      description,
      source,
      skills,
      verification_status: 'added_by_you'
    }).select().single();

    if (error) throw error;
    
    return { success: true, id: data.id };
  } catch (error: unknown) {
    console.error("Add PoW error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to add evidence";
    return { success: false, error: errorMessage };
  }
}

export async function removeProofOfWorkAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('proof_of_work')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  const { revalidatePath } = await import("next/cache");
  revalidatePath('/[locale]/profile', 'layout');
  return { success: true };
}
