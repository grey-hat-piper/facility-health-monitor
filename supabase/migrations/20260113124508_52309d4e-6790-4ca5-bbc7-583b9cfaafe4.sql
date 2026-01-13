-- Create enum for fault types
CREATE TYPE public.fault_type AS ENUM ('electrical', 'plumbing', 'security', 'inspection', 'carpentry');

-- Create enum for component status
CREATE TYPE public.component_status AS ENUM ('good', 'repairs', 'faulty');

-- Create enum for fault status
CREATE TYPE public.fault_status AS ENUM ('open', 'in-progress', 'resolved');

-- Create facilities table
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  health_percentage INTEGER NOT NULL DEFAULT 100 CHECK (health_percentage >= 0 AND health_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create facility components table
CREATE TABLE public.facility_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status component_status NOT NULL DEFAULT 'good',
  last_inspection TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create faults table
CREATE TABLE public.faults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  component_id UUID REFERENCES public.facility_components(id) ON DELETE SET NULL,
  type fault_type NOT NULL,
  description TEXT NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_worker_id UUID,
  status fault_status NOT NULL DEFAULT 'open',
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faults ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies (since no auth yet)
CREATE POLICY "Allow public read on facilities" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Allow public insert on facilities" ON public.facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on facilities" ON public.facilities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on facilities" ON public.facilities FOR DELETE USING (true);

CREATE POLICY "Allow public read on facility_components" ON public.facility_components FOR SELECT USING (true);
CREATE POLICY "Allow public insert on facility_components" ON public.facility_components FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on facility_components" ON public.facility_components FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on facility_components" ON public.facility_components FOR DELETE USING (true);

CREATE POLICY "Allow public read on faults" ON public.faults FOR SELECT USING (true);
CREATE POLICY "Allow public insert on faults" ON public.faults FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on faults" ON public.faults FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on faults" ON public.faults FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facility_components_updated_at
  BEFORE UPDATE ON public.facility_components
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faults_updated_at
  BEFORE UPDATE ON public.faults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to recalculate facility health based on components
CREATE OR REPLACE FUNCTION public.recalculate_facility_health()
RETURNS TRIGGER AS $$
DECLARE
  total_components INTEGER;
  good_count INTEGER;
  repairs_count INTEGER;
  new_health INTEGER;
BEGIN
  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE status = 'good'),
         COUNT(*) FILTER (WHERE status = 'repairs')
  INTO total_components, good_count, repairs_count
  FROM public.facility_components
  WHERE facility_id = COALESCE(NEW.facility_id, OLD.facility_id);

  IF total_components > 0 THEN
    -- Good = 100%, Repairs = 50%, Faulty = 0%
    new_health := ((good_count * 100) + (repairs_count * 50)) / total_components;
  ELSE
    new_health := 100;
  END IF;

  UPDATE public.facilities
  SET health_percentage = new_health
  WHERE id = COALESCE(NEW.facility_id, OLD.facility_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-update facility health when components change
CREATE TRIGGER recalculate_health_on_component_change
  AFTER INSERT OR UPDATE OR DELETE ON public.facility_components
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_facility_health();