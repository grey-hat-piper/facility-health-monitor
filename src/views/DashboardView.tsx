import { Building, Users, AlertTriangle, CheckCircle2, TrendingUp, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { FacilityCard } from "@/components/dashboard/FacilityCard";
import { FaultItem } from "@/components/dashboard/FaultItem";
import { ReportItem } from "@/components/dashboard/ReportItem";
import { HealthIndicator } from "@/components/dashboard/HealthIndicator";
import { mockFacilities, mockFaults, mockReports, mockWorkers } from "@/data/mockData";

export const DashboardView = () => {
  const totalHealth = Math.round(
    mockFacilities.reduce((acc, f) => acc + f.healthPercentage, 0) / mockFacilities.length
  );
  const presentWorkers = mockWorkers.filter(w => w.isPresent).length;
  const openFaults = mockFaults.filter(f => f.status === 'open').length;
  const inProgressFaults = mockFaults.filter(f => f.status === 'in-progress').length;

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
                Across {mockFacilities.length} facilities
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
          value={mockFacilities.length}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {mockFacilities.map((facility, index) => (
            <div key={facility.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-slide-up">
              <FacilityCard facility={facility} />
            </div>
          ))}
        </div>
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
            {mockFaults.slice(0, 3).map(fault => (
              <FaultItem 
                key={fault.id} 
                fault={fault} 
                facilityName={mockFacilities.find(f => f.id === fault.facilityId)?.name}
              />
            ))}
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
              <ReportItem 
                key={report.id} 
                report={report} 
                facilityName={mockFacilities.find(f => f.id === report.facilityId)?.name}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
