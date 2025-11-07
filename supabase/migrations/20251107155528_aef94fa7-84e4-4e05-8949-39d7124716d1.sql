-- Add INSERT policy for user_roles to allow users to create their own role during signup
CREATE POLICY "Users can insert their own role during signup"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also insert the missing role for the existing user
INSERT INTO public.user_roles (user_id, role)
VALUES ('c76e9658-7053-4b01-83aa-9bb371c9d466', 'student')
ON CONFLICT (user_id, role) DO NOTHING;