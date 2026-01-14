import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Worker = Tables<'workers'>;
export type WorkerInsert = TablesInsert<'workers'>;
export type WorkerUpdate = TablesUpdate<'workers'>;

export const useWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (worker: WorkerInsert) => {
      const { data, error } = await supabase
        .from('workers')
        .insert(worker)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });
};

export const useUpdateWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: WorkerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('workers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });
};

export const useDeleteWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });
};

export const useToggleWorkerPresence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isPresent }: { id: string; isPresent: boolean }) => {
      const { data, error } = await supabase
        .from('workers')
        .update({ is_present: isPresent })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });
};
