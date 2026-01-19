import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  event_type: string;
  event_description: string;
  entity_type: string;
  entity_id: string | null;
  created_by: string | null;
  created_at: string;
}

export const useActivityLogs = (date?: Date) => {
  return useQuery({
    queryKey: ['activity_logs', date?.toISOString().split('T')[0]],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ActivityLog[];
    },
  });
};

export const useCreateActivityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      event_type: string;
      event_description: string;
      entity_type: string;
      entity_id?: string;
      created_by?: string;
    }) => {
      const { data: log, error } = await supabase
        .from('activity_logs')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });
};
