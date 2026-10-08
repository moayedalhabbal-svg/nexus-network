"use server";

import { semanticSearch as localSemanticSearch, UnifiedSearchResult } from "@/lib/matching-engine";
import { SEED_PROJECTS, SEED_USERS, SEED_RESEARCH, SEED_MENTORS, SEED_OPPORTUNITIES } from "@/lib/seed-data";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export async function semanticSearchAction(
  query: string,
  targetType: "all" | "people" | "projects" | "research" | "startups" | "opportunities" | "mentors"
): Promise<UnifiedSearchResult[]> {
  // 1. Fallback for empty or very short queries
  if (!query || query.length < 5 || !process.env.OPENAI_API_KEY) {
    return localSemanticSearch(query, targetType);
  }

  try {
    // 2. Build a condensed catalog based on targetType
    // We only send ID and brief description to save tokens
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catalog: any[] = [];
    
    if (targetType === 'all' || targetType === 'projects' || targetType === 'startups') {
      SEED_PROJECTS.forEach(p => catalog.push({ id: p.id, type: 'projects', text: `${p.title}: ${p.pitch}. Categories: ${p.categories.join(', ')}` }));
    }
    if (targetType === 'all' || targetType === 'people') {
      SEED_USERS.forEach(u => catalog.push({ id: u.id, type: 'people', text: `${u.name}: ${u.headline}. Skills: ${u.skills.map(s => s.name).join(', ')}` }));
    }
    if (targetType === 'all' || targetType === 'research') {
      SEED_RESEARCH.forEach(r => catalog.push({ id: r.id, type: 'research', text: `${r.title}. Needs: ${r.skillsNeeded.join(', ')}` }));
    }
    if (targetType === 'all' || targetType === 'mentors') {
      SEED_MENTORS.forEach(m => catalog.push({ id: m.id, type: 'mentors', text: `${m.name}. Expertise: ${m.expertise.join(', ')}` }));
    }
    if (targetType === 'all' || targetType === 'opportunities') {
      SEED_OPPORTUNITIES.forEach(o => catalog.push({ id: o.id, type: 'opportunities', text: `${o.title}. Type: ${o.type}` }));
    }

    // 3. Call OpenAI to find best matches
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        matches: z.array(z.object({
          id: z.string(),
          type: z.string(),
          score: z.number().describe("Match score from 1 to 100"),
          reason: z.string().describe("A short 1-sentence reason why this is a good match for the query")
        }))
      }),
      prompt: `
You are the NEXUS AI Search Engine.
A user is searching for: "${query}"

Here is the condensed catalog of available items:
${JSON.stringify(catalog)}

Find the top matches that best satisfy the user's search query semantically.
Return up to 10 best matches.
If nothing matches well, return an empty array.
      `
    });

    // 4. Map the IDs back to the full data objects
    const results: UnifiedSearchResult[] = [];
    
    for (const match of object.matches) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null;
      if (match.type === 'projects') data = SEED_PROJECTS.find(p => p.id === match.id);
      else if (match.type === 'people') data = SEED_USERS.find(u => u.id === match.id);
      else if (match.type === 'research') data = SEED_RESEARCH.find(r => r.id === match.id);
      else if (match.type === 'mentors') data = SEED_MENTORS.find(m => m.id === match.id);
      else if (match.type === 'opportunities') data = SEED_OPPORTUNITIES.find(o => o.id === match.id);

      if (data) {
        results.push({
          id: match.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: match.type as any,
          data,
          score: match.score,
          reason: match.reason
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);

  } catch (error) {
    console.error("OpenAI Semantic Search Failed, falling back to local:", error);
    return localSemanticSearch(query, targetType);
  }
}
