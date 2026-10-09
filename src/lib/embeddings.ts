import { embed } from "ai";
import { google } from "@ai-sdk/google";

export async function generateTextEmbedding(text: string): Promise<number[]> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set. Generating mock embedding (zeros).");
    return new Array(768).fill(0);
  }

  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: text,
    });
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return zeros as a fallback to avoid crashing entirely, though ideally we'd queue a retry
    return new Array(768).fill(0);
  }
}

// Format profile into a structured string for semantic retrieval
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatProfileForEmbedding(profile: any): string {
  const parts = [];
  if (profile.full_name) parts.push(`Name: ${profile.full_name}`);
  if (profile.headline) parts.push(`Headline: ${profile.headline}`);
  if (profile.bio) parts.push(`Bio: ${profile.bio}`);
  
  if (profile.skills && profile.skills.length > 0) {
    // Handling case where skills is array of strings or array of objects
    const skillsList = typeof profile.skills[0] === 'string' 
      ? profile.skills.join(', ')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : profile.skills.map((s: any) => s.name).join(', ');
    parts.push(`Skills: ${skillsList}`);
  }
  
  if (profile.interests && profile.interests.length > 0) {
    const interestsList = typeof profile.interests[0] === 'string'
      ? profile.interests.join(', ')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : profile.interests.map((i: any) => i.name).join(', ');
    parts.push(`Interests: ${interestsList}`);
  }
  
  return parts.join('\n');
}

// Format project into a structured string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatProjectForEmbedding(project: any): string {
  const parts = [];
  if (project.title) parts.push(`Title: ${project.title}`);
  if (project.category) parts.push(`Category: ${project.category}`);
  if (project.pitch) parts.push(`Pitch: ${project.pitch}`);
  if (project.problem) parts.push(`Problem: ${project.problem}`);
  if (project.solution) parts.push(`Solution: ${project.solution}`);
  if (project.description) parts.push(`Description: ${project.description}`);
  
  if (project.project_needs && project.project_needs.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const needs = project.project_needs.map((n: any) => n.role_title).join(', ');
    parts.push(`Looking for: ${needs}`);
  }
  
  return parts.join('\n');
}
