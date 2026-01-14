-- Create app_users table to track logged in users
CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Allow public access for this simple auth system
CREATE POLICY "Allow public read on app_users" 
ON public.app_users FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on app_users" 
ON public.app_users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on app_users" 
ON public.app_users FOR UPDATE 
USING (true);