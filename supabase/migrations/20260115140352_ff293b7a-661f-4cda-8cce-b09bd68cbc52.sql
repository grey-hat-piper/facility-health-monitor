-- Rename old enum
ALTER TYPE fault_type RENAME TO fault_type_old;

-- Create new enum with updated values
CREATE TYPE fault_type AS ENUM ('electrical', 'plumbing', 'security', 'sanitary', 'carpentry', 'other');

-- Alter column to use new enum (mapping 'inspection' to 'sanitary')
ALTER TABLE faults 
  ALTER COLUMN type TYPE fault_type 
  USING (
    CASE type::text
      WHEN 'inspection' THEN 'sanitary'::fault_type
      ELSE type::text::fault_type
    END
  );

-- Add custom_fault_type column for 'other' type
ALTER TABLE faults ADD COLUMN custom_fault_type text;

-- Drop old enum
DROP TYPE fault_type_old;