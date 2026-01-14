-- Create worker role enum
CREATE TYPE public.worker_role AS ENUM ('electrician', 'plumber', 'security', 'inspector', 'maintenance');

-- Create workers table
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role worker_role NOT NULL,
  is_present BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for now, will secure after auth)
CREATE POLICY "Allow public read on workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on workers" ON public.workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on workers" ON public.workers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on workers" ON public.workers FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON public.workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial workers
INSERT INTO public.workers (name, role, is_present) VALUES
  ('John Smith', 'electrician', true),
  ('Maria Garcia', 'plumber', true),
  ('David Wilson', 'security', true),
  ('Sarah Johnson', 'inspector', false),
  ('Michael Brown', 'maintenance', true),
  ('Emily Davis', 'electrician', false);