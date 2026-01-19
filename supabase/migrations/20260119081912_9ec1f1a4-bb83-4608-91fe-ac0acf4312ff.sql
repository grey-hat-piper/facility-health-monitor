-- Add email column to app_users
ALTER TABLE public.app_users ADD COLUMN email text;

-- Create activity_logs table for calendar system
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_logs
CREATE POLICY "Allow public read on activity_logs" 
ON public.activity_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on activity_logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for efficient date queries
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);