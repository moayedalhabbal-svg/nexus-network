-- 1. Function to handle new user registration from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, search_visibility)
  VALUES (
    new.id, 
    -- Extract full_name from raw_user_meta_data or default to 'NEXUS User'
    COALESCE(new.raw_user_meta_data->>'full_name', 'NEXUS User'),
    true -- Default to visible
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
