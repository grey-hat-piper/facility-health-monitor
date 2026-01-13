import { Building, Users, AlertTriangle, CheckCircle2, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { HealthIndicator } from "@/components/dashboard/HealthIndicator";
import { useFacilities, FacilityWithComponents } from "@/hooks/useFacilities";
import { useFaults, DbFault } from "@/hooks/useFaults";
import { mockWorkers, mockReports } from "@/data/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Zap, Droplets, Shield, ClipboardCheck, Hammer, Clock } from "lucide-react";
import { format } from "date-fns";
import { FaultType } from "@/types/facilities";

const statusIcons = {
  good: <CheckCircle2 className="h-4 w-4" />,
  repairs: <Wrench className="h-4 w-4" />,
  faulty: <AlertTriangle className="h-4 w-4" />,
};

const faultIcons: Record<FaultType, React.ReactNode> = {
  electrical: <Zap className="h-4 w-4" />,
  plumbing: <Droplets className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  inspection: <ClipboardCheck className="h-4 w-4" />,
  carpentry: <Hammer className="h-4 w-4" />,
};

const faultColors: Record<FaultType, string> = {
  electrical: 'bg-amber-500',
  plumbing: 'bg-blue-500',
  security: 'bg-purple-500',
  inspection: 'bg-emerald-500',
  carpentry: 'bg-orange-500',
};

const statusVariants: Record<string, 'critical' | 'warning' | 'healthy'> = {
  'open': 'critical',
  'in-progress': 'warning',
  'resolved': 'healthy',
};

export const DashboardView = () => {
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const { data: faults, isLoading: faultsLoading } = useFaults();

  const isLoading = facilitiesLoading || faultsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const totalHealth = facilities && facilities.length > 0
    ? Math.round(facilities.reduce((acc, f) => acc + f.health_percentage, 0) / facilities.length)
    : 100;
  const presentWorkers = mockWorkers.filter(w => w.isPresent).length;
  const openFaults = faults?.filter(f => f.status === 'open').length || 0;
  const inProgressFaults = faults?.filter(f => f.status === 'in-progress').length || 0;

  const FacilityCardSmall = ({ facility }: { facility: FacilityWithComponents }) => (
    <Card className="hover:shadow-card-hover transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <HealthIndicator percentage={facility.health_percentage} size="sm" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{facility.name}</h4>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="h-3 w-3" />
              <span>{facility.location}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {facility.components.filter(c => c.status === 'good').length > 0 && (
            <Badge variant="healthy" className="gap-1 text-xs px-1.5 py-0">
              {statusIcons.good}
              {facility.components.filter(c => c.status === 'good').length}
            </Badge>
          )}
          {facility.components.filter(c => c.status === 'repairs').length > 0 && (
            <Badge variant="warning" className="gap-1 text-xs px-1.5 py-0">
              {statusIcons.repairs}
              {facility.components.filter(c => c.status === 'repairs').length}
            </Badge>
          )}
          {facility.components.filter(c => c.status === 'faulty').length > 0 && (
            <Badge variant="critical" className="gap-1 text-xs px-1.5 py-0">
              {statusIcons.faulty}
              {facility.components.filter(c => c.status === 'faulty').length}
            </Badge>
          )}
          {facility.components.length === 0 && (
            <Badge variant="neutral" className="text-xs">No components</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const FaultItemSmall = ({ fault }: { fault: DbFault }) => (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg text-primary-foreground ${faultColors[fault.type]}`}>
          {faultIcons[fault.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm capitalize">{fault.type}</span>
            <Badge variant={statusVariants[fault.status]} className="text-xs capitalize">
              {fault.status.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {fault.description}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(fault.reported_at), 'MMM d, h:mm a')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of all facilities and operations</p>
      </div>

      {/* Overall Health */}
      <Card className="gradient-primary text-primary-foreground overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm">Overall Facility Health</p>
              <p className="text-4xl font-bold mt-1">{totalHealth}%</p>
              <p className="text-sm text-primary-foreground/70 mt-2">
                Across {facilities?.length || 0} facilities
              </p>
            </div>
            <div className="bg-primary-foreground/20 rounded-full p-4">
              <HealthIndicator percentage={totalHealth} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Facilities"
          value={facilities?.length || 0}
          icon={Building}
          subtitle="Active locations"
        />
        <StatCard
          title="Workers Present"
          value={`${presentWorkers}/${mockWorkers.length}`}
          icon={Users}
          variant="healthy"
          subtitle="On duty today"
        />
        <StatCard
          title="Open Faults"
          value={openFaults}
          icon={AlertTriangle}
          variant="critical"
          subtitle="Needs attention"
        />
        <StatCard
          title="In Progress"
          value={inProgressFaults}
          icon={Wrench}
          variant="warning"
          subtitle="Being resolved"
        />
      </div>

      {/* Facilities Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Facilities Overview</h3>
        {!facilities || facilities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No facilities yet. Go to Facilities to add your first one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {facilities.map((facility, index) => (
              <div key={facility.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-slide-up">
                <FacilityCardSmall facility={facility} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-status-critical" />
              Recent Faults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!faults || faults.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No faults reported</p>
            ) : (
              faults.slice(0, 3).map(fault => (
                <FaultItemSmall key={fault.id} fault={fault} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-status-healthy" />
              Latest Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockReports.slice(0, 3).map(report => (
              <div key={report.id} className="p-3 rounded-lg border bg-card">
                <p className="text-sm">{report.note}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(report.timestamp, 'MMM d, h:mm a')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
