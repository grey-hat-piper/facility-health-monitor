-- Add 'masonry' to fault_type enum
ALTER TYPE fault_type ADD VALUE IF NOT EXISTS 'masonry';

-- Create function to sync component status based on fault status
CREATE OR REPLACE FUNCTION public.sync_component_status_from_fault()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Only update if the fault has a component_id
  IF NEW.component_id IS NOT NULL THEN
    -- Map fault status to component status:
    -- 'resolved' -> 'good'
    -- 'in-progress' -> 'repairs'
    -- 'open' -> 'faulty'
    UPDATE public.facility_components
    SET status = CASE NEW.status
      WHEN 'resolved' THEN 'good'::component_status
      WHEN 'in-progress' THEN 'repairs'::component_status
      WHEN 'open' THEN 'faulty'::component_status
    END,
    updated_at = now()
    WHERE id = NEW.component_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run on fault insert or update
DROP TRIGGER IF EXISTS sync_component_status_trigger ON public.faults;
CREATE TRIGGER sync_component_status_trigger
AFTER INSERT OR UPDATE OF status ON public.faults
FOR EACH ROW
EXECUTE FUNCTION public.sync_component_status_from_fault();