import assert from 'node:assert';
import { matchUserToProject, matchUserToUser } from '../matching-engine';
import { UserProfile, Project } from '../types';

function runTests() {
  const dummyUser: UserProfile = {
    id: 'user1',
    name: 'Alice',
    email: 'alice@test.com',
    headline: '',
    bio: '',
    avatar: '',
    skills: [{ id: 's1', name: 'TypeScript', category: 'technical' }],
    interests: [{ id: 'i1', name: 'AI', category: 'ai' }],
    intents: ['project'],
    availability: '10hrs_week',
    experience: [],
    roles: [],
    location: 'Remote',
    timezone: 'UTC',
    collaborationPreferences: ['remote'],
    preferredTeamSize: '',
    education: [],
    proofOfWork: [],
    verifications: [],
    profileVisibility: 'public',
    searchVisibility: true,
    onlineStatus: 'online',
    completionPercentage: 100,
    joinedAt: '',
    updatedAt: '',
  };

  const dummyProject: Project = {
    id: 'proj1',
    ownerId: 'user2',
    title: 'Test Project',
    pitch: 'Test',
    description: 'Test',
    problem: '',
    solution: '',
    ownerName: '',
    ownerAvatar: '',
    category: 'ai',
    categories: ['ai'],
    stage: 'idea',
    fundingStatus: 'bootstrapped',
    collaborationStatus: 'actively_looking',
    visibility: 'public',
    technologies: ['Python'],
    needs: [{ 
      id: 'n1', 
      role: 'Dev', 
      requiredSkills: ['Python'], 
      preferredSkills: [], 
      experience: '',
      commitment: '10hrs_week',
      collaboration: 'remote',
      compensation: 'equity',
      filled: false,
      count: 1 
    }],
    team: [],
    milestones: [],
    updates: [],
    links: [],
    whatExists: '',
    whatNeeded: '',
    remote: true,
    location: 'Remote',
    createdAt: '',
    updatedAt: '',
  };

  console.log('Running Matching Engine Tests...');

  // Test 1: Deterministic score when semantic similarity is undefined
  const match1 = matchUserToProject(dummyUser, dummyProject);
  assert(match1.score > 0, "Score should be positive");
  assert(!match1.reasons.find(r => r.label.includes('High semantic relevance')), "Should not have semantic reason");

  // Test 2: Boosts score when high semantic similarity is provided
  const match2 = matchUserToProject(dummyUser, dummyProject, 0.95);
  assert(match2.score > match1.score, "Score should be boosted by high semantic similarity");
  assert(match2.reasons.find(r => r.label.includes('High semantic relevance')), "Should have semantic reason");

  // Test 3: Preserves deterministic penalties even with high semantic similarity
  const incompatibleUser: UserProfile = { ...dummyUser, availability: 'not_available', commitmentHours: '40' };
  const match3 = matchUserToProject(incompatibleUser, dummyProject, 0.95);
  assert(match3.score < match2.score, "Score should be penalized for incompatibility despite semantic similarity");

  console.log('✅ All tests passed!');
}

runTests();
