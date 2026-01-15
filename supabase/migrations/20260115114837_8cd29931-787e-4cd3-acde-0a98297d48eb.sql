-- Step 1: Rename the old enum type
ALTER TYPE public.worker_role RENAME TO worker_role_old;

-- Step 2: Create new enum with updated values
CREATE TYPE public.worker_role AS ENUM (
  'electrician',
  'plumber',
  'security',
  'inspector',
  'carpenter',
  'janitor',
  'grounds',
  'other'
);

-- Step 3: Update the column to use new type, mapping 'maintenance' to 'carpenter'
ALTER TABLE public.workers 
  ALTER COLUMN role TYPE public.worker_role 
  USING (
    CASE role::text
      WHEN 'maintenance' THEN 'carpenter'::public.worker_role
      ELSE role::text::public.worker_role
    END
  );

-- Step 4: Add custom_role column for 'other' role
ALTER TABLE public.workers ADD COLUMN custom_role text;

-- Step 5: Drop the old enum type
DROP TYPE public.worker_role_old;