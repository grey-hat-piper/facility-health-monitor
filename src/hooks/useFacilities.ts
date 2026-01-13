import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DbFacility {
  id: string;
  name: string;
  location: string;
  health_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface DbFacilityComponent {
  id: string;
  facility_id: string;
  name: string;
  status: 'good' | 'repairs' | 'faulty';
  last_inspection: string;
  created_at: string;
  updated_at: string;
}

export interface FacilityWithComponents extends DbFacility {
  components: DbFacilityComponent[];
}

export const useFacilities = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const { data: facilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('*')
        .order('name');

      if (facilitiesError) throw facilitiesError;

      const { data: components, error: componentsError } = await supabase
        .from('facility_components')
        .select('*')
        .order('name');

      if (componentsError) throw componentsError;

      const facilitiesWithComponents: FacilityWithComponents[] = (facilities || []).map(facility => ({
        ...facility,
        components: (components || []).filter(c => c.facility_id === facility.id),
      }));

      return facilitiesWithComponents;
    },
  });
};

export const useFacilityComponents = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['facility_components', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      
      const { data, error } = await supabase
        .from('facility_components')
        .select('*')
        .eq('facility_id', facilityId)
        .order('name');

      if (error) throw error;
      return data as DbFacilityComponent[];
    },
    enabled: !!facilityId,
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string; location: string }) => {
      const { data: facility, error } = await supabase
        .from('facilities')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return facility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({ title: 'Facility Created', description: 'New facility added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; location?: string }) => {
      const { data: facility, error } = await supabase
        .from('facilities')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return facility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({ title: 'Facility Updated', description: 'Changes saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({ title: 'Facility Deleted', description: 'Facility removed successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useCreateComponent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { facility_id: string; name: string; status?: 'good' | 'repairs' | 'faulty' }) => {
      const { data: component, error } = await supabase
        .from('facility_components')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facility_components'] });
      toast({ title: 'Component Added', description: 'New component added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateComponent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; status?: 'good' | 'repairs' | 'faulty' }) => {
      const { data: component, error } = await supabase
        .from('facility_components')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facility_components'] });
      toast({ title: 'Component Updated', description: 'Changes saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteComponent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('facility_components')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facility_components'] });
      toast({ title: 'Component Deleted', description: 'Component removed successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
