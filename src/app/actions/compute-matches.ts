"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { matchUserToProject, matchUserToUser } from "@/lib/matching-engine";
import { UserProfile, Project, MatchResult, Skill, Interest } from "@/lib/types";
import { generateTextEmbedding, formatProfileForEmbedding } from "@/lib/embeddings";
import { SEED_USERS, SEED_PROJECTS, CURRENT_USER } from "@/lib/seed-data";

// Helper to map DB row to UserProfile
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNamedValues<T extends { id: string; name: string; category: string }>(values: unknown): T[] {
  if (!Array.isArray(values)) return [] as T[];

  return values
    .map((value) => {
      if (typeof value === 'string') {
        const label = value.trim();
        if (!label) return null;
        return {
          id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          name: label,
          category: 'technical',
        } as T;
      }

      if (value && typeof value === 'object' && 'name' in value && typeof (value as { name?: unknown }).name === 'string') {
        const label = (value as { name: string }).name.trim();
        if (!label) return null;
        return {
          id: (value as { id?: string | number }).id ? String((value as { id?: string | number }).id) : label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          name: label,
          category: (value as { category?: string }).category || 'technical',
        } as T;
      }

      return null;
    })
    .filter(Boolean) as T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbProfileToUser(dbProfile: any): UserProfile {
  return {
    id: dbProfile.id,
    email: '',
    name: dbProfile.full_name || 'NEXUS Member',
    headline: dbProfile.headline || '',
    bio: dbProfile.bio || '',
    avatar: dbProfile.avatar_url || '',
    location: dbProfile.location || 'Remote',
    timezone: dbProfile.timezone || '',
    roles: Array.isArray(dbProfile.roles) ? dbProfile.roles.map(String) : [],
    skills: normalizeNamedValues<Skill>(dbProfile.skills),
    interests: normalizeNamedValues<Interest>(dbProfile.interests),
    intents: Array.isArray(dbProfile.intents) ? dbProfile.intents : ['project'],
    availability: dbProfile.availability || 'flexible',
    collaborationPreferences: Array.isArray(dbProfile.collaboration_preferences) ? dbProfile.collaboration_preferences : ['remote'],
    preferredTeamSize: dbProfile.preferred_team_size || '',
    experience: Array.isArray(dbProfile.experience) ? dbProfile.experience : [],
    education: Array.isArray(dbProfile.education) ? dbProfile.education : [],
    proofOfWork: Array.isArray(dbProfile.proof_of_work) ? dbProfile.proof_of_work : [],
    verifications: [],
    profileVisibility: dbProfile.profile_visibility || 'public',
    searchVisibility: dbProfile.search_visibility ?? true,
    onlineStatus: 'online',
    completionPercentage: dbProfile.completion_percentage || 100,
    joinedAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at
  };
}

export async function computeMatchesAction(userId?: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const demoUserId = (await cookies()).get("nexus-demo-user-id")?.value;
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === "demo" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const authUserId = userId || authUser?.id || demoUserId || (isDemoMode ? CURRENT_USER.id : undefined);

  if (!authUserId) return { success: false, error: "Unauthorized" };

  let currentUserData: Record<string, unknown> | null = null;
  if (isDemoMode) {
    const seedUser = SEED_USERS.find((item) => item.id === authUserId) || CURRENT_USER;
    currentUserData = {
      id: seedUser.id,
      full_name: seedUser.name,
      headline: seedUser.headline,
      bio: seedUser.bio,
      avatar_url: seedUser.avatar,
      location: seedUser.location,
      timezone: seedUser.timezone,
      skills: seedUser.skills.map((skill) => skill.name),
      interests: seedUser.interests.map((interest) => interest.name),
      search_visibility: seedUser.searchVisibility,
      created_at: seedUser.joinedAt,
      updated_at: seedUser.updatedAt,
      embedding: null,
    };
  } else {
    const { data: fetchedUser, error: currentUserErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .single();

    currentUserData = fetchedUser;
    if (currentUserErr || !currentUserData) {
      console.log("Profile missing for auth user, creating default profile.");
      const { data: newProfile, error: insertErr } = await supabase.from('profiles').insert({
        id: authUserId,
        username: `user_${Date.now()}`,
        full_name: 'New User',
        search_visibility: true
      }).select().single();
      
      if (insertErr || !newProfile) {
        console.error("Failed to create default profile", insertErr);
        return { success: false, error: "Profile not found and could not be created." };
      }
      currentUserData = newProfile;
    }
  }

  // 2. Ensure current user has an embedding
  let userEmbedding = currentUserData?.embedding as number[] | string | undefined | null;
  if (!userEmbedding || typeof userEmbedding === 'string') {
    // Need to generate and save it
    const profileText = formatProfileForEmbedding(currentUserData);
    userEmbedding = await generateTextEmbedding(profileText);
    
    // Save it asynchronously (fire and forget)
    const { error: embeddingError } = await supabase.from('profiles').update({ 
      embedding: `[${userEmbedding.join(',')}]`,
      embedding_generated_at: new Date().toISOString()
    }).eq('id', authUserId);

    if (embeddingError) {
      console.error("Failed to save user embedding", embeddingError);
    }
  } else if (Array.isArray(userEmbedding)) {
    // ensure numeric array
  } else {
    userEmbedding = await generateTextEmbedding("Demo User Profile");
  }

  const currentUser = mapDbProfileToUser(currentUserData);

  // 3. Fetch candidates using pgvector
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let candidateProfiles: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let candidateProjects: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let profileVectorMatches: any[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let projectVectorMatches: any[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let needVectorMatches: any[] | undefined;

  if (isDemoMode) {
    candidateProfiles = SEED_USERS.filter((user) => user.id !== authUserId).map((user) => ({
      id: user.id,
      full_name: user.name,
      headline: user.headline,
      bio: user.bio,
      avatar_url: user.avatar,
      location: user.location,
      timezone: user.timezone,
      skills: user.skills,
      interests: user.interests,
      search_visibility: user.searchVisibility,
      created_at: user.joinedAt,
      updated_at: user.updatedAt,
    }));
    candidateProjects = SEED_PROJECTS.map((project) => ({
      ...project,
      owner_id: project.ownerId,
      project_needs: project.needs ?? [],
    }));
  } else {
    const { data: profileMatches } = await supabase.rpc('match_profiles', {
      query_embedding: `[${userEmbedding.join(',')}]`,
      match_threshold: 0.2, // low threshold for initial retrieval
      match_count: 50
    });
    profileVectorMatches = profileMatches ?? [];

    const { data: projectMatches } = await supabase.rpc('match_projects', {
      query_embedding: `[${userEmbedding.join(',')}]`,
      match_threshold: 0.2,
      match_count: 50
    });
    projectVectorMatches = projectMatches ?? [];

    // Call match_project_needs to find matching open roles
    const { data: matchesForNeeds } = await supabase.rpc('match_project_needs', {
      query_embedding: `[${userEmbedding.join(',')}]`,
      match_threshold: 0.2,
      match_count: 50
    });
    needVectorMatches = matchesForNeeds ?? [];

    if (profileVectorMatches && profileVectorMatches.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await supabase.from('profiles').select('*').in('id', profileVectorMatches.map((p: any) => p.id));
      if (data) candidateProfiles = data;
    }

    // Merge unique project IDs from project matching and role matching
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allProjectIds = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectVectorMatches?.forEach((p: any) => allProjectIds.add(p.id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    needVectorMatches?.forEach((n: any) => allProjectIds.add(n.project_id));

    if (allProjectIds.size > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await supabase.from('projects').select('*, project_needs(*)').in('id', Array.from(allProjectIds));
      if (data) candidateProjects = data;
    }

    // Fallback to all if vector search fails (e.g., extensions not installed)
    if (candidateProfiles.length === 0) {
      const { data } = await supabase.from('profiles').select('*').limit(50);
      if (data) candidateProfiles = data;
    }
    
    if (candidateProjects.length === 0) {
      const { data } = await supabase.from('projects').select('*, project_needs(*)').limit(50);
      if (data) candidateProjects = data;
    }
  }

  const projectMatches: Array<{ project: Project; match: MatchResult }> = [];
  for (const p of candidateProjects) {
    const ownerId = p.owner_id ?? p.ownerId;
    if (ownerId === currentUser.id) continue;
    
    // Extract semantic similarity if found via PGVector
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projMatch = projectVectorMatches?.find((v: any) => v.id === p.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const needMatchesForProj = needVectorMatches?.filter((n: any) => n.project_id === p.id) || [];
    
    let maxNeedSimilarity = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    needMatchesForProj.forEach((n: any) => {
      if (n.similarity > maxNeedSimilarity) maxNeedSimilarity = n.similarity;
    });

    const projectSimilarity = projMatch ? projMatch.similarity : 0;
    const maxSimilarity = Math.max(projectSimilarity, maxNeedSimilarity);
    const semanticSimilarity = maxSimilarity > 0 ? maxSimilarity : undefined;
    
    // Map project
    const projectObj: Project = {
      id: p.id,
      ownerId,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const match = matchUserToProject(currentUser, projectObj, semanticSimilarity);
    projectMatches.push({ project: projectObj, match });
  }

  const peopleMatches: Array<{ user: UserProfile; match: MatchResult }> = [];
  for (const target of candidateProfiles) {
    if (target.id === currentUser.id) continue;
    
    // Extract semantic similarity if found via PGVector
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vectorMatch = profileVectorMatches?.find((v: any) => v.id === target.id);
    const semanticSimilarity = vectorMatch ? vectorMatch.similarity : undefined;
    
    const targetUser = mapDbProfileToUser(target);
    const match = matchUserToUser(currentUser, targetUser, semanticSimilarity);
    peopleMatches.push({ user: targetUser, match });
  }

  // Sort by score
  projectMatches.sort((a, b) => b.match.score - a.match.score);
  peopleMatches.sort((a, b) => b.match.score - a.match.score);

  const topProjectMatches = projectMatches.slice(0, 10);
  const topPeopleMatches = peopleMatches.slice(0, 10);

  if (!isDemoMode) {
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
  }

  return {
    success: true,
    projectMatches: topProjectMatches,
    peopleMatches: topPeopleMatches
  };
}


