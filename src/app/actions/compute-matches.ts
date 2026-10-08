"use server";

import { createClient } from "@/lib/supabase/server";
import { matchUserToProject, matchUserToUser } from "@/lib/matching-engine";
import { UserProfile, Project } from "@/lib/types";

// Helper to map DB row to UserProfile
function mapDbProfileToUser(dbProfile: any): UserProfile {
  return {
    id: dbProfile.id,
    email: '',
    name: dbProfile.full_name,
    headline: dbProfile.headline || '',
    bio: dbProfile.bio || '',
    avatar: dbProfile.avatar_url || '',
    location: dbProfile.location || 'Remote',
    timezone: dbProfile.timezone || '',
    roles: [],
    skills: dbProfile.skills || [], // assuming skills are joined or mocked
    interests: dbProfile.interests || [],
    intents: ['project'], // default fallback
    availability: 'flexible',
    collaborationPreferences: ['remote'],
    preferredTeamSize: '',
    experience: [],
    education: [],
    proofOfWork: [],
    verifications: [],
    profileVisibility: 'public',
    searchVisibility: dbProfile.search_visibility ?? true,
    onlineStatus: 'online',
    completionPercentage: 100,
    joinedAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at
  };
}

export async function computeMatchesAction() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { success: false, error: "Unauthorized" };

  // Fetch current user full profile (with skills etc in a real app, here we use demo data for now if we don't have joins)
  // For Phase 8.6 testing, we'll try to get all users and projects
  const { data: profiles } = await supabase.from('profiles').select('*');
  const { data: projectsData } = await supabase.from('projects').select('*, project_needs(*)');

  if (!profiles || !projectsData) {
    return { success: false, error: "Failed to fetch data" };
  }

  const currentUserData = profiles.find(p => p.id === authUser.id);
  if (!currentUserData) return { success: false, error: "Profile not found" };

  // Just a simplified mapping for the algorithm
  const currentUser = mapDbProfileToUser(currentUserData);

  const projectMatches = [];
  for (const p of projectsData) {
    if (p.owner_id === currentUser.id) continue;
    
    // Map project
    const projectObj: Project = {
      id: p.id,
      ownerId: p.owner_id,
      title: p.title,
      pitch: p.pitch,
      description: p.description,
      problem: p.problem || '',
      solution: p.solution || '',
      ownerName: 'Project Owner',
      ownerAvatar: '',
      category: p.category,
      categories: [p.category],
      stage: p.stage,
      fundingStatus: 'bootstrapped',
      collaborationStatus: 'actively_looking',
      visibility: 'public',
      technologies: [],
      needs: (p.project_needs || []).map((n: any) => ({
        id: n.id,
        role: n.role_title,
        commitment: n.commitment,
        compensation: 'equity',
        collaboration: 'remote',
        requiredSkills: [],
        preferredSkills: [],
        description: n.description || ''
      })),
      team: [],
      milestones: [],
      updates: [],
      links: [],
      whatExists: '',
      whatNeeded: '',
      remote: true,
      location: 'Remote',
      createdAt: p.created_at,
      updatedAt: p.created_at,
    };

    const match = matchUserToProject(currentUser, projectObj);
    projectMatches.push({ project: projectObj, match });
  }

  const peopleMatches = [];
  for (const target of profiles) {
    if (target.id === currentUser.id) continue;
    const targetUser = mapDbProfileToUser(target);
    const match = matchUserToUser(currentUser, targetUser);
    peopleMatches.push({ user: targetUser, match });
  }

  // Sort by score
  projectMatches.sort((a, b) => b.match.score - a.match.score);
  peopleMatches.sort((a, b) => b.match.score - a.match.score);

  const topProjectMatches = projectMatches.slice(0, 10);
  const topPeopleMatches = peopleMatches.slice(0, 10);

  // Upsert matches to DB for persistence and feedback
  try {
    const matchRecords = [
      ...topProjectMatches.map(p => ({
        user_id: currentUser.id,
        target_id: p.project.id,
        target_type: 'project',
        score: p.match.score,
        reasons: p.match.reasons,
        gaps: p.match.gaps,
        algorithm_version: p.match.algorithmVersion
      })),
      ...topPeopleMatches.map(p => ({
        user_id: currentUser.id,
        target_id: p.user.id,
        target_type: 'user',
        score: p.match.score,
        reasons: p.match.reasons,
        gaps: p.match.gaps,
        algorithm_version: p.match.algorithmVersion
      }))
    ];

    if (matchRecords.length > 0) {
      await supabase.from('ai_matches').upsert(matchRecords, { onConflict: 'user_id,target_id,target_type' });
    }
  } catch (err) {
    console.error("Failed to persist matches to DB", err);
  }

  // To fetch them back with their generated IDs, we query them
  const { data: savedMatches } = await supabase
    .from('ai_matches')
    .select('*')
    .eq('user_id', currentUser.id);

  // Map IDs back to the frontend objects
  if (savedMatches) {
    for (const p of topProjectMatches) {
      const dbRecord = savedMatches.find(m => m.target_id === p.project.id);
      if (dbRecord) p.match.id = dbRecord.id;
    }
    for (const p of topPeopleMatches) {
      const dbRecord = savedMatches.find(m => m.target_id === p.user.id);
      if (dbRecord) p.match.id = dbRecord.id;
    }
  }

  return {
    success: true,
    projectMatches: topProjectMatches,
    peopleMatches: topPeopleMatches
  };
}
