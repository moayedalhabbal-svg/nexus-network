-- =============================================================================
-- NEXUS Migration: Fix foreign key references from public.users to public.profiles
-- Prepared: 2026-10-15
-- Purpose: The workspace and github_integration migrations reference public.users
--          instead of public.profiles. In production, user data lives in
--          public.profiles (which references auth.users). The public.users table
--          from the initial schema is a legacy artifact.
--
-- IMPORTANT: Before applying, verify which table contains your actual user data:
--   SELECT COUNT(*) FROM public.profiles;
--   SELECT COUNT(*) FROM public.users;  -- may not exist or may be empty
--
-- If public.users is empty and all user data is in public.profiles, apply this.
-- If public.users is populated, a data migration step is needed first.
--
-- These are DESTRUCTIVE changes (drop+recreate FK constraints). Back up first.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. project_milestones: owner_id → profiles
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.project_milestones
  DROP CONSTRAINT IF EXISTS project_milestones_owner_id_fkey,
  ADD CONSTRAINT project_milestones_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. project_tasks: assignee_id and creator_id → profiles
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.project_tasks
  DROP CONSTRAINT IF EXISTS project_tasks_assignee_id_fkey,
  DROP CONSTRAINT IF EXISTS project_tasks_creator_id_fkey,
  ADD CONSTRAINT project_tasks_assignee_id_fkey
    FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT project_tasks_creator_id_fkey
    FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. project_discussions: author_id → profiles
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.project_discussions
  DROP CONSTRAINT IF EXISTS project_discussions_author_id_fkey,
  ADD CONSTRAINT project_discussions_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Self-referencing parent_id is fine, no change needed

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. project_updates: author_id → profiles
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.project_updates
  DROP CONSTRAINT IF EXISTS project_updates_author_id_fkey,
  ADD CONSTRAINT project_updates_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. project_files: uploader_id → profiles
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.project_files
  DROP CONSTRAINT IF EXISTS project_files_uploader_id_fkey,
  ADD CONSTRAINT project_files_uploader_id_fkey
    FOREIGN KEY (uploader_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. user_providers: user_id → auth.users (not profiles, for OAuth identity link)
--    The github_integration migration referenced public.users. The correct
--    reference for identity providers is auth.users (or profiles which is keyed
--    to auth.users). Using auth.users directly is standard Supabase practice.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_providers
  DROP CONSTRAINT IF EXISTS user_providers_user_id_fkey,
  ADD CONSTRAINT user_providers_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Update is_project_member to use profiles-based join (already correct,
--    but re-confirm it uses project_members which references profiles)
--    No change needed here — project_members already references profiles.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Drop the legacy public.users table if it is empty and unused
--    CAUTION: Only run this after confirming all FKs are updated and the table
--    contains no data that has not been migrated to public.profiles.
-- ─────────────────────────────────────────────────────────────────────────────
-- Uncomment and run manually after verification:
-- DROP TABLE IF EXISTS public.users CASCADE;
