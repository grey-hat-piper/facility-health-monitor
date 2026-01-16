import { Fault, FaultType } from "@/types/facilities";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Shield, Bath, Clock, Hammer, HelpCircle, Cuboid } from "lucide-react";
import { format } from "date-fns";

interface FaultItemProps {
  fault: Fault;
  facilityName?: string;
}

const faultIcons: Record<FaultType, React.ReactNode> = {
  electrical: <Zap className="h-4 w-4" />,
  plumbing: <Droplets className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  sanitary: <Bath className="h-4 w-4" />,
  carpentry: <Hammer className="h-4 w-4" />,
  masonry: <Cuboid className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />,
};

const faultColors: Record<FaultType, string> = {
  electrical: 'bg-amber-500',
  plumbing: 'bg-blue-500',
  security: 'bg-purple-500',
  sanitary: 'bg-emerald-500',
  carpentry: 'bg-orange-500',
  masonry: 'bg-stone-500',
  other: 'bg-gray-500',
};

const statusVariants: Record<string, 'critical' | 'warning' | 'healthy'> = {
  'open': 'critical',
  'in-progress': 'warning',
  'resolved': 'healthy',
};

export const FaultItem = ({ fault, facilityName }: FaultItemProps) => {
  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-sm transition-all">
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
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {fault.description}
          </p>
          {facilityName && (
            <p className="text-xs text-muted-foreground mt-1">
              📍 {facilityName}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(fault.reportedAt, 'MMM d, h:mm a')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
