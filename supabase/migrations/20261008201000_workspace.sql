-- NEXUS Phase 8.11 Workspace Tables

-- 1. Milestones
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Todo' CHECK (status IN ('Todo', 'In Progress', 'Done')),
    target_date DATE,
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tasks
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Todo' CHECK (status IN ('Todo', 'In Progress', 'Blocked', 'Done')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Discussions
CREATE TABLE IF NOT EXISTS public.project_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.project_discussions(id) ON DELETE CASCADE, -- For replies
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Updates (Meaningful progress posts)
CREATE TABLE IF NOT EXISTS public.project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    progress_indicator INTEGER, -- optional percentage
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Files
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes
CREATE INDEX project_milestones_project_idx ON public.project_milestones(project_id);
CREATE INDEX project_tasks_project_idx ON public.project_tasks(project_id);
CREATE INDEX project_tasks_assignee_idx ON public.project_tasks(assignee_id);
CREATE INDEX project_discussions_project_idx ON public.project_discussions(project_id);
CREATE INDEX project_updates_project_idx ON public.project_updates(project_id);
CREATE INDEX project_files_project_idx ON public.project_files(project_id);

-- 7. RLS
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is a member of the project
CREATE OR REPLACE FUNCTION public.is_project_member(check_project_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    LEFT JOIN public.project_members pm ON p.id = pm.project_id
    WHERE p.id = check_project_id
    AND (p.owner_id = check_user_id OR pm.user_id = check_user_id)
  );
$$;

-- Apply policies using the helper
CREATE POLICY "Project members can read milestones" ON public.project_milestones FOR SELECT USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Project members can write milestones" ON public.project_milestones FOR ALL USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Project members can read tasks" ON public.project_tasks FOR SELECT USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Project members can write tasks" ON public.project_tasks FOR ALL USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Project members can read discussions" ON public.project_discussions FOR SELECT USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Project members can write discussions" ON public.project_discussions FOR ALL USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Project members can read updates" ON public.project_updates FOR SELECT USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Project members can write updates" ON public.project_updates FOR ALL USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Project members can read files" ON public.project_files FOR SELECT USING (public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Project members can write files" ON public.project_files FOR ALL USING (public.is_project_member(project_id, auth.uid()));
