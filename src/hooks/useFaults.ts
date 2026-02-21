import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FaultType } from '@/types/facilities';

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export const PROCUREMENT_CHECKLIST: ChecklistItem[] = [
  { label: 'Memo', done: false },
  { label: 'Head of School', done: false },
  { label: 'Accounts', done: false },
  { label: 'Procurement', done: false },
  { label: 'Director', done: false },
  { label: 'Payment', done: false },
  { label: 'Work Started', done: false },
];

export interface DbFault {
  id: string;
  facility_id: string;
  component_id: string | null;
  type: FaultType;
  description: string;
  reported_at: string;
  assigned_worker_id: string | null;
  status: 'open' | 'in-progress' | 'resolved';
  images: string[] | null;
  custom_fault_type: string | null;
  checklist: ChecklistItem[] | null;
  created_at: string;
  updated_at: string;
}

export const useFaults = () => {
  return useQuery({
    queryKey: ['faults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faults')
        .select('*')
        .order('reported_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as DbFault[]);
    },
  });
};

export const useCreateFault = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      facility_id: string;
      component_id?: string;
      type: FaultType;
      description: string;
      custom_fault_type?: string;
    }) => {
      const { data: fault, error } = await supabase
        .from('faults')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return fault;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faults'] });
      toast({ title: 'Fault Reported', description: 'The fault has been logged successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateFault = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      status?: 'open' | 'in-progress' | 'resolved';
      description?: string;
      assigned_worker_id?: string | null;
      checklist?: ChecklistItem[];
    }) => {
      const updateData: Record<string, unknown> = { ...data };
      const { data: fault, error } = await supabase
        .from('faults')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return fault;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faults'] });
      toast({ title: 'Fault Updated', description: 'Changes saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteFault = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faults')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faults'] });
      toast({ title: 'Fault Deleted', description: 'Fault removed successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
