
-- Create absence reason enum
CREATE TYPE public.absence_reason AS ENUM (
  'public_holiday',
  'casual_leave',
  'absent',
  'permission',
  'annual_leave',
  'late',
  'hospital',
  'official_duty',
  'maternity_leave',
  'resigned'
);

-- Add absence_reason column to workers
ALTER TABLE public.workers ADD COLUMN absence_reason public.absence_reason DEFAULT NULL;
