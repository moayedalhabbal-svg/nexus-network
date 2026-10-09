-- Add UNIQUE constraint to prevent duplicate Proof of Work entries from providers like GitHub
ALTER TABLE public.proof_of_work 
ADD CONSTRAINT proof_of_work_user_provider_id_key UNIQUE (user_id, provider, provider_id);
