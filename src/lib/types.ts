// NEXUS - Core Type Definitions

// ─── User Types ─────────────────────────────────────────────────────
export type UserRole = 'student' | 'graduate' | 'professional' | 'researcher' | 'founder' | 'mentor' | 'investor';

export type CollaborationType = 'remote' | 'hybrid' | 'in-person';

export type AvailabilityStatus = 'open_now' | '5hrs_week' | '10hrs_week' | '20hrs_week' | 'full_time' | 'weekends' | 'flexible' | 'not_available';

export type CommitmentHours = '2' | '5' | '10' | '20' | '40';
export type WorkStyle = 'async' | 'evenings' | 'weekends' | 'flexible' | 'fixed_schedule';
export type CollaborationIntent = 'paid' | 'equity' | 'sweat_equity' | 'research' | 'academic_credit' | 'open_source' | 'volunteer' | 'cofounder' | 'mentorship';
export type CollaborationExpectation = 'short_term' | 'long_term' | 'one_off' | 'ongoing';

export type IntentType =
  | 'project'
  | 'cofounder'
  | 'research'
  | 'collaborator'
  | 'mentor'
  | 'mentee'
  | 'startup_job'
  | 'freelance'
  | 'investment'
  | 'team'
  | 'academic'
  | 'business_partnership';

export type SkillCategory = 'technical' | 'business' | 'creative' | 'research' | 'leadership' | 'domain';

export interface Verification {
  type: 'email' | 'university' | 'organization' | 'identity';
  label: string;
  verifiedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface Interest {
  id: string;
  name: string;
  category: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  headline: string;
  bio: string;
  avatar: string;
  location: string;
  timezone: string;
  roles: UserRole[];
  skills: Skill[];
  interests: Interest[];
  intents: IntentType[];
  availability: AvailabilityStatus; // Keep for backwards compatibility
  commitmentHours?: CommitmentHours;
  workStyles?: WorkStyle[];
  collaborationTypes?: CollaborationIntent[];
  collaborationExpectations?: CollaborationExpectation[];
  collaborationPreferences: CollaborationType[];
  preferredTeamSize: string;
  experience: Experience[];
  education: Education[];
  proofOfWork: ProofOfWork[];
  trustSummary?: TrustSummary;
  verifications: Verification[];
  profileVisibility: 'public' | 'network' | 'connections' | 'private';
  searchVisibility: boolean;
  onlineStatus: 'online' | 'away' | 'offline' | 'hidden';
  completionPercentage: number;
  joinedAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
}

export interface ProofOfWork {
  id: string;
  userId: string;
  type: 'github' | 'portfolio' | 'website' | 'paper' | 'presentation' | 'prototype' | 'video' | 'certificate' | 'publication' | 'project';
  title: string;
  url: string;
  description: string;
  source: string;
  skills: string[];
  projectId?: string;
  verificationStatus: 'verified' | 'added_by_you' | 'evidence_found' | 'external_evidence';
  createdAt: string;
  updatedAt: string;
}

// ─── Trust & Reputation Types ───────────────────────────────────────

export type FeedbackRating = 'strong' | 'average' | 'weak' | 'none';

export interface CollaborationRecord {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  role: string;
  joinedAt: string;
  completedAt: string | null;
  contributionStatus: 'active' | 'completed' | 'abandoned' | 'withdrawn' | 'cancelled';
  completionConfirmation: 'confirmed' | 'unconfirmed' | 'rejected';
  withdrawalReason?: string;
}

export interface CollaborationFeedback {
  id: string;
  collaborationId: string;
  reviewerId: string;
  reviewedUserId: string;
  reliability: FeedbackRating;
  communication: FeedbackRating;
  contribution: FeedbackRating;
  teamwork: FeedbackRating;
  wouldCollaborateAgain: 'yes' | 'maybe' | 'no';
  comment?: string;
  createdAt: string;
}

export interface TrustSummary {
  completedProjects: number;
  verifiedCollaborations: number;
  reliabilityScore: number; // 0-100 derived internally, only shown as labels
  communicationScore: number;
  contributionScore: number;
  teamworkScore: number;
  feedbackCount: number;
  abandonedProjects: number;
  withdrawals: number;
  responseRate: number; // percentage 0-100
  averageResponseTimeHours: number;
  recentResponseActivity: number; // 0-100
  reliabilityStatus: 'Reliable Collaborator' | 'Response Pattern Varies' | 'Limited Collaboration History';
}

// ─── Project Types ──────────────────────────────────────────────────

export type ProjectStage =
  | 'idea'
  | 'validation'
  | 'prototype'
  | 'mvp'
  | 'early_traction'
  | 'growth'
  | 'research_concept'
  | 'active_research'
  | 'commercialization';

export type ProjectCategory =
  | 'ai'
  | 'climate'
  | 'renewable_energy'
  | 'robotics'
  | 'healthcare'
  | 'education'
  | 'fintech'
  | 'hardware'
  | 'saas'
  | 'research'
  | 'social_impact'
  | 'manufacturing'
  | 'mobility'
  | 'biotech'
  | 'cybersecurity'
  | 'space'
  | 'agriculture'
  | 'media'
  | 'gaming'
  | 'other';

export type FundingStatus =
  | 'self_funded'
  | 'bootstrapped'
  | 'seeking_grant'
  | 'seeking_angel'
  | 'seeking_vc'
  | 'funded'
  | 'not_seeking';

export type CollaborationStatus = 'actively_looking' | 'team_forming' | 'building' | 'paused' | 'completed';

export type ProjectVisibility = 'public' | 'network' | 'connections' | 'private';

export interface ProjectNeed {
  id: string;
  role: string;
  count: number;
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string;
  commitment: AvailabilityStatus;
  collaboration: CollaborationType;
  compensation: 'paid' | 'equity' | 'volunteer' | 'cofounder' | 'research_collaborator';
  filled: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedAt: string | null;
}

export interface ProjectUpdate {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  type: 'update' | 'milestone' | 'build_log' | 'question' | 'opportunity';
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  role: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  title: string;
  pitch: string;
  problem: string;
  solution: string;
  description: string;
  category: ProjectCategory;
  categories: ProjectCategory[];
  stage: ProjectStage;
  fundingStatus: FundingStatus;
  collaborationStatus: CollaborationStatus;
  visibility: ProjectVisibility;
  technologies: string[];
  needs: ProjectNeed[];
  team: ProjectMember[];
  milestones: ProjectMilestone[];
  updates: ProjectUpdate[];
  links: { label: string; url: string }[];
  whatExists: string;
  whatNeeded: string;
  location: string;
  remote: boolean;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  minimumCommitmentHours?: CommitmentHours;
  preferredCommitmentHours?: CommitmentHours;
  maximumCommitmentHours?: CommitmentHours;
  workStyles?: WorkStyle[];
  collaborationTypes?: CollaborationIntent[];
  collaborationExpectations?: CollaborationExpectation[];
  createdAt: string;
  updatedAt: string;
}

// ─── Application Types ──────────────────────────────────────────────

export interface ProjectApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  roleInterested: string;
  whyInterested: string;
  whatCanContribute: string;
  relevantExperience: string;
  timeCommitment: AvailabilityStatus;
  matchScore: number;
  matchReasons: MatchReason[];
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  createdAt: string;
  reviewedAt: string | null;
}

// ─── Matching Types ─────────────────────────────────────────────────

export interface MatchReason {
  type: 'skill' | 'interest' | 'intent' | 'domain' | 'availability' | 'experience' | 'location' | 'complementary';
  label: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface MatchGap {
  type: 'skill' | 'experience' | 'availability';
  label: string;
}

export interface MatchResult {
  id: string;
  targetType: 'user' | 'project' | 'research' | 'startup' | 'opportunity';
  targetId: string;
  score: number;
  reasons: MatchReason[];
  gaps: MatchGap[];
  skillMatch: number;
  interestMatch: number;
  intentMatch: number;
  domainMatch: number;
  availabilityMatch: number;
  experienceMatch: number;
  locationMatch: number;
  complementarityScore: number;
  algorithmVersion: string;
  createdAt: string;
}

// ─── Connection Types ───────────────────────────────────────────────

export type ConnectionType = 'connect' | 'collaborate' | 'follow';
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: ConnectionType;
  status: ConnectionStatus;
  message: string;
  createdAt: string;
  respondedAt: string | null;
}

// ─── Messaging Types ────────────────────────────────────────────────

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'project';
  name: string | null;
  projectId: string | null;
  projectTitle: string | null;
  participants: ConversationParticipant[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  name: string;
  avatar: string;
  lastReadAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'file' | 'system';
  readBy: string[];
  createdAt: string;
}

// ─── Notification Types ─────────────────────────────────────────────

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'project_application'
  | 'application_accepted'
  | 'new_message'
  | 'new_match'
  | 'project_update'
  | 'research_opportunity'
  | 'mentor_recommendation'
  | 'project_invitation';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string;
  read: boolean;
  createdAt: string;
}

// ─── Feed Types ─────────────────────────────────────────────────────

export type PostType = 'project_update' | 'build_log' | 'research_update' | 'question' | 'opportunity' | 'milestone' | 'professional';

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorHeadline: string;
  projectId: string | null;
  projectTitle: string | null;
  type: PostType;
  content: string;
  tags: string[];
  reactions: { type: string; count: number; userReacted: boolean }[];
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

// ─── Research Types ─────────────────────────────────────────────────

export interface ResearchOpportunity {
  id: string;
  title: string;
  problem: string;
  researchQuestion: string;
  requiredBackground: string;
  methods: string[];
  skillsNeeded: string[];
  commitment: AvailabilityStatus;
  location: string;
  remote: boolean;
  expectedOutput: ('paper' | 'prototype' | 'dataset' | 'conference' | 'thesis' | 'experiment')[];
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  institution: string;
  department: string;
  status: 'open' | 'filled' | 'closed';
  applicantCount: number;
  createdAt: string;
}

// ─── Mentor Types ───────────────────────────────────────────────────

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  headline: string;
  expertise: string[];
  industries: string[];
  yearsExperience: number;
  topics: string[];
  availability: AvailabilityStatus;
  preferredMenteeType: string[];
  sessionType: 'one_on_one' | 'group' | 'office_hours' | 'async';
  pricing: 'free' | 'paid' | 'both';
  bio: string;
  rating: number;
  menteeCount: number;
}

// ─── Investor Types ─────────────────────────────────────────────────

export interface InvestorProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  type: 'angel' | 'vc' | 'corporate' | 'family_office' | 'accelerator';
  sectors: ProjectCategory[];
  stages: ProjectStage[];
  geography: string[];
  checkSizeMin: number;
  checkSizeMax: number;
  thesis: string;
  portfolio: { name: string; url: string }[];
  contactPreference: 'direct' | 'introduction' | 'platform_only';
}

// ─── Opportunity Types ──────────────────────────────────────────────

export type OpportunityType = 'grant' | 'accelerator' | 'competition' | 'fellowship' | 'internship' | 'research' | 'incubator' | 'startup_program' | 'hackathon' | 'corporate_challenge';

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  organization: string;
  description: string;
  eligibility: string;
  deadline: string | null;
  location: string;
  remote: boolean;
  categories: ProjectCategory[];
  url: string;
  featured: boolean;
  createdAt: string;
}

// ─── Admin Types ────────────────────────────────────────────────────

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalApplications: number;
  totalConnections: number;
  totalMessages: number;
  totalMatches: number;
  successfulCollaborations: number;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'project' | 'message' | 'post';
  targetId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  actionTaken: 'none' | 'warning' | 'content_removed' | 'account_suspended' | 'account_banned' | null;
  resolution: string | null;
  reporterName: string;
  targetName: string;
}

export interface AuditLog {
  id: string;
  actionId: string;
  adminId: string;
  adminName: string;
  action: 'approve_verification' | 'reject_verification' | 'resolve_report' | 'suspend_user' | 'ban_user' | 'delete_content';
  targetType: 'user' | 'project' | 'report' | 'message';
  targetId: string;
  details: string;
  timestamp: string;
}
