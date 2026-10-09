"use server";

import { semanticSearch as localSemanticSearch, UnifiedSearchResult } from "@/lib/matching-engine";
import { createClient } from "@/lib/supabase/server";
import { generateTextEmbedding } from "@/lib/embeddings";

export async function semanticSearchAction(
  query: string,
  targetType: "all" | "people" | "projects" | "research" | "startups" | "opportunities" | "mentors"
): Promise<UnifiedSearchResult[]> {
  // 1. Fallback for empty or very short queries
  if (!query || query.length < 5 || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
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

    // 3. Fallback to V2 local deterministic search if vector search fails or yields no results
    // We explicitly DO NOT send the entire database catalog to an LLM here for performance and privacy.
    return localSemanticSearch(query, targetType);

  } catch (error) {
    console.error("OpenAI Semantic Search Failed, falling back to local:", error);
    return localSemanticSearch(query, targetType);
  }
}
