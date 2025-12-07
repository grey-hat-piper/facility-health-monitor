import { Facility } from "@/types/facilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HealthIndicator } from "./HealthIndicator";
import { MapPin, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";

interface FacilityCardProps {
  facility: Facility;
  onClick?: () => void;
}

export const FacilityCard = ({ facility, onClick }: FacilityCardProps) => {
  const goodCount = facility.components.filter(c => c.status === 'good').length;
  const repairsCount = facility.components.filter(c => c.status === 'repairs').length;
  const faultyCount = facility.components.filter(c => c.status === 'faulty').length;

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{facility.name}</CardTitle>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
              <MapPin className="h-3 w-3" />
              <span>{facility.location}</span>
            </div>
          </div>
          <HealthIndicator percentage={facility.healthPercentage} size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {goodCount > 0 && (
            <Badge variant="healthy" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {goodCount} Good
            </Badge>
          )}
          {repairsCount > 0 && (
            <Badge variant="warning" className="gap-1">
              <Wrench className="h-3 w-3" />
              {repairsCount} Repairs
            </Badge>
          )}
          {faultyCount > 0 && (
            <Badge variant="critical" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {faultyCount} Faulty
            </Badge>
          )}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          {facility.components.length} components total
        </div>
      </CardContent>
    </Card>
  );
};
