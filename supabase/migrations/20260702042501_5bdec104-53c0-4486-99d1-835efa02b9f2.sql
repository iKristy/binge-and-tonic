DROP POLICY IF EXISTS "Authenticated users can insert shows" ON public.shows;
CREATE POLICY "Authenticated users can insert shows"
ON public.shows
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);