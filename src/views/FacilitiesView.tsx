import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthIndicator } from "@/components/dashboard/HealthIndicator";
import { mockFacilities } from "@/data/mockData";
import { Facility, FacilityComponent } from "@/types/facilities";
import { MapPin, ChevronRight, CheckCircle2, Wrench, AlertTriangle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusIcons = {
  good: <CheckCircle2 className="h-4 w-4" />,
  repairs: <Wrench className="h-4 w-4" />,
  faulty: <AlertTriangle className="h-4 w-4" />,
};

const statusVariants = {
  good: 'healthy' as const,
  repairs: 'warning' as const,
  faulty: 'critical' as const,
};

export const FacilitiesView = () => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Facilities</h2>
        <p className="text-muted-foreground">Manage and monitor all school facilities</p>
      </div>

      <div className="grid gap-4">
        {mockFacilities.map((facility, index) => (
          <Card 
            key={facility.id} 
            className="cursor-pointer hover:shadow-card-hover transition-all animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedFacility(facility)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <HealthIndicator percentage={facility.healthPercentage} size="md" />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{facility.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{facility.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {facility.components.filter(c => c.status === 'good').length > 0 && (
                      <Badge variant="healthy" className="gap-1">
                        {statusIcons.good}
                        {facility.components.filter(c => c.status === 'good').length} Good
                      </Badge>
                    )}
                    {facility.components.filter(c => c.status === 'repairs').length > 0 && (
                      <Badge variant="warning" className="gap-1">
                        {statusIcons.repairs}
                        {facility.components.filter(c => c.status === 'repairs').length} Repairs
                      </Badge>
                    )}
                    {facility.components.filter(c => c.status === 'faulty').length > 0 && (
                      <Badge variant="critical" className="gap-1">
                        {statusIcons.faulty}
                        {facility.components.filter(c => c.status === 'faulty').length} Faulty
                      </Badge>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedFacility} onOpenChange={() => setSelectedFacility(null)}>
        <DialogContent className="max-w-2xl">
          {selectedFacility && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <HealthIndicator percentage={selectedFacility.healthPercentage} size="sm" />
                  <div>
                    <span>{selectedFacility.name}</span>
                    <p className="text-sm font-normal text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {selectedFacility.location}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <h4 className="font-medium">Components</h4>
                <div className="grid gap-3">
                  {selectedFacility.components.map(component => (
                    <div 
                      key={component.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          component.status === 'good' ? 'bg-status-healthy/10 text-status-healthy' :
                          component.status === 'repairs' ? 'bg-status-warning/10 text-status-warning' :
                          'bg-status-critical/10 text-status-critical'
                        }`}>
                          {statusIcons[component.status]}
                        </div>
                        <div>
                          <p className="font-medium">{component.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            Last inspected: {format(component.lastInspection, 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <Badge variant={statusVariants[component.status]} className="capitalize">
                        {component.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
