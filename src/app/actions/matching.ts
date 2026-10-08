"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  // Mock AI Explainer if no API key
  // Normally you would call OpenAI here
  
  const skillMatches = reasons.filter(r => r.type === 'skill').map(r => r.label);
  const interestMatches = reasons.filter(r => r.type === 'interest').map(r => r.label);
  const intentMatches = reasons.filter(r => r.type === 'intent').map(r => r.label);
  
  let explanation = `**WHY THIS MATCH**\n\n`;
  
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
  
  // Return semantic text format
  return { success: true, explanation };
}
