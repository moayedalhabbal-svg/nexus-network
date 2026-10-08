"use server";

import { semanticSearch as localSemanticSearch, UnifiedSearchResult } from "@/lib/matching-engine";
import { SEED_PROJECTS, SEED_USERS, SEED_RESEARCH, SEED_MENTORS, SEED_OPPORTUNITIES } from "@/lib/seed-data";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateTextEmbedding } from "@/lib/embeddings";

export async function semanticSearchAction(
  query: string,
  targetType: "all" | "people" | "projects" | "research" | "startups" | "opportunities" | "mentors"
): Promise<UnifiedSearchResult[]> {
  // 1. Fallback for empty or very short queries
  if (!query || query.length < 5 || !process.env.OPENAI_API_KEY) {
    return localSemanticSearch(query, targetType);
  }

  try {
    // 2. Try Vector Search first (V3 Architecture)
    const supabase = await createClient();
    const queryEmbedding = await generateTextEmbedding(query);
    
    // We try to call our RPC functions if they exist
    let vectorResultsFound = false;
    const results: UnifiedSearchResult[] = [];
    
    // Only search people if requested
    if (targetType === 'all' || targetType === 'people') {
      const { data: profileMatches, error: profErr } = await supabase.rpc('match_profiles', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5
      });
      
      if (!profErr && profileMatches && profileMatches.length > 0) {
        vectorResultsFound = true;
        // Fetch full profiles
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: fullProfiles } = await supabase.from('profiles').select('*').in('id', profileMatches.map((p: any) => p.id));
        if (fullProfiles) {
          for (const match of profileMatches) {
            const p = fullProfiles.find(fp => fp.id === match.id);
            if (p) {
              results.push({
                id: p.id,
                type: 'people',
                data: p,
                score: Math.round(match.similarity * 100),
                reason: "Matched semantically via vector similarity."
              });
            }
          }
        }
      }
    }

    // Only search projects if requested
    if (targetType === 'all' || targetType === 'projects' || targetType === 'startups') {
      const { data: projectMatches, error: projErr } = await supabase.rpc('match_projects', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5
      });
      
      if (!projErr && projectMatches && projectMatches.length > 0) {
        vectorResultsFound = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: fullProjects } = await supabase.from('projects').select('*').in('id', projectMatches.map((p: any) => p.id));
        if (fullProjects) {
          for (const match of projectMatches) {
            const p = fullProjects.find(fp => fp.id === match.id);
            if (p) {
              results.push({
                id: p.id,
                type: 'projects',
                data: p,
                score: Math.round(match.similarity * 100),
                reason: "Matched semantically via vector similarity."
              });
            }
          }
        }
      }
    }

    // If we got vector results, return them. 
    if (vectorResultsFound && results.length > 0) {
      return results.sort((a, b) => b.score - a.score);
    }

    // 3. Fallback to V2 Generative Extraction if DB embeddings are empty (e.g. during dev/QA)
    // Build a condensed catalog based on targetType
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
    const generativeResults: UnifiedSearchResult[] = [];
    
    for (const match of object.matches) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null;
      if (match.type === 'projects') data = SEED_PROJECTS.find(p => p.id === match.id);
      else if (match.type === 'people') data = SEED_USERS.find(u => u.id === match.id);
      else if (match.type === 'research') data = SEED_RESEARCH.find(r => r.id === match.id);
      else if (match.type === 'mentors') data = SEED_MENTORS.find(m => m.id === match.id);
      else if (match.type === 'opportunities') data = SEED_OPPORTUNITIES.find(o => o.id === match.id);

      if (data) {
        generativeResults.push({
          id: match.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: match.type as any,
          data,
          score: match.score,
          reason: match.reason
        });
      }
    }

    return generativeResults.sort((a, b) => b.score - a.score);

  } catch (error) {
    console.error("OpenAI Semantic Search Failed, falling back to local:", error);
    return localSemanticSearch(query, targetType);
  }
}
