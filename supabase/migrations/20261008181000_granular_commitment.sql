-- NEXUS - Phase 8.8: Granular Commitment & Collaboration Intent

-- Update users table with collaboration intent fields
ALTER TABLE IF EXISTS "public"."users" 
ADD COLUMN IF NOT EXISTS "commitment_hours" text,
ADD COLUMN IF NOT EXISTS "work_styles" text[],
ADD COLUMN IF NOT EXISTS "collaboration_types" text[],
ADD COLUMN IF NOT EXISTS "collaboration_expectations" text[];

-- Update projects table with collaboration intent fields
ALTER TABLE IF EXISTS "public"."projects"
ADD COLUMN IF NOT EXISTS "minimum_commitment_hours" text,
ADD COLUMN IF NOT EXISTS "preferred_commitment_hours" text,
ADD COLUMN IF NOT EXISTS "maximum_commitment_hours" text,
ADD COLUMN IF NOT EXISTS "work_styles" text[],
ADD COLUMN IF NOT EXISTS "collaboration_types" text[],
ADD COLUMN IF NOT EXISTS "collaboration_expectations" text[];

-- Create appropriate indexes for matching/filtering
CREATE INDEX IF NOT EXISTS users_commitment_idx ON "public"."users" ("commitment_hours");
CREATE INDEX IF NOT EXISTS users_work_styles_idx ON "public"."users" USING GIN ("work_styles");
CREATE INDEX IF NOT EXISTS users_collab_types_idx ON "public"."users" USING GIN ("collaboration_types");

CREATE INDEX IF NOT EXISTS projects_pref_commitment_idx ON "public"."projects" ("preferred_commitment_hours");
CREATE INDEX IF NOT EXISTS projects_work_styles_idx ON "public"."projects" USING GIN ("work_styles");
CREATE INDEX IF NOT EXISTS projects_collab_types_idx ON "public"."projects" USING GIN ("collaboration_types");
