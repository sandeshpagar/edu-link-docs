-- Enable realtime for documents table
ALTER TABLE public.documents REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;