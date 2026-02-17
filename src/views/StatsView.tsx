import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsChart } from "@/components/dashboard/StatsChart";
import { useStats } from "@/hooks/useStats";
import { AlertTriangle, TrendingUp, ClipboardCheck, Activity } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'annually';

export const StatsView = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  const daysMap: Record<TimeRange, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    annually: 365,
  };

  const { data: allStats, isLoading } = useStats(daysMap[timeRange]);

  const filteredStats = useMemo(() => {
    return allStats.map(s => ({
      date: s.date,
      totalFaults: s.totalFaults,
      resolvedFaults: s.resolvedFaults,
      inspections: s.inspections,
      averageHealth: s.averageHealth,
    }));
  }, [allStats]);

  const totalFaults = filteredStats.reduce((acc, s) => acc + s.totalFaults, 0);
  const totalResolved = filteredStats.reduce((acc, s) => acc + s.resolvedFaults, 0);
  const totalInspections = filteredStats.reduce((acc, s) => acc + s.inspections, 0);
  const avgHealth = filteredStats.length > 0
    ? Math.round(filteredStats.reduce((acc, s) => acc + s.averageHealth, 0) / filteredStats.length)
    : 0;

  const getTitleSuffix = () => {
    switch (timeRange) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'annually': return 'This Year';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Statistics - {getTitleSuffix()}</h2>
          <p className="text-muted-foreground">Performance metrics and trends</p>
        </div>
        
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annually">Annually</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-critical/10">
                <AlertTriangle className="h-5 w-5 text-status-critical" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFaults}</p>
                <p className="text-xs text-muted-foreground">Total Faults</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-healthy/10">
                <TrendingUp className="h-5 w-5 text-status-healthy" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalResolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalInspections}</p>
                <p className="text-xs text-muted-foreground">Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-healthy/10">
                <Activity className="h-5 w-5 text-status-healthy" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgHealth}%</p>
                <p className="text-xs text-muted-foreground">Avg Health</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-critical" />
              Faults Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsChart data={filteredStats} type="faults" />
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-status-critical" />
                <span className="text-xs text-muted-foreground">Total Faults</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-status-healthy" />
                <span className="text-xs text-muted-foreground">Resolved</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-status-healthy" />
              Facility Health Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsChart data={filteredStats} type="health" />
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Reports Filed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatsChart data={filteredStats} type="inspections" />
        </CardContent>
      </Card>
    </div>
  );
};
