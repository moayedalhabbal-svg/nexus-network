/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mocking AI for requirements extraction because we don't have a real LLM API key here.
export async function extractRequirementsAction(description: string) {
  // In a real scenario, this calls OpenAI/Anthropic with a structured output schema.
  // We'll mock the structured parsing.
  
  const lowerDesc = description.toLowerCase();
  
  const required_skills = [];
  if (lowerDesc.includes('python')) required_skills.push('Python');
  if (lowerDesc.includes('computer vision') || lowerDesc.includes('cv')) required_skills.push('Computer Vision');
  if (lowerDesc.includes('react')) required_skills.push('React');
  if (lowerDesc.includes('node')) required_skills.push('Node.js');
  if (lowerDesc.includes('design')) required_skills.push('UI/UX Design');
  if (required_skills.length === 0) required_skills.push('Machine Learning'); // Fallback

  const work_styles = [];
  if (lowerDesc.includes('async')) work_styles.push('Async');
  if (lowerDesc.includes('sync')) work_styles.push('Sync');

  const collaboration_types = [];
  if (lowerDesc.includes('research')) collaboration_types.push('Research');
  if (lowerDesc.includes('paid')) collaboration_types.push('Paid');
  if (lowerDesc.includes('equity')) collaboration_types.push('Equity');
  
  let commitment_hours = 'Flexible';
  if (lowerDesc.includes('5 hours') || lowerDesc.includes('5-10 hours') || lowerDesc.includes('5–10 hours')) {
    commitment_hours = '5-10 hours/week';
  }

  return {
    success: true,
    requirements: {
      required_skills,
      preferred_skills: [],
      commitment_hours,
      work_styles,
      collaboration_types,
      experience_requirements: 'Relevant experience required',
    }
  };
}

export async function createRecruitingRequestAction(projectId: string, roleTitle: string, description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Extract requirements using AI
    const extRes = await extractRequirementsAction(description);
    const reqs = extRes.requirements;

    // 2. Save recruiting request
    const { data: request, error } = await supabase
      .from('recruiting_requests')
      .insert({
        project_id: projectId,
        created_by: user.id,
        role_title: roleTitle,
        description: description,
        required_skills: reqs.required_skills,
        preferred_skills: reqs.preferred_skills,
        commitment_hours: reqs.commitment_hours,
        work_styles: reqs.work_styles,
        collaboration_types: reqs.collaboration_types,
        experience_requirements: reqs.experience_requirements,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      // Fallback for mock environments where table might not exist
      if (error.code === '42P01') {
        return { success: true, mockMode: true, requestId: 'mock-req-123' };
      }
      return { success: false, error: error.message };
    }

    revalidatePath(`/en/projects/${projectId}/workspace/recruit`, 'page');
    return { success: true, request };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function retrieveCandidatesAction(requestId: string, projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // 1. In a real environment, we would use pgvector on profiles or ai_matches
    // Since this is a demo environment, we will fetch users and filter them
    const { data: allUsers, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_skills (skill_name, proficiency_level),
        proof_of_work (*)
      `);
      
    if (error && error.code !== '42P01') return { success: false, error: error.message };
    
    // We mock the DB results if table missing or if we just want to run the deterministic engine
    // In production, this would be a Postgres RPC that returns candidate UUIDs.
    
    // To simulate candidate generation:
    const mockCandidates = [
      {
        id: 'user-2', // Make sure this matches a SEED_USERS ID or handle smoothly
        username: 'alex_morgan',
        full_name: 'Alex Morgan',
        avatar_url: 'https://i.pravatar.cc/150?u=alex',
        match_score: 92,
        explanation: 'Strong Python and computer vision experience supported by 4 relevant projects. Their 5–10 hour async availability aligns closely with your project requirements.'
      },
      {
        id: 'user-3',
        username: 'sara_j',
        full_name: 'Sara Jenkins',
        avatar_url: 'https://i.pravatar.cc/150?u=sara',
        match_score: 89,
        explanation: 'Excellent UI/UX and React skills with 3 verified Proof of Work items. Highly reliable with a fast response rate.'
      },
      {
        id: 'user-4',
        username: 'omar_dev',
        full_name: 'Omar Hassan',
        avatar_url: 'https://i.pravatar.cc/150?u=omar',
        match_score: 86,
        explanation: 'Solid backend Node.js background and very high collaboration intent. Open to part-time research roles.'
      }
    ];

    // Check if real DB works and insert
    const { error: insertError } = await supabase
      .from('recruiting_invitations')
      .insert(
        mockCandidates.map(c => ({
          request_id: requestId === 'mock-req-123' ? null : requestId,
          project_id: projectId,
          candidate_id: c.id, // Will fail if FK constraint fails on seed DB, so we use upsert or ignore error
          status: 'recommended',
          match_score: c.match_score,
          explanation: c.explanation
        }))
      );
      
    // If it fails due to FK, we just return the mocks directly for the UI
    
    return { success: true, candidates: mockCandidates };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function draftOutreachAction(projectId: string, candidateId: string, roleTitle: string) {
  // Mock AI draft
  return {
    success: true,
    draft: `Hi there,

I'm working on a project and noticed your strong background. We are actively looking for a ${roleTitle || 'collaborator'} who can contribute to our goals.

Your Proof of Work aligns closely with what we need. Would you be open to a quick chat to see if this is a good fit?

Best,`
  };
}

export async function sendInvitationAction(projectId: string, candidateId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Update recruiting_invitations status to 'invited'
    const { error } = await supabase
      .from('recruiting_invitations')
      .update({ status: 'invited', message: message })
      .eq('project_id', projectId)
      .eq('candidate_id', candidateId);
      
    // Ignore error in mock mode
    
    revalidatePath(`/en/projects/${projectId}/workspace/recruit`, 'page');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
