"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function saveMatchFeedbackAction(
  matchId: string, 
  status: 'relevant' | 'not_relevant', 
  reasons: string[] = []
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from('ai_matches')
      .update({
        feedback_status: status,
        feedback_reasons: reasons,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .eq('user_id', user.id);

    if (error) {
      console.error("Feedback error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/matches");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Feedback error";
    return { success: false, error: errorMessage };
  }
}

export async function explainMatchAction(
  userId: string,
  targetName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reasons: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gaps: any[]
) {
  try {
    // Check if we have an API key, fallback to local generation if not
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OPENAI_API_KEY found, falling back to local generation");
      return fallbackExplainMatch(targetName, reasons, gaps);
    }

    const prompt = `
You are the AI Matchmaker for NEXUS, a platform connecting founders, researchers, and engineers.
Explain to the user why they matched with "${targetName}".
Be concise, enthusiastic, and professional. 

When discussing skills, distinguish between:
- Self-reported skills
- Repository-derived skill signals (from GitHub)
- Owner-confirmed contributions (from completed bounties)
- Other independently verified evidence

Here is the raw match data:
Reasons: ${JSON.stringify(reasons)}
Gaps: ${JSON.stringify(gaps)}

Format the output in clean Markdown. Use bullet points for strengths and potential gaps. Keep it under 150 words.
`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    });

    return { success: true, explanation: text };
  } catch (error) {
    console.error("Failed to generate AI explanation:", error);
    return fallbackExplainMatch(targetName, reasons, gaps);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fallbackExplainMatch(targetName: string, reasons: any[], gaps: any[]) {
  const skillMatches = reasons.filter(r => r.type === 'skill').map(r => r.label);
  const interestMatches = reasons.filter(r => r.type === 'interest').map(r => r.label);
  const intentMatches = reasons.filter(r => r.type === 'intent').map(r => r.label);
  
  let explanation = `**WHY THIS MATCH WITH ${targetName.toUpperCase()}**\n\n`;
  
  if (skillMatches.length > 0) {
    explanation += `**Matched skills:**\n` + skillMatches.map(s => `✓ ${s}`).join('\n') + `\n\n`;
  }
  
  if (interestMatches.length > 0) {
    explanation += `**Shared interests:**\n` + interestMatches.map(i => `✓ ${i}`).join('\n') + `\n\n`;
  }
  
  if (intentMatches.length > 0) {
    explanation += `**Intent:**\n` + intentMatches.map(i => `✓ ${i}`).join('\n') + `\n\n`;
  }
  
  if (gaps && gaps.length > 0) {
    explanation += `**Potential gap:**\n` + gaps.map(g => `△ ${g.label}`).join('\n') + `\n\n`;
  }
  
  return { success: true, explanation };
}
