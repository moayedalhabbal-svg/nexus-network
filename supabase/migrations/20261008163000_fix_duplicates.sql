-- Add unique constraint to prevent duplicate applications
ALTER TABLE applications ADD CONSTRAINT unique_project_applicant UNIQUE(project_id, applicant_id);
