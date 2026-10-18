-- =============================================================================
-- NEXUS Security Migration: SECURITY DEFINER search_path hardening
-- Prepared: 2026-10-15
-- Purpose: Add SET search_path to all SECURITY DEFINER functions to prevent
--          privilege escalation via search_path manipulation.
--
-- BACKGROUND: When a SECURITY DEFINER function runs, it executes with the
-- owner's privileges. If search_path is not pinned, an attacker who can create
-- objects in a schema could shadow pg_catalog types and hijack the function.
--
-- REVIEW BEFORE APPLYING: Run the functions through pg_proc to confirm current
-- owners and existing search_path settings:
--   SELECT proname, prosecdef, proconfig FROM pg_proc
--   WHERE pronamespace = 'public'::regnamespace AND prosecdef = true;
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. set_updated_at — used by update triggers on profiles and projects
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public, pg_temp;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. handle_new_user — auth trigger that inserts into profiles on signup
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, search_visibility)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'NEXUS User'),
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Re-create trigger to pick up new function definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. is_project_member — used in workspace RLS policies
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_project_member(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    LEFT JOIN public.project_members pm ON p.id = pm.project_id
    WHERE p.id = check_project_id
    AND (p.owner_id = check_user_id OR pm.user_id = check_user_id)
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. increment_post_likes / decrement_post_likes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_post_likes(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = likes_count + 1
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_post_likes(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = p_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. increment_comment_likes / decrement_comment_likes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_comment_likes(c_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.comments
  SET likes_count = likes_count + 1
  WHERE id = c_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_comment_likes(c_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.comments
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = c_id;
END;
$$;
