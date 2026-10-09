-- 1. Fix project_members RLS vulnerability where anyone could insert themselves into any project
DROP POLICY IF EXISTS "Users can manage their own membership" ON project_members;

-- Users can only delete themselves from a project (leave project)
CREATE POLICY "Users can remove their own membership" ON project_members
    FOR DELETE USING (auth.uid() = user_id);

-- Project owners can manage members
CREATE POLICY "Project owners can manage members" ON project_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_members.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- 2. Fix ai_recruiting updating where candidates could potentially change the target project
DROP POLICY IF EXISTS "Project owners and candidates can update invitations" ON public.recruiting_invitations;

CREATE POLICY "Project owners can update invitations" ON public.recruiting_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects p 
            WHERE p.id = project_id 
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can update their own invitations" ON public.recruiting_invitations
    FOR UPDATE USING (
        candidate_id = auth.uid()
    ) WITH CHECK (
        -- Can't change the candidate_id or project_id during update
        candidate_id = auth.uid()
    );
