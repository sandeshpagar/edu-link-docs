-- Fix privilege escalation vulnerability by removing client-side role assignment

-- 1. Drop the insecure RLS policy that allows users to set their own roles
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

-- 2. Create a secure trigger to automatically assign 'student' role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student'::app_role);
  RETURN NEW;
END;
$$;

-- 3. Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- Note: Admins can still promote users through the admin panel via the existing 
-- "Admins can manage all roles" policy on user_roles table