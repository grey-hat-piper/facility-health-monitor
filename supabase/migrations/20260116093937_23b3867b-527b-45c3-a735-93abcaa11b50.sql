-- Create reports table for brief notes and condition updates
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports access
CREATE POLICY "Anyone can view reports" 
ON public.reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update reports" 
ON public.reports 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete reports" 
ON public.reports 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();