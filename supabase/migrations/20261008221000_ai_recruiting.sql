-- Phase 8.13: AI Active Recruiting

-- 1. Add collaboration status to profiles
ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "open_to_collaborations" TEXT DEFAULT 'yes' CHECK ("open_to_collaborations" IN ('yes', 'maybe', 'no'));

-- 2. Recruiting Requests Table
CREATE TABLE IF NOT EXISTS "public"."recruiting_requests" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "project_id" UUID NOT NULL REFERENCES "public"."projects"("id") ON DELETE CASCADE,
    "created_by" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "role_title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    
    -- AI Extracted Structured Fields
    "required_skills" TEXT[] DEFAULT '{}',
    "preferred_skills" TEXT[] DEFAULT '{}',
    "commitment_hours" TEXT,
    "work_styles" TEXT[] DEFAULT '{}',
    "collaboration_types" TEXT[] DEFAULT '{}',
    "experience_requirements" TEXT,
    
    "status" TEXT DEFAULT 'active' CHECK ("status" IN ('active', 'paused', 'closed')),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Recruiting Invitations / Pipeline Table
CREATE TABLE IF NOT EXISTS "public"."recruiting_invitations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "request_id" UUID REFERENCES "public"."recruiting_requests"("id") ON DELETE CASCADE,
    "project_id" UUID NOT NULL REFERENCES "public"."projects"("id") ON DELETE CASCADE,
    "candidate_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    
    "status" TEXT DEFAULT 'recommended' CHECK ("status" IN ('recommended', 'invited', 'viewed', 'interested', 'accepted', 'declined', 'expired')),
    
    "match_score" INTEGER,
    "explanation" TEXT,
    "message" TEXT, -- AI drafted or user edited message
    "feedback" TEXT, -- optional feedback if declined/not relevant
    
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    
    -- A candidate can only be in a specific recruiting request pipeline once
    UNIQUE("request_id", "candidate_id")
);

-- 4. RLS for Recruiting Requests
ALTER TABLE "public"."recruiting_requests" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view recruiting requests"
ON "public"."recruiting_requests" FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM "public"."project_members" pm 
        WHERE pm."project_id" = "recruiting_requests"."project_id" 
        AND pm."user_id" = auth.uid()
    )
    OR "created_by" = auth.uid()
);

CREATE POLICY "Project owners can insert recruiting requests"
ON "public"."recruiting_requests" FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "public"."projects" p 
        WHERE p."id" = "project_id" 
        AND p."owner_id" = auth.uid()
    )
);

CREATE POLICY "Project owners can update recruiting requests"
ON "public"."recruiting_requests" FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM "public"."projects" p 
        WHERE p."id" = "project_id" 
        AND p."owner_id" = auth.uid()
    )
);

-- 5. RLS for Recruiting Invitations
ALTER TABLE "public"."recruiting_invitations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view recommendations and invitations"
ON "public"."recruiting_invitations" FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM "public"."project_members" pm 
        WHERE pm."project_id" = "recruiting_invitations"."project_id" 
        AND pm."user_id" = auth.uid()
    )
    OR "candidate_id" = auth.uid()
);

CREATE POLICY "Project owners can insert recommendations"
ON "public"."recruiting_invitations" FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "public"."projects" p 
        WHERE p."id" = "project_id" 
        AND p."owner_id" = auth.uid()
    )
);

CREATE POLICY "Project owners and candidates can update invitations"
ON "public"."recruiting_invitations" FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM "public"."projects" p 
        WHERE p."id" = "project_id" 
        AND p."owner_id" = auth.uid()
    )
    OR "candidate_id" = auth.uid()
);

