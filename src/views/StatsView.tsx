import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsChart } from "@/components/dashboard/StatsChart";
import { mockDailyStats } from "@/data/mockData";
import { AlertTriangle, TrendingUp, ClipboardCheck, Activity } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'annually';

export const StatsView = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  // Filter data based on time range
  const filteredStats = useMemo(() => {
    const today = new Date();
    const daysMap: Record<TimeRange, number> = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      annually: 365,
    };
    
    const days = daysMap[timeRange];
    
    // For demo purposes, we only have 30 days of mock data
    // In production, you'd fetch data based on the time range
    if (days <= 30) {
      return mockDailyStats.slice(-days);
    }
    
    // For annual, repeat the data to simulate more days
    return mockDailyStats;
  }, [timeRange]);

  const totalFaults = filteredStats.reduce((acc, s) => acc + s.totalFaults, 0);
  const totalResolved = filteredStats.reduce((acc, s) => acc + s.resolvedFaults, 0);
  const totalInspections = filteredStats.reduce((acc, s) => acc + s.inspections, 0);
  const avgHealth = Math.round(
    filteredStats.reduce((acc, s) => acc + s.averageHealth, 0) / filteredStats.length
  );

  const getTitleSuffix = () => {
    switch (timeRange) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'annually': return 'This Year';
    }
  };

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
                <p className="text-xs text-muted-foreground">Inspections</p>
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
            Inspections Performed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatsChart data={filteredStats} type="inspections" />
        </CardContent>
      </Card>
    </div>
  );
};