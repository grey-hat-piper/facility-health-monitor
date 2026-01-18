-- Add reported_by column to reports table
ALTER TABLE public.reports 
ADD COLUMN reported_by text;