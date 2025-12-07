import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsChart } from "@/components/dashboard/StatsChart";
import { mockDailyStats } from "@/data/mockData";
import { AlertTriangle, TrendingUp, ClipboardCheck, Activity } from "lucide-react";

export const StatsView = () => {
  const totalFaults = mockDailyStats.reduce((acc, s) => acc + s.totalFaults, 0);
  const totalResolved = mockDailyStats.reduce((acc, s) => acc + s.resolvedFaults, 0);
  const totalInspections = mockDailyStats.reduce((acc, s) => acc + s.inspections, 0);
  const avgHealth = Math.round(
    mockDailyStats.reduce((acc, s) => acc + s.averageHealth, 0) / mockDailyStats.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">30-Day Statistics</h2>
        <p className="text-muted-foreground">Performance metrics and trends over the past month</p>
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
            <StatsChart data={mockDailyStats} type="faults" />
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
            <StatsChart data={mockDailyStats} type="health" />
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
          <StatsChart data={mockDailyStats} type="inspections" />
        </CardContent>
      </Card>
    </div>
  );
};
