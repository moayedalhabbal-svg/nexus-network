-- =============================================================================
-- NEXUS Security Migration: RLS Hardening
-- Prepared: 2026-10-15
-- Purpose: Fix overly-permissive USING (true) RLS policies that expose private
--          projects and profiles regardless of their visibility settings.
--
-- REVIEW BEFORE APPLYING: Verify that the policies listed in the DROP statements
-- actually exist in your live database using:
--   SELECT policyname, tablename, qual FROM pg_policies WHERE schemaname = 'public';
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FIX: profiles — restore search_visibility filter
--    The security_hardening migration replaced `search_visibility = true` with
--    USING (true), exposing all profiles to everyone.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Authenticated users can see all profiles (needed for messaging, invitations, etc.)
-- Unauthenticated (anon) users only see profiles that opted in to search visibility
CREATE POLICY "Profiles visible based on auth and visibility" ON public.profiles
  FOR SELECT USING (
    search_visibility = true
    OR auth.uid() = id
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. FIX: projects — restore is_private filter
--    The security_hardening migration replaced `is_private = false` with
--    USING (true), exposing private projects to everyone.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;

-- Anyone can view public projects. Owners can always see their own projects.
-- Project members can see the project too.
CREATE POLICY "Projects visible based on privacy and membership" ON public.projects
  FOR SELECT USING (
    is_private = false
    OR auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = projects.id
        AND pm.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FIX: project_needs — restrict to non-private projects
--    USING (true) exposed needs on private projects to everyone.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Project needs are public" ON public.project_needs;

CREATE POLICY "Project needs visible for accessible projects" ON public.project_needs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_needs.project_id
        AND (
          p.is_private = false
          OR p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
          )
        )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. FIX: profiles — add missing INSERT policy for authenticated users
--    Without this, the ensureProfileAction (non-service-role path) fails.
--    The handle_new_user() trigger bypasses RLS via SECURITY DEFINER, but
--    the application-level fallback in ensureProfileAction needs this.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. FIX: Remove the recursive admin policy from production_foundation.sql
--    The admin policy on profiles does SELECT FROM profiles inside profiles'
--    own RLS check, which can cause infinite recursion in some Postgres versions.
--    Admin operations should use the service role key which bypasses RLS.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;
-- NOTE: Admin server actions already use createServiceRoleClient() which bypasses
-- RLS entirely. The recursive policy is not needed and is unsafe.

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FIX: posts — ensure SELECT policy exists (was enabled but no SELECT policy
--    was added in security_hardening.sql for posts)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;

CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON public.posts;

CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);
