// NEXUS - AI Matching Engine
// Implements multi-dimensional matching with transparent scoring

import type {
  UserProfile, Project, MatchResult, MatchReason, MatchGap,
  ResearchOpportunity, MentorProfile, Opportunity,
} from './types';
import { SEED_USERS, SEED_PROJECTS, SEED_RESEARCH, SEED_MENTORS, SEED_OPPORTUNITIES } from './seed-data';

// ─── Matching Configuration ─────────────────────────────────────────

interface MatchWeights {
  skill: number;
  interest: number;
  intent: number;
  domain: number;
  availability: number;
  experience: number;
  location: number;
  complementarity: number;
}

const DEFAULT_WEIGHTS: MatchWeights = {
  skill: 0.30,
  interest: 0.20,
  intent: 0.15,
  domain: 0.10,
  availability: 0.10,
  experience: 0.05,
  location: 0.05,
  complementarity: 0.05,
};

// ─── Skill Matching ─────────────────────────────────────────────────

function calculateSkillOverlap(userSkills: string[], targetSkills: string[]): number {
  if (targetSkills.length === 0) return 0.5; // neutral if no target skills
  const normalizedUser = userSkills.map(s => s.toLowerCase());
  const normalizedTarget = targetSkills.map(s => s.toLowerCase());
  const matches = normalizedTarget.filter(s => normalizedUser.includes(s));
  return matches.length / normalizedTarget.length;
}

function getMatchedSkills(userSkills: string[], targetSkills: string[]): string[] {
  const normalizedUser = userSkills.map(s => s.toLowerCase());
  return targetSkills.filter(s => normalizedUser.includes(s.toLowerCase()));
}

function getComplementarySkills(userSkills: string[], targetNeeds: string[]): string[] {
  const normalizedUser = userSkills.map(s => s.toLowerCase());
  return targetNeeds.filter(s => normalizedUser.includes(s.toLowerCase()));
}

function getMissingSkills(userSkills: string[], targetSkills: string[]): string[] {
  const normalizedUser = userSkills.map(s => s.toLowerCase());
  return targetSkills.filter(s => !normalizedUser.includes(s.toLowerCase()));
}

// ─── Interest Matching ──────────────────────────────────────────────

function calculateInterestOverlap(userInterests: string[], targetInterests: string[]): number {
  if (targetInterests.length === 0 || userInterests.length === 0) return 0.3;
  const normalizedUser = userInterests.map(s => s.toLowerCase());
  const normalizedTarget = targetInterests.map(s => s.toLowerCase());
  const matches = normalizedTarget.filter(s => normalizedUser.includes(s));
  return Math.min(matches.length / Math.min(normalizedTarget.length, 3), 1);
}

// ─── Intent Matching ────────────────────────────────────────────────

function calculateIntentAlignment(userIntents: string[], targetType: string): number {
  const intentMap: Record<string, string[]> = {
    project: ['project', 'collaborator', 'cofounder', 'team'],
    research: ['research', 'collaborator', 'academic'],
    startup: ['cofounder', 'startup_job', 'team', 'project'],
    mentor: ['mentee', 'project'],
    investment: ['investment', 'business_partnership'],
  };

  const relevantIntents = intentMap[targetType] || ['project', 'collaborator'];
  const matches = userIntents.filter(i => relevantIntents.includes(i));
  return matches.length > 0 ? Math.min(matches.length / 2, 1) : 0.1;
}

// ─── Availability Matching ──────────────────────────────────────────

function calculateAvailabilityMatch(userAvail: string, targetAvail: string): number {
  const availOrder = ['not_available', '5hrs_week', '10hrs_week', '20hrs_week', 'weekends', 'flexible', 'full_time', 'open_now'];
  const userIdx = availOrder.indexOf(userAvail);
  const targetIdx = availOrder.indexOf(targetAvail);

  if (userAvail === 'not_available') return 0;
  if (userAvail === 'flexible' || userAvail === 'open_now') return 1;
  if (userIdx === targetIdx) return 1;
  if (Math.abs(userIdx - targetIdx) <= 1) return 0.8;
  if (userIdx > targetIdx) return 0.7;
  return 0.4;
}

// ─── Granular Collaboration Matching ─────────────────────────────────

function calculateCommitmentCompatibility(userHours?: string, minHours?: string, maxHours?: string, prefHours?: string): number {
  if (!userHours && !minHours && !maxHours && !prefHours) return 0; // No signal
  if (!userHours) return 0; // User has no preference

  const u = parseInt(userHours);
  
  if (minHours) {
    const min = parseInt(minHours);
    if (u < min) return -1; // Incompatible
  }
  
  if (maxHours) {
    const max = parseInt(maxHours);
    if (u > max) return -1; // Incompatible
  }
  
  if (prefHours) {
    const pref = parseInt(prefHours);
    if (u === pref) return 1.0;
    if (Math.abs(u - pref) <= 5) return 0.8;
    return 0.5;
  }
  
  return 0.8; // Compatible with min/max but no specific preference
}

function calculateArrayOverlap(userVals?: string[], targetVals?: string[]): number {
  if (!userVals || userVals.length === 0) return 0;
  if (!targetVals || targetVals.length === 0) return 0;
  
  const matches = userVals.filter(v => targetVals.includes(v));
  if (matches.length === 0) return -1; // Explicit mismatch
  
  return matches.length / Math.min(userVals.length, targetVals.length);
}

// ─── Complementarity Score ──────────────────────────────────────────

function calculateComplementarity(userSkills: string[], projectNeeds: string[]): number {
  if (projectNeeds.length === 0) return 0.5;
  const normalizedUser = userSkills.map(s => s.toLowerCase());
  const fillableNeeds = projectNeeds.filter(n => normalizedUser.includes(n.toLowerCase()));
  return fillableNeeds.length / projectNeeds.length;
}

// ─── Build Match Reasons ────────────────────────────────────────────

function buildMatchReasons(
  user: UserProfile,
  matchedSkills: string[],
  matchedInterests: string[],
  intentScore: number,
  availScore: number,
  complementarySkills: string[],
): MatchReason[] {
  const reasons: MatchReason[] = [];

  matchedSkills.forEach(skill => {
    reasons.push({
      type: 'skill',
      label: skill,
      strength: 'strong',
    });
  });

  matchedInterests.forEach(interest => {
    reasons.push({
      type: 'interest',
      label: interest,
      strength: 'moderate',
    });
  });

  if (intentScore > 0.5) {
    reasons.push({
      type: 'intent',
      label: `Actively looking for ${user.intents.slice(0, 2).join(' and ')}`,
      strength: intentScore > 0.8 ? 'strong' : 'moderate',
    });
  }

  if (availScore > 0.7) {
    reasons.push({
      type: 'availability',
      label: `Available ${user.availability.replace(/_/g, ' ')}`,
      strength: 'moderate',
    });
  }

  complementarySkills.forEach(skill => {
    reasons.push({
      type: 'complementary',
      label: `Can fill need: ${skill}`,
      strength: 'strong',
    });
  });

  return reasons;
}

function buildMatchGaps(missingSkills: string[]): MatchGap[] {
  return missingSkills.slice(0, 3).map(skill => ({
    type: 'skill' as const,
    label: `Also needs: ${skill}`,
  }));
}

// ─── User → Project Matching ────────────────────────────────────────

export function matchUserToProject(user: UserProfile, project: Project): MatchResult {
  const userSkillNames = user.skills.map(s => s.name);
  const userInterestNames = user.interests.map(i => i.name);

  // Aggregate project skill requirements
  const projectSkills = [
    ...project.technologies,
    ...project.needs.flatMap(n => [...n.requiredSkills, ...n.preferredSkills]),
  ];
  const uniqueProjectSkills = [...new Set(projectSkills)];

  // Category to interest mapping
  const categoryInterestMap: Record<string, string> = {
    ai: 'Artificial Intelligence',
    climate: 'Climate Change',
    renewable_energy: 'Renewable Energy',
    robotics: 'Robotics',
    healthcare: 'Healthcare Innovation',
    education: 'Education Technology',
    fintech: 'Financial Technology',
    social_impact: 'Social Impact',
    mobility: 'Smart Mobility',
    agriculture: 'AgriTech',
    biotech: 'Biotechnology',
  };
  const projectInterests = project.categories
    .map(c => categoryInterestMap[c])
    .filter(Boolean);

  // Calculate component scores
  const skillScore = calculateSkillOverlap(userSkillNames, uniqueProjectSkills);
  const interestScore = calculateInterestOverlap(userInterestNames, projectInterests);
  const intentScore = calculateIntentAlignment(user.intents, 'project');
  const domainScore = Math.max(skillScore, interestScore) * 0.8;

  const projectCommitment = project.needs[0]?.commitment || '10hrs_week';
  const availScore = calculateAvailabilityMatch(user.availability, projectCommitment);

  const complementarySkillsNeeded = project.needs.flatMap(n => n.requiredSkills);
  const complementarityScore = calculateComplementarity(userSkillNames, complementarySkillsNeeded);

  // Experience score (simplified)
  const experienceScore = user.experience.length > 0 ? 0.7 : 0.4;

  // Location score
  const locationScore = project.remote ? 0.9 : (user.location === project.location ? 1 : 0.3);

  // Weighted final score
  let rawScore =
    skillScore * DEFAULT_WEIGHTS.skill +
    interestScore * DEFAULT_WEIGHTS.interest +
    intentScore * DEFAULT_WEIGHTS.intent +
    domainScore * DEFAULT_WEIGHTS.domain +
    availScore * DEFAULT_WEIGHTS.availability +
    experienceScore * DEFAULT_WEIGHTS.experience +
    locationScore * DEFAULT_WEIGHTS.location +
    complementarityScore * DEFAULT_WEIGHTS.complementarity;

  // Granular collaboration compatibility
  const commitmentCompatibility = calculateCommitmentCompatibility(user.commitmentHours, project.minimumCommitmentHours, project.maximumCommitmentHours, project.preferredCommitmentHours);
  const workStyleCompatibility = calculateArrayOverlap(user.workStyles, project.workStyles);
  const collabTypeCompatibility = calculateArrayOverlap(user.collaborationTypes, project.collaborationTypes);
  const expectationCompatibility = calculateArrayOverlap(user.collaborationExpectations, project.collaborationExpectations);

  let collabBonus = 0;
  if (commitmentCompatibility > 0) collabBonus += commitmentCompatibility * 0.05;
  if (workStyleCompatibility > 0) collabBonus += workStyleCompatibility * 0.05;
  if (collabTypeCompatibility > 0) collabBonus += collabTypeCompatibility * 0.05;
  if (expectationCompatibility > 0) collabBonus += expectationCompatibility * 0.05;
  
  // Penalties if explicit mismatch (-1)
  if (commitmentCompatibility < 0) collabBonus -= 0.10;
  if (workStyleCompatibility < 0) collabBonus -= 0.05;
  if (collabTypeCompatibility < 0) collabBonus -= 0.05;

  // Evidence Bonus
  let totalEvidenceMatches = 0;
  uniqueProjectSkills.forEach(reqSkill => {
    const evidenceCount = (user.proofOfWork || []).filter(pow => pow.skills?.includes(reqSkill)).length;
    if (evidenceCount > 0) totalEvidenceMatches++;
  });
  const evidenceBonus = (totalEvidenceMatches / Math.max(uniqueProjectSkills.length, 1)) * 0.15; // Up to 15% bonus
  
  rawScore += evidenceBonus + collabBonus;

  // Normalize to 0-100
  const score = Math.min(Math.round(rawScore * 100), 99);

  // Build reasons and gaps
  const matchedSkills = getMatchedSkills(userSkillNames, uniqueProjectSkills);
  const matchedInterests = getMatchedSkills(userInterestNames, projectInterests);
  const complementarySkills = getComplementarySkills(userSkillNames, complementarySkillsNeeded);
  const missingSkills = getMissingSkills(userSkillNames, uniqueProjectSkills);

  const reasons = buildMatchReasons(user, matchedSkills, matchedInterests, intentScore, availScore, complementarySkills);
  
  if (totalEvidenceMatches > 0) {
    reasons.push({
      type: 'skill',
      label: `Experience supported by ${totalEvidenceMatches} evidence-backed projects/skills`,
      strength: 'strong'
    });
  }

  if (commitmentCompatibility > 0.5) {
    reasons.push({ type: 'availability', label: `Aligned on time commitment`, strength: 'moderate' });
  }
  if (workStyleCompatibility > 0) {
    reasons.push({ type: 'availability', label: `Compatible work styles`, strength: 'moderate' });
  }
  if (collabTypeCompatibility > 0) {
    reasons.push({ type: 'intent', label: `Matching collaboration type goals`, strength: 'strong' });
  }
  if (expectationCompatibility > 0) {
    reasons.push({ type: 'intent', label: `Aligned on project duration/expectations`, strength: 'strong' });
  }

  return {
    id: `match-${user.id}-${project.id}`,
    targetType: 'project',
    targetId: project.id,
    score,
    reasons,
    gaps: buildMatchGaps(missingSkills),
    skillMatch: Math.round(skillScore * 100),
    interestMatch: Math.round(interestScore * 100),
    intentMatch: Math.round(intentScore * 100),
    domainMatch: Math.round(domainScore * 100),
    availabilityMatch: Math.round(availScore * 100),
    experienceMatch: Math.round(experienceScore * 100),
    locationMatch: Math.round(locationScore * 100),
    complementarityScore: Math.round(complementarityScore * 100),
    algorithmVersion: 'v1.0-demo',
    createdAt: '2024-01-01T00:00:00.000Z',
  };
}

// ─── User → User Matching ───────────────────────────────────────────

export function matchUserToUser(user: UserProfile, target: UserProfile): MatchResult {
  const userSkillNames = user.skills.map(s => s.name);
  const targetSkillNames = target.skills.map(s => s.name);
  const userInterestNames = user.interests.map(i => i.name);
  const targetInterestNames = target.interests.map(i => i.name);

  // For person-to-person, we want SIMILARITY of interests but COMPLEMENTARITY of skills
  const interestSimilarity = calculateInterestOverlap(userInterestNames, targetInterestNames);

  // Skill complementarity: do they have different but useful skills?
  const differentSkills = targetSkillNames.filter(s => !userSkillNames.map(us => us.toLowerCase()).includes(s.toLowerCase()));
  const skillComplementarity = differentSkills.length / Math.max(targetSkillNames.length, 1);

  // Intent compatibility
  const intentPairs: Record<string, string[]> = {
    cofounder: ['cofounder', 'project', 'team'],
    mentor: ['mentee'],
    mentee: ['mentor'],
    research: ['research', 'collaborator'],
    investment: ['cofounder', 'project'],
    project: ['project', 'collaborator', 'cofounder'],
    collaborator: ['collaborator', 'project', 'research'],
  };

  let intentScore = 0;
  for (const intent of user.intents) {
    const compatibleIntents = intentPairs[intent] || [];
    if (target.intents.some(ti => compatibleIntents.includes(ti))) {
      intentScore = Math.max(intentScore, 0.9);
    }
  }

  const availScore = calculateAvailabilityMatch(user.availability, target.availability);

  const sharedInterests = userInterestNames.filter(i =>
    targetInterestNames.map(ti => ti.toLowerCase()).includes(i.toLowerCase())
  );

  // Evidence Bonus
  let evidenceMatches = 0;
  sharedInterests.forEach(interest => {
      // Just a proxy: if they have evidence for shared things, give a small bonus
      const count = (user.proofOfWork || []).filter(pow => pow.description?.toLowerCase().includes(interest.toLowerCase())).length;
      if (count > 0) evidenceMatches++;
  });
  differentSkills.forEach(skill => {
      const count = (user.proofOfWork || []).filter(pow => pow.skills?.includes(skill)).length;
      if (count > 0) evidenceMatches++;
  });
  const totalRelevantFactors = sharedInterests.length + differentSkills.length;
  const evidenceBonus = totalRelevantFactors > 0 ? (evidenceMatches / totalRelevantFactors) * 0.10 : 0;

  // Granular collaboration compatibility
  const commitmentCompatibility = calculateCommitmentCompatibility(user.commitmentHours, target.commitmentHours, target.commitmentHours, target.commitmentHours);
  const workStyleCompatibility = calculateArrayOverlap(user.workStyles, target.workStyles);
  const collabTypeCompatibility = calculateArrayOverlap(user.collaborationTypes, target.collaborationTypes);
  const expectationCompatibility = calculateArrayOverlap(user.collaborationExpectations, target.collaborationExpectations);

  let collabBonus = 0;
  if (commitmentCompatibility > 0) collabBonus += commitmentCompatibility * 0.05;
  if (workStyleCompatibility > 0) collabBonus += workStyleCompatibility * 0.05;
  if (collabTypeCompatibility > 0) collabBonus += collabTypeCompatibility * 0.05;
  if (expectationCompatibility > 0) collabBonus += expectationCompatibility * 0.05;
  
  // Penalties if explicit mismatch (-1)
  if (commitmentCompatibility < 0) collabBonus -= 0.10;
  if (workStyleCompatibility < 0) collabBonus -= 0.05;
  if (collabTypeCompatibility < 0) collabBonus -= 0.05;

  // Weighted score
  let rawScore =
    skillComplementarity * 0.25 +
    interestSimilarity * 0.30 +
    intentScore * 0.25 +
    availScore * 0.10 +
    0.1; // base
    
  rawScore += evidenceBonus + collabBonus;

  const score = Math.min(Math.round(rawScore * 100), 99);

  const reasons: MatchReason[] = [];

  sharedInterests.forEach(interest => {
    reasons.push({ type: 'interest', label: interest, strength: 'strong' });
  });

  differentSkills.slice(0, 3).forEach(skill => {
    reasons.push({ type: 'complementary', label: `Brings: ${skill}`, strength: 'moderate' });
  });

  if (evidenceMatches > 0) {
    reasons.push({ type: 'skill', label: `Skills supported by ${evidenceMatches} pieces of evidence`, strength: 'strong' });
  }

  if (intentScore > 0.5) {
    reasons.push({ type: 'intent', label: `Both interested in ${user.intents[0]?.replace(/_/g, ' ')}`, strength: 'strong' });
  }

  if (commitmentCompatibility > 0.5) {
    reasons.push({ type: 'availability', label: `Aligned on time commitment`, strength: 'moderate' });
  }
  if (workStyleCompatibility > 0) {
    reasons.push({ type: 'availability', label: `Compatible work styles`, strength: 'moderate' });
  }
  if (collabTypeCompatibility > 0) {
    reasons.push({ type: 'intent', label: `Matching collaboration type goals`, strength: 'strong' });
  }
  if (expectationCompatibility > 0) {
    reasons.push({ type: 'intent', label: `Aligned on project duration/expectations`, strength: 'strong' });
  }

  return {
    id: `match-${user.id}-${target.id}`,
    targetType: 'user',
    targetId: target.id,
    score,
    reasons,
    gaps: [],
    skillMatch: Math.round((1 - skillComplementarity) * 100),
    interestMatch: Math.round(interestSimilarity * 100),
    intentMatch: Math.round(intentScore * 100),
    domainMatch: Math.round(interestSimilarity * 80),
    availabilityMatch: Math.round(availScore * 100),
    experienceMatch: 70,
    locationMatch: 70,
    complementarityScore: Math.round(skillComplementarity * 100),
    algorithmVersion: 'v1.0-demo',
    createdAt: '2024-01-01T00:00:00.000Z',
  };
}

// ─── Get Recommendations ────────────────────────────────────────────

export function getProjectRecommendations(user: UserProfile, limit = 10): (Project & { match: MatchResult })[] {
  const matches = SEED_PROJECTS
    .filter(p => p.ownerId !== user.id && p.collaborationStatus !== 'completed' && p.collaborationStatus !== 'paused')
    .map(project => ({
      ...project,
      match: matchUserToProject(user, project),
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);

  return matches;
}

export function getPeopleRecommendations(user: UserProfile, limit = 10): (UserProfile & { match: MatchResult })[] {
  const matches = SEED_USERS
    .filter(u => u.id !== user.id)
    .map(target => ({
      ...target,
      match: matchUserToUser(user, target),
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);

  return matches;
}

export function getResearchRecommendations(user: UserProfile, limit = 5): (ResearchOpportunity & { matchScore: number })[] {
  const userSkillNames = user.skills.map(s => s.name);

  return SEED_RESEARCH
    .filter(r => r.status === 'open')
    .map(research => {
      const skillOverlap = calculateSkillOverlap(userSkillNames, research.skillsNeeded);
      const intentBonus = user.intents.includes('research') ? 0.2 : 0;
      const score = Math.min(Math.round((skillOverlap * 0.7 + intentBonus + 0.1) * 100), 99);
      return { ...research, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function getMentorRecommendations(user: UserProfile, limit = 5): (MentorProfile & { matchScore: number })[] {
  const userInterestNames = user.interests.map(i => i.name);

  return SEED_MENTORS
    .filter(m => m.userId !== user.id)
    .map(mentor => {
      const topicOverlap = calculateInterestOverlap(
        userInterestNames,
        mentor.topics.map(t => t.toLowerCase()),
      );
      const expertiseOverlap = calculateInterestOverlap(
        user.skills.map(s => s.name),
        mentor.expertise,
      );
      const intentBonus = user.intents.includes('mentee') ? 0.2 : 0;
      const score = Math.min(Math.round((topicOverlap * 0.4 + expertiseOverlap * 0.3 + intentBonus + 0.1) * 100), 99);
      return { ...mentor, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function getOpportunityRecommendations(user: UserProfile, limit = 5): (Opportunity & { matchScore: number })[] {
  const userInterestNames = user.interests.map(i => i.name.toLowerCase());

  const categoryInterestMap: Record<string, string> = {
    ai: 'artificial intelligence',
    climate: 'climate change',
    renewable_energy: 'renewable energy',
    robotics: 'robotics',
    healthcare: 'healthcare innovation',
    education: 'education technology',
    fintech: 'financial technology',
    social_impact: 'social impact',
  };

  return SEED_OPPORTUNITIES
    .map(opp => {
      const oppInterests = opp.categories.map(c => categoryInterestMap[c] || c);
      const overlap = oppInterests.filter(oi => userInterestNames.includes(oi)).length;
      const score = Math.min(Math.round((overlap / Math.max(oppInterests.length, 1)) * 80 + 20), 99);
      return { ...opp, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

// ─── Find People for Project ────────────────────────────────────────

export function findPeopleForProject(project: Project, limit = 10): (UserProfile & { match: MatchResult })[] {


  return SEED_USERS
    .filter(u => !project.team.some(t => t.userId === u.id))
    .map(candidate => ({
      ...candidate,
      match: matchUserToProject(candidate, project),
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);
}

// ─── Natural Language Search (Demo) ─────────────────────────────────

export interface UnifiedSearchResult {
  id: string;
  type: 'people' | 'projects' | 'research' | 'startups' | 'opportunities' | 'mentors';
  data: unknown;
  score: number;
  reason: string;
}

export function semanticSearch(query: string, requestedType: 'all' | 'people' | 'projects' | 'research' | 'startups' | 'opportunities' | 'mentors' = 'all'): UnifiedSearchResult[] {
  const queryLower = query.toLowerCase();
  
  // 1. Semantic Entity Extraction
  let targetType = requestedType;
  if (requestedType === 'all') {
    if (queryLower.includes('people') || queryLower.includes('someone') || queryLower.includes('engineers') || queryLower.includes('founders') || queryLower.includes('designers')) {
      targetType = 'people';
    } else if (queryLower.includes('research')) {
      targetType = 'research';
    } else if (queryLower.includes('mentor') || queryLower.includes('advice')) {
      targetType = 'mentors';
    } else if (queryLower.includes('startup') || queryLower.includes('startups')) {
      targetType = 'startups';
    } else if (queryLower.includes('opportunit') || queryLower.includes('jobs')) {
      targetType = 'opportunities';
    } else if (queryLower.includes('project')) {
      targetType = 'projects';
    }
  }

  // 2. Keyword Extraction
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2 && !['find', 'looking', 'for', 'who', 'want', 'to', 'in', 'and', 'with', 'have'].includes(t));
  
  const results: UnifiedSearchResult[] = [];

  // Helper to calculate score and reason
  const evaluate = (entityText: string, exactMatches: string[], baseScore = 0): { score: number, reason: string } => {
    let score = baseScore;
    const matchedKeywords: string[] = [];
    
    queryTerms.forEach(term => {
      if (entityText.includes(term)) {
        score += 10;
        matchedKeywords.push(term);
      }
    });

    exactMatches.forEach(match => {
      if (queryLower.includes(match.toLowerCase())) {
        score += 25;
        matchedKeywords.push(match.toLowerCase());
      }
    });

    const uniqueMatches = Array.from(new Set(matchedKeywords));
    let reason = "Matched based on general relevance.";
    if (uniqueMatches.length > 0) {
      reason = `Recommended because of relevance to: ${uniqueMatches.slice(0, 3).join(', ')}.`;
    }
    return { score, reason };
  };

  // ── People
  if (targetType === 'all' || targetType === 'people') {
    SEED_USERS.forEach(user => {
      const text = [user.name, user.headline, user.bio, ...user.skills.map(s => s.name), ...user.interests.map(i => i.name), user.location, ...user.roles, ...user.intents].join(' ').toLowerCase();
      const exact = [...user.skills.map(s => s.name), ...user.interests.map(i => i.name)];
      const { score, reason } = evaluate(text, exact);
      if (score > 0) results.push({ id: user.id, type: 'people', data: user, score, reason });
    });
  }

  // ── Projects & Startups
  if (targetType === 'all' || targetType === 'projects' || targetType === 'startups') {
    SEED_PROJECTS.forEach(project => {
      if (targetType === 'startups' && project.stage === 'idea') return; // basic heuristic
      const text = [project.title, project.pitch, project.problem, project.solution, project.description, ...project.technologies, ...project.categories, project.location, ...project.needs.flatMap(n => [...n.requiredSkills, n.role])].join(' ').toLowerCase();
      const exact = [...project.technologies, ...project.categories];
      const { score, reason } = evaluate(text, exact);
      if (score > 0) results.push({ id: project.id, type: 'projects', data: project, score, reason });
    });
  }

  // ── Research
  if (targetType === 'all' || targetType === 'research') {
    SEED_RESEARCH.forEach(research => {
      const text = [research.title, research.problem, research.researchQuestion, research.institution, ...research.skillsNeeded, ...research.methods].join(' ').toLowerCase();
      const exact = [...research.skillsNeeded];
      const { score, reason } = evaluate(text, exact);
      if (score > 0) results.push({ id: research.id, type: 'research', data: research, score, reason });
    });
  }

  // ── Mentors
  if (targetType === 'all' || targetType === 'mentors') {
    SEED_MENTORS.forEach(mentor => {
      const text = [mentor.name, mentor.headline, mentor.expertise.join(' '), mentor.bio, ...mentor.industries].join(' ').toLowerCase();
      const exact = [...mentor.expertise, ...mentor.industries];
      const { score, reason } = evaluate(text, exact);
      if (score > 0) results.push({ id: mentor.id, type: 'mentors', data: mentor, score, reason });
    });
  }

  // ── Opportunities
  if (targetType === 'all' || targetType === 'opportunities') {
    SEED_OPPORTUNITIES.forEach(opp => {
      const text = [opp.title, opp.organization, opp.description, ...opp.categories, opp.location].join(' ').toLowerCase();
      const exact = [...opp.categories];
      const { score, reason } = evaluate(text, exact);
      if (score > 0) results.push({ id: opp.id, type: 'opportunities', data: opp, score, reason });
    });
  }

  // Return ranked results
  return results.sort((a, b) => b.score - a.score);
}
