import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Report = Tables<'reports'>;
export type ReportInsert = Omit<TablesInsert<'reports'>, 'id' | 'created_at' | 'updated_at'>;

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Report[];
    },
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (report: ReportInsert) => {
      const { data, error } = await supabase
        .from('reports')
        .insert(report)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Report Added',
        description: 'Your brief report has been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create report: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Report Deleted',
        description: 'The report has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete report: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};
