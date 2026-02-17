import { useMemo } from 'react';
import { useFaults } from './useFaults';
import { useReports } from './useReports';
import { useFacilities } from './useFacilities';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

export interface DailyStatRow {
  date: Date;
  totalFaults: number;
  resolvedFaults: number;
  inspections: number;
  averageHealth: number;
}

export const useStats = (days: number = 30) => {
  const { data: faults, isLoading: faultsLoading } = useFaults();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();

  const isLoading = faultsLoading || reportsLoading || facilitiesLoading;

  const stats = useMemo(() => {
    if (!faults || !reports || !facilities) return [];

    const today = startOfDay(new Date());
    const startDate = subDays(today, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    // Current average health across all facilities
    const avgHealth = facilities.length > 0
      ? Math.round(facilities.reduce((acc, f) => acc + f.health_percentage, 0) / facilities.length)
      : 100;

    return dateRange.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');

      const dayFaults = faults.filter(f => format(new Date(f.reported_at), 'yyyy-MM-dd') === dayStr);
      const dayResolved = faults.filter(f => 
        f.status === 'resolved' && format(new Date(f.updated_at), 'yyyy-MM-dd') === dayStr
      );
      const dayReports = reports.filter(r => format(new Date(r.created_at), 'yyyy-MM-dd') === dayStr);

      return {
        date: day,
        totalFaults: dayFaults.length,
        resolvedFaults: dayResolved.length,
        inspections: dayReports.length,
        averageHealth: avgHealth, // Use current health (no historical data)
      } as DailyStatRow;
    });
  }, [faults, reports, facilities, days]);

  return { data: stats, isLoading };
};
