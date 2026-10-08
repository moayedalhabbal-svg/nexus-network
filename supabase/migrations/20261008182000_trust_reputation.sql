-- NEXUS - Phase 8.9: Trust & Reputation System

-- Create Collaboration Records Table
CREATE TABLE IF NOT EXISTS "public"."collaboration_records" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "project_id" UUID NOT NULL REFERENCES "public"."projects"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "completed_at" TIMESTAMPTZ,
    "contribution_status" TEXT NOT NULL CHECK ("contribution_status" IN ('active', 'completed', 'abandoned')),
    "completion_confirmation" TEXT NOT NULL CHECK ("completion_confirmation" IN ('confirmed', 'unconfirmed', 'rejected')) DEFAULT 'unconfirmed'
);

CREATE INDEX IF NOT EXISTS collab_records_user_idx ON "public"."collaboration_records" ("user_id");
CREATE INDEX IF NOT EXISTS collab_records_project_idx ON "public"."collaboration_records" ("project_id");
CREATE INDEX IF NOT EXISTS collab_records_status_idx ON "public"."collaboration_records" ("contribution_status");

-- Create Collaboration Feedback Table
CREATE TABLE IF NOT EXISTS "public"."collaboration_feedback" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "collaboration_id" UUID NOT NULL REFERENCES "public"."collaboration_records"("id") ON DELETE CASCADE,
    "reviewer_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "reviewed_user_id" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "reliability" TEXT NOT NULL CHECK ("reliability" IN ('strong', 'average', 'weak', 'none')),
    "communication" TEXT NOT NULL CHECK ("communication" IN ('strong', 'average', 'weak', 'none')),
    "contribution" TEXT NOT NULL CHECK ("contribution" IN ('strong', 'average', 'weak', 'none')),
    "teamwork" TEXT NOT NULL CHECK ("teamwork" IN ('strong', 'average', 'weak', 'none')),
    "would_collaborate_again" TEXT NOT NULL CHECK ("would_collaborate_again" IN ('yes', 'maybe', 'no')),
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure a reviewer can only review a specific collaboration once
    UNIQUE("collaboration_id", "reviewer_id", "reviewed_user_id"),
    
    -- Prevent self-review
    CONSTRAINT "no_self_review" CHECK ("reviewer_id" != "reviewed_user_id")
);

CREATE INDEX IF NOT EXISTS collab_feedback_reviewed_idx ON "public"."collaboration_feedback" ("reviewed_user_id");
CREATE INDEX IF NOT EXISTS collab_feedback_reviewer_idx ON "public"."collaboration_feedback" ("reviewer_id");

-- RLS Policies for Collaboration Records
ALTER TABLE "public"."collaboration_records" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collab records are viewable by anyone" 
    ON "public"."collaboration_records" FOR SELECT 
    USING (true);

-- Only project owners or admins can confirm/reject completions
-- Simulated RLS for INSERT/UPDATE by checking project ownership
CREATE POLICY "Project owners can manage collab records" 
    ON "public"."collaboration_records" FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM "public"."projects" 
            WHERE id = project_id AND owner_id = auth.uid()
        )
    );

-- RLS Policies for Collaboration Feedback
ALTER TABLE "public"."collaboration_feedback" ENABLE ROW LEVEL SECURITY;

-- Feedback is only readable in aggregated forms typically, but for simplicity we allow public read of non-comment fields, and restrict comment reading if needed. We'll allow public read.
CREATE POLICY "Feedback is viewable by anyone" 
    ON "public"."collaboration_feedback" FOR SELECT 
    USING (true);

-- A user can only create feedback if they are the reviewer
CREATE POLICY "Users can create their own feedback" 
    ON "public"."collaboration_feedback" FOR INSERT 
    WITH CHECK (auth.uid() = reviewer_id);

-- A user can only update their own feedback
CREATE POLICY "Users can update their own feedback" 
    ON "public"."collaboration_feedback" FOR UPDATE 
    USING (auth.uid() = reviewer_id);
