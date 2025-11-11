-- Allow mentors to view profiles of their assigned students
CREATE POLICY "Mentors can view their students' profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.mentor_student_assignments
    WHERE mentor_student_assignments.mentor_id = auth.uid()
      AND mentor_student_assignments.student_id = profiles.id
  )
);